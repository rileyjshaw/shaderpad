import ShaderPad, { PluginContext, TextureSource } from '../index';
import type { ImageSegmenter, ImageSegmenterResult, MPMask } from '@mediapipe/tasks-vision';

export interface SegmenterPluginOptions {
	modelPath?: string;
	outputCategoryMask?: boolean;
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

	for (int i = 0; i < ${numMasks}; ++i) {
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
		const { injectGLSL, gl, emitHook } = context;

		let imageSegmenter: ImageSegmenter | null = null;
		let vision: any = null;
		let lastVideoTime = -1;
		let runningMode: 'IMAGE' | 'VIDEO' = 'VIDEO';
		const textureSources = new Map<string, TextureSource>();
		let numCategories = 1;

		// Shared canvas for MediaPipe and maskShader (same WebGL context).
		const sharedCanvas = new OffscreenCanvas(1, 1);
		let maskShader: ShaderPad | null = null;
		async function initializeMediaPipe() {
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
			} catch (error) {
				console.error('[Segmenter Plugin] Failed to initialize MediaPipe:', error);
				throw error;
			}
		}
		const mediaPipeInitPromise = initializeMediaPipe();

		shaderPad.on('init', async () => {
			shaderPad.initializeUniform('u_numCategories', 'int', numCategories);
			shaderPad.initializeTexture('u_segmentMask', sharedCanvas, {
				preserveY: true,
				minFilter: gl.NEAREST,
				magFilter: gl.NEAREST,
			});
			await mediaPipeInitPromise;
			const labels = imageSegmenter!.getLabels();
			if (labels.length) numCategories = labels.length;
			maskShader = new ShaderPad(createMaskShaderSource(numCategories), { canvas: sharedCanvas });
			for (let i = 0; i < numCategories; ++i) {
				maskShader.initializeTexture(`u_confidenceMask${i}`, dummyTexture);
			}
			shaderPad.updateUniforms({ u_numCategories: numCategories });
			emitHook('segmenter:ready');
		});

		shaderPad.on('initializeTexture', (name: string, source: TextureSource) => {
			if (name === textureName) detectSegments(source);
		});

		shaderPad.on('updateTextures', (updates: Record<string, TextureSource>) => {
			const source = updates[textureName];
			if (source) detectSegments(source);
		});

		function updateMaskTexture(confidenceMasks: MPMask[]) {
			if (!maskShader) return;

			const textures: Record<string, WebGLTexture> = {};
			for (let i = 0; i < confidenceMasks.length; ++i) {
				textures[`u_confidenceMask${i}`] = confidenceMasks[i].getAsWebGLTexture();
			}
			maskShader.updateTextures(textures);
			maskShader.draw();
			shaderPad.updateTextures({ u_segmentMask: sharedCanvas });
			confidenceMasks.forEach(mask => mask.close());
		}

		function processSegments(result: ImageSegmenterResult) {
			const { confidenceMasks } = result;
			if (!confidenceMasks || confidenceMasks.length === 0) return;
			updateMaskTexture(confidenceMasks);
			emitHook('segmenter:result', result);
		}

		// `detectSegments` may be called multiple times before MediaPipe is
		// initialized. This ensures we only process the last call.
		let nDetectionCalls = 0;
		async function detectSegments(source: TextureSource) {
			const callOrder = ++nDetectionCalls;
			await mediaPipeInitPromise;
			if (callOrder !== nDetectionCalls || !imageSegmenter) return;

			const previousSource = textureSources.get(textureName);
			if (previousSource !== source) lastVideoTime = -1;
			textureSources.set(textureName, source);

			try {
				const requiredMode = source instanceof HTMLVideoElement ? 'VIDEO' : 'IMAGE';
				if (runningMode !== requiredMode) {
					runningMode = requiredMode;
					await imageSegmenter.setOptions({ runningMode });
				}

				if (source instanceof HTMLVideoElement) {
					if (source.videoWidth === 0 || source.videoHeight === 0 || source.readyState < 2) {
						return;
					}
					if (source.currentTime !== lastVideoTime) {
						lastVideoTime = source.currentTime;
						// TODO: I think segmentForVideo runs its own animation loop maybe? args are (source, startTime, callbackForVideo).
						const result = imageSegmenter.segmentForVideo(source, performance.now());
						processSegments(result);
					}
				} else if (source instanceof HTMLImageElement || source instanceof HTMLCanvasElement) {
					if (source.width === 0 || source.height === 0) {
						return;
					}
					const result = imageSegmenter.segment(source);
					processSegments(result);
				}
			} catch (error) {
				console.error('[Segmenter Plugin] Segmentation error:', error);
			}
		}

		shaderPad.on('destroy', () => {
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
