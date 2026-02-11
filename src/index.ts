import { safeMod } from './util.js';

const DEFAULT_VERTEX_SHADER_SRC = `#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_uv = a_position * 0.5 + 0.5;
}`;

interface Uniform {
	type: 'float' | 'int';
	length: 1 | 2 | 3 | 4;
	location: WebGLUniformLocation;
	arrayLength?: number;
}

type GLInternalFormatChannels = 'R' | 'RG' | 'RGB' | 'RGBA';
type GLInternalFormatDepth = '8' | '16F' | '32F' | '8UI' | '8I' | '16UI' | '16I' | '32UI' | '32I';
export type GLInternalFormatString = `${GLInternalFormatChannels}${GLInternalFormatDepth}`;

export type GLFormatString =
	| 'RED'
	| 'RG'
	| 'RGB'
	| 'RGBA'
	| 'RED_INTEGER'
	| 'RG_INTEGER'
	| 'RGB_INTEGER'
	| 'RGBA_INTEGER';
export type GLTypeString =
	| 'UNSIGNED_BYTE'
	| 'BYTE'
	| 'FLOAT'
	| 'HALF_FLOAT'
	| 'UNSIGNED_SHORT'
	| 'SHORT'
	| 'UNSIGNED_INT'
	| 'INT';
export type GLFilterString = 'LINEAR' | 'NEAREST';
export type GLWrapString = 'CLAMP_TO_EDGE' | 'REPEAT' | 'MIRRORED_REPEAT';

const FORMAT_TYPE_SUFFIXES: [string, GLTypeString][] = [
	['8UI', 'UNSIGNED_BYTE'],
	['8I', 'BYTE'],
	['16UI', 'UNSIGNED_SHORT'],
	['16I', 'SHORT'],
	['16F', 'HALF_FLOAT'],
	['32UI', 'UNSIGNED_INT'],
	['32I', 'INT'],
	['32F', 'FLOAT'],
	['8', 'UNSIGNED_BYTE'],
];

function typeFromInternalFormatString(internalFormatString?: GLInternalFormatString): GLTypeString | undefined {
	return internalFormatString && FORMAT_TYPE_SUFFIXES.find(([suffix]) => internalFormatString.endsWith(suffix))?.[1];
}

type GLConstantString = GLInternalFormatString | GLFormatString | GLTypeString | GLFilterString | GLWrapString;

export interface TextureOptions {
	internalFormat?: GLInternalFormatString;
	format?: GLFormatString;
	type?: GLTypeString;
	minFilter?: GLFilterString;
	magFilter?: GLFilterString;
	wrapS?: GLWrapString;
	wrapT?: GLWrapString;
	preserveY?: boolean;
}
type ResolvedTextureOptions = {
	type: number;
	format: number;
	internalFormat: number;
	minFilter: number;
	magFilter: number;
	wrapS: number;
	wrapT: number;
	preserveY?: boolean;
	isIntegerColorFormat: boolean;
};

interface Texture {
	texture: WebGLTexture;
	unitIndex: number;
	width: number;
	height: number;
	history?: {
		depth: number;
		writeIndex: number;
	};
	options: ResolvedTextureOptions;
}

export interface CustomTexture {
	data: ArrayBufferView | null;
	width: number;
	height: number;
}

export interface PartialCustomTexture extends CustomTexture {
	isPartial?: boolean;
	x?: number;
	y?: number;
}

export type TextureSource =
	| HTMLImageElement
	| HTMLVideoElement
	| HTMLCanvasElement
	| OffscreenCanvas
	| ImageBitmap
	| WebGLTexture
	| CustomTexture
	| ShaderPad;

// Custom textures allow partial updates starting from (x, y).
type UpdateTextureSource = Exclude<TextureSource, CustomTexture> | PartialCustomTexture;

export interface PluginContext {
	gl: WebGL2RenderingContext;
	canvas: HTMLCanvasElement | OffscreenCanvas;
	injectGLSL: (code: string) => void;
	emitHook: (name: LifecycleMethod, ...args: any[]) => void;
}

type Plugin = (shaderPad: ShaderPad, context: PluginContext) => void;

type LifecycleMethod =
	| '_init'
	| 'initializeTexture'
	| 'initializeUniform'
	| 'updateTextures'
	| 'updateUniforms'
	| 'beforeStep'
	| 'afterStep'
	| 'beforeDraw'
	| 'afterDraw'
	| 'updateResolution'
	| 'play'
	| 'pause'
	| 'reset'
	| 'destroy'
	| `${string}:${string}`;

export interface Options extends Exclude<TextureOptions, 'preserveY'> {
	canvas?: HTMLCanvasElement | OffscreenCanvas | { width: number; height: number } | null;
	plugins?: Plugin[];
	history?: number;
	debug?: boolean;
	cursorTarget?: Window | Element;
}

export interface StepOptions {
	skipClear?: boolean;
	skipHistoryWrite?: boolean;
}

type TextureUnitPool = {
	free: number[];
	next: number;
	max: number;
};

const HISTORY_TEXTURE_KEY = Symbol('u_history');
const INTERMEDIATE_TEXTURE_KEY = Symbol('__SHADERPAD_BUFFER');

