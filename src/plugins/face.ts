import ShaderPad, { PluginContext, TextureSource } from '../index';
import type { FaceLandmarker, NormalizedLandmark } from '@mediapipe/tasks-vision';

export interface FacePluginOptions {
	modelPath?: string;
	numFaces?: number;
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

export function face(config: { textureName: string; options?: FacePluginOptions }) {
	const { textureName, options } = config;
	const defaultModelPath =
		'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task';

	return function (shaderPad: ShaderPad, context: PluginContext) {
		const { uniforms, injectGLSL } = context;

		let faceLandmarker: FaceLandmarker | null = null;
		let vision: any = null;
		let lastVideoTime = -1;
		const textureSources = new Map<string, TextureSource>();

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
					numFaces: options?.numFaces ?? 1,
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

		function calculateFaceCenter(landmarks: NormalizedLandmark[]): [number, number] {
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

		async function updateMaskTexture(landmarks: NormalizedLandmark[]) {
			if (!faceLandmarker) {
				console.warn('[Face Plugin] Cannot update mask: faceLandmarker or canvas missing');
				return;
			}

			try {
				// Get MediaPipe landmark connection constants
				const { FaceLandmarker } = await import('@mediapipe/tasks-vision');

				faceMaskCtx.clearRect(0, 0, faceMaskCanvas.width, faceMaskCanvas.height);

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

				shaderPad.updateTextures({ u_faceMask: faceMaskCanvas });
			} catch (error) {
				console.error('[Face Plugin] Failed to generate mask texture:', error);
			}
		}

		function processFaceResults(result: any) {
			if (!result.faceLandmarks || result.faceLandmarks.length === 0) {
				return;
			}

			const landmarks = result.faceLandmarks[0]; // HACK: Use first detected face. Might want to support multiple faces in the future.
			if (!landmarks || landmarks.length !== 478) {
				return;
			}

			const faceCenter = calculateFaceCenter(landmarks);
			const leftEye: [number, number] = [
				landmarks[LANDMARK_INDICES.LEFT_EYE_CENTER].x,
				landmarks[LANDMARK_INDICES.LEFT_EYE_CENTER].y,
			];
			const rightEye: [number, number] = [
				landmarks[LANDMARK_INDICES.RIGHT_EYE_CENTER].x,
				landmarks[LANDMARK_INDICES.RIGHT_EYE_CENTER].y,
			];
			const noseTip: [number, number] = [
				landmarks[LANDMARK_INDICES.NOSE_TIP].x,
				landmarks[LANDMARK_INDICES.NOSE_TIP].y,
			];

			updateMaskTexture(landmarks).catch(error => {
				console.warn('Mask texture update error:', error);
			});

			// Update uniforms with Y-axis inverted to match WebGL coordinate system.
			if (uniforms.has('u_faceCenter')) {
				shaderPad.updateUniforms({ u_faceCenter: [faceCenter[0], 1.0 - faceCenter[1]] });
			}
			if (uniforms.has('u_leftEye')) {
				shaderPad.updateUniforms({ u_leftEye: [leftEye[0], 1.0 - leftEye[1]] });
			}
			if (uniforms.has('u_rightEye')) {
				shaderPad.updateUniforms({ u_rightEye: [rightEye[0], 1.0 - rightEye[1]] });
			}
			if (uniforms.has('u_noseTip')) {
				shaderPad.updateUniforms({ u_noseTip: [noseTip[0], 1.0 - noseTip[1]] });
			}
		}

		shaderPad.registerHook('init', async () => {
			shaderPad.initializeTexture('u_faceMask', faceMaskCanvas);
			shaderPad.initializeUniform('u_faceCenter', 'float', [0.5, 0.5]);
			shaderPad.initializeUniform('u_leftEye', 'float', [0.5, 0.5]);
			shaderPad.initializeUniform('u_rightEye', 'float', [0.5, 0.5]);
			shaderPad.initializeUniform('u_noseTip', 'float', [0.5, 0.5]);

			await initializeFaceLandmarker();
		});

		shaderPad.registerHook('updateTextures', (updates: Record<string, TextureSource>) => {
			Object.entries(updates).forEach(([name, source]) => {
				if (name !== textureName) return;
				textureSources.set(name, source);
				if (!faceLandmarker) return;
				try {
					if (source instanceof HTMLVideoElement) {
						if (source.currentTime !== lastVideoTime) {
							lastVideoTime = source.currentTime;
							const timestamp = performance.now();
							const result = faceLandmarker.detectForVideo(source, timestamp);
							processFaceResults(result);
						}
					} else if (source instanceof HTMLImageElement) {
						const result = faceLandmarker.detect(source);
						processFaceResults(result);
					}
				} catch (error) {
					console.warn('Face detection error:', error);
				}
			});
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
uniform vec2 u_faceCenter;
uniform vec2 u_leftEye;
uniform vec2 u_rightEye;
uniform vec2 u_noseTip;
uniform sampler2D u_faceMask;
float getFace(vec2 pos) { return texture(u_faceMask, pos).g; }
float getEye(vec2 pos) { return texture(u_faceMask, pos).b; }
float getMouth(vec2 pos) { return texture(u_faceMask, pos).r; }`);
	};
}

export type WithFace<T extends ShaderPad> = T;
