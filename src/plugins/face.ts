import ShaderPad, { PluginContext, TextureSource } from '../index';
import type { FaceLandmarker, FaceLandmarkerResult, NormalizedLandmark } from '@mediapipe/tasks-vision';

export interface FacePluginOptions {
	modelPath?: string;
	maxFaces?: number;
	minFaceDetectionConfidence?: number;
	minFacePresenceConfidence?: number;
	minTrackingConfidence?: number;
	outputFaceBlendshapes?: boolean;
	outputFacialTransformationMatrixes?: boolean;
	onResults?: (results: FaceLandmarkerResult) => void;
}

const STANDARD_LANDMARK_COUNT = 478;
const CUSTOM_LANDMARK_COUNT = 2;
const LANDMARK_COUNT = STANDARD_LANDMARK_COUNT + CUSTOM_LANDMARK_COUNT;
const LANDMARK_INDICES = {
	LEFT_EYEBROW: [336, 296, 334, 293, 300, 276, 283, 282, 295, 285],
	LEFT_EYE: [362, 398, 384, 385, 386, 387, 388, 466, 263, 249, 390, 373, 374, 380, 381, 382],
	LEFT_EYE_CENTER: 473,
	RIGHT_EYEBROW: [70, 63, 105, 66, 107, 55, 65, 52, 53, 46],
	RIGHT_EYE: [33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7],
	RIGHT_EYE_CENTER: 468,
	NOSE_TIP: 4,
	OUTER_LIP: [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146],
	INNER_LIP: [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95],
	// Custom landmarks.
	FACE_CENTER: STANDARD_LANDMARK_COUNT,
	MOUTH_CENTER: STANDARD_LANDMARK_COUNT + 1,
};

