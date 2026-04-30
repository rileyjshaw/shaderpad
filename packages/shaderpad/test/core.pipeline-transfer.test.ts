import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { clearGlOperations, getGlOperations, getTextureInfo, installFakeBrowserGlobals } from './support/fake-browser';

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

	it('same-context chaining with destination history stays on the GPU via copyTexSubImage3D', async () => {
		const ShaderPad = await loadShaderPad();
		const sharedCanvas = new OffscreenCanvas(4, 4);

		const source = new ShaderPad(SOURCE_FRAGMENT_SHADER, { canvas: sharedCanvas });
		const dest = new ShaderPad(DEST_FRAGMENT_SHADER, { canvas: sharedCanvas });

		dest.initializeTexture('u_input', source, { history: 2 });

		clearGlOperations(source, dest);
		dest.updateTextures({ u_input: source });

		expect(getGlOperations(source, 'readPixels')).toHaveLength(0);
		expect(getGlOperations(dest, 'readPixels')).toHaveLength(0);
		expect(getGlOperations(dest, 'copyTexSubImage3D')).toHaveLength(1);
		expect(getGlOperations(dest, 'texSubImage3D')).toHaveLength(0);

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
