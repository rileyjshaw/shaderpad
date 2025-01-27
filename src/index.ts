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

class Shader {
	private canvas: HTMLCanvasElement;
	private gl: WebGLRenderingContext;
	private fragmentShaderSrc: string;
	private uniforms: Map<string, Uniform> = new Map();
	private animationFrameId: number | null;
	private resizeObserver: ResizeObserver;
	private program: WebGLProgram | null = null;

	constructor(fragmentShaderSrc: string, canvas: HTMLCanvasElement | null = null) {
		this.canvas = canvas || document.createElement('canvas');
		if (!canvas) {
			document.body.appendChild(this.canvas);
			this.canvas.style.position = 'fixed';
			this.canvas.style.inset = '0';
			this.canvas.style.height = '100dvh';
			this.canvas.style.width = '100dvw';
		}
		this.gl = this.canvas.getContext('webgl')!;
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

		if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
			console.error('Program link error:', this.gl.getProgramInfoLog(this.program));
			this.gl.deleteProgram(this.program);
			this.program = null;
		}

		if (!this.program) {
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

		const buffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, quadVertices, this.gl.STATIC_DRAW);

		this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
		this.gl.enableVertexAttribArray(aPosition);
		this.gl.vertexAttribPointer(aPosition, 2, this.gl.FLOAT, false, 0, 0);
	}

	private resizeCanvas() {
		const pixelRatio = window.devicePixelRatio || 1;
		const width = this.canvas.clientWidth * pixelRatio;
		const height = this.canvas.clientHeight * pixelRatio;

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
		let isTouchDevice = false;

		const updateCursor = (x: number, y: number) => {
			if (!this.uniforms.has('uCursor')) return;
			const rect = this.canvas.getBoundingClientRect();
			const cursorX = (x - rect.left) / rect.width;
			const cursorY = 1 - (y - rect.top) / rect.height; // Flip Y for WebGL
			this.updateUniforms({ uCursor: [cursorX, cursorY] });
		};

		this.canvas.addEventListener('mousemove', event => {
			if (!isTouchDevice) {
				updateCursor(event.clientX, event.clientY);
			}
		});

		this.canvas.addEventListener('touchstart', () => {
			isTouchDevice = true;
		});

		this.canvas.addEventListener('touchmove', event => {
			if (event.touches.length > 0) {
				updateCursor(event.touches[0].clientX, event.touches[0].clientY);
			}
		});
	}

	initializeUniform(name: string, type: 'float' | 'int', value: number | number[]) {
		if (this.uniforms.has(name)) {
			throw new Error(`Uniform '${name}' is already initialized.`);
		}

		if (!this.program) {
			throw new Error('WebGL program is not initialized');
		}

		if (type !== 'float' && type !== 'int') {
			throw new Error(`Invalid uniform type: ${type}. Expected 'float' or 'int'.`);
		}

		const location = this.gl.getUniformLocation(this.program, name);
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
}

export default Shader;
