import ShaderPad, { PluginContext, TextureSource } from '../index';
import type { ImageSegmenter } from '@mediapipe/tasks-vision';

export interface SegmenterPluginOptions {
	modelPath?: string;
	outputCategoryMask?: boolean;
	outputConfidenceMasks?: boolean;
}

function segmenter(config: { textureName: string; options?: SegmenterPluginOptions }) {
	const { textureName, options } = config;
	const defaultModelPath =
		'https://storage.googleapis.com/mediapipe-models/image_segmenter/hair_segmenter/float32/latest/hair_segmenter.tflite';

	return function (shaderPad: ShaderPad, context: PluginContext) {
		const { injectGLSL } = context;

		let imageSegmenter: ImageSegmenter | null = null;
		let vision: any = null;
		let lastVideoTime = -1;
		let runningMode: 'IMAGE' | 'VIDEO' = 'VIDEO';
		const textureSources = new Map<string, TextureSource>();
		let numCategories = 2;

		const maskWidth = 512;
		const maskHeight = 512;
		const segmentMaskCanvas = document.createElement('canvas');
		segmentMaskCanvas.width = maskWidth;
		segmentMaskCanvas.height = maskHeight;
		const segmentMaskCtx = segmentMaskCanvas.getContext('2d')!;
		segmentMaskCtx.fillStyle = 'black';
		segmentMaskCtx.fillRect(0, 0, maskWidth, maskHeight);

		async function initializeImageSegmenter() {
			try {
				const { FilesetResolver, ImageSegmenter } = await import('@mediapipe/tasks-vision');
				vision = await FilesetResolver.forVisionTasks(
					'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
				);

				imageSegmenter = await ImageSegmenter.createFromOptions(vision, {
					baseOptions: {
						modelAssetPath: options?.modelPath || defaultModelPath,
					},
					runningMode: runningMode,
					outputCategoryMask: options?.outputCategoryMask ?? true,
					outputConfidenceMasks: options?.outputConfidenceMasks ?? false,
				});

				const labels = imageSegmenter.getLabels();
				numCategories = labels ? labels.length : 2;
			} catch (error) {
				console.error('[Segmenter Plugin] Failed to initialize Image Segmenter:', error);
				throw error;
			}
		}

		async function updateMaskTexture(segmentationMask: any) {
			if (!imageSegmenter || !segmentationMask) {
				return;
			}

			try {
				segmentMaskCtx.clearRect(0, 0, segmentMaskCanvas.width, segmentMaskCanvas.height);

				const width = segmentationMask.width;
				const height = segmentationMask.height;

				let maskData: Uint8Array | Float32Array;
				let dataIsFloat = false;

				if (typeof segmentationMask.getAsUint8Array === 'function') {
					maskData = segmentationMask.getAsUint8Array();
				} else if (typeof segmentationMask.getAsFloat32Array === 'function') {
					maskData = segmentationMask.getAsFloat32Array();
					dataIsFloat = true;
				} else {
					return;
				}

				const pixelCount = width * height;
				const outputData = new Uint8ClampedArray(pixelCount * 4);
				const maxCategory = Math.max(1, numCategories - 1);

				for (let i = 0; i < pixelCount; i++) {
					let categoryValue: number;
					if (dataIsFloat) {
						categoryValue = Math.round((maskData as Float32Array)[i]);
					} else {
						categoryValue = (maskData as Uint8Array)[i];
					}

					const normalizedValue = categoryValue / maxCategory;
					const normalizedByte = Math.round(normalizedValue * 255);

					outputData[i * 4] = normalizedByte;
					outputData[i * 4 + 1] = 0;
					outputData[i * 4 + 2] = 0;
					outputData[i * 4 + 3] = 255;
				}

				const rgbaMask = new ImageData(outputData, width, height);

				if (width !== segmentMaskCanvas.width || height !== segmentMaskCanvas.height) {
					const tempCanvas = document.createElement('canvas');
					tempCanvas.width = width;
					tempCanvas.height = height;
					const tempCtx = tempCanvas.getContext('2d')!;
					tempCtx.putImageData(rgbaMask, 0, 0);

					segmentMaskCtx.drawImage(tempCanvas, 0, 0, segmentMaskCanvas.width, segmentMaskCanvas.height);
				} else {
					segmentMaskCtx.putImageData(rgbaMask, 0, 0);
				}

				shaderPad.updateTextures({ u_segmentMask: segmentMaskCanvas });
			} catch (error) {
				console.error('[Segmenter Plugin] Failed to generate mask texture:', error);
			}
		}

		function processSegmenterResults(result: any) {
			const mask = result.categoryMask || (result.confidenceMasks && result.confidenceMasks[0]);

			if (mask) {
				updateMaskTexture(mask).catch(error => {
					console.warn('[Segmenter Plugin] Mask texture update error:', error);
				});
			}
		}

		function callbackForImage(result: any) {
			processSegmenterResults(result);
		}

		function callbackForVideo(result: any) {
			processSegmenterResults(result);
		}

		shaderPad.registerHook('init', async () => {
			shaderPad.initializeTexture('u_segmentMask', segmentMaskCanvas);
			await initializeImageSegmenter();
		});

		shaderPad.registerHook('updateTextures', async (updates: Record<string, TextureSource>) => {
			const source = updates[textureName];
			if (!source) return;

			const previousSource = textureSources.get(textureName);
			if (previousSource !== source) {
				lastVideoTime = -1;
			}

			textureSources.set(textureName, source);
			if (!imageSegmenter) return;

			try {
				const requiredMode = source instanceof HTMLVideoElement ? 'VIDEO' : 'IMAGE';
				if (runningMode !== requiredMode) {
					runningMode = requiredMode;
					await imageSegmenter.setOptions({ runningMode: runningMode });
				}

				if (source instanceof HTMLVideoElement) {
					if (source.videoWidth === 0 || source.videoHeight === 0 || source.readyState < 2) {
						return;
					}
					if (source.currentTime !== lastVideoTime) {
						lastVideoTime = source.currentTime;
						const timestamp = performance.now();
						imageSegmenter.segmentForVideo(source, timestamp, callbackForVideo);
					}
				} else if (source instanceof HTMLImageElement || source instanceof HTMLCanvasElement) {
					if (source.width === 0 || source.height === 0) {
						return;
					}
					imageSegmenter.segment(source, callbackForImage);
				}
			} catch (error) {
				console.error('[Segmenter Plugin] Segmentation error:', error);
			}
		});

		shaderPad.registerHook('destroy', () => {
			if (imageSegmenter) {
				imageSegmenter.close();
				imageSegmenter = null;
			}
			vision = null;
			textureSources.clear();
			segmentMaskCanvas.remove();
		});

		injectGLSL(`
uniform sampler2D u_segmentMask;
float inSegment(vec2 pos) { return texture(u_segmentMask, pos).r; }`);
	};
}

export default segmenter;
