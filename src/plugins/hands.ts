import ShaderPad, { PluginContext, TextureSource } from '..';
import {
	calculateBoundingBoxCenter,
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
}

const STANDARD_LANDMARK_COUNT = 21; // See https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker#models.
const CUSTOM_LANDMARK_COUNT = 1;
const LANDMARK_COUNT = STANDARD_LANDMARK_COUNT + CUSTOM_LANDMARK_COUNT;
const HAND_CENTER_LANDMARKS = [0, 0, 5, 9, 13, 17] as const; // Wrist + MCP joints, weighted toward wrist.
const LANDMARKS_TEXTURE_WIDTH = 512;

const DEFAULT_HANDS_OPTIONS: Required<HandsPluginOptions> = {
	modelPath:
		'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
	maxHands: 2,
	minHandDetectionConfidence: 0.5,
	minHandPresenceConfidence: 0.5,
	minTrackingConfidence: 0.5,
};

interface Detector {
	landmarker: HandLandmarker;
	canvas: OffscreenCanvas;
	subscribers: Map<() => void, boolean>;
	state: {
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

	for (let handIdx = 0; handIdx < nHands; ++handIdx) {
		const landmarks = hands[handIdx];
		const isRightHand = handedness[handIdx]?.[0]?.categoryName === 'Right';
		for (let lmIdx = 0; lmIdx < STANDARD_LANDMARK_COUNT; ++lmIdx) {
			const landmark = landmarks[lmIdx];
			const dataIdx = (handIdx * LANDMARK_COUNT + lmIdx) * 4;
			data[dataIdx] = landmark.x;
			data[dataIdx + 1] = 1 - landmark.y;
			data[dataIdx + 2] = landmark.z ?? 0;
			data[dataIdx + 3] = isRightHand ? 1 : 0;
		}

		const handCenter = calculateBoundingBoxCenter(data, handIdx, HAND_CENTER_LANDMARKS, LANDMARK_COUNT);
		const handCenterIdx = (handIdx * LANDMARK_COUNT + STANDARD_LANDMARK_COUNT) * 4;
		data[handCenterIdx] = handCenter[0];
		data[handCenterIdx + 1] = handCenter[1];
		data[handCenterIdx + 2] = handCenter[2];
		data[handCenterIdx + 3] = isRightHand ? 1 : 0;
	}

	detector.state.nHands = nHands;
}

function hands(config: { textureName: string; options?: HandsPluginOptions }) {
	const { textureName, options: configOptions = {} } = config;
	const options = { ...DEFAULT_HANDS_OPTIONS, ...configOptions };
	const optionsKey = hashOptions({ ...options, textureName });

	const nLandmarksMax = options.maxHands * LANDMARK_COUNT;
	const textureHeight = Math.ceil(nLandmarksMax / LANDMARKS_TEXTURE_WIDTH);

	return function (shaderPad: ShaderPad, context: PluginContext) {
		const { injectGLSL, gl, emitHook } = context;

		const existingDetector = sharedDetectors.get(optionsKey);
		const landmarksData =
			existingDetector?.landmarks.data ?? new Float32Array(LANDMARKS_TEXTURE_WIDTH * textureHeight * 4);
		let detector: Detector | null = null;

		function onResult() {
			if (!detector) return;
			const { nHands } = detector.state;
			const nLandmarks = nHands * LANDMARK_COUNT;
			const rowsToUpdate = Math.ceil(nLandmarks / LANDMARKS_TEXTURE_WIDTH);
			shaderPad.updateTextures({
				u_handLandmarksTex: {
					data: detector.landmarks.data,
					width: LANDMARKS_TEXTURE_WIDTH,
					height: rowsToUpdate,
					isPartial: nHands !== options.maxHands,
				},
			});
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

				detector = {
					landmarker: handLandmarker,
					canvas: mediapipeCanvas,
					subscribers: new Map(),
					state: {
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
				{ internalFormat: gl.RGBA32F, type: gl.FLOAT, minFilter: gl.NEAREST, magFilter: gl.NEAREST }
			);
			initPromise.then(() => emitHook('hands:ready'));
		});

		shaderPad.on('initializeTexture', (name: string, source: TextureSource) => {
			if (name === textureName && isMediaPipeSource(source)) detectHands(source);
		});

		shaderPad.on('updateTextures', (updates: Record<string, TextureSource>) => {
			const source = updates[textureName];
			if (isMediaPipeSource(source)) detectHands(source);
		});

		let nDetectionCalls = 0;
		async function detectHands(source: MediaPipeSource) {
			const now = performance.now();
			const callOrder = ++nDetectionCalls;
			await initPromise;
			if (!detector) return;

			detector.state.pending = detector.state.pending.then(async () => {
				if (callOrder !== nDetectionCalls || !detector) return;

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
				} else if (detector.state.result && !detector.subscribers.get(onResult)) {
					onResult();
					detector.subscribers.set(onResult, true);
				}
			});

			await detector.state.pending;
		}

		shaderPad.on('destroy', () => {
			if (detector) {
				detector.subscribers.delete(onResult);
				if (detector.subscribers.size === 0) {
					detector.landmarker.close();
					sharedDetectors.delete(optionsKey);
				}
			}
			detector = null;
		});

		injectGLSL(`
uniform int u_maxHands;
uniform int u_nHands;
uniform sampler2D u_handLandmarksTex;

vec4 handLandmark(int handIndex, int landmarkIndex) {
	int i = handIndex * ${LANDMARK_COUNT} + landmarkIndex;
	int x = i % ${LANDMARKS_TEXTURE_WIDTH};
	int y = i / ${LANDMARKS_TEXTURE_WIDTH};
	return texelFetch(u_handLandmarksTex, ivec2(x, y), 0);
}

float isRightHand(int handIndex) {
	return handLandmark(handIndex, 0).w;
}

float isLeftHand(int handIndex) {
	return 1.0 - handLandmark(handIndex, 0).w;
}`);
	};
}

export default hands;
