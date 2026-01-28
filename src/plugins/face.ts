import ShaderPad, { PluginContext, TextureSource } from '..';
import {
	calculateBoundingBoxCenter,
	generateGLSLFn,
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
	history?: number;
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
const N_LANDMARK_METADATA_SLOTS = 1;

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

const DEFAULT_FACE_OPTIONS: Required<Omit<FacePluginOptions, 'history'>> = {
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

interface MaskRenderer {
	canvas: OffscreenCanvas;
	gl: WebGL2RenderingContext;
	program: WebGLProgram;
	positionBuffer: WebGLBuffer;
	colorLocation: WebGLUniformLocation;
}

interface Detector {
	landmarker: FaceLandmarker;
	mediapipeCanvas: OffscreenCanvas;
	mask: MaskRenderer;
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
}
const sharedDetectors = new Map<string, Detector>();

function initMaskRenderer(canvas: OffscreenCanvas): MaskRenderer {
	const gl = canvas.getContext('webgl2', { antialias: false, preserveDrawingBuffer: true })!;

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

	return { canvas, gl, program, positionBuffer, colorLocation };
}

function drawTriangles(
	mask: MaskRenderer,
	landmarksData: Float32Array,
	faceRegion: FaceRegion,
	faceIdx: number,
	r: number,
	g: number,
	b: number
) {
	const { triangles, vertices } = faceRegion;
	const { gl, colorLocation } = mask;

	for (let i = 0; i < triangles.length; ++i) {
		const landmarkIdx = (N_LANDMARK_METADATA_SLOTS + faceIdx * LANDMARK_COUNT + triangles[i]) * 4;
		vertices[i * 2] = landmarksData[landmarkIdx];
		vertices[i * 2 + 1] = landmarksData[landmarkIdx + 1];
	}

	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
	gl.uniform4f(colorLocation, r, g, b, 1.0);
	gl.drawArrays(gl.TRIANGLES, 0, triangles.length);
}

function updateLandmarksData(detector: Detector, faces: NormalizedLandmark[][]) {
	const data = detector.landmarks.data;
	const nFaces = faces.length;
	data[0] = nFaces;

	for (let faceIdx = 0; faceIdx < nFaces; ++faceIdx) {
		const landmarks = faces[faceIdx];
		for (let landmarkIdx = 0; landmarkIdx < STANDARD_LANDMARK_COUNT; ++landmarkIdx) {
			const landmark = landmarks[landmarkIdx];
			const dataIdx = (N_LANDMARK_METADATA_SLOTS + faceIdx * LANDMARK_COUNT + landmarkIdx) * 4;
			data[dataIdx] = landmark.x;
			data[dataIdx + 1] = 1 - landmark.y;
			data[dataIdx + 2] = landmark.z ?? 0;
			data[dataIdx + 3] = landmark.visibility ?? 1;
		}

		const faceCenter = calculateBoundingBoxCenter(
			data,
			faceIdx,
			ALL_STANDARD_INDICES,
			LANDMARK_COUNT,
			N_LANDMARK_METADATA_SLOTS
		);
		data.set(faceCenter, (N_LANDMARK_METADATA_SLOTS + faceIdx * LANDMARK_COUNT + LANDMARK_INDICES.FACE_CENTER) * 4);

		const mouthCenter = calculateBoundingBoxCenter(data, faceIdx, INNER_MOUTH_INDICES, LANDMARK_COUNT, 1);
		data.set(
			mouthCenter,
			(N_LANDMARK_METADATA_SLOTS + faceIdx * LANDMARK_COUNT + LANDMARK_INDICES.MOUTH_CENTER) * 4
		);
	}

	detector.state.nFaces = nFaces;
}

function updateMask(detector: Detector, width: number, height: number) {
	if (!faceRegions) return;
	const {
		mask,
		maxFaces,
		landmarks,
		state: { nFaces },
	} = detector;
	const { gl, canvas: maskCanvas } = mask;
	const { data: landmarksData } = landmarks;

	if (maskCanvas.width !== width || maskCanvas.height !== height) {
		maskCanvas.width = width;
		maskCanvas.height = height;
	}
	gl.viewport(0, 0, maskCanvas.width, maskCanvas.height);
	gl.clearColor(0, 0, 0, 0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	for (let faceIdx = 0; faceIdx < nFaces; ++faceIdx) {
		const b = (faceIdx + 1) / maxFaces;

		// G channel: face mesh (0.5) and oval (1.0)
		drawTriangles(mask, landmarksData, faceRegions.TESSELATION, faceIdx, 0, 0.5, b);
		drawTriangles(mask, landmarksData, faceRegions.OVAL, faceIdx, 0, 1.0, b);

		// R channel: feature regions
		drawTriangles(mask, landmarksData, faceRegions.LEFT_EYEBROW, faceIdx, RED_CHANNEL_VALUES.LEFT_EYEBROW, 0, b);
		drawTriangles(mask, landmarksData, faceRegions.RIGHT_EYEBROW, faceIdx, RED_CHANNEL_VALUES.RIGHT_EYEBROW, 0, b);
		drawTriangles(mask, landmarksData, faceRegions.LEFT_EYE, faceIdx, RED_CHANNEL_VALUES.LEFT_EYE, 0, b);
		drawTriangles(mask, landmarksData, faceRegions.RIGHT_EYE, faceIdx, RED_CHANNEL_VALUES.RIGHT_EYE, 0, b);
		drawTriangles(mask, landmarksData, faceRegions.OUTER_MOUTH, faceIdx, RED_CHANNEL_VALUES.OUTER_MOUTH, 0, b);
		drawTriangles(mask, landmarksData, faceRegions.INNER_MOUTH, faceIdx, RED_CHANNEL_VALUES.INNER_MOUTH, 0, b);
	}
}

function face(config: { textureName: string; options?: FacePluginOptions }) {
	const { textureName, options: { history, ...mediapipeOptions } = {} } = config;
	const options = { ...DEFAULT_FACE_OPTIONS, ...mediapipeOptions };
	const optionsKey = hashOptions({ ...options, textureName });

	const nLandmarksMax = options.maxFaces * LANDMARK_COUNT + N_LANDMARK_METADATA_SLOTS;
	const textureHeight = Math.ceil(nLandmarksMax / LANDMARKS_TEXTURE_WIDTH);

	return function (shaderPad: ShaderPad, context: PluginContext) {
		const { injectGLSL, emitHook } = context;

		const existingDetector = sharedDetectors.get(optionsKey);
		const landmarksData =
			existingDetector?.landmarks.data ?? new Float32Array(LANDMARKS_TEXTURE_WIDTH * textureHeight * 4);
		const maskCanvas = existingDetector?.mask.canvas ?? new OffscreenCanvas(1, 1);
		let detector: Detector | null = null;
		let skipHistoryWrite = false;

		function onResult() {
			if (!detector) return;
			const nFaces = detector.state.nFaces;
			const nSlots = nFaces * LANDMARK_COUNT + N_LANDMARK_METADATA_SLOTS;
			const rowsToUpdate = Math.ceil(nSlots / LANDMARKS_TEXTURE_WIDTH);
			shaderPad.updateTextures(
				{
					u_faceLandmarksTex: {
						data: detector.landmarks.data,
						width: LANDMARKS_TEXTURE_WIDTH,
						height: rowsToUpdate,
						isPartial: true,
					},
					u_faceMask: detector.mask.canvas,
				},
				{ skipHistoryWrite }
			);
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
					mediapipeCanvas,
					mask: initMaskRenderer(maskCanvas),
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
				};

				initFaceRegions(FaceLandmarker);
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
					let width: number, height: number;
					if (source instanceof HTMLVideoElement) {
						if (source.videoWidth === 0 || source.videoHeight === 0 || source.readyState < 2) return;
						width = source.videoWidth;
						height = source.videoHeight;
						result = detector.landmarker.detectForVideo(source, now);
					} else {
						if (source.width === 0 || source.height === 0) return;
						width = source.width;
						height = source.height;
						result = detector.landmarker.detect(source);
					}

					if (result) {
						detector.state.resultTimestamp = now;
						detector.state.result = result;
						updateLandmarksData(detector, result.faceLandmarks);
						updateMask(detector, width, height);
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
				{ internalFormat: 'RGBA32F', type: 'FLOAT', minFilter: 'NEAREST', magFilter: 'NEAREST', history }
			);
			shaderPad.initializeTexture('u_faceMask', maskCanvas, {
				minFilter: 'NEAREST',
				magFilter: 'NEAREST',
				history,
			});
			initPromise.then(() => emitHook('face:ready'));
		});

		shaderPad.on('initializeTexture', (name: string, source: TextureSource) => {
			if (name === textureName && isMediaPipeSource(source)) detectFaces(source);
		});

		shaderPad.on(
			'updateTextures',
			(updates: Record<string, TextureSource>, options?: { skipHistoryWrite?: boolean }) => {
				const source = updates[textureName];
				if (isMediaPipeSource(source)) {
					skipHistoryWrite = options?.skipHistoryWrite ?? false;
					detectFaces(source);
				}
			}
		);

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

		const { fn, historyParams } = generateGLSLFn(history);
		const sampleMask = history ? `_sampleFaceMask(pos, framesAgo)` : `texture(u_faceMask, pos)`;

		const checkAt = (
			fnName: string,
			regionMin: keyof typeof RED_CHANNEL_VALUES,
			regionMax: keyof typeof RED_CHANNEL_VALUES = regionMin
		) =>
			fn(
				'vec2',
				`${fnName}At`,
				'vec2 pos',
				`vec4 mask = ${sampleMask};
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return (mask.r > ${(RED_CHANNEL_VALUES[regionMin] - HALF_GAP).toFixed(4)} && mask.r < ${(
					RED_CHANNEL_VALUES[regionMax] + HALF_GAP
				).toFixed(4)}) ? vec2(1.0, faceIndex) : vec2(0.0, -1.0);`
			);

		const checkMaskG = (fnName: string, threshold: number) =>
			fn(
				'vec2',
				`${fnName}At`,
				'vec2 pos',
				`vec4 mask = ${sampleMask};
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return mask.g > ${threshold.toFixed(2)} ? vec2(1.0, faceIndex) : vec2(0.0, -1.0);`
			);

		const combineLeftRight = (fnName: string, leftFn: string, rightFn: string) =>
			fn(
				'vec2',
				`${fnName}At`,
				'vec2 pos',
				`vec2 left = ${leftFn}(pos${historyParams});
	return left.x > 0.0 ? left : ${rightFn}(pos${historyParams});`
			);

		const checkIn = (fnNames: string[]) =>
			fnNames
				.map(fnName =>
					fn(
						'float',
						`in${fnName[0].toUpperCase() + fnName.slice(1)}`,
						'vec2 pos',
						`vec2 a = ${fnName}At(pos${historyParams}); return step(0.0, a.y) * a.x;`
					)
				)
				.join('\n');

		injectGLSL(`
uniform int u_maxFaces;
uniform int u_nFaces;
uniform highp sampler2D${history ? 'Array' : ''} u_faceLandmarksTex;${
			history
				? `
uniform int u_faceLandmarksTexFrameOffset;`
				: ''
		}
uniform ${history ? 'highp' : 'mediump'} sampler2D${history ? 'Array' : ''} u_faceMask;${
			history
				? `
uniform int u_faceMaskFrameOffset;`
				: ''
		}

#define FACE_LANDMARK_L_EYE_CENTER ${LANDMARK_INDICES.LEFT_EYE_CENTER}
#define FACE_LANDMARK_R_EYE_CENTER ${LANDMARK_INDICES.RIGHT_EYE_CENTER}
#define FACE_LANDMARK_NOSE_TIP ${LANDMARK_INDICES.NOSE_TIP}
#define FACE_LANDMARK_FACE_CENTER ${LANDMARK_INDICES.FACE_CENTER}
#define FACE_LANDMARK_MOUTH_CENTER ${LANDMARK_INDICES.MOUTH_CENTER}

${fn(
	'int',
	'nFacesAt',
	'',
	history
		? `
	int layer = (u_faceLandmarksTexFrameOffset - framesAgo + ${history}) % ${history};
	return int(texelFetch(u_faceLandmarksTex, ivec3(0, 0, layer), 0).r + 0.5);`
		: `
	return int(texelFetch(u_faceLandmarksTex, ivec2(0, 0), 0).r + 0.5);`
)}
${fn(
	'vec4',
	'faceLandmark',
	'int faceIndex, int landmarkIndex',
	`int i = ${N_LANDMARK_METADATA_SLOTS} + faceIndex * ${LANDMARK_COUNT} + landmarkIndex;
	int x = i % ${LANDMARKS_TEXTURE_WIDTH};
	int y = i / ${LANDMARKS_TEXTURE_WIDTH};${
		history
			? `
	int layer = (u_faceLandmarksTexFrameOffset - framesAgo + ${history}) % ${history};
	return texelFetch(u_faceLandmarksTex, ivec3(x, y, layer), 0);`
			: `
	return texelFetch(u_faceLandmarksTex, ivec2(x, y), 0);`
	}`
)}
${
	history
		? `
vec4 _sampleFaceMask(vec2 pos, int framesAgo) {
	int layer = (u_faceMaskFrameOffset - framesAgo + ${history}) % ${history};
	return texture(u_faceMask, vec3(pos, float(layer)));
}
`
		: ''
}
${checkAt('leftEyebrow', 'LEFT_EYEBROW')}
${checkAt('rightEyebrow', 'RIGHT_EYEBROW')}
${checkAt('leftEye', 'LEFT_EYE')}
${checkAt('rightEye', 'RIGHT_EYE')}
${checkAt('lips', 'OUTER_MOUTH')}
${checkAt('outerMouth', 'OUTER_MOUTH', 'INNER_MOUTH')}
${checkAt('innerMouth', 'INNER_MOUTH')}
${checkMaskG('faceOval', 0.75)}
${checkMaskG('face', 0.25)}
${combineLeftRight('eye', 'leftEyeAt', 'rightEyeAt')}
${combineLeftRight('eyebrow', 'leftEyebrowAt', 'rightEyebrowAt')}
${checkIn(['eyebrow', 'eye', 'outerMouth', 'innerMouth', 'lips', 'face'])}`);
	};
}

export default face;
