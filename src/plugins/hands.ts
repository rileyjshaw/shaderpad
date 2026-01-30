import ShaderPad, { PluginContext, TextureSource } from '..';
import {
	calculateBoundingBoxCenter,
	generateGLSLFn,
	getSharedFileset,
	hashOptions,
	isMediaPipeSource,
	MediaPipeSource,
} from './mediapipe-common';
import type { HandLandmarker, HandLandmarkerResult, NormalizedLandmark } from '@mediapipe/tasks-vision';

export interface HandsPluginOptions {
	modelPath?: string;
	maxHands?: number;
	minHandDetectionConfidence?: number;
	minHandPresenceConfidence?: number;
	minTrackingConfidence?: number;
	history?: number;
}

const STANDARD_LANDMARK_COUNT = 21; // See https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker#models.
const CUSTOM_LANDMARK_COUNT = 1;
const LANDMARK_COUNT = STANDARD_LANDMARK_COUNT + CUSTOM_LANDMARK_COUNT;
const HAND_CENTER_LANDMARKS = [0, 0, 5, 9, 13, 17] as const; // Wrist + MCP joints, weighted toward wrist.
const LANDMARKS_TEXTURE_WIDTH = 512;
const N_LANDMARK_METADATA_SLOTS = 1;

const DEFAULT_HANDS_OPTIONS: Required<Omit<HandsPluginOptions, 'history'>> = {
	modelPath:
		'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
	maxHands: 2,
	minHandDetectionConfidence: 0.5,
	minHandPresenceConfidence: 0.5,
	minTrackingConfidence: 0.5,
};

interface Detector {
	landmarker: HandLandmarker;
	mediapipeCanvas: OffscreenCanvas;
	subscribers: Map<Function, boolean>;
	maxHands: number;
	state: {
		nCalls: number;
		runningMode: 'IMAGE' | 'VIDEO';
		source: MediaPipeSource | null;
		videoTime: number;
		resultTimestamp: number;
		result: HandLandmarkerResult | null;
		pending: Promise<void>;
		nHands: number;
	};
	landmarks: {
		data: Float32Array;
		textureHeight: number;
	};
}
const sharedDetectors = new Map<string, Detector>();

function updateLandmarksData(
	detector: Detector,
	hands: NormalizedLandmark[][],
	handedness: { categoryName: string }[][]
) {
	const data = detector.landmarks.data;
	const nHands = hands.length;

	data[0] = nHands;

	for (let handIdx = 0; handIdx < nHands; ++handIdx) {
		const landmarks = hands[handIdx];
		const isRightHand = handedness[handIdx]?.[0]?.categoryName === 'Right';
		for (let lmIdx = 0; lmIdx < STANDARD_LANDMARK_COUNT; ++lmIdx) {
			const landmark = landmarks[lmIdx];
			const dataIdx = (N_LANDMARK_METADATA_SLOTS + handIdx * LANDMARK_COUNT + lmIdx) * 4;
			data[dataIdx] = landmark.x;
			data[dataIdx + 1] = 1 - landmark.y;
			data[dataIdx + 2] = landmark.z ?? 0;
			data[dataIdx + 3] = isRightHand ? 1 : 0;
		}

		const handCenter = calculateBoundingBoxCenter(
			data,
			handIdx,
			HAND_CENTER_LANDMARKS,
			LANDMARK_COUNT,
			N_LANDMARK_METADATA_SLOTS
		);
		const handCenterIdx = (N_LANDMARK_METADATA_SLOTS + handIdx * LANDMARK_COUNT + STANDARD_LANDMARK_COUNT) * 4;
		data[handCenterIdx] = handCenter[0];
		data[handCenterIdx + 1] = handCenter[1];
		data[handCenterIdx + 2] = handCenter[2];
		data[handCenterIdx + 3] = isRightHand ? 1 : 0;
	}

	detector.state.nHands = nHands;
}

