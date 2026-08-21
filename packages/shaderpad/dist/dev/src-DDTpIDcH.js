const require_util = require('./util-DAwznktR.js');

//#region src/internal/formats.ts
const channelsFor = (format) => +format.includes("A") + +format.includes("B") + +format.includes("G") + 1;
function uploadFormatFor(format) {
	const channels = channelsFor(format);
	return `${channels < 2 ? "RED" : "RGBA".slice(0, channels)}${format.endsWith("I") ? "_INTEGER" : ""}`;
}
function typeFor(format, data) {
	if (format[4] === "0") return 33640;
	if (format[1] === "1" && data instanceof Uint32Array) return 35899;
	if (format[3] === "9" && data instanceof Uint32Array) return 35902;
	if (data instanceof Uint16Array) {
		if (format[3] === "5") return format[4] === "_" ? 32820 : 33635;
		if (format[4] === "4") return 32819;
	}
	if (format.includes("F") || format[3] === "9") return data instanceof Uint16Array && !format.includes("32F") ? 5131 : 5126;
	if (format.endsWith("I")) return (format.includes("8") ? 5120 : format.includes("16") ? 5122 : 5124) + +format.endsWith("UI");
	return 5121 - +format.endsWith("SNORM");
}
const ARRAY_TYPES = [
	Int8Array,
	Uint8Array,
	Int16Array,
	Uint16Array,
	Int32Array,
	Uint32Array,
	Float32Array
];
function arrayForType(type) {
	return type > 3e4 ? type < 33640 ? Uint16Array : Uint32Array : ARRAY_TYPES[type === 5131 ? 3 : type - 5120];
}

