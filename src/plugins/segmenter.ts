import ShaderPad, { PluginContext, TextureSource } from '..';
import {
	generateGLSLFn,
	dummyTexture,
	getSharedFileset,
	hashOptions,
	isMediaPipeSource,
	MediaPipeSource,
} from './mediapipe-common';
import type { ImageSegmenter, ImageSegmenterResult, MPMask } from '@mediapipe/tasks-vision';

export interface SegmenterPluginOptions {
	modelPath?: string;
	outputConfidenceMasks?: boolean;
	history?: number;
}

const dummyTextureFloat32 = { data: new Float32Array(1).fill(1), width: 1, height: 1 };

const DEFAULT_SEGMENTER_OPTIONS: Required<Omit<SegmenterPluginOptions, 'history'>> = {
	modelPath:
		'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite',
	outputConfidenceMasks: false,
};

const MASK_SHADER_SOURCE = `#version 300 es
precision mediump float;
in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_categoryMask;
uniform sampler2D u_confidenceMask;
uniform float u_maxCategoryIndex;

void main() {
	vec2 uv = vec2(v_uv.x, 1.0 - v_uv.y);
	float normalizedCategoryIndex = texture(u_categoryMask, uv).r * 255.0 / u_maxCategoryIndex;
	float confidence = texture(u_confidenceMask, uv).r;
	outColor = vec4(confidence, normalizedCategoryIndex, 0.0, 1.0);
}`;

interface SharedDetector {
	segmenter: ImageSegmenter;
	outputConfidenceMasks: boolean;
	subscribers: Map<Function, boolean>;
	numCategories: number;
	state: {
		nCalls: number;
		runningMode: 'IMAGE' | 'VIDEO';
		source: MediaPipeSource | null;
		videoTime: number;
		resultTimestamp: number;
		result: ImageSegmenterResult | null;
		pending: Promise<void>;
	};
	mask: {
		canvas: OffscreenCanvas;
		shader: ShaderPad;
		confidence: {
			data: Float32Array | null;
			width: number;
			height: number;
		};
	};
}
const sharedDetectors = new Map<string, SharedDetector>();

function updateMask(detector: SharedDetector, categoryMask: MPMask, confidenceMasks?: MPMask[]) {
	const {
		numCategories,
		outputConfidenceMasks,
		mask: { shader, confidence },
	} = detector;
	const { width, height } = categoryMask;

	if (confidence.width !== width || confidence.height !== height) {
		confidence.width = width;
		confidence.height = height;
		confidence.data = new Float32Array(width * height).fill(1);
	}

	if (outputConfidenceMasks && confidenceMasks?.length) {
		const categoryData = categoryMask.getAsUint8Array();
		const confidenceArrays = confidenceMasks.map(m => m.getAsFloat32Array());
		const data = confidence.data!;
		for (let i = 0; i < categoryData.length; ++i) {
			const categoryIndex = categoryData[i];
			data[i] = confidenceArrays[categoryIndex][i];
		}
	}

	shader.updateTextures({
		u_categoryMask: categoryMask.getAsWebGLTexture(),
		u_confidenceMask: confidence,
	});
	shader.step();
	categoryMask.close();
	confidenceMasks?.forEach(m => m.close());
}