const canvasRegistry = new WeakMap<
	HTMLCanvasElement | OffscreenCanvas,
	{ textureUnitPool: TextureUnitPool; instances: Set<ShaderPad> }
>();

function combineShaderCode(shader: string, injections: string[]): string {
	if (!injections?.length) return shader;
	const lines = shader.split('\n');
	const insertAt =
		lines.findLastIndex(line => {
			const trimmed = line.trimStart();
			return trimmed.startsWith('precision ') || trimmed.startsWith('#version ');
		}) + 1;
	lines.splice(insertAt, 0, ...injections);
	return lines.join('\n');
}

function getSourceDimensions(source: TextureSource): { width: number; height: number } {
	if (source instanceof WebGLTexture) {
		return { width: 0, height: 0 }; // Invalid - dimensions not readable.
	}
	if (source instanceof ShaderPad) {
		return { width: source.canvas.width, height: source.canvas.height };
	}
	if (source instanceof HTMLVideoElement) {
		return { width: source.videoWidth, height: source.videoHeight };
	}
	if (source instanceof HTMLImageElement) {
		return { width: source.naturalWidth ?? source.width, height: source.naturalHeight ?? source.height };
	}
	// CustomTexture, HTMLCanvasElement, OffscreenCanvas, ImageBitmap.
	return { width: source.width, height: source.height };
}

function stringFrom(name: string | symbol) {
	return typeof name === 'symbol' ? name.description ?? '' : name;
}

class ShaderPad {
	private isHeadless = false;
	private isTouchDevice = false;
	private gl: WebGL2RenderingContext;
	private glHelpers!: {
		typeToArray: Map<number, new (length: number) => ArrayBufferView>;
		typeToInternalFormatString: Map<number, GLInternalFormatString>;
		unsignedIntTypes: Set<number>;
	};
	private uniforms: Map<string, Uniform> = new Map();
	private textures: Map<string | symbol, Texture> = new Map();
	private textureUnitPool: TextureUnitPool;
	private buffer: WebGLBuffer | null = null;
	private vao: WebGLVertexArrayObject | null = null;
	private program: WebGLProgram | null = null;
	private animationFrameId: number | null;
	private eventListeners: Map<string, EventListener> = new Map();
	private frame = 0;
	private startTime = 0;
	private isPlaying = false;
	private cursorPosition = [0.5, 0.5];
	private clickPosition = [0.5, 0.5];
	private isMouseDown = false;
	public canvas: HTMLCanvasElement | OffscreenCanvas;
	private resolutionObserver: MutationObserver | null = null;
	private hooks: Map<LifecycleMethod, Function[]> = new Map();
	private historyDepth = 0;
	private textureOptions: TextureOptions;
	private debug: boolean;
	private cursorTarget: Window | Element | undefined;
	// WebGL can’t read from and write to the history texture at the same time.
	// We write to an intermediate texture then blit to the history texture.
	private intermediateFbo: WebGLFramebuffer | null = null;

	constructor(
		fragmentShaderSrc: string,
		{ canvas, plugins, history, debug, cursorTarget, ...textureOptions }: Options = {}
	) {
		if (canvas && 'getContext' in canvas) {
			this.canvas = canvas;
		} else {
			const { width = 1, height = 1 } = canvas || {};
			this.canvas = new OffscreenCanvas(width, height);
			this.isHeadless = true;
		}

		const gl = this.canvas.getContext('webgl2', { antialias: false }) as WebGL2RenderingContext;
		if (!gl) {
			throw new Error('WebGL2 not supported. Please use a browser that supports WebGL2.');
		}
		this.gl = gl;
		this.glHelpers = {
			typeToArray: new Map<number, new (length: number) => ArrayBufferView>([
				[gl.FLOAT, Float32Array],
				[gl.HALF_FLOAT, Uint16Array],
				[gl.UNSIGNED_SHORT, Uint16Array],
				[gl.SHORT, Int16Array],
				[gl.BYTE, Int8Array],
				[gl.UNSIGNED_INT, Uint32Array],
				[gl.INT, Int32Array],
			]),
			typeToInternalFormatString: new Map<number, GLInternalFormatString>([
				[gl.FLOAT, 'RGBA32F'],
				[gl.HALF_FLOAT, 'RGBA16F'],
				[gl.UNSIGNED_SHORT, 'RGBA32UI'],
				[gl.SHORT, 'RGBA32I'],
				[gl.BYTE, 'RGBA32I'],
				[gl.UNSIGNED_INT, 'RGBA32UI'],
				[gl.INT, 'RGBA32I'],
			]),
			unsignedIntTypes: new Set([gl.UNSIGNED_BYTE, gl.UNSIGNED_SHORT, gl.UNSIGNED_INT]),
		};

		let registryEntry = canvasRegistry.get(this.canvas);
		if (!registryEntry) {
			registryEntry = {
				textureUnitPool: {
					free: [],
					next: 0,
					max: gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS),
				},
				instances: new Set([this]),
			};
			canvasRegistry.set(this.canvas, registryEntry);
		}
		this.textureUnitPool = registryEntry.textureUnitPool;
		registryEntry.instances.add(this);

		this.textureOptions = textureOptions;

