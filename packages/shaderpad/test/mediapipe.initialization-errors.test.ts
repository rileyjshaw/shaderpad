import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createFakeVideo, installFakeBrowserGlobals } from './support/fake-browser';

const FRAGMENT_SHADER = `#version 300 es
precision mediump float;

in vec2 v_uv;
out vec4 outColor;

void main() {
	outColor = vec4(v_uv, 0.0, 1.0);
}`;

const pluginNames = ['face', 'hands', 'pose', 'segmenter'] as const;
const failureStages = ['fileset', 'task'] as const;

type PluginName = (typeof pluginNames)[number];
type FailureStage = (typeof failureStages)[number];
type ShaderPadError = Error & { code?: number };

function expectNormalizedMediaPipeError(error: unknown, pluginName: PluginName) {
	expect(error).toBeInstanceOf(Error);
	expect(error).not.toBeInstanceOf(Event);
	expect((error as ShaderPadError).code).toBe(63);
	expect((error as Error).message).toContain('[ShaderPad 63] MediaPipe Plugin Initialization Failed');
	expect((error as Error).message).toContain(`pluginName: ${pluginName}`);
	expect((error as Error).cause).toBeInstanceOf(Event);
}

const pluginLoaders = {
	face: () => import('../src/plugins/face'),
	hands: () => import('../src/plugins/hands'),
	pose: () => import('../src/plugins/pose'),
	segmenter: () => import('../src/plugins/segmenter'),
};

async function loadPlugin(pluginName: PluginName) {
	const [{ __mediapipeMockState }, { default: ShaderPad }, pluginModule] = await Promise.all([
		import('@mediapipe/tasks-vision'),
		import('../src/index'),
		pluginLoaders[pluginName](),
	]);
	return {
		ShaderPad,
		plugin: pluginModule.default,
		mediapipeState: __mediapipeMockState,
	};
}

async function flushAsyncWork() {
	await Promise.resolve();
	await Promise.resolve();
	await new Promise(resolve => setTimeout(resolve, 0));
	await Promise.resolve();
}

function installReportErrorSpy() {
	const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'reportError');
	const errors: unknown[] = [];
	Object.defineProperty(globalThis, 'reportError', {
		value: (error: unknown) => errors.push(error),
		configurable: true,
		writable: true,
	});
	return {
		errors,
		restore() {
			if (descriptor) {
				Object.defineProperty(globalThis, 'reportError', descriptor);
			} else {
				delete (globalThis as { reportError?: unknown }).reportError;
			}
		},
	};
}

