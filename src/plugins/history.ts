import ShaderPad, { PluginContext, TextureSource } from '../index';

export type WithHistory<T extends ShaderPad> = T & {
	initializeTexture(name: string, source: TextureSource, historyDepth?: number): void;
};

function getSourceDimensions(source: TextureSource) {
	if (source instanceof HTMLVideoElement) {
		return { width: source.videoWidth, height: source.videoHeight };
	}
	if (source instanceof HTMLCanvasElement) {
		return { width: source.width, height: source.height };
	}
	// HTMLImageElement
	return { width: source.naturalWidth || source.width, height: source.naturalHeight || source.height };
}

function clearHistoryTextureLayers(gl: WebGL2RenderingContext, width: number, height: number, depth: number): void {
	const transparent = new Uint8Array(width * height * 4);
	for (let layer = 0; layer < depth; ++layer) {
		gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, layer, width, height, 1, gl.RGBA, gl.UNSIGNED_BYTE, transparent);
	}
}

function createHistoryTexture(gl: WebGL2RenderingContext, depth: number, width: number, height: number): WebGLTexture {
	const texture = gl.createTexture();
	if (!texture) {
		throw new Error('Failed to create history texture');
	}
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D_ARRAY, texture);
	gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 1, gl.RGBA8, width, height, depth);
	clearHistoryTextureLayers(gl, width, height, depth);
	return texture;
}

interface TextureHistoryInfo {
	depth: number;
	writeIndex: number;
}

export function history(framebufferDepth: number = 1) {
	return function (shaderPad: ShaderPad, context: PluginContext) {
		const { gl, uniforms, textures, reserveTextureUnit } = context;
		const shaderPadWithHistory = shaderPad as WithHistory<ShaderPad>;

		const originalInitializeTexture = shaderPad.initializeTexture.bind(shaderPad);
		const originalUpdateTextures = shaderPad.updateTextures.bind(shaderPad);

		const historyTextureInfo = new Map<string, TextureHistoryInfo>();

		let framebufferHistoryTexture: WebGLTexture | null = null;
		const shouldTrackFramebuffer = framebufferDepth > 1;
		if (shouldTrackFramebuffer) {
			function initializeFramebufferHistory() {
				framebufferHistoryTexture = createHistoryTexture(
					gl,
					framebufferDepth,
					gl.drawingBufferWidth,
					gl.drawingBufferHeight
				);

				if (!uniforms.has('u_history')) {
					shaderPad.initializeUniform('u_history', 'int', 0);
				}
			}

			function clearFramebufferHistory() {
				if (!framebufferHistoryTexture) return;
				gl.activeTexture(gl.TEXTURE0);
				gl.bindTexture(gl.TEXTURE_2D_ARRAY, framebufferHistoryTexture);
				clearHistoryTextureLayers(gl, gl.drawingBufferWidth, gl.drawingBufferHeight, framebufferDepth);
			}

			shaderPad.registerHook('init', initializeFramebufferHistory);
			shaderPad.registerHook('step', (_time: number, frame: number) => {
				if (!framebufferHistoryTexture) return;
				const writeIdx = frame % framebufferDepth;
				gl.activeTexture(gl.TEXTURE0);
				gl.bindTexture(gl.TEXTURE_2D_ARRAY, framebufferHistoryTexture);
				gl.copyTexSubImage3D(
					gl.TEXTURE_2D_ARRAY,
					0,
					0,
					0,
					writeIdx,
					0,
					0,
					gl.drawingBufferWidth,
					gl.drawingBufferHeight
				);
			});
			shaderPad.registerHook('updateResolution', () => {
				if (framebufferHistoryTexture) {
					gl.deleteTexture(framebufferHistoryTexture);
				}
				initializeFramebufferHistory();
			});
			shaderPad.registerHook('reset', clearFramebufferHistory);
		}
		shaderPad.registerHook('reset', () => {
			historyTextureInfo.forEach(info => {
				info.writeIndex = 0;
			});
		});

		shaderPadWithHistory.initializeTexture = function (
			name: string,
			source: TextureSource,
			historyDepth: number = 1
		) {
			const { width, height } = getSourceDimensions(source);
			if (!width || !height) {
				throw new Error(`Texture source must have valid dimensions`);
			}

			const depth = Math.floor(historyDepth);
			if (depth <= 1) {
				return originalInitializeTexture(name, source);
			}

			if (textures.has(name)) {
				throw new Error(`Texture '${name}' is already initialized.`);
			}

			let unitIndex: number | undefined;
			let texture: WebGLTexture | null = null;
			try {
				unitIndex = reserveTextureUnit(name);
				texture = createHistoryTexture(gl, depth, width, height);
				gl.activeTexture(gl.TEXTURE0 + unitIndex);
				gl.bindTexture(gl.TEXTURE_2D_ARRAY, texture);

				// Flip the texture vertically during upload to match WebGL's coordinate system.
				// WebGL uses bottom-left origin, while images/videos use top-left origin.
				gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
				gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

				if (context.program) {
					const uSampler = gl.getUniformLocation(context.program, name);
					if (uSampler) {
						gl.uniform1i(uSampler, unitIndex);
					}
				}

				textures.set(name, {
					texture,
					unitIndex,
				});

				historyTextureInfo.set(name, {
					depth,
					writeIndex: 0,
				});

				shaderPadWithHistory.updateTextures({ [name]: source });
			} catch (error) {
				if (texture) gl.deleteTexture(texture);
				if (unitIndex !== undefined) {
					context.releaseTextureUnit(name);
				}
				throw error;
			}
		};

		shaderPadWithHistory.updateTextures = function (updates) {
			Object.entries(updates).forEach(([name, source]) => {
				const textureInfo = textures.get(name);
				const historyInfo = historyTextureInfo.get(name);

				if (!textureInfo || !historyInfo || historyInfo.depth <= 1) {
					return originalUpdateTextures({ [name]: source });
				}

				const { width, height } = getSourceDimensions(source);
				const writeIndex = historyInfo.writeIndex;
				gl.activeTexture(gl.TEXTURE0 + textureInfo.unitIndex);
				gl.bindTexture(gl.TEXTURE_2D_ARRAY, textureInfo.texture);
				gl.texSubImage3D(
					gl.TEXTURE_2D_ARRAY,
					0,
					0,
					0,
					writeIndex,
					width,
					height,
					1,
					gl.RGBA,
					gl.UNSIGNED_BYTE,
					source
				);
				historyInfo.writeIndex = (writeIndex + 1) % historyInfo.depth;
			});
		};

		shaderPad.registerHook('destroy', () => {
			if (framebufferHistoryTexture) {
				gl.deleteTexture(framebufferHistoryTexture);
			}
			historyTextureInfo.clear();
		});
	};
}