		if (history) this.historyDepth = history;
		this.debug = debug ?? (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production');
		this.cursorTarget = cursorTarget ?? (this.canvas instanceof HTMLCanvasElement ? this.canvas : undefined);
		this.animationFrameId = null;

		const glslInjections: string[] = [];
		if (plugins) {
			plugins.forEach(plugin =>
				plugin(this, {
					gl,
					canvas: this.canvas,
					injectGLSL: (code: string) => {
						glslInjections.push(code);
					},
					emitHook: this.emitHook.bind(this),
				})
			);
		}

		const program = this.gl.createProgram();
		if (!program) {
			throw new Error('Failed to create WebGL program');
		}
		this.program = program;

		const vertexShader = this.createShader(this.gl.VERTEX_SHADER, DEFAULT_VERTEX_SHADER_SRC);
		const fragmentShader = this.createShader(
			gl.FRAGMENT_SHADER,
			combineShaderCode(fragmentShaderSrc, glslInjections)
		);
		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.bindAttribLocation(program, 0, 'a_position');
		gl.linkProgram(program);
		gl.deleteShader(vertexShader);
		gl.deleteShader(fragmentShader);

		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			console.error('Program link error:', gl.getProgramInfoLog(program));
			gl.deleteProgram(program);
			throw new Error('Failed to link WebGL program');
		}

		this.vao = gl.createVertexArray();
		gl.bindVertexArray(this.vao);
		this.buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
		gl.enableVertexAttribArray(0);
		gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

		gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

		gl.useProgram(program);

		if (this.canvas instanceof HTMLCanvasElement) {
			this.resolutionObserver = new MutationObserver(() => this.updateResolution());
			this.resolutionObserver.observe(this.canvas, { attributes: true, attributeFilter: ['width', 'height'] });
		} else {
			const wrapDimension = (dimension: 'width' | 'height') => {
				const descriptor = Object.getOwnPropertyDescriptor(OffscreenCanvas.prototype, dimension)!;
				const canvas = this.canvas;
				Object.defineProperty(canvas, dimension, {
					get: () => descriptor.get!.call(canvas),
					set: v => {
						descriptor.set!.call(canvas, v);
						const entry = canvasRegistry.get(canvas);
						if (entry) {
							for (const instance of entry.instances) {
								instance.updateResolution();
							}
						}
					},
					configurable: descriptor.configurable,
					enumerable: descriptor.enumerable,
				});
			};
			wrapDimension('width');
			wrapDimension('height');
		}
		this.updateResolution();

		this.initializeUniform('u_cursor', 'float', this.cursorPosition);
		this.initializeUniform('u_click', 'float', [...this.clickPosition, this.isMouseDown ? 1.0 : 0.0]);
		this.initializeUniform('u_time', 'float', 0);
		this.initializeUniform('u_frame', 'int', 0);