describe('MediaPipe plugin initialization errors', () => {
	let restoreGlobals: (() => void) | null = null;
	let restoreReportError: (() => void) | null = null;
	let reportedErrors: unknown[] = [];

	beforeEach(() => {
		restoreGlobals = installFakeBrowserGlobals();
		const reporter = installReportErrorSpy();
		reportedErrors = reporter.errors;
		restoreReportError = reporter.restore;
		vi.resetModules();
	});

	afterEach(() => {
		restoreReportError?.();
		restoreReportError = null;
		restoreGlobals?.();
		restoreGlobals = null;
	});

	describe.each(pluginNames)('%s plugin', pluginName => {
		it.each(failureStages)(
			'reports one normalized error, suppresses inference, and permits retry after a %s failure',
			async (failureStage: FailureStage) => {
				const { ShaderPad, plugin, mediapipeState } = await loadPlugin(pluginName);
				mediapipeState.reset();
				if (failureStage === 'fileset') {
					mediapipeState.filesetFailuresRemaining = 1;
				} else {
					mediapipeState.createFailuresRemaining = 1;
				}

				const unhandledRejections: unknown[] = [];
				const onUnhandledRejection = (reason: unknown) => unhandledRejections.push(reason);
				process.on('unhandledRejection', onUnhandledRejection);

				let shader: InstanceType<typeof ShaderPad> | undefined;
				let retryShader: InstanceType<typeof ShaderPad> | undefined;
				try {
					let readyCount = 0;
					shader = new ShaderPad(FRAGMENT_SHADER, {
						canvas: new OffscreenCanvas(4, 4),
						plugins: [plugin({ textureName: 'u_webcam' })],
					});
					shader.on(`${pluginName}:ready`, () => {
						readyCount += 1;
					});

					await flushAsyncWork();

					expect(reportedErrors).toHaveLength(1);
					expectNormalizedMediaPipeError(reportedErrors[0], pluginName);
					expect(readyCount).toBe(0);

					const video = createFakeVideo(0);
					shader.initializeTexture('u_webcam', video as any);
					for (let i = 0; i < 5; ++i) {
						video.currentTime = i + 1;
						shader.updateTextures({ u_webcam: video as any });
					}
					await flushAsyncWork();

					expect(reportedErrors).toHaveLength(1);
					expect(readyCount).toBe(0);
					expect(mediapipeState.detectCalls).toEqual([]);
					expect(unhandledRejections).toEqual([]);

					let retryReadyCount = 0;
					retryShader = new ShaderPad(FRAGMENT_SHADER, {
						canvas: new OffscreenCanvas(4, 4),
						plugins: [plugin({ textureName: 'u_webcam' })],
					});
					retryShader.on(`${pluginName}:ready`, () => {
						retryReadyCount += 1;
					});

					await flushAsyncWork();

					expect(retryReadyCount).toBe(1);
					expect(reportedErrors).toHaveLength(1);
					expect(mediapipeState.filesetCalls).toBe(failureStage === 'fileset' ? 2 : 1);
					expect(mediapipeState.createCalls).toBe(failureStage === 'fileset' ? 1 : 2);
					expect(mediapipeState.detectCalls).toEqual([]);
					expect(unhandledRejections).toEqual([]);
				} finally {
					shader?.destroy();
					retryShader?.destroy();
					process.off('unhandledRejection', onUnhandledRejection);
				}
			},
		);
	});

	it.each(pluginNames)('%s defaults to GPU and forwards an explicit CPU delegate', async pluginName => {
		const { ShaderPad, plugin, mediapipeState } = await loadPlugin(pluginName);
		mediapipeState.reset();

		const gpuShader = new ShaderPad(FRAGMENT_SHADER, {
			canvas: new OffscreenCanvas(4, 4),
			plugins: [plugin({ textureName: 'u_webcam' })],
		});
		const cpuShader = new ShaderPad(FRAGMENT_SHADER, {
			canvas: new OffscreenCanvas(4, 4),
			plugins: [plugin({ textureName: 'u_webcam', options: { delegate: 'CPU' } })],
		});

		try {
			await flushAsyncWork();

			expect(mediapipeState.createCalls).toBe(2);
			expect(mediapipeState.createOptions.map(({ options }) => options.baseOptions?.delegate)).toEqual([
				'GPU',
				'CPU',
			]);
		} finally {
			gpuShader.destroy();
			cpuShader.destroy();
		}
	});

	it('preserves Error instances instead of wrapping them', async () => {
		const { reportMediaPipeError } = await import('../src/plugins/mediapipe-common');
		const error = new TypeError('MediaPipe rejected its model');

		reportMediaPipeError(error, 'face');

		expect(reportedErrors).toEqual([error]);
	});

	it('falls back to an asynchronous normal error when reportError is unavailable', async () => {
		const { reportMediaPipeError } = await import('../src/plugins/mediapipe-common');
		Object.defineProperty(globalThis, 'reportError', {
			value: undefined,
			configurable: true,
			writable: true,
		});
		let queuedCallback: VoidFunction | undefined;
		const queueMicrotaskSpy = vi.spyOn(globalThis, 'queueMicrotask').mockImplementation(callback => {
			queuedCallback = callback;
		});

		try {
			reportMediaPipeError(new Event('error'), 'face');

			expect(queuedCallback).toBeTypeOf('function');
			let thrown: unknown;
			try {
				queuedCallback!();
			} catch (error) {
				thrown = error;
			}
			expectNormalizedMediaPipeError(thrown, 'face');
		} finally {
			queueMicrotaskSpy.mockRestore();
		}
	});

	it('keeps sibling plugins and the ShaderPad render loop working after one task fails', async () => {
		const [{ __mediapipeMockState }, { default: ShaderPad }, { default: face }, { default: hands }] =
			await Promise.all([
				import('@mediapipe/tasks-vision'),
				import('../src/index'),
				import('../src/plugins/face'),
				import('../src/plugins/hands'),
			]);
		__mediapipeMockState.reset();
		__mediapipeMockState.createFailuresRemaining = 1;
		__mediapipeMockState.createFailureTask = 'face';

		const shader = new ShaderPad(FRAGMENT_SHADER, {
			canvas: new OffscreenCanvas(4, 4),
			plugins: [face({ textureName: 'u_webcam' }), hands({ textureName: 'u_webcam' })],
		});
		let faceReadyCount = 0;
		let handsReadyCount = 0;
		shader.on('face:ready', () => {
			faceReadyCount += 1;
		});
		shader.on('hands:ready', () => {
			handsReadyCount += 1;
		});

		try {
			await flushAsyncWork();

			expect(reportedErrors).toHaveLength(1);
			expectNormalizedMediaPipeError(reportedErrors[0], 'face');
			expect(faceReadyCount).toBe(0);
			expect(handsReadyCount).toBe(1);
			expect(__mediapipeMockState.createCalls).toBe(2);

			const video = createFakeVideo(0);
			shader.initializeTexture('u_webcam', video as any);
			await flushAsyncWork();

			expect(__mediapipeMockState.detectCalls).toEqual([{ mode: 'video', time: 0 }]);
			expect(() => shader.step()).not.toThrow();
		} finally {
			shader.destroy();
		}
	});
});