function segmenter(config: { textureName: string; options?: SegmenterPluginOptions }) {
	const { textureName, options: { history, ...mediapipeOptions } = {} } = config;
	const options = { ...DEFAULT_SEGMENTER_OPTIONS, ...mediapipeOptions };
	const optionsKey = hashOptions({ ...options, textureName });

	return function (shaderPad: ShaderPad, context: PluginContext) {
		const { injectGLSL, emitHook } = context;

		const existingDetector = sharedDetectors.get(optionsKey);
		const mediapipeCanvas = existingDetector?.mask.canvas ?? new OffscreenCanvas(1, 1);
		let detector: SharedDetector | null = null;
		let destroyed = false;
		let skipHistoryWrite = false;

		function onResult(singleHistoryWriteIndex?: number) {
			if (!detector) return;
			let historyWriteIndex: number | number[] | undefined = singleHistoryWriteIndex;
			if (typeof historyWriteIndex === 'undefined' && pendingBackfillSlots.length > 0) {
				historyWriteIndex = pendingBackfillSlots;
				pendingBackfillSlots = [];
			}
			shaderPad.updateTextures(
				{ u_segmentMask: detector.mask.shader },
				history ? { skipHistoryWrite, historyWriteIndex } : undefined
			);
			emitHook('segmenter:result', detector.state.result);
		}

		async function initializeDetector() {
			if (sharedDetectors.has(optionsKey)) {
				detector = sharedDetectors.get(optionsKey)!;
			} else {
				const [mediaPipe, { ImageSegmenter }] = await Promise.all([
					getSharedFileset(),
					import('@mediapipe/tasks-vision'),
				]);
				if (destroyed) return;

				const imageSegmenter = await ImageSegmenter.createFromOptions(mediaPipe, {
					baseOptions: {
						modelAssetPath: options.modelPath,
						delegate: 'GPU',
					},
					canvas: mediapipeCanvas,
					runningMode: 'VIDEO',
					outputCategoryMask: true,
					outputConfidenceMasks: options.outputConfidenceMasks,
				});
				if (destroyed) {
					imageSegmenter.close();
					return;
				}

				const maskShader = new ShaderPad(MASK_SHADER_SOURCE, { canvas: mediapipeCanvas });
				maskShader.initializeTexture('u_categoryMask', dummyTexture);
				maskShader.initializeTexture('u_confidenceMask', dummyTextureFloat32, {
					format: 'RED',
					internalFormat: 'R32F',
					type: 'FLOAT',
					minFilter: 'NEAREST',
					magFilter: 'NEAREST',
				});
				const numCategories = imageSegmenter.getLabels().length || 1;
				maskShader.initializeUniform('u_maxCategoryIndex', 'float', Math.max(1, numCategories - 1));

				detector = {
					segmenter: imageSegmenter,
					outputConfidenceMasks: options.outputConfidenceMasks,
					subscribers: new Map(),
					numCategories,
					state: {
						nCalls: 0,
						runningMode: 'VIDEO',
						source: null,
						videoTime: -1,
						resultTimestamp: 0,
						result: null,
						pending: Promise.resolve(),
					},
					mask: {
						canvas: mediapipeCanvas,
						shader: maskShader,
						confidence: {
							data: null,
							width: 0,
							height: 0,
						},
					},
				};
				sharedDetectors.set(optionsKey, detector);
			}

			detector!.subscribers.set(onResult, false);
		}
		const initPromise = initializeDetector();

		shaderPad.on('_init', () => {
			shaderPad.initializeUniform('u_numCategories', 'int', 1);
			shaderPad.initializeTexture('u_segmentMask', mediapipeCanvas, {
				minFilter: 'NEAREST',
				magFilter: 'NEAREST',
				history,
			});
			initPromise.then(() => {
				if (destroyed || !detector) return;
				shaderPad.updateUniforms({ u_numCategories: detector.numCategories });
				emitHook('segmenter:ready');
			});
		});

		let historyWriteCounter = 0;
		let pendingBackfillSlots: number[] = [];
		const writeToHistory = () => {
			if (!history) return;
			onResult(historyWriteCounter); // Write stale data immediately.
			pendingBackfillSlots.push(historyWriteCounter); // Queue up backfill with more recent data.
			historyWriteCounter = (historyWriteCounter + 1) % (history + 1);
		};

		shaderPad.on('initializeTexture', (name: string, source: TextureSource) => {
			if (name === textureName && isMediaPipeSource(source)) {
				writeToHistory();
				detectSegments(source);
			}
		});

		shaderPad.on(
			'updateTextures',
			(updates: Record<string, TextureSource>, options?: { skipHistoryWrite?: boolean }) => {
				const source = updates[textureName];
				if (isMediaPipeSource(source)) {
					skipHistoryWrite = options?.skipHistoryWrite ?? false;
					if (!skipHistoryWrite) writeToHistory();
					detectSegments(source);
				}
			}
		);

		async function detectSegments(source: MediaPipeSource) {
			const now = performance.now();
			await initPromise;
			if (!detector) return;
			const callOrder = ++detector.state.nCalls;

			detector.state.pending = detector.state.pending.then(async () => {
				if (!detector || callOrder !== detector.state.nCalls) return;

				const requiredMode = source instanceof HTMLVideoElement ? 'VIDEO' : 'IMAGE';
				if (detector.state.runningMode !== requiredMode) {
					detector.state.runningMode = requiredMode;
					await detector.segmenter.setOptions({ runningMode: requiredMode });
				}

				let shouldDetect = false;

				if (source !== detector.state.source) {
					detector.state.source = source;
					detector.state.videoTime = -1;
					shouldDetect = true;
				} else if (source instanceof HTMLVideoElement) {
					if (source.currentTime !== detector.state.videoTime) {
						detector.state.videoTime = source.currentTime;
						shouldDetect = true;
					}
				} else if (!(source instanceof HTMLImageElement)) {
					if (now - detector.state.resultTimestamp > 2) {
						shouldDetect = true;
					}
				}

				if (shouldDetect) {
					let result: ImageSegmenterResult | undefined;
					if (source instanceof HTMLVideoElement) {
						if (source.videoWidth === 0 || source.videoHeight === 0 || source.readyState < 2) return;
						result = detector.segmenter.segmentForVideo(source, now);
					} else {
						if (source.width === 0 || source.height === 0) return;
						result = detector.segmenter.segment(source);
					}

					if (result) {
						detector.state.resultTimestamp = now;
						detector.state.result = result;
						if (result.categoryMask) {
							updateMask(detector, result.categoryMask, result.confidenceMasks);
						}
						for (const cb of detector.subscribers.keys()) {
							cb();
							detector.subscribers.set(cb, true);
						}
					}
				} else if (detector.state.result) {
					for (const [cb, hasCalled] of detector.subscribers.entries()) {
						if (!hasCalled) {
							cb();
							detector.subscribers.set(cb, true);
						}
					}
					detector.subscribers.set(onResult, true);
				}
			});

			await detector.state.pending;
		}

		shaderPad.on('destroy', () => {
			destroyed = true;
			if (detector) {
				detector.subscribers.delete(onResult);
				if (detector.subscribers.size === 0) {
					detector.segmenter.close();
					detector.mask.shader.destroy();
					sharedDetectors.delete(optionsKey);
				}
			}
			detector = null;
		});

		const { fn } = generateGLSLFn(history);
		const sampleMask = history
			? `int layer = (u_segmentMaskFrameOffset - framesAgo + ${history + 1}) % ${history + 1};
	vec4 mask = texture(u_segmentMask, vec3(pos, float(layer)));`
			: `vec4 mask = texture(u_segmentMask, pos);`;

		injectGLSL(`
uniform ${history ? 'highp' : 'mediump'} sampler2D${history ? 'Array' : ''} u_segmentMask;${
			history
				? `
uniform int u_segmentMaskFrameOffset;`
				: ''
		}
uniform int u_numCategories;

${fn(
	'vec2',
	'segmentAt',
	'vec2 pos',
	`${sampleMask}
	return vec2(mask.r, mask.g);`
)}`);
	};
}

export default segmenter;
