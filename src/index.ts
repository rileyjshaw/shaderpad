const DEFAULT_VERTEX_SHADER_SRC = `#version 300 es
in vec2 aPosition;
out vec2 v_uv;
void main() {
    v_uv = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;
const RESIZE_THROTTLE_INTERVAL = 1000 / 30;

interface Uniform {
	type: 'float' | 'int';
	length: 1 | 2 | 3 | 4;
	location: WebGLUniformLocation;
	arrayLength?: number;
}

export interface TextureOptions {
	internalFormat?: number;
	format?: number;
	type?: number;
	minFilter?: number;
	magFilter?: number;
	wrapS?: number;
	wrapT?: number;
	preserveY?: boolean;
}

interface Texture {
	texture: WebGLTexture;
	unitIndex: number;
	width: number;
	height: number;
	history?: {
		depth: number;
		writeIndex: number;
	};
	options?: TextureOptions;
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
	| CustomTexture;

// Custom textures allow partial updates starting from (x, y).
type UpdateTextureSource = Exclude<TextureSource, CustomTexture> | PartialCustomTexture;

export interface PluginContext {
	gl: WebGL2RenderingContext;
	uniforms: Map<string, Uniform>;
	textures: Map<string | symbol, Texture>;
	get program(): WebGLProgram | null;
	canvas: HTMLCanvasElement | OffscreenCanvas;
	reserveTextureUnit: (name: string | symbol) => number;
	releaseTextureUnit: (name: string | symbol) => void;
	injectGLSL: (code: string) => void;
}

type Plugin = (shaderPad: ShaderPad, context: PluginContext) => void;

type LifecycleMethod =
	| 'init'
	| 'step'
	| 'afterStep'
	| 'destroy'
	| 'updateResolution'
	| 'reset'
	| 'initializeTexture'
	| 'updateTextures'
	| 'initializeUniform'
	| 'updateUniforms';

export interface Options extends Exclude<TextureOptions, 'preserveY'> {
	canvas?: HTMLCanvasElement | OffscreenCanvas | null;
	plugins?: Plugin[];
	history?: number;
	debug?: boolean;
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
	private isInternalCanvas = false;
	private isTouchDevice = false;
	private gl: WebGL2RenderingContext;
	private fragmentShaderSrc: string;
	private uniforms: Map<string, Uniform> = new Map();
	private textures: Map<string | symbol, Texture> = new Map();
	private textureUnitPool: TextureUnitPool;
	private buffer: WebGLBuffer | null = null;
	private program: WebGLProgram | null = null;
	private aPositionLocation = 0;
	private animationFrameId: number | null;
	private resolutionObserver: MutationObserver;
	private resizeObserver: ResizeObserver;
	private resizeTimeout: ReturnType<typeof setTimeout> = null as unknown as ReturnType<typeof setTimeout>;
	private lastResizeTime = -Infinity;
	private eventListeners: Map<string, EventListener> = new Map();
	private frame = 0;
	private startTime = 0;
	private cursorPosition = [0.5, 0.5];
	private clickPosition = [0.5, 0.5];
	private isMouseDown = false;
	public canvas: HTMLCanvasElement | OffscreenCanvas;
	public onResize?: (width: number, height: number) => void;
	private hooks: Map<LifecycleMethod, Function[]> = new Map();
	private historyDepth = 0;
	private textureOptions: TextureOptions;
	private debug: boolean;
	// WebGL can’t read from and write to the history texture at the same time.
	// We write to an intermediate texture then blit to the history texture.
	private intermediateFbo: WebGLFramebuffer | null = null;

	constructor(fragmentShaderSrc: string, { canvas, plugins, history, debug, ...textureOptions }: Options = {}) {
		this.canvas = canvas || document.createElement('canvas');
		if (!canvas) {
			this.isInternalCanvas = true;
			const htmlCanvas = this.canvas as HTMLCanvasElement;
			htmlCanvas.style.position = 'fixed';
			htmlCanvas.style.inset = '0';
			htmlCanvas.style.height = '100dvh';
			htmlCanvas.style.width = '100dvw';
			document.body.appendChild(htmlCanvas);
		}

		this.gl = this.canvas.getContext('webgl2', { antialias: false }) as WebGL2RenderingContext;
		if (!this.gl) {
			throw new Error('WebGL2 not supported. Please use a browser that supports WebGL2.');
		}

		this.textureUnitPool = {
			free: [],
			next: 0,
			max: this.gl.getParameter(this.gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS),
		};
		this.textureOptions = textureOptions;

		const { internalFormat, type } = textureOptions;
		const isFloatFormat =
			type === this.gl.FLOAT ||
			type === this.gl.HALF_FLOAT ||
			internalFormat === this.gl.RGBA16F ||
			internalFormat === this.gl.RGBA32F ||
			internalFormat === this.gl.R16F ||
			internalFormat === this.gl.R32F ||
			internalFormat === this.gl.RG16F ||
			internalFormat === this.gl.RG32F;
		if (isFloatFormat && !this.gl.getExtension('EXT_color_buffer_float')) {
			console.warn('EXT_color_buffer_float not supported, falling back to RGBA8');
			delete this.textureOptions?.internalFormat;
			delete this.textureOptions?.format;
			delete this.textureOptions?.type;
		}

		if (history) this.historyDepth = history;
		this.debug = debug ?? (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production');
		this.animationFrameId = null;
		this.resolutionObserver = new MutationObserver(() => this.updateResolution());
		this.resizeObserver = new ResizeObserver(() => this.throttledHandleResize());

		const glslInjections: string[] = [];
		if (plugins) {
			const context: PluginContext = {
				gl: this.gl,
				uniforms: this.uniforms,
				textures: this.textures,
				canvas: this.canvas,
				reserveTextureUnit: this.reserveTextureUnit.bind(this),
				releaseTextureUnit: this.releaseTextureUnit.bind(this),
				injectGLSL: (code: string) => {
					glslInjections.push(code);
				},
			} as PluginContext;
			// Define program as a getter so it always returns the current program.
			Object.defineProperty(context, 'program', {
				get: () => this.program,
				enumerable: true,
				configurable: true,
			});
			plugins.forEach(plugin => plugin(this, context));
		}

		this.fragmentShaderSrc = combineShaderCode(fragmentShaderSrc, glslInjections);
		this.init();
		if (this.canvas instanceof HTMLCanvasElement) {
			this.addEventListeners();
		}
	}

	registerHook(name: LifecycleMethod, fn: Function) {
		if (!this.hooks.has(name)) {
			this.hooks.set(name, []);
		}
		this.hooks.get(name)!.push(fn);
	}

	private init() {
		const vertexShaderSrc = DEFAULT_VERTEX_SHADER_SRC;

		this.program = this.gl.createProgram();
		if (!this.program) {
			throw new Error('Failed to create WebGL program');
		}
		const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSrc);
		const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, this.fragmentShaderSrc);

		this.gl.attachShader(this.program, vertexShader);
		this.gl.attachShader(this.program, fragmentShader);
		this.gl.linkProgram(this.program);
		this.gl.deleteShader(vertexShader);
		this.gl.deleteShader(fragmentShader);

		if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
			console.error('Program link error:', this.gl.getProgramInfoLog(this.program));
			this.gl.deleteProgram(this.program);
			throw new Error('Failed to link WebGL program');
		}

		this.aPositionLocation = this.gl.getAttribLocation(this.program, 'aPosition');
		this.setupBuffer();

		this.gl.useProgram(this.program);

		if (this.canvas instanceof HTMLCanvasElement) {
			this.resolutionObserver.observe(this.canvas, { attributes: true, attributeFilter: ['width', 'height'] });
			this.resizeObserver.observe(this.canvas);
		}

		if (!this.isInternalCanvas) {
			this.updateResolution();
		}
		this.initializeUniform('u_cursor', 'float', this.cursorPosition);
		this.initializeUniform('u_click', 'float', [...this.clickPosition, this.isMouseDown ? 1.0 : 0.0]);
		this.initializeUniform('u_time', 'float', 0);
		this.initializeUniform('u_frame', 'int', 0);

		if (this.historyDepth > 0) {
			this._initializeTexture(INTERMEDIATE_TEXTURE_KEY, this.canvas, {
				...this.textureOptions,
			});
			this._initializeTexture(HISTORY_TEXTURE_KEY, this.canvas, {
				history: this.historyDepth,
				...this.textureOptions,
			});
			this.intermediateFbo = this.gl.createFramebuffer();
		}

		this.hooks.get('init')?.forEach(hook => hook.call(this));
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

	private setupBuffer() {
		const quadVertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);

		this.buffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, quadVertices, this.gl.STATIC_DRAW);
		this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
		this.gl.enableVertexAttribArray(this.aPositionLocation);
		this.gl.vertexAttribPointer(this.aPositionLocation, 2, this.gl.FLOAT, false, 0, 0);
	}

	private throttledHandleResize() {
		clearTimeout(this.resizeTimeout);
		const now = performance.now();
		const timeUntilNextResize = this.lastResizeTime + RESIZE_THROTTLE_INTERVAL - now;
		if (timeUntilNextResize <= 0) {
			this.lastResizeTime = now;
			this.handleResize();
		} else {
			this.resizeTimeout = setTimeout(() => this.throttledHandleResize(), timeUntilNextResize);
		}
	}

	private handleResize() {
		if (!(this.canvas instanceof HTMLCanvasElement)) return;
		const pixelRatio = window.devicePixelRatio || 1;
		const width = this.canvas.clientWidth * pixelRatio;
		const height = this.canvas.clientHeight * pixelRatio;
		if (this.isInternalCanvas && (this.canvas.width !== width || this.canvas.height !== height)) {
			this.canvas.width = width;
			this.canvas.height = height;
		}
		this.onResize?.(width, height);
	}

	private addEventListeners() {
		const htmlCanvas = this.canvas as HTMLCanvasElement;
		const updateCursor = (x: number, y: number) => {
			if (!this.uniforms.has('u_cursor')) return;
			const rect = htmlCanvas.getBoundingClientRect();
			this.cursorPosition[0] = (x - rect.left) / rect.width;
			this.cursorPosition[1] = 1 - (y - rect.top) / rect.height; // Flip Y for WebGL
			this.updateUniforms({ u_cursor: this.cursorPosition });
		};

		const updateClick = (isMouseDown: boolean, x?: number, y?: number) => {
			if (!this.uniforms.has('u_click')) return;
			this.isMouseDown = isMouseDown;
			if (isMouseDown) {
				const rect = htmlCanvas.getBoundingClientRect();
				const xVal = x as number;
				const yVal = y as number;
				this.clickPosition[0] = (xVal - rect.left) / rect.width;
				this.clickPosition[1] = 1 - (yVal - rect.top) / rect.height; // Flip Y for WebGL
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
			htmlCanvas.addEventListener(event, listener);
		});
	}

	private updateResolution() {
		const resolution: [number, number] = [this.gl.drawingBufferWidth, this.gl.drawingBufferHeight];
		this.gl.viewport(0, 0, ...resolution);
		if (this.uniforms.has('u_resolution')) {
			this.updateUniforms({ u_resolution: resolution });
		} else {
			this.initializeUniform('u_resolution', 'float', resolution);
		}
		if (this.historyDepth > 0) {
			this.resizeTexture(HISTORY_TEXTURE_KEY, ...resolution);
			this.resizeTexture(INTERMEDIATE_TEXTURE_KEY, ...resolution);
		}
		this.hooks.get('updateResolution')?.forEach(hook => hook.call(this));
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

	private releaseTextureUnit(name: string | symbol) {
		const existing = this.textures.get(name);
		if (existing) {
			this.textureUnitPool.free.push(existing.unitIndex);
		}
	}

	private clearHistoryTextureLayers(textureInfo: Texture): void {
		if (!textureInfo.history) return;

		const gl = this.gl;
		const type = textureInfo.options?.type ?? gl.UNSIGNED_BYTE;
		const size = textureInfo.width * textureInfo.height * 4;
		const transparent =
			type === gl.FLOAT
				? new Float32Array(size)
				: type === gl.HALF_FLOAT
				? new Uint16Array(size)
				: new Uint8Array(size);
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
				textureInfo.options?.format ?? gl.RGBA,
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
			this.log(`${name} not found in fragment shader. Skipping initialization.`);
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
		this.hooks.get('initializeUniform')?.forEach(hook => hook.call(this, ...arguments));
	}

	private log(...args: any[]) {
		if (this.debug) console.debug(...args);
	}

	updateUniforms(
		updates: Record<string, number | number[] | (number | number[])[]>,
		options?: { startIndex?: number }
	) {
		this.gl.useProgram(this.program);
		Object.entries(updates).forEach(([name, value]) => {
			const uniform = this.uniforms.get(name);
			if (!uniform) {
				this.log(`${name} not found in fragment shader. Skipping update.`);
				return;
			}

			let glFunctionName = `uniform${uniform.length}${uniform.type.charAt(0)}`; // e.g. uniform1f, uniform3i…
			if (uniform.arrayLength) {
				if (!Array.isArray(value)) {
					throw new Error(`${name} is an array, but the value passed to updateUniforms is not an array.`);
				}
				const nValues = value.length;
				if (!nValues) return;
				if (nValues > uniform.arrayLength) {
					throw new Error(
						`${name} received ${nValues} values, but maximum length is ${uniform.arrayLength}.`
					);
				}
				if (value.some(item => (Array.isArray(item) ? item.length : 1) !== uniform.length)) {
					throw new Error(
						`Tried to update ${name} with some elements that are not length ${uniform.length}.`
					);
				}
				const typedArray = new (uniform.type === 'float' ? Float32Array : Int32Array)(value.flat());
				let location = uniform.location;
				if (options?.startIndex) {
					const newLocation = this.gl.getUniformLocation(this.program!, `${name}[${options.startIndex}]`);
					if (!newLocation) {
						throw new Error(
							`${name}[${options.startIndex}] not found in fragment shader. Did you pass an invalid startIndex?`
						);
					}
					location = newLocation;
				}
				(this.gl as any)[glFunctionName + 'v'](location, typedArray);
			} else {
				if (!Array.isArray(value)) value = [value];
				if (value.length !== uniform.length) {
					throw new Error(`Invalid uniform value length: ${value.length}. Expected ${uniform.length}.`);
				}
				(this.gl as any)[glFunctionName](uniform.location, ...value);
			}
		});
		this.hooks.get('updateUniforms')?.forEach(hook => hook.call(this, ...arguments));
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
		this.gl.texParameteri(textureTarget, this.gl.TEXTURE_WRAP_S, options?.wrapS ?? this.gl.CLAMP_TO_EDGE);
		this.gl.texParameteri(textureTarget, this.gl.TEXTURE_WRAP_T, options?.wrapT ?? this.gl.CLAMP_TO_EDGE);
		this.gl.texParameteri(textureTarget, this.gl.TEXTURE_MIN_FILTER, options?.minFilter ?? this.gl.LINEAR);
		this.gl.texParameteri(textureTarget, this.gl.TEXTURE_MAG_FILTER, options?.magFilter ?? this.gl.LINEAR);
		if (hasHistory) {
			const type = options?.type ?? this.gl.UNSIGNED_BYTE;
			const internalFormat =
				options?.internalFormat ?? (type === this.gl.FLOAT ? this.gl.RGBA32F : this.gl.RGBA8);
			this.gl.texStorage3D(textureTarget, 1, internalFormat, width, height, historyDepth);
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
			options: textureOptions,
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
		this.updateTexture(name, source);

		// Set a uniform to access the texture in the fragment shader.
		const uSampler = this.gl.getUniformLocation(this.program!, stringFrom(name));
		if (uSampler) {
			this.gl.uniform1i(uSampler, unitIndex);
		}
	}

	initializeTexture(name: string, source: TextureSource, options?: TextureOptions & { history?: number }) {
		this._initializeTexture(name, source, options);
		this.hooks.get('initializeTexture')?.forEach(hook => hook.call(this, ...arguments));
	}

	updateTextures(updates: Record<string, UpdateTextureSource>, options?: { skipHistoryWrite?: boolean }) {
		this.hooks.get('updateTextures')?.forEach(hook => hook.call(this, ...arguments));
		Object.entries(updates).forEach(([name, source]) => {
			this.updateTexture(name, source, options);
		});
	}

	private updateTexture(
		name: string | symbol,
		source: UpdateTextureSource,
		options?: { skipHistoryWrite?: boolean }
	) {
		const info = this.textures.get(name);
		if (!info) throw new Error(`Texture '${stringFrom(name)}' is not initialized.`);

		if (source instanceof WebGLTexture) {
			this.gl.activeTexture(this.gl.TEXTURE0 + info.unitIndex);
			this.gl.bindTexture(this.gl.TEXTURE_2D, source);
			return;
		}

		// If dimensions changed, recreate the texture with new dimensions.
		const { width, height } = getSourceDimensions(source);
		if (!width || !height) return;

		const isPartial = 'isPartial' in source && source.isPartial;
		if (!isPartial) {
			this.resizeTexture(name, width, height);
		}

		// UNPACK_FLIP_Y_WEBGL only works for DOM element sources, not typed arrays.
		const isTypedArray = 'data' in source && source.data;
		const shouldFlipY = !isTypedArray && !info.options?.preserveY;
		const previousFlipY = this.gl.getParameter(this.gl.UNPACK_FLIP_Y_WEBGL);

		if (info.history) {
			this.gl.activeTexture(this.gl.TEXTURE0 + info.unitIndex);
			this.gl.bindTexture(this.gl.TEXTURE_2D_ARRAY, info.texture);
			if (!options?.skipHistoryWrite) {
				this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, shouldFlipY);
				this.gl.texSubImage3D(
					this.gl.TEXTURE_2D_ARRAY,
					0,
					0,
					0,
					info.history.writeIndex,
					width,
					height,
					1,
					info.options?.format ?? this.gl.RGBA,
					info.options?.type ?? this.gl.UNSIGNED_BYTE,
					((source as PartialCustomTexture).data ?? (source as Exclude<TextureSource, CustomTexture>)) as any
				);
				this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, previousFlipY);
				const frameOffsetUniformName = `${stringFrom(name)}FrameOffset`;
				this.updateUniforms({ [frameOffsetUniformName]: info.history.writeIndex });
				info.history.writeIndex = (info.history.writeIndex + 1) % info.history.depth;
			}
		} else {
			this.gl.activeTexture(this.gl.TEXTURE0 + info.unitIndex);
			this.gl.bindTexture(this.gl.TEXTURE_2D, info.texture);
			this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, shouldFlipY);

			const format = info.options?.format ?? this.gl.RGBA;
			const type = info.options?.type ?? this.gl.UNSIGNED_BYTE;

			if (isPartial) {
				this.gl.texSubImage2D(
					this.gl.TEXTURE_2D,
					0,
					source.x ?? 0,
					source.y ?? 0,
					width,
					height,
					format,
					type,
					source.data
				);
			} else {
				const internalFormat =
					info.options?.internalFormat ??
					(isTypedArray ? (type === this.gl.FLOAT ? this.gl.RGBA32F : this.gl.RGBA8) : this.gl.RGBA);
				this.gl.texImage2D(
					this.gl.TEXTURE_2D,
					0,
					internalFormat,
					width,
					height,
					0,
					format,
					type,
					((source as PartialCustomTexture).data ?? (source as Exclude<TextureSource, CustomTexture>)) as any
				);
			}
			this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, previousFlipY);
		}
	}

	draw(options?: StepOptions) {
		const gl = this.gl;
		const w = gl.drawingBufferWidth;
		const h = gl.drawingBufferHeight;
		const historyInfo = this.textures.get(HISTORY_TEXTURE_KEY);
		const intermediateInfo = this.textures.get(INTERMEDIATE_TEXTURE_KEY);
		const shouldStoreHistory = historyInfo && !options?.skipHistoryWrite;

		if (shouldStoreHistory) {
			// Render to intermediate texture to avoid feedback loop with history texture
			gl.bindFramebuffer(gl.FRAMEBUFFER, this.intermediateFbo);
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, intermediateInfo!.texture, 0);
		}

		gl.useProgram(this.program);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		gl.vertexAttribPointer(this.aPositionLocation, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.aPositionLocation);
		gl.viewport(0, 0, w, h);
		if (!options?.skipClear) gl.clear(gl.COLOR_BUFFER_BIT);
		gl.drawArrays(gl.TRIANGLES, 0, 6);

		if (shouldStoreHistory) {
			// Copy to history layer
			gl.bindTexture(gl.TEXTURE_2D_ARRAY, historyInfo.texture);
			gl.copyTexSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, historyInfo.history!.writeIndex, 0, 0, w, h);

			// Blit to screen
			gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.intermediateFbo);
			gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
			gl.blitFramebuffer(0, 0, w, h, 0, 0, w, h, gl.COLOR_BUFFER_BIT, gl.NEAREST);
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		}
	}

	step(time: number, options?: StepOptions) {
		const updates: Record<string, number> = {};
		if (this.uniforms.has('u_time')) updates.u_time = time;
		if (this.uniforms.has('u_frame')) updates.u_frame = this.frame;
		this.updateUniforms(updates);
		this.hooks.get('step')?.forEach(hook => hook.call(this, time, this.frame));

		this.draw(options);

		const historyInfo = this.textures.get(HISTORY_TEXTURE_KEY);
		if (historyInfo && !options?.skipHistoryWrite) {
			const { writeIndex, depth } = historyInfo.history!;
			this.updateUniforms({ [`${stringFrom(HISTORY_TEXTURE_KEY)}FrameOffset`]: writeIndex });
			historyInfo.history!.writeIndex = (writeIndex + 1) % depth;
		}

		this.hooks.get('afterStep')?.forEach(hook => hook.call(this, time, this.frame));
		++this.frame;
	}

	play(
		onStepComplete?: (time: number, frame: number) => void,
		setStepOptions?: (time: number, frame: number) => StepOptions | void
	) {
		this.pause(); // Prevent double play.
		const loop = (time: number) => {
			time = (time - this.startTime) / 1000; // Convert from milliseconds to seconds.
			const options = setStepOptions?.(time, this.frame) ?? undefined;
			this.step(time, options);
			this.animationFrameId = requestAnimationFrame(loop);
			onStepComplete?.(time, this.frame);
		};
		this.animationFrameId = requestAnimationFrame(loop);
	}

	pause() {
		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
		}
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
		this.hooks.get('reset')?.forEach(hook => hook.call(this));
	}

	destroy() {
		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
		}

		this.resolutionObserver.disconnect();
		this.resizeObserver.disconnect();
		if (this.canvas instanceof HTMLCanvasElement) {
			this.eventListeners.forEach((listener, event) => {
				this.canvas.removeEventListener(event, listener);
			});
		}

		if (this.program) {
			this.gl.deleteProgram(this.program);
		}

		if (this.intermediateFbo) {
			this.gl.deleteFramebuffer(this.intermediateFbo);
			this.intermediateFbo = null;
		}

		this.textures.forEach(texture => {
			this.gl.deleteTexture(texture.texture);
		});
		this.textureUnitPool.free = [];
		this.textureUnitPool.next = 0;

		if (this.buffer) {
			this.gl.deleteBuffer(this.buffer);
			this.buffer = null;
		}

		this.hooks.get('destroy')?.forEach(hook => hook.call(this));

		if (this.isInternalCanvas && this.canvas instanceof HTMLCanvasElement) {
			this.canvas.remove();
		}
	}
}

export default ShaderPad;
