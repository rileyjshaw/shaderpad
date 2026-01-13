import ShaderPad, { PluginContext, TextureSource } from '../index';
import type { PoseLandmarker, PoseLandmarkerResult, NormalizedLandmark, MPMask } from '@mediapipe/tasks-vision';

export interface PosePluginOptions {
	modelPath?: string;
	maxPoses?: number;
	minPoseDetectionConfidence?: number;
	minPosePresenceConfidence?: number;
	minTrackingConfidence?: number;
	onReady?: () => void;
	onResults?: (results: PoseLandmarkerResult) => void;
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

const dummyTexture = { data: new Uint8Array(4), width: 1, height: 1 };
function pose(config: { textureName: string; options?: PosePluginOptions }) {
	const { textureName, options } = config;
	const defaultModelPath =
		'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

	return function (shaderPad: ShaderPad, context: PluginContext) {
		const { injectGLSL, gl } = context;

		let poseLandmarker: PoseLandmarker | null = null;
		let vision: any = null;
		let lastVideoTime = -1;
		let runningMode: 'IMAGE' | 'VIDEO' = 'VIDEO';
		const textureSources = new Map<string, TextureSource>();
		const maxPoses = options?.maxPoses ?? 1;

		const LANDMARKS_TEXTURE_WIDTH = 512;
		let landmarksTextureHeight = 0;
		let landmarksDataArray: Float32Array | null = null;

		// Shared canvas for MediaPipe and maskShader (same WebGL context).
		const sharedCanvas = new OffscreenCanvas(1, 1);
		let maskShader: ShaderPad | null = null;

		async function initializePoseLandmarker() {
			try {
				const { FilesetResolver, PoseLandmarker } = await import('@mediapipe/tasks-vision');
				vision = await FilesetResolver.forVisionTasks(
					'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
				);
				poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
					baseOptions: {
						modelAssetPath: options?.modelPath || defaultModelPath,
						delegate: 'GPU',
					},
					canvas: sharedCanvas,
					runningMode,
					numPoses: options?.maxPoses ?? 1,
					minPoseDetectionConfidence: options?.minPoseDetectionConfidence ?? 0.5,
					minPosePresenceConfidence: options?.minPosePresenceConfidence ?? 0.5,
					minTrackingConfidence: options?.minTrackingConfidence ?? 0.5,
					outputSegmentationMasks: true,
				});
			} catch (error) {
				console.error('[Pose Plugin] Failed to initialize:', error);
				throw error;
			}
		}

		function calculateBoundingBoxCenter(
			landmarksDataArray: Float32Array,
			poseIdx: number,
			landmarkIndices: number[]
		): [number, number, number, number] {
			let minX = Infinity,
				maxX = -Infinity,
				minY = Infinity,
				maxY = -Infinity,
				avgZ = 0,
				avgVisibility = 0;

			for (const idx of landmarkIndices) {
				const dataIdx = (poseIdx * LANDMARK_COUNT + idx) * 4;
				const x = landmarksDataArray[dataIdx];
				const y = landmarksDataArray[dataIdx + 1];
				minX = Math.min(minX, x);
				maxX = Math.max(maxX, x);
				minY = Math.min(minY, y);
				maxY = Math.max(maxY, y);
				avgZ += landmarksDataArray[dataIdx + 2];
				avgVisibility += landmarksDataArray[dataIdx + 3];
			}

			const centerX = (minX + maxX) / 2;
			const centerY = (minY + maxY) / 2;
			const centerZ = avgZ / landmarkIndices.length;
			const centerVisibility = avgVisibility / landmarkIndices.length;
			return [centerX, centerY, centerZ, centerVisibility];
		}

		function updateMaskTexture(segmentationMasks?: MPMask[]) {
			if (!segmentationMasks || segmentationMasks.length === 0 || !maskShader) return;
			for (let i = 0; i < segmentationMasks.length; ++i) {
				const mask = segmentationMasks[i];
				maskShader.updateTextures({ u_mask: mask.getAsWebGLTexture() });
				maskShader.updateUniforms({ u_poseIndex: (i + 1) / maxPoses });
				maskShader.draw(i === 0); // Only clear on first mask.
			}
			shaderPad.updateTextures({ u_poseMask: sharedCanvas });
		}

