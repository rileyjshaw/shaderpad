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

function pose(config: { textureName: string; options?: PosePluginOptions }) {
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
		const segmentationCanvas = document.createElement('canvas');
		const segmentationCtx = segmentationCanvas.getContext('2d')!;
		poseMaskCtx.globalCompositeOperation = segmentationCtx.globalCompositeOperation = 'lighten'; // Keep the highest value of each channel.
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
					outputSegmentationMasks: options?.outputSegmentationMasks ?? true,
				});
			} catch (error) {
				console.error('[Pose Plugin] Failed to initialize Pose Landmarker:', error);
				throw error;
			}
		}

		function calculatePoseCenter(landmarks: NormalizedLandmark[]): [number, number] {
			let minX = Infinity,
				maxX = -Infinity,
				minY = Infinity,
				maxY = -Infinity;

			// Calculate bounding box center from all landmarks.
			for (const landmark of landmarks) {
				minX = Math.min(minX, landmark.x);
				maxX = Math.max(maxX, landmark.x);
				minY = Math.min(minY, landmark.y);
				maxY = Math.max(maxY, landmark.y);
			}

			const centerX = (minX + maxX) / 2;
			const centerY = (minY + maxY) / 2;
			return [centerX, centerY];
		}

		async function updateMaskTexture(poses: NormalizedLandmark[][], segmentationMasks?: any[]) {
			if (!poseLandmarker) {
				console.warn('[Pose Plugin] Cannot update mask: poseLandmarker missing');
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

				const poseCenters: [number, number][] = [];
				for (const landmarks of result.landmarks) {
					const poseCenter = calculatePoseCenter(landmarks);
					// Invert Y-axis to match WebGL coordinate system.
					poseCenters.push([poseCenter[0], 1.0 - poseCenter[1]]);
				}
				updates.u_poseCenter = poseCenters;
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
			const defaultPoseCenterData: [number, number][] = Array.from({ length: maxPoses }, () => [0.5, 0.5]);
			shaderPad.initializeUniform('u_poseCenter', 'float', defaultPoseCenterData, {
				arrayLength: maxPoses,
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
		// TODO: getBody and getSkeleton shouldn't rely on alpha. Do they? Seems so in the example...
		injectGLSL(`
uniform int u_maxPoses;
uniform int u_nPoses;
uniform vec2 u_poseLandmarks[${maxPoses * LANDMARK_COUNT}];
uniform sampler2D u_poseMask;
uniform vec2 u_poseCenter[${maxPoses}];
vec2 poseLandmark(int poseIndex, int landmarkIndex) {
	return u_poseLandmarks[poseIndex * ${LANDMARK_COUNT} + landmarkIndex];
}
float getBody(vec2 pos) { return texture(u_poseMask, pos).g; }
float getSkeleton(vec2 pos) { return texture(u_poseMask, pos).b; }`);
	};
}

export default pose;
