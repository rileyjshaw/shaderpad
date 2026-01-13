import ShaderPad, { PluginContext, TextureSource } from '../index';
import type { ImageSegmenter, ImageSegmenterResult, MPMask } from '@mediapipe/tasks-vision';

export interface SegmenterPluginOptions {
	modelPath?: string;
	outputCategoryMask?: boolean;
	onReady?: () => void;
	onResults?: (results: ImageSegmenterResult) => void;
}

const dummyTexture = { data: new Uint8Array(4), width: 1, height: 1 };

function createMaskShaderSource(numMasks: number): string {
	const uniforms = Array.from({ length: numMasks }, (_, i) => `uniform sampler2D u_confidenceMask${i};`).join('\n');

	// GLSL doesn't allow dynamic indexing of samplers, so we need a switch-like construct.
	const sampleByIndex = Array.from(
		{ length: numMasks },
		(_, i) => `\t\t${i > 0 ? 'else ' : ''}if (i == ${i}) c = texelFetch(u_confidenceMask${i}, texCoord, 0).r;`
	).join('\n');

	return `#version 300 es
precision mediump float;
in vec2 v_uv;
out vec4 outColor;
${uniforms}

void main() {
	ivec2 texCoord = ivec2(v_uv * vec2(textureSize(u_confidenceMask0, 0)));
	float maxConfidence = 0.0;
	int maxIndex = 0;

	for (int i = 0; i < ${numMasks}; i++) {
		float c = 0.0;
${sampleByIndex}
		if (c > maxConfidence) {
			maxConfidence = c;
			maxIndex = i;
		}
	}

	// Normalize index: 0 = background, 1/(n-1) to 1 for foreground categories.
	float normalizedIndex = float(maxIndex) / float(max(1, ${numMasks - 1}));
	outColor = vec4(normalizedIndex, maxConfidence, 0.0, 1.0);
}`;
}

function segmenter(config: { textureName: string; options?: SegmenterPluginOptions }) {
	const { textureName, options } = config;
	const defaultModelPath =
		'https://storage.googleapis.com/mediapipe-models/image_segmenter/hair_segmenter/float32/latest/hair_segmenter.tflite';

	return function (shaderPad: ShaderPad, context: PluginContext) {
		const { injectGLSL, gl } = context;

		let imageSegmenter: ImageSegmenter | null = null;
		let vision: any = null;
		let lastVideoTime = -1;
		let runningMode: 'IMAGE' | 'VIDEO' = 'VIDEO';
		const textureSources = new Map<string, TextureSource>();
		let numCategories = 1;

		// Shared canvas for MediaPipe and maskShader (same WebGL context).
		const sharedCanvas = new OffscreenCanvas(1, 1);
		let maskShader: ShaderPad | null = null;
		async function initializeImageSegmenter() {
			try {
				const { FilesetResolver, ImageSegmenter } = await import('@mediapipe/tasks-vision');
				vision = await FilesetResolver.forVisionTasks(
					'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
				);

				imageSegmenter = await ImageSegmenter.createFromOptions(vision, {
					baseOptions: {
						modelAssetPath: options?.modelPath || defaultModelPath,
						delegate: 'GPU',
					},
					canvas: sharedCanvas,
					runningMode: runningMode,
					outputCategoryMask: options?.outputCategoryMask ?? false, // Better for perf, and category can be inferred from confidence mask index.
					outputConfidenceMasks: true,
				});

				const labels = imageSegmenter.getLabels();
				if (labels.length) numCategories = labels.length;
				shaderPad.updateUniforms({ u_numCategories: numCategories });
			} catch (error) {
				console.error('[Segmenter Plugin] Failed to initialize:', error);
				throw error;
			}
		}

		function updateMaskTexture(confidenceMasks: MPMask[]) {
			if (!maskShader) return;

			const textures: Record<string, WebGLTexture> = {};
			for (let i = 0; i < confidenceMasks.length; i++) {
				textures[`u_confidenceMask${i}`] = confidenceMasks[i].getAsWebGLTexture();
			}
			maskShader.updateTextures(textures);
			maskShader.draw();
			shaderPad.updateTextures({ u_segmentMask: sharedCanvas });
		}

		function processSegmenterResults(result: ImageSegmenterResult) {
			const { confidenceMasks } = result;
			if (!confidenceMasks || confidenceMasks.length === 0) return;

			// IMPORTANT: maskShader and MediaPipe share a WebGL context. MediaPipe needs to run at least once before
			// ShaderPad is created on the same canvas, otherwise MediaPipe's WebGL state gets corrupted.
			if (!maskShader) {
				const shaderSource = createMaskShaderSource(confidenceMasks.length);
				maskShader = new ShaderPad(shaderSource, { canvas: sharedCanvas });
				for (let i = 0; i < confidenceMasks.length; i++) {
					maskShader.initializeTexture(`u_confidenceMask${i}`, dummyTexture);
				}
			}

			updateMaskTexture(confidenceMasks);
			options?.onResults?.(result);
		}

		shaderPad.registerHook('init', async () => {
			shaderPad.initializeTexture('u_segmentMask', dummyTexture, {
				preserveY: true,
				minFilter: gl.NEAREST,
				magFilter: gl.NEAREST,
			});
			shaderPad.initializeUniform('u_numCategories', 'int', numCategories);
			await initializeImageSegmenter();
			options?.onReady?.();
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
						// TODO: I think segmentForVideo runs its own animation loop maybe? args are (source, startTime, callbackForVideo).
						const result = imageSegmenter.segmentForVideo(source, performance.now());
						processSegmenterResults(result);
					}
				} else if (source instanceof HTMLImageElement || source instanceof HTMLCanvasElement) {
					if (source.width === 0 || source.height === 0) {
						return;
					}
					const result = imageSegmenter.segment(source);
					processSegmenterResults(result);
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
			if (maskShader) {
				maskShader.destroy();
				maskShader = null;
			}
			vision = null;
			textureSources.clear();
		});

		injectGLSL(`
uniform sampler2D u_segmentMask;
uniform int u_numCategories;

vec2 segmentAt(vec2 pos) {
	vec4 mask = texture(u_segmentMask, pos);
	return vec2(mask.r, mask.g);
}`);
	};
}

export default segmenter;
