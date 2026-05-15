"use strict";
"use client";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/react.tsx
var react_exports = {};
__export(react_exports, {
  ShaderPad: () => ShaderPad2,
  default: () => react_default
});
module.exports = __toCommonJS(react_exports);
var import_react = require("react");

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
in vec2 a_position;out vec2 v_uv;void main(){gl_Position=vec4(a_position,0.,1.);v_uv=a_position*.5+.5;}`;
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
  isTouch = false;
  uniforms = /* @__PURE__ */ new Map();
  textures = /* @__PURE__ */ new Map();
  buffer = null;
  vao = null;
  program = null;
  listeners = /* @__PURE__ */ new Map();
  frame = 0;
  tElapsed = 0;
  tStart = NaN;
  cursorPos = [0.5, 0.5];
  clickPos = [0.5, 0.5];
  isClicked = false;
  resObserver = null;
  hooks = /* @__PURE__ */ new Map();
  historyDepth = 0;
  // WebGL can’t read from and write to the history texture at the same time.
  // We write to an intermediate texture then blit to the history texture.
  intermediateFbo = null;
  constructor(fragmentShaderSrc, { canvas, plugins, history, cursorTarget, ...texOptions } = {}) {
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
      throw true ? spError(0, {
        canvasType: this.canvas.constructor.name,
        isHeadless: this.isHeadless,
        canvasWidth: this.canvas.width,
        canvasHeight: this.canvas.height
      }) : spError(0);
    }
    this.gl = gl;
    this.typeArrays = /* @__PURE__ */ new Map([
      [gl.FLOAT, Float32Array],
      [gl.HALF_FLOAT, Uint16Array],
      [gl.UNSIGNED_SHORT, Uint16Array],
      [gl.SHORT, Int16Array],
      [gl.BYTE, Int8Array],
      [gl.UNSIGNED_INT, Uint32Array],
      [gl.INT, Int32Array]
    ]);
    this.typeFormats = /* @__PURE__ */ new Map([
      [gl.FLOAT, "RGBA32F"],
      [gl.HALF_FLOAT, "RGBA16F"],
      [gl.UNSIGNED_SHORT, "RGBA32UI"],
      [gl.SHORT, "RGBA32I"],
      [gl.BYTE, "RGBA32I"],
      [gl.UNSIGNED_INT, "RGBA32UI"],
      [gl.INT, "RGBA32I"]
    ]);
    this.uintTypes = /* @__PURE__ */ new Set([gl.UNSIGNED_BYTE, gl.UNSIGNED_SHORT, gl.UNSIGNED_INT]);
    let registryEntry = canvasRegistry.get(this.canvas);
    if (!registryEntry) {
      registryEntry = {
        texPool: {
          free: [],
          next: 0,
          max: gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS)
        },
        instances: /* @__PURE__ */ new Set([this])
      };
      canvasRegistry.set(this.canvas, registryEntry);
    }
    this.texPool = registryEntry.texPool;
    registryEntry.instances.add(this);
    this.texOptions = texOptions;
    if (history) this.historyDepth = history;
    this.cursorTgt = cursorTarget ?? (this.canvas instanceof HTMLCanvasElement ? this.canvas : void 0);
    this.frameId = null;
    const glslInjections = [];
    if (plugins) {
      plugins.forEach(
        (plugin) => plugin(this, {
          injectGLSL: (code) => {
            glslInjections.push(code);
          },
          emit: this.emit.bind(this),
          updateTexture: this.updateTex.bind(this)
        })
      );
    }
    const program = gl.createProgram();
    if (!program) {
      throw spError(1);
    }
    this.program = program;
    const vertexShader = this.createShader(gl.VERTEX_SHADER, DEFAULT_VERTEX_SHADER_SRC);
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
      const linkError = true ? spError(2, {
        programInfoLog: gl.getProgramInfoLog(program),
        fragmentShaderLength: fragmentShaderSrc.length,
        glslInjectionCount: glslInjections.length
      }) : spError(2);
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
      this.resObserver = new MutationObserver(() => this.syncRes());
      this.resObserver.observe(this.canvas, {
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
                instance.syncRes();
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
    this.syncRes();
    this.initializeUniform("u_cursor", "float", this.cursorPos, { allowMissing: true });
    this.initializeUniform("u_click", "float", [...this.clickPos, this.isClicked ? 1 : 0], {
      allowMissing: true
    });
    this.initializeUniform("u_time", "float", 0, { allowMissing: true });
    this.initializeUniform("u_frame", "int", 0, { allowMissing: true });
    this.initTex(INTERMEDIATE_TEXTURE_KEY, this.canvas, {
      ...this.texOptions
    });
    this.intermediateFbo = gl.createFramebuffer();
    this.bindIntermediate();
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    if (this.historyDepth > 0) {
      this.initTex(HISTORY_TEXTURE_KEY, this.canvas, {
        history: this.historyDepth,
        ...this.texOptions
      });
    }
    this.addListeners();
    this.emit("_init");
  }
  resolveGLConst(value) {
    const gl = this.gl;
    const resolved = gl[value];
    if (resolved === void 0) {
      throw true ? spError(3, { value }) : spError(3);
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
    const gl = this.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
      const compilationError = true ? spError(4, {
        shaderType: type === gl.VERTEX_SHADER ? "vertex" : "fragment",
        source
      }) : spError(4);
      gl.deleteShader(shader);
      throw compilationError;
    }
    return shader;
  }
  getCursorTgtRect() {
    const target = this.cursorTgt;
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
  addListeners() {
    if (!this.cursorTgt) return;
    const updateCursor = (x, y) => {
      if (!this.uniforms.has("u_cursor")) return;
      const rect = this.getCursorTgtRect();
      const u = (x - rect.left) / rect.width;
      const v = 1 - (y - rect.top) / rect.height;
      this.cursorPos[0] = Math.max(0, Math.min(1, u));
      this.cursorPos[1] = Math.max(0, Math.min(1, v));
      this.updateUniforms({ u_cursor: this.cursorPos });
    };
    const updateClick = (isClicked, x, y) => {
      if (!this.uniforms.has("u_click")) return;
      this.isClicked = isClicked;
      if (isClicked) {
        const rect = this.getCursorTgtRect();
        const xVal = x;
        const yVal = y;
        this.clickPos[0] = Math.max(0, Math.min(1, (xVal - rect.left) / rect.width));
        this.clickPos[1] = Math.max(0, Math.min(1, 1 - (yVal - rect.top) / rect.height));
      }
      this.updateUniforms({
        u_click: [...this.clickPos, this.isClicked ? 1 : 0]
      });
    };
    this.listeners.set("mousemove", (event) => {
      const mouseEvent = event;
      if (!this.isTouch) {
        updateCursor(mouseEvent.clientX, mouseEvent.clientY);
      }
    });
    this.listeners.set("mousedown", (event) => {
      const mouseEvent = event;
      if (!this.isTouch) {
        if (mouseEvent.button === 0) {
          this.isClicked = true;
          updateClick(true, mouseEvent.clientX, mouseEvent.clientY);
        }
      }
    });
    this.listeners.set("mouseup", (event) => {
      const mouseEvent = event;
      if (!this.isTouch) {
        if (mouseEvent.button === 0) {
          updateClick(false);
        }
      }
    });
    this.listeners.set("touchmove", (event) => {
      const touchEvent = event;
      if (touchEvent.touches.length > 0) {
        updateCursor(touchEvent.touches[0].clientX, touchEvent.touches[0].clientY);
      }
    });
    this.listeners.set("touchstart", (event) => {
      const touchEvent = event;
      this.isTouch = true;
      if (touchEvent.touches.length > 0) {
        updateCursor(touchEvent.touches[0].clientX, touchEvent.touches[0].clientY);
        updateClick(true, touchEvent.touches[0].clientX, touchEvent.touches[0].clientY);
      }
    });
    this.listeners.set("touchend", (event) => {
      const touchEvent = event;
      if (touchEvent.touches.length === 0) {
        updateClick(false);
      }
    });
    this.listeners.forEach((listener, event) => {
      this.cursorTgt.addEventListener(event, listener);
    });
  }
  syncRes() {
    const gl = this.gl;
    const resolution = [gl.drawingBufferWidth, gl.drawingBufferHeight];
    gl.viewport(0, 0, ...resolution);
    if (this.uniforms.has("u_resolution")) {
      this.updateUniforms({ u_resolution: resolution });
    } else {
      this.initializeUniform("u_resolution", "float", resolution, { allowMissing: true });
    }
    this.resizeTex(INTERMEDIATE_TEXTURE_KEY, ...resolution);
    if (this.historyDepth > 0) {
      this.resizeTex(HISTORY_TEXTURE_KEY, ...resolution);
    }
    this.emit("updateResolution", ...resolution);
  }
  resizeTex(name, width, height) {
    const info = this.textures.get(name);
    if (!info || info.width === width && info.height === height) return;
    const gl = this.gl;
    gl.deleteTexture(info.texture);
    info.width = width;
    info.height = height;
    const { texture } = this.createTex(name, info);
    info.texture = texture;
    this.resetHist(name, info);
  }
  reserveTex(name) {
    const existing = this.textures.get(name);
    if (existing) return existing.unitIndex;
    if (this.texPool.free.length > 0) return this.texPool.free.pop();
    if (this.texPool.next >= this.texPool.max) {
      throw true ? spError(5, {
        name: stringFrom(name),
        nextTextureUnit: this.texPool.next,
        maxTextureUnits: this.texPool.max,
        freeTextureUnits: this.texPool.free.length
      }) : spError(5);
    }
    return this.texPool.next++;
  }
  resolveTexOpts(options) {
    const { gl } = this;
    const internalFormatOption = options?.internalFormat;
    const typeString = options?.type ?? typeFromInternalFormatString(internalFormatOption) ?? "UNSIGNED_BYTE";
    const type = this.resolveGLConst(typeString);
    const internalFormatString = internalFormatOption ?? this.typeFormats.get(type) ?? "RGBA8";
    const isIntegerColorFormat = /^(R|RG|RGB|RGBA)(8|16|32)(UI|I)$/.test(internalFormatString);
    const formatString = options?.format ?? (isIntegerColorFormat ? "RGBA_INTEGER" : "RGBA");
    const result = {
      type,
      format: this.resolveGLConst(formatString),
      internalFormat: this.resolveGLConst(internalFormatString),
      minFilter: this.resolveGLConst(options?.minFilter ?? "LINEAR"),
      magFilter: this.resolveGLConst(options?.magFilter ?? "LINEAR"),
      wrapS: this.resolveGLConst(options?.wrapS ?? "CLAMP_TO_EDGE"),
      wrapT: this.resolveGLConst(options?.wrapT ?? "CLAMP_TO_EDGE"),
      colorSpace: options?.colorSpace,
      preserveY: options?.preserveY,
      isIntegerColorFormat
    };
    const isFloatColorFormat = result.internalFormat === gl.RGBA16F || result.internalFormat === gl.RGBA32F;
    if (isFloatColorFormat && !gl.getExtension("EXT_color_buffer_float")) {
      throw true ? spError(6, {
        internalFormat: internalFormatString,
        type: typeString
      }) : spError(6);
    }
    return result;
  }
  getPxArray(type, size) {
    const ArrayType = this.typeArrays.get(type) ?? Uint8Array;
    return new ArrayType(size);
  }
  isRgba(format) {
    const gl = this.gl;
    return format === gl.RGBA || format === gl.RGBA_INTEGER;
  }
  clearHistTexLayers(textureInfo) {
    if (!textureInfo.history) return;
    const gl = this.gl;
    const { type, format } = textureInfo.options;
    const transparent = this.getPxArray(type, textureInfo.width * textureInfo.height * 4);
    gl.activeTexture(gl.TEXTURE0 + textureInfo.unitIndex);
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, textureInfo.texture);
    const needsAlignmentFix = !this.isRgba(format);
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
  updateFrameOffset(name, frameOffset, options) {
    this.updateUniforms(
      {
        [`${stringFrom(name)}FrameOffset`]: frameOffset
      },
      options
    );
  }
  resetHist(name, textureInfo) {
    if (!textureInfo.history) return;
    textureInfo.history.writeIndex = 0;
    this.clearHistTexLayers(textureInfo);
    this.updateFrameOffset(name, 0, { allowMissing: true });
  }
  initializeUniform(name, type, value, options) {
    const arrayLength = options?.arrayLength;
    const allowMissing = options?.allowMissing ?? false;
    if (this.uniforms.has(name)) {
      throw true ? spError(7, { name, arrayLength: arrayLength ?? null }) : spError(7);
    }
    if (!UNIFORM_TYPE_SUFFIXES[type]) {
      throw true ? spError(8, {
        name,
        type,
        supportedTypes: Object.keys(UNIFORM_TYPE_SUFFIXES)
      }) : spError(8);
    }
    if (arrayLength && !(Array.isArray(value) && value.length === arrayLength)) {
      throw true ? spError(9, {
        name,
        expectedLength: arrayLength,
        receivedLength: Array.isArray(value) ? value.length : 1
      }) : spError(9);
    }
    const gl = this.gl;
    let location = gl.getUniformLocation(this.program, name);
    if (!location && arrayLength) {
      location = gl.getUniformLocation(this.program, `${name}[0]`);
    }
    if (!location) {
      if (allowMissing) return;
      throw true ? spError(19, { name, arrayLength: arrayLength ?? null }) : spError(19);
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
  _updateUniforms(updates, options) {
    const gl = this.gl;
    gl.useProgram(this.program);
    Object.entries(updates).forEach(([name, newValue]) => {
      const uniform = this.uniforms.get(name);
      if (!uniform) {
        if (options?.allowMissing) return;
        throw true ? spError(20, {
          name,
          startIndex: options?.startIndex ?? null
        }) : spError(20);
      }
      let glFunctionName = `uniform${uniform.length}${UNIFORM_TYPE_SUFFIXES[uniform.type]}`;
      if (uniform.arrayLength) {
        if (!Array.isArray(newValue)) {
          throw true ? spError(10, {
            name,
            receivedType: typeof newValue
          }) : spError(10);
        }
        const nValues = newValue.length;
        if (!nValues) return;
        if (nValues > uniform.arrayLength) {
          throw true ? spError(11, {
            name,
            receivedLength: nValues,
            maxLength: uniform.arrayLength
          }) : spError(11);
        }
        if (newValue.some((item) => (Array.isArray(item) ? item.length : 1) !== uniform.length)) {
          throw true ? spError(12, {
            name,
            expectedElementLength: uniform.length
          }) : spError(12);
        }
        const flat = newValue.flat();
        const typedArray = uniform.type === "float" ? new Float32Array(flat) : uniform.type === "uint" ? new Uint32Array(flat) : new Int32Array(flat);
        let location = uniform.location;
        if (options?.startIndex) {
          const newLocation = gl.getUniformLocation(this.program, `${name}[${options.startIndex}]`);
          if (!newLocation) {
            throw true ? spError(13, {
              name,
              startIndex: options.startIndex,
              arrayLength: uniform.arrayLength
            }) : spError(13);
          }
          location = newLocation;
        }
        gl[glFunctionName + "v"](location, typedArray);
      } else {
        if (!Array.isArray(newValue)) newValue = [newValue];
        const scalarValue = newValue;
        if (scalarValue.length !== uniform.length) {
          throw true ? spError(14, {
            name,
            receivedLength: scalarValue.length,
            expectedLength: uniform.length
          }) : spError(14);
        }
        gl[glFunctionName](uniform.location, ...scalarValue);
      }
    });
    this.emit("updateUniforms", ...arguments);
  }
  updateUniforms(updates, options) {
    this._updateUniforms(updates, options);
    if (typeof updates.u_time === "number") {
      this.tElapsed = updates.u_time;
      if (!isNaN(this.tStart)) this.tStart = performance.now();
    }
    if (typeof updates.u_frame === "number") this.frame = updates.u_frame;
  }
  createTex(name, textureInfo) {
    const gl = this.gl;
    const { width, height } = textureInfo;
    const historyDepth = textureInfo.history?.depth ?? 0;
    const texture = gl.createTexture();
    if (!texture) {
      throw true ? spError(15, {
        name: stringFrom(name),
        width,
        height,
        historyDepth
      }) : spError(15);
    }
    let unitIndex = textureInfo.unitIndex;
    if (typeof unitIndex !== "number") {
      try {
        unitIndex = this.reserveTex(name);
      } catch (error) {
        gl.deleteTexture(texture);
        throw error;
      }
    }
    const hasHistory = historyDepth > 0;
    const textureTarget = hasHistory ? gl.TEXTURE_2D_ARRAY : gl.TEXTURE_2D;
    const { options } = textureInfo;
    gl.activeTexture(gl.TEXTURE0 + unitIndex);
    gl.bindTexture(textureTarget, texture);
    gl.texParameteri(textureTarget, gl.TEXTURE_WRAP_S, options.wrapS);
    gl.texParameteri(textureTarget, gl.TEXTURE_WRAP_T, options.wrapT);
    gl.texParameteri(textureTarget, gl.TEXTURE_MIN_FILTER, options.minFilter);
    gl.texParameteri(textureTarget, gl.TEXTURE_MAG_FILTER, options.magFilter);
    if (hasHistory) {
      gl.texStorage3D(textureTarget, 1, options.internalFormat, width, height, historyDepth);
    } else if (name === INTERMEDIATE_TEXTURE_KEY) {
      gl.texImage2D(
        gl.TEXTURE_2D,
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
  initTex(name, source, options) {
    const gl = this.gl;
    if (this.textures.has(name)) {
      throw true ? spError(16, { name: stringFrom(name) }) : spError(16);
    }
    const { history: historyDepth = 0, ...texOptions } = options ?? {};
    const { width, height } = getSourceDimensions(source);
    if (!width || !height) {
      throw true ? spError(17, {
        name: stringFrom(name),
        width,
        height,
        sourceType: source.constructor.name
      }) : spError(17);
    }
    const textureInfo = {
      width,
      height,
      options: source instanceof _ShaderPad && Object.keys(texOptions).length === 0 && source.textures.has(INTERMEDIATE_TEXTURE_KEY) ? source.textures.get(INTERMEDIATE_TEXTURE_KEY).options : this.resolveTexOpts(texOptions)
    };
    if (historyDepth > 0) {
      textureInfo.history = { depth: historyDepth, writeIndex: 0 };
    }
    const { texture, unitIndex } = this.createTex(name, textureInfo);
    const completeTextureInfo = {
      texture,
      unitIndex,
      ...textureInfo
    };
    if (historyDepth > 0) {
      this.initializeUniform(`${stringFrom(name)}FrameOffset`, "int", 0, { allowMissing: true });
      this.clearHistTexLayers(completeTextureInfo);
    }
    this.textures.set(name, completeTextureInfo);
    if (name !== INTERMEDIATE_TEXTURE_KEY && name !== HISTORY_TEXTURE_KEY) {
      this.updateTex(name, source);
    }
    gl.useProgram(this.program);
    const uSampler = gl.getUniformLocation(this.program, stringFrom(name));
    if (uSampler) {
      gl.uniform1i(uSampler, unitIndex);
    }
  }
  initializeTexture(name, source, options) {
    const opts = options?.history != null && options.history > 0 ? { ...options, history: options.history + 1 } : options;
    this.initTex(name, source, opts);
    this.emit("initializeTexture", ...arguments);
  }
  updateTextures(updates) {
    Object.entries(updates).forEach(([name, source]) => {
      this.updateTex(name, source);
    });
    this.emit("updateTextures", ...arguments);
  }
  updateTex(name, source, historySlots) {
    const gl = this.gl;
    const info = this.textures.get(name);
    if (!info) {
      throw true ? spError(18, { name: stringFrom(name) }) : spError(18);
    }
    if (source instanceof WebGLTexture) {
      gl.activeTexture(gl.TEXTURE0 + info.unitIndex);
      gl.bindTexture(gl.TEXTURE_2D, source);
      return;
    }
    let nonShaderPadSource = source;
    if (source instanceof _ShaderPad) {
      const sourceIntermediateInfo = source.textures.get(INTERMEDIATE_TEXTURE_KEY);
      const srcW = sourceIntermediateInfo.width;
      const srcH = sourceIntermediateInfo.height;
      if (source.gl === gl) {
        if (!info.history) {
          gl.activeTexture(gl.TEXTURE0 + info.unitIndex);
          gl.bindTexture(gl.TEXTURE_2D, sourceIntermediateInfo.texture);
          return;
        }
        const { depth } = info.history;
        const targetSlots = historySlots === void 0 ? [info.history.writeIndex] : Array.isArray(historySlots) ? historySlots.map((i) => safeMod(i, depth)) : [safeMod(historySlots, depth)];
        gl.activeTexture(gl.TEXTURE0 + info.unitIndex);
        gl.bindTexture(gl.TEXTURE_2D_ARRAY, info.texture);
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, source.intermediateFbo);
        for (const slot of targetSlots) {
          gl.copyTexSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, slot, 0, 0, srcW, srcH);
        }
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
        this.updateFrameOffset(name, targetSlots[targetSlots.length - 1], { allowMissing: true });
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
      const pixels = this.getPxArray(type, width2 * height2 * 4);
      source.gl.bindFramebuffer(source.gl.FRAMEBUFFER, source.intermediateFbo);
      source.gl.readPixels(0, 0, width2, height2, format, type, pixels);
      source.gl.bindFramebuffer(source.gl.FRAMEBUFFER, null);
      nonShaderPadSource = { data: pixels, width: width2, height: height2 };
    }
    const { width, height } = getSourceDimensions(nonShaderPadSource);
    if (!width || !height) return;
    const isPartial = "isPartial" in nonShaderPadSource && nonShaderPadSource.isPartial;
    if (!isPartial) {
      this.resizeTex(name, width, height);
    }
    const isCustomTexture = "data" in nonShaderPadSource && nonShaderPadSource.data;
    const shouldFlipY = !isCustomTexture && !info.options?.preserveY;
    const previousFlipY = gl.getParameter(gl.UNPACK_FLIP_Y_WEBGL);
    const needsAlignmentFix = isCustomTexture && !this.isRgba(info.options.format);
    const shouldConvertColorSpace = !isCustomTexture && info.options.colorSpace && "unpackColorSpace" in gl;
    const previousColorSpace = gl.unpackColorSpace;
    let previousAlignment;
    if (needsAlignmentFix) {
      previousAlignment = gl.getParameter(gl.UNPACK_ALIGNMENT);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    }
    if (shouldConvertColorSpace) gl.unpackColorSpace = info.options.colorSpace;
    if (info.history) {
      gl.activeTexture(gl.TEXTURE0 + info.unitIndex);
      gl.bindTexture(gl.TEXTURE_2D_ARRAY, info.texture);
      const { depth } = info.history;
      const targetSlots = historySlots === void 0 ? [info.history.writeIndex] : Array.isArray(historySlots) ? historySlots.map((i) => safeMod(i, depth)) : [safeMod(historySlots, depth)];
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, shouldFlipY);
      const partialSource = nonShaderPadSource;
      const sourceData = partialSource.data ?? nonShaderPadSource;
      const xOffset = isPartial ? partialSource.x ?? 0 : 0;
      const yOffset = isPartial ? partialSource.y ?? 0 : 0;
      for (const slot of targetSlots) {
        gl.texSubImage3D(
          gl.TEXTURE_2D_ARRAY,
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
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, previousFlipY);
      this.updateFrameOffset(name, targetSlots[targetSlots.length - 1]);
      if (historySlots === void 0) {
        info.history.writeIndex = (info.history.writeIndex + 1) % depth;
      }
    } else {
      gl.activeTexture(gl.TEXTURE0 + info.unitIndex);
      gl.bindTexture(gl.TEXTURE_2D, info.texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, shouldFlipY);
      if (isPartial) {
        const partialSource = nonShaderPadSource;
        gl.texSubImage2D(
          gl.TEXTURE_2D,
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
        gl.texImage2D(
          gl.TEXTURE_2D,
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
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, previousFlipY);
    }
    if (shouldConvertColorSpace) gl.unpackColorSpace = previousColorSpace;
    if (needsAlignmentFix) gl.pixelStorei(gl.UNPACK_ALIGNMENT, previousAlignment);
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
      if (this.uintTypes.has(t)) {
        gl.clearBufferuiv(gl.COLOR, 0, new Uint32Array(4));
      } else {
        gl.clearBufferiv(gl.COLOR, 0, new Int32Array(4));
      }
    } else {
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
  }
  clearHistory() {
    this.textures.forEach((texture, name) => {
      this.resetHist(name, texture);
    });
  }
  draw(options) {
    this.emit("preDraw", ...arguments);
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
        const desiredColorSpace = intermediateInfo.options.colorSpace ?? "srgb";
        if ("drawingBufferColorSpace" in gl && gl.drawingBufferColorSpace !== desiredColorSpace) {
          gl.drawingBufferColorSpace = desiredColorSpace;
        }
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.intermediateFbo);
        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
        gl.blitFramebuffer(0, 0, w, h, 0, 0, w, h, gl.COLOR_BUFFER_BIT, gl.NEAREST);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      }
    }
    this.emit("postDraw", ...arguments);
  }
  step(options) {
    this._step(performance.now(), options);
  }
  tick() {
    const updates = {};
    if (this.uniforms.has("u_time")) updates.u_time = this.tElapsed;
    if (this.uniforms.has("u_frame")) updates.u_frame = this.frame;
    if (Object.keys(updates).length) this._updateUniforms(updates);
  }
  _step(now, opts) {
    const t = this.getElapsed(now);
    this.tElapsed = t;
    this.tStart = now;
    const options = typeof opts === "function" ? opts(t, this.frame) : opts;
    this.emit("preStep", t, this.frame, options);
    this.tick();
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
      this.updateFrameOffset(HISTORY_TEXTURE_KEY, nextWriteIndex, { allowMissing: true });
      historyInfo.history.writeIndex = nextWriteIndex;
    }
    ++this.frame;
    this.emit("postStep", t, this.frame, options);
  }
  play(onPreStep) {
    this._pause();
    const loop = (now) => {
      this._step(now, onPreStep);
      if (this.frameId != null) this.frameId = requestAnimationFrame(loop);
    };
    this.frameId = requestAnimationFrame(loop);
    this.emit("play");
  }
  getElapsed(time) {
    if (isNaN(this.tStart)) return this.tElapsed;
    return this.tElapsed + (time - this.tStart) / 1e3;
  }
  _pause() {
    if (isNaN(this.tStart) && this.frameId == null) return;
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
    this.tElapsed = this.getElapsed(performance.now());
    this.tStart = NaN;
    return true;
  }
  pause() {
    if (this._pause()) this.emit("pause");
  }
  rewind() {
    this.frame = 0;
    this.tElapsed = 0;
    this.tStart = NaN;
    this.tick();
  }
  reset() {
    this.rewind();
    this.clearHistory();
    this.clear();
    this.emit("reset");
  }
  destroy() {
    this.emit("destroy");
    this._pause();
    const gl = this.gl;
    if (this.cursorTgt) {
      this.listeners.forEach((listener, event) => {
        this.cursorTgt.removeEventListener(event, listener);
      });
      this.listeners.clear();
    }
    if (this.resObserver) {
      this.resObserver.disconnect();
      this.resObserver = null;
    }
    if (this.program) {
      gl.deleteProgram(this.program);
      this.program = null;
    }
    if (this.intermediateFbo) {
      gl.deleteFramebuffer(this.intermediateFbo);
      this.intermediateFbo = null;
    }
    this.textures.forEach((texture) => {
      this.texPool.free.push(texture.unitIndex);
      gl.deleteTexture(texture.texture);
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
      gl.deleteVertexArray(this.vao);
      this.vao = null;
    }
    if (this.buffer) {
      gl.deleteBuffer(this.buffer);
      this.buffer = null;
    }
    this.uniforms.clear();
    this.hooks.clear();
  }
};
var index_default = ShaderPad;

// src/internal/autoplay.ts
function isElementInViewport(element) {
  const view = element.ownerDocument.defaultView ?? window;
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.right > 0 && rect.top < view.innerHeight && rect.left < view.innerWidth;
}
function createPlaybackVisibilityController({
  target,
  autoplay,
  autopause,
  isPlaying,
  play,
  pause,
  onVisibilityChange
}) {
  const documentRef = target.ownerDocument;
  let currentAutoplay = autoplay;
  let currentAutopause = autopause;
  let isDocumentVisible = documentRef.visibilityState === "visible";
  let isIntersecting = isElementInViewport(target);
  let isManagedPlayback = false;
  let lastVisible = null;
  const getIsVisible = () => isDocumentVisible && (typeof IntersectionObserver === "function" ? isIntersecting : isElementInViewport(target)) && target.isConnected;
  const sync = () => {
    const isVisible = getIsVisible();
    if (lastVisible !== isVisible) {
      lastVisible = isVisible;
      onVisibilityChange?.(isVisible);
    }
    if (!currentAutoplay) {
      if (isManagedPlayback && isPlaying()) {
        pause();
      }
      isManagedPlayback = false;
      return;
    }
    if (!currentAutopause || isVisible) {
      if (!isPlaying()) {
        play();
      }
      isManagedPlayback = true;
      return;
    }
    if (isManagedPlayback && isPlaying()) {
      pause();
    }
    isManagedPlayback = false;
  };
  const handleVisibilityChange = () => {
    isDocumentVisible = documentRef.visibilityState === "visible";
    sync();
  };
  documentRef.addEventListener("visibilitychange", handleVisibilityChange);
  const intersectionObserver = typeof IntersectionObserver === "function" ? new IntersectionObserver((entries) => {
    isIntersecting = entries.some((entry) => entry.isIntersecting);
    sync();
  }) : null;
  intersectionObserver?.observe(target);
  return {
    sync,
    update(options) {
      currentAutoplay = options.autoplay;
      currentAutopause = options.autopause;
      sync();
    },
    destroy() {
      intersectionObserver?.disconnect();
      documentRef.removeEventListener("visibilitychange", handleVisibilityChange);
    }
  };
}

// src/internal/declarative-textures.ts
var TEXTURE_OPTION_ATTRIBUTES = [
  ["internal-format", "internalFormat"],
  ["format", "format"],
  ["type", "type"],
  ["min-filter", "minFilter"],
  ["mag-filter", "magFilter"],
  ["wrap-s", "wrapS"],
  ["wrap-t", "wrapT"],
  ["color-space", "colorSpace"]
];
function stringFromAttribute(value) {
  if (value == null || value === false) return void 0;
  return String(value);
}
function parseBooleanLikeValue(value, defaultValue) {
  if (value == null) return defaultValue;
  if (typeof value === "boolean") return value;
  switch (String(value).trim().toLowerCase()) {
    case "false":
    case "0":
    case "no":
    case "off":
      return false;
    default:
      return true;
  }
}
function parseTextureOptionsFromAttributes(readAttribute, prefix = "") {
  const options = {};
  const historyValue = stringFromAttribute(readAttribute(`${prefix}history`));
  if (historyValue != null) {
    const parsed = Number.parseInt(historyValue, 10);
    if (Number.isFinite(parsed) && parsed >= 0) options.history = parsed;
  }
  const preserveYValue = readAttribute(`${prefix}preserve-y`);
  if (preserveYValue != null) {
    options.preserveY = parseBooleanLikeValue(preserveYValue, true);
  }
  for (const [attribute, option] of TEXTURE_OPTION_ATTRIBUTES) {
    const value = stringFromAttribute(readAttribute(`${prefix}${attribute}`));
    if (value) options[option] = value;
  }
  return options;
}
function parseTextureOptions(element, prefix = "") {
  return parseTextureOptionsFromAttributes((name) => element.getAttribute(name), prefix);
}
function isDomTextureElement(element) {
  return element instanceof HTMLImageElement || element instanceof HTMLVideoElement || element instanceof HTMLCanvasElement;
}
function isLiveDomTextureElement(element) {
  return !(element instanceof HTMLImageElement);
}
function onceEvent(target, type) {
  const options = { once: true };
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      target.removeEventListener(type, onResolve);
      target.removeEventListener("error", onReject);
    };
    const onResolve = (event) => {
      cleanup();
      resolve(event);
    };
    const onReject = (event) => {
      cleanup();
      reject(event);
    };
    target.addEventListener(type, onResolve, options);
    target.addEventListener("error", onReject, options);
  });
}
async function loadImageSource(image) {
  if (image.complete && image.naturalWidth > 0 && image.naturalHeight > 0) return image;
  await onceEvent(image, "load");
  return image;
}
async function loadVideoSource(video) {
  if (video.videoWidth > 0 && video.videoHeight > 0) return video;
  await onceEvent(video, "loadedmetadata");
  return video;
}
async function loadDomTextureSource(element) {
  if (element instanceof HTMLImageElement) return loadImageSource(element);
  if (element instanceof HTMLVideoElement) return loadVideoSource(element);
  if (element.width <= 0 || element.height <= 0) {
    throw new Error("Texture canvas elements must have a positive width and height.");
  }
  return element;
}
function getLiveDomTextureSource(element) {
  if (element instanceof HTMLVideoElement) {
    return element.videoWidth > 0 && element.videoHeight > 0 ? element : void 0;
  }
  if (element instanceof HTMLCanvasElement) {
    return element.width > 0 && element.height > 0 ? element : void 0;
  }
  return void 0;
}
function addDomTextureRefreshListener(element, listener) {
  if (element instanceof HTMLImageElement) {
    element.addEventListener("load", listener);
    return () => element.removeEventListener("load", listener);
  }
  if (element instanceof HTMLVideoElement) {
    element.addEventListener("loadedmetadata", listener);
    return () => element.removeEventListener("loadedmetadata", listener);
  }
  return void 0;
}

// src/plugins/autosize.ts
var THROTTLE_INTERVAL_DEFAULT = 1e3 / 30;
function autosize(options = {}) {
  return function(shaderPad, context) {
    const { emit } = context;
    const { canvas } = shaderPad;
    const {
      scale = window.devicePixelRatio || 1,
      target = canvas instanceof HTMLCanvasElement ? canvas : window,
      throttle = THROTTLE_INTERVAL_DEFAULT
    } = options;
    let resizeTimeout = null;
    let lastResizeTime = -Infinity;
    function throttledHandleResize() {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      const now = performance.now();
      const timeUntilNextResize = lastResizeTime + throttle - now;
      if (timeUntilNextResize <= 0) {
        lastResizeTime = now;
        handleResize();
      } else {
        resizeTimeout = setTimeout(() => throttledHandleResize(), timeUntilNextResize);
      }
    }
    function handleResize() {
      let width, height;
      if (target instanceof Window) {
        width = window.innerWidth * scale;
        height = window.innerHeight * scale;
      } else {
        width = target.clientWidth * scale;
        height = target.clientHeight * scale;
      }
      width = Math.max(1, Math.round(width));
      height = Math.max(1, Math.round(height));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        emit("autosize:resize", width, height);
      }
    }
    handleResize();
    let resizeObserver = null;
    if (target instanceof Window) {
      window.addEventListener("resize", throttledHandleResize);
    } else if (target instanceof Element) {
      resizeObserver = new ResizeObserver(() => throttledHandleResize());
      resizeObserver.observe(target);
    }
    shaderPad.on("destroy", () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      if (resizeObserver) resizeObserver.disconnect();
      if (target instanceof Window) {
        window.removeEventListener("resize", throttledHandleResize);
      }
    });
  };
}
var autosize_default = autosize;

// src/react.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var ShaderPadTextureContext = (0, import_react.createContext)(null);
var useClientLayoutEffect = typeof window === "undefined" ? import_react.useEffect : import_react.useLayoutEffect;
function isRefTarget(target) {
  return Boolean(target && typeof target === "object" && "current" in target);
}
function resolveCursorTarget(target) {
  if (isRefTarget(target)) {
    return target.current ?? void 0;
  }
  return target;
}
function queueUnhandledError(error) {
  queueMicrotask(() => {
    throw error;
  });
}
var ShaderPad2 = (0, import_react.forwardRef)(function ShaderPad3({
  shader,
  children,
  plugins,
  options,
  autosize: autosize2 = true,
  cursorTarget,
  autoplay = true,
  autopause = true,
  onInit,
  onPreStep,
  onError,
  style,
  "data-texture": textureNameValue,
  "data-texture-history": textureHistory,
  "data-texture-preserve-y": texturePreserveY,
  "data-texture-internal-format": textureInternalFormat,
  "data-texture-format": textureFormat,
  "data-texture-type": textureType,
  "data-texture-min-filter": textureMinFilter,
  "data-texture-mag-filter": textureMagFilter,
  "data-texture-wrap-s": textureWrapS,
  "data-texture-wrap-t": textureWrapT,
  ...canvasProps
}, ref) {
  const parentTextureRegistry = (0, import_react.useContext)(ShaderPadTextureContext);
  const canvasRef = (0, import_react.useRef)(null);
  const textureHostRef = (0, import_react.useRef)(null);
  const shaderRef = (0, import_react.useRef)(null);
  const liveTexturesRef = (0, import_react.useRef)([]);
  const playbackControllerRef = (0, import_react.useRef)(null);
  const destroyedShadersRef = (0, import_react.useRef)(/* @__PURE__ */ new WeakSet());
  const readyWaitersRef = (0, import_react.useRef)([]);
  const nestedTextureListenersRef = (0, import_react.useRef)(/* @__PURE__ */ new Set());
  const nestedTextureRegistrationsRef = (0, import_react.useRef)(/* @__PURE__ */ new Map());
  const nestedTextureNameRef = (0, import_react.useRef)(void 0);
  const nestedTextureOptionsRef = (0, import_react.useRef)({});
  const nestedTextureRegistrationRef = (0, import_react.useRef)(null);
  const textureRegistryRef = (0, import_react.useRef)(null);
  const onInitRef = (0, import_react.useRef)(onInit);
  const onPreStepRef = (0, import_react.useRef)(onPreStep);
  const onErrorRef = (0, import_react.useRef)(onError);
  const autoplayRef = (0, import_react.useRef)(autoplay);
  const autopauseRef = (0, import_react.useRef)(autopause);
  const [cursorTargetVersion, setCursorTargetVersion] = (0, import_react.useState)(0);
  const nestedTextureName = textureNameValue?.trim() || void 0;
  const isManagedTexture = Boolean(parentTextureRegistry && nestedTextureName);
  const nestedTextureAttributes = {
    "data-texture-history": textureHistory,
    "data-texture-preserve-y": texturePreserveY,
    "data-texture-internal-format": textureInternalFormat,
    "data-texture-format": textureFormat,
    "data-texture-type": textureType,
    "data-texture-min-filter": textureMinFilter,
    "data-texture-mag-filter": textureMagFilter,
    "data-texture-wrap-s": textureWrapS,
    "data-texture-wrap-t": textureWrapT
  };
  nestedTextureNameRef.current = nestedTextureName;
  nestedTextureOptionsRef.current = parseTextureOptionsFromAttributes(
    (name) => nestedTextureAttributes[name],
    "data-texture-"
  );
  onInitRef.current = onInit;
  onPreStepRef.current = onPreStep;
  onErrorRef.current = onError;
  autoplayRef.current = autoplay;
  autopauseRef.current = autopause;
  if (!nestedTextureRegistrationRef.current) {
    nestedTextureRegistrationRef.current = {
      id: /* @__PURE__ */ Symbol("ShaderPad texture"),
      get name() {
        return nestedTextureNameRef.current ?? "";
      },
      get options() {
        return nestedTextureOptionsRef.current;
      },
      waitForShader() {
        if (shaderRef.current) return Promise.resolve(shaderRef.current);
        return new Promise((resolve, reject) => {
          readyWaitersRef.current.push({ resolve, reject });
        });
      },
      getShader() {
        return shaderRef.current;
      },
      step() {
        const shaderInstance = shaderRef.current;
        if (shaderInstance) managedStepShader(shaderInstance);
      },
      draw() {
        const shaderInstance = shaderRef.current;
        if (shaderInstance) drawShader(shaderInstance);
      },
      pause() {
        const shaderInstance = shaderRef.current;
        if (shaderInstance) pauseShader(shaderInstance);
      },
      subscribe(listener) {
        nestedTextureListenersRef.current.add(listener);
        return () => nestedTextureListenersRef.current.delete(listener);
      }
    };
  }
  if (!textureRegistryRef.current) {
    textureRegistryRef.current = {
      getCanvas: () => canvasRef.current,
      register(registration) {
        nestedTextureRegistrationsRef.current.set(registration.id, registration);
        return () => {
          if (nestedTextureRegistrationsRef.current.get(registration.id) === registration) {
            nestedTextureRegistrationsRef.current.delete(registration.id);
          }
        };
      }
    };
  }
  function resolveReadyWaiters(shaderInstance) {
    const waiters = readyWaitersRef.current.splice(0);
    for (const waiter of waiters) waiter.resolve(shaderInstance);
    for (const listener of nestedTextureListenersRef.current) listener(shaderInstance);
  }
  function rejectReadyWaiters(error) {
    const waiters = readyWaitersRef.current.splice(0);
    for (const waiter of waiters) waiter.reject(error);
  }
  function destroyShader(shaderInstance) {
    if (!shaderInstance || destroyedShadersRef.current.has(shaderInstance)) {
      return;
    }
    destroyedShadersRef.current.add(shaderInstance);
    if (shaderRef.current === shaderInstance) {
      shaderRef.current = null;
    }
    shaderInstance.destroy();
  }
  function destroyCurrentInstance() {
    playbackControllerRef.current?.destroy();
    playbackControllerRef.current = null;
    liveTexturesRef.current = [];
    destroyShader(shaderRef.current);
    rejectReadyWaiters(new Error("ShaderPad was destroyed before initialization completed."));
  }
  function updateLiveTextures(shaderInstance, nestedRenderMode) {
    if (liveTexturesRef.current.length === 0) return;
    const updates = {};
    for (const binding of liveTexturesRef.current) {
      if (binding.kind === "dom") {
        const source = getLiveDomTextureSource(binding.element);
        if (source) updates[binding.name] = source;
        continue;
      }
      const nestedShader = binding.registration.getShader();
      if (!nestedShader) continue;
      if (nestedRenderMode === "step") {
        binding.registration.step();
      } else if (nestedRenderMode === "draw") {
        binding.registration.draw();
      }
      updates[binding.name] = nestedShader;
    }
    if (Object.keys(updates).length > 0) shaderInstance.updateTextures(updates);
  }
  function pauseManagedTextures() {
    for (const binding of liveTexturesRef.current) {
      if (binding.kind === "nested") binding.registration.pause();
    }
  }
  function playShader(shaderInstance) {
    shaderInstance.play(() => onPreStepRef.current ? {} : void 0);
  }
  function pauseShader(shaderInstance) {
    shaderInstance.pause();
    pauseManagedTextures();
  }
  function managedStepShader(shaderInstance) {
    shaderInstance.step(onPreStepRef.current ? {} : void 0);
  }
  function stepShader(shaderInstance, stepOptions) {
    shaderInstance.step(stepOptions ? { ...stepOptions } : onPreStepRef.current ? {} : void 0);
  }
  function drawShader(shaderInstance, stepOptions) {
    updateLiveTextures(shaderInstance, "draw");
    shaderInstance.draw(stepOptions);
  }
  (0, import_react.useImperativeHandle)(
    ref,
    () => ({
      get shader() {
        return shaderRef.current;
      },
      get canvas() {
        return canvasRef.current;
      },
      play() {
        const shaderInstance = shaderRef.current;
        if (shaderInstance) {
          playShader(shaderInstance);
        }
      },
      pause() {
        const shaderInstance = shaderRef.current;
        if (shaderInstance) pauseShader(shaderInstance);
      },
      step(stepOptions) {
        const shaderInstance = shaderRef.current;
        if (shaderInstance) stepShader(shaderInstance, stepOptions);
      },
      draw(stepOptions) {
        const shaderInstance = shaderRef.current;
        if (shaderInstance) drawShader(shaderInstance, stepOptions);
      },
      clear() {
        shaderRef.current?.clear();
      },
      clearHistory() {
        shaderRef.current?.clearHistory();
      },
      rewind() {
        shaderRef.current?.rewind();
      },
      reset() {
        shaderRef.current?.reset();
      },
      destroy() {
        destroyCurrentInstance();
      }
    }),
    []
  );
  useClientLayoutEffect(() => {
    if (!parentTextureRegistry || !nestedTextureName) return;
    return parentTextureRegistry.register(nestedTextureRegistrationRef.current);
  }, [parentTextureRegistry, nestedTextureName]);
  (0, import_react.useEffect)(() => {
    if (!isRefTarget(cursorTarget) || cursorTarget.current) {
      return;
    }
    let frameId = null;
    let isDisposed = false;
    const poll = () => {
      if (isDisposed) {
        return;
      }
      if (cursorTarget.current) {
        setCursorTargetVersion((version) => version + 1);
        return;
      }
      frameId = requestAnimationFrame(poll);
    };
    frameId = requestAnimationFrame(poll);
    return () => {
      isDisposed = true;
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [cursorTarget]);
  (0, import_react.useEffect)(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const resolvedCursorTarget = resolveCursorTarget(cursorTarget);
    if (isRefTarget(cursorTarget) && !resolvedCursorTarget) {
      return;
    }
    const effectiveAutosize = isManagedTexture && autosize2 === true ? { target: parentTextureRegistry?.getCanvas() ?? canvas } : autosize2;
    const installedPlugins = effectiveAutosize === false ? [...plugins ?? []] : [autosize_default(effectiveAutosize === true ? void 0 : effectiveAutosize), ...plugins ?? []];
    let instance = null;
    let playbackController = null;
    let isDisposed = false;
    let isPlaying = false;
    const cleanupCallbacks = [];
    const handlePlay = () => {
      isPlaying = true;
    };
    const handlePause = () => {
      isPlaying = false;
    };
    const handlePreStep = (time, frame, stepOptions) => {
      if (!instance) return;
      updateLiveTextures(instance, "step");
      const nextOptions = onPreStepRef.current?.(instance, time, frame);
      if (nextOptions && stepOptions) {
        Object.assign(stepOptions, nextOptions);
      }
    };
    const cleanupInstance = () => {
      if (playbackControllerRef.current === playbackController) {
        playbackControllerRef.current = null;
      }
      playbackController?.destroy();
      for (const cleanup of cleanupCallbacks.splice(0)) cleanup();
      liveTexturesRef.current = [];
      if (instance) {
        instance.off("play", handlePlay);
        instance.off("pause", handlePause);
        instance.off("preStep", handlePreStep);
      }
      destroyShader(instance);
    };
    const handleSetupError = (error) => {
      cleanupInstance();
      rejectReadyWaiters(error);
      if (onErrorRef.current) {
        onErrorRef.current(error);
        return;
      }
      queueUnhandledError(error);
    };
    const initialize = async () => {
      try {
        instance = new index_default(shader, {
          ...options,
          canvas,
          plugins: installedPlugins,
          ...resolvedCursorTarget ? { cursorTarget: resolvedCursorTarget } : {}
        });
        instance.on("play", handlePlay);
        instance.on("pause", handlePause);
        instance.on("preStep", handlePreStep);
        const domTextureBindings = [];
        for (const child of Array.from(textureHostRef.current?.children ?? [])) {
          const name = child.getAttribute("data-texture");
          if (!name || !isDomTextureElement(child)) continue;
          domTextureBindings.push({
            kind: "dom",
            element: child,
            name,
            options: parseTextureOptions(child, "data-texture-"),
            live: isLiveDomTextureElement(child)
          });
        }
        const nestedTextureBindings = Array.from(
          nestedTextureRegistrationsRef.current.values()
        ).filter((registration) => registration.name).map((registration) => ({
          kind: "nested",
          registration,
          name: registration.name,
          options: registration.options,
          live: true
        }));
        const textureBindings = [...domTextureBindings, ...nestedTextureBindings];
        for (const binding of textureBindings) {
          const source = binding.kind === "dom" ? await loadDomTextureSource(binding.element) : await binding.registration.waitForShader();
          if (isDisposed) return;
          instance.initializeTexture(binding.name, source, binding.options);
        }
        liveTexturesRef.current = textureBindings.filter((binding) => binding.live);
        for (const binding of textureBindings) {
          if (binding.kind === "dom") {
            const cleanup = addDomTextureRefreshListener(binding.element, () => {
              instance?.updateTextures({ [binding.name]: binding.element });
            });
            if (cleanup) cleanupCallbacks.push(cleanup);
            continue;
          }
          cleanupCallbacks.push(
            binding.registration.subscribe((nestedShader) => {
              instance?.updateTextures({ [binding.name]: nestedShader });
            })
          );
        }
        if (isDisposed) return;
        shaderRef.current = instance;
        onInitRef.current?.(instance, canvas);
        resolveReadyWaiters(instance);
        playbackController = createPlaybackVisibilityController({
          target: canvas,
          autoplay: isManagedTexture ? false : autoplayRef.current,
          autopause: isManagedTexture ? false : autopauseRef.current,
          isPlaying: () => isPlaying,
          play: () => {
            if (instance && !isDisposed) {
              playShader(instance);
            }
          },
          pause: () => {
            if (instance) pauseShader(instance);
          }
        });
        playbackControllerRef.current = playbackController;
        playbackController.sync();
      } catch (error) {
        if (!isDisposed) handleSetupError(error);
      }
    };
    void initialize();
    return () => {
      isDisposed = true;
      cleanupInstance();
    };
  }, [
    shader,
    plugins,
    options,
    autosize2,
    cursorTarget,
    cursorTargetVersion,
    isManagedTexture,
    parentTextureRegistry
  ]);
  (0, import_react.useEffect)(() => {
    playbackControllerRef.current?.update({
      autoplay: isManagedTexture ? false : autoplay,
      autopause: isManagedTexture ? false : autopause
    });
  }, [autoplay, autopause, isManagedTexture]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ShaderPadTextureContext.Provider, { value: textureRegistryRef.current, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "canvas",
      {
        ref: canvasRef,
        style: {
          display: "block",
          width: "100%",
          height: "100%",
          ...style
        },
        ...canvasProps
      }
    ),
    children ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: textureHostRef, hidden: true, children }) : null
  ] });
});
ShaderPad2.displayName = "ShaderPad";
var react_default = ShaderPad2;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ShaderPad
});
//# sourceMappingURL=react.js.map