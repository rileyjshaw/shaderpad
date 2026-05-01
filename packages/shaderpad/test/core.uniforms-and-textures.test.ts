import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
	getGl,
	getGlOperations,
	getTextureInfo,
	getUniformValue,
	installFakeBrowserGlobals,
} from './support/fake-browser';

const FRAGMENT_SHADER = `#version 300 es
precision mediump float;

in vec2 v_uv;
uniform vec2 u_points[3];
uniform sampler2D u_data;
out vec4 outColor;

void main() {
	outColor = vec4(u_points[1], texture(u_data, v_uv).r, 1.0);
}`;

async function loadShaderPad() {
	const { default: ShaderPad } = await import('../src/index');
	return ShaderPad;
}

describe('ShaderPad uniform and texture update behavior', () => {
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

	it('supports partial uniform-array updates starting at a chosen index', async () => {
		const ShaderPad = await loadShaderPad();
		const shader = new ShaderPad(FRAGMENT_SHADER, {
			canvas: new OffscreenCanvas(4, 4),
		});

		shader.initializeUniform(
			'u_points',
			'float',
			[
				[0, 1],
				[2, 3],
				[4, 5],
			],
			{ arrayLength: 3 },
		);

		shader.updateUniforms(
			{
				u_points: [[9, 8]],
			},
			{ startIndex: 1 },
		);

		expect(getUniformValue(shader as any, 'u_points')).toEqual([0, 1, 2, 3, 4, 5]);
		expect(getUniformValue(shader as any, 'u_points[1]')).toEqual([9, 8]);

		shader.destroy();
	});

	it('treats public texture history depth as current plus N previous frames', async () => {
		const ShaderPad = await loadShaderPad();
		const shader = new ShaderPad(FRAGMENT_SHADER, {
			canvas: new OffscreenCanvas(4, 4),
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

		const info = getTextureInfo(shader as any, 'u_data');
		expect(info.history.depth).toBe(3);
		expect(info.history.writeIndex).toBe(1);
		expect(getUniformValue(shader as any, 'u_dataFrameOffset')).toBe(0);

		shader.updateTextures({
			u_data: {
				data: new Uint8Array([5, 6, 7, 8]),
				width: 1,
				height: 1,
			},
		});

		expect(info.history.writeIndex).toBe(2);
		expect(getUniformValue(shader as any, 'u_dataFrameOffset')).toBe(1);

		shader.destroy();
	});

	it('uses partial texSubImage2D updates without resizing the texture', async () => {
		const ShaderPad = await loadShaderPad();
		const shader = new ShaderPad(FRAGMENT_SHADER, {
			canvas: new OffscreenCanvas(4, 4),
		});

		shader.initializeTexture(
			'u_data',
			{
				data: new Uint8Array([0, 0, 0, 0]),
				width: 2,
				height: 2,
			},
			{
				internalFormat: 'R8',
				format: 'RED',
				type: 'UNSIGNED_BYTE',
				minFilter: 'NEAREST',
				magFilter: 'NEAREST',
			},
		);

		shader.updateTextures({
			u_data: {
				data: new Uint8Array([255]),
				width: 1,
				height: 1,
				x: 1,
				y: 0,
				isPartial: true,
			},
		});

		const info = getTextureInfo(shader as any, 'u_data');
		expect(info.width).toBe(2);
		expect(info.height).toBe(2);
		expect(getGlOperations(shader, 'texSubImage2D').slice(-1)[0]).toMatchObject({
			xOffset: 1,
			yOffset: 0,
			width: 1,
			height: 1,
		});

		shader.destroy();
	});

	it('applies display-p3 to the drawing buffer when requested', async () => {
		const ShaderPad = await loadShaderPad();
		const shader = new ShaderPad(FRAGMENT_SHADER, {
			canvas: new OffscreenCanvas(4, 4),
			colorSpace: 'display-p3',
		});

		expect((getGl(shader) as any).drawingBufferColorSpace).toBe('display-p3');
		expect(getGlOperations(shader, 'setDrawingBufferColorSpace')).toEqual([
			expect.objectContaining({ colorSpace: 'display-p3' }),
		]);
		expect(getTextureInfo(shader as any, '__SHADERPAD_BUFFER')?.options.colorSpace).toBe('display-p3');

		shader.destroy();
	});

	it('uses texture colorSpace around DOM texture uploads and restores the prior value', async () => {
		const ShaderPad = await loadShaderPad();
		const shader = new ShaderPad(FRAGMENT_SHADER, {
			canvas: new OffscreenCanvas(4, 4),
		});

		shader.initializeTexture('u_data', new HTMLImageElement(), {
			colorSpace: 'display-p3',
		});

		expect(getGlOperations(shader, 'setUnpackColorSpace')).toEqual([
			expect.objectContaining({ colorSpace: 'display-p3' }),
			expect.objectContaining({ colorSpace: 'srgb' }),
		]);
		expect((getGl(shader) as any).unpackColorSpace).toBe('srgb');

		shader.destroy();
	});

	it('does not use unpackColorSpace for typed-array texture uploads', async () => {
		const ShaderPad = await loadShaderPad();
		const shader = new ShaderPad(FRAGMENT_SHADER, {
			canvas: new OffscreenCanvas(4, 4),
		});

		shader.initializeTexture(
			'u_data',
			{
				data: new Uint8Array([1, 2, 3, 4]),
				width: 1,
				height: 1,
			},
			{
				colorSpace: 'display-p3',
			},
		);

		expect(getGlOperations(shader, 'setUnpackColorSpace')).toHaveLength(0);

		shader.destroy();
	});

	it('ignores unsupported and invalid WebGL color-space assignments', async () => {
		restoreGlobals?.();
		restoreGlobals = installFakeBrowserGlobals({ colorSpaceSupport: false });
		vi.resetModules();
		const ShaderPad = await loadShaderPad();

		const shader = new ShaderPad(FRAGMENT_SHADER, {
			canvas: new OffscreenCanvas(4, 4),
			colorSpace: 'display-p3',
		});
		shader.initializeTexture('u_data', new HTMLImageElement(), {
			colorSpace: 'display-p3',
		});

		expect('drawingBufferColorSpace' in getGl(shader)).toBe(false);
		expect('unpackColorSpace' in getGl(shader)).toBe(false);
		expect(getGlOperations(shader, 'setDrawingBufferColorSpace')).toHaveLength(0);
		expect(getGlOperations(shader, 'setUnpackColorSpace')).toHaveLength(0);
		shader.destroy();

		restoreGlobals?.();
		restoreGlobals = installFakeBrowserGlobals();
		vi.resetModules();
		const ShaderPadWithSupport = await loadShaderPad();
		const invalidShader = new ShaderPadWithSupport(FRAGMENT_SHADER, {
			canvas: new OffscreenCanvas(4, 4),
			colorSpace: 'not-a-color-space' as any,
		});

		expect((getGl(invalidShader) as any).drawingBufferColorSpace).toBe('srgb');
		expect(getGlOperations(invalidShader, 'setDrawingBufferColorSpace')).toHaveLength(0);

		invalidShader.destroy();
	});
});
