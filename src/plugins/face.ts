import ShaderPad, { PluginContext, TextureSource } from '..';
import {
	calculateBoundingBoxCenter,
	getSharedFileset,
	hashOptions,
	isMediaPipeSource,
	MediaPipeSource,
} from './mediapipe-common';
import type { FaceLandmarker, FaceLandmarkerResult, NormalizedLandmark } from '@mediapipe/tasks-vision';

export interface FacePluginOptions {
	modelPath?: string;
	maxFaces?: number;
	minFaceDetectionConfidence?: number;
	minFacePresenceConfidence?: number;
	minTrackingConfidence?: number;
	outputFaceBlendshapes?: boolean;
	outputFacialTransformationMatrixes?: boolean;
}

const MASK_VERTEX_SHADER = `#version 300 es
in vec2 a_pos;
void main() { gl_Position = vec4(a_pos * 2.0 - 1.0, 0.0, 1.0); }`;
const MASK_FRAGMENT_SHADER = `#version 300 es
precision mediump float;
uniform vec4 u_color;
out vec4 outColor;
void main() { outColor = u_color; }`;

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

const DEFAULT_FACE_OPTIONS: Required<FacePluginOptions> = {
	modelPath:
		'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task',
	maxFaces: 1,
	minFaceDetectionConfidence: 0.5,
	minFacePresenceConfidence: 0.5,
	minTrackingConfidence: 0.5,
	outputFaceBlendshapes: false,
	outputFacialTransformationMatrixes: false,
};

function fanTriangulate(indices: readonly number[]): number[] {
	const tris: number[] = [];
	for (let i = 1; i < indices.length - 1; ++i) {
		tris.push(indices[0], indices[i], indices[i + 1]);
	}
	return tris;
}

type FaceRegion = { triangles: number[]; vertices: Float32Array };
let faceRegions: Record<string, FaceRegion> | null = null;
function initFaceRegions(LandmarkerClass: typeof FaceLandmarker): void {
	if (!faceRegions) {
		const tesselationConnections = LandmarkerClass.FACE_LANDMARKS_TESSELATION;
		const tesselation: number[] = [];
		for (let i = 0; i < tesselationConnections.length - 2; i += 3) {
			tesselation.push(
				tesselationConnections[i].start,
				tesselationConnections[i + 1].start,
				tesselationConnections[i + 2].start
			);
		}
		const ovalIndices = LandmarkerClass.FACE_LANDMARKS_FACE_OVAL.map(({ start }) => start);
		faceRegions = Object.fromEntries(
			Object.entries({
				LEFT_EYEBROW: fanTriangulate(LEFT_EYEBROW_INDICES),
				RIGHT_EYEBROW: fanTriangulate(RIGHT_EYEBROW_INDICES),
				LEFT_EYE: fanTriangulate(LEFT_EYE_INDICES),
				RIGHT_EYE: fanTriangulate(RIGHT_EYE_INDICES),
				OUTER_MOUTH: fanTriangulate(OUTER_MOUTH_INDICES),
				INNER_MOUTH: fanTriangulate(INNER_MOUTH_INDICES),
				TESSELATION: tesselation,
				OVAL: fanTriangulate(ovalIndices),
			}).map(([key, triangles]) => [key, { triangles, vertices: new Float32Array(triangles.length * 2) }])
		);
	}
}

interface Detector {
	landmarker: FaceLandmarker;
	canvas: OffscreenCanvas;
	subscribers: Map<() => void, boolean>;
	maxFaces: number;
	state: {
		runningMode: 'IMAGE' | 'VIDEO';
		source: MediaPipeSource | null;
		videoTime: number;
		resultTimestamp: number;
		result: FaceLandmarkerResult | null;
		pending: Promise<void>;
		nFaces: number;
	};
	landmarks: {
		data: Float32Array;
		textureHeight: number;
	};
	mask: {
		canvas: OffscreenCanvas;
		gl: WebGL2RenderingContext;
		program: WebGLProgram;
		positionBuffer: WebGLBuffer;
		colorLocation: WebGLUniformLocation;
	};
}
const sharedDetectors = new Map<string, Detector>();

function initMaskRenderer(detector: Detector) {
	const gl = detector.mask.canvas.getContext('webgl2', { antialias: false, preserveDrawingBuffer: true })!;

	const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
	gl.shaderSource(vertexShader, MASK_VERTEX_SHADER);
	gl.compileShader(vertexShader);

	const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
	gl.shaderSource(fragmentShader, MASK_FRAGMENT_SHADER);
	gl.compileShader(fragmentShader);

	const program = gl.createProgram()!;
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	gl.deleteShader(vertexShader);
	gl.deleteShader(fragmentShader);

	const positionBuffer = gl.createBuffer()!;
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	const positionLocation = gl.getAttribLocation(program, 'a_pos');
	gl.enableVertexAttribArray(positionLocation);
	gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

	const colorLocation = gl.getUniformLocation(program, 'u_color')!;
	gl.useProgram(program);
	gl.enable(gl.BLEND);
	gl.blendEquation(gl.MAX);

	detector.mask = { ...detector.mask, gl, program, positionBuffer, colorLocation };
}

