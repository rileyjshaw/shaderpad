"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/plugins/pose.ts
var pose_exports = {};
__export(pose_exports, {
  default: () => pose_default
});
module.exports = __toCommonJS(pose_exports);

// src/internal/error-codes.gen.ts
var ERROR_DOCS_BASE_URL = "https://mry.ac/s/";
function errorUrl(code) {
  return `${ERROR_DOCS_BASE_URL}${code}`;
}

// src/internal/error-codes.dev.gen.ts
var DEV_ERRORS = true ? {
  "0": {
    title: "WebGL2 Context Unavailable",
    summary: "ShaderPad could not create a WebGL2 rendering context."
  },
  "1": {
    title: "Program Allocation Failed",
    summary: "ShaderPad could not allocate a WebGL program object."
  },
  "2": {
    title: "Program Link Failed",
    summary: "ShaderPad compiled the shaders but failed to link them into a WebGL program."
  },
  "3": {
    title: "Unknown GL Constant",
    summary: "ShaderPad received a WebGL constant name it does not recognize."
  },
  "4": {
    title: "Shader Compilation Failed",
    summary: "A vertex or fragment shader failed to compile."
  },
  "5": {
    title: "Texture Units Exhausted",
    summary: "ShaderPad tried to reserve more texture units than this device exposes."
  },
  "6": {
    title: "Float Color Buffer Extension Missing",
    summary: "ShaderPad requested a float render texture, but EXT_color_buffer_float is unavailable."
  },
  "7": {
    title: "Uniform Already Initialized",
    summary: "ShaderPad was asked to register a uniform name that was already registered."
  },
  "8": {
    title: "Invalid Uniform Type",
    summary: "ShaderPad received an unsupported uniform type string."
  },
  "9": {
    title: "Uniform Array Length Mismatch",
    summary: "ShaderPad was asked to initialize a uniform array with the wrong number of elements."
  },
  "10": {
    title: "Uniform Array Update Expected An Array",
    summary: "ShaderPad attempted to update a uniform array, but the provided value was not an array."
  },
  "11": {
    title: "Uniform Array Update Too Large",
    summary: "ShaderPad received more uniform array elements than the initialized array can hold."
  },
  "12": {
    title: "Uniform Array Element Size Mismatch",
    summary: "At least one uniform array element has the wrong scalar or vector length."
  },
  "13": {
    title: "Uniform Array Start Index Invalid",
    summary: "ShaderPad could not find the requested starting index for a uniform array."
  },
  "14": {
    title: "Uniform Value Length Invalid",
    summary: "ShaderPad received a scalar or vector uniform update with the wrong component count."
  },
  "15": {
    title: "Texture Allocation Failed",
    summary: "ShaderPad could not create a WebGL texture object."
  },
  "16": {
    title: "Texture Already Initialized",
    summary: "ShaderPad was asked to initialize a texture name that is already registered."
  },
  "17": {
    title: "Texture Source Dimensions Invalid",
    summary: "ShaderPad could not determine valid width and height values for the texture source."
  },
  "18": {
    title: "Texture Not Initialized",
    summary: "ShaderPad was asked to update a texture name that has not been initialized."
  },
  "19": {
    title: "Uniform Missing During Initialization",
    summary: "ShaderPad could not initialize a uniform because the shader program does not contain that symbol."
  },
  "20": {
    title: "Uniform Missing During Update",
    summary: "ShaderPad could not update a uniform because the shader program does not contain that symbol."
  },
  "60": {
    title: "Face Mask Renderer Context Unavailable",
    summary: "The face plugin could not create the offscreen WebGL2 context used for face-mask rendering."
  },
  "61": {
    title: "Face Mask Shader Setup Failed",
    summary: "The face plugin could not build the shaders it uses for face-mask rendering."
  },
  "62": {
    title: "Face Mask Renderer Initialization Failed",
    summary: "The face plugin could not finish setting up its internal face-mask renderer."
  }
} : void 0;

// src/internal/util.ts
function withCode(message, code) {
  const error = new Error(message);
  error.code = code;
  return error;
}
function renderContext(context) {
  const lines = ["Context:"];
  for (const [key, value] of Object.entries(context)) {
    if (value === void 0) continue;
    const rendered = typeof value === "string" ? value : JSON.stringify(value, null, 2) ?? (typeof value === "bigint" || typeof value === "number" || typeof value === "boolean" || value == null ? String(value) : "");
    if (!rendered) continue;
    lines.push(rendered.includes("\n") ? `${key}:
${rendered}` : `${key}: ${rendered}`);
  }
  return lines.length > 1 ? lines.join("\n") : "";
}
function renderDevMessage(code, context) {
  const error = DEV_ERRORS?.[code];
  const parts = error ? [`[ShaderPad ${code}] ${error.title}`, error.summary, `Docs: ${errorUrl(code)}`] : [`[ShaderPad ${code}] ${errorUrl(code)}`];
  if (context) {
    const renderedContext = renderContext(context);
    if (renderedContext) parts.push(renderedContext);
  }
  return parts.join("\n\n");
}
function spError(code, context) {
  return withCode(true ? renderDevMessage(code, context) : `ShaderPad error: ${errorUrl(code)}`, code);
}
function safeMod(i, m) {
  return (i % m + m) % m;
}

