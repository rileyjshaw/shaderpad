import ShaderPad, { PluginContext, TextureSource } from '..';
import {
	calculateBoundingBoxCenter,
	generateGLSLFn,
	dummyTexture,
	getSharedFileset,
	hashOptions,
	isMediaPipeSource,
	MediaPipeSource,
} from './mediapipe-common';
import type { PoseLandmarker, PoseLandmarkerResult, NormalizedLandmark, MPMask } from '@mediapipe/tasks-vision';

export interface PosePluginOptions {
	modelPath?: string;
	maxPoses?: number;
	minPoseDetectionConfidence?: number;
	minPosePresenceConfidence?: number;
	minTrackingConfidence?: number;
	history?: number;
}

const STANDARD_LANDMARK_COUNT = 33; // See https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker#pose_landmarker_model.
const CUSTOM_LANDMARK_COUNT = 6;
const LANDMARK_COUNT = STANDARD_LANDMARK_COUNT + CUSTOM_LANDMARK_COUNT;
const LANDMARK_INDICES = {
	// Standard landmarks.
	LEFT_EYE: 2,
	RIGHT_EYE: 5,
	LEFT_SHOULDER: 11,
	RIGHT_SHOULDER: 12,
	LEFT_ELBOW: 13,
	RIGHT_ELBOW: 14,
	LEFT_HIP: 23,
	RIGHT_HIP: 24,
	LEFT_KNEE: 25,
	RIGHT_KNEE: 26,
	LEFT_WRIST: 15,
	RIGHT_WRIST: 16,
	LEFT_PINKY: 17,
	RIGHT_PINKY: 18,
	LEFT_INDEX: 19,
	RIGHT_INDEX: 20,
	LEFT_THUMB: 21,
	RIGHT_THUMB: 22,
	LEFT_ANKLE: 27,
	RIGHT_ANKLE: 28,
	LEFT_HEEL: 29,
	RIGHT_HEEL: 30,
	LEFT_FOOT_INDEX: 31,
	RIGHT_FOOT_INDEX: 32,
	// Custom landmarks.
	BODY_CENTER: STANDARD_LANDMARK_COUNT,
	LEFT_HAND_CENTER: STANDARD_LANDMARK_COUNT + 1,
	RIGHT_HAND_CENTER: STANDARD_LANDMARK_COUNT + 2,
	LEFT_FOOT_CENTER: STANDARD_LANDMARK_COUNT + 3,
	RIGHT_FOOT_CENTER: STANDARD_LANDMARK_COUNT + 4,
	TORSO_CENTER: STANDARD_LANDMARK_COUNT + 5,
};
const ALL_STANDARD_INDICES = Array.from({ length: STANDARD_LANDMARK_COUNT }, (_, i) => i);
const LEFT_HAND_INDICES = [
	LANDMARK_INDICES.LEFT_WRIST,
	LANDMARK_INDICES.LEFT_PINKY,
	LANDMARK_INDICES.LEFT_THUMB,
	LANDMARK_INDICES.LEFT_INDEX,
];
const RIGHT_HAND_INDICES = [
	LANDMARK_INDICES.RIGHT_WRIST,
	LANDMARK_INDICES.RIGHT_PINKY,
	LANDMARK_INDICES.RIGHT_THUMB,
	LANDMARK_INDICES.RIGHT_INDEX,
];
const LEFT_FOOT_INDICES = [LANDMARK_INDICES.LEFT_ANKLE, LANDMARK_INDICES.LEFT_HEEL, LANDMARK_INDICES.LEFT_FOOT_INDEX];
const RIGHT_FOOT_INDICES = [
	LANDMARK_INDICES.RIGHT_ANKLE,
	LANDMARK_INDICES.RIGHT_HEEL,
	LANDMARK_INDICES.RIGHT_FOOT_INDEX,
];
const TORSO_INDICES = [
	LANDMARK_INDICES.LEFT_SHOULDER,
	LANDMARK_INDICES.RIGHT_SHOULDER,
	LANDMARK_INDICES.LEFT_HIP,
	LANDMARK_INDICES.RIGHT_HIP,
];

const LANDMARKS_TEXTURE_WIDTH = 512;
const N_LANDMARK_METADATA_SLOTS = 1;