function drawTriangles(detector: Detector, faceRegion: FaceRegion, faceIdx: number, r: number, g: number, b: number) {
	const { triangles, vertices } = faceRegion;
	const {
		mask: { gl, colorLocation },
		landmarks,
	} = detector;
	const { data: landmarksDataArray } = landmarks;

	for (let i = 0; i < triangles.length; ++i) {
		const landmarkIdx = (faceIdx * LANDMARK_COUNT + triangles[i]) * 4;
		vertices[i * 2] = landmarksDataArray[landmarkIdx];
		vertices[i * 2 + 1] = landmarksDataArray[landmarkIdx + 1];
	}

	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
	gl.uniform4f(colorLocation, r, g, b, 1.0);
	gl.drawArrays(gl.TRIANGLES, 0, triangles.length);
}

function updateLandmarksData(detector: Detector, faces: NormalizedLandmark[][]) {
	const data = detector.landmarks.data;
	const nFaces = faces.length;

	for (let faceIdx = 0; faceIdx < nFaces; ++faceIdx) {
		const landmarks = faces[faceIdx];
		for (let landmarkIdx = 0; landmarkIdx < STANDARD_LANDMARK_COUNT; ++landmarkIdx) {
			const landmark = landmarks[landmarkIdx];
			const dataIdx = (faceIdx * LANDMARK_COUNT + landmarkIdx) * 4;
			data[dataIdx] = landmark.x;
			data[dataIdx + 1] = 1 - landmark.y;
			data[dataIdx + 2] = landmark.z ?? 0;
			data[dataIdx + 3] = landmark.visibility ?? 1;
		}

		const faceCenter = calculateBoundingBoxCenter(data, faceIdx, ALL_STANDARD_INDICES, LANDMARK_COUNT);
		data.set(faceCenter, (faceIdx * LANDMARK_COUNT + LANDMARK_INDICES.FACE_CENTER) * 4);

		const mouthCenter = calculateBoundingBoxCenter(data, faceIdx, INNER_MOUTH_INDICES, LANDMARK_COUNT);
		data.set(mouthCenter, (faceIdx * LANDMARK_COUNT + LANDMARK_INDICES.MOUTH_CENTER) * 4);
	}

	detector.state.nFaces = nFaces;
}

function updateMaskCanvas(detector: Detector) {
	if (!faceRegions) return;
	const {
		mask,
		canvas,
		maxFaces,
		state: { nFaces },
	} = detector;
	const { gl: maskGl, canvas: maskCanvas } = mask;

	maskCanvas.width = canvas.width;
	maskCanvas.height = canvas.height;
	maskGl.viewport(0, 0, maskCanvas.width, maskCanvas.height);
	maskGl.clearColor(0, 0, 0, 0);
	maskGl.clear(maskGl.COLOR_BUFFER_BIT);

	for (let faceIdx = 0; faceIdx < nFaces; ++faceIdx) {
		const b = (faceIdx + 1) / maxFaces;

		// G channel: face mesh (0.5) and oval (1.0)
		drawTriangles(detector, faceRegions.TESSELATION, faceIdx, 0, 0.5, b);
		drawTriangles(detector, faceRegions.OVAL, faceIdx, 0, 1.0, b);

		// R channel: feature regions
		drawTriangles(detector, faceRegions.LEFT_EYEBROW, faceIdx, RED_CHANNEL_VALUES.LEFT_EYEBROW, 0, b);
		drawTriangles(detector, faceRegions.RIGHT_EYEBROW, faceIdx, RED_CHANNEL_VALUES.RIGHT_EYEBROW, 0, b);
		drawTriangles(detector, faceRegions.LEFT_EYE, faceIdx, RED_CHANNEL_VALUES.LEFT_EYE, 0, b);
		drawTriangles(detector, faceRegions.RIGHT_EYE, faceIdx, RED_CHANNEL_VALUES.RIGHT_EYE, 0, b);
		drawTriangles(detector, faceRegions.OUTER_MOUTH, faceIdx, RED_CHANNEL_VALUES.OUTER_MOUTH, 0, b);
		drawTriangles(detector, faceRegions.INNER_MOUTH, faceIdx, RED_CHANNEL_VALUES.INNER_MOUTH, 0, b);
	}
}

