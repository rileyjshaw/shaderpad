import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createFakeVideo, getTextureWrites, getUniformValue, installFakeBrowserGlobals } from './support/fake-browser';

const FRAGMENT_SHADER = `#version 300 es
precision mediump float;

in vec2 v_uv;
out vec4 outColor;

void main() {
	outColor = vec4(v_uv, 0.0, 1.0);
}`;

async function loadHandsShaderPad() {
	const [{ __mediapipeMockState }, { default: ShaderPad }, { default: hands }] = await Promise.all([
		import('@mediapipe/tasks-vision'),
		import('../src/index'),
		import('../src/plugins/hands'),
	]);
	return { ShaderPad, hands, mediapipeState: __mediapipeMockState };
}

async function flush(ms: number = 0) {
	await vi.advanceTimersByTimeAsync(ms);
	await Promise.resolve();
	await Promise.resolve();
}

describe('hands plugin shared detector history', () => {
	let restoreGlobals: (() => void) | null = null;

	beforeEach(() => {
		restoreGlobals = installFakeBrowserGlobals();
		vi.useFakeTimers();
		vi.resetModules();
	});

	afterEach(() => {
		restoreGlobals?.();
		restoreGlobals = null;
		vi.useRealTimers();
	});

	it('reuses one shared MediaPipe detector for two shaderpads with matching config', async () => {
		const { ShaderPad, hands, mediapipeState } = await loadHandsShaderPad();
		mediapipeState.reset();
		mediapipeState.createDelayMs = 500;
		const video = createFakeVideo(1);

		const shaderA = new ShaderPad(FRAGMENT_SHADER, {
			canvas: new OffscreenCanvas(4, 4),
			plugins: [hands({ textureName: 'u_webcam', options: { maxHands: 1, history: 3 } })],
		});
		const shaderB = new ShaderPad(FRAGMENT_SHADER, {
			canvas: new OffscreenCanvas(4, 4),
			plugins: [hands({ textureName: 'u_webcam', options: { maxHands: 1 } })],
		});

		shaderA.initializeTexture('u_webcam', video as any);
		shaderB.initializeTexture('u_webcam', video as any);

		await flush(500);

		expect(mediapipeState.createCalls).toBe(1);
		expect(mediapipeState.detectCalls).toEqual([]);

		shaderA.destroy();
		shaderB.destroy();
	});

	it('delivers live landmark data to both shaderpads after shared async init resolves', async () => {
		const { ShaderPad, hands, mediapipeState } = await loadHandsShaderPad();
		mediapipeState.reset();
		mediapipeState.createDelayMs = 500;
		const video = createFakeVideo(0);

		const shaderA = new ShaderPad(FRAGMENT_SHADER, {
			canvas: new OffscreenCanvas(4, 4),
			plugins: [hands({ textureName: 'u_webcam', options: { maxHands: 1, history: 3 } })],
		});
		const shaderB = new ShaderPad(FRAGMENT_SHADER, {
			canvas: new OffscreenCanvas(4, 4),
			plugins: [hands({ textureName: 'u_webcam', options: { maxHands: 1 } })],
		});

		shaderA.initializeTexture('u_webcam', video as any);
		shaderB.initializeTexture('u_webcam', video as any);
		await flush(500);

		video.currentTime = 1;
		const updates = { u_webcam: video as any };
		shaderA.updateTextures(updates);
		shaderB.updateTextures(updates);
		await flush();

		expect(mediapipeState.detectCalls).toEqual([{ mode: 'video', time: 1 }]);
		expect(getUniformValue(shaderA as any, 'u_nHands')).toBe(1);
		expect(getUniformValue(shaderB as any, 'u_nHands')).toBe(1);

		const shaderBWrites = getTextureWrites(shaderB as any, 'u_handLandmarksTex');
		const lastWrite = shaderBWrites.at(-1);
		expect(lastWrite?.sourceData).toBeInstanceOf(Float32Array);
		expect((lastWrite?.sourceData as Float32Array)[0]).toBe(1);
		expect((lastWrite?.sourceData as Float32Array)[36]).toBeCloseTo(0.55, 5);

		shaderA.destroy();
		shaderB.destroy();
	});

	it('drops pre-init requests until the shared detector finishes initializing', async () => {
		const { ShaderPad, hands, mediapipeState } = await loadHandsShaderPad();
		mediapipeState.reset();
		mediapipeState.createDelayMs = 500;
		const video = createFakeVideo(0);

		const shader = new ShaderPad(FRAGMENT_SHADER, {
			canvas: new OffscreenCanvas(4, 4),
			plugins: [hands({ textureName: 'u_webcam', options: { maxHands: 1, history: 3 } })],
		});

		shader.initializeTexture('u_webcam', video as any);
		expect(getUniformValue(shader as any, 'u_handLandmarksTexFrameOffset')).toBe(0);
		const baselineWrites = getTextureWrites(shader as any, 'u_handLandmarksTex').length;

		shader.updateTextures({ u_webcam: video as any });
		expect(getUniformValue(shader as any, 'u_handLandmarksTexFrameOffset')).toBe(0);

		shader.updateTextures({ u_webcam: video as any });
		expect(getUniformValue(shader as any, 'u_handLandmarksTexFrameOffset')).toBe(0);
		expect(getTextureWrites(shader as any, 'u_handLandmarksTex')).toHaveLength(baselineWrites);

		await flush(500);

		expect(mediapipeState.createCalls).toBe(1);
		expect(mediapipeState.detectCalls).toEqual([]);
		expect(getUniformValue(shader as any, 'u_handLandmarksTexFrameOffset')).toBe(0);
		expect(getTextureWrites(shader as any, 'u_handLandmarksTex')).toHaveLength(baselineWrites);

		video.currentTime = 1;
		shader.updateTextures({ u_webcam: video as any });
		await flush();

		expect(mediapipeState.detectCalls).toEqual([{ mode: 'video', time: 1 }]);
		expect(getUniformValue(shader as any, 'u_handLandmarksTexFrameOffset')).toBe(0);
		const writes = getTextureWrites(shader as any, 'u_handLandmarksTex');
		expect(writes).toHaveLength(baselineWrites + 2);
		expect(writes.slice(-2).map(write => write.slot)).toEqual([0, 0]);

		shader.destroy();
	});

	it('does not let another shaderpad advance a history-enabled instance', async () => {
		const { ShaderPad, hands, mediapipeState } = await loadHandsShaderPad();
		mediapipeState.reset();
		const video = createFakeVideo(0);

		const shaderA = new ShaderPad(FRAGMENT_SHADER, {
			canvas: new OffscreenCanvas(4, 4),
			plugins: [hands({ textureName: 'u_webcam', options: { maxHands: 1, history: 3 } })],
		});
		const shaderB = new ShaderPad(FRAGMENT_SHADER, {
			canvas: new OffscreenCanvas(4, 4),
			plugins: [hands({ textureName: 'u_webcam', options: { maxHands: 1 } })],
		});

		shaderA.initializeTexture('u_webcam', video as any);
		shaderB.initializeTexture('u_webcam', video as any);
		await flush();

		expect(getUniformValue(shaderA as any, 'u_handLandmarksTexFrameOffset')).toBe(0);

		video.currentTime = 1;
		shaderB.updateTextures({ u_webcam: video as any });
		await flush();

		expect(getUniformValue(shaderA as any, 'u_handLandmarksTexFrameOffset')).toBe(0);

		video.currentTime = 2;
		shaderA.updateTextures({ u_webcam: video as any });
		await flush();

		expect(getUniformValue(shaderA as any, 'u_handLandmarksTexFrameOffset')).toBe(0);

		shaderA.destroy();
		shaderB.destroy();
	});

	it('advances plugin history on every explicit request even when the video frame is unchanged', async () => {
		const { ShaderPad, hands, mediapipeState } = await loadHandsShaderPad();
		mediapipeState.reset();
		const video = createFakeVideo(0);

		const shader = new ShaderPad(FRAGMENT_SHADER, {
			canvas: new OffscreenCanvas(4, 4),
			plugins: [hands({ textureName: 'u_webcam', options: { maxHands: 1, history: 3 } })],
		});

		shader.initializeTexture('u_webcam', video as any);
		await flush();

		expect(getUniformValue(shader as any, 'u_handLandmarksTexFrameOffset')).toBe(0);
		expect(mediapipeState.detectCalls).toEqual([]);

		shader.updateTextures({ u_webcam: video as any });
		await flush();

		expect(getUniformValue(shader as any, 'u_handLandmarksTexFrameOffset')).toBe(0);
		expect(mediapipeState.detectCalls).toEqual([{ mode: 'video', time: 0 }]);

		shader.updateTextures({ u_webcam: video as any });
		await flush();

		expect(getUniformValue(shader as any, 'u_handLandmarksTexFrameOffset')).toBe(1);
		expect(mediapipeState.detectCalls).toEqual([{ mode: 'video', time: 0 }]);

		video.currentTime = 1;
		shader.updateTextures({ u_webcam: video as any });
		await flush();

		expect(getUniformValue(shader as any, 'u_handLandmarksTexFrameOffset')).toBe(2);
		expect(mediapipeState.detectCalls).toEqual([
			{ mode: 'video', time: 0 },
			{ mode: 'video', time: 1 },
		]);

		shader.destroy();
	});

	it('does not write a shared frame into one history ring multiple times when sibling shaders also update', async () => {
		const { ShaderPad, hands, mediapipeState } = await loadHandsShaderPad();
		mediapipeState.reset();
		const video = createFakeVideo(0);

		const shaderA = new ShaderPad(FRAGMENT_SHADER, {
			canvas: new OffscreenCanvas(4, 4),
			plugins: [hands({ textureName: 'u_webcam', options: { maxHands: 1, history: 3 } })],
		});
		const shaderB = new ShaderPad(FRAGMENT_SHADER, {
			canvas: new OffscreenCanvas(4, 4),
			plugins: [hands({ textureName: 'u_webcam', options: { maxHands: 1 } })],
		});
		const shaderC = new ShaderPad(FRAGMENT_SHADER, {
			canvas: new OffscreenCanvas(4, 4),
			plugins: [hands({ textureName: 'u_webcam', options: { maxHands: 1 } })],
		});

		shaderA.initializeTexture('u_webcam', video as any);
		shaderB.initializeTexture('u_webcam', video as any);
		shaderC.initializeTexture('u_webcam', video as any);
		await flush();

		const baselineWrites = getTextureWrites(shaderA as any, 'u_handLandmarksTex').length;

		video.currentTime = 1;
		const updates = { u_webcam: video as any };
		shaderA.updateTextures(updates);
		shaderB.updateTextures(updates);
		shaderC.updateTextures(updates);
		await flush();

		const frameWrites = getTextureWrites(shaderA as any, 'u_handLandmarksTex').slice(baselineWrites);
		expect(frameWrites).toHaveLength(2);
		expect(frameWrites.map(write => write.kind)).toEqual(['sub3d', 'sub3d']);
		expect(frameWrites.map(write => write.slot)).toEqual([0, 0]);
		expect(getUniformValue(shaderA as any, 'u_handLandmarksTexFrameOffset')).toBe(0);
		expect(mediapipeState.detectCalls).toEqual([{ mode: 'video', time: 1 }]);

		shaderA.destroy();
		shaderB.destroy();
		shaderC.destroy();
	});
});