const DEFAULT_POSE_OPTIONS: Required<Omit<PosePluginOptions, 'history'>> = {
	modelPath:
		'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
	maxPoses: 1,
	minPoseDetectionConfidence: 0.5,
	minPosePresenceConfidence: 0.5,
	minTrackingConfidence: 0.5,
};

interface Detector {
	landmarker: PoseLandmarker;
	canvas: OffscreenCanvas;
	subscribers: Map<() => void, boolean>;
	maxPoses: number;
	state: {
		runningMode: 'IMAGE' | 'VIDEO';
		source: MediaPipeSource | null;
		videoTime: number;
		resultTimestamp: number;
		result: PoseLandmarkerResult | null;
		pending: Promise<void>;
		nPoses: number;
	};
	landmarks: {
		data: Float32Array;
		textureHeight: number;
	};
	mask: {
		shader: ShaderPad;
	};
}
const sharedDetectors = new Map<string, Detector>();

function updateLandmarksData(detector: Detector, poses: NormalizedLandmark[][]) {
	const data = detector.landmarks.data;
	const nPoses = poses.length;

	data[0] = nPoses;

	for (let poseIdx = 0; poseIdx < nPoses; ++poseIdx) {
		const landmarks = poses[poseIdx];
		for (let lmIdx = 0; lmIdx < STANDARD_LANDMARK_COUNT; ++lmIdx) {
			const landmark = landmarks[lmIdx];
			const dataIdx = (N_LANDMARK_METADATA_SLOTS + poseIdx * LANDMARK_COUNT + lmIdx) * 4;
			data[dataIdx] = landmark.x;
			data[dataIdx + 1] = 1 - landmark.y;
			data[dataIdx + 2] = landmark.z ?? 0;
			data[dataIdx + 3] = landmark.visibility ?? 1;
		}

		const bodyCenter = calculateBoundingBoxCenter(data, poseIdx, ALL_STANDARD_INDICES, LANDMARK_COUNT, N_LANDMARK_METADATA_SLOTS);
		const bodyCenterIdx = (N_LANDMARK_METADATA_SLOTS + poseIdx * LANDMARK_COUNT + LANDMARK_INDICES.BODY_CENTER) * 4;
		data[bodyCenterIdx] = bodyCenter[0];
		data[bodyCenterIdx + 1] = bodyCenter[1];
		data[bodyCenterIdx + 2] = bodyCenter[2];
		data[bodyCenterIdx + 3] = bodyCenter[3];

		const leftHandCenter = calculateBoundingBoxCenter(data, poseIdx, LEFT_HAND_INDICES, LANDMARK_COUNT, N_LANDMARK_METADATA_SLOTS);
		const leftHandCenterIdx = (N_LANDMARK_METADATA_SLOTS + poseIdx * LANDMARK_COUNT + LANDMARK_INDICES.LEFT_HAND_CENTER) * 4;
		data[leftHandCenterIdx] = leftHandCenter[0];
		data[leftHandCenterIdx + 1] = leftHandCenter[1];
		data[leftHandCenterIdx + 2] = leftHandCenter[2];
		data[leftHandCenterIdx + 3] = leftHandCenter[3];

		const rightHandCenter = calculateBoundingBoxCenter(data, poseIdx, RIGHT_HAND_INDICES, LANDMARK_COUNT, N_LANDMARK_METADATA_SLOTS);
		const rightHandCenterIdx = (N_LANDMARK_METADATA_SLOTS + poseIdx * LANDMARK_COUNT + LANDMARK_INDICES.RIGHT_HAND_CENTER) * 4;
		data[rightHandCenterIdx] = rightHandCenter[0];
		data[rightHandCenterIdx + 1] = rightHandCenter[1];
		data[rightHandCenterIdx + 2] = rightHandCenter[2];
		data[rightHandCenterIdx + 3] = rightHandCenter[3];

		const leftFootCenter = calculateBoundingBoxCenter(data, poseIdx, LEFT_FOOT_INDICES, LANDMARK_COUNT, N_LANDMARK_METADATA_SLOTS);
		const leftFootCenterIdx = (N_LANDMARK_METADATA_SLOTS + poseIdx * LANDMARK_COUNT + LANDMARK_INDICES.LEFT_FOOT_CENTER) * 4;
		data[leftFootCenterIdx] = leftFootCenter[0];
		data[leftFootCenterIdx + 1] = leftFootCenter[1];
		data[leftFootCenterIdx + 2] = leftFootCenter[2];
		data[leftFootCenterIdx + 3] = leftFootCenter[3];

		const rightFootCenter = calculateBoundingBoxCenter(data, poseIdx, RIGHT_FOOT_INDICES, LANDMARK_COUNT, N_LANDMARK_METADATA_SLOTS);
		const rightFootCenterIdx = (N_LANDMARK_METADATA_SLOTS + poseIdx * LANDMARK_COUNT + LANDMARK_INDICES.RIGHT_FOOT_CENTER) * 4;
		data[rightFootCenterIdx] = rightFootCenter[0];
		data[rightFootCenterIdx + 1] = rightFootCenter[1];
		data[rightFootCenterIdx + 2] = rightFootCenter[2];
		data[rightFootCenterIdx + 3] = rightFootCenter[3];

		const torsoCenter = calculateBoundingBoxCenter(data, poseIdx, TORSO_INDICES, LANDMARK_COUNT, N_LANDMARK_METADATA_SLOTS);
		const torsoCenterIdx = (N_LANDMARK_METADATA_SLOTS + poseIdx * LANDMARK_COUNT + LANDMARK_INDICES.TORSO_CENTER) * 4;
		data[torsoCenterIdx] = torsoCenter[0];
		data[torsoCenterIdx + 1] = torsoCenter[1];
		data[torsoCenterIdx + 2] = torsoCenter[2];
		data[torsoCenterIdx + 3] = torsoCenter[3];
	}

	detector.state.nPoses = nPoses;
}