function face(config: { textureName: string; options?: FacePluginOptions }) {
	const { textureName, options: configOptions = {} } = config;
	const options = { ...DEFAULT_FACE_OPTIONS, ...configOptions };
	const optionsKey = hashOptions({ ...options, textureName });

	const nLandmarksMax = options.maxFaces * LANDMARK_COUNT;
	const textureHeight = Math.ceil(nLandmarksMax / LANDMARKS_TEXTURE_WIDTH);

	return function (shaderPad: ShaderPad, context: PluginContext) {
		const { injectGLSL, gl, emitHook } = context;

		const existingDetector = sharedDetectors.get(optionsKey);
		const landmarksData =
			existingDetector?.landmarks.data ?? new Float32Array(LANDMARKS_TEXTURE_WIDTH * textureHeight * 4);
		const maskCanvas = existingDetector?.mask.canvas ?? new OffscreenCanvas(1, 1);
		let detector: Detector | null = null;

		function onResult() {
			if (!detector) return;
			const nFaces = detector.state.nFaces;
			const nLandmarks = nFaces * LANDMARK_COUNT;
			const rowsToUpdate = Math.ceil(nLandmarks / LANDMARKS_TEXTURE_WIDTH);
			shaderPad.updateTextures({
				u_faceLandmarksTex: {
					data: detector.landmarks.data,
					width: LANDMARKS_TEXTURE_WIDTH,
					height: rowsToUpdate,
					isPartial: nFaces < options.maxFaces,
				},
				u_faceMask: detector.mask.canvas,
			});
			shaderPad.updateUniforms({ u_nFaces: nFaces });
			emitHook('face:result', detector.state.result);
		}

		async function initializeDetector() {
			if (sharedDetectors.has(optionsKey)) {
				detector = sharedDetectors.get(optionsKey)!;
			} else {
				const [mediaPipe, { FaceLandmarker }] = await Promise.all([
					getSharedFileset(),
					import('@mediapipe/tasks-vision'),
				]);

				const mediapipeCanvas = new OffscreenCanvas(1, 1);
				const faceLandmarker = await FaceLandmarker.createFromOptions(mediaPipe, {
					baseOptions: {
						modelAssetPath: options.modelPath,
						delegate: 'GPU',
					},
					canvas: mediapipeCanvas,
					runningMode: 'VIDEO',
					numFaces: options.maxFaces,
					minFaceDetectionConfidence: options.minFaceDetectionConfidence,
					minFacePresenceConfidence: options.minFacePresenceConfidence,
					minTrackingConfidence: options.minTrackingConfidence,
					outputFaceBlendshapes: options.outputFaceBlendshapes,
					outputFacialTransformationMatrixes: options.outputFacialTransformationMatrixes,
				});

				detector = {
					landmarker: faceLandmarker,
					canvas: mediapipeCanvas,
					subscribers: new Map(),
					maxFaces: options.maxFaces,
					state: {
						runningMode: 'VIDEO',
						source: null,
						videoTime: -1,
						resultTimestamp: 0,
						result: null,
						pending: Promise.resolve(),
						nFaces: 0,
					},
					landmarks: {
						data: landmarksData,
						textureHeight,
					},
					mask: {
						canvas: maskCanvas,
					} as Detector['mask'],
				};

				initFaceRegions(FaceLandmarker);
				initMaskRenderer(detector);
				sharedDetectors.set(optionsKey, detector);
			}

			detector.subscribers.set(onResult, false);
		}
		const initPromise = initializeDetector();

		let nDetectionCalls = 0;
		async function detectFaces(source: MediaPipeSource) {
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
					let result: FaceLandmarkerResult | undefined;
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
						updateLandmarksData(detector, result.faceLandmarks);
						updateMaskCanvas(detector);
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

		shaderPad.on('init', () => {
			shaderPad.initializeUniform('u_maxFaces', 'int', options.maxFaces);
			shaderPad.initializeUniform('u_nFaces', 'int', 0);
			shaderPad.initializeTexture(
				'u_faceLandmarksTex',
				{ data: landmarksData, width: LANDMARKS_TEXTURE_WIDTH, height: textureHeight },
				{ internalFormat: gl.RGBA32F, type: gl.FLOAT, minFilter: gl.NEAREST, magFilter: gl.NEAREST }
			);
			shaderPad.initializeTexture('u_faceMask', maskCanvas, {
				minFilter: gl.NEAREST,
				magFilter: gl.NEAREST,
			});
			initPromise.then(() => emitHook('face:ready'));
		});

		shaderPad.on('initializeTexture', (name: string, source: TextureSource) => {
			if (name === textureName && isMediaPipeSource(source)) detectFaces(source);
		});

		shaderPad.on('updateTextures', (updates: Record<string, TextureSource>) => {
			const source = updates[textureName];
			if (isMediaPipeSource(source)) detectFaces(source);
		});

		shaderPad.on('destroy', () => {
			if (detector) {
				detector.subscribers.delete(onResult);
				if (detector.subscribers.size === 0) {
					detector.landmarker.close();
					detector.mask.gl.deleteProgram(detector.mask.program);
					detector.mask.gl.deleteBuffer(detector.mask.positionBuffer);
					sharedDetectors.delete(optionsKey);
				}
			}
			detector = null;
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
