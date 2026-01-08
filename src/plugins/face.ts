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

const LEFT_EYEBROW_INDICES = [336, 296, 334, 293, 300, 276, 283, 282, 295, 285] as const;
const LEFT_EYE_INDICES = [362, 398, 384, 385, 386, 387, 388, 466, 263, 249, 390, 373, 374, 380, 381, 382] as const;
const RIGHT_EYEBROW_INDICES = [70, 63, 105, 66, 107, 55, 65, 52, 53, 46] as const;
const RIGHT_EYE_INDICES = [33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7] as const;
const OUTER_MOUTH_INDICES = [
	61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146,
] as const;
const INNER_MOUTH_INDICES = [
	78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95,
] as const;
const ALL_STANDARD_INDICES = Array.from({ length: STANDARD_LANDMARK_COUNT }, (_, i) => i);
const LANDMARK_INDICES = {
	LEFT_EYEBROW: LEFT_EYEBROW_INDICES,
	LEFT_EYE: LEFT_EYE_INDICES,
	LEFT_EYE_CENTER: 473,
	RIGHT_EYEBROW: RIGHT_EYEBROW_INDICES,
	RIGHT_EYE: RIGHT_EYE_INDICES,
	RIGHT_EYE_CENTER: 468,
	NOSE_TIP: 4,
	OUTER_MOUTH: OUTER_MOUTH_INDICES,
	INNER_MOUTH: INNER_MOUTH_INDICES,
	// Custom landmarks.
	FACE_CENTER: STANDARD_LANDMARK_COUNT,
	MOUTH_CENTER: STANDARD_LANDMARK_COUNT + 1,
};

// Face region types for R channel encoding (evenly spaced 0-1).
const FACE_REGION_NAMES = [
	'BACKGROUND',
	'LEFT_EYEBROW',
	'RIGHT_EYEBROW',
	'LEFT_EYE',
	'RIGHT_EYE',
	'OUTER_MOUTH',
	'INNER_MOUTH',
] as const;
const nFaceRegions = FACE_REGION_NAMES.length - 1;
const FACE_REGION = Object.fromEntries(FACE_REGION_NAMES.map((name, i) => [name, i / nFaceRegions])) as Record<
	(typeof FACE_REGION_NAMES)[number],
	number
