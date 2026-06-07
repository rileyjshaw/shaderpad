import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
	FakeHTMLImageElement,
	createFakeVideo,
	getTextureWrites,
	installFakeBrowserGlobals,
} from './support/fake-browser';

const FRAGMENT_SHADER = `#version 300 es
precision mediump float;

in vec2 v_uv;
out vec4 outColor;

void main() {
	outColor = vec4(v_uv, 0.0, 1.0);
}`;

async function loadFaceShaderPad() {
	const [{ __mediapipeMockState }, { default: ShaderPad }, { default: face }] = await Promise.all([
		import('@mediapipe/tasks-vision'),
		import('../src/index'),
		import('../src/plugins/face'),
	]);
	return { ShaderPad, face, mediapipeState: __mediapipeMockState };
}

async function flush(ms = 0) {
	await vi.advanceTimersByTimeAsync(ms);
	await Promise.resolve();
	await Promise.resolve();
}

describe('face plugin lifecycle', () => {
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

	it('does not resume a mode switch into plugin-owned texture writes after destroy', async () => {
		const { ShaderPad, face, mediapipeState } = await loadFaceShaderPad();
		mediapipeState.reset();
		mediapipeState.setOptionsDelayMs = 500;

		const shader = new ShaderPad(FRAGMENT_SHADER, {
			canvas: new OffscreenCanvas(4, 4),
			plugins: [face({ textureName: 'u_webcam', options: { maxFaces: 1 } })],
		});
		await flush();

		const video = createFakeVideo(0);
		shader.initializeTexture('u_webcam', video as any);
		await flush();

		expect(mediapipeState.detectCalls).toEqual([{ mode: 'video', time: 0 }]);
		const faceWrites = getTextureWrites(shader as any, 'u_faceLandmarksTex');
		const baselineWriteCount = faceWrites.length;

		const image = new FakeHTMLImageElement();
		image.width = 8;
		image.height = 8;
		image.naturalWidth = 8;
		image.naturalHeight = 8;

		shader.updateTextures({ u_webcam: image as any });
		await flush();
		expect(mediapipeState.setOptionsCalls).toBe(1);

		shader.destroy();
		await flush(500);

		expect(mediapipeState.detectCalls).toEqual([{ mode: 'video', time: 0 }]);
		expect(faceWrites).toHaveLength(baselineWriteCount);
	});

	it('allows face:result handlers to destroy the shader during subscriber delivery', async () => {
		const { ShaderPad, face, mediapipeState } = await loadFaceShaderPad();
		mediapipeState.reset();

		const shader = new ShaderPad(FRAGMENT_SHADER, {
			canvas: new OffscreenCanvas(4, 4),
			plugins: [face({ textureName: 'u_webcam', options: { maxFaces: 1 } })],
		});
		await flush();

		const faceWrites = getTextureWrites(shader as any, 'u_faceLandmarksTex');
		let didDestroy = false;
		shader.on('face:result', () => {
			didDestroy = true;
			shader.destroy();
		});

		shader.initializeTexture('u_webcam', createFakeVideo(0) as any);
		await flush();

		expect(didDestroy).toBe(true);
		expect(mediapipeState.detectCalls).toEqual([{ mode: 'video', time: 0 }]);
		expect(faceWrites.length).toBeGreaterThan(0);
	});
});
