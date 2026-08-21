import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
	clearGlOperations,
	getGl,
	getGlOperations,
	getTextureInfo,
	installFakeBrowserGlobals,
} from './support/fake-browser';

const SOURCE_FRAGMENT_SHADER = `#version 300 es
precision mediump float;

in vec2 v_uv;
out vec4 outColor;

void main() {
	outColor = vec4(v_uv, 0.25, 1.0);
}`;

const DEST_FRAGMENT_SHADER = `#version 300 es
precision mediump float;

in vec2 v_uv;
uniform sampler2D u_input;
out vec4 outColor;

void main() {
	outColor = texture(u_input, v_uv);
}`;

async function loadShaderPad() {
	const { default: ShaderPad } = await import('../src/index');
	return ShaderPad;
}

describe('ShaderPad pipeline transfer paths', () => {
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

	it('same-context chaining without history binds the source GPU texture directly', async () => {
		const ShaderPad = await loadShaderPad();
		const sharedCanvas = new OffscreenCanvas(4, 4);

		const source = new ShaderPad(SOURCE_FRAGMENT_SHADER, { canvas: sharedCanvas });
		const dest = new ShaderPad(DEST_FRAGMENT_SHADER, { canvas: sharedCanvas });

		dest.initializeTexture('u_input', source);

		clearGlOperations(source, dest);
		dest.updateTextures({ u_input: source });

		const sourceIntermediate = getTextureInfo(source as any, '__SHADERPAD_BUFFER');
		expect(sourceIntermediate?.texture?.id).toBeDefined();
		expect(getGlOperations(source, 'readPixels')).toHaveLength(0);
		expect(getGlOperations(dest, 'readPixels')).toHaveLength(0);
		expect(getGlOperations(dest, 'texSubImage2D')).toHaveLength(0);
		expect(getGlOperations(dest, 'texSubImage3D')).toHaveLength(0);
		expect(getGlOperations(dest, 'copyTexSubImage3D')).toHaveLength(0);
		expect(getGlOperations(dest, 'bindTexture')).toContainEqual(
			expect.objectContaining({
				kind: 'bindTexture',
				target: (dest as any).gl.TEXTURE_2D,
				textureId: sourceIntermediate.texture.id,
			}),
		);

		source.destroy();
		dest.destroy();
	});

	it('inherits colorSpace when initializing a texture from another ShaderPad', async () => {
		const ShaderPad = await loadShaderPad();
		const sharedCanvas = new OffscreenCanvas(4, 4);

		const source = new ShaderPad(SOURCE_FRAGMENT_SHADER, {
			canvas: sharedCanvas,
			colorSpace: 'display-p3',
		});
		const dest = new ShaderPad(DEST_FRAGMENT_SHADER, { canvas: sharedCanvas });

		dest.initializeTexture('u_input', source);

		expect(getTextureInfo(source as any, '__SHADERPAD_BUFFER')?.options.colorSpace).toBe('display-p3');
		expect(getTextureInfo(dest as any, 'u_input')?.options.colorSpace).toBe('display-p3');

		source.destroy();
		dest.destroy();
	});

	it('keeps shared-canvas construction free of drawing-buffer colorSpace mutations', async () => {
		const ShaderPad = await loadShaderPad();
		const sharedCanvas = new OffscreenCanvas(4, 4);

		const source = new ShaderPad(SOURCE_FRAGMENT_SHADER, {
			canvas: sharedCanvas,
			colorSpace: 'display-p3',
		});

		clearGlOperations(source);
		const dest = new ShaderPad(DEST_FRAGMENT_SHADER, { canvas: sharedCanvas });

		expect((getGl(dest) as any).drawingBufferColorSpace).toBe('srgb');
		expect(getGlOperations(dest, 'setDrawingBufferColorSpace')).toHaveLength(0);
		expect(getTextureInfo(source as any, '__SHADERPAD_BUFFER')?.options.colorSpace).toBe('display-p3');
		expect(getTextureInfo(dest as any, '__SHADERPAD_BUFFER')?.options.colorSpace).toBeUndefined();

		source.destroy();
		dest.destroy();
	});

	it('switches drawingBufferColorSpace per draw on a shared canvas', async () => {
		const ShaderPad = await loadShaderPad();
		const sharedCanvas = new OffscreenCanvas(4, 4);

		const source = new ShaderPad(SOURCE_FRAGMENT_SHADER, {
			canvas: sharedCanvas,
			colorSpace: 'display-p3',
		});
		const dest = new ShaderPad(DEST_FRAGMENT_SHADER, { canvas: sharedCanvas });

		clearGlOperations(source, dest);
		source.draw();
		dest.draw();

		expect((getGl(dest) as any).drawingBufferColorSpace).toBe('srgb');
		expect(getGlOperations(dest, 'setDrawingBufferColorSpace')).toEqual([
			expect.objectContaining({ colorSpace: 'display-p3' }),
			expect.objectContaining({ colorSpace: 'srgb' }),
		]);

		source.destroy();
		dest.destroy();
	});

	it('same-context chaining resizes deep history and performs one GPU copy', async () => {
		const ShaderPad = await loadShaderPad();
		const { default: deepHistory } = await import('../src/plugins/deep-history');
		const sharedCanvas = new OffscreenCanvas(4, 4);

		const source = new ShaderPad(SOURCE_FRAGMENT_SHADER, { canvas: sharedCanvas });
		const [historyPlugin, updateInput] = deepHistory('inputHistory', source, { history: 2, chunks: 2 });
		const dest = new ShaderPad(DEST_FRAGMENT_SHADER, { canvas: sharedCanvas, plugins: [historyPlugin] });
		sharedCanvas.width = 8;
		sharedCanvas.height = 6;

		clearGlOperations(source, dest);
		updateInput(source);

		expect(getTextureInfo(dest as any, 'inputHistoryChunk0')).toMatchObject({ width: 8, height: 6 });
		expect(getTextureInfo(dest as any, 'inputHistoryChunk1')).toMatchObject({ width: 8, height: 6 });
		expect(getGlOperations(source, 'readPixels')).toHaveLength(0);
		expect(getGlOperations(dest, 'readPixels')).toHaveLength(0);
		expect(getGlOperations(dest, 'copyTexSubImage3D')).toHaveLength(1);
		expect(getGlOperations(dest, 'texSubImage3D')).toHaveLength(4);

		source.destroy();
		dest.destroy();
	});

	it('cross-context chaining without history falls back to CPU readPixels plus texImage2D', async () => {
		const ShaderPad = await loadShaderPad();

		const source = new ShaderPad(SOURCE_FRAGMENT_SHADER, { canvas: new OffscreenCanvas(4, 4) });
		const dest = new ShaderPad(DEST_FRAGMENT_SHADER, { canvas: new OffscreenCanvas(4, 4) });

		dest.initializeTexture('u_input', source);

		clearGlOperations(source, dest);
		dest.updateTextures({ u_input: source });

		expect(getGlOperations(source, 'readPixels')).toHaveLength(1);
		expect(getGlOperations(dest, 'texImage2D')).toHaveLength(1);
		expect(getGlOperations(dest, 'copyTexSubImage3D')).toHaveLength(0);

		source.destroy();
		dest.destroy();
	});

	it('cross-context half-float chaining uses the implementation read type directly', async () => {
		const ShaderPad = await loadShaderPad();
		const source = new ShaderPad(SOURCE_FRAGMENT_SHADER, {
			canvas: new OffscreenCanvas(4, 4),
			format: 'RGBA16F',
		});
		const dest = new ShaderPad(DEST_FRAGMENT_SHADER, { canvas: new OffscreenCanvas(4, 4) });

		dest.initializeTexture('u_input', source);
		clearGlOperations(source, dest);
		dest.updateTextures({ u_input: source });

		expect(getGlOperations(source, 'readPixels')).toContainEqual(
			expect.objectContaining({ format: getGl(source).RGBA, type: getGl(source).HALF_FLOAT }),
		);
		expect(getGlOperations(dest, 'texImage2D')).toContainEqual(
			expect.objectContaining({ format: getGl(dest).RGBA, type: getGl(dest).HALF_FLOAT }),
		);

		source.destroy();
		dest.destroy();
	});

	it('cross-context reduced-channel chaining reads compact data directly', async () => {
		const ShaderPad = await loadShaderPad();
		const source = new ShaderPad(SOURCE_FRAGMENT_SHADER, {
			canvas: new OffscreenCanvas(2, 2),
			format: 'R16F',
		});
		const dest = new ShaderPad(DEST_FRAGMENT_SHADER, { canvas: new OffscreenCanvas(2, 2) });

		dest.initializeTexture('u_input', source);
		const upload = getGlOperations(dest, 'texImage2D').at(-1);
		expect(upload).toEqual(
			expect.objectContaining({
				format: getGl(dest).RED,
				type: getGl(dest).HALF_FLOAT,
				sourceData: new Uint16Array([0, 1, 2, 3]),
			}),
		);

		source.destroy();
		dest.destroy();
	});

	it('cross-context integer chaining uses the compact implementation read type', async () => {
		const ShaderPad = await loadShaderPad();
		const source = new ShaderPad(SOURCE_FRAGMENT_SHADER, {
			canvas: new OffscreenCanvas(2, 2),
			format: 'R8UI',
		});
		const dest = new ShaderPad(DEST_FRAGMENT_SHADER, { canvas: new OffscreenCanvas(2, 2) });

		dest.initializeTexture('u_input', source);
		clearGlOperations(source, dest);
		dest.updateTextures({ u_input: source });

		expect(getGlOperations(source, 'readPixels')).toContainEqual(
			expect.objectContaining({ format: getGl(source).RED_INTEGER, type: getGl(source).UNSIGNED_BYTE }),
		);
		expect(getGlOperations(dest, 'texImage2D')).toContainEqual(
			expect.objectContaining({
				format: getGl(dest).RED_INTEGER,
				type: getGl(dest).UNSIGNED_BYTE,
				sourceData: new Uint8Array([0, 1, 2, 3]),
			}),
		);

		source.destroy();
		dest.destroy();
	});

	it('cross-context chaining with destination history uses CPU readback and array re-upload', async () => {
		const ShaderPad = await loadShaderPad();

		const source = new ShaderPad(SOURCE_FRAGMENT_SHADER, { canvas: new OffscreenCanvas(4, 4) });
		const dest = new ShaderPad(DEST_FRAGMENT_SHADER, { canvas: new OffscreenCanvas(4, 4) });

		dest.initializeTexture('u_input', source, { history: 2 });

		clearGlOperations(source, dest);
		dest.updateTextures({ u_input: source });

		expect(getGlOperations(source, 'readPixels')).toHaveLength(1);
		expect(getGlOperations(dest, 'texSubImage3D')).toHaveLength(1);
		expect(getGlOperations(dest, 'copyTexSubImage3D')).toHaveLength(0);

		source.destroy();
		dest.destroy();
	});
});
