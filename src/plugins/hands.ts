import ShaderPad, { PluginContext, TextureSource } from '../index';
import type { HandLandmarker, HandLandmarkerResult, NormalizedLandmark } from '@mediapipe/tasks-vision';

export interface HandsPluginOptions {
	modelPath?: string;
	maxHands?: number;
	minHandDetectionConfidence?: number;
	minHandPresenceConfidence?: number;
	minTrackingConfidence?: number;
	onResults?: (results: HandLandmarkerResult) => void;
}

const STANDARD_LANDMARK_COUNT = 21; // See https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker#models.
const CUSTOM_LANDMARK_COUNT = 1;
const LANDMARK_COUNT = STANDARD_LANDMARK_COUNT + CUSTOM_LANDMARK_COUNT;
const HAND_CENTER_LANDMARKS = [0, 0, 5, 9, 13, 17] as const; // Wrist + MCP joints, weighted toward wrist.

function hands(config: { textureName: string; options?: HandsPluginOptions }) {
	const { textureName, options } = config;
	const defaultModelPath =
		'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

	return function (shaderPad: ShaderPad, context: PluginContext) {
		const { injectGLSL, gl } = context;

		let handLandmarker: HandLandmarker | null = null;
		let vision: any = null;
		let lastVideoTime = -1;
		let runningMode: 'IMAGE' | 'VIDEO' = 'VIDEO';
		const textureSources = new Map<string, TextureSource>();
		const maxHands = options?.maxHands ?? 2;

		const LANDMARKS_TEXTURE_WIDTH = 512;
		let landmarksTextureHeight = 0;
		let landmarksDataArray: Float32Array | null = null;

		async function initializeHandLandmarker() {
			try {
				const { FilesetResolver, HandLandmarker } = await import('@mediapipe/tasks-vision');
				vision = await FilesetResolver.forVisionTasks(
					'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
				);

				handLandmarker = await HandLandmarker.createFromOptions(vision, {
					baseOptions: {
						modelAssetPath: options?.modelPath || defaultModelPath,
						delegate: 'GPU',
					},
					canvas: new OffscreenCanvas(1, 1),
					runningMode: runningMode,
					numHands: options?.maxHands ?? 2,
					minHandDetectionConfidence: options?.minHandDetectionConfidence ?? 0.5,
					minHandPresenceConfidence: options?.minHandPresenceConfidence ?? 0.5,
					minTrackingConfidence: options?.minTrackingConfidence ?? 0.5,
				});
			} catch (error) {
				console.error('[Hands Plugin] Failed to initialize:', error);
				throw error;
			}
		}

		function calculateBoundingBoxCenter(
			landmarksDataArray: Float32Array,
			handIdx: number,
			landmarkIndices: readonly number[]
		): [number, number, number, number] {
			let minX = Infinity,
				maxX = -Infinity,
				minY = Infinity,
				maxY = -Infinity,
				avgZ = 0,
				avgVisibility = 0;

			for (const idx of landmarkIndices) {
				const dataIdx = (handIdx * LANDMARK_COUNT + idx) * 4;
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

		function updateLandmarksTexture(hands: NormalizedLandmark[][], handedness: { categoryName: string }[][]) {
			if (!landmarksDataArray) return;

			const nHands = hands.length;
			const totalLandmarks = nHands * LANDMARK_COUNT;

			for (let handIdx = 0; handIdx < nHands; ++handIdx) {
				const landmarks = hands[handIdx];
				const isRightHand = handedness[handIdx]?.[0]?.categoryName === 'Right';
				for (let lmIdx = 0; lmIdx < STANDARD_LANDMARK_COUNT; ++lmIdx) {
					const landmark = landmarks[lmIdx];
					const dataIdx = (handIdx * LANDMARK_COUNT + lmIdx) * 4;
					landmarksDataArray[dataIdx] = landmark.x;
					landmarksDataArray[dataIdx + 1] = 1 - landmark.y;
					landmarksDataArray[dataIdx + 2] = landmark.z ?? 0;
					landmarksDataArray[dataIdx + 3] = isRightHand ? 1 : 0;
				}

				const handCenter = calculateBoundingBoxCenter(landmarksDataArray, handIdx, HAND_CENTER_LANDMARKS);
				const handCenterIdx = (handIdx * LANDMARK_COUNT + STANDARD_LANDMARK_COUNT) * 4;
				landmarksDataArray[handCenterIdx] = handCenter[0];
				landmarksDataArray[handCenterIdx + 1] = handCenter[1];
				landmarksDataArray[handCenterIdx + 2] = handCenter[2];
				landmarksDataArray[handCenterIdx + 3] = isRightHand ? 1 : 0;
			}

			const rowsToUpdate = Math.ceil(totalLandmarks / LANDMARKS_TEXTURE_WIDTH);
			shaderPad.updateTextures({
				u_handLandmarksTex: {
					data: landmarksDataArray,
					width: LANDMARKS_TEXTURE_WIDTH,
					height: rowsToUpdate,
					isPartial: true,
				},
			});
		}

		function processHandResults(result: HandLandmarkerResult) {
			if (!result.landmarks || !landmarksDataArray) return;

			const nHands = result.landmarks.length;
			updateLandmarksTexture(result.landmarks, result.handedness);
			shaderPad.updateUniforms({ u_nHands: nHands });

			options?.onResults?.(result);
		}

		shaderPad.registerHook('init', async () => {
			shaderPad.initializeUniform('u_maxHands', 'int', maxHands);
			shaderPad.initializeUniform('u_nHands', 'int', 0);

			const totalLandmarks = maxHands * LANDMARK_COUNT;
			landmarksTextureHeight = Math.ceil(totalLandmarks / LANDMARKS_TEXTURE_WIDTH);
			const textureSize = LANDMARKS_TEXTURE_WIDTH * landmarksTextureHeight * 4;
			landmarksDataArray = new Float32Array(textureSize);

			shaderPad.initializeTexture(
				'u_handLandmarksTex',
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

			await initializeHandLandmarker();
		});

		shaderPad.registerHook('updateTextures', async (updates: Record<string, TextureSource>) => {
			const source = updates[textureName];
			if (!source) return;

			const previousSource = textureSources.get(textureName);
			if (previousSource !== source) {
				lastVideoTime = -1;
			}

			textureSources.set(textureName, source);
			if (!handLandmarker) return;

			try {
				const requiredMode = source instanceof HTMLVideoElement ? 'VIDEO' : 'IMAGE';
				if (runningMode !== requiredMode) {
					runningMode = requiredMode;
					await handLandmarker.setOptions({ runningMode: runningMode });
				}

				if (source instanceof HTMLVideoElement) {
					if (source.videoWidth === 0 || source.videoHeight === 0 || source.readyState < 2) {
						return;
					}
					if (source.currentTime !== lastVideoTime) {
						lastVideoTime = source.currentTime;
						const result = handLandmarker.detectForVideo(source, performance.now());
						processHandResults(result);
					}
				} else if (source instanceof HTMLImageElement || source instanceof HTMLCanvasElement) {
					if (source.width === 0 || source.height === 0) {
						return;
					}
					const result = handLandmarker.detect(source);
					processHandResults(result);
				}
			} catch (error) {
				console.error('[Hands Plugin] Detection error:', error);
			}
		});

		shaderPad.registerHook('destroy', () => {
			if (handLandmarker) {
				handLandmarker.close();
				handLandmarker = null;
			}
			vision = null;
			textureSources.clear();
			landmarksDataArray = null;
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
