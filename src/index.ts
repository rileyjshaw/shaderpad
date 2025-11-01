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
}

interface Texture {
	texture: WebGLTexture;
	unitIndex: number;
}

export type TextureSource = HTMLImageElement | HTMLVideoElement;

export interface PluginContext {
	gl: WebGL2RenderingContext;
	uniforms: Map<string, Uniform>;
	textures: Map<string, Texture>;
	get program(): WebGLProgram | null;
	canvas: HTMLCanvasElement;
	reserveTextureUnit: (name: string) => number;
	releaseTextureUnit: (name: string) => void;
}

type Plugin = (shaderPad: ShaderPad, context: PluginContext) => void;

type LifecycleMethod = 'init' | 'step' | 'destroy' | 'updateResolution' | 'reset';

interface Options {
	canvas?: HTMLCanvasElement | null;
	plugins?: Plugin[];
}

type TextureUnitPool = {
	free: number[];
	next: number;
	max: number;
};

class ShaderPad {
	private isInternalCanvas = false;
	private isTouchDevice = false;
	private gl: WebGL2RenderingContext;
	private downloadLink: HTMLAnchorElement;
	private fragmentShaderSrc: string;
	private uniforms: Map<string, Uniform> = new Map();
	private textures: Map<string, Texture> = new Map();
	private textureUnitPool: TextureUnitPool;
	private buffer: WebGLBuffer | null = null;
	private program: WebGLProgram | null = null;
	private animationFrameId: number | null;
	private resolutionObserver: MutationObserver;
	private resizeObserver: ResizeObserver;
	private resizeTimeout: NodeJS.Timeout = null as unknown as NodeJS.Timeout;
	private lastResizeTime = 0;
	private eventListeners: Map<string, EventListener> = new Map();
	private frame = 0;
	private startTime = 0;
	private cursorPosition = [0.5, 0.5];
	private clickPosition = [0.5, 0.5];
	private isMouseDown = false;
	public canvas: HTMLCanvasElement;
	public onResize?: (width: number, height: number) => void;
	private hooks: Map<LifecycleMethod, Function[]> = new Map();

	constructor(fragmentShaderSrc: string, options: Options = {}) {
		this.canvas = options.canvas || document.createElement('canvas');
		if (!options.canvas) {
			this.isInternalCanvas = true;
			document.body.appendChild(this.canvas);
			this.canvas.style.position = 'fixed';
			this.canvas.style.inset = '0';
			this.canvas.style.height = '100dvh';
			this.canvas.style.width = '100dvw';
		}

		this.gl = this.canvas.getContext('webgl2', { antialias: false }) as WebGL2RenderingContext;
		if (!this.gl) {
			throw new Error('WebGL2 not supported. Please use a browser that supports WebGL2.');
		}

		this.textureUnitPool = {
			free: [],
			next: 1, // Start from 1 to avoid conflict with framebuffer history texture at unit 0.
			max: this.gl.getParameter(this.gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS),
		};

		this.downloadLink = document.createElement('a');
		this.fragmentShaderSrc = fragmentShaderSrc;
		this.animationFrameId = null;
		this.resolutionObserver = new MutationObserver(() => this.updateResolution());
		this.resizeObserver = new ResizeObserver(() => this.throttledHandleResize());

		if (options.plugins) {
			const context: PluginContext = {
				gl: this.gl,
				uniforms: this.uniforms,
				textures: this.textures,
				canvas: this.canvas,
				reserveTextureUnit: this.reserveTextureUnit.bind(this),
				releaseTextureUnit: this.releaseTextureUnit.bind(this),
			} as PluginContext;
			// Define program as a getter so it always returns the current program.
			Object.defineProperty(context, 'program', {
				get: () => this.program,
				enumerable: true,
				configurable: true,
			});
			options.plugins.forEach(plugin => plugin(this, context));
		}
		this.init();
		this.addEventListeners();
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

		const aPosition = this.gl.getAttribLocation(this.program, 'aPosition');
		this.setupBuffer(aPosition);

		this.gl.useProgram(this.program);

		this.resolutionObserver.observe(this.canvas, { attributes: true, attributeFilter: ['width', 'height'] });
		this.resizeObserver.observe(this.canvas);

		if (!this.isInternalCanvas) {
			this.updateResolution();
		}
		this.initializeUniform('u_cursor', 'float', this.cursorPosition);
		this.initializeUniform('u_click', 'float', [...this.clickPosition, this.isMouseDown ? 1.0 : 0.0]);
		this.initializeUniform('u_time', 'float', 0);
		this.initializeUniform('u_frame', 'int', 0);

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

	private setupBuffer(aPosition: number) {
		const quadVertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);

		this.buffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, quadVertices, this.gl.STATIC_DRAW);
		this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
		this.gl.enableVertexAttribArray(aPosition);
		this.gl.vertexAttribPointer(aPosition, 2, this.gl.FLOAT, false, 0, 0);
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
		const updateCursor = (x: number, y: number) => {
			if (!this.uniforms.has('u_cursor')) return;
			const rect = this.canvas.getBoundingClientRect();
			this.cursorPosition[0] = (x - rect.left) / rect.width;
			this.cursorPosition[1] = 1 - (y - rect.top) / rect.height; // Flip Y for WebGL
			this.updateUniforms({ u_cursor: this.cursorPosition });
		};

