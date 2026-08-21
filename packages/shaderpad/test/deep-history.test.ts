import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
	clearGlOperations,
	createFakeVideo,
	getGlOperations,
	getTextureInfo,
	getTextureWrites,
	getUniformValue,
	installFakeBrowserGlobals,
} from './support/fake-browser';

const FRAGMENT_SHADER = `#version 300 es
precision mediump float;
in vec2 v_uv;
out vec4 outColor;
void main() { outColor = vec4(v_uv, 0.0, 1.0); }`;

async function loadModules() {
	const [{ default: ShaderPad }, { default: deepHistory }] = await Promise.all([
		import('../src/index'),
		import('../src/plugins/deep-history'),
	]);
	return { ShaderPad, deepHistory };
}

function expectShaderPadError(callback: () => unknown, code: number, title: string) {
	try {
		callback();
		expect.fail(`Expected ShaderPad error ${code}.`);
	} catch (error) {
		expect(error).toMatchObject({ code });
		expect((error as Error).message).toContain(`[ShaderPad ${code}] ${title}`);
	}
}

describe('deep history plugin', () => {
	let restoreGlobals: (() => void) | null = null;

	beforeEach(() => {
		restoreGlobals = installFakeBrowserGlobals();
		vi.resetModules();
	});

	afterEach(() => {
		restoreGlobals?.();
		restoreGlobals = null;
	});

	it('compiles eagerly once, before _init texture allocation', async () => {
		const { ShaderPad, deepHistory } = await loadModules();
		let initCompileCount = -1;
		const [historyPlugin] = deepHistory('webcamHistory', createFakeVideo() as any, { history: 4, chunks: 2 });
		const shader = new ShaderPad(FRAGMENT_SHADER, {
			canvas: new OffscreenCanvas(4, 4),
			plugins: [
				historyPlugin,
				(shader: any) =>
					shader.on('_init', () => (initCompileCount = getGlOperations(shader, 'compileShader').length)),
			],
		});

		expect(initCompileCount).toBe(2);
		expect(getGlOperations(shader, 'compileShader')).toHaveLength(2);
		expect(getGlOperations(shader, 'linkProgram')).toHaveLength(1);
		shader.draw();
		shader.draw();
		expect(getGlOperations(shader, 'compileShader')).toHaveLength(2);
		expect(getGlOperations(shader, 'linkProgram')).toHaveLength(1);
		shader.destroy();
	});

	it('generates typed accessors and keeps physical names internal', async () => {
		const { ShaderPad, deepHistory } = await loadModules();
		const [color] = deepHistory('colorHistory', createFakeVideo() as any, { history: 4, chunks: 2 });
		const [ids] = deepHistory('idsHistory', createFakeVideo() as any, {
			history: 4,
			chunks: 2,
			format: 'RGBA32UI',
		});
		const [signed] = deepHistory('signedHistory', createFakeVideo() as any, {
			history: 4,
			chunks: 2,
			format: 'RGBA32I',
		});
		const shader = new ShaderPad(FRAGMENT_SHADER, {
			canvas: new OffscreenCanvas(4, 4),
			plugins: [color, ids, signed],
		});

		const source = getGlOperations(shader, 'shaderSource').at(-1)?.source ?? '';
		expect(source).toContain('vec4 colorHistory(vec2 uv,int age)');
		expect(source).toContain('uniform highp usampler2DArray idsHistoryChunk0;');
		expect(source).toContain('uvec4 idsHistory(vec2 uv,int age)');
		expect(source).toContain('uniform highp isampler2DArray signedHistoryChunk0;');
		expect(source).toContain('ivec4 signedHistory(vec2 uv,int age)');
		expect(source).not.toContain('historyZ');
		shader.destroy();
	});

	it('defaults to two padded arrays but uploads the initial source and each update once', async () => {
		const { ShaderPad, deepHistory } = await loadModules();
		const video = createFakeVideo();
		const [historyPlugin, updateWebcam] = deepHistory('webcamHistory', video as any, {
			history: 4,
		});
		const shader = new ShaderPad(FRAGMENT_SHADER, {
			canvas: new OffscreenCanvas(4, 4),
			plugins: [historyPlugin],
		});

		expect(getTextureInfo(shader, 'webcamHistoryChunk0').history).toMatchObject({ depth: 3 });
		expect(getTextureInfo(shader, 'webcamHistoryChunk1').history).toMatchObject({ depth: 3 });
		expect(
			getGlOperations(shader, 'texSubImage3D').filter(operation => operation.sourceData === video),
		).toHaveLength(1);

		clearGlOperations(shader);
		updateWebcam(video as any);
		expect(
			getGlOperations(shader, 'texSubImage3D').filter(operation => operation.sourceData === video),
		).toHaveLength(1);
		expect(getGlOperations(shader, 'texSubImage3D')[0]).toMatchObject({ slot: 0 });
		expect(getUniformValue(shader, 'webcamHistoryOffset')).toBe(1);
		shader.destroy();
	});

	it('maps explicit logical slots across chunks', async () => {
		const { ShaderPad, deepHistory } = await loadModules();
		const [historyPlugin, updateWebcam] = deepHistory('webcamHistory', createFakeVideo() as any, {
			history: 4,
			chunks: 2,
		});
		const shader = new ShaderPad(FRAGMENT_SHADER, {
			canvas: new OffscreenCanvas(4, 4),
			plugins: [historyPlugin],
		});
		clearGlOperations(shader);
		const source = createFakeVideo();

		updateWebcam(source as any, [1, 4]);

		const writes = getGlOperations(shader, 'texSubImage3D');
		expect(writes.map(write => write.slot).sort()).toEqual([0, 2]);
		expect(new Set(writes.map(write => write.textureId)).size).toBe(2);
		expect(getUniformValue(shader, 'webcamHistoryOffset')).toBe(4);
		shader.destroy();
	});

	it('resizes every physical array before one current-source upload', async () => {
		const { ShaderPad, deepHistory } = await loadModules();
		const [historyPlugin, updateWebcam] = deepHistory('webcamHistory', createFakeVideo() as any, {
			history: 4,
			chunks: 2,
		});
		const shader = new ShaderPad(FRAGMENT_SHADER, {
			canvas: new OffscreenCanvas(4, 4),
			plugins: [historyPlugin],
		});
		clearGlOperations(shader);
		const larger = createFakeVideo();
		larger.videoWidth = 8;
		larger.videoHeight = 6;

		updateWebcam(larger as any);

		expect(getTextureInfo(shader, 'webcamHistoryChunk0')).toMatchObject({ width: 8, height: 6 });
		expect(getTextureInfo(shader, 'webcamHistoryChunk1')).toMatchObject({ width: 8, height: 6 });
		expect(
			getGlOperations(shader, 'texSubImage3D').filter(operation => operation.sourceData === larger),
		).toHaveLength(1);
		expect(getUniformValue(shader, 'webcamHistoryOffset')).toBe(0);
		shader.destroy();
	});

	it('captures output after steps while draw and skipHistory do not advance it', async () => {
		const [{ default: ShaderPad }, { SHADER_OUTPUT, default: deepHistory }] = await Promise.all([
			import('../src/index'),
			import('../src/plugins/deep-history'),
		]);
		const outputHistory = deepHistory('outputHistory', SHADER_OUTPUT, { history: 4, chunks: 2 });
		expect(outputHistory).toHaveLength(1);
		const [historyPlugin] = outputHistory;
		const shader = new ShaderPad(FRAGMENT_SHADER, {
			canvas: new OffscreenCanvas(4, 4),
			plugins: [historyPlugin],
		});

		clearGlOperations(shader);
		shader.draw();
		expect(getGlOperations(shader, 'copyTexSubImage3D')).toHaveLength(0);
		expect(getUniformValue(shader, 'outputHistoryOffset')).toBe(0);

		shader.step();
		expect(getGlOperations(shader, 'copyTexSubImage3D')).toHaveLength(1);
		expect(getTextureWrites(shader, 'outputHistoryChunk0').at(-1)).toMatchObject({
			kind: 'copy3d',
			slot: 0,
		});
		expect(getUniformValue(shader, 'outputHistoryOffset')).toBe(0);

		clearGlOperations(shader);
		shader.step({ skipHistory: true });
		expect(getGlOperations(shader, 'copyTexSubImage3D')).toHaveLength(0);
		expect(getUniformValue(shader, 'outputHistoryOffset')).toBe(0);

		shader.step();
		expect(getTextureWrites(shader, 'outputHistoryChunk1').at(-1)).toMatchObject({
			kind: 'copy3d',
			slot: 0,
		});
		expect(getUniformValue(shader, 'outputHistoryOffset')).toBe(1);

		shader.reset();
		expect(getUniformValue(shader, 'outputHistoryOffset')).toBe(0);
		shader.destroy();
	});

	it('inherits shader output texture options and compatible defaults', async () => {
		const [{ default: ShaderPad }, { SHADER_OUTPUT, default: deepHistory }] = await Promise.all([
			import('../src/index'),
			import('../src/plugins/deep-history'),
		]);
		const [historyPlugin] = deepHistory('outputHistory', SHADER_OUTPUT, { history: 4, chunks: 2 });
		const shader = new ShaderPad(FRAGMENT_SHADER, {
			canvas: new OffscreenCanvas(4, 4),
			format: 'RGBA32UI',
			wrapS: 'REPEAT',
			wrapT: 'MIRRORED_REPEAT',
			plugins: [historyPlugin],
		});

		const source = getGlOperations(shader, 'shaderSource').at(-1)?.source ?? '';
		expect(source).toContain('uniform highp usampler2DArray outputHistoryChunk0;');
		expect(source).toContain('uvec4 outputHistory(vec2 uv,int age)');
		for (const name of ['outputHistoryChunk0', 'outputHistoryChunk1']) {
			const info = getTextureInfo(shader, name);
			expect(info.options.formatName).toBe('RGBA32UI');
			expect(info.options.minFilter).toBe(shader.gl.NEAREST);
			expect(info.options.magFilter).toBe(shader.gl.NEAREST);
			expect(info.options.wrapS).toBe(shader.gl.REPEAT);
			expect(info.options.wrapT).toBe(shader.gl.MIRRORED_REPEAT);
		}
		shader.destroy();
	});

	it('validates configuration and updater lifetime', async () => {
		const { ShaderPad, deepHistory } = await loadModules();
		for (const createInvalidPlugin of [
			() => deepHistory('1webcam', createFakeVideo() as any, { history: 4, chunks: 2 }),
			() => deepHistory('webcamHistory', createFakeVideo() as any, { history: 0, chunks: 2 }),
			() => deepHistory('webcamHistory', createFakeVideo() as any, { history: 1, chunks: 3 }),
		]) {
			expectShaderPadError(createInvalidPlugin, 64, 'Deep History Configuration Invalid');
		}
		expectShaderPadError(
			() => deepHistory('webcamHistory', { data: null, width: 0, height: 1 }, { history: 4 }),
			17,
			'Texture Source Dimensions Invalid',
		);

		const [plugin, update] = deepHistory('webcamHistory', createFakeVideo() as any, { history: 4, chunks: 2 });
		expectShaderPadError(() => update(createFakeVideo() as any), 65, 'Deep History Lifecycle Invalid');
		const shader = new ShaderPad(FRAGMENT_SHADER, {
			canvas: new OffscreenCanvas(4, 4),
			plugins: [plugin],
		});
		expectShaderPadError(
			() =>
				new ShaderPad(FRAGMENT_SHADER, {
					canvas: new OffscreenCanvas(4, 4),
					plugins: [plugin],
				}),
			65,
			'Deep History Lifecycle Invalid',
		);
		shader.destroy();
		expectShaderPadError(() => update(createFakeVideo() as any), 65, 'Deep History Lifecycle Invalid');

		const [tooDeep] = deepHistory('deepHistory', createFakeVideo() as any, { history: 512 });
		expectShaderPadError(
			() =>
				new ShaderPad(FRAGMENT_SHADER, {
					canvas: new OffscreenCanvas(4, 4),
					plugins: [tooDeep],
				}),
			64,
			'Deep History Configuration Invalid',
		);
	});
});
