import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
	clearGlOperations,
	getGlOperations,
	getTextureWrites,
	getUniformValue,
	installFakeBrowserGlobals,
} from './support/fake-browser';

const FRAGMENT_SHADER = `#version 300 es
precision mediump float;

in vec2 v_uv;
uniform float u_time;
uniform int u_frame;
out vec4 outColor;

void main() {
	outColor = vec4(v_uv, fract(u_time), 1.0);
}`;

async function loadShaderPad() {
	const { default: ShaderPad } = await import('../src/index');
	return ShaderPad;
}

async function flush(ms = 0) {
	await vi.advanceTimersByTimeAsync(ms);
	await Promise.resolve();
	await Promise.resolve();
}

describe('ShaderPad lifecycle and history semantics', () => {
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

	it('draw does not advance time, frame, or output history, and step emits hooks in order', async () => {
		const ShaderPad = await loadShaderPad();
		const shader = new ShaderPad(FRAGMENT_SHADER, {
			canvas: new OffscreenCanvas(4, 4),
			history: 3,
		});

		const events: string[] = [];
		shader.on('preDraw', () => events.push('preDraw'));
		shader.on('postDraw', () => events.push('postDraw'));
		shader.on('preStep', () => events.push('preStep'));
		shader.on('postStep', () => events.push('postStep'));

		const baselineHistoryWrites = getTextureWrites(shader as any, 'u_history').length;

		clearGlOperations(shader);
		shader.draw();

		expect(events).toEqual(['preDraw', 'postDraw']);
		expect(getUniformValue(shader as any, 'u_time')).toBe(0);
		expect(getUniformValue(shader as any, 'u_frame')).toBe(0);
		expect(getUniformValue(shader as any, 'u_historyFrameOffset')).toBe(0);
		expect(getTextureWrites(shader as any, 'u_history')).toHaveLength(baselineHistoryWrites);
		expect(getGlOperations(shader, 'copyTexSubImage3D')).toHaveLength(0);

		events.length = 0;
		clearGlOperations(shader);
		shader.step();

		expect(events).toEqual(['preStep', 'preDraw', 'postDraw', 'postStep']);
		expect(getUniformValue(shader as any, 'u_time')).toBe(0);
		expect(getUniformValue(shader as any, 'u_frame')).toBe(0);
		expect(getUniformValue(shader as any, 'u_historyFrameOffset')).toBe(1);
		expect(getGlOperations(shader, 'copyTexSubImage3D')).toHaveLength(1);
		expect(getTextureWrites(shader as any, 'u_history').slice(-1)[0]).toMatchObject({
			kind: 'copy3d',
			slot: 0,
		});

		shader.destroy();
	});

	it('step advances frame and time while skipHistory suppresses output-history writes', async () => {
		const ShaderPad = await loadShaderPad();
		const shader = new ShaderPad(FRAGMENT_SHADER, {
			canvas: new OffscreenCanvas(4, 4),
			history: 3,
		});

		shader.step();
		await flush(1000);
		clearGlOperations(shader);
		shader.step({ skipHistory: true });

		expect(getUniformValue(shader as any, 'u_time')).toBeCloseTo(1, 5);
		expect(getUniformValue(shader as any, 'u_frame')).toBe(1);
		expect((shader as any).frame).toBe(2);
		expect(getUniformValue(shader as any, 'u_historyFrameOffset')).toBe(1);
		expect(getGlOperations(shader, 'copyTexSubImage3D')).toHaveLength(0);

		shader.destroy();
	});

	it('public u_time and u_frame updates persist as the next step baseline', async () => {
		const ShaderPad = await loadShaderPad();
		const shader = new ShaderPad(FRAGMENT_SHADER, {
			canvas: new OffscreenCanvas(4, 4),
		});

		const samples: Array<{ time: number; frame: number }> = [];
		shader.on('preStep', (time: number, frame: number) => {
			samples.push({ time, frame });
		});

		shader.step();
		await flush(1000);

		shader.updateUniforms({
			u_time: 12.5,
			u_frame: 42,
		});

		expect(getUniformValue(shader as any, 'u_time')).toBe(12.5);
		expect(getUniformValue(shader as any, 'u_frame')).toBe(42);

		shader.step();
		expect(samples.at(-1)).toEqual({
			time: expect.closeTo(12.5, 5),
			frame: 42,
		});
		expect(getUniformValue(shader as any, 'u_time')).toBeCloseTo(12.5, 5);
		expect(getUniformValue(shader as any, 'u_frame')).toBe(42);
		expect((shader as any).frame).toBe(43);

		await flush(1000);
		shader.step();
		expect(samples.at(-1)).toEqual({
			time: expect.closeTo(13.5, 5),
			frame: 43,
		});
		expect(getUniformValue(shader as any, 'u_time')).toBeCloseTo(13.5, 5);
		expect(getUniformValue(shader as any, 'u_frame')).toBe(43);

		shader.destroy();
	});

	it('play advances on RAF boundaries and pause stops further steps', async () => {
		const ShaderPad = await loadShaderPad();
		const shader = new ShaderPad(FRAGMENT_SHADER, {
			canvas: new OffscreenCanvas(4, 4),
			history: 3,
		});

		const samples: Array<{ time: number; frame: number }> = [];
		shader.play((time, frame) => {
			samples.push({ time, frame });
			if (frame === 0) return { skipHistory: true };
		});

		await flush(16);
		await flush(16);

		expect(samples.map(sample => sample.frame)).toEqual([0, 1]);
		expect(samples[0].time).toBe(0);
		expect(samples[1].time).toBeCloseTo(0.016, 3);
		expect(getUniformValue(shader as any, 'u_historyFrameOffset')).toBe(1);

		shader.pause();
		const pausedFrameCount = samples.length;
		await flush(64);

		expect(samples).toHaveLength(pausedFrameCount);

		shader.destroy();
	});

	it('pause immediately after play cancels the queued animation frame and emits pause only once', async () => {
		const ShaderPad = await loadShaderPad();
		const shader = new ShaderPad(FRAGMENT_SHADER, {
			canvas: new OffscreenCanvas(4, 4),
			history: 3,
		});

		const samples: Array<{ time: number; frame: number }> = [];
		const pauseEvents: number[] = [];
		shader.on('pause', () => pauseEvents.push(performance.now()));

		shader.play((time, frame) => {
			samples.push({ time, frame });
		});
		shader.pause();
		shader.pause();
		await flush(5000);

		expect(samples).toEqual([]);
		expect(pauseEvents).toHaveLength(1);
		expect(getUniformValue(shader as any, 'u_time')).toBe(0);
		expect(getUniformValue(shader as any, 'u_frame')).toBe(0);
		expect((shader as any).frame).toBe(0);

		shader.destroy();
	});

	it('play resumes from paused elapsed time without counting time spent paused', async () => {
		const ShaderPad = await loadShaderPad();
		const shader = new ShaderPad(FRAGMENT_SHADER, {
			canvas: new OffscreenCanvas(4, 4),
			history: 3,
		});

		const samples: Array<{ time: number; frame: number; phase: 'initial' | 'resumed' }> = [];
		const pauseEvents: number[] = [];
		shader.on('pause', () => pauseEvents.push(performance.now()));

		shader.play((time, frame) => {
			samples.push({ time, frame, phase: 'initial' });
		});
		await flush(5000);
		shader.pause();
		shader.pause();

		const elapsedAtPause = (shader as any).tElapsed;
		const frameAtPause = (shader as any).frame;
		const samplesAtPause = samples.length;

		expect(samplesAtPause).toBeGreaterThan(0);
		expect(elapsedAtPause).toBeGreaterThan(4.9);
		expect(elapsedAtPause).toBeLessThan(5.1);
		expect(pauseEvents).toHaveLength(1);

		await flush(5000);
		expect(samples).toHaveLength(samplesAtPause);

		shader.play((time, frame) => {
			samples.push({ time, frame, phase: 'resumed' });
		});
		await flush(16);

		const resumedSample = samples.at(-1)!;
		expect(resumedSample.phase).toBe('resumed');
		expect(resumedSample.time).toBeCloseTo(elapsedAtPause, 5);
		expect(resumedSample.frame).toBe(frameAtPause);
		expect(resumedSample.time).toBeLessThan(5.1);

		shader.pause();
		shader.pause();
		expect(pauseEvents).toHaveLength(2);

		shader.destroy();
	});

	it('manual requestAnimationFrame step loops preserve paused elapsed time and emit pause only once', async () => {
		const ShaderPad = await loadShaderPad();
		const shader = new ShaderPad(FRAGMENT_SHADER, {
			canvas: new OffscreenCanvas(4, 4),
			history: 3,
		});

		const samples: Array<{ time: number; frame: number }> = [];
		const pauseEvents: number[] = [];
		let elapsedAtPause = NaN;
		let frameAtPause = -1;

		shader.on('preStep', (time: number, frame: number) => {
			samples.push({ time, frame });
		});
		shader.on('pause', () => pauseEvents.push(performance.now()));

		const loop = () => {
			shader.step();
			if (samples.length === 3) {
				shader.pause();
				shader.pause();
				elapsedAtPause = (shader as any).tElapsed;
				frameAtPause = (shader as any).frame;
				return;
			}
			requestAnimationFrame(loop);
		};

		requestAnimationFrame(loop);
		await flush(48);

		expect(samples.map(sample => sample.frame)).toEqual([0, 1, 2]);
		expect(samples.map(sample => sample.time)).toEqual([0, 0.016, 0.032]);
		expect(pauseEvents).toHaveLength(1);
		expect(elapsedAtPause).toBeCloseTo(0.032, 5);
		expect(frameAtPause).toBe(3);

		await flush(5000);
		expect(samples).toHaveLength(3);

		shader.step();
		expect(samples.at(-1)).toEqual({
			time: expect.closeTo(elapsedAtPause, 5),
			frame: frameAtPause,
		});
		expect(getUniformValue(shader as any, 'u_time')).toBeCloseTo(elapsedAtPause, 5);
		expect(getUniformValue(shader as any, 'u_frame')).toBe(frameAtPause);

		shader.destroy();
	});

	it('destroy cancels a pending play loop without emitting pause', async () => {
		const ShaderPad = await loadShaderPad();
		const shader = new ShaderPad(FRAGMENT_SHADER, {
			canvas: new OffscreenCanvas(4, 4),
			history: 3,
		});

		const samples: Array<{ time: number; frame: number }> = [];
		const events: string[] = [];
		shader.on('pause', () => events.push('pause'));
		shader.on('destroy', () => events.push('destroy'));

		shader.play((time, frame) => {
			samples.push({ time, frame });
		});
		shader.destroy();
		shader.pause();
		await flush(5000);

		expect(samples).toEqual([]);
		expect(events).toEqual(['destroy']);
	});

	it('rewind restarts the clock, and reset clears history state back to zero', async () => {
		const ShaderPad = await loadShaderPad();
		const shader = new ShaderPad(FRAGMENT_SHADER, {
			canvas: new OffscreenCanvas(4, 4),
			history: 3,
		});

		shader.step();
		await flush(1000);
		shader.step();
		expect(getUniformValue(shader as any, 'u_historyFrameOffset')).toBe(2);

		shader.rewind();
		shader.step();
		expect(getUniformValue(shader as any, 'u_time')).toBe(0);
		expect(getUniformValue(shader as any, 'u_frame')).toBe(0);

		const baselineWrites = getTextureWrites(shader as any, 'u_history').length;
		shader.reset();

		expect((shader as any).frame).toBe(0);
		expect(getUniformValue(shader as any, 'u_historyFrameOffset')).toBe(0);
		expect(getTextureWrites(shader as any, 'u_history').slice(baselineWrites)).toEqual([
			expect.objectContaining({ kind: 'sub3d', slot: 0 }),
			expect.objectContaining({ kind: 'sub3d', slot: 1 }),
			expect.objectContaining({ kind: 'sub3d', slot: 2 }),
		]);

		shader.destroy();
	});

	it('clearHistory resets output and texture history without rewinding or clearing output', async () => {
		const ShaderPad = await loadShaderPad();
		const shader = new ShaderPad(FRAGMENT_SHADER, {
			canvas: new OffscreenCanvas(4, 4),
			history: 3,
		});

		shader.initializeTexture(
			'u_data',
			{
				data: new Uint8Array([1, 2, 3, 4]),
				width: 1,
				height: 1,
			},
			{
				history: 2,
				internalFormat: 'RGBA8',
				type: 'UNSIGNED_BYTE',
				minFilter: 'NEAREST',
				magFilter: 'NEAREST',
			},
		);

		shader.step();
		await flush(1000);
		shader.step();
		shader.updateTextures({
			u_data: {
				data: new Uint8Array([5, 6, 7, 8]),
				width: 1,
				height: 1,
			},
		});

		expect(getUniformValue(shader as any, 'u_historyFrameOffset')).toBe(2);
		expect(getUniformValue(shader as any, 'u_dataFrameOffset')).toBe(1);
		expect((shader as any).frame).toBe(2);

		const elapsedBeforeClear = (shader as any).tElapsed;
		const outputHistoryBaseline = getTextureWrites(shader as any, 'u_history').length;
		const textureHistoryBaseline = getTextureWrites(shader as any, 'u_data').length;
		clearGlOperations(shader);

		shader.clearHistory();

		expect((shader as any).frame).toBe(2);
		expect((shader as any).tElapsed).toBe(elapsedBeforeClear);
		expect(getUniformValue(shader as any, 'u_time')).toBeCloseTo(1, 5);
		expect(getUniformValue(shader as any, 'u_frame')).toBe(1);
		expect(getUniformValue(shader as any, 'u_historyFrameOffset')).toBe(0);
		expect(getUniformValue(shader as any, 'u_dataFrameOffset')).toBe(0);
		expect(getGlOperations(shader, 'clear')).toHaveLength(0);

		expect(getTextureWrites(shader as any, 'u_history').slice(outputHistoryBaseline)).toEqual([
			expect.objectContaining({ kind: 'sub3d', slot: 0 }),
			expect.objectContaining({ kind: 'sub3d', slot: 1 }),
			expect.objectContaining({ kind: 'sub3d', slot: 2 }),
		]);
		expect(getTextureWrites(shader as any, 'u_data').slice(textureHistoryBaseline)).toEqual([
			expect.objectContaining({ kind: 'sub3d', slot: 0 }),
			expect.objectContaining({ kind: 'sub3d', slot: 1 }),
			expect.objectContaining({ kind: 'sub3d', slot: 2 }),
		]);

		shader.destroy();
	});
});