		function updateLandmarksTexture(poses: NormalizedLandmark[][]) {
			if (!landmarksDataArray) return;

			const nPoses = poses.length;
			const totalLandmarks = nPoses * LANDMARK_COUNT;

			for (let poseIdx = 0; poseIdx < nPoses; ++poseIdx) {
				const landmarks = poses[poseIdx];
				for (let lmIdx = 0; lmIdx < STANDARD_LANDMARK_COUNT; ++lmIdx) {
					const landmark = landmarks[lmIdx];
					const dataIdx = (poseIdx * LANDMARK_COUNT + lmIdx) * 4;
					landmarksDataArray[dataIdx] = landmark.x;
					landmarksDataArray[dataIdx + 1] = 1 - landmark.y;
					landmarksDataArray[dataIdx + 2] = landmark.z ?? 0;
					landmarksDataArray[dataIdx + 3] = landmark.visibility ?? 1;
				}

				const bodyCenter = calculateBoundingBoxCenter(landmarksDataArray, poseIdx, ALL_STANDARD_INDICES);
				const bodyCenterIdx = (poseIdx * LANDMARK_COUNT + LANDMARK_INDICES.BODY_CENTER) * 4;
				landmarksDataArray[bodyCenterIdx] = bodyCenter[0];
				landmarksDataArray[bodyCenterIdx + 1] = bodyCenter[1];
				landmarksDataArray[bodyCenterIdx + 2] = bodyCenter[2];
				landmarksDataArray[bodyCenterIdx + 3] = bodyCenter[3];

				const leftHandCenter = calculateBoundingBoxCenter(landmarksDataArray, poseIdx, LEFT_HAND_INDICES);
				const leftHandCenterIdx = (poseIdx * LANDMARK_COUNT + LANDMARK_INDICES.LEFT_HAND_CENTER) * 4;
				landmarksDataArray[leftHandCenterIdx] = leftHandCenter[0];
				landmarksDataArray[leftHandCenterIdx + 1] = leftHandCenter[1];
				landmarksDataArray[leftHandCenterIdx + 2] = leftHandCenter[2];
				landmarksDataArray[leftHandCenterIdx + 3] = leftHandCenter[3];

				const rightHandCenter = calculateBoundingBoxCenter(landmarksDataArray, poseIdx, RIGHT_HAND_INDICES);
				const rightHandCenterIdx = (poseIdx * LANDMARK_COUNT + LANDMARK_INDICES.RIGHT_HAND_CENTER) * 4;
				landmarksDataArray[rightHandCenterIdx] = rightHandCenter[0];
				landmarksDataArray[rightHandCenterIdx + 1] = rightHandCenter[1];
				landmarksDataArray[rightHandCenterIdx + 2] = rightHandCenter[2];
				landmarksDataArray[rightHandCenterIdx + 3] = rightHandCenter[3];

				const leftFootCenter = calculateBoundingBoxCenter(landmarksDataArray, poseIdx, LEFT_FOOT_INDICES);
				const leftFootCenterIdx = (poseIdx * LANDMARK_COUNT + LANDMARK_INDICES.LEFT_FOOT_CENTER) * 4;
				landmarksDataArray[leftFootCenterIdx] = leftFootCenter[0];
				landmarksDataArray[leftFootCenterIdx + 1] = leftFootCenter[1];
				landmarksDataArray[leftFootCenterIdx + 2] = leftFootCenter[2];
				landmarksDataArray[leftFootCenterIdx + 3] = leftFootCenter[3];

				const rightFootCenter = calculateBoundingBoxCenter(landmarksDataArray, poseIdx, RIGHT_FOOT_INDICES);
				const rightFootCenterIdx = (poseIdx * LANDMARK_COUNT + LANDMARK_INDICES.RIGHT_FOOT_CENTER) * 4;
				landmarksDataArray[rightFootCenterIdx] = rightFootCenter[0];
				landmarksDataArray[rightFootCenterIdx + 1] = rightFootCenter[1];
				landmarksDataArray[rightFootCenterIdx + 2] = rightFootCenter[2];
				landmarksDataArray[rightFootCenterIdx + 3] = rightFootCenter[3];

				const torsoCenter = calculateBoundingBoxCenter(landmarksDataArray, poseIdx, TORSO_INDICES);
				const torsoCenterIdx = (poseIdx * LANDMARK_COUNT + LANDMARK_INDICES.TORSO_CENTER) * 4;
				landmarksDataArray[torsoCenterIdx] = torsoCenter[0];
				landmarksDataArray[torsoCenterIdx + 1] = torsoCenter[1];
				landmarksDataArray[torsoCenterIdx + 2] = torsoCenter[2];
				landmarksDataArray[torsoCenterIdx + 3] = torsoCenter[3];
			}

			const rowsToUpdate = Math.ceil(totalLandmarks / LANDMARKS_TEXTURE_WIDTH);
			shaderPad.updateTextures({
				u_poseLandmarksTex: {
					data: landmarksDataArray,
					width: LANDMARKS_TEXTURE_WIDTH,
					height: rowsToUpdate,
					isPartial: true,
				},
			});
		}

