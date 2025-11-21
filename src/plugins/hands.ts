import ShaderPad, { PluginContext, TextureSource } from '../index';
import type { HandLandmarker, NormalizedLandmark } from '@mediapipe/tasks-vision';

export interface HandsPluginOptions {
	modelPath?: string;
	maxHands?: number;
	minHandDetectionConfidence?: number;
	minHandPresenceConfidence?: number;
	minTrackingConfidence?: number;
}

const LANDMARK_COUNT = 21 + 1; // See https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker#models, plus the hand center.
const HAND_CENTER_LANDMARKS = [0, 0, 5, 9, 13, 17]; // Wrist + MCP joints of all fingers, weighted toward the wrist.

function hands(config: { textureName: string; options?: HandsPluginOptions }) {
	const { textureName, options } = config;
	const defaultModelPath =
		'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

	return function (shaderPad: ShaderPad, context: PluginContext) {
		const { injectGLSL } = context;

		let handLandmarker: HandLandmarker | null = null;
		let vision: any = null;
		let lastVideoTime = -1;
		const textureSources = new Map<string, TextureSource>();
		const maxHands = options?.maxHands ?? 2;

		async function initializeHandLandmarker() {
			try {
				const { FilesetResolver, HandLandmarker } = await import('@mediapipe/tasks-vision');
				vision = await FilesetResolver.forVisionTasks(
					'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
				);

				handLandmarker = await HandLandmarker.createFromOptions(vision, {
					baseOptions: {
						modelAssetPath: options?.modelPath || defaultModelPath,
					},
					runningMode: 'VIDEO',
					numHands: options?.maxHands ?? 2,
					minHandDetectionConfidence: options?.minHandDetectionConfidence ?? 0.5,
					minHandPresenceConfidence: options?.minHandPresenceConfidence ?? 0.5,
					minTrackingConfidence: options?.minTrackingConfidence ?? 0.5,
				});
			} catch (error) {
				console.error('Failed to initialize Hand Landmarker:', error);
				throw error;
			}
		}

		function calculateHandCenter(landmarks: NormalizedLandmark[]): [number, number] {
			const visibleLandmarks = HAND_CENTER_LANDMARKS.map(index => landmarks[index]).filter(
				landmark => landmark && typeof landmark.x === 'number' && typeof landmark.y === 'number'
			);
			if (visibleLandmarks.length === 0) return [0, 0];

			let sumX = 0,
				sumY = 0;
			for (const landmark of visibleLandmarks) {
				sumX += landmark.x;
				sumY += landmark.y;
			}
			return [sumX / visibleLandmarks.length, sumY / visibleLandmarks.length];
		}

		function processHandResults(result: any) {
			if (!result.landmarks) return;

			const nHands = result.landmarks.length;
			const updates: Parameters<typeof shaderPad.updateUniforms>[0] = { u_nHands: nHands };
			if (nHands) {
				updates.u_handLandmarks = result.landmarks.flatMap((landmarks: NormalizedLandmark[]) => {
					const handCenter = calculateHandCenter(landmarks);
					handCenter[1] = 1.0 - handCenter[1];
					return landmarks.map(landmark => [landmark.x, 1.0 - landmark.y]).concat([handCenter]);
				});
			}
			shaderPad.updateUniforms(updates);
		}

		shaderPad.registerHook('init', async () => {
			shaderPad.initializeUniform('u_maxHands', 'int', maxHands);
			shaderPad.initializeUniform('u_nHands', 'int', 0);
			const defaultHandLandmarks: [number, number][] = Array.from({ length: maxHands * LANDMARK_COUNT }, () => [
				0.5, 0.5,
			]);
			shaderPad.initializeUniform('u_handLandmarks', 'float', defaultHandLandmarks, {
				arrayLength: maxHands * LANDMARK_COUNT,
			});
			await initializeHandLandmarker();
		});

		shaderPad.registerHook('updateTextures', (updates: Record<string, TextureSource>) => {
			Object.entries(updates).forEach(([name, source]) => {
				if (name !== textureName) return;
				textureSources.set(name, source);
				if (!handLandmarker) return;
				try {
					if (source instanceof HTMLVideoElement) {
						if (source.currentTime !== lastVideoTime) {
							lastVideoTime = source.currentTime;
							const timestamp = performance.now();
							const result = handLandmarker.detectForVideo(source, timestamp);
							processHandResults(result);
						}
					} else if (source instanceof HTMLImageElement) {
						const result = handLandmarker.detect(source);
						processHandResults(result);
					}
				} catch (error) {
					console.warn('Hand detection error:', error);
				}
			});
		});

		shaderPad.registerHook('destroy', () => {
			if (handLandmarker) {
				handLandmarker.close();
				handLandmarker = null;
			}
			vision = null;
			textureSources.clear();
		});

		injectGLSL(`
uniform int u_maxHands;
uniform int u_nHands;
uniform vec2 u_handLandmarks[${maxHands * LANDMARK_COUNT}];
vec2 handLandmark(int handIndex, int landmarkIndex) {
	return u_handLandmarks[handIndex * ${LANDMARK_COUNT} + landmarkIndex];
}`);
	};
}

export default hands;