>;
const HALF_GAP = 0.5 / nFaceRegions;

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

		const mediaPipeCanvas = new OffscreenCanvas(1, 1);
		const faceMaskCanvas = document.createElement('canvas');
		const faceMaskCtx = faceMaskCanvas.getContext('2d')!;

		let faceTesselationIndices: number[] | null = null;
		let faceOvalIndices: number[] | null = null;
		async function initializeFaceLandmarker() {
			try {
				const { FilesetResolver, FaceLandmarker } = await import('@mediapipe/tasks-vision');
				vision = await FilesetResolver.forVisionTasks(
					'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
				);

				faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
					baseOptions: {
						modelAssetPath: options?.modelPath || defaultModelPath,
						delegate: 'GPU',
					},
					canvas: mediaPipeCanvas,
					runningMode: runningMode,
					numFaces: options?.maxFaces ?? 1,
					minFaceDetectionConfidence: options?.minFaceDetectionConfidence ?? 0.5,
					minFacePresenceConfidence: options?.minFacePresenceConfidence ?? 0.5,
					minTrackingConfidence: options?.minTrackingConfidence ?? 0.5,
					outputFaceBlendshapes: options?.outputFaceBlendshapes ?? false,
					outputFacialTransformationMatrixes: options?.outputFacialTransformationMatrixes ?? false,
				});

				faceTesselationIndices = FaceLandmarker.FACE_LANDMARKS_TESSELATION.map(({ start }) => start);
				faceOvalIndices = FaceLandmarker.FACE_LANDMARKS_FACE_OVAL.map(({ start }) => start);
			} catch (error) {
				console.error('[Face Plugin] Failed to initialize:', error);
				throw error;
			}
		}

		function calculateBoundingBoxCenter(
			landmarksDataArray: Float32Array,
			faceIdx: number,
			landmarkIndices: readonly number[] | number[]
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

		function fillRegion(
			faceIdx: number,
			landmarkIndices: readonly number[] | number[],
			color: { r: number; g: number; b: number }
		) {
			if (!landmarksDataArray) return;

			const { width, height } = faceMaskCanvas;
			faceMaskCtx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;

			faceMaskCtx.beginPath();
			const originIdx = (faceIdx * LANDMARK_COUNT + landmarkIndices[0]) * 4;
			faceMaskCtx.moveTo(landmarksDataArray[originIdx] * width, landmarksDataArray[originIdx + 1] * height);

			for (let i = 1; i < landmarkIndices.length; ++i) {
				const destIdx = (faceIdx * LANDMARK_COUNT + landmarkIndices[i]) * 4;
				faceMaskCtx.lineTo(landmarksDataArray[destIdx] * width, landmarksDataArray[destIdx + 1] * height);
			}
			faceMaskCtx.closePath();
			faceMaskCtx.fill();
		}

		function updateMaskTexture(nFaces: number) {
			if (!landmarksDataArray || !faceTesselationIndices || !faceOvalIndices) return;

			const { width, height } = faceMaskCanvas;
			faceMaskCtx.clearRect(0, 0, width, height);

			faceMaskCtx.save();
			faceMaskCtx.globalCompositeOperation = 'lighten';

			for (let faceIdx = 0; faceIdx < nFaces; ++faceIdx) {
				const b = Math.round(((faceIdx + 1) / maxFaces) * 255);

				// Draw face regions in order (features on top).
				// First: face mesh and oval (for G channel - face mask).
				fillRegion(faceIdx, faceTesselationIndices, { r: 0, g: 128, b });
				fillRegion(faceIdx, faceOvalIndices, { r: 0, g: 255, b });

				// Then: specific regions (for R channel - region type).
				fillRegion(faceIdx, LEFT_EYEBROW_INDICES, { r: Math.round(FACE_REGION.LEFT_EYEBROW * 255), g: 0, b });
				fillRegion(faceIdx, RIGHT_EYEBROW_INDICES, { r: Math.round(FACE_REGION.RIGHT_EYEBROW * 255), g: 0, b });
				fillRegion(faceIdx, LEFT_EYE_INDICES, { r: Math.round(FACE_REGION.LEFT_EYE * 255), g: 0, b });
				fillRegion(faceIdx, RIGHT_EYE_INDICES, { r: Math.round(FACE_REGION.RIGHT_EYE * 255), g: 0, b });
				fillRegion(faceIdx, OUTER_MOUTH_INDICES, { r: Math.round(FACE_REGION.OUTER_MOUTH * 255), g: 0, b });
				fillRegion(faceIdx, INNER_MOUTH_INDICES, { r: Math.round(FACE_REGION.INNER_MOUTH * 255), g: 0, b });
			}

			faceMaskCtx.restore();
			shaderPad.updateTextures({ u_faceMask: faceMaskCanvas });
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
					landmarksDataArray[dataIdx] = landmark.x;
					landmarksDataArray[dataIdx + 1] = 1 - landmark.y;
					landmarksDataArray[dataIdx + 2] = landmark.z ?? 0;
					landmarksDataArray[dataIdx + 3] = landmark.visibility ?? 1;
				}

				const faceCenter = calculateBoundingBoxCenter(landmarksDataArray, faceIdx, ALL_STANDARD_INDICES);
				const faceCenterIdx = (faceIdx * LANDMARK_COUNT + LANDMARK_INDICES.FACE_CENTER) * 4;
				landmarksDataArray[faceCenterIdx] = faceCenter[0];
				landmarksDataArray[faceCenterIdx + 1] = faceCenter[1];
				landmarksDataArray[faceCenterIdx + 2] = faceCenter[2];
				landmarksDataArray[faceCenterIdx + 3] = faceCenter[3];

				const mouthCenter = calculateBoundingBoxCenter(landmarksDataArray, faceIdx, INNER_MOUTH_INDICES);
				const mouthCenterIdx = (faceIdx * LANDMARK_COUNT + LANDMARK_INDICES.MOUTH_CENTER) * 4;
				landmarksDataArray[mouthCenterIdx] = mouthCenter[0];
				landmarksDataArray[mouthCenterIdx + 1] = mouthCenter[1];
				landmarksDataArray[mouthCenterIdx + 2] = mouthCenter[2];
				landmarksDataArray[mouthCenterIdx + 3] = mouthCenter[3];
			}

			const rowsToUpdate = Math.ceil(totalLandmarks / LANDMARKS_TEXTURE_WIDTH);
			shaderPad.updateTextures({
				u_faceLandmarksTex: {
					data: landmarksDataArray,
					width: LANDMARKS_TEXTURE_WIDTH,
					height: rowsToUpdate,
					isPartial: true,
				},
			});
		}

		function processFaceResults(result: FaceLandmarkerResult) {
			if (!result.faceLandmarks || !landmarksDataArray) return;

			faceMaskCanvas.width = mediaPipeCanvas.width;
			faceMaskCanvas.height = mediaPipeCanvas.height;

			const nFaces = result.faceLandmarks.length;
			updateLandmarksTexture(result.faceLandmarks);
			updateMaskTexture(nFaces);
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
						const result = faceLandmarker.detectForVideo(source, performance.now());
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
				console.error('[Face Plugin] Detection error:', error);
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

		const regionCheck = (val: number) =>
			`(mask.r > ${(val - HALF_GAP).toFixed(4)} && mask.r < ${(val + HALF_GAP).toFixed(
				4
			)})  ? vec2(1.0, faceIndex) : vec2(0.0, -1.0)`;

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

vec2 leftEyebrowAt(vec2 pos) {
	vec4 mask = texture(u_faceMask, pos);
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return ${regionCheck(FACE_REGION.LEFT_EYEBROW)};
}

vec2 rightEyebrowAt(vec2 pos) {
	vec4 mask = texture(u_faceMask, pos);
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return ${regionCheck(FACE_REGION.RIGHT_EYEBROW)};
}

vec2 leftEyeAt(vec2 pos) {
	vec4 mask = texture(u_faceMask, pos);
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return ${regionCheck(FACE_REGION.LEFT_EYE)};
}

vec2 rightEyeAt(vec2 pos) {
	vec4 mask = texture(u_faceMask, pos);
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return ${regionCheck(FACE_REGION.RIGHT_EYE)};
}

vec2 outerMouthAt(vec2 pos) {
	vec4 mask = texture(u_faceMask, pos);
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return ${regionCheck(FACE_REGION.OUTER_MOUTH)};
}

vec2 innerMouthAt(vec2 pos) {
	vec4 mask = texture(u_faceMask, pos);
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return ${regionCheck(FACE_REGION.INNER_MOUTH)};
}

vec2 faceOvalAt(vec2 pos) {
	vec4 mask = texture(u_faceMask, pos);
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return mask.g > 0.75 ? vec2(1.0, faceIndex) : vec2(0.0, -1.0);
}

// Includes face mesh and oval.
vec2 faceAt(vec2 pos) {
	vec4 mask = texture(u_faceMask, pos);
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return mask.g > 0.25 ? vec2(1.0, faceIndex) : vec2(0.0, -1.0);
}

vec2 eyeAt(vec2 pos) {
	vec2 left = leftEyeAt(pos);
	vec2 right = rightEyeAt(pos);
	return left.x >= 0.0 ? left : right;
}

vec2 eyebrowAt(vec2 pos) {
	vec2 left = leftEyebrowAt(pos);
	vec2 right = rightEyebrowAt(pos);
	return left.x >= 0.0 ? left : right;
}

float inEyebrow(vec2 pos) {
	return eyebrowAt(pos).x;
}

float inEye(vec2 pos) {
	return eyeAt(pos).x;
}

float inMouth(vec2 pos) {
	return innerMouthAt(pos).x;
}

float inLips(vec2 pos) {
	float lips = outerMouthAt(pos).x;
	float mouth = innerMouthAt(pos).x;
	return max(0.0, lips - mouth);
}

float inFace(vec2 pos) {
	return faceAt(pos).x;
}`);
	};
}

export default face;