		function processPoseResults(result: PoseLandmarkerResult) {
			if (!result.landmarks || !landmarksDataArray) return;

			// IMPORTANT: maskShader and MediaPipe share a WebGL context. MediaPipe needs to run at least once before
			// ShaderPad is created on the same canvas, otherwise MediaPipe’s WebGL state gets corrupted.
			if (!maskShader) {
				maskShader = new ShaderPad(
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
			}

			const nPoses = result.landmarks.length;
			updateLandmarksTexture(result.landmarks);
			updateMaskTexture(result.segmentationMasks);
			shaderPad.updateUniforms({ u_nPoses: nPoses });

			options?.onResults?.(result);
		}

		shaderPad.registerHook('init', async () => {
			shaderPad.initializeTexture('u_poseMask', dummyTexture, {
				preserveY: true,
				minFilter: gl.NEAREST,
				magFilter: gl.NEAREST,
			});
			shaderPad.initializeUniform('u_maxPoses', 'int', maxPoses);
			shaderPad.initializeUniform('u_nPoses', 'int', 0);

			const totalLandmarks = maxPoses * LANDMARK_COUNT;
			landmarksTextureHeight = Math.ceil(totalLandmarks / LANDMARKS_TEXTURE_WIDTH);
			const textureSize = LANDMARKS_TEXTURE_WIDTH * landmarksTextureHeight * 4;
			landmarksDataArray = new Float32Array(textureSize);

			shaderPad.initializeTexture(
				'u_poseLandmarksTex',
				{
					data: landmarksDataArray,
					width: LANDMARKS_TEXTURE_WIDTH,
					height: landmarksTextureHeight,
				},
				{
					internalFormat: gl.RGBA32F,
					type: gl.FLOAT,
					minFilter: gl.NEAREST,
					magFilter: gl.NEAREST,
				}
			);

			await initializePoseLandmarker();
			options?.onReady?.();
		});

		shaderPad.registerHook('updateTextures', async (updates: Record<string, TextureSource>) => {
			const source = updates[textureName];
			if (!source) return;

			const previousSource = textureSources.get(textureName);
			if (previousSource !== source) {
				lastVideoTime = -1;
			}

			textureSources.set(textureName, source);
			if (!poseLandmarker) return;

			try {
				const requiredMode = source instanceof HTMLVideoElement ? 'VIDEO' : 'IMAGE';
				if (runningMode !== requiredMode) {
					runningMode = requiredMode;
					await poseLandmarker.setOptions({ runningMode: runningMode });
				}

				if (source instanceof HTMLVideoElement) {
					if (source.videoWidth === 0 || source.videoHeight === 0 || source.readyState < 2) return;
					if (source.currentTime !== lastVideoTime) {
						lastVideoTime = source.currentTime;
						const result = poseLandmarker.detectForVideo(source, performance.now());
						processPoseResults(result);
					}
				} else if (source instanceof HTMLImageElement || source instanceof HTMLCanvasElement) {
					if (source.width === 0 || source.height === 0) return;
					const result = poseLandmarker.detect(source);
					processPoseResults(result);
				}
			} catch (error) {
				console.error('[Pose Plugin] Detection error:', error);
			}
		});

		shaderPad.registerHook('destroy', () => {
			if (poseLandmarker) {
				poseLandmarker.close();
				poseLandmarker = null;
			}
			if (maskShader) {
				maskShader.destroy();
				maskShader = null;
			}
			vision = null;
			textureSources.clear();
			landmarksDataArray = null;
		});
		injectGLSL(`
uniform int u_maxPoses;
uniform int u_nPoses;
uniform sampler2D u_poseLandmarksTex;
uniform sampler2D u_poseMask;

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

vec4 poseLandmark(int poseIndex, int landmarkIndex) {
	int i = poseIndex * ${LANDMARK_COUNT} + landmarkIndex;
	int x = i % ${LANDMARKS_TEXTURE_WIDTH};
	int y = i / ${LANDMARKS_TEXTURE_WIDTH};
	return texelFetch(u_poseLandmarksTex, ivec2(x, y), 0);
}

vec2 poseAt(vec2 pos) {
	vec4 mask = texture(u_poseMask, pos);
	float poseIndex = floor(mask.b * float(u_maxPoses) + 0.5) - 1.0;
	return vec2(mask.g, poseIndex);
}
	
float inPose(vec2 pos) {
	float pose = poseAt(pos).x;
	return step(0.0, pose);
}`);
	};
}

export default pose;
