import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { GLFormatString } from '../src/index';
import { FakeWebGL2RenderingContext, getGl, getGlOperations, installFakeBrowserGlobals } from './support/fake-browser';

type GLUploadFormatString =
	'RED' | 'RG' | 'RGB' | 'RGBA' | 'RED_INTEGER' | 'RG_INTEGER' | 'RGB_INTEGER' | 'RGBA_INTEGER';

const GL_TYPE = {
	BYTE: 5120,
	UNSIGNED_BYTE: 5121,
	SHORT: 5122,
	UNSIGNED_SHORT: 5123,
	INT: 5124,
	UNSIGNED_INT: 5125,
	FLOAT: 5126,
	HALF_FLOAT: 5131,
	UNSIGNED_SHORT_4_4_4_4: 32819,
	UNSIGNED_SHORT_5_5_5_1: 32820,
	UNSIGNED_SHORT_5_6_5: 33635,
	UNSIGNED_INT_2_10_10_10_REV: 33640,
	UNSIGNED_INT_10F_11F_11F_REV: 35899,
	UNSIGNED_INT_5_9_9_9_REV: 35902,
} as const;

type GLTypeName = keyof typeof GL_TYPE;
type ArrayBufferViewConstructor = new (length: number) => ArrayBufferView;

const EXPECTED: [GLFormatString, GLUploadFormatString, GLTypeName, ArrayBufferViewConstructor][] = [
	['R8', 'RED', 'UNSIGNED_BYTE', Uint8Array],
	['R8_SNORM', 'RED', 'BYTE', Int8Array],
	['R16F', 'RED', 'FLOAT', Float32Array],
	['R32F', 'RED', 'FLOAT', Float32Array],
	['R8UI', 'RED_INTEGER', 'UNSIGNED_BYTE', Uint8Array],
	['R8I', 'RED_INTEGER', 'BYTE', Int8Array],
	['R16UI', 'RED_INTEGER', 'UNSIGNED_SHORT', Uint16Array],
	['R16I', 'RED_INTEGER', 'SHORT', Int16Array],
	['R32UI', 'RED_INTEGER', 'UNSIGNED_INT', Uint32Array],
	['R32I', 'RED_INTEGER', 'INT', Int32Array],
	['RG8', 'RG', 'UNSIGNED_BYTE', Uint8Array],
	['RG8_SNORM', 'RG', 'BYTE', Int8Array],
	['RG16F', 'RG', 'FLOAT', Float32Array],
	['RG32F', 'RG', 'FLOAT', Float32Array],
	['RG8UI', 'RG_INTEGER', 'UNSIGNED_BYTE', Uint8Array],
	['RG8I', 'RG_INTEGER', 'BYTE', Int8Array],
	['RG16UI', 'RG_INTEGER', 'UNSIGNED_SHORT', Uint16Array],
	['RG16I', 'RG_INTEGER', 'SHORT', Int16Array],
	['RG32UI', 'RG_INTEGER', 'UNSIGNED_INT', Uint32Array],
	['RG32I', 'RG_INTEGER', 'INT', Int32Array],
	['RGB8', 'RGB', 'UNSIGNED_BYTE', Uint8Array],
	['SRGB8', 'RGB', 'UNSIGNED_BYTE', Uint8Array],
	['RGB565', 'RGB', 'UNSIGNED_BYTE', Uint8Array],
	['RGB8_SNORM', 'RGB', 'BYTE', Int8Array],
	['R11F_G11F_B10F', 'RGB', 'FLOAT', Float32Array],
	['RGB9_E5', 'RGB', 'FLOAT', Float32Array],
	['RGB16F', 'RGB', 'FLOAT', Float32Array],
	['RGB32F', 'RGB', 'FLOAT', Float32Array],
	['RGB8UI', 'RGB_INTEGER', 'UNSIGNED_BYTE', Uint8Array],
	['RGB8I', 'RGB_INTEGER', 'BYTE', Int8Array],
	['RGB16UI', 'RGB_INTEGER', 'UNSIGNED_SHORT', Uint16Array],
	['RGB16I', 'RGB_INTEGER', 'SHORT', Int16Array],
	['RGB32UI', 'RGB_INTEGER', 'UNSIGNED_INT', Uint32Array],
	['RGB32I', 'RGB_INTEGER', 'INT', Int32Array],
	['RGBA8', 'RGBA', 'UNSIGNED_BYTE', Uint8Array],
	['SRGB8_ALPHA8', 'RGBA', 'UNSIGNED_BYTE', Uint8Array],
	['RGBA8_SNORM', 'RGBA', 'BYTE', Int8Array],
	['RGB5_A1', 'RGBA', 'UNSIGNED_BYTE', Uint8Array],
	['RGBA4', 'RGBA', 'UNSIGNED_BYTE', Uint8Array],
	['RGB10_A2', 'RGBA', 'UNSIGNED_INT_2_10_10_10_REV', Uint32Array],
	['RGBA16F', 'RGBA', 'FLOAT', Float32Array],
	['RGBA32F', 'RGBA', 'FLOAT', Float32Array],
	['RGBA8UI', 'RGBA_INTEGER', 'UNSIGNED_BYTE', Uint8Array],
	['RGBA8I', 'RGBA_INTEGER', 'BYTE', Int8Array],
	['RGB10_A2UI', 'RGBA_INTEGER', 'UNSIGNED_INT_2_10_10_10_REV', Uint32Array],
	['RGBA16UI', 'RGBA_INTEGER', 'UNSIGNED_SHORT', Uint16Array],
	['RGBA16I', 'RGBA_INTEGER', 'SHORT', Int16Array],
	['RGBA32UI', 'RGBA_INTEGER', 'UNSIGNED_INT', Uint32Array],
	['RGBA32I', 'RGBA_INTEGER', 'INT', Int32Array],
];