//#endregion
//#region src/index.ts
const DEFAULT_VERTEX_SHADER_SRC = `#version 300 es
in vec2 a_position;out vec2 v_uv;void main(){gl_Position=vec4(a_position,0.,1.);v_uv=a_position*.5+.5;}`;
const UNIFORM_TYPE_SUFFIXES = {
	float: "f",
	int: "i",
	uint: "ui"
};
function getPxArray(type, pixelCount, channelCount) {
	return new (arrayForType(type))(pixelCount * (type > 3e4 ? 1 : channelCount));
}
const HISTORY_TEXTURE_KEY = Symbol("u_history");
const INTERMEDIATE_TEXTURE_KEY = Symbol("__SHADERPAD_BUFFER");
const canvasRegistry = /* @__PURE__ */ new WeakMap();
function combineShaderCode(shader, injections) {
	if (!injections.length) return shader;
	const lines = shader.split("\n");
	const insertAt = lines.findLastIndex((line) => {
		const trimmed = line.trimStart();
		return trimmed.startsWith("precision ") || trimmed.startsWith("#version ");
	}) + 1;
	lines.splice(insertAt, 0, ...injections);
	return lines.join("\n");
}
function stringFrom(name) {
	return typeof name === "symbol" ? name.description ?? "" : name;
}
var ShaderPad = class ShaderPad {
	#isHeadless = false;
	#isTouch = false;
	#uniforms = /* @__PURE__ */ new Map();
	#textures = /* @__PURE__ */ new Map();
	#texturePool;
	#buffer = null;
	#vao = null;
	#program = null;
	#frameId = null;
	#listeners = /* @__PURE__ */ new Map();
	#frame = 0;
	#tElapsed = 0;
	#tStart = NaN;
	#cursorPos = [.5, .5];
	#clickPos = [.5, .5];
	#resObserver = null;
	#hooks = {};
	#cursorTarget;
	#intermediateFbo = null;
	constructor(fragmentShaderSrc, options = {}) {
		const { canvas, plugins, history = 0, cursorTarget, ...textureOptions } = options;
		if (canvas && "getContext" in canvas) this.canvas = canvas;
		else {
			const { width = 1, height = 1 } = canvas || {};
			this.canvas = new OffscreenCanvas(width, height);
			this.#isHeadless = true;
		}
		const gl = this.canvas.getContext("webgl2", { antialias: false });
		if (!gl) throw require_util.spError(0, {
			canvasType: this.canvas.constructor.name,
			isHeadless: this.#isHeadless,
			canvasWidth: this.canvas.width,
			canvasHeight: this.canvas.height
		});
		this.gl = gl;
		const renderFormat = textureOptions.format;
		if (renderFormat?.includes("F") && !gl.getExtension("EXT_color_buffer_float")) throw require_util.spError(6, {
			format: renderFormat,
			type: typeFor(renderFormat)
		});
		let registryEntry = canvasRegistry.get(this.canvas);
		if (!registryEntry) {
			registryEntry = {
				texturePool_: {
					free_: [],
					next_: 0,
					max_: gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS)
				},
				instances_: /* @__PURE__ */ new Set()
			};
			canvasRegistry.set(this.canvas, registryEntry);
		}
		this.#texturePool = registryEntry.texturePool_;
		registryEntry.instances_.add(this);
		Object.defineProperties(this, {
			uniforms: { value: this.#uniforms },
			textures: { value: this.#textures },
			texturePool: { value: this.#texturePool },
			frame: { get: () => this.#frame },
			tElapsed: { get: () => this.#tElapsed }
		});
		this.#cursorTarget = cursorTarget ?? (this.canvas instanceof HTMLCanvasElement ? this.canvas : void 0);
		const glslInjections = [];
		if (plugins) plugins.forEach((plugin) => plugin(this, {
			options,
			injectGLSL: (code) => {
				glslInjections.push(code);
			},
			emit: this.#emit.bind(this),
			updateTexture: this.#updateTexture.bind(this)
		}));
		const program = gl.createProgram();
		if (!program) throw require_util.spError(1);
		this.#program = program;
		const vertexShader = this.#createShader(gl.VERTEX_SHADER, DEFAULT_VERTEX_SHADER_SRC);
		const fragmentShader = this.#createShader(gl.FRAGMENT_SHADER, combineShaderCode(fragmentShaderSrc, glslInjections));
		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.bindAttribLocation(program, 0, "a_position");
		gl.linkProgram(program);
		gl.deleteShader(vertexShader);
		gl.deleteShader(fragmentShader);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			const error = require_util.spError(2, {
				programInfoLog: gl.getProgramInfoLog(program),
				fragmentShaderLength: fragmentShaderSrc.length,
				glslInjectionCount: glslInjections.length
			});
			gl.deleteProgram(program);
			this.#program = null;
			throw error;
		}
		this.#vao = gl.createVertexArray();
		gl.bindVertexArray(this.#vao);
		this.#buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.#buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			-1,
			-1,
			3,
			-1,
			-1,
			3
		]), gl.STATIC_DRAW);
		gl.enableVertexAttribArray(0);
		gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
		gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
		if (this.canvas instanceof HTMLCanvasElement) {
			this.#resObserver = new MutationObserver(() => this.#syncRes());
			this.#resObserver.observe(this.canvas, {
				attributes: true,
				attributeFilter: ["width", "height"]
			});
		} else {
			const wrapDimension = (dimension) => {
				const descriptor = Object.getOwnPropertyDescriptor(OffscreenCanvas.prototype, dimension);
				const canvas = this.canvas;
				Object.defineProperty(canvas, dimension, {
					get: () => descriptor.get.call(canvas),
					set: (v) => {
						descriptor.set.call(canvas, v);
						const entry = canvasRegistry.get(canvas);
						if (entry) for (const instance of entry.instances_) instance.#syncRes();
					},
					configurable: descriptor.configurable,
					enumerable: descriptor.enumerable
				});
			};
			wrapDimension("width");
			wrapDimension("height");
		}
		this.#syncRes();
		this.#initializeOptionalUniform("u_cursor", "float", this.#cursorPos);
		this.#initializeOptionalUniform("u_click", "float", [...this.#clickPos, 0]);
		this.#initializeOptionalUniform("u_time", "float", 0);
		this.#initializeOptionalUniform("u_frame", "int", 0);
		this.#initializeTexture(INTERMEDIATE_TEXTURE_KEY, this.canvas, { ...textureOptions });
		this.#intermediateFbo = gl.createFramebuffer();
		this.#bindIntermediate();
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		if (history > 0) this.#initializeTexture(HISTORY_TEXTURE_KEY, this.canvas, {
			...textureOptions,
			history
		});
		this.#addListeners();
		this.#emit("_init");
	}
	#resolveGLConst(value) {
		const resolved = this.gl[value];
		if (resolved === void 0) throw require_util.spError(3, { value });
		return resolved;
	}
	#emit(name, ...args) {
		this.#hooks[name]?.forEach((hook) => hook.call(this, ...args));
	}
	on(name, fn) {
		(this.#hooks[name] ??= []).push(fn);
	}
	off(name, fn) {
		const hooks = this.#hooks[name];
		if (hooks) {
			const index = hooks.indexOf(fn);
			if (index >= 0) hooks.splice(index, 1);
		}
	}
	#createShader(type, source) {
		const gl = this.gl;
		const shader = gl.createShader(type);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			console.error(gl.getShaderInfoLog(shader));
			const compilationError = require_util.spError(4, {
				shaderType: type === gl.VERTEX_SHADER ? "vertex" : "fragment",
				source
			});
			gl.deleteShader(shader);
			throw compilationError;
		}
		return shader;
	}
	#getCursorTargetRect() {
		const target = this.#cursorTarget;
		if (target === window) return [
			0,
			0,
			window.innerWidth,
			window.innerHeight
		];
		const rect = target.getBoundingClientRect();
		return [
			rect.left,
			rect.top,
			rect.width,
			rect.height
		];
	}
	#addListeners() {
		if (!this.#cursorTarget) return;
		const updateCursor = (x, y) => {
			if (!this.#uniforms.has("u_cursor")) return;
			const [left, top, width, height] = this.#getCursorTargetRect();
			const u = (x - left) / width;
			const v = 1 - (y - top) / height;
			this.#cursorPos[0] = Math.max(0, Math.min(1, u));
			this.#cursorPos[1] = Math.max(0, Math.min(1, v));
			this.updateUniforms({ u_cursor: this.#cursorPos });
		};
		const updateClick = (isClicked, x, y) => {
			if (!this.#uniforms.has("u_click")) return;
			if (isClicked) {
				const [left, top, width, height] = this.#getCursorTargetRect();
				const xVal = x;
				const yVal = y;
				this.#clickPos[0] = Math.max(0, Math.min(1, (xVal - left) / width));
				this.#clickPos[1] = Math.max(0, Math.min(1, 1 - (yVal - top) / height));
			}
			this.updateUniforms({ u_click: [...this.#clickPos, +isClicked] });
		};
		this.#listeners.set("mousemove", (event) => {
			const mouseEvent = event;
			if (!this.#isTouch) updateCursor(mouseEvent.clientX, mouseEvent.clientY);
		});
		this.#listeners.set("mousedown", (event) => {
			const mouseEvent = event;
			if (!this.#isTouch) {
				if (mouseEvent.button === 0) updateClick(true, mouseEvent.clientX, mouseEvent.clientY);
			}
		});
		this.#listeners.set("mouseup", (event) => {
			const mouseEvent = event;
			if (!this.#isTouch) {
				if (mouseEvent.button === 0) updateClick(false);
			}
		});
		this.#listeners.set("touchmove", (event) => {
			const touchEvent = event;
			if (touchEvent.touches.length > 0) updateCursor(touchEvent.touches[0].clientX, touchEvent.touches[0].clientY);
		});
		this.#listeners.set("touchstart", (event) => {
			const touchEvent = event;
			this.#isTouch = true;
			if (touchEvent.touches.length > 0) {
				updateCursor(touchEvent.touches[0].clientX, touchEvent.touches[0].clientY);
				updateClick(true, touchEvent.touches[0].clientX, touchEvent.touches[0].clientY);
			}
		});
		this.#listeners.set("touchend", (event) => {
			if (event.touches.length === 0) updateClick(false);
		});
		this.#listeners.forEach((listener, event) => {
			this.#cursorTarget.addEventListener(event, listener);
		});
	}
	#syncRes() {
		const gl = this.gl;
		const resolution = [gl.drawingBufferWidth, gl.drawingBufferHeight];
		gl.viewport(0, 0, ...resolution);
		if (this.#uniforms.has("u_resolution")) this.updateUniforms({ u_resolution: resolution });
		else this.#initializeOptionalUniform("u_resolution", "float", resolution);
		this.#resizeTexture(INTERMEDIATE_TEXTURE_KEY, ...resolution);
		this.#resizeTexture(HISTORY_TEXTURE_KEY, ...resolution);
		this.#emit("updateResolution", ...resolution);
	}
	#resizeTexture(name, width, height) {
		const info = this.#textures.get(name);
		if (!info || info.width_ === width && info.height_ === height) return;
		this.gl.deleteTexture(info.texture_);
		info.width_ = width;
		info.height_ = height;
		info.texture_ = this.#createTexture(name, info, info.unitIndex_);
		this.#resetHistory(name, info);
	}
	#reserveTexture(name) {
		if (this.#texturePool.free_.length > 0) return this.#texturePool.free_.pop();
		if (this.#texturePool.next_ >= this.#texturePool.max_) throw require_util.spError(5, {
			name: stringFrom(name),
			nextTextureUnit: this.#texturePool.next_,
			maxTextureUnits: this.#texturePool.max_,
			freeTextureUnits: this.#texturePool.free_.length
		});
		return this.#texturePool.next_++;
	}
	#resolveTextureOptions(options) {
		const formatName_ = options?.format ?? "RGBA8";
		const defaultFilter = formatName_.endsWith("I") ? "NEAREST" : "LINEAR";
		return {
			formatName_,
			format_: this.#resolveGLConst(formatName_),
			uploadFormat_: this.#resolveGLConst(uploadFormatFor(formatName_)),
			channelCount_: channelsFor(formatName_),
			minFilter_: this.#resolveGLConst(options?.minFilter ?? defaultFilter),
			magFilter_: this.#resolveGLConst(options?.magFilter ?? defaultFilter),
			wrapS_: this.#resolveGLConst(options?.wrapS ?? "CLAMP_TO_EDGE"),
			wrapT_: this.#resolveGLConst(options?.wrapT ?? "CLAMP_TO_EDGE"),
			colorSpace_: options?.colorSpace,
			preserveY_: options?.preserveY
		};
	}
	#clearHistoryTextureLayers(textureInfo) {
		if (!textureInfo.history_) return;
		const gl = this.gl;
		const { formatName_, uploadFormat_, channelCount_ } = textureInfo.options_;
		const type = typeFor(formatName_);
		const transparent = getPxArray(type, textureInfo.width_ * textureInfo.height_, channelCount_);
		const needsAlignmentFix = channelCount_ < 4;
		let previousAlignment;
		if (needsAlignmentFix) {
			previousAlignment = gl.getParameter(gl.UNPACK_ALIGNMENT);
			gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
		}
		gl.activeTexture(gl.TEXTURE0 + textureInfo.unitIndex_);
		gl.bindTexture(gl.TEXTURE_2D_ARRAY, textureInfo.texture_);
		for (let layer = 0; layer < textureInfo.history_.depth_; ++layer) gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, layer, textureInfo.width_, textureInfo.height_, 1, uploadFormat_, type, transparent);
		if (needsAlignmentFix) gl.pixelStorei(gl.UNPACK_ALIGNMENT, previousAlignment);
	}
	#updateFrameOffset(name, frameOffset) {
		this.updateUniforms({ [`${stringFrom(name)}FrameOffset`]: frameOffset }, { allowMissing: true });
	}
	#resetHistory(name, textureInfo) {
		if (!textureInfo.history_) return;
		textureInfo.history_.writeIndex_ = 0;
		this.#clearHistoryTextureLayers(textureInfo);
		this.#updateFrameOffset(name, 0);
	}
	#initializeOptionalUniform(name, type, value) {
		this.initializeUniform(name, type, value, { allowMissing: true });
	}
	initializeUniform(name, type, value, options) {
		const arrayLength = options?.arrayLength;
		const allowMissing = !!options?.allowMissing;
		if (this.#uniforms.has(name)) throw require_util.spError(7, {
			name,
			arrayLength: arrayLength ?? null
		});
		if (!UNIFORM_TYPE_SUFFIXES[type]) throw require_util.spError(8, {
			name,
			type,
			supportedTypes: Object.keys(UNIFORM_TYPE_SUFFIXES)
		});
		if (arrayLength && !(Array.isArray(value) && value.length === arrayLength)) throw require_util.spError(9, {
			name,
			expectedLength: arrayLength,
			receivedLength: Array.isArray(value) ? value.length : 1
		});
		const probeValue = arrayLength ? value[0] : value;
		const length = Array.isArray(probeValue) ? probeValue.length : 1;
		const location = this.gl.getUniformLocation(this.#program, name) ?? (arrayLength ? this.gl.getUniformLocation(this.#program, `${name}[0]`) : null);
		if (!location) {
			if (allowMissing) return;
			throw require_util.spError(19, {
				name,
				arrayLength: arrayLength ?? null
			});
		}
		const uniform = {
			type_: type,
			length_: length,
			location_: location,
			arrayLength_: arrayLength
		};
		this.#uniforms.set(name, uniform);
		try {
			this.updateUniforms({ [name]: value });
		} catch (error) {
			this.#uniforms.delete(name);
			throw error;
		}
		this.#emit("initializeUniform", ...arguments);
	}
	#updateUniforms(updates, options) {
		const gl = this.gl;
		gl.useProgram(this.#program);
		Object.entries(updates).forEach(([name, newValue]) => {
			const uniform = this.#uniforms.get(name);
			if (!uniform) {
				if (options?.allowMissing) return;
				throw require_util.spError(20, {
					name,
					startIndex: options?.startIndex ?? null
				});
			}
			const glFunctionName = `uniform${uniform.length_}${UNIFORM_TYPE_SUFFIXES[uniform.type_]}`;
			if (uniform.arrayLength_) {
				if (!Array.isArray(newValue)) throw require_util.spError(10, {
					name,
					receivedType: typeof newValue
				});
				const nValues = newValue.length;
				if (!nValues) return;
				if (nValues > uniform.arrayLength_) throw require_util.spError(11, {
					name,
					receivedLength: nValues,
					maxLength: uniform.arrayLength_
				});
				if (newValue.some((item) => (Array.isArray(item) ? item.length : 1) !== uniform.length_)) throw require_util.spError(12, {
					name,
					expectedElementLength: uniform.length_
				});
				if ((options?.startIndex ?? 0) + nValues > uniform.arrayLength_) throw require_util.spError(11, {
					name,
					receivedLength: (options?.startIndex ?? 0) + nValues,
					maxLength: uniform.arrayLength_
				});
				const flat = newValue.flat();
				const typedArray = uniform.type_ === "float" ? new Float32Array(flat) : uniform.type_ === "uint" ? new Uint32Array(flat) : new Int32Array(flat);
				let location = uniform.location_;
				if (options?.startIndex) {
					location = gl.getUniformLocation(this.#program, `${name}[${options.startIndex}]`);
					if (!location) throw require_util.spError(13, {
						name,
						startIndex: options.startIndex,
						arrayLength: uniform.arrayLength_
					});
				}
				gl[glFunctionName + "v"](location, typedArray);
			} else {
				const scalarValue = Array.isArray(newValue) ? newValue : [newValue];
				if (scalarValue.length !== uniform.length_) throw require_util.spError(14, {
					name,
					receivedLength: scalarValue.length,
					expectedLength: uniform.length_
				});
				gl[glFunctionName](uniform.location_, ...scalarValue);
			}
		});
		this.#emit("updateUniforms", ...arguments);
	}
	updateUniforms(updates, options) {
		this.#updateUniforms(updates, options);
		if (typeof updates.u_time === "number") {
			this.#tElapsed = updates.u_time;
			if (!isNaN(this.#tStart)) this.#tStart = performance.now();
		}
		if (typeof updates.u_frame === "number") this.#frame = updates.u_frame;
	}
	#createTexture(name, textureInfo, unitIndex) {
		const gl = this.gl;
		const { width_, height_, history_, options_ } = textureInfo;
		const texture = gl.createTexture();
		if (!texture) throw require_util.spError(15, {
			name: stringFrom(name),
			width: width_,
			height: height_,
			historyDepth: history_?.depth_ ?? 0
		});
		const textureTarget = history_ ? gl.TEXTURE_2D_ARRAY : gl.TEXTURE_2D;
		gl.activeTexture(gl.TEXTURE0 + unitIndex);
		gl.bindTexture(textureTarget, texture);
		gl.texParameteri(textureTarget, gl.TEXTURE_WRAP_S, options_.wrapS_);
		gl.texParameteri(textureTarget, gl.TEXTURE_WRAP_T, options_.wrapT_);
		gl.texParameteri(textureTarget, gl.TEXTURE_MIN_FILTER, options_.minFilter_);
		gl.texParameteri(textureTarget, gl.TEXTURE_MAG_FILTER, options_.magFilter_);
		if (history_) gl.texStorage3D(textureTarget, 1, options_.format_, width_, height_, history_.depth_);
		else if (name === INTERMEDIATE_TEXTURE_KEY) gl.texImage2D(gl.TEXTURE_2D, 0, options_.format_, width_, height_, 0, options_.uploadFormat_, typeFor(options_.formatName_), null);
		return texture;
	}
	#initializeTexture(name, source, options) {
		const gl = this.gl;
		if (this.#textures.has(name)) throw require_util.spError(16, { name: stringFrom(name) });
		const [width_, height_] = require_util.getSourceDimensions(source);
		if (!width_ || !height_) throw require_util.spError(17, {
			name: stringFrom(name),
			width_,
			height_,
			sourceType: source.constructor.name
		});
		const { history = 0, ...textureOptions } = options ?? {};
		const textureInfo = {
			width_,
			height_,
			history_: history > 0 ? {
				depth_: history,
				writeIndex_: 0
			} : void 0,
			options_: source instanceof ShaderPad && !Object.keys(textureOptions).length && source.#textures.has(INTERMEDIATE_TEXTURE_KEY) ? source.#textures.get(INTERMEDIATE_TEXTURE_KEY).options_ : this.#resolveTextureOptions(textureOptions)
		};
		let unitIndex;
		let texture;
		try {
			unitIndex = this.#reserveTexture(name);
			texture = this.#createTexture(name, textureInfo, unitIndex);
		} catch (error) {
			if (unitIndex !== void 0) this.#texturePool.free_.push(unitIndex);
			throw error;
		}
		const completeTextureInfo = {
			texture_: texture,
			unitIndex_: unitIndex,
			...textureInfo
		};
		if (textureInfo.history_) {
			this.#initializeOptionalUniform(`${stringFrom(name)}FrameOffset`, "int", 0);
			this.#clearHistoryTextureLayers(completeTextureInfo);
		}
		this.#textures.set(name, completeTextureInfo);
		if (name !== INTERMEDIATE_TEXTURE_KEY && name !== HISTORY_TEXTURE_KEY) this.#updateTexture(name, source);
		const sampler = gl.getUniformLocation(this.#program, stringFrom(name));
		if (sampler) {
			gl.useProgram(this.#program);
			gl.uniform1i(sampler, completeTextureInfo.unitIndex_);
		}
	}
	initializeTexture(name, source, options) {
		const { history = 0 } = options ?? {};
		this.#initializeTexture(name, source, history > 0 ? {
			...options,
			history: history + 1
		} : options);
		this.#emit("initializeTexture", ...arguments);
	}
	updateTextures(updates) {
		Object.entries(updates).forEach(([name, source]) => {
			this.#updateTexture(name, source);
		});
		this.#emit("updateTextures", ...arguments);
	}
	#updateTexture(name, source, historySlots) {
		const gl = this.gl;
		const info = this.#textures.get(name);
		if (!info) throw require_util.spError(18, { name: stringFrom(name) });
		if (source instanceof WebGLTexture) {
			gl.activeTexture(gl.TEXTURE0 + info.unitIndex_);
			gl.bindTexture(gl.TEXTURE_2D, source);
			return;
		}
		let nonShaderPadSource = source;
		if (source instanceof ShaderPad) {
			const sourceIntermediateInfo = source.#textures.get(INTERMEDIATE_TEXTURE_KEY);
			const { width_, height_, options_ } = sourceIntermediateInfo;
			if (source.gl === gl) {
				if (!info.history_) {
					gl.activeTexture(gl.TEXTURE0 + info.unitIndex_);
					gl.bindTexture(gl.TEXTURE_2D, sourceIntermediateInfo.texture_);
					return;
				}
				this.#resizeTexture(name, width_, height_);
				const { depth_ } = info.history_;
				const targetSlots = historySlots === void 0 ? [info.history_.writeIndex_] : (Array.isArray(historySlots) ? historySlots : [historySlots]).map((slot) => require_util.safeMod(slot, depth_));
				gl.activeTexture(gl.TEXTURE0 + info.unitIndex_);
				gl.bindTexture(gl.TEXTURE_2D_ARRAY, info.texture_);
				gl.bindFramebuffer(gl.READ_FRAMEBUFFER, source.#intermediateFbo);
				for (const slot of targetSlots) gl.copyTexSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, slot, 0, 0, width_, height_);
				gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
				this.#updateFrameOffset(name, targetSlots[targetSlots.length - 1]);
				if (historySlots === void 0) info.history_.writeIndex_ = (info.history_.writeIndex_ + 1) % depth_;
				return;
			}
			const sourceGl = source.gl;
			sourceGl.bindFramebuffer(sourceGl.FRAMEBUFFER, source.#intermediateFbo);
			const format = sourceGl.getParameter(sourceGl.IMPLEMENTATION_COLOR_READ_FORMAT);
			const type = sourceGl.getParameter(sourceGl.IMPLEMENTATION_COLOR_READ_TYPE);
			const pixels = getPxArray(type, width_ * height_, options_.channelCount_);
			sourceGl.readPixels(0, 0, width_, height_, format, type, pixels);
			sourceGl.bindFramebuffer(sourceGl.FRAMEBUFFER, null);
			nonShaderPadSource = {
				data: pixels,
				width: width_,
				height: height_
			};
		}
		const [width, height] = require_util.getSourceDimensions(nonShaderPadSource);
		if (!width || !height) return;
		const isPartial = "isPartial" in nonShaderPadSource && nonShaderPadSource.isPartial;
		if (!isPartial) this.#resizeTexture(name, width, height);
		const isCustomTexture = "data" in nonShaderPadSource;
		const customData = isCustomTexture ? nonShaderPadSource.data : void 0;
		if (info.history_ && customData === null) return;
		const uploadType = typeFor(info.options_.formatName_, customData);
		const shouldFlipY = !isCustomTexture && !info.options_.preserveY_;
		const previousFlipY = gl.getParameter(gl.UNPACK_FLIP_Y_WEBGL);
		const needsAlignmentFix = isCustomTexture && info.options_.channelCount_ < 4;
		const shouldConvertColorSpace = !isCustomTexture && info.options_.colorSpace_ && "unpackColorSpace" in gl;
		const previousColorSpace = gl.unpackColorSpace;
		let previousAlignment;
		if (needsAlignmentFix) {
			previousAlignment = gl.getParameter(gl.UNPACK_ALIGNMENT);
			gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
		}
		if (shouldConvertColorSpace) gl.unpackColorSpace = info.options_.colorSpace_;
		if (info.history_) {
			const { depth_ } = info.history_;
			const targetSlots = historySlots === void 0 ? [info.history_.writeIndex_] : (Array.isArray(historySlots) ? historySlots : [historySlots]).map((slot) => require_util.safeMod(slot, depth_));
			gl.activeTexture(gl.TEXTURE0 + info.unitIndex_);
			gl.bindTexture(gl.TEXTURE_2D_ARRAY, info.texture_);
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, shouldFlipY);
			const partialSource = nonShaderPadSource;
			const sourceData = isCustomTexture ? customData : nonShaderPadSource;
			const xOffset = isPartial ? partialSource.x ?? 0 : 0;
			const yOffset = isPartial ? partialSource.y ?? 0 : 0;
			for (const slot of targetSlots) gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, xOffset, yOffset, slot, width, height, 1, info.options_.uploadFormat_, uploadType, sourceData);
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, previousFlipY);
			this.#updateFrameOffset(name, targetSlots[targetSlots.length - 1]);
			if (historySlots === void 0) info.history_.writeIndex_ = (info.history_.writeIndex_ + 1) % depth_;
		} else {
			gl.activeTexture(gl.TEXTURE0 + info.unitIndex_);
			gl.bindTexture(gl.TEXTURE_2D, info.texture_);
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, shouldFlipY);
			if (isPartial) {
				const partialSource = nonShaderPadSource;
				gl.texSubImage2D(gl.TEXTURE_2D, 0, partialSource.x ?? 0, partialSource.y ?? 0, width, height, info.options_.uploadFormat_, uploadType, partialSource.data);
			} else gl.texImage2D(gl.TEXTURE_2D, 0, info.options_.format_, width, height, 0, info.options_.uploadFormat_, uploadType, isCustomTexture ? customData : nonShaderPadSource);
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, previousFlipY);
		}
		if (shouldConvertColorSpace) gl.unpackColorSpace = previousColorSpace;
		if (needsAlignmentFix) gl.pixelStorei(gl.UNPACK_ALIGNMENT, previousAlignment);
	}
	#bindIntermediate() {
		const gl = this.gl;
		const intermediateInfo = this.#textures.get(INTERMEDIATE_TEXTURE_KEY);
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.#intermediateFbo);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, intermediateInfo.texture_, 0);
	}
	clear() {
		this.#bindIntermediate();
		const gl = this.gl;
		const intermediateInfo = this.#textures.get(INTERMEDIATE_TEXTURE_KEY);
		if (intermediateInfo.options_.formatName_.endsWith("I")) {
			if (intermediateInfo.options_.formatName_.endsWith("UI")) gl.clearBufferuiv(gl.COLOR, 0, /* @__PURE__ */ new Uint32Array(4));
			else gl.clearBufferiv(gl.COLOR, 0, /* @__PURE__ */ new Int32Array(4));
		} else gl.clear(gl.COLOR_BUFFER_BIT);
	}
	clearHistory() {
		this.#textures.forEach((texture, name) => {
			this.#resetHistory(name, texture);
		});
	}
	draw(options) {
		this.#emit("preDraw", ...arguments);
		const gl = this.gl;
		const w = gl.drawingBufferWidth;
		const h = gl.drawingBufferHeight;
		if (options?.skipClear) this.#bindIntermediate();
		else this.clear();
		gl.useProgram(this.#program);
		gl.bindVertexArray(this.#vao);
		gl.viewport(0, 0, w, h);
		gl.drawArrays(gl.TRIANGLES, 0, 3);
		if (!this.#isHeadless) {
			const intermediateInfo = this.#textures.get(INTERMEDIATE_TEXTURE_KEY);
			if (!intermediateInfo.options_.formatName_.endsWith("I")) {
				const desiredColorSpace = intermediateInfo.options_.colorSpace_ ?? "srgb";
				if ("drawingBufferColorSpace" in gl && gl.drawingBufferColorSpace !== desiredColorSpace) gl.drawingBufferColorSpace = desiredColorSpace;
				gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.#intermediateFbo);
				gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
				gl.blitFramebuffer(0, 0, w, h, 0, 0, w, h, gl.COLOR_BUFFER_BIT, gl.NEAREST);
				gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			}
		}
		this.#emit("postDraw", ...arguments);
	}
	step(options) {
		this.#step(performance.now(), options);
	}
	#tick() {
		const updates = {};
		if (this.#uniforms.has("u_time")) updates.u_time = this.#tElapsed;
		if (this.#uniforms.has("u_frame")) updates.u_frame = this.#frame;
		if (Object.keys(updates).length) this.#updateUniforms(updates);
	}
	#step(now, opts) {
		const t = this.#getElapsed(now);
		this.#tElapsed = t;
		this.#tStart = now;
		const options = typeof opts === "function" ? opts(t, this.#frame) : opts;
		this.#emit("preStep", t, this.#frame, options);
		this.#tick();
		this.draw(options);
		const historyInfo = this.#textures.get(HISTORY_TEXTURE_KEY);
		if (historyInfo && !options?.skipHistory) {
			const { writeIndex_, depth_ } = historyInfo.history_;
			const gl = this.gl;
			gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.#intermediateFbo);
			gl.activeTexture(gl.TEXTURE0 + historyInfo.unitIndex_);
			gl.bindTexture(gl.TEXTURE_2D_ARRAY, historyInfo.texture_);
			gl.copyTexSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, writeIndex_, 0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
			gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
			const nextWriteIndex = (writeIndex_ + 1) % depth_;
			this.#updateFrameOffset(HISTORY_TEXTURE_KEY, nextWriteIndex);
			historyInfo.history_.writeIndex_ = nextWriteIndex;
		}
		++this.#frame;
		this.#emit("postStep", t, this.#frame, options);
	}
	play(onPreStep) {
		this.#pause();
		const loop = (now) => {
			this.#step(now, onPreStep);
			if (this.#frameId != null) this.#frameId = requestAnimationFrame(loop);
		};
		this.#frameId = requestAnimationFrame(loop);
		this.#emit("play");
	}
	#getElapsed(time) {
		if (isNaN(this.#tStart)) return this.#tElapsed;
		return this.#tElapsed + (time - this.#tStart) / 1e3;
	}
	#pause() {
		if (isNaN(this.#tStart) && this.#frameId == null) return;
		if (this.#frameId != null) {
			cancelAnimationFrame(this.#frameId);
			this.#frameId = null;
		}
		this.#tElapsed = this.#getElapsed(performance.now());
		this.#tStart = NaN;
		return true;
	}
	pause() {
		if (this.#pause()) this.#emit("pause");
	}
	rewind() {
		this.#frame = 0;
		this.#tElapsed = 0;
		this.#tStart = NaN;
		this.#tick();
	}
	reset() {
		this.rewind();
		this.clearHistory();
		this.clear();
		this.#emit("reset");
	}
	destroy() {
		this.#emit("destroy");
		this.#pause();
		const gl = this.gl;
		if (this.#cursorTarget) {
			this.#listeners.forEach((listener, event) => {
				this.#cursorTarget.removeEventListener(event, listener);
			});
			this.#listeners.clear();
		}
		if (this.#resObserver) {
			this.#resObserver.disconnect();
			this.#resObserver = null;
		}
		if (this.#program) {
			gl.deleteProgram(this.#program);
			this.#program = null;
		}
		if (this.#intermediateFbo) {
			gl.deleteFramebuffer(this.#intermediateFbo);
			this.#intermediateFbo = null;
		}
		this.#textures.forEach((texture) => {
			this.#texturePool.free_.push(texture.unitIndex_);
			gl.deleteTexture(texture.texture_);
		});
		this.#textures.clear();
		const entry = canvasRegistry.get(this.canvas);
		if (entry) {
			entry.instances_.delete(this);
			if (entry.instances_.size === 0) canvasRegistry.delete(this.canvas);
		}
		if (this.#vao) {
			gl.deleteVertexArray(this.#vao);
			this.#vao = null;
		}
		if (this.#buffer) {
			gl.deleteBuffer(this.#buffer);
			this.#buffer = null;
		}
		this.#uniforms.clear();
		this.#hooks = {};
	}
};

//#endregion
Object.defineProperty(exports, 'ShaderPad', {
  enumerable: true,
  get: function () {
    return ShaderPad;
  }
});
//# sourceMappingURL=src-DDTpIDcH.js.map