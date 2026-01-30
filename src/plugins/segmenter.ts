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
	outputCategoryMask?: boolean;
	history?: number;
}

const DEFAULT_SEGMENTER_OPTIONS: Required<Omit<SegmenterPluginOptions, 'history'>> = {
	modelPath:
		'https://storage.googleapis.com/mediapipe-models/image_segmenter/hair_segmenter/float32/latest/hair_segmenter.tflite',
	outputCategoryMask: false,
};

function createMaskShaderSource(numMasks: number): string {
	const uniforms = Array.from({ length: numMasks }, (_, i) => `uniform mediump sampler2D u_confidenceMask${i};`).join(
		'\n'
	);

	const sampleByIndex = Array.from(
		{ length: numMasks },
		(_, i) => `\t\t${i > 0 ? 'else ' : ''}if (i == ${i}) c = texelFetch(u_confidenceMask${i}, texCoord, 0).r;`
	).join('\n');

	return `#version 300 es
precision mediump float;
in vec2 v_uv;
out vec4 outColor;
${uniforms}

void main() {
	ivec2 texCoord = ivec2(vec2(v_uv.x, 1.0 - v_uv.y) * vec2(textureSize(u_confidenceMask0, 0)));
	float maxConfidence = 0.0;
	int maxIndex = 0;

	for (int i = 0; i < ${numMasks}; ++i) {
		float c = 0.0;
${sampleByIndex}
		if (c > maxConfidence) {
			maxConfidence = c;
			maxIndex = i;
		}
	}

	// Normalize index: 0 = background, 1/(n-1) to 1 for foreground categories.
	float normalizedIndex = float(maxIndex) / float(max(1, ${numMasks - 1}));
	outColor = vec4(normalizedIndex, maxConfidence, 0.0, 1.0);
}`;
}

interface SharedDetector {
	segmenter: ImageSegmenter;
	mediapipeCanvas: OffscreenCanvas;
	maskShader: ShaderPad;
	subscribers: Map<Function, boolean>;
	state: {
		nCalls: number;
		runningMode: 'IMAGE' | 'VIDEO';
		source: MediaPipeSource | null;
		videoTime: number;
		resultTimestamp: number;
		result: ImageSegmenterResult | null;
		pending: Promise<void>;
	};
	labels: string[];
	numCategories: number;
}
const sharedDetectors = new Map<string, SharedDetector>();

function updateMask(detector: SharedDetector, confidenceMasks: MPMask[]) {
	const { maskShader } = detector;

	const textures: Record<string, WebGLTexture> = {};
	for (let i = 0; i < confidenceMasks.length; ++i) {
		textures[`u_confidenceMask${i}`] = confidenceMasks[i].getAsWebGLTexture();
	}
	maskShader.updateTextures(textures);
	maskShader.step();
	confidenceMasks.forEach(m => m.close());
}

function segmenter(config: { textureName: string; options?: SegmenterPluginOptions }) {
	const { textureName, options: { history, ...mediapipeOptions } = {} } = config;
	const options = { ...DEFAULT_SEGMENTER_OPTIONS, ...mediapipeOptions };
	const optionsKey = hashOptions({ ...options, textureName });

	return function (shaderPad: ShaderPad, context: PluginContext) {
		const { injectGLSL, emitHook } = context;

		const existingDetector = sharedDetectors.get(optionsKey);
		const mediapipeCanvas = existingDetector?.mediapipeCanvas ?? new OffscreenCanvas(1, 1);
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
				{ u_segmentMask: detector.maskShader },
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
				// Single shared canvas for MediaPipe and maskShader (same WebGL context required
				// because maskShader uses textures from MediaPipe via getAsWebGLTexture).
				const imageSegmenter = await ImageSegmenter.createFromOptions(mediaPipe, {
					baseOptions: {
						modelAssetPath: options.modelPath,
						delegate: 'GPU',
					},
					canvas: mediapipeCanvas,
					runningMode: 'VIDEO',
					outputCategoryMask: options.outputCategoryMask,
					outputConfidenceMasks: true,
				});
				if (destroyed) {
					imageSegmenter.close();
					return;
				}

				const labels = imageSegmenter.getLabels();
				const numCategories = labels.length || 1;

				const maskShader = new ShaderPad(createMaskShaderSource(numCategories), { canvas: mediapipeCanvas });
				for (let i = 0; i < numCategories; ++i) {
					maskShader.initializeTexture(`u_confidenceMask${i}`, dummyTexture);
				}

				detector = {
					segmenter: imageSegmenter,
					mediapipeCanvas,
					maskShader,
					subscribers: new Map(),
					state: {
						nCalls: 0,
						runningMode: 'VIDEO',
						source: null,
						videoTime: -1,
						resultTimestamp: 0,
						result: null,
						pending: Promise.resolve(),
					},
					labels,
					numCategories,
				};
				sharedDetectors.set(optionsKey, detector);
			}

			detector!.subscribers.set(onResult, false);
		}
		const initPromise = initializeDetector();

		shaderPad.on('init', () => {
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
						if (result.confidenceMasks && result.confidenceMasks.length > 0) {
							updateMask(detector, result.confidenceMasks);
						} else {
							detector.maskShader.clear();
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
					detector.maskShader.destroy();
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