const FRAGMENT_SHADER = `#version 300 es
precision mediump float;
out vec4 outColor;
void main() { outColor = vec4(0.0); }`;

async function upload(format: GLFormatString, data: ArrayBufferView | null) {
	const { default: ShaderPad } = await import('../src/index');
	const shader = new ShaderPad(FRAGMENT_SHADER, { canvas: new OffscreenCanvas(1, 1) });
	shader.initializeTexture('u_test', { data, width: 1, height: 1 }, { format });
	return { shader, operation: getGlOperations(shader, 'texImage2D').at(-1)! };
}

describe('format derivation through the public texture API', () => {
	let restoreGlobals: (() => void) | null = null;

	beforeEach(() => {
		restoreGlobals = installFakeBrowserGlobals();
		vi.resetModules();
		EXPECTED.forEach(([format], index) => {
			Reflect.set(FakeWebGL2RenderingContext.prototype, format, 1000 + index);
		});
	});

	afterEach(() => {
		restoreGlobals?.();
		restoreGlobals = null;
	});

	it('covers every sized colour format WebGL2 defines, once each', () => {
		expect(EXPECTED).toHaveLength(49);
		expect(new Set(EXPECTED.map(([format]) => format)).size).toBe(49);
	});

	it.each(EXPECTED)('%s uploads as %s / %s', async (format, uploadFormat, type, ArrayType) => {
		const { shader, operation } = await upload(format, new ArrayType(4));
		const gl = getGl(shader);

		expect(operation).toMatchObject({
			internalFormat: Reflect.get(gl, format),
			format: Reflect.get(gl, uploadFormat),
			type: GL_TYPE[type],
		});
		shader.destroy();
	});

	it.each([
		['RGBA16F', new Uint16Array(4), GL_TYPE.HALF_FLOAT],
		['RGBA16F', new Float32Array(4), GL_TYPE.FLOAT],
		['RGBA32F', new Uint16Array(4), GL_TYPE.FLOAT],
		['RGB9_E5', new Uint16Array(3), GL_TYPE.HALF_FLOAT],
		['RGB565', new Uint16Array(1), GL_TYPE.UNSIGNED_SHORT_5_6_5],
		['RGB5_A1', new Uint16Array(1), GL_TYPE.UNSIGNED_SHORT_5_5_5_1],
		['RGBA4', new Uint16Array(1), GL_TYPE.UNSIGNED_SHORT_4_4_4_4],
		['R11F_G11F_B10F', new Uint32Array(1), GL_TYPE.UNSIGNED_INT_10F_11F_11F_REV],
		['RGB9_E5', new Uint32Array(1), GL_TYPE.UNSIGNED_INT_5_9_9_9_REV],
	] as const)('%s infers %s data as type %d', async (format, data, type) => {
		const { shader, operation } = await upload(format, data);
		expect(operation.type).toBe(type);
		shader.destroy();
	});
});
