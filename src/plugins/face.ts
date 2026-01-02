import ShaderPad, { PluginContext, TextureSource } from '../index';
import type { FaceLandmarker, NormalizedLandmark } from '@mediapipe/tasks-vision';

export interface FacePluginOptions {
	modelPath?: string;
	maxFaces?: number;
	minFaceDetectionConfidence?: number;
	minFacePresenceConfidence?: number;
	minTrackingConfidence?: number;
	outputFaceBlendshapes?: boolean;
	outputFacialTransformationMatrixes?: boolean;
}

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
};

function face(config: { textureName: string; options?: FacePluginOptions }) {
	const { textureName, options } = config;
	const defaultModelPath =
		'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task';

	return function (shaderPad: ShaderPad, context: PluginContext) {
		const { uniforms, injectGLSL } = context;

		let faceLandmarker: FaceLandmarker | null = null;
		let vision: any = null;
		let lastVideoTime = -1;
		const textureSources = new Map<string, TextureSource>();
		const maxFaces = options?.maxFaces ?? 1;

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
					runningMode: 'VIDEO',
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

		function calculateBoundingBoxCenter(landmarks: NormalizedLandmark[]): [number, number] {
			let minX = Infinity,
				maxX = -Infinity,
				minY = Infinity,
				maxY = -Infinity;

			// Calculate bounding box center.
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

		function fillRegion(landmarks: NormalizedLandmark[], color: { r: number; g: number; b: number }) {
			faceMaskCtx.fillStyle = `rgb(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(
				color.b * 255
			)})`;
			const origin = landmarks[0];
			faceMaskCtx.beginPath();
			faceMaskCtx.moveTo(origin.x * faceMaskCanvas.width, origin.y * faceMaskCanvas.height);
			for (let i = 1; i < landmarks.length; i++) {
				const destination = landmarks[i];
				faceMaskCtx.lineTo(destination.x * faceMaskCanvas.width, destination.y * faceMaskCanvas.height);
			}
			faceMaskCtx.closePath();
			faceMaskCtx.fill();
		}

		async function updateMaskTexture(faces: NormalizedLandmark[][]) {
			if (!faceLandmarker) {
				console.warn('[Face Plugin] Cannot update mask: faceLandmarker missing');
				return;
			}

			try {
				const { FaceLandmarker } = await import('@mediapipe/tasks-vision');
				faceMaskCtx.clearRect(0, 0, faceMaskCanvas.width, faceMaskCanvas.height);

				faces.forEach((landmarks, i) => {
					// Build combined mask with RGBA channels
					// R: Mouth | G: Face | B: Eyes
					// Mouth (red channel).
					// Lips.
					fillRegion(
						LANDMARK_INDICES.OUTER_LIP.map((idx: number) => landmarks[idx]),
						{ r: 0.25, g: 0, b: 0 }
					);
					// Inner mouth.
					fillRegion(
						LANDMARK_INDICES.INNER_LIP.map((idx: number) => landmarks[idx]),
						{ r: 0.75, g: 0, b: 0 }
					);

					// Face (green channel).
					// Entire face.
					fillRegion(
						FaceLandmarker.FACE_LANDMARKS_TESSELATION.map(({ start }) => landmarks[start]),
						{ r: 0, g: 0.25, b: 0 }
					);
					// Face contour (excludes nose in profile view).
					fillRegion(
						FaceLandmarker.FACE_LANDMARKS_FACE_OVAL.map(({ start }) => landmarks[start]),
						{ r: 0, g: 1, b: 0 }
					);

					// Eyes (blue channel).
					// Eyebrows.
					fillRegion(
						LANDMARK_INDICES.LEFT_EYEBROW.map((idx: number) => landmarks[idx]),
						{
							r: 0,
							g: 0,
							b: 0.15,
						}
					);
					fillRegion(
						LANDMARK_INDICES.RIGHT_EYEBROW.map((idx: number) => landmarks[idx]),
						{
							r: 0,
							g: 0,
							b: 0.35,
						}
					);
					// Eyes.
					fillRegion(
						LANDMARK_INDICES.LEFT_EYE.map((idx: number) => landmarks[idx]),
						{ r: 0, g: 0, b: 0.65 }
					);
					fillRegion(
						LANDMARK_INDICES.RIGHT_EYE.map((idx: number) => landmarks[idx]),
						{ r: 0, g: 0, b: 0.85 }
					);
				});

				shaderPad.updateTextures({ u_faceMask: faceMaskCanvas });
			} catch (error) {
				console.error('[Face Plugin] Failed to generate mask texture:', error);
			}
		}

		function processFaceResults(result: any) {
			if (!result.faceLandmarks) return;

			const faceCenters: [number, number][] = [];
			const leftEyes: [number, number][] = [];
			const rightEyes: [number, number][] = [];
			const noseTips: [number, number][] = [];
			const mouths: [number, number][] = [];
			for (const landmarks of result.faceLandmarks) {
				const faceCenter = calculateBoundingBoxCenter(landmarks);
				const leftEye = landmarks[LANDMARK_INDICES.LEFT_EYE_CENTER];
				const rightEye = landmarks[LANDMARK_INDICES.RIGHT_EYE_CENTER];
				const noseTip = landmarks[LANDMARK_INDICES.NOSE_TIP];
				const innerLipLandmarks = LANDMARK_INDICES.INNER_LIP.map((idx: number) => landmarks[idx]);
				const mouthCenter = calculateBoundingBoxCenter(innerLipLandmarks);

				// Invert Y-axis to match WebGL coordinate system.
				faceCenters.push([faceCenter[0], 1.0 - faceCenter[1]]);
				leftEyes.push([leftEye.x, 1.0 - leftEye.y]);
				rightEyes.push([rightEye.x, 1.0 - rightEye.y]);
				noseTips.push([noseTip.x, 1.0 - noseTip.y]);
				mouths.push([mouthCenter[0], 1.0 - mouthCenter[1]]);
			}

			updateMaskTexture(result.faceLandmarks).catch(error => {
				console.warn('Mask texture update error:', error);
			});

			const updates: Parameters<typeof shaderPad.updateUniforms>[0] = { u_nFaces: result.faceLandmarks.length };
			if (result.faceLandmarks.length) {
				if (uniforms.has('u_faceCenter')) updates.u_faceCenter = faceCenters;
				if (uniforms.has('u_leftEye')) updates.u_leftEye = leftEyes;
				if (uniforms.has('u_rightEye')) updates.u_rightEye = rightEyes;
				if (uniforms.has('u_noseTip')) updates.u_noseTip = noseTips;
				if (uniforms.has('u_mouth')) updates.u_mouth = mouths;
			}
			shaderPad.updateUniforms(updates);
		}

		shaderPad.registerHook('init', async () => {
			shaderPad.initializeTexture('u_faceMask', faceMaskCanvas);
			shaderPad.initializeUniform('u_maxFaces', 'int', maxFaces);
			shaderPad.initializeUniform('u_nFaces', 'int', 0);
			const defaultFaceData: [number, number][] = Array.from({ length: maxFaces }, () => [0.5, 0.5]);
			shaderPad.initializeUniform('u_faceCenter', 'float', defaultFaceData, { arrayLength: maxFaces });
			shaderPad.initializeUniform('u_leftEye', 'float', defaultFaceData, { arrayLength: maxFaces });
			shaderPad.initializeUniform('u_rightEye', 'float', defaultFaceData, { arrayLength: maxFaces });
			shaderPad.initializeUniform('u_noseTip', 'float', defaultFaceData, { arrayLength: maxFaces });
			shaderPad.initializeUniform('u_mouth', 'float', defaultFaceData, { arrayLength: maxFaces });

			await initializeFaceLandmarker();
		});

		shaderPad.registerHook('updateTextures', (updates: Record<string, TextureSource>) => {
			const source = updates[textureName];
			if (!source) return;

			const previousSource = textureSources.get(textureName);
			if (previousSource !== source) {
				lastVideoTime = -1;
			}

			textureSources.set(textureName, source);
			if (!faceLandmarker) return;
			try {
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
		});

		injectGLSL(`
uniform int u_maxFaces;
uniform int u_nFaces;
uniform vec2 u_faceCenter[${maxFaces}];
uniform vec2 u_leftEye[${maxFaces}];
uniform vec2 u_rightEye[${maxFaces}];
uniform vec2 u_noseTip[${maxFaces}];
uniform vec2 u_mouth[${maxFaces}];
uniform sampler2D u_faceMask;
float getFace(vec2 pos) { return texture(u_faceMask, pos).g; }
float getEye(vec2 pos) { return texture(u_faceMask, pos).b; }
float getMouth(vec2 pos) { return texture(u_faceMask, pos).r; }`);
	};
}

export default face;