function face(config: { textureName: string; options?: FacePluginOptions }) {
	const { textureName, options } = config;
	const defaultModelPath =
		'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task';

	return function (shaderPad: ShaderPad, context: PluginContext) {
		const { injectGLSL, gl } = context;

		let faceLandmarker: FaceLandmarker | null = null;
		let vision: any = null;
		let lastVideoTime = -1;
		let runningMode: 'IMAGE' | 'VIDEO' = 'VIDEO';
		const textureSources = new Map<string, TextureSource>();
		const maxFaces = options?.maxFaces ?? 1;

		const LANDMARKS_TEXTURE_WIDTH = 512;
		let landmarksTextureHeight = 0;
		let landmarksDataArray: Float32Array | null = null;

		const maskWidth = 512;
		const maskHeight = 512;
		const faceMaskCanvas = document.createElement('canvas');
		faceMaskCanvas.width = maskWidth;
		faceMaskCanvas.height = maskHeight;
		const faceMaskCtx = faceMaskCanvas.getContext('2d')!;
		faceMaskCtx.globalCompositeOperation = 'lighten'; // Keep the highest value of each channel.

		async function initializeFaceLandmarker() {
			try {
				const { FilesetResolver, FaceLandmarker } = await import('@mediapipe/tasks-vision');
				vision = await FilesetResolver.forVisionTasks(
					'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
				);

				faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
					baseOptions: {
						modelAssetPath: options?.modelPath || defaultModelPath,
					},
					runningMode: runningMode,
					numFaces: options?.maxFaces ?? 1,
					minFaceDetectionConfidence: options?.minFaceDetectionConfidence ?? 0.5,
					minFacePresenceConfidence: options?.minFacePresenceConfidence ?? 0.5,
					minTrackingConfidence: options?.minTrackingConfidence ?? 0.5,
					outputFaceBlendshapes: options?.outputFaceBlendshapes ?? false,
					outputFacialTransformationMatrixes: options?.outputFacialTransformationMatrixes ?? false,
				});
			} catch (error) {
				console.error('Failed to initialize Face Landmarker:', error);
				throw error;
			}
		}

		function calculateBoundingBoxCenter(
			landmarksDataArray: Float32Array,
			faceIdx: number,
			landmarkIndices: number[]
		): [number, number, number, number] {
			let minX = Infinity,
				maxX = -Infinity,
				minY = Infinity,
				maxY = -Infinity,
				avgZ = 0,
				avgVisibility = 0;

			for (const idx of landmarkIndices) {
				const dataIdx = (faceIdx * LANDMARK_COUNT + idx) * 4;
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

		function fillRegion(faceIdx: number, landmarkIndices: number[], color: { r: number; g: number; b: number }) {
			if (!landmarksDataArray) return;
			faceMaskCtx.fillStyle = `rgb(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(
				color.b * 255
			)})`;
			faceMaskCtx.beginPath();
			const originIdx = (faceIdx * LANDMARK_COUNT + landmarkIndices[0]) * 4;
			const originX = landmarksDataArray[originIdx];
			const originY = landmarksDataArray[originIdx + 1];
			faceMaskCtx.moveTo(originX * faceMaskCanvas.width, originY * faceMaskCanvas.height);

			for (let i = 1; i < landmarkIndices.length; ++i) {
				const destIdx = (faceIdx * LANDMARK_COUNT + landmarkIndices[i]) * 4;
				const destX = landmarksDataArray[destIdx];
				const destY = landmarksDataArray[destIdx + 1];
				faceMaskCtx.lineTo(destX * faceMaskCanvas.width, destY * faceMaskCanvas.height);
			}
			faceMaskCtx.closePath();
			faceMaskCtx.fill();
		}

		async function updateMaskTexture(nFaces: number) {
			if (!faceLandmarker || !landmarksDataArray) {
				console.warn('[Face Plugin] Cannot update mask: faceLandmarker or landmarksDataArray missing');
				return;
			}

			try {
				const { FaceLandmarker } = await import('@mediapipe/tasks-vision');
				faceMaskCtx.clearRect(0, 0, faceMaskCanvas.width, faceMaskCanvas.height);

				for (let faceIdx = 0; faceIdx < nFaces; ++faceIdx) {
					// Build combined mask with RGBA channels
					// R: Mouth | G: Face | B: Eyes
					// Mouth (red channel).
					// Lips.
					fillRegion(faceIdx, LANDMARK_INDICES.OUTER_LIP, { r: 0.25, g: 0, b: 0 });
					// Inner mouth.
					fillRegion(faceIdx, LANDMARK_INDICES.INNER_LIP, { r: 0.75, g: 0, b: 0 });

					// Face (green channel).
					// Entire face.
					fillRegion(
						faceIdx,
						FaceLandmarker.FACE_LANDMARKS_TESSELATION.map(({ start }) => start),
						{ r: 0, g: 0.25, b: 0 }
					);
					// Face contour (excludes nose in profile view).
					fillRegion(
						faceIdx,
						FaceLandmarker.FACE_LANDMARKS_FACE_OVAL.map(({ start }) => start),
						{ r: 0, g: 1, b: 0 }
					);

					// Eyes (blue channel).
					// Eyebrows.
					fillRegion(faceIdx, LANDMARK_INDICES.LEFT_EYEBROW, {
						r: 0,
						g: 0,
						b: 0.15,
					});
					fillRegion(faceIdx, LANDMARK_INDICES.RIGHT_EYEBROW, {
						r: 0,
						g: 0,
						b: 0.35,
					});
					// Eyes.
					fillRegion(faceIdx, LANDMARK_INDICES.LEFT_EYE, { r: 0, g: 0, b: 0.65 });
					fillRegion(faceIdx, LANDMARK_INDICES.RIGHT_EYE, { r: 0, g: 0, b: 0.85 });
				}

				shaderPad.updateTextures({ u_faceMask: faceMaskCanvas });
			} catch (error) {
				console.error('[Face Plugin] Failed to generate mask texture:', error);
			}
		}

		function updateLandmarksTexture(faces: NormalizedLandmark[][]) {
			if (!landmarksDataArray) return;

			const nFaces = faces.length;
			const totalLandmarks = nFaces * LANDMARK_COUNT;

			for (let faceIdx = 0; faceIdx < nFaces; ++faceIdx) {
				const landmarks = faces[faceIdx];
				for (let lmIdx = 0; lmIdx < STANDARD_LANDMARK_COUNT; ++lmIdx) {
					const landmark = landmarks[lmIdx];
					const dataIdx = (faceIdx * LANDMARK_COUNT + lmIdx) * 4;
					landmarksDataArray[dataIdx] = landmark.x; // R (X)
					landmarksDataArray[dataIdx + 1] = 1 - landmark.y; // G (Inverted Y)
					landmarksDataArray[dataIdx + 2] = landmark.z ?? 0; // B (Z)
					landmarksDataArray[dataIdx + 3] = landmark.visibility ?? 1; // A (Visibility)
				}

				const faceCenter = calculateBoundingBoxCenter(
					landmarksDataArray,
					faceIdx,
					Array.from({ length: STANDARD_LANDMARK_COUNT }, (_, i) => i)
				);
				const faceCenterIdx = (faceIdx * LANDMARK_COUNT + LANDMARK_INDICES.FACE_CENTER) * 4;
				landmarksDataArray[faceCenterIdx] = faceCenter[0];
				landmarksDataArray[faceCenterIdx + 1] = faceCenter[1];
				landmarksDataArray[faceCenterIdx + 2] = 0; // Z
				landmarksDataArray[faceCenterIdx + 3] = 1; // Visibility

				// Mouth center (landmark 479) - uses INNER_LIP landmarks
				const mouthCenter = calculateBoundingBoxCenter(landmarksDataArray, faceIdx, LANDMARK_INDICES.INNER_LIP);
				const mouthCenterIdx = (faceIdx * LANDMARK_COUNT + LANDMARK_INDICES.MOUTH_CENTER) * 4;
				landmarksDataArray[mouthCenterIdx] = mouthCenter[0];
				landmarksDataArray[mouthCenterIdx + 1] = mouthCenter[1];
				landmarksDataArray[mouthCenterIdx + 2] = 0; // Z
				landmarksDataArray[mouthCenterIdx + 3] = 1; // Visibility
			}

			const rowsToUpdate = Math.ceil(totalLandmarks / LANDMARKS_TEXTURE_WIDTH);
			shaderPad.updateTextures({
				u_faceLandmarksTex: {
					data: landmarksDataArray,
					width: LANDMARKS_TEXTURE_WIDTH,
					height: rowsToUpdate,
				},
			});
		}

		function processFaceResults(result: FaceLandmarkerResult) {
			if (!result.faceLandmarks || !landmarksDataArray) return;

			const nFaces = result.faceLandmarks.length;
			updateLandmarksTexture(result.faceLandmarks);
			updateMaskTexture(nFaces).catch(error => {
				console.warn('Mask texture update error:', error);
			});
			shaderPad.updateUniforms({ u_nFaces: nFaces });

			options?.onResults?.(result);
		}

		shaderPad.registerHook('init', async () => {
			shaderPad.initializeTexture('u_faceMask', faceMaskCanvas, { preserveY: true });
			shaderPad.initializeUniform('u_maxFaces', 'int', maxFaces);
			shaderPad.initializeUniform('u_nFaces', 'int', 0);

			const totalLandmarks = maxFaces * LANDMARK_COUNT;
			landmarksTextureHeight = Math.ceil(totalLandmarks / LANDMARKS_TEXTURE_WIDTH);
			const textureSize = LANDMARKS_TEXTURE_WIDTH * landmarksTextureHeight * 4;
			landmarksDataArray = new Float32Array(textureSize);

			shaderPad.initializeTexture(
				'u_faceLandmarksTex',
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

			await initializeFaceLandmarker();
		});

		shaderPad.registerHook('updateTextures', async (updates: Record<string, TextureSource>) => {
			const source = updates[textureName];
			if (!source) return;

			const previousSource = textureSources.get(textureName);
			if (previousSource !== source) {
				lastVideoTime = -1;
			}

			textureSources.set(textureName, source);
			if (!faceLandmarker) return;
			try {
				const requiredMode = source instanceof HTMLVideoElement ? 'VIDEO' : 'IMAGE';
				if (runningMode !== requiredMode) {
					runningMode = requiredMode;
					await faceLandmarker.setOptions({ runningMode: runningMode });
				}

				if (source instanceof HTMLVideoElement) {
					if (source.videoWidth === 0 || source.videoHeight === 0 || source.readyState < 2) {
						return;
					}
					if (source.currentTime !== lastVideoTime) {
						lastVideoTime = source.currentTime;
						const timestamp = performance.now();
						const result = faceLandmarker.detectForVideo(source, timestamp);
						processFaceResults(result);
					}
				} else if (source instanceof HTMLImageElement || source instanceof HTMLCanvasElement) {
					if (source.width === 0 || source.height === 0) {
						return;
					}
					const result = faceLandmarker.detect(source);
					processFaceResults(result);
				}
			} catch (error) {
				console.warn('Face detection error:', error);
			}
		});

		shaderPad.registerHook('destroy', () => {
			if (faceLandmarker) {
				faceLandmarker.close();
				faceLandmarker = null;
			}
			vision = null;
			textureSources.clear();
			faceMaskCanvas.remove();
			landmarksDataArray = null;
		});

		injectGLSL(`
uniform int u_maxFaces;
uniform int u_nFaces;
uniform sampler2D u_faceLandmarksTex;
uniform sampler2D u_faceMask;

#define FACE_LANDMARK_L_EYE_CENTER ${LANDMARK_INDICES.LEFT_EYE_CENTER}
#define FACE_LANDMARK_R_EYE_CENTER ${LANDMARK_INDICES.RIGHT_EYE_CENTER}
#define FACE_LANDMARK_NOSE_TIP ${LANDMARK_INDICES.NOSE_TIP}
#define FACE_LANDMARK_FACE_CENTER ${LANDMARK_INDICES.FACE_CENTER}
#define FACE_LANDMARK_MOUTH_CENTER ${LANDMARK_INDICES.MOUTH_CENTER}

vec4 faceLandmark(int faceIndex, int landmarkIndex) {
	int i = faceIndex * ${LANDMARK_COUNT} + landmarkIndex;
	int x = i % ${LANDMARKS_TEXTURE_WIDTH};
	int y = i / ${LANDMARKS_TEXTURE_WIDTH};
	return texelFetch(u_faceLandmarksTex, ivec2(x, y), 0);
}
float inFace(vec2 pos) { return texture(u_faceMask, pos).g; }
float inEye(vec2 pos) { return texture(u_faceMask, pos).b; }
float inMouth(vec2 pos) { return texture(u_faceMask, pos).r; }`);
	};
}

export default face;
