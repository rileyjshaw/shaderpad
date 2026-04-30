import {
  safeMod,
  spError
} from "./chunk-OTFRVDNV.mjs";

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
  isTouch = false;
  gl;
  glHelpers;
  uniforms = /* @__PURE__ */ new Map();
  textures = /* @__PURE__ */ new Map();
  texPool;
  buffer = null;
  vao = null;
  program = null;
  frameId;
  listeners = /* @__PURE__ */ new Map();
  frame = 0;
  tElapsed = 0;
  tStart = NaN;
  cursorPos = [0.5, 0.5];
  clickPos = [0.5, 0.5];
  isClicked = false;
  canvas;
  resObserver = null;
  hooks = /* @__PURE__ */ new Map();
  historyDepth = 0;
  texOptions;
  cursorTgt;
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
      const linkError = spError(
        2,
        {
          programInfoLog: gl.getProgramInfoLog(program),
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
      console.error(this.gl.getShaderInfoLog(shader));
      const compilationError = spError(
        4,
        {
          shaderType: type === this.gl.VERTEX_SHADER ? "vertex" : "fragment",
          source
        }
      );
      this.gl.deleteShader(shader);
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
    const resolution = [this.gl.drawingBufferWidth, this.gl.drawingBufferHeight];
    this.gl.viewport(0, 0, ...resolution);
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
    this.gl.deleteTexture(info.texture);
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
      throw spError(
        5,
        {
          name: stringFrom(name),
          nextTextureUnit: this.texPool.next,
          maxTextureUnits: this.texPool.max,
          freeTextureUnits: this.texPool.free.length
        }
      );
    }
    return this.texPool.next++;
  }
  resolveTexOpts(options) {
    const { gl } = this;
    const internalFormatOption = options?.internalFormat;
    const typeString = options?.type ?? typeFromInternalFormatString(internalFormatOption) ?? "UNSIGNED_BYTE";
    const type = this.resolveGLConst(typeString);
    const internalFormatString = internalFormatOption ?? this.glHelpers.typeToInternalFormatString.get(type) ?? "RGBA8";
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
  getPxArray(type, size) {
    const ArrayType = this.glHelpers.typeToArray.get(type) ?? Uint8Array;
    return new ArrayType(size);
  }
  isNotRgba(format) {
    return format !== this.gl.RGBA && format !== this.gl.RGBA_INTEGER;
  }
  clearHistTexLayers(textureInfo) {
    if (!textureInfo.history) return;
    const gl = this.gl;
    const { type, format } = textureInfo.options;
    const transparent = this.getPxArray(type, textureInfo.width * textureInfo.height * 4);
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
  createTex(name, textureInfo) {
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
        unitIndex = this.reserveTex(name);
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
  initTex(name, source, options) {
    if (this.textures.has(name)) {
      throw spError(16, { name: stringFrom(name) });
    }
    const { history: historyDepth = 0, ...texOptions } = options ?? {};
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
    this.gl.useProgram(this.program);
    const uSampler = this.gl.getUniformLocation(this.program, stringFrom(name));
    if (uSampler) {
      this.gl.uniform1i(uSampler, unitIndex);
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
      this.updateFrameOffset(name, targetSlots[targetSlots.length - 1]);
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
    if (Object.keys(updates).length) this.updateUniforms(updates);
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
    this.textures.forEach((texture, name) => {
      this.resetHist(name, texture);
    });
    this.clear();
    this.emit("reset");
  }
  destroy() {
    this.emit("destroy");
    this._pause();
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
      this.gl.deleteProgram(this.program);
      this.program = null;
    }
    if (this.intermediateFbo) {
      this.gl.deleteFramebuffer(this.intermediateFbo);
      this.intermediateFbo = null;
    }
    this.textures.forEach((texture) => {
      this.texPool.free.push(texture.unitIndex);
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

export {
  index_default
};
//# sourceMappingURL=chunk-OHG35H62.mjs.map