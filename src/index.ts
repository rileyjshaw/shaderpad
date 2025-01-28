const defaultVertexShaderSrc = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
    vUv = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

interface Uniform {
	type: 'float' | 'int';
	length: 1 | 2 | 3 | 4;
	location: WebGLUniformLocation;
}

interface Texture {
	texture: WebGLTexture;
	unitIndex: number;
}

class ShaderPad {
	private isInternalCanvas = false;
	private isTouchDevice = false;
	private canvas: HTMLCanvasElement;
	private gl: WebGLRenderingContext;
	private downloadLink: HTMLAnchorElement;
	private fragmentShaderSrc: string;
	private uniforms: Map<string, Uniform> = new Map();
	private textures: Map<string, Texture> = new Map();
	private buffer: WebGLBuffer | null = null;
	private program: WebGLProgram | null = null;
	private animationFrameId: number | null;
	private resizeObserver: ResizeObserver;
	private eventListeners: Map<string, EventListener> = new Map();

	constructor(fragmentShaderSrc: string, canvas: HTMLCanvasElement | null = null) {
		this.canvas = canvas || document.createElement('canvas');
		if (!canvas) {
			this.isInternalCanvas = true;
			document.body.appendChild(this.canvas);
			this.canvas.style.position = 'fixed';
			this.canvas.style.inset = '0';
			this.canvas.style.height = '100dvh';
			this.canvas.style.width = '100dvw';
		}
		this.gl = this.canvas.getContext('webgl')!;
		this.downloadLink = document.createElement('a');
		this.fragmentShaderSrc = fragmentShaderSrc;
		this.animationFrameId = null;
		this.resizeObserver = new ResizeObserver(() => this.resizeCanvas());
		this.resizeObserver.observe(this.canvas);
		this.init();
		this.addEventListeners();
	}

	private init() {
		const vertexShaderSrc = defaultVertexShaderSrc;

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
		this.resizeCanvas();

		this.gl.useProgram(this.program);

		this.initializeUniform('uResolution', 'float', [this.canvas.width, this.canvas.height]);
		this.initializeUniform('uCursor', 'float', [0.5, 0.5]);
		this.initializeUniform('uTime', 'float', 0);
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
		this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
		this.gl.enableVertexAttribArray(aPosition);
		this.gl.vertexAttribPointer(aPosition, 2, this.gl.FLOAT, false, 0, 0);
	}

	private resizeCanvas() {
		const pixelRatio = window.devicePixelRatio || 1;
		const width = this.canvas.clientWidth * pixelRatio;
		const height = this.canvas.clientHeight * pixelRatio;

		const computedStyle = getComputedStyle(this.canvas);
		const hasExplicitWidth = computedStyle.width !== `${this.canvas.width}px` && computedStyle.width !== 'auto';
		const hasExplicitHeight = computedStyle.height !== `${this.canvas.height}px` && computedStyle.height !== 'auto';
		if (!hasExplicitWidth || !hasExplicitHeight) {
			this.canvas.style.width = `${this.canvas.clientWidth}px`;
			this.canvas.style.height = `${this.canvas.clientHeight}px`;
		}

		if (this.canvas.width !== width || this.canvas.height !== height) {
			this.canvas.width = width;
			this.canvas.height = height;
			this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
			if (this.uniforms.has('uResolution')) {
				this.updateUniforms({ uResolution: [this.canvas.width, this.canvas.height] });
			}
		}
	}

	private addEventListeners() {
		const updateCursor = (x: number, y: number) => {
			if (!this.uniforms.has('uCursor')) return;
			const rect = this.canvas.getBoundingClientRect();
			const cursorX = (x - rect.left) / rect.width;
			const cursorY = 1 - (y - rect.top) / rect.height; // Flip Y for WebGL
			this.updateUniforms({ uCursor: [cursorX, cursorY] });
		};
		this.eventListeners.set('mousemove', event => {
			const mouseEvent = event as MouseEvent;
			if (!this.isTouchDevice) {
				updateCursor(mouseEvent.clientX, mouseEvent.clientY);
			}
		});
		this.eventListeners.set('touchmove', event => {
			const touchEvent = event as TouchEvent;
			if (touchEvent.touches.length > 0) {
				updateCursor(touchEvent.touches[0].clientX, touchEvent.touches[0].clientY);
			}
		});
		this.eventListeners.set('touchstart', () => {
			this.isTouchDevice = true;
		});

		this.eventListeners.forEach((listener, event) => {
			this.canvas.addEventListener(event, listener);
		});
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
			console.log(`Uniform ${name} not found in fragment shader. Skipping initialization.`);
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

	play(callback?: (time: number) => void) {
		const renderFrame = (time: number) => {
			time /= 1000; // Convert from milliseconds to seconds.

			this.gl.clear(this.gl.COLOR_BUFFER_BIT);

			if (this.uniforms.has('uTime')) {
				this.updateUniforms({ uTime: time });
			}

			if (callback) callback(time);

			this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
			this.animationFrameId = requestAnimationFrame(renderFrame);
		};

		this.animationFrameId = requestAnimationFrame(renderFrame);
	}

	pause() {
		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
		}
	}

	save(filename: string) {
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);
		this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

		const image = this.canvas.toDataURL();
		if (filename && !`${filename}`.toLowerCase().endsWith('.png')) {
			filename = `${filename}.png`;
		}
		this.downloadLink.download = filename || 'export.png';
		this.downloadLink.href = image;
		this.downloadLink.click();
	}

	initializeTexture(name: string, source: HTMLImageElement | HTMLVideoElement) {
		if (this.textures.has(name)) {
			throw new Error(`Texture '${name}' is already initialized.`);
		}

		const texture = this.gl.createTexture();
		if (!texture) {
			throw new Error('Failed to create texture');
		}
		const unitIndex = this.textures.size;
		this.gl.activeTexture(this.gl.TEXTURE0 + unitIndex);
		this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

		// Flip the texture vertically since vUv is flipped, and set up filters and wrapping.
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

	destroy() {
		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
		}

		this.resizeObserver.unobserve(this.canvas);
		this.eventListeners.forEach((listener, event) => {
			this.canvas.removeEventListener(event, listener);
		});

		if (this.program) {
			this.gl.deleteProgram(this.program);
		}

		this.textures.forEach(texture => {
			this.gl.deleteTexture(texture.texture);
		});

		if (this.buffer) {
			this.gl.deleteBuffer(this.buffer);
			this.buffer = null;
		}

		if (this.isInternalCanvas) {
			this.canvas.remove();
		}
	}
}

export default ShaderPad;
