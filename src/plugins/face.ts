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
const LANDMARKS_TEXTURE_WIDTH = 512;

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

const REGION_NAMES = [
	'BACKGROUND',
	'LEFT_EYEBROW',
	'RIGHT_EYEBROW',
	'LEFT_EYE',
	'RIGHT_EYE',
	'OUTER_MOUTH',
	'INNER_MOUTH',
] as const;
const nFaceRegions = REGION_NAMES.length - 1;
const RED_CHANNEL_VALUES = Object.fromEntries(REGION_NAMES.map((name, i) => [name, i / nFaceRegions])) as Record<
	(typeof REGION_NAMES)[number],
	number
>;
const HALF_GAP = 0.5 / nFaceRegions;

function fanTriangulate(indices: readonly number[]): number[] {
	const tris: number[] = [];
	for (let i = 1; i < indices.length - 1; ++i) {
		tris.push(indices[0], indices[i], indices[i + 1]);
	}
	return tris;
}

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

		let landmarksTextureHeight = 0;
		let landmarksDataArray: Float32Array | null = null;

		const mediaPipeCanvas = new OffscreenCanvas(1, 1);
		const maskCanvas = new OffscreenCanvas(1, 1);

		// WebGL resources for triangle rendering (no antialiasing).
		let maskGl: WebGL2RenderingContext | null = null;
		let maskProgram: WebGLProgram | null = null;
		let positionBuffer: WebGLBuffer | null = null;
		let colorLocation: WebGLUniformLocation | null = null;

		const regionTriangles: Record<string, number[]> = {
			LEFT_EYEBROW: fanTriangulate(LEFT_EYEBROW_INDICES),
			RIGHT_EYEBROW: fanTriangulate(RIGHT_EYEBROW_INDICES),
			LEFT_EYE: fanTriangulate(LEFT_EYE_INDICES),
			RIGHT_EYE: fanTriangulate(RIGHT_EYE_INDICES),
			OUTER_MOUTH: fanTriangulate(OUTER_MOUTH_INDICES),
			INNER_MOUTH: fanTriangulate(INNER_MOUTH_INDICES),
			// Populated after FaceLandmarker loads.
			TESSELATION: [],
			OVAL: [],
		};

		function initMaskRenderer() {
			maskGl = maskCanvas.getContext('webgl2', { antialias: false, preserveDrawingBuffer: true });
			if (!maskGl) throw new Error('Failed to get WebGL2 context for mask');

			const vertexShader = maskGl.createShader(maskGl.VERTEX_SHADER)!;
			maskGl.shaderSource(
				vertexShader,
				`#version 300 es
in vec2 a_pos;
void main() {
	gl_Position = vec4(a_pos * 2.0 - 1.0, 0.0, 1.0);
}`
			);
			maskGl.compileShader(vertexShader);

			const fragmentShader = maskGl.createShader(maskGl.FRAGMENT_SHADER)!;
			maskGl.shaderSource(
				fragmentShader,
				`#version 300 es
precision mediump float;
uniform vec4 u_color;
out vec4 outColor;
void main() { outColor = u_color; }`
			);
			maskGl.compileShader(fragmentShader);

			maskProgram = maskGl.createProgram()!;
			maskGl.attachShader(maskProgram, vertexShader);
			maskGl.attachShader(maskProgram, fragmentShader);
			maskGl.linkProgram(maskProgram);
			maskGl.deleteShader(vertexShader);
			maskGl.deleteShader(fragmentShader);

			positionBuffer = maskGl.createBuffer();
			maskGl.bindBuffer(maskGl.ARRAY_BUFFER, positionBuffer);
			const positionLocation = maskGl.getAttribLocation(maskProgram, 'a_pos');
			maskGl.enableVertexAttribArray(positionLocation);
			maskGl.vertexAttribPointer(positionLocation, 2, maskGl.FLOAT, false, 0, 0);

			colorLocation = maskGl.getUniformLocation(maskProgram, 'u_color');
			maskGl.useProgram(maskProgram);

			// Enable blending to handle overlapping faces (set once, never disabled).
			maskGl.enable(maskGl.BLEND);
			maskGl.blendEquation(maskGl.MAX);
		}

		function drawTriangles(triangleIndices: number[], faceIdx: number, r: number, g: number, b: number) {
			if (!maskGl || !landmarksDataArray || triangleIndices.length === 0) return;

			const vertices = new Float32Array(triangleIndices.length * 2);
			for (let i = 0; i < triangleIndices.length; ++i) {
				const landmarkIdx = (faceIdx * LANDMARK_COUNT + triangleIndices[i]) * 4;
				vertices[i * 2] = landmarksDataArray[landmarkIdx];
				vertices[i * 2 + 1] = landmarksDataArray[landmarkIdx + 1];
			}

			maskGl.bufferData(maskGl.ARRAY_BUFFER, vertices, maskGl.DYNAMIC_DRAW);
			maskGl.uniform4f(colorLocation, r, g, b, 1.0);
			maskGl.drawArrays(maskGl.TRIANGLES, 0, triangleIndices.length);
		}

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

				const tesselationConnections = FaceLandmarker.FACE_LANDMARKS_TESSELATION;
				regionTriangles.TESSELATION = [];
				for (let i = 0; i < tesselationConnections.length - 2; i += 3) {
					regionTriangles.TESSELATION.push(
						tesselationConnections[i].start,
						tesselationConnections[i + 1].start,
						tesselationConnections[i + 2].start
					);
				}

				const ovalIndices = FaceLandmarker.FACE_LANDMARKS_FACE_OVAL.map(({ start }) => start);
				regionTriangles.OVAL = fanTriangulate(ovalIndices);

				initMaskRenderer();
			} catch (error) {
				console.error('[Face Plugin] Failed to initialize:', error);
				throw error;
			}
		}

		function calculateBoundingBoxCenter(
			data: Float32Array,
			faceIdx: number,
			indices: readonly number[] | number[]
		): [number, number, number, number] {
			let minX = Infinity,
				maxX = -Infinity,
				minY = Infinity,
				maxY = -Infinity,
				avgZ = 0,
				avgVisibility = 0;

			for (const idx of indices) {
				const i = (faceIdx * LANDMARK_COUNT + idx) * 4;
				const x = data[i],
					y = data[i + 1];
				minX = Math.min(minX, x);
				maxX = Math.max(maxX, x);
				minY = Math.min(minY, y);
				maxY = Math.max(maxY, y);
				avgZ += data[i + 2];
				avgVisibility += data[i + 3];
			}
			return [(minX + maxX) / 2, (minY + maxY) / 2, avgZ / indices.length, avgVisibility / indices.length];
		}

		function updateLandmarksTexture(faces: NormalizedLandmark[][]) {
			if (!landmarksDataArray) return;

			const nFaces = faces.length;
			const totalLandmarks = nFaces * LANDMARK_COUNT;

			for (let faceIdx = 0; faceIdx < nFaces; ++faceIdx) {
				const landmarks = faces[faceIdx];
				for (let landmarkIdx = 0; landmarkIdx < STANDARD_LANDMARK_COUNT; ++landmarkIdx) {
					const landmark = landmarks[landmarkIdx];
					const dataIdx = (faceIdx * LANDMARK_COUNT + landmarkIdx) * 4;
					landmarksDataArray[dataIdx] = landmark.x;
					landmarksDataArray[dataIdx + 1] = 1 - landmark.y;
					landmarksDataArray[dataIdx + 2] = landmark.z ?? 0;
					landmarksDataArray[dataIdx + 3] = landmark.visibility ?? 1;
				}

				const faceCenter = calculateBoundingBoxCenter(landmarksDataArray, faceIdx, ALL_STANDARD_INDICES);
				landmarksDataArray.set(faceCenter, (faceIdx * LANDMARK_COUNT + LANDMARK_INDICES.FACE_CENTER) * 4);

				const mouthCenter = calculateBoundingBoxCenter(landmarksDataArray, faceIdx, INNER_MOUTH_INDICES);
				landmarksDataArray.set(mouthCenter, (faceIdx * LANDMARK_COUNT + LANDMARK_INDICES.MOUTH_CENTER) * 4);
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

		function updateMaskTexture(nFaces: number) {
			if (!maskGl || !landmarksDataArray) return;

			// Resize and clear.
			maskCanvas.width = mediaPipeCanvas.width;
			maskCanvas.height = mediaPipeCanvas.height;
			maskGl.viewport(0, 0, maskCanvas.width, maskCanvas.height);
			maskGl.clearColor(0, 0, 0, 0);
			maskGl.clear(maskGl.COLOR_BUFFER_BIT);

			for (let faceIdx = 0; faceIdx < nFaces; ++faceIdx) {
				const b = (faceIdx + 1) / maxFaces;

				// G channel: face mesh (0.5) and oval (1.0)
				drawTriangles(regionTriangles.TESSELATION, faceIdx, 0, 0.5, b);
				drawTriangles(regionTriangles.OVAL, faceIdx, 0, 1.0, b);

				// R channel: feature regions
				drawTriangles(regionTriangles.LEFT_EYEBROW, faceIdx, RED_CHANNEL_VALUES.LEFT_EYEBROW, 0, b);
				drawTriangles(regionTriangles.RIGHT_EYEBROW, faceIdx, RED_CHANNEL_VALUES.RIGHT_EYEBROW, 0, b);
				drawTriangles(regionTriangles.LEFT_EYE, faceIdx, RED_CHANNEL_VALUES.LEFT_EYE, 0, b);
				drawTriangles(regionTriangles.RIGHT_EYE, faceIdx, RED_CHANNEL_VALUES.RIGHT_EYE, 0, b);
				drawTriangles(regionTriangles.OUTER_MOUTH, faceIdx, RED_CHANNEL_VALUES.OUTER_MOUTH, 0, b);
				drawTriangles(regionTriangles.INNER_MOUTH, faceIdx, RED_CHANNEL_VALUES.INNER_MOUTH, 0, b);
			}

			shaderPad.updateTextures({ u_faceMask: maskCanvas });
		}

		function processFaceResults(result: FaceLandmarkerResult) {
			if (!result.faceLandmarks || !landmarksDataArray) return;

			const nFaces = result.faceLandmarks.length;
			updateLandmarksTexture(result.faceLandmarks);
			updateMaskTexture(nFaces);
			shaderPad.updateUniforms({ u_nFaces: nFaces });

			options?.onResults?.(result);
		}

		shaderPad.registerHook('init', async () => {
			shaderPad.initializeTexture('u_faceMask', maskCanvas, {
				minFilter: gl.NEAREST,
				magFilter: gl.NEAREST,
			});
			shaderPad.initializeUniform('u_maxFaces', 'int', maxFaces);
			shaderPad.initializeUniform('u_nFaces', 'int', 0);

			const totalLandmarks = maxFaces * LANDMARK_COUNT;
			landmarksTextureHeight = Math.ceil(totalLandmarks / LANDMARKS_TEXTURE_WIDTH);
			landmarksDataArray = new Float32Array(LANDMARKS_TEXTURE_WIDTH * landmarksTextureHeight * 4);

			shaderPad.initializeTexture(
				'u_faceLandmarksTex',
				{ data: landmarksDataArray, width: LANDMARKS_TEXTURE_WIDTH, height: landmarksTextureHeight },
				{ internalFormat: gl.RGBA32F, type: gl.FLOAT, minFilter: gl.NEAREST, magFilter: gl.NEAREST }
			);

			await initializeFaceLandmarker();
		});

		shaderPad.registerHook('updateTextures', async (updates: Record<string, TextureSource>) => {
			const source = updates[textureName];
			if (!source) return;

			const previousSource = textureSources.get(textureName);
			if (previousSource !== source) lastVideoTime = -1;
			textureSources.set(textureName, source);
			if (!faceLandmarker) return;

			try {
				const requiredMode = source instanceof HTMLVideoElement ? 'VIDEO' : 'IMAGE';
				if (runningMode !== requiredMode) {
					runningMode = requiredMode;
					await faceLandmarker.setOptions({ runningMode });
				}

				if (source instanceof HTMLVideoElement) {
					if (source.videoWidth === 0 || source.videoHeight === 0 || source.readyState < 2) return;
					if (source.currentTime !== lastVideoTime) {
						lastVideoTime = source.currentTime;
						processFaceResults(faceLandmarker.detectForVideo(source, performance.now()));
					}
				} else if (source instanceof HTMLImageElement || source instanceof HTMLCanvasElement) {
					if (source.width === 0 || source.height === 0) return;
					processFaceResults(faceLandmarker.detect(source));
				}
			} catch (error) {
				console.error('[Face Plugin] Detection error:', error);
			}
		});

		shaderPad.registerHook('destroy', () => {
			faceLandmarker?.close();
			faceLandmarker = null;
			if (maskGl && maskProgram) {
				maskGl.deleteProgram(maskProgram);
				maskGl.deleteBuffer(positionBuffer);
			}
			maskGl = null;
			maskProgram = null;
			vision = null;
			textureSources.clear();
			landmarksDataArray = null;
		});

		const checkAt = (
			regionMin: keyof typeof RED_CHANNEL_VALUES,
			regionMax: keyof typeof RED_CHANNEL_VALUES = regionMin
		) =>
			`vec4 mask = texture(u_faceMask, pos);
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return (mask.r > ${(RED_CHANNEL_VALUES[regionMin] - HALF_GAP).toFixed(4)} && mask.r < ${(
				RED_CHANNEL_VALUES[regionMax] + HALF_GAP
			).toFixed(4)}) ? vec2(1.0, faceIndex) : vec2(0.0, -1.0);`;

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
	${checkAt('LEFT_EYEBROW')}
}

vec2 rightEyebrowAt(vec2 pos) {
	${checkAt('RIGHT_EYEBROW')}
}

vec2 leftEyeAt(vec2 pos) {
	${checkAt('LEFT_EYE')}
}

vec2 rightEyeAt(vec2 pos) {
	${checkAt('RIGHT_EYE')}
}

vec2 lipsAt(vec2 pos) {
	${checkAt('OUTER_MOUTH')}
}

vec2 outerMouthAt(vec2 pos) {
	${checkAt('OUTER_MOUTH', 'INNER_MOUTH')}
}

vec2 innerMouthAt(vec2 pos) {
	${checkAt('INNER_MOUTH')}
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
	return left.x > 0.0 ? left : rightEyeAt(pos);
}

vec2 eyebrowAt(vec2 pos) {
	vec2 left = leftEyebrowAt(pos);
	return left.x > 0.0 ? left : rightEyebrowAt(pos);
}

float inEyebrow(vec2 pos) { return eyebrowAt(pos).x; }
float inEye(vec2 pos) { return eyeAt(pos).x; }
float inOuterMouth(vec2 pos) { return outerMouthAt(pos).x; }
float inInnerMouth(vec2 pos) { return innerMouthAt(pos).x; }
float inLips(vec2 pos) { return lipsAt(pos).x; }
float inFace(vec2 pos) { return faceAt(pos).x; }`);
	};
}

export default face;