		this._initializeTexture(INTERMEDIATE_TEXTURE_KEY, this.canvas, {
			...this.textureOptions,
		});
		this.intermediateFbo = gl.createFramebuffer();
		this.bindIntermediate();
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);

		if (this.historyDepth > 0) {
			this._initializeTexture(HISTORY_TEXTURE_KEY, this.canvas, {
				history: this.historyDepth,
				...this.textureOptions,
			});
		}
		if (this.cursorTarget) {
			this.addEventListeners();
		}
		this.emitHook('_init');
	}

	private resolveGLConstant(value: GLConstantString): number {
		const resolved = this.gl[value];
		if (resolved === undefined) {
			throw new Error(`Unknown GL constant: ${value}`);
		}
		return resolved;
	}

	private emitHook(name: LifecycleMethod, ...args: any[]) {
		this.hooks.get(name)?.forEach(hook => hook.call(this, ...args));
	}

	on(name: LifecycleMethod, fn: Function) {
		if (!this.hooks.has(name)) {
			this.hooks.set(name, []);
		}
		this.hooks.get(name)!.push(fn);
	}

	off(name: LifecycleMethod, fn: Function) {
		const hooks = this.hooks.get(name);
		if (hooks) {
			hooks.splice(hooks.indexOf(fn), 1);
		}
	}

	private createShader(type: number, source: string): WebGLShader {
		const shader = this.gl.createShader(type)!;
		this.gl.shaderSource(shader, source);
		this.gl.compileShader(shader);
		if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
			console.error('Shader compilation failed:', source);
			console.error(this.gl.getShaderInfoLog(shader));
			this.gl.deleteShader(shader);
			throw new Error('Shader compilation failed');
		}
		return shader;
	}

	private getCursorTargetRect(): { left: number; top: number; width: number; height: number } {
		const target = this.cursorTarget!;
		if (target === window) {
			return { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
		}
		return (target as Element).getBoundingClientRect();
	}

	private addEventListeners() {
		if (!this.cursorTarget) return;
		const updateCursor = (x: number, y: number) => {
			if (!this.uniforms.has('u_cursor')) return;
			const rect = this.getCursorTargetRect();
			const u = (x - rect.left) / rect.width;
			const v = 1 - (y - rect.top) / rect.height; // Flip Y for WebGL
			this.cursorPosition[0] = Math.max(0, Math.min(1, u));
			this.cursorPosition[1] = Math.max(0, Math.min(1, v));
			this.updateUniforms({ u_cursor: this.cursorPosition });
		};

		const updateClick = (isMouseDown: boolean, x?: number, y?: number) => {
			if (!this.uniforms.has('u_click')) return;
			this.isMouseDown = isMouseDown;
			if (isMouseDown) {
				const rect = this.getCursorTargetRect();
				const xVal = x as number;
				const yVal = y as number;
				this.clickPosition[0] = Math.max(0, Math.min(1, (xVal - rect.left) / rect.width));
				this.clickPosition[1] = Math.max(0, Math.min(1, 1 - (yVal - rect.top) / rect.height)); // Flip Y for WebGL
			}
			this.updateUniforms({ u_click: [...this.clickPosition, this.isMouseDown ? 1.0 : 0.0] });
		};

		this.eventListeners.set('mousemove', event => {
			const mouseEvent = event as MouseEvent;
			if (!this.isTouchDevice) {
				updateCursor(mouseEvent.clientX, mouseEvent.clientY);
			}
		});

		this.eventListeners.set('mousedown', event => {
			const mouseEvent = event as MouseEvent;
			if (!this.isTouchDevice) {
				if (mouseEvent.button === 0) {
					this.isMouseDown = true;
					updateClick(true, mouseEvent.clientX, mouseEvent.clientY);
				}
			}
		});

		this.eventListeners.set('mouseup', event => {
			const mouseEvent = event as MouseEvent;
			if (!this.isTouchDevice) {
				if (mouseEvent.button === 0) {
					updateClick(false);
				}
			}
		});

		this.eventListeners.set('touchmove', event => {
			const touchEvent = event as TouchEvent;
			if (touchEvent.touches.length > 0) {
				updateCursor(touchEvent.touches[0].clientX, touchEvent.touches[0].clientY);
			}
		});

		this.eventListeners.set('touchstart', event => {
			const touchEvent = event as TouchEvent;
			this.isTouchDevice = true;
			if (touchEvent.touches.length > 0) {
				updateCursor(touchEvent.touches[0].clientX, touchEvent.touches[0].clientY);
				updateClick(true, touchEvent.touches[0].clientX, touchEvent.touches[0].clientY);
			}
		});

		this.eventListeners.set('touchend', event => {
			const touchEvent = event as TouchEvent;
			if (touchEvent.touches.length === 0) {
				updateClick(false);
			}
		});

		this.eventListeners.forEach((listener, event) => {
			this.cursorTarget!.addEventListener(event, listener);
		});
	}

	updateResolution() {
		const resolution: [number, number] = [this.gl.drawingBufferWidth, this.gl.drawingBufferHeight];
		this.gl.viewport(0, 0, ...resolution);
		if (this.uniforms.has('u_resolution')) {
			this.updateUniforms({ u_resolution: resolution });
		} else {
			this.initializeUniform('u_resolution', 'float', resolution);
		}
		this.resizeTexture(INTERMEDIATE_TEXTURE_KEY, ...resolution);
		if (this.historyDepth > 0) {
			this.resizeTexture(HISTORY_TEXTURE_KEY, ...resolution);
		}
		this.emitHook('updateResolution', ...resolution);
	}

	private resizeTexture(name: string | symbol, width: number, height: number) {
		const info = this.textures.get(name);
		if (!info || (info.width === width && info.height === height)) return;

		this.gl.deleteTexture(info.texture);
		info.width = width;
		info.height = height;
		const { texture } = this.createTexture(name, info);
		info.texture = texture;
		if (info.history) {
			info.history.writeIndex = 0;
			this.clearHistoryTextureLayers(info);
		}
	}

	private reserveTextureUnit(name: string | symbol) {
		const existing = this.textures.get(name);
		if (existing) return existing.unitIndex;
		if (this.textureUnitPool.free.length > 0) return this.textureUnitPool.free.pop()!;
		if (this.textureUnitPool.next >= this.textureUnitPool.max) {
			throw new Error('Exceeded the available texture units for this device.');
		}
		return this.textureUnitPool.next++;
	}

	private resolveTextureOptions(options?: TextureOptions): ResolvedTextureOptions {
		const { gl } = this;
		const internalFormatOption = options?.internalFormat;
		const typeString = options?.type ?? typeFromInternalFormatString(internalFormatOption) ?? 'UNSIGNED_BYTE';
		const type = this.resolveGLConstant(typeString);
		const internalFormatString =
			internalFormatOption ?? this.glHelpers.typeToInternalFormatString.get(type) ?? 'RGBA8';
		const isIntegerColorFormat = /^(R|RG|RGB|RGBA)(8|16|32)(UI|I)$/.test(internalFormatString);
		const formatString = options?.format ?? (isIntegerColorFormat ? 'RGBA_INTEGER' : 'RGBA');
		const result: ResolvedTextureOptions = {
			type,
			format: this.resolveGLConstant(formatString),
			internalFormat: this.resolveGLConstant(internalFormatString),
			minFilter: this.resolveGLConstant(options?.minFilter ?? 'LINEAR'),
			magFilter: this.resolveGLConstant(options?.magFilter ?? 'LINEAR'),
			wrapS: this.resolveGLConstant(options?.wrapS ?? 'CLAMP_TO_EDGE'),
			wrapT: this.resolveGLConstant(options?.wrapT ?? 'CLAMP_TO_EDGE'),
			preserveY: options?.preserveY,
			isIntegerColorFormat,
		};
		const isFloatColorFormat = result.internalFormat === gl.RGBA16F || result.internalFormat === gl.RGBA32F;
		// gl.getExtension isn’t just a check, it’s a required side-effect to enable floats.
		if (isFloatColorFormat && !gl.getExtension('EXT_color_buffer_float')) {
			throw new Error('Missing EXT_color_buffer_float.');
		}
		return result;
	}

	private getPixelArray(type: number, size: number): ArrayBufferView {
		const ArrayType = this.glHelpers.typeToArray.get(type) ?? Uint8Array;
		return new ArrayType(size);
	}

	private clearHistoryTextureLayers(textureInfo: Texture): void {
		if (!textureInfo.history) return;

		const gl = this.gl;
		const { type, format } = textureInfo.options;
		const transparent = this.getPixelArray(type, textureInfo.width * textureInfo.height * 4);
		gl.activeTexture(gl.TEXTURE0 + textureInfo.unitIndex);
		gl.bindTexture(gl.TEXTURE_2D_ARRAY, textureInfo.texture);
		for (let layer = 0; layer < textureInfo.history.depth; ++layer) {
			gl.texSubImage3D(
				gl.TEXTURE_2D_ARRAY,
				0,
				0,
				0,
				layer,
				textureInfo.width,
				textureInfo.height,
				1,
				format,
				type,
				transparent
			);
		}
	}

	initializeUniform(
		name: string,
		type: 'float' | 'int',
		value: number | number[] | (number | number[])[],
		options?: { arrayLength?: number }
	) {
		const arrayLength = options?.arrayLength;
		if (this.uniforms.has(name)) {
			throw new Error(`${name} is already initialized.`);
		}
		if (type !== 'float' && type !== 'int') {
			throw new Error(`Invalid uniform type: ${type}. Expected 'float' or 'int'.`);
		}
		if (arrayLength && !(Array.isArray(value) && value.length === arrayLength)) {
			throw new Error(`${name} array length mismatch: must initialize with ${arrayLength} elements.`);
		}

		let location = this.gl.getUniformLocation(this.program!, name);
		if (!location && arrayLength) {
			location = this.gl.getUniformLocation(this.program!, `${name}[0]`);
		}
		if (!location) {
			this.log(`${name} not in shader. Skipping initialization.`);
			return;
		}

		const probeValue = arrayLength ? (value as number[] | number[][])[0] : value;
		const length = Array.isArray(probeValue) ? (probeValue.length as 1 | 2 | 3 | 4) : 1;
		this.uniforms.set(name, { type, length, location, arrayLength });

		try {
			this.updateUniforms({ [name]: value });
		} catch (error) {
			this.uniforms.delete(name);
			throw error;
		}
		this.emitHook('initializeUniform', ...arguments);
	}

	private log(...args: any[]) {
		if (this.debug) console.debug(...args);
	}

	updateUniforms(
		updates: Record<string, number | number[] | (number | number[])[]>,
		options?: { startIndex?: number }
	) {
		this.gl.useProgram(this.program);
		Object.entries(updates).forEach(([name, newValue]) => {
			const uniform = this.uniforms.get(name);
			if (!uniform) {
				this.log(`${name} not in shader. Skipping update.`);
				return;
			}

			let glFunctionName = `uniform${uniform.length}${uniform.type.charAt(0)}`; // e.g. uniform1f, uniform3i…
			if (uniform.arrayLength) {
				if (!Array.isArray(newValue)) {
					throw new Error(`${name} is an array, but the value passed to updateUniforms is not an array.`);
				}
				const nValues = newValue.length;
				if (!nValues) return;
				if (nValues > uniform.arrayLength) {
					throw new Error(
						`${name} received ${nValues} values, but maximum length is ${uniform.arrayLength}.`
					);
				}
				if (newValue.some(item => (Array.isArray(item) ? item.length : 1) !== uniform.length)) {
					throw new Error(
						`Tried to update ${name} with some elements that are not length ${uniform.length}.`
					);
				}
				const typedArray = new (uniform.type === 'float' ? Float32Array : Int32Array)(newValue.flat());
				let location = uniform.location;
				if (options?.startIndex) {
					const newLocation = this.gl.getUniformLocation(this.program!, `${name}[${options.startIndex}]`);
					if (!newLocation) {
						throw new Error(
							`${name}[${options.startIndex}] not in shader. Did you pass an invalid startIndex?`
						);
					}
					location = newLocation;
				}
				(this.gl as any)[glFunctionName + 'v'](location, typedArray);
			} else {
				if (!Array.isArray(newValue)) newValue = [newValue];
				if (newValue.length !== uniform.length) {
					throw new Error(`Invalid uniform value length: ${newValue.length}. Expected ${uniform.length}.`);
				}
				(this.gl as any)[glFunctionName](uniform.location, ...newValue);
			}
		});
		this.emitHook('updateUniforms', ...arguments);
	}

	private createTexture(
		name: string | symbol,
		textureInfo: Pick<Texture, 'width' | 'height' | 'history' | 'options'> & { unitIndex?: number }
	) {
		const { width, height } = textureInfo;
		const historyDepth = textureInfo.history?.depth ?? 0;

		const texture = this.gl.createTexture();
		if (!texture) {
			throw new Error('Failed to create texture');
		}

		let unitIndex = textureInfo.unitIndex;
		if (typeof unitIndex !== 'number') {
			try {
				unitIndex = this.reserveTextureUnit(name);
			} catch (error) {
				this.gl.deleteTexture(texture);
				throw error;
			}
		}

		const hasHistory = historyDepth > 0;
		const textureTarget = hasHistory ? this.gl.TEXTURE_2D_ARRAY : this.gl.TEXTURE_2D;
		const { options } = textureInfo;
		this.gl.activeTexture(this.gl.TEXTURE0 + unitIndex);
		this.gl.bindTexture(textureTarget, texture);
		this.gl.texParameteri(textureTarget, this.gl.TEXTURE_WRAP_S, options.wrapS);
		this.gl.texParameteri(textureTarget, this.gl.TEXTURE_WRAP_T, options.wrapT);
		this.gl.texParameteri(textureTarget, this.gl.TEXTURE_MIN_FILTER, options.minFilter);
		this.gl.texParameteri(textureTarget, this.gl.TEXTURE_MAG_FILTER, options.magFilter);
		if (hasHistory) {
			this.gl.texStorage3D(textureTarget, 1, options.internalFormat, width, height, historyDepth);
		} else if (name === INTERMEDIATE_TEXTURE_KEY) {
			this.gl.texImage2D(
				this.gl.TEXTURE_2D,
				0,
				options.internalFormat,
				width,
				height,
				0,
				options.format,
				options.type,
				null
			);
		}
		return { texture, unitIndex };
	}

	private _initializeTexture(
		name: string | symbol,
		source: TextureSource,
		options?: TextureOptions & { history?: number }
	) {
		if (this.textures.has(name)) {
			throw new Error(`Texture '${stringFrom(name)}' is already initialized.`);
		}

		const { history: historyDepth = 0, ...textureOptions } = options ?? {};
		const { width, height } = getSourceDimensions(source);
		if (!width || !height) {
			throw new Error(`Texture source must have valid dimensions`);
		}
		const textureInfo: Pick<Texture, 'width' | 'height' | 'history' | 'options'> = {
			width,
			height,
			options: this.resolveTextureOptions(textureOptions),
		};
		if (historyDepth > 0) {
			textureInfo.history = { depth: historyDepth, writeIndex: 0 };
		}
		const { texture, unitIndex } = this.createTexture(name, textureInfo);
		const completeTextureInfo: Texture = { texture, unitIndex, ...textureInfo };
		if (historyDepth > 0) {
			this.initializeUniform(`${stringFrom(name)}FrameOffset`, 'int', 0);
			this.clearHistoryTextureLayers(completeTextureInfo);
		}
		this.textures.set(name, completeTextureInfo);
		if (name !== INTERMEDIATE_TEXTURE_KEY && name !== HISTORY_TEXTURE_KEY) {
			this.updateTexture(name, source);
		}

		// Set a uniform to access the texture in the fragment shader.
		this.gl.useProgram(this.program!);
		const uSampler = this.gl.getUniformLocation(this.program!, stringFrom(name));
		if (uSampler) {
			this.gl.uniform1i(uSampler, unitIndex);
		}
	}

	initializeTexture(name: string, source: TextureSource, options?: TextureOptions & { history?: number }) {
		// Since history[0] is the current frame, add 1 to history depth to allow history[maxHistory].
		const opts =
			options?.history != null && options.history > 0 ? { ...options, history: options.history + 1 } : options;
		this._initializeTexture(name, source, opts);
		this.emitHook('initializeTexture', ...arguments);
	}

	updateTextures(
		updates: Record<string, UpdateTextureSource>,
		options?: { skipHistoryWrite?: boolean; historyWriteIndex?: number | number[] }
	) {
		Object.entries(updates).forEach(([name, source]) => {
			this.updateTexture(name, source, options);
		});
		this.emitHook('updateTextures', ...arguments);
	}

	private updateTexture(
		name: string | symbol,
		source: UpdateTextureSource,
		options?: { skipHistoryWrite?: boolean; historyWriteIndex?: number | number[] }
	) {
		const info = this.textures.get(name);
		if (!info) throw new Error(`Texture '${stringFrom(name)}' is not initialized.`);

		if (source instanceof WebGLTexture) {
			this.gl.activeTexture(this.gl.TEXTURE0 + info.unitIndex);
			this.gl.bindTexture(this.gl.TEXTURE_2D, source);
			return;
		}

		let nonShaderPadSource = source as Exclude<UpdateTextureSource, ShaderPad>;
		if (source instanceof ShaderPad) {
			const sourceIntermediateInfo = source.textures.get(INTERMEDIATE_TEXTURE_KEY)!;
			const srcW = sourceIntermediateInfo.width;
			const srcH = sourceIntermediateInfo.height;

			if (source.gl === this.gl) {
				if (!info.history) {
					this.gl.activeTexture(this.gl.TEXTURE0 + info.unitIndex);
					this.gl.bindTexture(this.gl.TEXTURE_2D, sourceIntermediateInfo.texture);
					return;
				}
				const { depth } = info.history;
				const targetSlots =
					options?.historyWriteIndex === undefined
						? [info.history.writeIndex]
						: Array.isArray(options?.historyWriteIndex)
						? options.historyWriteIndex.map(i => safeMod(i, depth))
						: [safeMod(options.historyWriteIndex, depth)];
				this.gl.bindFramebuffer(this.gl.READ_FRAMEBUFFER, source.intermediateFbo);
				this.gl.bindTexture(this.gl.TEXTURE_2D_ARRAY, info.texture);
				for (const slot of targetSlots) {
					this.gl.copyTexSubImage3D(this.gl.TEXTURE_2D_ARRAY, 0, 0, 0, slot, 0, 0, srcW, srcH);
				}
				this.gl.bindFramebuffer(this.gl.READ_FRAMEBUFFER, null);
				this.gl.activeTexture(this.gl.TEXTURE0 + info.unitIndex);
				this.gl.bindTexture(this.gl.TEXTURE_2D_ARRAY, info.texture);
				const frameOffsetUniformName = `${stringFrom(name)}FrameOffset`;
				this.updateUniforms({ [frameOffsetUniformName]: targetSlots[targetSlots.length - 1] });
				if (options?.historyWriteIndex === undefined) {
					info.history.writeIndex = (info.history.writeIndex + 1) % depth;
				}
				return;
			}

			// Different contexts - transfer via readPixels to preserve precision.
			const {
				width,
				height,
				options: { format, type },
			} = sourceIntermediateInfo;
			const pixels = this.getPixelArray(type, width * height * 4);
			source.gl.bindFramebuffer(source.gl.FRAMEBUFFER, source.intermediateFbo);
			source.gl.readPixels(0, 0, width, height, format, type, pixels);
			source.gl.bindFramebuffer(source.gl.FRAMEBUFFER, null);
			nonShaderPadSource = { data: pixels, width, height };
		}

		// If dimensions changed, recreate the texture with new dimensions.
		const { width, height } = getSourceDimensions(nonShaderPadSource);
		if (!width || !height) return;

		const isPartial = 'isPartial' in nonShaderPadSource && nonShaderPadSource.isPartial;
		if (!isPartial) {
			this.resizeTexture(name, width, height);
		}

		// UNPACK_FLIP_Y_WEBGL only works for DOM element sources, not typed arrays.
		const isTypedArray = 'data' in nonShaderPadSource && nonShaderPadSource.data;
		const shouldFlipY = !isTypedArray && !info.options?.preserveY;
		const previousFlipY = this.gl.getParameter(this.gl.UNPACK_FLIP_Y_WEBGL);

		if (info.history) {
			this.gl.activeTexture(this.gl.TEXTURE0 + info.unitIndex);
			this.gl.bindTexture(this.gl.TEXTURE_2D_ARRAY, info.texture);
			if (!options?.skipHistoryWrite) {
				const { depth } = info.history;
				const targetSlots =
					options?.historyWriteIndex === undefined
						? [info.history.writeIndex]
						: Array.isArray(options.historyWriteIndex)
						? options.historyWriteIndex.map(i => safeMod(i, depth))
						: [safeMod(options.historyWriteIndex, depth)];

				this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, shouldFlipY);
				const sourceData =
					(nonShaderPadSource as PartialCustomTexture).data ??
					(nonShaderPadSource as Exclude<TextureSource, CustomTexture | ShaderPad>);

				for (const slot of targetSlots) {
					this.gl.texSubImage3D(
						this.gl.TEXTURE_2D_ARRAY,
						0,
						0,
						0,
						slot,
						width,
						height,
						1,
						info.options.format,
						info.options.type,
						sourceData as any
					);
				}
				this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, previousFlipY);

				const frameOffsetUniformName = `${stringFrom(name)}FrameOffset`;
				this.updateUniforms({ [frameOffsetUniformName]: targetSlots[targetSlots.length - 1] });

				if (options?.historyWriteIndex === undefined) {
					info.history.writeIndex = (info.history.writeIndex + 1) % depth;
				}
			}
		} else {
			this.gl.activeTexture(this.gl.TEXTURE0 + info.unitIndex);
			this.gl.bindTexture(this.gl.TEXTURE_2D, info.texture);
			this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, shouldFlipY);

			if (isPartial) {
				const partialSource = nonShaderPadSource as PartialCustomTexture;
				this.gl.texSubImage2D(
					this.gl.TEXTURE_2D,
					0,
					partialSource.x ?? 0,
					partialSource.y ?? 0,
					width,
					height,
					info.options.format,
					info.options.type,
					partialSource.data
				);
			} else {
				this.gl.texImage2D(
					this.gl.TEXTURE_2D,
					0,
					info.options.internalFormat,
					width,
					height,
					0,
					info.options.format,
					info.options.type,
					((nonShaderPadSource as PartialCustomTexture).data ??
						(nonShaderPadSource as Exclude<TextureSource, CustomTexture | ShaderPad>)) as any
				);
			}
			this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, previousFlipY);
		}
	}

	private bindIntermediate() {
		const gl = this.gl;
		const intermediateInfo = this.textures.get(INTERMEDIATE_TEXTURE_KEY)!;
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.intermediateFbo);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, intermediateInfo.texture, 0);
	}

	clear() {
		this.bindIntermediate();
		const gl = this.gl;
		const intermediateInfo = this.textures.get(INTERMEDIATE_TEXTURE_KEY)!;
		if (intermediateInfo.options.isIntegerColorFormat) {
			const t = intermediateInfo.options.type;
			if (this.glHelpers.unsignedIntTypes.has(t)) {
				gl.clearBufferuiv(gl.COLOR, 0, new Uint32Array(4));
			} else {
				gl.clearBufferiv(gl.COLOR, 0, new Int32Array(4));
			}
		} else {
			gl.clear(gl.COLOR_BUFFER_BIT);
		}
	}

	draw(options?: StepOptions) {
		this.emitHook('beforeDraw', ...arguments);
		const gl = this.gl;
		const w = gl.drawingBufferWidth;
		const h = gl.drawingBufferHeight;

		if (options?.skipClear) {
			this.bindIntermediate();
		} else {
			this.clear();
		}

		gl.useProgram(this.program);
		gl.bindVertexArray(this.vao);
		gl.viewport(0, 0, w, h);
		gl.drawArrays(gl.TRIANGLES, 0, 3);

		if (!this.isHeadless) {
			const intermediateInfo = this.textures.get(INTERMEDIATE_TEXTURE_KEY)!;
			if (!intermediateInfo.options.isIntegerColorFormat) {
				gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.intermediateFbo);
				gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
				gl.blitFramebuffer(0, 0, w, h, 0, 0, w, h, gl.COLOR_BUFFER_BIT, gl.NEAREST);
				gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			}
		}
		this.emitHook('afterDraw', ...arguments);
	}

	step(options?: StepOptions) {
		this._step(performance.now() - this.startTime, options);
	}

	private _step(time: number, options?: StepOptions) {
		this.emitHook('beforeStep', time, this.frame, options);
		const updates: Record<string, number> = {};
		if (this.uniforms.has('u_time')) updates.u_time = time;
		if (this.uniforms.has('u_frame')) updates.u_frame = this.frame;
		this.updateUniforms(updates);
		this.draw(options);
		const historyInfo = this.textures.get(HISTORY_TEXTURE_KEY);
		if (historyInfo && !options?.skipHistoryWrite) {
			const { writeIndex, depth } = historyInfo.history!;
			const gl = this.gl;
			gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.intermediateFbo);
			gl.bindTexture(gl.TEXTURE_2D_ARRAY, historyInfo.texture);
			gl.copyTexSubImage3D(
				gl.TEXTURE_2D_ARRAY,
				0,
				0,
				0,
				writeIndex,
				0,
				0,
				gl.drawingBufferWidth,
				gl.drawingBufferHeight
			);
			gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
			const nextWriteIndex = (writeIndex + 1) % depth;
			this.updateUniforms({ [`${stringFrom(HISTORY_TEXTURE_KEY)}FrameOffset`]: nextWriteIndex });
			historyInfo.history!.writeIndex = nextWriteIndex;
		}
		++this.frame;
		this.emitHook('afterStep', time, this.frame, options);
	}

	play(onBeforeStep?: (time: number, frame: number) => StepOptions | void) {
		this.pause(); // Prevent double play.
		this.isPlaying = true;
		const loop = (time: number) => {
			time = (time - this.startTime) / 1000; // Convert from milliseconds to seconds.
			const options = onBeforeStep?.(time, this.frame) ?? undefined;
			this._step(time, options);
			if (this.isPlaying) this.animationFrameId = requestAnimationFrame(loop);
		};
		this.animationFrameId = requestAnimationFrame(loop);
		this.emitHook('play');
	}

	private _pause() {
		this.isPlaying = false;
		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
		}
	}

	pause() {
		this._pause();
		this.emitHook('pause');
	}

	reset() {
		this.frame = 0;
		this.startTime = performance.now();
		this.textures.forEach(texture => {
			if (texture.history) {
				texture.history.writeIndex = 0;
				this.clearHistoryTextureLayers(texture);
			}
		});
		this.clear();
		this.emitHook('reset');
	}

	destroy() {
		this.emitHook('destroy');

		this._pause();

		if (this.cursorTarget) {
			this.eventListeners.forEach((listener, event) => {
				this.cursorTarget!.removeEventListener(event, listener);
			});
			this.eventListeners.clear();
		}

		if (this.resolutionObserver) {
			this.resolutionObserver.disconnect();
			this.resolutionObserver = null;
		}

		if (this.program) {
			this.gl.deleteProgram(this.program);
			this.program = null;
		}

		if (this.intermediateFbo) {
			this.gl.deleteFramebuffer(this.intermediateFbo);
			this.intermediateFbo = null;
		}

		this.textures.forEach(texture => {
			this.textureUnitPool.free.push(texture.unitIndex);
			this.gl.deleteTexture(texture.texture);
		});
		this.textures.clear();
		const entry = canvasRegistry.get(this.canvas);
		if (entry) {
			entry.instances.delete(this);
			if (entry.instances.size === 0) {
				canvasRegistry.delete(this.canvas);
			}
		}

		if (this.vao) {
			this.gl.deleteVertexArray(this.vao);
			this.vao = null;
		}

		if (this.buffer) {
			this.gl.deleteBuffer(this.buffer);
			this.buffer = null;
		}

		this.uniforms.clear();
		this.hooks.clear();
	}
}

export default ShaderPad;
