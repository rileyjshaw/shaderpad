import ShaderPad, { PluginContext, TextureSource } from '../index';
import type { PoseLandmarker, NormalizedLandmark } from '@mediapipe/tasks-vision';

export interface PosePluginOptions {
	modelPath?: string;
	maxPoses?: number;
	minPoseDetectionConfidence?: number;
	minPosePresenceConfidence?: number;
	minTrackingConfidence?: number;
	outputSegmentationMasks?: boolean;
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

function pose(config: { textureName: string; options?: PosePluginOptions }) {
	const { textureName, options } = config;
	const defaultModelPath =
		'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

	return function (shaderPad: ShaderPad, context: PluginContext) {
		const { injectGLSL, gl } = context;

		let poseLandmarker: PoseLandmarker | null = null;
		let vision: any = null;
		let lastVideoTime = -1;
		const textureSources = new Map<string, TextureSource>();
		const maxPoses = options?.maxPoses ?? 1;

		const LANDMARKS_TEXTURE_WIDTH = 512;
		let landmarksTextureHeight = 0;
		let landmarksDataArray: Float32Array | null = null;

		const maskWidth = 512;
		const maskHeight = 512;
		const poseMaskCanvas = document.createElement('canvas');
		poseMaskCanvas.width = maskWidth;
		poseMaskCanvas.height = maskHeight;
		const poseMaskCtx = poseMaskCanvas.getContext('2d')!;
		const segmentationCanvas = document.createElement('canvas');
		const segmentationCtx = segmentationCanvas.getContext('2d')!;
		poseMaskCtx.globalCompositeOperation = segmentationCtx.globalCompositeOperation = 'lighten'; // Keep the highest value of each channel.

		async function initializePoseLandmarker() {
			try {
				const { FilesetResolver, PoseLandmarker } = await import('@mediapipe/tasks-vision');
				vision = await FilesetResolver.forVisionTasks(
					'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
				);
				poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
					baseOptions: {
						modelAssetPath: options?.modelPath || defaultModelPath,
					},
					runningMode: 'VIDEO',
					numPoses: options?.maxPoses ?? 1,
					minPoseDetectionConfidence: options?.minPoseDetectionConfidence ?? 0.5,
					minPosePresenceConfidence: options?.minPosePresenceConfidence ?? 0.5,
					minTrackingConfidence: options?.minTrackingConfidence ?? 0.5,
					outputSegmentationMasks: options?.outputSegmentationMasks ?? true,
				});
			} catch (error) {
				console.error('[Pose Plugin] Failed to initialize Pose Landmarker:', error);
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

		async function updateMaskTexture(segmentationMasks?: any[]) {
			if (!poseLandmarker || !landmarksDataArray) {
				console.warn('[Pose Plugin] Cannot update mask: poseLandmarker or landmarksDataArray missing');
				return;
			}

			try {
				poseMaskCtx.clearRect(0, 0, poseMaskCanvas.width, poseMaskCanvas.height);

				// Draw the segmentation masks.
				if (segmentationMasks && segmentationMasks.length > 0) {
					segmentationMasks.forEach(mask => {
						if (!mask) return;

						const { width, height } = mask;
						const maskData = mask.getAsUint8Array();
						const pixelCount = width * height;
						const outputData = new Uint8ClampedArray(pixelCount * 4);

						for (let i = 0; i < pixelCount; i++) {
							outputData[i * 4 + 1] = maskData[i]; // G (body mask)
							outputData[i * 4 + 3] = 255; // A (required for compositing)
						}

						const rgbaMask = new ImageData(outputData, width, height);

						// Resize mask to canvas size if needed.
						if (width === poseMaskCanvas.width && height === poseMaskCanvas.height) {
							poseMaskCtx.putImageData(rgbaMask, 0, 0);
						} else {
							if (segmentationCanvas.width !== width) segmentationCanvas.width = width;
							if (segmentationCanvas.height !== height) segmentationCanvas.height = height;
							segmentationCtx.putImageData(rgbaMask, 0, 0);
							poseMaskCtx.drawImage(
								segmentationCanvas,
								0,
								0,
								poseMaskCanvas.width,
								poseMaskCanvas.height
							);
						}
					});
				}

				shaderPad.updateTextures({ u_poseMask: poseMaskCanvas });
			} catch (error) {
				console.error('[Pose Plugin] Failed to generate mask texture:', error);
			}
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
					landmarksDataArray[dataIdx] = landmark.x; // R (X)
					landmarksDataArray[dataIdx + 1] = 1 - landmark.y; // G (Inverted Y)
					landmarksDataArray[dataIdx + 2] = landmark.z ?? 0; // B (Z)
					landmarksDataArray[dataIdx + 3] = landmark.visibility ?? 1; // A (Visibility)
				}

				// Body center (landmark 33) - calculated from all standard landmarks
				const bodyCenter = calculateBoundingBoxCenter(
					landmarksDataArray,
					poseIdx,
					Array.from({ length: STANDARD_LANDMARK_COUNT }, (_, i) => i)
				);
				const bodyCenterIdx = (poseIdx * LANDMARK_COUNT + LANDMARK_INDICES.BODY_CENTER) * 4;
				landmarksDataArray[bodyCenterIdx] = bodyCenter[0];
				landmarksDataArray[bodyCenterIdx + 1] = bodyCenter[1];
				landmarksDataArray[bodyCenterIdx + 2] = bodyCenter[2];
				landmarksDataArray[bodyCenterIdx + 3] = bodyCenter[3];

				// Left hand center (landmark 34) - center of pinky, thumb, wrist, index.
				const leftHandCenter = calculateBoundingBoxCenter(landmarksDataArray, poseIdx, [
					LANDMARK_INDICES.LEFT_WRIST,
					LANDMARK_INDICES.LEFT_PINKY,
					LANDMARK_INDICES.LEFT_THUMB,
					LANDMARK_INDICES.LEFT_INDEX,
				]);
				const leftHandCenterIdx = (poseIdx * LANDMARK_COUNT + LANDMARK_INDICES.LEFT_HAND_CENTER) * 4;
				landmarksDataArray[leftHandCenterIdx] = leftHandCenter[0];
				landmarksDataArray[leftHandCenterIdx + 1] = leftHandCenter[1];
				landmarksDataArray[leftHandCenterIdx + 2] = leftHandCenter[2];
				landmarksDataArray[leftHandCenterIdx + 3] = leftHandCenter[3];

				// Right hand center (landmark 35) - center of pinky, thumb, wrist, index.
				const rightHandCenter = calculateBoundingBoxCenter(landmarksDataArray, poseIdx, [
					LANDMARK_INDICES.RIGHT_WRIST,
					LANDMARK_INDICES.RIGHT_PINKY,
					LANDMARK_INDICES.RIGHT_THUMB,
					LANDMARK_INDICES.RIGHT_INDEX,
				]);
				const rightHandCenterIdx = (poseIdx * LANDMARK_COUNT + LANDMARK_INDICES.RIGHT_HAND_CENTER) * 4;
				landmarksDataArray[rightHandCenterIdx] = rightHandCenter[0];
				landmarksDataArray[rightHandCenterIdx + 1] = rightHandCenter[1];
				landmarksDataArray[rightHandCenterIdx + 2] = rightHandCenter[2];
				landmarksDataArray[rightHandCenterIdx + 3] = rightHandCenter[3];

				// Left foot center (landmark 36) - center of ankle, heel, foot index
				const leftFootCenter = calculateBoundingBoxCenter(landmarksDataArray, poseIdx, [
					LANDMARK_INDICES.LEFT_ANKLE,
					LANDMARK_INDICES.LEFT_HEEL,
					LANDMARK_INDICES.LEFT_FOOT_INDEX,
				]);
				const leftFootCenterIdx = (poseIdx * LANDMARK_COUNT + LANDMARK_INDICES.LEFT_FOOT_CENTER) * 4;
				landmarksDataArray[leftFootCenterIdx] = leftFootCenter[0];
				landmarksDataArray[leftFootCenterIdx + 1] = leftFootCenter[1];
				landmarksDataArray[leftFootCenterIdx + 2] = leftFootCenter[2];
				landmarksDataArray[leftFootCenterIdx + 3] = leftFootCenter[3];

				// Right foot center (landmark 37) - center of ankle, heel, foot index
				const rightFootCenter = calculateBoundingBoxCenter(landmarksDataArray, poseIdx, [
					LANDMARK_INDICES.RIGHT_ANKLE,
					LANDMARK_INDICES.RIGHT_HEEL,
					LANDMARK_INDICES.RIGHT_FOOT_INDEX,
				]);
				const rightFootCenterIdx = (poseIdx * LANDMARK_COUNT + LANDMARK_INDICES.RIGHT_FOOT_CENTER) * 4;
				landmarksDataArray[rightFootCenterIdx] = rightFootCenter[0];
				landmarksDataArray[rightFootCenterIdx + 1] = rightFootCenter[1];
				landmarksDataArray[rightFootCenterIdx + 2] = rightFootCenter[2];
				landmarksDataArray[rightFootCenterIdx + 3] = rightFootCenter[3];

				// Torso center (landmark 38) - center of shoulders and hips
				const torsoCenter = calculateBoundingBoxCenter(landmarksDataArray, poseIdx, [
					LANDMARK_INDICES.LEFT_SHOULDER,
					LANDMARK_INDICES.RIGHT_SHOULDER,
					LANDMARK_INDICES.LEFT_HIP,
					LANDMARK_INDICES.RIGHT_HIP,
				]);
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
				},
			});
		}

		function processPoseResults(result: any) {
			if (!result.landmarks || !landmarksDataArray) return;

			const nPoses = result.landmarks.length;
			updateLandmarksTexture(result.landmarks);
			updateMaskTexture(result.segmentationMasks).catch(error => {
				console.warn('[Pose Plugin] Mask texture update error:', error);
			});

			shaderPad.updateUniforms({ u_nPoses: nPoses });
		}

		shaderPad.registerHook('init', async () => {
			shaderPad.initializeTexture('u_poseMask', poseMaskCanvas);
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
		});

		shaderPad.registerHook('updateTextures', (updates: Record<string, TextureSource>) => {
			const source = updates[textureName];
			if (!source) return;

			const previousSource = textureSources.get(textureName);
			if (previousSource !== source) {
				lastVideoTime = -1;
			}

			textureSources.set(textureName, source);
			if (!poseLandmarker) return;
			try {
				if (source instanceof HTMLVideoElement) {
					if (source.videoWidth === 0 || source.videoHeight === 0 || source.readyState < 2) {
						return;
					}
					if (source.currentTime !== lastVideoTime) {
						lastVideoTime = source.currentTime;
						const timestamp = performance.now();
						const result = poseLandmarker.detectForVideo(source, timestamp);
						processPoseResults(result);
					}
				} else if (source instanceof HTMLImageElement || source instanceof HTMLCanvasElement) {
					if (source.width === 0 || source.height === 0) {
						return;
					}
					const result = poseLandmarker.detect(source);
					processPoseResults(result);
				}
			} catch (error) {
				console.error('[Pose Plugin] Pose detection error:', error);
			}
		});

		shaderPad.registerHook('destroy', () => {
			if (poseLandmarker) {
				poseLandmarker.close();
				poseLandmarker = null;
			}
			vision = null;
			textureSources.clear();
			poseMaskCanvas.remove();
			landmarksDataArray = null;
		});
		// TODO: inBody shouldn't rely on alpha. Does it? Seems so in the example.
		//       Might be because putImageData ignores alpha compositing.
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
float inBody(vec2 pos) { return texture(u_poseMask, pos).g; }`);
	};
}

export default pose;
