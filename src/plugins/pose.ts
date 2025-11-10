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

const LANDMARK_COUNT = 33; // See https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker#pose_landmarker_model.

export function pose(config: { textureName: string; options?: PosePluginOptions }) {
	const { textureName, options } = config;
	const defaultModelPath =
		'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

	return function (shaderPad: ShaderPad, context: PluginContext) {
		const { injectGLSL } = context;

		let poseLandmarker: PoseLandmarker | null = null;
		let vision: any = null;
		let lastVideoTime = -1;
		const textureSources = new Map<string, TextureSource>();
		const maxPoses = options?.maxPoses ?? 1;
		const maskWidth = 512;
		const maskHeight = 512;
		const poseMaskCanvas = document.createElement('canvas');
		poseMaskCanvas.width = maskWidth;
		poseMaskCanvas.height = maskHeight;
		const poseMaskCtx = poseMaskCanvas.getContext('2d')!;
		poseMaskCtx.globalCompositeOperation = 'lighten'; // Keep the highest value of each channel.
		const poseConnections: { start: number; end: number }[] = [];

		async function initializePoseLandmarker() {
			try {
				const { FilesetResolver, PoseLandmarker } = await import('@mediapipe/tasks-vision');
				vision = await FilesetResolver.forVisionTasks(
					'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
				);
				poseConnections.push(...PoseLandmarker.POSE_CONNECTIONS);
				poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
					baseOptions: {
						modelAssetPath: options?.modelPath || defaultModelPath,
					},
					runningMode: 'VIDEO',
					numPoses: options?.maxPoses ?? 1,
					minPoseDetectionConfidence: options?.minPoseDetectionConfidence ?? 0.5,
					minPosePresenceConfidence: options?.minPosePresenceConfidence ?? 0.5,
					minTrackingConfidence: options?.minTrackingConfidence ?? 0.5,
					outputSegmentationMasks: options?.outputSegmentationMasks ?? false,
				});
			} catch (error) {
				console.error('[Pose Plugin] Failed to initialize Pose Landmarker:', error);
				throw error;
			}
		}

		async function updateMaskTexture(poses: NormalizedLandmark[][], segmentationMasks?: ImageData[]) {
			if (!poseLandmarker) {
				console.warn('[Pose Plugin] Cannot update mask: poseLandmarker missing');
				return;
			}

			try {
				poseMaskCtx.clearRect(0, 0, poseMaskCanvas.width, poseMaskCanvas.height);

				// Draw the segmentation masks.
				if (segmentationMasks && segmentationMasks.length > 0) {
					// Combine all segmentation masks (for multiple poses).
					segmentationMasks.forEach(mask => {
						// Resize mask to canvas size if needed.
						if (mask.width !== poseMaskCanvas.width || mask.height !== poseMaskCanvas.height) {
							const tempCanvas = document.createElement('canvas');
							tempCanvas.width = mask.width;
							tempCanvas.height = mask.height;
							const tempCtx = tempCanvas.getContext('2d')!;
							tempCtx.putImageData(mask, 0, 0);
							poseMaskCtx.drawImage(tempCanvas, 0, 0, poseMaskCanvas.width, poseMaskCanvas.height);
						} else {
							poseMaskCtx.putImageData(mask, 0, 0);
						}
					});
				}

				// Draw the skeleton.
				if (poseConnections.length) {
					const lineWidth = Math.max(2, poseMaskCanvas.width / 256);
					poseMaskCtx.lineWidth = lineWidth;
					poseMaskCtx.lineCap = 'round';
					poseMaskCtx.strokeStyle = '#00f';

					poses.forEach(landmarks => {
						poseConnections.forEach(({ start, end }) => {
							const a = landmarks[start];
							const b = landmarks[end];
							if (!a || !b) return;
							if ((a.visibility ?? 1) < 0.3 || (b.visibility ?? 1) < 0.3) return;
							poseMaskCtx.beginPath();
							poseMaskCtx.moveTo(a.x * poseMaskCanvas.width, a.y * poseMaskCanvas.height);
							poseMaskCtx.lineTo(b.x * poseMaskCanvas.width, b.y * poseMaskCanvas.height);
							poseMaskCtx.stroke();
						});
					});
				}

				shaderPad.updateTextures({ u_poseMask: poseMaskCanvas });
			} catch (error) {
				console.error('[Pose Plugin] Failed to generate mask texture:', error);
			}
		}

		function processPoseResults(result: any) {
			if (!result.landmarks) return;

			updateMaskTexture(result.landmarks, result.segmentationMasks).catch(error => {
				console.warn('[Pose Plugin] Mask texture update error:', error);
			});

			const nPoses = result.landmarks.length;
			const updates: Parameters<typeof shaderPad.updateUniforms>[0] = { u_nPoses: nPoses };
			if (nPoses) {
				updates.u_poseLandmarks = result.landmarks.flatMap((landmarks: NormalizedLandmark[]) =>
					landmarks.map(landmark => [landmark.x, 1.0 - landmark.y])
				);
			}
			shaderPad.updateUniforms(updates);
		}

		shaderPad.registerHook('init', async () => {
			shaderPad.initializeTexture('u_poseMask', poseMaskCanvas);
			shaderPad.initializeUniform('u_maxPoses', 'int', maxPoses);
			shaderPad.initializeUniform('u_nPoses', 'int', 0);
			const defaultPoseData: [number, number][] = Array.from({ length: maxPoses * LANDMARK_COUNT }, () => [
				0.5, 0.5,
			]);
			shaderPad.initializeUniform('u_poseLandmarks', 'float', defaultPoseData, {
				arrayLength: maxPoses * LANDMARK_COUNT,
			});

			await initializePoseLandmarker();
		});

		shaderPad.registerHook('updateTextures', (updates: Record<string, TextureSource>) => {
			Object.entries(updates).forEach(([name, source]) => {
				if (name !== textureName) return;
				textureSources.set(name, source);
				if (!poseLandmarker) return;
				try {
					if (source instanceof HTMLVideoElement) {
						if (source.currentTime !== lastVideoTime) {
							lastVideoTime = source.currentTime;
							const timestamp = performance.now();
							const result = poseLandmarker.detectForVideo(source, timestamp);
							processPoseResults(result);
						}
					} else if (source instanceof HTMLImageElement) {
						const result = poseLandmarker.detect(source);
						processPoseResults(result);
					}
				} catch (error) {
					console.error('[Pose Plugin] Pose detection error:', error);
				}
			});
		});

		shaderPad.registerHook('destroy', () => {
			if (poseLandmarker) {
				poseLandmarker.close();
				poseLandmarker = null;
			}
			vision = null;
			textureSources.clear();
			poseMaskCanvas.remove();
		});

		injectGLSL(`
uniform int u_maxPoses;
uniform int u_nPoses;
uniform vec2 u_poseLandmarks[${maxPoses * LANDMARK_COUNT}];
uniform sampler2D u_poseMask;
vec2 poseLandmark(int poseIndex, int landmarkIndex) {
	return u_poseLandmarks[poseIndex * ${LANDMARK_COUNT} + landmarkIndex];
}
float getBody(vec2 pos) { return texture(u_poseMask, pos).g; }
float getSkeleton(vec2 pos) { return texture(u_poseMask, pos).b; }`);
	};
}
