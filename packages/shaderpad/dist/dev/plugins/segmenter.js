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

// src/plugins/segmenter.ts
var segmenter_exports = {};
__export(segmenter_exports, {
  default: () => segmenter_default
});
module.exports = __toCommonJS(segmenter_exports);

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
          gl,
          canvas: this.canvas,
          injectGLSL: (code) => {
            glslInjections.push(code);
          },
          emitHook: this.emitHook.bind(this),
          updateTexturesInternal: this.updateTexturesInternal.bind(this)
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
      this.resolutionObserver = new MutationObserver(() => this.updateResolution());
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
                instance.updateResolution();
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
    this.updateResolution();
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
    this.emitHook("_init");
  }
  resolveGLConstant(value) {
    const resolved = this.gl[value];
    if (resolved === void 0) {
      throw spError(3, { value });
    }
    return resolved;
  }
  emitHook(name, ...args) {
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
  updateResolution() {
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
    this.emitHook("updateResolution", ...resolution);
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
    this.emitHook("initializeUniform", ...arguments);
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
    this.emitHook("updateUniforms", ...arguments);
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
    this.emitHook("initializeTexture", ...arguments);
  }
  updateTextures(updates, options) {
    this.updateTexturesInternal(updates, options);
    this.emitHook("updateTextures", ...arguments);
  }
  updateTexturesInternal(updates, options) {
    Object.entries(updates).forEach(([name, source]) => {
      this.updateTexture(name, source, options);
    });
  }
  updateTexture(name, source, options) {
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
        const targetSlots = options?.historyWriteIndex === void 0 ? [info.history.writeIndex] : Array.isArray(options?.historyWriteIndex) ? options.historyWriteIndex.map((i) => safeMod(i, depth)) : [safeMod(options.historyWriteIndex, depth)];
        this.gl.bindFramebuffer(this.gl.READ_FRAMEBUFFER, source.intermediateFbo);
        this.gl.bindTexture(this.gl.TEXTURE_2D_ARRAY, info.texture);
        for (const slot of targetSlots) {
          this.gl.copyTexSubImage3D(this.gl.TEXTURE_2D_ARRAY, 0, 0, 0, slot, 0, 0, srcW, srcH);
        }
        this.gl.bindFramebuffer(this.gl.READ_FRAMEBUFFER, null);
        this.gl.activeTexture(this.gl.TEXTURE0 + info.unitIndex);
        this.gl.bindTexture(this.gl.TEXTURE_2D_ARRAY, info.texture);
        this.updateTextureFrameOffset(name, targetSlots[targetSlots.length - 1], { allowMissing: true });
        if (options?.historyWriteIndex === void 0) {
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
      if (!options?.skipHistoryWrite) {
        const { depth } = info.history;
        const targetSlots = options?.historyWriteIndex === void 0 ? [info.history.writeIndex] : Array.isArray(options.historyWriteIndex) ? options.historyWriteIndex.map((i) => safeMod(i, depth)) : [safeMod(options.historyWriteIndex, depth)];
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
        if (options?.historyWriteIndex === void 0) {
          info.history.writeIndex = (info.history.writeIndex + 1) % depth;
        }
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
    this.emitHook("beforeDraw", ...arguments);
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
    this.emitHook("afterDraw", ...arguments);
  }
  step(options) {
    if (!Number.isFinite(this.startTime)) {
      this.startTime = performance.now();
    }
    this._step((performance.now() - this.startTime) / 1e3, options);
  }
  _step(time, options) {
    this.emitHook("beforeStep", time, this.frame, options);
    const updates = {};
    if (this.uniforms.has("u_time")) updates.u_time = time;
    if (this.uniforms.has("u_frame")) updates.u_frame = this.frame;
    this.updateUniforms(updates);
    this.draw(options);
    const historyInfo = this.textures.get(HISTORY_TEXTURE_KEY);
    if (historyInfo && !options?.skipHistoryWrite) {
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
    this.emitHook("afterStep", time, this.frame, options);
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
    this.emitHook("play");
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
      this.emitHook("pause");
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
    this.emitHook("reset");
  }
  destroy() {
    this.emitHook("destroy");
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
var filesetPromise = null;
function getSharedFileset() {
  if (!filesetPromise) {
    filesetPromise = import("@mediapipe/tasks-vision").then(
      ({ FilesetResolver }) => FilesetResolver.forVisionTasks(
        `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${"0.10.22-rc.20250304"}/wasm`
      )
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

// src/plugins/segmenter.ts
var dummyTextureFloat32 = {
  data: new Float32Array(1).fill(1),
  width: 1,
  height: 1
};
var DEFAULT_SEGMENTER_OPTIONS = {
  modelPath: "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite",
  outputConfidenceMasks: false
};
var MASK_SHADER_SOURCE = `#version 300 es
precision mediump float;
in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_categoryMask;
uniform sampler2D u_confidenceMask;
uniform float u_maxCategoryIndex;

void main() {
	vec2 uv = vec2(v_uv.x, 1.0 - v_uv.y);
	float normalizedCategoryIndex = texture(u_categoryMask, uv).r * 255.0 / u_maxCategoryIndex;
	float confidence = texture(u_confidenceMask, uv).r;
	outColor = vec4(confidence, normalizedCategoryIndex, 0.0, 1.0);
}`;
var sharedDetectors = /* @__PURE__ */ new Map();
function updateMask(detector, categoryMask, confidenceMasks) {
  const {
    outputConfidenceMasks,
    mask: { shader, confidence }
  } = detector;
  const { width, height } = categoryMask;
  if (confidence.width !== width || confidence.height !== height) {
    confidence.width = width;
    confidence.height = height;
    confidence.data = new Float32Array(width * height).fill(1);
  }
  if (outputConfidenceMasks && confidenceMasks?.length) {
    const categoryData = categoryMask.getAsUint8Array();
    const confidenceArrays = confidenceMasks.map((m) => m.getAsFloat32Array());
    const data = confidence.data;
    for (let i = 0; i < categoryData.length; ++i) {
      const categoryIndex = categoryData[i];
      data[i] = confidenceArrays[categoryIndex][i];
    }
  }
  shader.updateTextures({
    u_categoryMask: categoryMask.getAsWebGLTexture(),
    u_confidenceMask: confidence
  });
  shader.step();
  categoryMask.close();
  confidenceMasks?.forEach((m) => m.close());
}
function segmenter(config) {
  const { textureName, options: { history, ...mediapipeOptions } = {} } = config;
  const options = { ...DEFAULT_SEGMENTER_OPTIONS, ...mediapipeOptions };
  const optionsKey = hashOptions({ ...options, textureName });
  return function(shaderPad, context) {
    const { injectGLSL, emitHook, updateTexturesInternal } = context;
    const existingDetector = sharedDetectors.get(optionsKey);
    const mediapipeCanvas = existingDetector?.mask.canvas ?? new OffscreenCanvas(1, 1);
    let detector = null;
    let destroyed = false;
    let skipHistoryWrite = false;
    function onResult(singleHistoryWriteIndex) {
      if (!detector) return;
      let historyWriteIndex = singleHistoryWriteIndex;
      if (typeof historyWriteIndex === "undefined" && pendingBackfillSlots.length > 0) {
        historyWriteIndex = pendingBackfillSlots;
        pendingBackfillSlots = [];
      }
      updateTexturesInternal(
        { u_segmentMask: detector.mask.shader },
        history ? { skipHistoryWrite, historyWriteIndex } : void 0
      );
      emitHook("segmenter:result", detector.state.result);
    }
    async function initializeDetector() {
      if (sharedDetectors.has(optionsKey)) {
        detector = sharedDetectors.get(optionsKey);
      } else {
        const [mediaPipe, { ImageSegmenter }] = await Promise.all([
          getSharedFileset(),
          import("@mediapipe/tasks-vision")
        ]);
        if (destroyed) return;
        const imageSegmenter = await ImageSegmenter.createFromOptions(mediaPipe, {
          baseOptions: {
            modelAssetPath: options.modelPath,
            delegate: "GPU"
          },
          canvas: mediapipeCanvas,
          runningMode: "VIDEO",
          outputCategoryMask: true,
          outputConfidenceMasks: options.outputConfidenceMasks
        });
        if (destroyed) {
          imageSegmenter.close();
          return;
        }
        const maskShader = new index_default(MASK_SHADER_SOURCE, {
          canvas: mediapipeCanvas
        });
        maskShader.initializeTexture("u_categoryMask", dummyTexture);
        maskShader.initializeTexture("u_confidenceMask", dummyTextureFloat32, {
          format: "RED",
          internalFormat: "R32F",
          type: "FLOAT",
          minFilter: "NEAREST",
          magFilter: "NEAREST"
        });
        const numCategories = imageSegmenter.getLabels().length || 1;
        maskShader.initializeUniform("u_maxCategoryIndex", "float", Math.max(1, numCategories - 1));
        detector = {
          segmenter: imageSegmenter,
          outputConfidenceMasks: options.outputConfidenceMasks,
          subscribers: /* @__PURE__ */ new Map(),
          numCategories,
          state: {
            nCalls: 0,
            runningMode: "VIDEO",
            source: null,
            videoTime: -1,
            resultTimestamp: 0,
            result: null,
            pending: Promise.resolve()
          },
          mask: {
            canvas: mediapipeCanvas,
            shader: maskShader,
            confidence: {
              data: null,
              width: 0,
              height: 0
            }
          }
        };
        sharedDetectors.set(optionsKey, detector);
      }
      detector.subscribers.set(onResult, false);
    }
    const initPromise = initializeDetector();
    shaderPad.on("_init", () => {
      shaderPad.initializeUniform("u_numCategories", "int", 1, { allowMissing: true });
      shaderPad.initializeTexture("u_segmentMask", mediapipeCanvas, {
        minFilter: "NEAREST",
        magFilter: "NEAREST",
        history
      });
      initPromise.then(() => {
        if (destroyed || !detector) return;
        shaderPad.updateUniforms({ u_numCategories: detector.numCategories }, { allowMissing: true });
        emitHook("segmenter:ready");
      });
    });
    let historyWriteCounter = 0;
    let pendingBackfillSlots = [];
    const writeToHistory = () => {
      if (!history) return;
      onResult(historyWriteCounter);
      pendingBackfillSlots.push(historyWriteCounter);
      historyWriteCounter = (historyWriteCounter + 1) % (history + 1);
    };
    shaderPad.on("initializeTexture", (name, source) => {
      if (name === textureName && isMediaPipeSource(source)) {
        writeToHistory();
        detectSegments(source);
      }
    });
    shaderPad.on(
      "updateTextures",
      (updates, options2) => {
        const source = updates[textureName];
        if (isMediaPipeSource(source)) {
          skipHistoryWrite = options2?.skipHistoryWrite ?? false;
          if (!skipHistoryWrite) writeToHistory();
          detectSegments(source);
        }
      }
    );
    async function detectSegments(source) {
      const now = performance.now();
      await initPromise;
      if (!detector) return;
      const callOrder = ++detector.state.nCalls;
      detector.state.pending = detector.state.pending.then(async () => {
        if (!detector || callOrder !== detector.state.nCalls) return;
        const requiredMode = source instanceof HTMLVideoElement ? "VIDEO" : "IMAGE";
        if (detector.state.runningMode !== requiredMode) {
          detector.state.runningMode = requiredMode;
          await detector.segmenter.setOptions({
            runningMode: requiredMode
          });
        }
        let shouldDetect = false;
        if (source !== detector.state.source) {
          detector.state.source = source;
          detector.state.videoTime = -1;
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
            result = detector.segmenter.segmentForVideo(source, now);
          } else {
            if (source.width === 0 || source.height === 0) return;
            result = detector.segmenter.segment(source);
          }
          if (result) {
            detector.state.resultTimestamp = now;
            detector.state.result = result;
            if (result.categoryMask) {
              updateMask(detector, result.categoryMask, result.confidenceMasks);
            }
            for (const cb of detector.subscribers.keys()) {
              cb();
              detector.subscribers.set(cb, true);
            }
          }
        } else if (detector.state.result) {
          for (const [cb, hasCalled] of detector.subscribers.entries()) {
            if (!hasCalled) {
              cb();
              detector.subscribers.set(cb, true);
            }
          }
          detector.subscribers.set(onResult, true);
        }
      });
      await detector.state.pending;
    }
    shaderPad.on("destroy", () => {
      destroyed = true;
      if (detector) {
        detector.subscribers.delete(onResult);
        if (detector.subscribers.size === 0) {
          detector.segmenter.close();
          detector.mask.shader.destroy();
          sharedDetectors.delete(optionsKey);
        }
      }
      detector = null;
    });
    const { fn } = generateGLSLFn(history);
    const sampleMask = history ? `int layer = (u_segmentMaskFrameOffset - framesAgo + ${history + 1}) % ${history + 1};
	vec4 mask = texture(u_segmentMask, vec3(pos, float(layer)));` : `vec4 mask = texture(u_segmentMask, pos);`;
    injectGLSL(`
uniform mediump sampler2D${history ? "Array" : ""} u_segmentMask;${history ? `
uniform int u_segmentMaskFrameOffset;` : ""}
uniform int u_numCategories;

${fn(
      "vec2",
      "segmentAt",
      "vec2 pos",
      `${sampleMask}
	return vec2(mask.r, mask.g);`
    )}`);
  };
}
var segmenter_default = segmenter;
//# sourceMappingURL=segmenter.js.map