function hands(config: { textureName: string; options?: HandsPluginOptions }) {
	const { textureName, options: { history, ...mediapipeOptions } = {} } = config;
	const options = { ...DEFAULT_HANDS_OPTIONS, ...mediapipeOptions };
	const optionsKey = hashOptions({ ...options, textureName });

	const nLandmarksMax = options.maxHands * LANDMARK_COUNT + N_LANDMARK_METADATA_SLOTS;
	const textureHeight = Math.ceil(nLandmarksMax / LANDMARKS_TEXTURE_WIDTH);

	return function (shaderPad: ShaderPad, context: PluginContext) {
		const { injectGLSL, emitHook } = context;

		const existingDetector = sharedDetectors.get(optionsKey);
		const landmarksData =
			existingDetector?.landmarks.data ?? new Float32Array(LANDMARKS_TEXTURE_WIDTH * textureHeight * 4);
		let detector: Detector | null = null;
		let destroyed = false;
		let skipHistoryWrite = false;

		function onResult(singleHistoryWriteIndex?: number) {
			if (!detector) return;
			const { nHands } = detector.state;
			const nSlots = nHands * LANDMARK_COUNT + N_LANDMARK_METADATA_SLOTS;
			const rowsToUpdate = Math.ceil(nSlots / LANDMARKS_TEXTURE_WIDTH);
			let historyWriteIndex: number | number[] | undefined = singleHistoryWriteIndex;
			if (typeof historyWriteIndex === 'undefined' && pendingBackfillSlots.length > 0) {
				historyWriteIndex = pendingBackfillSlots;
				pendingBackfillSlots = [];
			}
			shaderPad.updateTextures(
				{
					u_handLandmarksTex: {
						data: detector.landmarks.data,
						width: LANDMARKS_TEXTURE_WIDTH,
						height: rowsToUpdate,
						isPartial: true,
					},
				},
				history ? { skipHistoryWrite, historyWriteIndex } : undefined
			);
			shaderPad.updateUniforms({ u_nHands: nHands });
			emitHook('hands:result', detector.state.result);
		}

		async function initializeDetector() {
			if (sharedDetectors.has(optionsKey)) {
				detector = sharedDetectors.get(optionsKey)!;
			} else {
				const [mediaPipe, { HandLandmarker }] = await Promise.all([
					getSharedFileset(),
					import('@mediapipe/tasks-vision'),
				]);
				if (destroyed) return;
				const mediapipeCanvas = new OffscreenCanvas(1, 1);
				const handLandmarker = await HandLandmarker.createFromOptions(mediaPipe, {
					baseOptions: {
						modelAssetPath: options.modelPath,
						delegate: 'GPU',
					},
					canvas: mediapipeCanvas,
					runningMode: 'VIDEO',
					numHands: options.maxHands,
					minHandDetectionConfidence: options.minHandDetectionConfidence,
					minHandPresenceConfidence: options.minHandPresenceConfidence,
					minTrackingConfidence: options.minTrackingConfidence,
				});
				if (destroyed) {
					handLandmarker.close();
					return;
				}

				detector = {
					landmarker: handLandmarker,
					mediapipeCanvas,
					subscribers: new Map(),
					maxHands: options.maxHands,
					state: {
						nCalls: 0,
						runningMode: 'VIDEO',
						source: null,
						videoTime: -1,
						resultTimestamp: 0,
						result: null,
						pending: Promise.resolve(),
						nHands: 0,
					},
					landmarks: {
						data: landmarksData,
						textureHeight,
					},
				};
				sharedDetectors.set(optionsKey, detector);
			}

			detector.subscribers.set(onResult, false);
		}
		const initPromise = initializeDetector();

		shaderPad.on('init', () => {
			shaderPad.initializeUniform('u_maxHands', 'int', options.maxHands);
			shaderPad.initializeUniform('u_nHands', 'int', 0);
			shaderPad.initializeTexture(
				'u_handLandmarksTex',
				{ data: landmarksData, width: LANDMARKS_TEXTURE_WIDTH, height: textureHeight },
				{ internalFormat: 'RGBA32F', type: 'FLOAT', minFilter: 'NEAREST', magFilter: 'NEAREST', history }
			);
			initPromise.then(() => {
				if (destroyed || !detector) return;
				emitHook('hands:ready');
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
				detectHands(source);
			}
		});

		shaderPad.on(
			'updateTextures',
			(updates: Record<string, TextureSource>, options?: { skipHistoryWrite?: boolean }) => {
				const source = updates[textureName];
				if (isMediaPipeSource(source)) {
					skipHistoryWrite = options?.skipHistoryWrite ?? false;
					if (!skipHistoryWrite) writeToHistory();
					detectHands(source);
				}
			}
		);

		async function detectHands(source: MediaPipeSource) {
			const now = performance.now();
			await initPromise;
			if (!detector) return;
			const callOrder = ++detector.state.nCalls;

			detector.state.pending = detector.state.pending.then(async () => {
				if (!detector || callOrder !== detector.state.nCalls) return;

				const requiredMode = source instanceof HTMLVideoElement ? 'VIDEO' : 'IMAGE';
				if (detector.state.runningMode !== requiredMode) {
					detector.state.runningMode = requiredMode;
					await detector.landmarker.setOptions({ runningMode: requiredMode });
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
					let result: HandLandmarkerResult | undefined;
					if (source instanceof HTMLVideoElement) {
						if (source.videoWidth === 0 || source.videoHeight === 0 || source.readyState < 2) return;
						result = detector.landmarker.detectForVideo(source, now);
					} else {
						if (source.width === 0 || source.height === 0) return;
						result = detector.landmarker.detect(source);
					}

					if (result) {
						detector.state.resultTimestamp = now;
						detector.state.result = result;
						updateLandmarksData(detector, result.landmarks, result.handedness);
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
				}
			});

			await detector.state.pending;
		}

		shaderPad.on('destroy', () => {
			destroyed = true;
			if (detector) {
				detector.subscribers.delete(onResult);
				if (detector.subscribers.size === 0) {
					detector.landmarker.close();
					sharedDetectors.delete(optionsKey);
				}
			}
			detector = null;
		});

		const { fn, historyParams } = generateGLSLFn(history);

		injectGLSL(`
uniform int u_maxHands;
uniform int u_nHands;
uniform highp sampler2D${history ? 'Array' : ''} u_handLandmarksTex;${
			history
				? `
uniform int u_handLandmarksTexFrameOffset;`
				: ''
		}

${fn(
	'int',
	'nHandsAt',
	'',
	history
		? `
	int layer = (u_handLandmarksTexFrameOffset - framesAgo + ${history + 1}) % ${history + 1};
	return int(texelFetch(u_handLandmarksTex, ivec3(0, 0, layer), 0).r + 0.5);`
		: `
	return int(texelFetch(u_handLandmarksTex, ivec2(0, 0), 0).r + 0.5);`
)}
${fn(
	'vec4',
	'handLandmark',
	'int handIndex, int landmarkIndex',
	`int i = ${N_LANDMARK_METADATA_SLOTS} + handIndex * ${LANDMARK_COUNT} + landmarkIndex;
	int x = i % ${LANDMARKS_TEXTURE_WIDTH};
	int y = i / ${LANDMARKS_TEXTURE_WIDTH};${
		history
			? `
	int layer = (u_handLandmarksTexFrameOffset - framesAgo + ${history + 1}) % ${history + 1};
	return texelFetch(u_handLandmarksTex, ivec3(x, y, layer), 0);`
			: `
	return texelFetch(u_handLandmarksTex, ivec2(x, y), 0);`
	}`
)}
${fn('float', 'isRightHand', 'int handIndex', `return handLandmark(handIndex, 0${historyParams}).w;`)}
${fn('float', 'isLeftHand', 'int handIndex', `return 1.0 - handLandmark(handIndex, 0${historyParams}).w;`)}`);
	};
}

export default hands;