function updateMaskCanvas(detector: Detector, segmentationMasks?: MPMask[]) {
	if (!segmentationMasks || segmentationMasks.length === 0) return;
	const {
		mask: { shader },
		maxPoses,
	} = detector;

	for (let i = 0; i < segmentationMasks.length; ++i) {
		const segMask = segmentationMasks[i];
		shader.updateTextures({ u_mask: segMask.getAsWebGLTexture() });
		shader.updateUniforms({ u_poseIndex: (i + 1) / maxPoses });
		shader.draw({ skipClear: i > 0 });
		segMask.close();
	}
}

function pose(config: { textureName: string; options?: PosePluginOptions }) {
	const { textureName, options: { history, ...mediapipeOptions } = {} } = config;
	const options = { ...DEFAULT_POSE_OPTIONS, ...mediapipeOptions };
	const optionsKey = hashOptions({ ...options, textureName });

	const nLandmarksMax = options.maxPoses * LANDMARK_COUNT + N_LANDMARK_METADATA_SLOTS;
	const textureHeight = Math.ceil(nLandmarksMax / LANDMARKS_TEXTURE_WIDTH);

	return function (shaderPad: ShaderPad, context: PluginContext) {
		const { injectGLSL, gl, emitHook } = context;

		const existingDetector = sharedDetectors.get(optionsKey);
		const landmarksData =
			existingDetector?.landmarks.data ?? new Float32Array(LANDMARKS_TEXTURE_WIDTH * textureHeight * 4);
		const sharedCanvas = existingDetector?.canvas ?? new OffscreenCanvas(1, 1);
		let detector: Detector | null = null;
		let skipHistoryWrite = false;

		function onResult() {
			if (!detector) return;
			const { nPoses } = detector.state;
			const nSlots = nPoses * LANDMARK_COUNT + N_LANDMARK_METADATA_SLOTS;
			const rowsToUpdate = Math.ceil(nSlots / LANDMARKS_TEXTURE_WIDTH);
			shaderPad.updateTextures(
				{
					u_poseLandmarksTex: {
						data: detector.landmarks.data,
						width: LANDMARKS_TEXTURE_WIDTH,
						height: rowsToUpdate,
						isPartial: true,
					},
					u_poseMask: detector.canvas,
				},
				{ skipHistoryWrite }
			);
			shaderPad.updateUniforms({ u_nPoses: nPoses });
			emitHook('pose:result', detector.state.result);
		}

		async function initializeDetector() {
			if (sharedDetectors.has(optionsKey)) {
				detector = sharedDetectors.get(optionsKey)!;
			} else {
				const [mediaPipe, { PoseLandmarker }] = await Promise.all([
					getSharedFileset(),
					import('@mediapipe/tasks-vision'),
				]);
				const poseLandmarker = await PoseLandmarker.createFromOptions(mediaPipe, {
					baseOptions: {
						modelAssetPath: options.modelPath,
						delegate: 'GPU',
					},
					canvas: sharedCanvas,
					runningMode: 'VIDEO',
					numPoses: options.maxPoses,
					minPoseDetectionConfidence: options.minPoseDetectionConfidence,
					minPosePresenceConfidence: options.minPosePresenceConfidence,
					minTrackingConfidence: options.minTrackingConfidence,
					outputSegmentationMasks: true,
				});

				const maskShader = new ShaderPad(
					`#version 300 es
	precision mediump float;
	in vec2 v_uv;
	out vec4 outColor;
	uniform sampler2D u_mask;
	uniform float u_poseIndex;
	void main() {
		ivec2 texCoord = ivec2(v_uv * vec2(textureSize(u_mask, 0)));
		float confidence = texelFetch(u_mask, texCoord, 0).r;
		if (confidence < 0.01) discard;
		outColor = vec4(1.0, confidence, u_poseIndex, 1.0);
	}`,
					{ canvas: sharedCanvas }
				);
				maskShader.initializeTexture('u_mask', dummyTexture);
				maskShader.initializeUniform('u_poseIndex', 'float', 0);

				detector = {
					landmarker: poseLandmarker,
					canvas: sharedCanvas,
					subscribers: new Map(),
					maxPoses: options.maxPoses,
					state: {
						runningMode: 'VIDEO',
						source: null,
						videoTime: -1,
						resultTimestamp: 0,
						result: null,
						pending: Promise.resolve(),
						nPoses: 0,
					},
					landmarks: {
						data: landmarksData,
						textureHeight,
					},
					mask: {
						shader: maskShader,
					},
				};
				sharedDetectors.set(optionsKey, detector);
			}

			detector.subscribers.set(onResult, false);
		}
		const initPromise = initializeDetector();

		shaderPad.on('init', () => {
			shaderPad.initializeUniform('u_maxPoses', 'int', options.maxPoses);
			shaderPad.initializeUniform('u_nPoses', 'int', 0);
			shaderPad.initializeTexture(
				'u_poseLandmarksTex',
				{ data: landmarksData, width: LANDMARKS_TEXTURE_WIDTH, height: textureHeight },
				{ internalFormat: gl.RGBA32F, type: gl.FLOAT, minFilter: gl.NEAREST, magFilter: gl.NEAREST, history }
			);
			shaderPad.initializeTexture('u_poseMask', sharedCanvas, {
				preserveY: true,
				minFilter: gl.NEAREST,
				magFilter: gl.NEAREST,
				history,
			});
			initPromise.then(() => emitHook('pose:ready'));
		});

		shaderPad.on('initializeTexture', (name: string, source: TextureSource) => {
			if (name === textureName && isMediaPipeSource(source)) detectPoses(source);
		});

		shaderPad.on(
			'updateTextures',
			(updates: Record<string, TextureSource>, options?: { skipHistoryWrite?: boolean }) => {
				const source = updates[textureName];
				if (isMediaPipeSource(source)) {
					skipHistoryWrite = options?.skipHistoryWrite ?? false;
					detectPoses(source);
				}
			}
		);

		let nDetectionCalls = 0;
		async function detectPoses(source: MediaPipeSource) {
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
					let result: PoseLandmarkerResult | undefined;
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
						updateLandmarksData(detector, result.landmarks);
						updateMaskCanvas(detector, result.segmentationMasks);
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
					detector.mask.shader?.destroy();
					sharedDetectors.delete(optionsKey);
				}
			}
			detector = null;
		});

		const { fn, historyParams } = generateGLSLFn(history);
		const sampleMask = history
			? `int layer = (u_poseMaskFrameOffset - framesAgo + ${history}) % ${history};
	vec4 mask = texture(u_poseMask, vec3(pos, float(layer)));`
			: `vec4 mask = texture(u_poseMask, pos);`;

		injectGLSL(`
uniform int u_maxPoses;
uniform int u_nPoses;
uniform highp sampler2D${history ? 'Array' : ''} u_poseLandmarksTex;${
			history
				? `
uniform int u_poseLandmarksTexFrameOffset;`
				: ''
		}
uniform sampler2D${history ? 'Array' : ''} u_poseMask;${
			history
				? `
uniform int u_poseMaskFrameOffset;`
				: ''
		}

#define POSE_LANDMARK_LEFT_EYE ${LANDMARK_INDICES.LEFT_EYE}
#define POSE_LANDMARK_RIGHT_EYE ${LANDMARK_INDICES.RIGHT_EYE}
#define POSE_LANDMARK_LEFT_SHOULDER ${LANDMARK_INDICES.LEFT_SHOULDER}
#define POSE_LANDMARK_RIGHT_SHOULDER ${LANDMARK_INDICES.RIGHT_SHOULDER}
#define POSE_LANDMARK_LEFT_ELBOW ${LANDMARK_INDICES.LEFT_ELBOW}
#define POSE_LANDMARK_RIGHT_ELBOW ${LANDMARK_INDICES.RIGHT_ELBOW}
#define POSE_LANDMARK_LEFT_HIP ${LANDMARK_INDICES.LEFT_HIP}
#define POSE_LANDMARK_RIGHT_HIP ${LANDMARK_INDICES.RIGHT_HIP}
#define POSE_LANDMARK_LEFT_KNEE ${LANDMARK_INDICES.LEFT_KNEE}
#define POSE_LANDMARK_RIGHT_KNEE ${LANDMARK_INDICES.RIGHT_KNEE}
#define POSE_LANDMARK_BODY_CENTER ${LANDMARK_INDICES.BODY_CENTER}
#define POSE_LANDMARK_LEFT_HAND_CENTER ${LANDMARK_INDICES.LEFT_HAND_CENTER}
#define POSE_LANDMARK_RIGHT_HAND_CENTER ${LANDMARK_INDICES.RIGHT_HAND_CENTER}
#define POSE_LANDMARK_LEFT_FOOT_CENTER ${LANDMARK_INDICES.LEFT_FOOT_CENTER}
#define POSE_LANDMARK_RIGHT_FOOT_CENTER ${LANDMARK_INDICES.RIGHT_FOOT_CENTER}
#define POSE_LANDMARK_TORSO_CENTER ${LANDMARK_INDICES.TORSO_CENTER}

${fn(
	'int',
	'nPosesAt',
	'',
	history
		? `
	int layer = (u_poseLandmarksTexFrameOffset - framesAgo + ${history}) % ${history};
	return int(texelFetch(u_poseLandmarksTex, ivec3(0, 0, layer), 0).r + 0.5);`
		: `
	return int(texelFetch(u_poseLandmarksTex, ivec2(0, 0), 0).r + 0.5);`
)}
${fn(
	'vec4',
	'poseLandmark',
	'int poseIndex, int landmarkIndex',
	`int i = ${N_LANDMARK_METADATA_SLOTS} + poseIndex * ${LANDMARK_COUNT} + landmarkIndex;
	int x = i % ${LANDMARKS_TEXTURE_WIDTH};
	int y = i / ${LANDMARKS_TEXTURE_WIDTH};${
		history
			? `
	int layer = (u_poseLandmarksTexFrameOffset - framesAgo + ${history}) % ${history};
	return texelFetch(u_poseLandmarksTex, ivec3(x, y, layer), 0);`
			: `
	return texelFetch(u_poseLandmarksTex, ivec2(x, y), 0);`
	}`
)}
${fn(
	'vec2',
	'poseAt',
	'vec2 pos',
	`${sampleMask}
	float poseIndex = floor(mask.b * float(u_maxPoses) + 0.5) - 1.0;
	return vec2(mask.g, poseIndex);`
)}
${fn('float', 'inPose', 'vec2 pos', `return step(0.0, poseAt(pos${historyParams}).x);`)}`);
	};
}

export default pose;