// src/index.ts
var DEFAULT_VERTEX_SHADER_SRC = `#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_uv = a_position * 0.5 + 0.5;
}`;
var FORMAT_TYPE_SUFFIXES = [
  ["8UI", "UNSIGNED_BYTE"],
  ["8I", "BYTE"],
  ["16UI", "UNSIGNED_SHORT"],
  ["16I", "SHORT"],
  ["16F", "HALF_FLOAT"],
  ["32UI", "UNSIGNED_INT"],
  ["32I", "INT"],
  ["32F", "FLOAT"],
  ["8", "UNSIGNED_BYTE"]
];
var UNIFORM_TYPE_SUFFIXES = {
  float: "f",
  int: "i",
  uint: "ui"
};
function typeFromInternalFormatString(internalFormatString) {
  return internalFormatString && FORMAT_TYPE_SUFFIXES.find(([suffix]) => internalFormatString.endsWith(suffix))?.[1];
}
var HISTORY_TEXTURE_KEY = /* @__PURE__ */ Symbol("u_history");
var INTERMEDIATE_TEXTURE_KEY = /* @__PURE__ */ Symbol("__SHADERPAD_BUFFER");
var canvasRegistry = /* @__PURE__ */ new WeakMap();
function combineShaderCode(shader, injections) {
  if (!injections?.length) return shader;
  const lines = shader.split("\n");
  const insertAt = lines.findLastIndex((line) => {
    const trimmed = line.trimStart();
    return trimmed.startsWith("precision ") || trimmed.startsWith("#version ");
  }) + 1;
  lines.splice(insertAt, 0, ...injections);
  return lines.join("\n");
}
function getSourceDimensions(source) {
  if (source instanceof WebGLTexture) {
    return { width: 0, height: 0 };
  }
  if (source instanceof ShaderPad) {
    return { width: source.canvas.width, height: source.canvas.height };
  }
  if (source instanceof HTMLVideoElement) {
    return { width: source.videoWidth, height: source.videoHeight };
  }
  if (source instanceof HTMLImageElement) {
    return {
      width: source.naturalWidth ?? source.width,
      height: source.naturalHeight ?? source.height
    };
  }
  return { width: source.width, height: source.height };
}
function stringFrom(name) {
  return typeof name === "symbol" ? name.description ?? "" : name;
}
var ShaderPad = class _ShaderPad {
  isHeadless = false;
  isTouchDevice = false;
  gl;
  glHelpers;
  uniforms = /* @__PURE__ */ new Map();
  textures = /* @__PURE__ */ new Map();
  textureUnitPool;
  buffer = null;
  vao = null;
  program = null;
  animationFrameId;
  eventListeners = /* @__PURE__ */ new Map();
  frame = 0;
  startTime = Number.NaN;
  isPlaying = false;
  cursorPosition = [0.5, 0.5];
  clickPosition = [0.5, 0.5];
  isMouseDown = false;
  canvas;
  resolutionObserver = null;
  hooks = /* @__PURE__ */ new Map();
  historyDepth = 0;
  textureOptions;
  cursorTarget;
  // WebGL can’t read from and write to the history texture at the same time.
  // We write to an intermediate texture then blit to the history texture.
  intermediateFbo = null;
  constructor(fragmentShaderSrc, { canvas, plugins, history, cursorTarget, ...textureOptions } = {}) {
    if (canvas && "getContext" in canvas) {
      this.canvas = canvas;
    } else {
      const { width = 1, height = 1 } = canvas || {};
      this.canvas = new OffscreenCanvas(width, height);
      this.isHeadless = true;
    }
    const gl = this.canvas.getContext("webgl2", {
      antialias: false
    });
    if (!gl) {
      throw spError(
        0,
        {
          canvasType: this.canvas.constructor.name,
          isHeadless: this.isHeadless,
          canvasWidth: this.canvas.width,
          canvasHeight: this.canvas.height
        }
      );
    }
    this.gl = gl;
    this.glHelpers = {
      typeToArray: /* @__PURE__ */ new Map([
        [gl.FLOAT, Float32Array],
        [gl.HALF_FLOAT, Uint16Array],
        [gl.UNSIGNED_SHORT, Uint16Array],
        [gl.SHORT, Int16Array],
        [gl.BYTE, Int8Array],
        [gl.UNSIGNED_INT, Uint32Array],
        [gl.INT, Int32Array]
      ]),
      typeToInternalFormatString: /* @__PURE__ */ new Map([
        [gl.FLOAT, "RGBA32F"],
        [gl.HALF_FLOAT, "RGBA16F"],
        [gl.UNSIGNED_SHORT, "RGBA32UI"],
        [gl.SHORT, "RGBA32I"],
        [gl.BYTE, "RGBA32I"],
        [gl.UNSIGNED_INT, "RGBA32UI"],
        [gl.INT, "RGBA32I"]
      ]),
      unsignedIntTypes: /* @__PURE__ */ new Set([gl.UNSIGNED_BYTE, gl.UNSIGNED_SHORT, gl.UNSIGNED_INT])
    };
    let registryEntry = canvasRegistry.get(this.canvas);
    if (!registryEntry) {
      registryEntry = {
        textureUnitPool: {
          free: [],
          next: 0,
          max: gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS)
        },
        instances: /* @__PURE__ */ new Set([this])
      };
      canvasRegistry.set(this.canvas, registryEntry);
    }
    this.textureUnitPool = registryEntry.textureUnitPool;
    registryEntry.instances.add(this);
    this.textureOptions = textureOptions;
    if (history) this.historyDepth = history;
    this.cursorTarget = cursorTarget ?? (this.canvas instanceof HTMLCanvasElement ? this.canvas : void 0);
    this.animationFrameId = null;
    const glslInjections = [];
    if (plugins) {
      plugins.forEach(
        (plugin) => plugin(this, {
          injectGLSL: (code) => {
            glslInjections.push(code);
          },
          emit: this.emit.bind(this),
          updateTexture: this.updateTexture.bind(this)
        })
      );
    }
    const program = this.gl.createProgram();
    if (!program) {
      throw spError(1);
    }
    this.program = program;
    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, DEFAULT_VERTEX_SHADER_SRC);
    const fragmentShader = this.createShader(
      gl.FRAGMENT_SHADER,
      combineShaderCode(fragmentShaderSrc, glslInjections)
    );
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.bindAttribLocation(program, 0, "a_position");
    gl.linkProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const programInfoLog = gl.getProgramInfoLog(program);
      const linkError = spError(
        2,
        {
          programInfoLog,
          fragmentShaderLength: fragmentShaderSrc.length,
          glslInjectionCount: glslInjections.length
        }
      );
      gl.deleteProgram(program);
      throw linkError;
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
      this.resolutionObserver = new MutationObserver(() => this.syncResolution());
      this.resolutionObserver.observe(this.canvas, {
        attributes: true,
        attributeFilter: ["width", "height"]
      });
    } else {
      const wrapDimension = (dimension) => {
        const descriptor = Object.getOwnPropertyDescriptor(OffscreenCanvas.prototype, dimension);
        const canvas2 = this.canvas;
        Object.defineProperty(canvas2, dimension, {
          get: () => descriptor.get.call(canvas2),
          set: (v) => {
            descriptor.set.call(canvas2, v);
            const entry = canvasRegistry.get(canvas2);
            if (entry) {
              for (const instance of entry.instances) {
                instance.syncResolution();
              }
            }
          },
          configurable: descriptor.configurable,
          enumerable: descriptor.enumerable
        });
      };
      wrapDimension("width");
      wrapDimension("height");
    }
    this.syncResolution();
    this.initializeUniform("u_cursor", "float", this.cursorPosition, { allowMissing: true });
    this.initializeUniform("u_click", "float", [...this.clickPosition, this.isMouseDown ? 1 : 0], {
      allowMissing: true
    });
    this.initializeUniform("u_time", "float", 0, { allowMissing: true });
    this.initializeUniform("u_frame", "int", 0, { allowMissing: true });
    this._initializeTexture(INTERMEDIATE_TEXTURE_KEY, this.canvas, {
      ...this.textureOptions
    });
    this.intermediateFbo = gl.createFramebuffer();
    this.bindIntermediate();
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    if (this.historyDepth > 0) {
      this._initializeTexture(HISTORY_TEXTURE_KEY, this.canvas, {
        history: this.historyDepth,
        ...this.textureOptions
      });
    }
    this.addEventListeners();
    this.emit("_init");
  }
  resolveGLConstant(value) {
    const resolved = this.gl[value];
    if (resolved === void 0) {
      throw spError(3, { value });
    }
    return resolved;
  }
  emit(name, ...args) {
    this.hooks.get(name)?.forEach((hook) => hook.call(this, ...args));
  }
  on(name, fn) {
    if (!this.hooks.has(name)) {
      this.hooks.set(name, []);
    }
    this.hooks.get(name).push(fn);
  }
  off(name, fn) {
    const hooks = this.hooks.get(name);
    if (hooks) {
      const index = hooks.indexOf(fn);
      if (index >= 0) {
        hooks.splice(index, 1);
      }
    }
  }
  createShader(type, source) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const shaderInfoLog = this.gl.getShaderInfoLog(shader);
      const shaderType = type === this.gl.VERTEX_SHADER ? "vertex" : "fragment";
      const compilationError = spError(
        4,
        {
          shaderType,
          shaderInfoLog,
          source
        }
      );
      this.gl.deleteShader(shader);
      throw compilationError;
    }
    return shader;
  }
  getCursorTargetRect() {
    const target = this.cursorTarget;
    if (target === window) {
      return {
        left: 0,
        top: 0,
        width: window.innerWidth,
        height: window.innerHeight
      };
    }
    return target.getBoundingClientRect();
  }
  addEventListeners() {
    if (!this.cursorTarget) return;
    const updateCursor = (x, y) => {
      if (!this.uniforms.has("u_cursor")) return;
      const rect = this.getCursorTargetRect();
      const u = (x - rect.left) / rect.width;
      const v = 1 - (y - rect.top) / rect.height;
      this.cursorPosition[0] = Math.max(0, Math.min(1, u));
      this.cursorPosition[1] = Math.max(0, Math.min(1, v));
      this.updateUniforms({ u_cursor: this.cursorPosition });
    };
    const updateClick = (isMouseDown, x, y) => {
      if (!this.uniforms.has("u_click")) return;
      this.isMouseDown = isMouseDown;
      if (isMouseDown) {
        const rect = this.getCursorTargetRect();
        const xVal = x;
        const yVal = y;
        this.clickPosition[0] = Math.max(0, Math.min(1, (xVal - rect.left) / rect.width));
        this.clickPosition[1] = Math.max(0, Math.min(1, 1 - (yVal - rect.top) / rect.height));
      }
      this.updateUniforms({
        u_click: [...this.clickPosition, this.isMouseDown ? 1 : 0]
      });
    };
    this.eventListeners.set("mousemove", (event) => {
      const mouseEvent = event;
      if (!this.isTouchDevice) {
        updateCursor(mouseEvent.clientX, mouseEvent.clientY);
      }
    });
    this.eventListeners.set("mousedown", (event) => {
      const mouseEvent = event;
      if (!this.isTouchDevice) {
        if (mouseEvent.button === 0) {
          this.isMouseDown = true;
          updateClick(true, mouseEvent.clientX, mouseEvent.clientY);
        }
      }
    });
    this.eventListeners.set("mouseup", (event) => {
      const mouseEvent = event;
      if (!this.isTouchDevice) {
        if (mouseEvent.button === 0) {
          updateClick(false);
        }
      }
    });
    this.eventListeners.set("touchmove", (event) => {
      const touchEvent = event;
      if (touchEvent.touches.length > 0) {
        updateCursor(touchEvent.touches[0].clientX, touchEvent.touches[0].clientY);
      }
    });
    this.eventListeners.set("touchstart", (event) => {
      const touchEvent = event;
      this.isTouchDevice = true;
      if (touchEvent.touches.length > 0) {
        updateCursor(touchEvent.touches[0].clientX, touchEvent.touches[0].clientY);
        updateClick(true, touchEvent.touches[0].clientX, touchEvent.touches[0].clientY);
      }
    });
    this.eventListeners.set("touchend", (event) => {
      const touchEvent = event;
      if (touchEvent.touches.length === 0) {
        updateClick(false);
      }
    });
    this.eventListeners.forEach((listener, event) => {
      this.cursorTarget.addEventListener(event, listener);
    });
  }
  syncResolution() {
    const resolution = [this.gl.drawingBufferWidth, this.gl.drawingBufferHeight];
    this.gl.viewport(0, 0, ...resolution);
    if (this.uniforms.has("u_resolution")) {
      this.updateUniforms({ u_resolution: resolution });
    } else {
      this.initializeUniform("u_resolution", "float", resolution, { allowMissing: true });
    }
    this.resizeTexture(INTERMEDIATE_TEXTURE_KEY, ...resolution);
    if (this.historyDepth > 0) {
      this.resizeTexture(HISTORY_TEXTURE_KEY, ...resolution);
    }
    this.emit("updateResolution", ...resolution);
  }
  resizeTexture(name, width, height) {
    const info = this.textures.get(name);
    if (!info || info.width === width && info.height === height) return;
    this.gl.deleteTexture(info.texture);
    info.width = width;
    info.height = height;
    const { texture } = this.createTexture(name, info);
    info.texture = texture;
    this.resetHistoryTextureState(name, info);
  }
  reserveTextureUnit(name) {
    const existing = this.textures.get(name);
    if (existing) return existing.unitIndex;
    if (this.textureUnitPool.free.length > 0) return this.textureUnitPool.free.pop();
    if (this.textureUnitPool.next >= this.textureUnitPool.max) {
      throw spError(
        5,
        {
          name: stringFrom(name),
          nextTextureUnit: this.textureUnitPool.next,
          maxTextureUnits: this.textureUnitPool.max,
          freeTextureUnits: this.textureUnitPool.free.length
        }
      );
    }
    return this.textureUnitPool.next++;
  }
  resolveTextureOptions(options) {
    const { gl } = this;
    const internalFormatOption = options?.internalFormat;
    const typeString = options?.type ?? typeFromInternalFormatString(internalFormatOption) ?? "UNSIGNED_BYTE";
    const type = this.resolveGLConstant(typeString);
    const internalFormatString = internalFormatOption ?? this.glHelpers.typeToInternalFormatString.get(type) ?? "RGBA8";
    const isIntegerColorFormat = /^(R|RG|RGB|RGBA)(8|16|32)(UI|I)$/.test(internalFormatString);
    const formatString = options?.format ?? (isIntegerColorFormat ? "RGBA_INTEGER" : "RGBA");
    const result = {
      type,
      format: this.resolveGLConstant(formatString),
      internalFormat: this.resolveGLConstant(internalFormatString),
      minFilter: this.resolveGLConstant(options?.minFilter ?? "LINEAR"),
      magFilter: this.resolveGLConstant(options?.magFilter ?? "LINEAR"),
      wrapS: this.resolveGLConstant(options?.wrapS ?? "CLAMP_TO_EDGE"),
      wrapT: this.resolveGLConstant(options?.wrapT ?? "CLAMP_TO_EDGE"),
      preserveY: options?.preserveY,
      isIntegerColorFormat
    };
    const isFloatColorFormat = result.internalFormat === gl.RGBA16F || result.internalFormat === gl.RGBA32F;
    if (isFloatColorFormat && !gl.getExtension("EXT_color_buffer_float")) {
      throw spError(
        6,
        {
          internalFormat: internalFormatString,
          type: typeString
        }
      );
    }
    return result;
  }
  getPixelArray(type, size) {
    const ArrayType = this.glHelpers.typeToArray.get(type) ?? Uint8Array;
    return new ArrayType(size);
  }
  isNotRgba(format) {
    return format !== this.gl.RGBA && format !== this.gl.RGBA_INTEGER;
  }
  clearHistoryTextureLayers(textureInfo) {
    if (!textureInfo.history) return;
    const gl = this.gl;
    const { type, format } = textureInfo.options;
    const transparent = this.getPixelArray(type, textureInfo.width * textureInfo.height * 4);
    gl.activeTexture(gl.TEXTURE0 + textureInfo.unitIndex);
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, textureInfo.texture);
    const needsAlignmentFix = this.isNotRgba(format);
    let previousAlignment;
    if (needsAlignmentFix) {
      previousAlignment = gl.getParameter(gl.UNPACK_ALIGNMENT);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    }
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
    if (needsAlignmentFix) gl.pixelStorei(gl.UNPACK_ALIGNMENT, previousAlignment);
  }
  updateTextureFrameOffset(name, frameOffset, options) {
    this.updateUniforms(
      {
        [`${stringFrom(name)}FrameOffset`]: frameOffset
      },
      options
    );
  }
  resetHistoryTextureState(name, textureInfo) {
    if (!textureInfo.history) return;
    textureInfo.history.writeIndex = 0;
    this.clearHistoryTextureLayers(textureInfo);
    this.updateTextureFrameOffset(name, 0, { allowMissing: true });
  }
  initializeUniform(name, type, value, options) {
    const arrayLength = options?.arrayLength;
    const allowMissing = options?.allowMissing ?? false;
    if (this.uniforms.has(name)) {
      throw spError(7, { name, arrayLength: arrayLength ?? null });
    }
    if (!UNIFORM_TYPE_SUFFIXES[type]) {
      throw spError(
        8,
        {
          name,
          type,
          supportedTypes: Object.keys(UNIFORM_TYPE_SUFFIXES)
        }
      );
    }
    if (arrayLength && !(Array.isArray(value) && value.length === arrayLength)) {
      throw spError(
        9,
        {
          name,
          expectedLength: arrayLength,
          receivedLength: Array.isArray(value) ? value.length : 1
        }
      );
    }
    let location = this.gl.getUniformLocation(this.program, name);
    if (!location && arrayLength) {
      location = this.gl.getUniformLocation(this.program, `${name}[0]`);
    }
    if (!location) {
      if (allowMissing) return;
      throw spError(19, { name, arrayLength: arrayLength ?? null });
    }
    const probeValue = arrayLength ? value[0] : value;
    const length = Array.isArray(probeValue) ? probeValue.length : 1;
    this.uniforms.set(name, { type, length, location, arrayLength });
    try {
      this.updateUniforms({ [name]: value });
    } catch (error) {
      this.uniforms.delete(name);
      throw error;
    }
    this.emit("initializeUniform", ...arguments);
  }
  updateUniforms(updates, options) {
    this.gl.useProgram(this.program);
    Object.entries(updates).forEach(([name, newValue]) => {
      const uniform = this.uniforms.get(name);
      if (!uniform) {
        if (options?.allowMissing) return;
        throw spError(
          20,
          {
            name,
            startIndex: options?.startIndex ?? null
          }
        );
      }
      let glFunctionName = `uniform${uniform.length}${UNIFORM_TYPE_SUFFIXES[uniform.type]}`;
      if (uniform.arrayLength) {
        if (!Array.isArray(newValue)) {
          throw spError(
            10,
            {
              name,
              receivedType: typeof newValue
            }
          );
        }
        const nValues = newValue.length;
        if (!nValues) return;
        if (nValues > uniform.arrayLength) {
          throw spError(
            11,
            {
              name,
              receivedLength: nValues,
              maxLength: uniform.arrayLength
            }
          );
        }
        if (newValue.some((item) => (Array.isArray(item) ? item.length : 1) !== uniform.length)) {
          throw spError(
            12,
            {
              name,
              expectedElementLength: uniform.length
            }
          );
        }
        const flat = newValue.flat();
        const typedArray = uniform.type === "float" ? new Float32Array(flat) : uniform.type === "uint" ? new Uint32Array(flat) : new Int32Array(flat);
        let location = uniform.location;
        if (options?.startIndex) {
          const newLocation = this.gl.getUniformLocation(this.program, `${name}[${options.startIndex}]`);
          if (!newLocation) {
            throw spError(
              13,
              {
                name,
                startIndex: options.startIndex,
                arrayLength: uniform.arrayLength
              }
            );
          }
          location = newLocation;
        }
        this.gl[glFunctionName + "v"](location, typedArray);
      } else {
        if (!Array.isArray(newValue)) newValue = [newValue];
        const scalarValue = newValue;
        if (scalarValue.length !== uniform.length) {
          throw spError(
            14,
            {
              name,
              receivedLength: scalarValue.length,
              expectedLength: uniform.length
            }
          );
        }
        this.gl[glFunctionName](uniform.location, ...scalarValue);
      }
    });
    this.emit("updateUniforms", ...arguments);
  }
  createTexture(name, textureInfo) {
    const { width, height } = textureInfo;
    const historyDepth = textureInfo.history?.depth ?? 0;
    const texture = this.gl.createTexture();
    if (!texture) {
      throw spError(
        15,
        {
          name: stringFrom(name),
          width,
          height,
          historyDepth
        }
      );
    }
    let unitIndex = textureInfo.unitIndex;
    if (typeof unitIndex !== "number") {
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
  _initializeTexture(name, source, options) {
    if (this.textures.has(name)) {
      throw spError(16, { name: stringFrom(name) });
    }
    const { history: historyDepth = 0, ...textureOptions } = options ?? {};
    const { width, height } = getSourceDimensions(source);
    if (!width || !height) {
      throw spError(
        17,
        {
          name: stringFrom(name),
          width,
          height,
          sourceType: source.constructor.name
        }
      );
    }
    const textureInfo = {
      width,
      height,
      options: source instanceof _ShaderPad && Object.keys(textureOptions).length === 0 && source.textures.has(INTERMEDIATE_TEXTURE_KEY) ? source.textures.get(INTERMEDIATE_TEXTURE_KEY).options : this.resolveTextureOptions(textureOptions)
    };
    if (historyDepth > 0) {
      textureInfo.history = { depth: historyDepth, writeIndex: 0 };
    }
    const { texture, unitIndex } = this.createTexture(name, textureInfo);
    const completeTextureInfo = {
      texture,
      unitIndex,
      ...textureInfo
    };
    if (historyDepth > 0) {
      this.initializeUniform(`${stringFrom(name)}FrameOffset`, "int", 0, { allowMissing: true });
      this.clearHistoryTextureLayers(completeTextureInfo);
    }
    this.textures.set(name, completeTextureInfo);
    if (name !== INTERMEDIATE_TEXTURE_KEY && name !== HISTORY_TEXTURE_KEY) {
      this.updateTexture(name, source);
    }
    this.gl.useProgram(this.program);
    const uSampler = this.gl.getUniformLocation(this.program, stringFrom(name));
    if (uSampler) {
      this.gl.uniform1i(uSampler, unitIndex);
    }
  }
  initializeTexture(name, source, options) {
    const opts = options?.history != null && options.history > 0 ? { ...options, history: options.history + 1 } : options;
    this._initializeTexture(name, source, opts);
    this.emit("initializeTexture", ...arguments);
  }
  updateTextures(updates) {
    Object.entries(updates).forEach(([name, source]) => {
      this.updateTexture(name, source);
    });
    this.emit("updateTextures", ...arguments);
  }
  updateTexture(name, source, historySlots) {
    const info = this.textures.get(name);
    if (!info) {
      throw spError(18, { name: stringFrom(name) });
    }
    if (source instanceof WebGLTexture) {
      this.gl.activeTexture(this.gl.TEXTURE0 + info.unitIndex);
      this.gl.bindTexture(this.gl.TEXTURE_2D, source);
      return;
    }
    let nonShaderPadSource = source;
    if (source instanceof _ShaderPad) {
      const sourceIntermediateInfo = source.textures.get(INTERMEDIATE_TEXTURE_KEY);
      const srcW = sourceIntermediateInfo.width;
      const srcH = sourceIntermediateInfo.height;
      if (source.gl === this.gl) {
        if (!info.history) {
          this.gl.activeTexture(this.gl.TEXTURE0 + info.unitIndex);
          this.gl.bindTexture(this.gl.TEXTURE_2D, sourceIntermediateInfo.texture);
          return;
        }
        const { depth } = info.history;
        const targetSlots = historySlots === void 0 ? [info.history.writeIndex] : Array.isArray(historySlots) ? historySlots.map((i) => safeMod(i, depth)) : [safeMod(historySlots, depth)];
        this.gl.activeTexture(this.gl.TEXTURE0 + info.unitIndex);
        this.gl.bindTexture(this.gl.TEXTURE_2D_ARRAY, info.texture);
        this.gl.bindFramebuffer(this.gl.READ_FRAMEBUFFER, source.intermediateFbo);
        for (const slot of targetSlots) {
          this.gl.copyTexSubImage3D(this.gl.TEXTURE_2D_ARRAY, 0, 0, 0, slot, 0, 0, srcW, srcH);
        }
        this.gl.bindFramebuffer(this.gl.READ_FRAMEBUFFER, null);
        this.updateTextureFrameOffset(name, targetSlots[targetSlots.length - 1], { allowMissing: true });
        if (historySlots === void 0) {
          info.history.writeIndex = (info.history.writeIndex + 1) % depth;
        }
        return;
      }
      const {
        width: width2,
        height: height2,
        options: { format, type }
      } = sourceIntermediateInfo;
      const pixels = this.getPixelArray(type, width2 * height2 * 4);
      source.gl.bindFramebuffer(source.gl.FRAMEBUFFER, source.intermediateFbo);
      source.gl.readPixels(0, 0, width2, height2, format, type, pixels);
      source.gl.bindFramebuffer(source.gl.FRAMEBUFFER, null);
      nonShaderPadSource = { data: pixels, width: width2, height: height2 };
    }
    const { width, height } = getSourceDimensions(nonShaderPadSource);
    if (!width || !height) return;
    const isPartial = "isPartial" in nonShaderPadSource && nonShaderPadSource.isPartial;
    if (!isPartial) {
      this.resizeTexture(name, width, height);
    }
    const isTypedArray = "data" in nonShaderPadSource && nonShaderPadSource.data;
    const shouldFlipY = !isTypedArray && !info.options?.preserveY;
    const previousFlipY = this.gl.getParameter(this.gl.UNPACK_FLIP_Y_WEBGL);
    const needsAlignmentFix = isTypedArray && this.isNotRgba(info.options.format);
    let previousAlignment;
    if (needsAlignmentFix) {
      previousAlignment = this.gl.getParameter(this.gl.UNPACK_ALIGNMENT);
      this.gl.pixelStorei(this.gl.UNPACK_ALIGNMENT, 1);
    }
    if (info.history) {
      this.gl.activeTexture(this.gl.TEXTURE0 + info.unitIndex);
      this.gl.bindTexture(this.gl.TEXTURE_2D_ARRAY, info.texture);
      const { depth } = info.history;
      const targetSlots = historySlots === void 0 ? [info.history.writeIndex] : Array.isArray(historySlots) ? historySlots.map((i) => safeMod(i, depth)) : [safeMod(historySlots, depth)];
      this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, shouldFlipY);
      const partialSource = nonShaderPadSource;
      const sourceData = partialSource.data ?? nonShaderPadSource;
      const xOffset = isPartial ? partialSource.x ?? 0 : 0;
      const yOffset = isPartial ? partialSource.y ?? 0 : 0;
      for (const slot of targetSlots) {
        this.gl.texSubImage3D(
          this.gl.TEXTURE_2D_ARRAY,
          0,
          xOffset,
          yOffset,
          slot,
          width,
          height,
          1,
          info.options.format,
          info.options.type,
          sourceData
        );
      }
      this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, previousFlipY);
      this.updateTextureFrameOffset(name, targetSlots[targetSlots.length - 1]);
      if (historySlots === void 0) {
        info.history.writeIndex = (info.history.writeIndex + 1) % depth;
      }
    } else {
      this.gl.activeTexture(this.gl.TEXTURE0 + info.unitIndex);
      this.gl.bindTexture(this.gl.TEXTURE_2D, info.texture);
      this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, shouldFlipY);
      if (isPartial) {
        const partialSource = nonShaderPadSource;
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
          nonShaderPadSource.data ?? nonShaderPadSource
        );
      }
      this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, previousFlipY);
    }
    if (needsAlignmentFix) this.gl.pixelStorei(this.gl.UNPACK_ALIGNMENT, previousAlignment);
  }
  bindIntermediate() {
    const gl = this.gl;
    const intermediateInfo = this.textures.get(INTERMEDIATE_TEXTURE_KEY);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.intermediateFbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, intermediateInfo.texture, 0);
  }
  clear() {
    this.bindIntermediate();
    const gl = this.gl;
    const intermediateInfo = this.textures.get(INTERMEDIATE_TEXTURE_KEY);
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
  draw(options) {
    this.emit("beforeDraw", ...arguments);
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
      const intermediateInfo = this.textures.get(INTERMEDIATE_TEXTURE_KEY);
      if (!intermediateInfo.options.isIntegerColorFormat) {
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.intermediateFbo);
        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
        gl.blitFramebuffer(0, 0, w, h, 0, 0, w, h, gl.COLOR_BUFFER_BIT, gl.NEAREST);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      }
    }
    this.emit("afterDraw", ...arguments);
  }
  step(options) {
    if (!Number.isFinite(this.startTime)) {
      this.startTime = performance.now();
    }
    this._step((performance.now() - this.startTime) / 1e3, options);
  }
  _step(time, options) {
    this.emit("beforeStep", time, this.frame, options);
    const updates = {};
    if (this.uniforms.has("u_time")) updates.u_time = time;
    if (this.uniforms.has("u_frame")) updates.u_frame = this.frame;
    this.updateUniforms(updates);
    this.draw(options);
    const historyInfo = this.textures.get(HISTORY_TEXTURE_KEY);
    if (historyInfo && !options?.skipHistory) {
      const { writeIndex, depth } = historyInfo.history;
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
      this.updateTextureFrameOffset(HISTORY_TEXTURE_KEY, nextWriteIndex, { allowMissing: true });
      historyInfo.history.writeIndex = nextWriteIndex;
    }
    ++this.frame;
    this.emit("afterStep", time, this.frame, options);
  }
  play(onBeforeStep) {
    this._pause();
    if (!Number.isFinite(this.startTime)) {
      this.startTime = performance.now();
    }
    this.isPlaying = true;
    const loop = (time) => {
      time = (time - this.startTime) / 1e3;
      const options = onBeforeStep?.(time, this.frame) ?? void 0;
      this._step(time, options);
      if (this.isPlaying) this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
    this.emit("play");
  }
  _pause() {
    const wasPlaying = this.isPlaying;
    this.isPlaying = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    return wasPlaying;
  }
  pause() {
    if (this._pause()) {
      this.emit("pause");
    }
  }
  resetFrame() {
    this.frame = 0;
    this.startTime = performance.now();
  }
  reset() {
    this.resetFrame();
    this.textures.forEach((texture, name) => {
      this.resetHistoryTextureState(name, texture);
    });
    this.clear();
    this.emit("reset");
  }
  destroy() {
    this.emit("destroy");
    this._pause();
    if (this.cursorTarget) {
      this.eventListeners.forEach((listener, event) => {
        this.cursorTarget.removeEventListener(event, listener);
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
    this.textures.forEach((texture) => {
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
};
var index_default = ShaderPad;

// src/plugins/mediapipe-common.ts
var dummyTexture = { data: new Uint8Array(4), width: 1, height: 1 };
function isMediaPipeSource(source) {
  return source instanceof HTMLVideoElement || source instanceof HTMLImageElement || source instanceof HTMLCanvasElement || source instanceof OffscreenCanvas;
}
function hashOptions(options) {
  return JSON.stringify(options, Object.keys(options).sort());
}
function getOrCreateSharedResource(key, sharedResources, sharedResourcePromises, create) {
  const existing = sharedResources.get(key);
  if (existing) return Promise.resolve(existing);
  const pending = sharedResourcePromises.get(key);
  if (pending) return pending;
  let promise;
  promise = create().then((resource) => {
    if (resource) {
      sharedResources.set(key, resource);
    }
    return resource;
  }).finally(() => {
    if (sharedResourcePromises.get(key) === promise) {
      sharedResourcePromises.delete(key);
    }
  });
  sharedResourcePromises.set(key, promise);
  return promise;
}
function calculateBoundingBoxCenter(data, entityIdx, landmarkIndices, landmarkCount, offset = 0) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, avgZ = 0, avgVisibility = 0;
  for (const idx of landmarkIndices) {
    const dataIdx = (offset + entityIdx * landmarkCount + idx) * 4;
    const x = data[dataIdx];
    const y = data[dataIdx + 1];
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
    avgZ += data[dataIdx + 2];
    avgVisibility += data[dataIdx + 3];
  }
  return [
    (minX + maxX) / 2,
    (minY + maxY) / 2,
    avgZ / landmarkIndices.length,
    avgVisibility / landmarkIndices.length
  ];
}
var filesetPromise = null;
function getSharedFileset() {
  if (!filesetPromise) {
    filesetPromise = import("@mediapipe/tasks-vision").then(
      ({ FilesetResolver }) => FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm")
    );
  }
  return filesetPromise;
}
function generateGLSLFn(history) {
  const historyParams = history ? ", framesAgo" : "";
  const fn = history ? (returnType, name, args, body) => {
    const argsOnly = args.replace(/\w+ /g, "");
    const historyArgs = args ? `${args}, int framesAgo` : "int framesAgo";
    const callArgs = argsOnly ? `${argsOnly}, 0` : "0";
    return `${returnType} ${name}(${historyArgs}) {
${body}
}
${returnType} ${name}(${args}) { return ${name}(${callArgs}); }`;
  } : (returnType, name, args, body) => `${returnType} ${name}(${args}) {
${body}
}`;
  return { historyParams, fn };
}

// src/plugins/pose.ts
var STANDARD_LANDMARK_COUNT = 33;
var CUSTOM_LANDMARK_COUNT = 6;
var LANDMARK_COUNT = STANDARD_LANDMARK_COUNT + CUSTOM_LANDMARK_COUNT;
var LANDMARK_INDICES = {
  // Standard landmarks.
  LEFT_EYE: 2,
  RIGHT_EYE: 5,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
  // Custom landmarks.
  BODY_CENTER: STANDARD_LANDMARK_COUNT,
  LEFT_HAND_CENTER: STANDARD_LANDMARK_COUNT + 1,
  RIGHT_HAND_CENTER: STANDARD_LANDMARK_COUNT + 2,
  LEFT_FOOT_CENTER: STANDARD_LANDMARK_COUNT + 3,
  RIGHT_FOOT_CENTER: STANDARD_LANDMARK_COUNT + 4,
  TORSO_CENTER: STANDARD_LANDMARK_COUNT + 5
};
var ALL_STANDARD_INDICES = Array.from({ length: STANDARD_LANDMARK_COUNT }, (_, i) => i);
var LEFT_HAND_INDICES = [
  LANDMARK_INDICES.LEFT_WRIST,
  LANDMARK_INDICES.LEFT_PINKY,
  LANDMARK_INDICES.LEFT_THUMB,
  LANDMARK_INDICES.LEFT_INDEX
];
var RIGHT_HAND_INDICES = [
  LANDMARK_INDICES.RIGHT_WRIST,
  LANDMARK_INDICES.RIGHT_PINKY,
  LANDMARK_INDICES.RIGHT_THUMB,
  LANDMARK_INDICES.RIGHT_INDEX
];
var LEFT_FOOT_INDICES = [LANDMARK_INDICES.LEFT_ANKLE, LANDMARK_INDICES.LEFT_HEEL, LANDMARK_INDICES.LEFT_FOOT_INDEX];
var RIGHT_FOOT_INDICES = [
  LANDMARK_INDICES.RIGHT_ANKLE,
  LANDMARK_INDICES.RIGHT_HEEL,
  LANDMARK_INDICES.RIGHT_FOOT_INDEX
];
var TORSO_INDICES = [
  LANDMARK_INDICES.LEFT_SHOULDER,
  LANDMARK_INDICES.RIGHT_SHOULDER,
  LANDMARK_INDICES.LEFT_HIP,
  LANDMARK_INDICES.RIGHT_HIP
];
var LANDMARKS_TEXTURE_WIDTH = 512;
var N_LANDMARK_METADATA_SLOTS = 1;
var DEFAULT_POSE_OPTIONS = {
  modelPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
  maxPoses: 1,
  minPoseDetectionConfidence: 0.5,
  minPosePresenceConfidence: 0.5,
  minTrackingConfidence: 0.5
};
var MASK_SHADER_SRC = `#version 300 es
precision mediump float;
in vec2 v_uv;
out vec4 outColor;
uniform mediump sampler2D u_mask;
uniform float u_poseIndex;
void main() {
	ivec2 texCoord = ivec2(vec2(v_uv.x, 1.0 - v_uv.y) * vec2(textureSize(u_mask, 0)));
	float confidence = texelFetch(u_mask, texCoord, 0).r;
	if (confidence < 0.01) discard;
	outColor = vec4(1.0, confidence, u_poseIndex, 1.0);
}`;
var sharedDetectors = /* @__PURE__ */ new Map();
var sharedDetectorPromises = /* @__PURE__ */ new Map();
function updateLandmarksData(detector, poses) {
  const data = detector.landmarks.data;
  const nPoses = poses.length;
  data[0] = nPoses;
  for (let poseIdx = 0; poseIdx < nPoses; ++poseIdx) {
    const landmarks = poses[poseIdx];
    for (let lmIdx = 0; lmIdx < STANDARD_LANDMARK_COUNT; ++lmIdx) {
      const landmark = landmarks[lmIdx];
      const dataIdx = (N_LANDMARK_METADATA_SLOTS + poseIdx * LANDMARK_COUNT + lmIdx) * 4;
      data[dataIdx] = landmark.x;
      data[dataIdx + 1] = 1 - landmark.y;
      data[dataIdx + 2] = landmark.z ?? 0;
      data[dataIdx + 3] = landmark.visibility ?? 1;
    }
    const bodyCenter = calculateBoundingBoxCenter(
      data,
      poseIdx,
      ALL_STANDARD_INDICES,
      LANDMARK_COUNT,
      N_LANDMARK_METADATA_SLOTS
    );
    const bodyCenterIdx = (N_LANDMARK_METADATA_SLOTS + poseIdx * LANDMARK_COUNT + LANDMARK_INDICES.BODY_CENTER) * 4;
    data[bodyCenterIdx] = bodyCenter[0];
    data[bodyCenterIdx + 1] = bodyCenter[1];
    data[bodyCenterIdx + 2] = bodyCenter[2];
    data[bodyCenterIdx + 3] = bodyCenter[3];
    const leftHandCenter = calculateBoundingBoxCenter(
      data,
      poseIdx,
      LEFT_HAND_INDICES,
      LANDMARK_COUNT,
      N_LANDMARK_METADATA_SLOTS
    );
    const leftHandCenterIdx = (N_LANDMARK_METADATA_SLOTS + poseIdx * LANDMARK_COUNT + LANDMARK_INDICES.LEFT_HAND_CENTER) * 4;
    data[leftHandCenterIdx] = leftHandCenter[0];
    data[leftHandCenterIdx + 1] = leftHandCenter[1];
    data[leftHandCenterIdx + 2] = leftHandCenter[2];
    data[leftHandCenterIdx + 3] = leftHandCenter[3];
    const rightHandCenter = calculateBoundingBoxCenter(
      data,
      poseIdx,
      RIGHT_HAND_INDICES,
      LANDMARK_COUNT,
      N_LANDMARK_METADATA_SLOTS
    );
    const rightHandCenterIdx = (N_LANDMARK_METADATA_SLOTS + poseIdx * LANDMARK_COUNT + LANDMARK_INDICES.RIGHT_HAND_CENTER) * 4;
    data[rightHandCenterIdx] = rightHandCenter[0];
    data[rightHandCenterIdx + 1] = rightHandCenter[1];
    data[rightHandCenterIdx + 2] = rightHandCenter[2];
    data[rightHandCenterIdx + 3] = rightHandCenter[3];
    const leftFootCenter = calculateBoundingBoxCenter(
      data,
      poseIdx,
      LEFT_FOOT_INDICES,
      LANDMARK_COUNT,
      N_LANDMARK_METADATA_SLOTS
    );
    const leftFootCenterIdx = (N_LANDMARK_METADATA_SLOTS + poseIdx * LANDMARK_COUNT + LANDMARK_INDICES.LEFT_FOOT_CENTER) * 4;
    data[leftFootCenterIdx] = leftFootCenter[0];
    data[leftFootCenterIdx + 1] = leftFootCenter[1];
    data[leftFootCenterIdx + 2] = leftFootCenter[2];
    data[leftFootCenterIdx + 3] = leftFootCenter[3];
    const rightFootCenter = calculateBoundingBoxCenter(
      data,
      poseIdx,
      RIGHT_FOOT_INDICES,
      LANDMARK_COUNT,
      N_LANDMARK_METADATA_SLOTS
    );
    const rightFootCenterIdx = (N_LANDMARK_METADATA_SLOTS + poseIdx * LANDMARK_COUNT + LANDMARK_INDICES.RIGHT_FOOT_CENTER) * 4;
    data[rightFootCenterIdx] = rightFootCenter[0];
    data[rightFootCenterIdx + 1] = rightFootCenter[1];
    data[rightFootCenterIdx + 2] = rightFootCenter[2];
    data[rightFootCenterIdx + 3] = rightFootCenter[3];
    const torsoCenter = calculateBoundingBoxCenter(
      data,
      poseIdx,
      TORSO_INDICES,
      LANDMARK_COUNT,
      N_LANDMARK_METADATA_SLOTS
    );
    const torsoCenterIdx = (N_LANDMARK_METADATA_SLOTS + poseIdx * LANDMARK_COUNT + LANDMARK_INDICES.TORSO_CENTER) * 4;
    data[torsoCenterIdx] = torsoCenter[0];
    data[torsoCenterIdx + 1] = torsoCenter[1];
    data[torsoCenterIdx + 2] = torsoCenter[2];
    data[torsoCenterIdx + 3] = torsoCenter[3];
  }
  detector.state.nPoses = nPoses;
}
function updateMask(detector, segmentationMasks) {
  const { maskShader, maxPoses } = detector;
  if (!segmentationMasks || segmentationMasks.length === 0) {
    return maskShader.clear();
  }
  for (let i = 0; i < segmentationMasks.length; ++i) {
    const segMask = segmentationMasks[i];
    maskShader.updateTextures({ u_mask: segMask.getAsWebGLTexture() });
    maskShader.updateUniforms({ u_poseIndex: (i + 1) / maxPoses });
    maskShader.step({ skipClear: i > 0 });
    segMask.close();
  }
}
function pose(config) {
  const { textureName, options: { history, ...mediapipeOptions } = {} } = config;
  const options = { ...DEFAULT_POSE_OPTIONS, ...mediapipeOptions };
  const optionsKey = hashOptions({ ...options, textureName });
  const nLandmarksMax = options.maxPoses * LANDMARK_COUNT + N_LANDMARK_METADATA_SLOTS;
  const textureHeight = Math.ceil(nLandmarksMax / LANDMARKS_TEXTURE_WIDTH);
  return function(shaderPad, context) {
    const { injectGLSL, emit, updateTexture } = context;
    const existingDetector = sharedDetectors.get(optionsKey);
    const landmarksData = existingDetector?.landmarks.data ?? new Float32Array(LANDMARKS_TEXTURE_WIDTH * textureHeight * 4);
    const mediapipeCanvas = existingDetector?.mediapipeCanvas ?? new OffscreenCanvas(1, 1);
    const maskShader = existingDetector?.maskShader ?? (() => {
      const shader = new index_default(MASK_SHADER_SRC, {
        canvas: mediapipeCanvas
      });
      shader.initializeTexture("u_mask", dummyTexture);
      shader.initializeUniform("u_poseIndex", "float", 0);
      return shader;
    })();
    let detector;
    let destroyed = false;
    let historySlot = -1;
    let pendingBackfillSlots = [];
    function writeTextures(historySlots) {
      if (!detector) return;
      const { nPoses } = detector.state;
      const nSlots = nPoses * LANDMARK_COUNT + N_LANDMARK_METADATA_SLOTS;
      const rowsToUpdate = Math.ceil(nSlots / LANDMARKS_TEXTURE_WIDTH);
      const targetHistorySlots = history ? historySlots : void 0;
      updateTexture(
        "u_poseLandmarksTex",
        {
          data: detector.landmarks.data,
          width: LANDMARKS_TEXTURE_WIDTH,
          height: rowsToUpdate,
          isPartial: true
        },
        targetHistorySlots
      );
      updateTexture("u_poseMask", detector.maskShader, targetHistorySlots);
      shaderPad.updateUniforms({ u_nPoses: nPoses }, { allowMissing: true });
    }
    function onResult() {
      if (history) {
        writeTextures(pendingBackfillSlots.length > 0 ? pendingBackfillSlots : historySlot);
        pendingBackfillSlots = [];
      } else {
        writeTextures(historySlot);
      }
      emit("pose:result", detector.state.result);
    }
    async function initializeDetector() {
      detector = await getOrCreateSharedResource(
        optionsKey,
        sharedDetectors,
        sharedDetectorPromises,
        async () => {
          const [mediaPipe, { PoseLandmarker }] = await Promise.all([
            getSharedFileset(),
            import("@mediapipe/tasks-vision")
          ]);
          if (destroyed) return;
          const poseLandmarker = await PoseLandmarker.createFromOptions(mediaPipe, {
            baseOptions: {
              modelAssetPath: options.modelPath,
              delegate: "GPU"
            },
            canvas: mediapipeCanvas,
            runningMode: "VIDEO",
            numPoses: options.maxPoses,
            minPoseDetectionConfidence: options.minPoseDetectionConfidence,
            minPosePresenceConfidence: options.minPosePresenceConfidence,
            minTrackingConfidence: options.minTrackingConfidence,
            outputSegmentationMasks: true
          });
          if (destroyed) {
            poseLandmarker.close();
            maskShader.destroy();
            return;
          }
          const detector2 = {
            landmarker: poseLandmarker,
            mediapipeCanvas,
            maskShader,
            subscribers: /* @__PURE__ */ new Map(),
            maxPoses: options.maxPoses,
            state: {
              nCalls: 0,
              runningMode: "VIDEO",
              source: null,
              videoTime: -1,
              resultTimestamp: 0,
              result: null,
              pending: Promise.resolve(),
              nPoses: 0
            },
            landmarks: {
              data: landmarksData,
              textureHeight
            }
          };
          return detector2;
        }
      );
      if (!detector || destroyed) return;
      if (maskShader !== detector.maskShader) {
        maskShader.destroy();
      }
      detector.subscribers.set(onResult, false);
    }
    const initPromise = initializeDetector();
    shaderPad.on("_init", () => {
      shaderPad.initializeUniform("u_maxPoses", "int", options.maxPoses, { allowMissing: true });
      shaderPad.initializeUniform("u_nPoses", "int", 0, { allowMissing: true });
      shaderPad.initializeTexture(
        "u_poseLandmarksTex",
        {
          data: landmarksData,
          width: LANDMARKS_TEXTURE_WIDTH,
          height: textureHeight
        },
        {
          internalFormat: "RGBA32F",
          type: "FLOAT",
          minFilter: "NEAREST",
          magFilter: "NEAREST",
          history
        }
      );
      shaderPad.initializeTexture("u_poseMask", maskShader, {
        minFilter: "NEAREST",
        magFilter: "NEAREST",
        history
      });
      initPromise.then(() => {
        if (destroyed || !detector) return;
        emit("pose:ready");
      });
    });
    function requestPoses(source) {
      if (!detector) return;
      if (history) {
        historySlot = (historySlot + 1) % (history + 1);
        writeTextures(historySlot);
        pendingBackfillSlots.push(historySlot);
      }
      detector.subscribers.set(onResult, true);
      detectPoses(source);
    }
    shaderPad.on("initializeTexture", (name, source) => {
      if (name === textureName && isMediaPipeSource(source)) {
        requestPoses(source);
      }
    });
    shaderPad.on("updateTextures", (updates) => {
      const source = updates[textureName];
      if (isMediaPipeSource(source)) {
        requestPoses(source);
      }
    });
    async function detectPoses(source) {
      const now = performance.now();
      await initPromise;
      if (!detector) return;
      const callOrder = ++detector.state.nCalls;
      detector.state.pending = detector.state.pending.then(async () => {
        if (!detector || callOrder !== detector.state.nCalls) return;
        const requiredMode = source instanceof HTMLVideoElement ? "VIDEO" : "IMAGE";
        if (detector.state.runningMode !== requiredMode) {
          detector.state.runningMode = requiredMode;
          await detector.landmarker.setOptions({
            runningMode: requiredMode
          });
        }
        let shouldDetect = false;
        if (source !== detector.state.source) {
          detector.state.source = source;
          detector.state.videoTime = source instanceof HTMLVideoElement ? source.currentTime : -1;
          shouldDetect = true;
        } else if (source instanceof HTMLVideoElement) {
          if (source.currentTime !== detector.state.videoTime) {
            detector.state.videoTime = source.currentTime;
            shouldDetect = true;
          }
        } else if (!(source instanceof HTMLImageElement)) {
          if (now - detector.state.resultTimestamp > 2) {
            shouldDetect = true;
          }
        }
        if (shouldDetect) {
          let result;
          if (source instanceof HTMLVideoElement) {
            if (source.videoWidth === 0 || source.videoHeight === 0 || source.readyState < 2) return;
            result = detector.landmarker.detectForVideo(source, now);
          } else {
            if (source.width === 0 || source.height === 0) return;
            result = detector.landmarker.detect(source);
          }
          if (result) {
            detector.state.resultTimestamp = now;
            detector.state.result = result;
            updateLandmarksData(detector, result.landmarks);
            updateMask(detector, result.segmentationMasks);
            for (const [cb, needsResult] of detector.subscribers.entries()) {
              if (needsResult) {
                cb();
                detector.subscribers.set(cb, false);
              }
            }
          }
        } else if (detector.state.result) {
          for (const [cb, needsResult] of detector.subscribers.entries()) {
            if (needsResult) {
              cb();
              detector.subscribers.set(cb, false);
            }
          }
        }
      });
      await detector.state.pending;
    }
    shaderPad.on("destroy", () => {
      destroyed = true;
      if (detector) {
        detector.subscribers.delete(onResult);
        if (detector.subscribers.size === 0) {
          detector.landmarker.close();
          detector.maskShader.destroy();
          sharedDetectors.delete(optionsKey);
        }
      }
      detector = void 0;
    });
    const { fn, historyParams } = generateGLSLFn(history);
    const sampleMask = history ? `int layer = (u_poseMaskFrameOffset - framesAgo + ${history + 1}) % ${history + 1};
	vec4 mask = texture(u_poseMask, vec3(pos, float(layer)));` : `vec4 mask = texture(u_poseMask, pos);`;
    injectGLSL(`
uniform int u_maxPoses;
uniform int u_nPoses;
uniform highp sampler2D${history ? "Array" : ""} u_poseLandmarksTex;${history ? `
uniform int u_poseLandmarksTexFrameOffset;` : ""}
uniform mediump sampler2D${history ? "Array" : ""} u_poseMask;${history ? `
uniform int u_poseMaskFrameOffset;` : ""}

#define POSE_LANDMARK_LEFT_EYE ${LANDMARK_INDICES.LEFT_EYE}
#define POSE_LANDMARK_RIGHT_EYE ${LANDMARK_INDICES.RIGHT_EYE}
#define POSE_LANDMARK_LEFT_SHOULDER ${LANDMARK_INDICES.LEFT_SHOULDER}
#define POSE_LANDMARK_RIGHT_SHOULDER ${LANDMARK_INDICES.RIGHT_SHOULDER}
#define POSE_LANDMARK_LEFT_ELBOW ${LANDMARK_INDICES.LEFT_ELBOW}
#define POSE_LANDMARK_RIGHT_ELBOW ${LANDMARK_INDICES.RIGHT_ELBOW}
#define POSE_LANDMARK_LEFT_HIP ${LANDMARK_INDICES.LEFT_HIP}
#define POSE_LANDMARK_RIGHT_HIP ${LANDMARK_INDICES.RIGHT_HIP}
#define POSE_LANDMARK_LEFT_KNEE ${LANDMARK_INDICES.LEFT_KNEE}
#define POSE_LANDMARK_RIGHT_KNEE ${LANDMARK_INDICES.RIGHT_KNEE}
#define POSE_LANDMARK_BODY_CENTER ${LANDMARK_INDICES.BODY_CENTER}
#define POSE_LANDMARK_LEFT_HAND_CENTER ${LANDMARK_INDICES.LEFT_HAND_CENTER}
#define POSE_LANDMARK_RIGHT_HAND_CENTER ${LANDMARK_INDICES.RIGHT_HAND_CENTER}
#define POSE_LANDMARK_LEFT_FOOT_CENTER ${LANDMARK_INDICES.LEFT_FOOT_CENTER}
#define POSE_LANDMARK_RIGHT_FOOT_CENTER ${LANDMARK_INDICES.RIGHT_FOOT_CENTER}
#define POSE_LANDMARK_TORSO_CENTER ${LANDMARK_INDICES.TORSO_CENTER}

${fn(
      "int",
      "nPosesAt",
      "",
      history ? `
	int layer = (u_poseLandmarksTexFrameOffset - framesAgo + ${history + 1}) % ${history + 1};
	return int(texelFetch(u_poseLandmarksTex, ivec3(0, 0, layer), 0).r + 0.5);` : `
	return int(texelFetch(u_poseLandmarksTex, ivec2(0, 0), 0).r + 0.5);`
    )}
${fn(
      "vec4",
      "poseLandmark",
      "int poseIndex, int landmarkIndex",
      `int i = ${N_LANDMARK_METADATA_SLOTS} + poseIndex * ${LANDMARK_COUNT} + landmarkIndex;
	int x = i % ${LANDMARKS_TEXTURE_WIDTH};
	int y = i / ${LANDMARKS_TEXTURE_WIDTH};${history ? `
	int layer = (u_poseLandmarksTexFrameOffset - framesAgo + ${history + 1}) % ${history + 1};
	return texelFetch(u_poseLandmarksTex, ivec3(x, y, layer), 0);` : `
	return texelFetch(u_poseLandmarksTex, ivec2(x, y), 0);`}`
    )}
${fn(
      "vec2",
      "poseAt",
      "vec2 pos",
      `${sampleMask}
	float poseIndex = floor(mask.b * float(u_maxPoses) + 0.5) - 1.0;
	return vec2(mask.g, poseIndex);`
    )}
${fn("float", "inPose", "vec2 pos", `vec2 pose = poseAt(pos${historyParams}); return step(0.0, pose.y) * pose.x;`)}`);
  };
}
var pose_default = pose;
//# sourceMappingURL=pose.js.map