import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
	createFakeCanvas,
	dispatchFakeEvent,
	getUniformValue,
	installFakeBrowserGlobals,
	triggerResize,
} from './support/fake-browser';

const FRAGMENT_SHADER = `#version 300 es
precision mediump float;

in vec2 v_uv;
uniform vec2 u_cursor;
uniform vec3 u_click;
out vec4 outColor;

void main() {
	outColor = vec4(u_cursor, u_click.z, 1.0);
}`;

async function loadShaderPadAndAutosize() {
	const [{ default: ShaderPad }, { default: autosize }] = await Promise.all([
		import('../src/index'),
		import('../src/plugins/autosize'),
	]);
	return { ShaderPad, autosize };
}

async function flush(ms = 0) {
	await vi.advanceTimersByTimeAsync(ms);
	await Promise.resolve();
	await Promise.resolve();
}

describe('ShaderPad input handling and headless-friendly plugins', () => {
	let restoreGlobals: (() => void) | null = null;

	beforeEach(() => {
		restoreGlobals = installFakeBrowserGlobals({
			innerWidth: 800,
			innerHeight: 600,
			devicePixelRatio: 2,
		});
		vi.useFakeTimers();
		vi.resetModules();
	});

	afterEach(() => {
		restoreGlobals?.();
		restoreGlobals = null;
		vi.useRealTimers();
	});

	it('normalizes cursor and click coordinates against the cursor target', async () => {
		const { ShaderPad } = await loadShaderPadAndAutosize();
		const canvas = createFakeCanvas(200, 100);

		const shader = new ShaderPad(FRAGMENT_SHADER, {
			canvas,
		});

		dispatchFakeEvent(canvas, 'mousemove', {
			clientX: 50,
			clientY: 25,
		});
		expect(getUniformValue(shader as any, 'u_cursor')).toEqual([0.25, 0.75]);

		dispatchFakeEvent(canvas, 'mousedown', {
			button: 0,
			clientX: 50,
			clientY: 25,
		});
		expect(getUniformValue(shader as any, 'u_click')).toEqual([0.25, 0.75, 1]);

		dispatchFakeEvent(canvas, 'mouseup', { button: 0 });
		expect(getUniformValue(shader as any, 'u_click')).toEqual([0.25, 0.75, 0]);

		shader.destroy();
	});

	it('autosize resizes immediately and respects throttle windows on later changes', async () => {
		const { ShaderPad, autosize } = await loadShaderPadAndAutosize();
		const canvas = createFakeCanvas(10, 10);
		canvas.clientWidth = 40;
		canvas.clientHeight = 20;

		const shader = new ShaderPad(FRAGMENT_SHADER, {
			canvas,
			plugins: [autosize({ scale: 2, target: canvas, throttle: 100 })],
		});

		expect(canvas.width).toBe(80);
		expect(canvas.height).toBe(40);

		canvas.clientWidth = 60;
		canvas.clientHeight = 30;
		triggerResize(canvas);
		expect(canvas.width).toBe(120);
		expect(canvas.height).toBe(60);

		canvas.clientWidth = 70;
		canvas.clientHeight = 35;
		triggerResize(canvas);
		expect(canvas.width).toBe(120);
		expect(canvas.height).toBe(60);

		await flush(100);
		expect(canvas.width).toBe(140);
		expect(canvas.height).toBe(70);
		expect(getUniformValue(shader as any, 'u_resolution')).toEqual([140, 70]);

		shader.destroy();
	});
});