		const updateClick = (isMouseDown: boolean, x?: number, y?: number) => {
			if (!this.uniforms.has('u_click')) return;
			this.isMouseDown = isMouseDown;
			if (isMouseDown) {
				const rect = this.canvas.getBoundingClientRect();
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
			this.canvas.addEventListener(event, listener);
		});
	}

	private updateResolution() {
		const width = this.gl.drawingBufferWidth;
		const height = this.gl.drawingBufferHeight;
		this.gl.viewport(0, 0, width, height);
		if (this.uniforms.has('u_resolution')) {
			this.updateUniforms({ u_resolution: [width, height] });
		} else {
			this.initializeUniform('u_resolution', 'float', [width, height]);
		}

		this.hooks.get('updateResolution')?.forEach(hook => hook.call(this));
	}

	private reserveTextureUnit(name: string) {
		const existing = this.textures.get(name);
		if (existing) return existing.unitIndex;
		if (this.textureUnitPool.free.length > 0) return this.textureUnitPool.free.pop()!;
		if (this.textureUnitPool.next >= this.textureUnitPool.max) {
			throw new Error('Exceeded the available texture units for this device.');
		}
		return this.textureUnitPool.next++;
	}

	private releaseTextureUnit(name: string) {
		const existing = this.textures.get(name);
		if (existing) {
			this.textureUnitPool.free.push(existing.unitIndex);
		}
	}

	initializeUniform(name: string, type: 'float' | 'int', value: number | number[]) {
		if (this.uniforms.has(name)) {
			throw new Error(`Uniform '${name}' is already initialized.`);
		}

		if (type !== 'float' && type !== 'int') {
			throw new Error(`Invalid uniform type: ${type}. Expected 'float' or 'int'.`);
		}

		const location = this.gl.getUniformLocation(this.program!, name);
		if (!location) {
			console.debug(`Uniform ${name} not found in fragment shader. Skipping initialization.`);
			return;
		}

		if (!Array.isArray(value)) {
			value = [value];
		}
		if (value.length < 1 || value.length > 4) {
			throw new Error(`Invalid uniform value length: ${value.length}. Expected a length between 1 and 4.`);
		}

		const length = value.length as 1 | 2 | 3 | 4;
		this.uniforms.set(name, { type, length, location });
		this.updateUniforms({ [name]: value });
	}

	updateUniforms(updates: Record<string, number | number[]>) {
		Object.entries(updates).forEach(([name, value]: [string, number | number[]]) => {
			if (!this.uniforms.has(name)) {
				throw new Error(`Uniform '${name}' is not initialized.`);
			}

			const uniform = this.uniforms.get(name)!;
			if (!Array.isArray(value)) {
				value = [value];
			}
			if (value.length !== uniform.length) {
				throw new Error(`Invalid uniform value length: ${value.length}. Expected ${uniform.length}.`);
			}
			(this.gl as any)[`uniform${uniform.length}${uniform.type.charAt(0)}`](uniform.location, ...value);
		});
	}

	initializeTexture(name: string, source: HTMLImageElement | HTMLVideoElement) {
		if (this.textures.has(name)) {
			throw new Error(`Texture '${name}' is already initialized.`);
		}

		const texture = this.gl.createTexture();
		if (!texture) {
			throw new Error('Failed to create texture');
		}
		let unitIndex: number;
		try {
			unitIndex = this.reserveTextureUnit(name);
		} catch (error) {
			this.gl.deleteTexture(texture);
			throw error;
		}
		this.gl.activeTexture(this.gl.TEXTURE0 + unitIndex);
		this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

		// Flip the texture vertically during upload to match WebGL's coordinate system.
		// WebGL uses bottom-left origin, while images/videos use top-left origin.
		this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);

		this.textures.set(name, { texture, unitIndex });
		this.updateTextures({ [name]: source });

		const uSampler = this.gl.getUniformLocation(this.program!, name);
		if (uSampler) {
			this.gl.uniform1i(uSampler, unitIndex);
		}
	}

	updateTextures(updates: Record<string, HTMLImageElement | HTMLVideoElement>) {
		Object.entries(updates).forEach(([name, source]) => {
			const info = this.textures.get(name);
			if (!info) {
				throw new Error(`Texture '${name}' is not initialized.`);
			}
			this.gl.activeTexture(this.gl.TEXTURE0 + info.unitIndex);
			this.gl.bindTexture(this.gl.TEXTURE_2D, info.texture);
			this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, source);
		});
	}

	step(time: number) {
		const gl = this.gl;

		if (this.uniforms.has('u_time')) {
			this.updateUniforms({ u_time: time });
		}
		if (this.uniforms.has('u_frame')) {
			this.updateUniforms({ u_frame: this.frame });
		}

		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.drawArrays(gl.TRIANGLES, 0, 6);

		this.hooks.get('step')?.forEach(hook => hook.call(this, time, this.frame));

		++this.frame;
	}

	play(callback?: (time: number, frame: number) => void) {
		this.pause(); // Prevent double play.
		const loop = (time: number) => {
			time = (time - this.startTime) / 1000; // Convert from milliseconds to seconds.
			this.step(time);
			this.animationFrameId = requestAnimationFrame(loop);
			if (callback) callback(time, this.frame);
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
		this.hooks.get('reset')?.forEach(hook => hook.call(this));
	}

	async save(filename: string) {
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);
		this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

		if (filename && !`${filename}`.toLowerCase().endsWith('.png')) {
			filename = `${filename}.png`;
		}
		filename = filename || 'export.png';
		if ('ongesturechange' in window) {
			// Mobile.
			try {
				const blob: Blob = await new Promise(resolve =>
					this.canvas.toBlob(resolve as BlobCallback, 'image/png')
				);
				const file = new File([blob], filename, { type: blob.type });

				if (navigator.canShare?.({ files: [file] })) {
					await navigator.share({ files: [file] });
					return;
				}
			} catch (error) {
				console.warn('Web Share API failed:', error);
			}
		} else {
			// Desktop.
			this.downloadLink.download = filename;
			this.downloadLink.href = this.canvas.toDataURL();
			this.downloadLink.click();
		}
	}

	destroy() {
		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
		}

		this.resolutionObserver.disconnect();
		this.resizeObserver.disconnect();
		this.eventListeners.forEach((listener, event) => {
			this.canvas.removeEventListener(event, listener);
		});

		if (this.program) {
			this.gl.deleteProgram(this.program);
		}

		this.textures.forEach(texture => {
			this.gl.deleteTexture(texture.texture);
		});
		this.textureUnitPool.free = [];
		this.textureUnitPool.next = 1;

		if (this.buffer) {
			this.gl.deleteBuffer(this.buffer);
			this.buffer = null;
		}

		this.hooks.get('destroy')?.forEach(hook => hook.call(this));

		if (this.isInternalCanvas) {
			this.canvas.remove();
		}
	}
}

export * from './plugins';
export default ShaderPad;
