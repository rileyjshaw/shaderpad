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

// src/plugins/face.ts
var face_exports = {};
__export(face_exports, {
  default: () => face_default
});
module.exports = __toCommonJS(face_exports);

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

// src/plugins/mediapipe-common.ts
var dummyTexture = { data: new Uint8Array(4), width: 1, height: 1 };
function isMediaPipeSource(source) {
  return source instanceof HTMLVideoElement || source instanceof HTMLImageElement || source instanceof HTMLCanvasElement || source instanceof OffscreenCanvas;
}
function hashOptions(options) {
  return JSON.stringify(options, Object.keys(options).sort());
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

// src/plugins/face.ts
var MASK_VERTEX_SHADER = `#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
	v_uv = a_pos;
	gl_Position = vec4(a_pos * 2.0 - 1.0, 0.0, 1.0);
}`;
var MASK_FRAGMENT_SHADER = `#version 300 es
precision mediump float;
uniform vec4 u_color;
out vec4 outColor;
void main() { outColor = u_color; }`;
var BLIT_FRAGMENT_SHADER = `#version 300 es
precision mediump float;
in vec2 v_uv;
uniform sampler2D u_texture;
out vec4 outColor;
void main() { outColor = texture(u_texture, v_uv); }`;
var FULLSCREEN_TRIANGLES = new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]);
var STANDARD_LANDMARK_COUNT = 478;
var CUSTOM_LANDMARK_COUNT = 2;
var LANDMARK_COUNT = STANDARD_LANDMARK_COUNT + CUSTOM_LANDMARK_COUNT;
var LANDMARKS_TEXTURE_WIDTH = 512;
var N_LANDMARK_METADATA_SLOTS = 1;
var ALL_STANDARD_INDICES = Array.from({ length: STANDARD_LANDMARK_COUNT }, (_, i) => i);
var FACE_LANDMARK_L_EYE_CENTER = 473;
var FACE_LANDMARK_R_EYE_CENTER = 468;
var FACE_LANDMARK_NOSE_TIP = 4;
var FACE_LANDMARK_FACE_CENTER = STANDARD_LANDMARK_COUNT;
var FACE_LANDMARK_MOUTH_CENTER = STANDARD_LANDMARK_COUNT + 1;
var innerMouthIndices = null;
var RED_REGION_NAMES = [
  "OVAL",
  "LEFT_EYEBROW",
  "RIGHT_EYEBROW",
  "LEFT_EYE",
  "RIGHT_EYE",
  "MOUTH",
  "INNER_MOUTH"
];
var GREEN_REGION_NAMES = ["FACE_0", "FACE_1", "FACE_2", "FACE_3", "FACE_4", "FACE_5", "FACE_6", "FACE_7"];
var BLUE_REGION_NAMES = [
  "FACE_8",
  "FACE_9",
  "FACE_10",
  "FACE_11",
  "FACE_12",
  "FACE_13",
  "FACE_14",
  "FACE_15"
];
var CHANNEL_BIT_SCALE = 255;
var GB_BITMASK_MAX_FACES = GREEN_REGION_NAMES.length + BLUE_REGION_NAMES.length;
function createChannelBitValues(names) {
  return Object.fromEntries(names.map((name, i) => [name, 1 << i]));
}
function normalizeChannelBitValues(bitValues) {
  return Object.fromEntries(
    Object.entries(bitValues).map(([name, bitValue]) => [name, bitValue / CHANNEL_BIT_SCALE])
  );
}
var RED_REGION_BIT_VALUES = createChannelBitValues(RED_REGION_NAMES);
var GREEN_REGION_BIT_VALUES = createChannelBitValues(GREEN_REGION_NAMES);
var BLUE_REGION_BIT_VALUES = createChannelBitValues(BLUE_REGION_NAMES);
var RED_CHANNEL_VALUES = normalizeChannelBitValues(RED_REGION_BIT_VALUES);
var GREEN_CHANNEL_VALUES = normalizeChannelBitValues(GREEN_REGION_BIT_VALUES);
var BLUE_CHANNEL_VALUES = normalizeChannelBitValues(BLUE_REGION_BIT_VALUES);
var DEFAULT_FACE_OPTIONS = {
  modelPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",
  maxFaces: 1,
  minFaceDetectionConfidence: 0.5,
  minFacePresenceConfidence: 0.5,
  minTrackingConfidence: 0.5,
  outputFaceBlendshapes: false,
  outputFacialTransformationMatrixes: false
};
function fanTriangulate(indices) {
  const tris = [];
  for (let i = 1; i < indices.length - 1; ++i) {
    tris.push(indices[0], indices[i], indices[i + 1]);
  }
  return tris;
}
function contourPath(connections) {
  const indices = new Array(connections.length + 1);
  indices[0] = connections[0].start;
  for (let i = 0; i < connections.length; ++i) indices[i + 1] = connections[i].end;
  return indices;
}
function stripTriangulate(a, b) {
  const tris = [];
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n - 1; ++i) {
    tris.push(a[i], b[i], b[i + 1], a[i], b[i + 1], a[i + 1]);
  }
  return tris;
}
var faceRegions = null;
function initFaceRegions(LandmarkerClass) {
  if (!faceRegions) {
    const tesselationConnections = LandmarkerClass.FACE_LANDMARKS_TESSELATION;
    const leftEyebrowConnections = LandmarkerClass.FACE_LANDMARKS_LEFT_EYEBROW;
    const leftEyebrowUpper = contourPath(leftEyebrowConnections.slice(0, 4));
    const leftEyebrowLower = contourPath(leftEyebrowConnections.slice(4, 8));
    const rightEyebrowConnections = LandmarkerClass.FACE_LANDMARKS_RIGHT_EYEBROW;
    const rightEyebrowUpper = contourPath(rightEyebrowConnections.slice(0, 4));
    const rightEyebrowLower = contourPath(rightEyebrowConnections.slice(4, 8));
    const leftEyeConnections = LandmarkerClass.FACE_LANDMARKS_LEFT_EYE;
    const leftEyeUpper = contourPath(leftEyeConnections.slice(0, 8));
    const leftEyeLower = contourPath(leftEyeConnections.slice(8, 16));
    const rightEyeConnections = LandmarkerClass.FACE_LANDMARKS_RIGHT_EYE;
    const rightEyeUpper = contourPath(rightEyeConnections.slice(0, 8));
    const rightEyeLower = contourPath(rightEyeConnections.slice(8, 16));
    const lipConnections = LandmarkerClass.FACE_LANDMARKS_LIPS;
    const outerUpperLip = contourPath(lipConnections.slice(0, 10));
    const outerLowerLip = contourPath(lipConnections.slice(10, 20));
    const innerUpperLip = contourPath(lipConnections.slice(20, 30));
    const innerLowerLip = contourPath(lipConnections.slice(30, 40));
    const leftEyeIndices = [...leftEyeUpper, ...leftEyeLower.slice(1, -1)];
    const rightEyeIndices = [...rightEyeUpper, ...rightEyeLower.slice(1, -1)];
    innerMouthIndices = [...innerUpperLip, ...innerLowerLip.slice(1, -1)];
    const tessellationHoleRemap = new Int16Array(LANDMARK_COUNT).fill(-1);
    for (const index of leftEyeIndices) tessellationHoleRemap[index] = FACE_LANDMARK_L_EYE_CENTER;
    for (const index of rightEyeIndices) tessellationHoleRemap[index] = FACE_LANDMARK_R_EYE_CENTER;
    for (const index of innerMouthIndices) tessellationHoleRemap[index] = FACE_LANDMARK_MOUTH_CENTER;
    const remapTessellationHole = (index) => {
      const remapped = tessellationHoleRemap[index];
      return remapped >= 0 ? remapped : index;
    };
    const tesselation = [];
    for (let i = 0; i < tesselationConnections.length - 2; i += 3) {
      const a = remapTessellationHole(tesselationConnections[i].start);
      const b = remapTessellationHole(tesselationConnections[i + 1].start);
      const c = remapTessellationHole(tesselationConnections[i + 2].start);
      if (a !== b && a !== c && b !== c) tesselation.push(a, b, c);
    }
    const leftEyebrowFill = stripTriangulate(leftEyebrowUpper, leftEyebrowLower);
    const rightEyebrowFill = stripTriangulate(rightEyebrowUpper, rightEyebrowLower);
    const leftEyeFill = stripTriangulate(leftEyeUpper, leftEyeLower);
    const rightEyeFill = stripTriangulate(rightEyeUpper, rightEyeLower);
    const mouthFill = [
      ...stripTriangulate(outerUpperLip, innerUpperLip),
      ...stripTriangulate(outerLowerLip, innerLowerLip)
    ];
    const innerMouthFill = stripTriangulate(innerUpperLip, innerLowerLip);
    const ovalIndices = contourPath(LandmarkerClass.FACE_LANDMARKS_FACE_OVAL).slice(0, -1);
    faceRegions = Object.fromEntries(
      Object.entries({
        LEFT_EYEBROW: leftEyebrowFill,
        RIGHT_EYEBROW: rightEyebrowFill,
        LEFT_EYE: leftEyeFill,
        RIGHT_EYE: rightEyeFill,
        MOUTH: mouthFill,
        INNER_MOUTH: innerMouthFill,
        TESSELATION: tesselation,
        OVAL: fanTriangulate(ovalIndices)
      }).map(([key, indices]) => [key, { indices, vertices: new Float32Array(indices.length * 2) }])
    );
  }
}
var sharedDetectors = /* @__PURE__ */ new Map();
function createProgram(gl, vertexSource, fragmentSource, programName) {
  let vertexShader = null;
  let fragmentShader = null;
  let program = null;
  try {
    vertexShader = gl.createShader(gl.VERTEX_SHADER);
    fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    program = gl.createProgram();
    if (!vertexShader || !fragmentShader || !program) throw new Error();
    gl.shaderSource(vertexShader, vertexSource);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) throw new Error();
    gl.shaderSource(fragmentShader, fragmentSource);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) throw new Error();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error();
    return program;
  } catch {
    if (program) gl.deleteProgram(program);
    throw spError(
      61,
      {
        programName,
        vertexShaderInfoLog: vertexShader ? gl.getShaderInfoLog(vertexShader) : void 0,
        fragmentShaderInfoLog: fragmentShader ? gl.getShaderInfoLog(fragmentShader) : void 0,
        programInfoLog: program ? gl.getProgramInfoLog(program) : void 0
      }
    );
  } finally {
    if (vertexShader) gl.deleteShader(vertexShader);
    if (fragmentShader) gl.deleteShader(fragmentShader);
  }
}
function initMaskRenderer(canvas) {
  const gl = canvas.getContext("webgl2", {
    antialias: false,
    preserveDrawingBuffer: true
  });
  if (!gl) {
    throw spError(60, { canvasWidth: canvas.width, canvasHeight: canvas.height });
  }
  const regionProgram = createProgram(gl, MASK_VERTEX_SHADER, MASK_FRAGMENT_SHADER, "face-mask-region");
  const blitProgram = createProgram(gl, MASK_VERTEX_SHADER, BLIT_FRAGMENT_SHADER, "face-mask-blit");
  let framebufferStatus;
  try {
    const regionPositionBuffer = gl.createBuffer();
    const regionPositionLocation = gl.getAttribLocation(regionProgram, "a_pos");
    const quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, FULLSCREEN_TRIANGLES, gl.STATIC_DRAW);
    const blitPositionLocation = gl.getAttribLocation(blitProgram, "a_pos");
    const colorLocation = gl.getUniformLocation(regionProgram, "u_color");
    const textureLocation = gl.getUniformLocation(blitProgram, "u_texture");
    const scratchTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, scratchTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    const scratchFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, scratchFramebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, scratchTexture, 0);
    framebufferStatus = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    if (!regionPositionBuffer || regionPositionLocation < 0 || !quadBuffer || blitPositionLocation < 0 || !colorLocation || !textureLocation || !scratchTexture || !scratchFramebuffer || framebufferStatus !== gl.FRAMEBUFFER_COMPLETE) {
      throw new Error();
    }
    gl.useProgram(blitProgram);
    gl.uniform1i(textureLocation, 0);
    gl.colorMask(true, true, true, false);
    return {
      canvas,
      gl,
      regionProgram,
      blitProgram,
      regionPositionBuffer,
      quadBuffer,
      regionPositionLocation,
      blitPositionLocation,
      colorLocation,
      textureLocation,
      scratchTexture,
      scratchFramebuffer
    };
  } catch {
    throw spError(62, { framebufferStatus });
  }
}
function resizeMaskRenderer(mask, width, height) {
  const { gl, canvas, scratchTexture } = mask;
  if (canvas.width === width && canvas.height === height) return;
  canvas.width = width;
  canvas.height = height;
  gl.bindTexture(gl.TEXTURE_2D, scratchTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
}
function drawRegionToScratch(mask, landmarksData, faceRegion, faceIdx, r, g, b) {
  const { gl, regionProgram, regionPositionBuffer, regionPositionLocation, colorLocation, scratchFramebuffer } = mask;
  const baseIdx = N_LANDMARK_METADATA_SLOTS + faceIdx * LANDMARK_COUNT;
  const { indices, vertices } = faceRegion;
  gl.bindFramebuffer(gl.FRAMEBUFFER, scratchFramebuffer);
  gl.viewport(0, 0, mask.canvas.width, mask.canvas.height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(regionProgram);
  gl.bindBuffer(gl.ARRAY_BUFFER, regionPositionBuffer);
  gl.enableVertexAttribArray(regionPositionLocation);
  gl.vertexAttribPointer(regionPositionLocation, 2, gl.FLOAT, false, 0, 0);
  gl.enable(gl.BLEND);
  gl.blendEquation(gl.MAX);
  gl.blendFunc(gl.ONE, gl.ONE);
  for (let i = 0; i < indices.length; ++i) {
    const landmarkIdx = (baseIdx + indices[i]) * 4;
    vertices[i * 2] = landmarksData[landmarkIdx];
    vertices[i * 2 + 1] = landmarksData[landmarkIdx + 1];
  }
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
  gl.uniform4f(colorLocation, r, g, b, 1);
  gl.drawArrays(gl.TRIANGLES, 0, indices.length);
}
function accumulateScratch(mask) {
  const { gl, blitProgram, quadBuffer, blitPositionLocation, scratchTexture } = mask;
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, mask.canvas.width, mask.canvas.height);
  gl.useProgram(blitProgram);
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
  gl.enableVertexAttribArray(blitPositionLocation);
  gl.vertexAttribPointer(blitPositionLocation, 2, gl.FLOAT, false, 0, 0);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, scratchTexture);
  gl.enable(gl.BLEND);
  gl.blendEquation(gl.FUNC_ADD);
  gl.blendFunc(gl.ONE, gl.ONE);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}
function updateLandmarksData(detector, faces) {
  const data = detector.landmarks.data;
  const nFaces = faces.length;
  data[0] = nFaces;
  for (let faceIdx = 0; faceIdx < nFaces; ++faceIdx) {
    const landmarks = faces[faceIdx];
    for (let landmarkIdx = 0; landmarkIdx < STANDARD_LANDMARK_COUNT; ++landmarkIdx) {
      const landmark = landmarks[landmarkIdx];
      const dataIdx = (N_LANDMARK_METADATA_SLOTS + faceIdx * LANDMARK_COUNT + landmarkIdx) * 4;
      data[dataIdx] = landmark.x;
      data[dataIdx + 1] = 1 - landmark.y;
      data[dataIdx + 2] = landmark.z ?? 0;
      data[dataIdx + 3] = landmark.visibility ?? 1;
    }
    const faceCenter = calculateBoundingBoxCenter(
      data,
      faceIdx,
      ALL_STANDARD_INDICES,
      LANDMARK_COUNT,
      N_LANDMARK_METADATA_SLOTS
    );
    data.set(faceCenter, (N_LANDMARK_METADATA_SLOTS + faceIdx * LANDMARK_COUNT + FACE_LANDMARK_FACE_CENTER) * 4);
    const mouthCenter = calculateBoundingBoxCenter(data, faceIdx, innerMouthIndices, LANDMARK_COUNT, 1);
    data.set(mouthCenter, (N_LANDMARK_METADATA_SLOTS + faceIdx * LANDMARK_COUNT + FACE_LANDMARK_MOUTH_CENTER) * 4);
  }
  detector.state.nFaces = nFaces;
}
function updateMask(detector, width, height) {
  const {
    mask,
    maxFaces,
    landmarks,
    state: { nFaces }
  } = detector;
  const { gl, canvas: maskCanvas } = mask;
  const { data: landmarksData } = landmarks;
  resizeMaskRenderer(mask, width, height);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, maskCanvas.width, maskCanvas.height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  if (!faceRegions) return;
  const useTesselationBitmask = maxFaces <= GB_BITMASK_MAX_FACES;
  for (let faceIdx = 0; faceIdx < nFaces; ++faceIdx) {
    const g = useTesselationBitmask && faceIdx < GREEN_REGION_NAMES.length ? GREEN_CHANNEL_VALUES[GREEN_REGION_NAMES[faceIdx]] : 0;
    const b = useTesselationBitmask ? faceIdx < GREEN_REGION_NAMES.length ? 0 : BLUE_CHANNEL_VALUES[BLUE_REGION_NAMES[faceIdx - GREEN_REGION_NAMES.length]] : (faceIdx + 1) / CHANNEL_BIT_SCALE;
    drawRegionToScratch(mask, landmarksData, faceRegions.TESSELATION, faceIdx, 0, g, b);
    accumulateScratch(mask);
    drawRegionToScratch(mask, landmarksData, faceRegions.OVAL, faceIdx, RED_CHANNEL_VALUES.OVAL, 0, 0);
    accumulateScratch(mask);
    drawRegionToScratch(
      mask,
      landmarksData,
      faceRegions.LEFT_EYEBROW,
      faceIdx,
      RED_CHANNEL_VALUES.LEFT_EYEBROW,
      0,
      0
    );
    accumulateScratch(mask);
    drawRegionToScratch(
      mask,
      landmarksData,
      faceRegions.RIGHT_EYEBROW,
      faceIdx,
      RED_CHANNEL_VALUES.RIGHT_EYEBROW,
      0,
      0
    );
    accumulateScratch(mask);
    drawRegionToScratch(mask, landmarksData, faceRegions.LEFT_EYE, faceIdx, RED_CHANNEL_VALUES.LEFT_EYE, 0, 0);
    accumulateScratch(mask);
    drawRegionToScratch(mask, landmarksData, faceRegions.RIGHT_EYE, faceIdx, RED_CHANNEL_VALUES.RIGHT_EYE, 0, 0);
    accumulateScratch(mask);
    drawRegionToScratch(mask, landmarksData, faceRegions.MOUTH, faceIdx, RED_CHANNEL_VALUES.MOUTH, 0, 0);
    accumulateScratch(mask);
    drawRegionToScratch(
      mask,
      landmarksData,
      faceRegions.INNER_MOUTH,
      faceIdx,
      RED_CHANNEL_VALUES.INNER_MOUTH,
      0,
      0
    );
    accumulateScratch(mask);
  }
}
function face(config) {
  const { textureName, options: { history, ...mediapipeOptions } = {} } = config;
  const options = { ...DEFAULT_FACE_OPTIONS, ...mediapipeOptions };
  const optionsKey = hashOptions({ ...options, textureName });
  const nLandmarksMax = options.maxFaces * LANDMARK_COUNT + N_LANDMARK_METADATA_SLOTS;
  const textureHeight = Math.ceil(nLandmarksMax / LANDMARKS_TEXTURE_WIDTH);
  return function(shaderPad, context) {
    const { injectGLSL, emitHook, updateTexturesInternal } = context;
    const existingDetector = sharedDetectors.get(optionsKey);
    const landmarksData = existingDetector?.landmarks.data ?? new Float32Array(LANDMARKS_TEXTURE_WIDTH * textureHeight * 4);
    const maskCanvas = existingDetector?.mask.canvas ?? new OffscreenCanvas(1, 1);
    let detector = null;
    let destroyed = false;
    let skipHistoryWrite = false;
    function onResult(singleHistoryWriteIndex) {
      if (!detector) return;
      const nFaces = detector.state.nFaces;
      const nSlots = nFaces * LANDMARK_COUNT + N_LANDMARK_METADATA_SLOTS;
      const rowsToUpdate = Math.ceil(nSlots / LANDMARKS_TEXTURE_WIDTH);
      let historyWriteIndex = singleHistoryWriteIndex;
      if (typeof historyWriteIndex === "undefined" && pendingBackfillSlots.length > 0) {
        historyWriteIndex = pendingBackfillSlots;
        pendingBackfillSlots = [];
      }
      updateTexturesInternal(
        {
          u_faceLandmarksTex: {
            data: detector.landmarks.data,
            width: LANDMARKS_TEXTURE_WIDTH,
            height: rowsToUpdate,
            isPartial: true
          },
          u_faceMask: detector.mask.canvas
        },
        history ? { skipHistoryWrite, historyWriteIndex } : void 0
      );
      shaderPad.updateUniforms({ u_nFaces: nFaces }, { allowMissing: true });
      emitHook("face:result", detector.state.result);
    }
    async function initializeDetector() {
      if (sharedDetectors.has(optionsKey)) {
        detector = sharedDetectors.get(optionsKey);
      } else {
        const [mediaPipe, { FaceLandmarker }] = await Promise.all([
          getSharedFileset(),
          import("@mediapipe/tasks-vision")
        ]);
        if (destroyed) return;
        const faceLandmarker = await FaceLandmarker.createFromOptions(mediaPipe, {
          baseOptions: {
            modelAssetPath: options.modelPath,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numFaces: options.maxFaces,
          minFaceDetectionConfidence: options.minFaceDetectionConfidence,
          minFacePresenceConfidence: options.minFacePresenceConfidence,
          minTrackingConfidence: options.minTrackingConfidence,
          outputFaceBlendshapes: options.outputFaceBlendshapes,
          outputFacialTransformationMatrixes: options.outputFacialTransformationMatrixes
        });
        if (destroyed) {
          faceLandmarker.close();
          return;
        }
        detector = {
          landmarker: faceLandmarker,
          mask: initMaskRenderer(maskCanvas),
          subscribers: /* @__PURE__ */ new Map(),
          maxFaces: options.maxFaces,
          state: {
            nCalls: 0,
            runningMode: "VIDEO",
            source: null,
            videoTime: -1,
            resultTimestamp: 0,
            result: null,
            pending: Promise.resolve(),
            nFaces: 0
          },
          landmarks: {
            data: landmarksData,
            textureHeight
          }
        };
        initFaceRegions(FaceLandmarker);
        sharedDetectors.set(optionsKey, detector);
      }
      detector.subscribers.set(onResult, false);
    }
    const initPromise = initializeDetector();
    async function detectFaces(source) {
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
          let width, height;
          if (source instanceof HTMLVideoElement) {
            if (source.videoWidth === 0 || source.videoHeight === 0 || source.readyState < 2) return;
            width = source.videoWidth;
            height = source.videoHeight;
            result = detector.landmarker.detectForVideo(source, now);
          } else {
            if (source.width === 0 || source.height === 0) return;
            width = source.width;
            height = source.height;
            result = detector.landmarker.detect(source);
          }
          if (result) {
            detector.state.resultTimestamp = now;
            detector.state.result = result;
            updateLandmarksData(detector, result.faceLandmarks);
            updateMask(detector, width, height);
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
        }
      });
      await detector.state.pending;
    }
    shaderPad.on("_init", () => {
      shaderPad.initializeUniform("u_maxFaces", "int", options.maxFaces, { allowMissing: true });
      shaderPad.initializeUniform("u_nFaces", "int", 0, { allowMissing: true });
      shaderPad.initializeTexture(
        "u_faceLandmarksTex",
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
      shaderPad.initializeTexture("u_faceMask", maskCanvas, {
        minFilter: "NEAREST",
        magFilter: "NEAREST",
        history
      });
      initPromise.then(() => {
        if (destroyed || !detector) return;
        emitHook("face:ready");
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
        detectFaces(source);
      }
    });
    shaderPad.on(
      "updateTextures",
      (updates, options2) => {
        const source = updates[textureName];
        if (isMediaPipeSource(source)) {
          skipHistoryWrite = options2?.skipHistoryWrite ?? false;
          if (!skipHistoryWrite) writeToHistory();
          detectFaces(source);
        }
      }
    );
    shaderPad.on("destroy", () => {
      destroyed = true;
      if (detector) {
        detector.subscribers.delete(onResult);
        if (detector.subscribers.size === 0) {
          detector.landmarker.close();
          detector.mask.gl.deleteProgram(detector.mask.regionProgram);
          detector.mask.gl.deleteProgram(detector.mask.blitProgram);
          detector.mask.gl.deleteBuffer(detector.mask.regionPositionBuffer);
          detector.mask.gl.deleteBuffer(detector.mask.quadBuffer);
          detector.mask.gl.deleteTexture(detector.mask.scratchTexture);
          detector.mask.gl.deleteFramebuffer(detector.mask.scratchFramebuffer);
          sharedDetectors.delete(optionsKey);
        }
      }
      detector = null;
    });
    const { fn, historyParams } = generateGLSLFn(history);
    const sampleMask = history ? `_sampleFaceMask(pos, framesAgo)` : `texture(u_faceMask, pos)`;
    const decodeFaceBitIndex = Array.from(
      { length: GB_BITMASK_MAX_FACES - 1 },
      (_, i) => `step(${2 ** (i + 1)}.0, faceBitF)`
    ).join(" + ");
    const decodeFaceIndex = options.maxFaces <= GB_BITMASK_MAX_FACES ? `uint faceBits = (uint(mask.b * ${CHANNEL_BIT_SCALE}.0 + 0.5) << 8) | uint(mask.g * ${CHANNEL_BIT_SCALE}.0 + 0.5);
	uint faceBit = faceBits & (~faceBits + 1u);
	float faceBitF = float(faceBit);
	float hasFace = sign(faceBitF);
	float faceIndex = ${decodeFaceBitIndex} - (1.0 - hasFace);` : `float faceIndex = float(int(uint(mask.b * ${CHANNEL_BIT_SCALE}.0 + 0.5)) - 1);`;
    const checkAt = (fnName, ...regionNames) => fn(
      "vec2",
      `${fnName}At`,
      "vec2 pos",
      `vec4 mask = ${sampleMask};
	${decodeFaceIndex}
	uint bits = uint(mask.r * ${CHANNEL_BIT_SCALE}.0 + 0.5);
	float hit = sign(float(bits & ${regionNames.reduce(
        (mask, regionName) => mask | RED_REGION_BIT_VALUES[regionName],
        0
      )}u));
	return vec2(hit, mix(-1.0, faceIndex, hit));`
    );
    const combineLeftRight = (fnName, leftFn, rightFn) => fn(
      "vec2",
      `${fnName}At`,
      "vec2 pos",
      `vec2 left = ${leftFn}(pos${historyParams});
	vec2 right = ${rightFn}(pos${historyParams});
	return mix(right, left, left.x);`
    );
    const checkIn = (fnNames) => fnNames.map(
      (fnName) => fn(
        "float",
        `in${fnName[0].toUpperCase() + fnName.slice(1)}`,
        "vec2 pos",
        `vec2 a = ${fnName}At(pos${historyParams}); return step(0.0, a.y) * a.x;`
      )
    ).join("\n");
    injectGLSL(`
uniform int u_maxFaces;
uniform int u_nFaces;
uniform highp sampler2D${history ? "Array" : ""} u_faceLandmarksTex;${history ? `
uniform int u_faceLandmarksTexFrameOffset;` : ""}
uniform mediump sampler2D${history ? "Array" : ""} u_faceMask;${history ? `
uniform int u_faceMaskFrameOffset;` : ""}

#define FACE_LANDMARK_L_EYE_CENTER ${FACE_LANDMARK_L_EYE_CENTER}
#define FACE_LANDMARK_R_EYE_CENTER ${FACE_LANDMARK_R_EYE_CENTER}
#define FACE_LANDMARK_NOSE_TIP ${FACE_LANDMARK_NOSE_TIP}
#define FACE_LANDMARK_FACE_CENTER ${FACE_LANDMARK_FACE_CENTER}
#define FACE_LANDMARK_MOUTH_CENTER ${FACE_LANDMARK_MOUTH_CENTER}

${fn(
      "int",
      "nFacesAt",
      "",
      history ? `
	int layer = (u_faceLandmarksTexFrameOffset - framesAgo + ${history + 1}) % ${history + 1};
	return int(texelFetch(u_faceLandmarksTex, ivec3(0, 0, layer), 0).r + 0.5);` : `
	return int(texelFetch(u_faceLandmarksTex, ivec2(0, 0), 0).r + 0.5);`
    )}
${fn(
      "vec4",
      "faceLandmark",
      "int faceIndex, int landmarkIndex",
      `int i = ${N_LANDMARK_METADATA_SLOTS} + faceIndex * ${LANDMARK_COUNT} + landmarkIndex;
	int x = i % ${LANDMARKS_TEXTURE_WIDTH};
	int y = i / ${LANDMARKS_TEXTURE_WIDTH};${history ? `
	int layer = (u_faceLandmarksTexFrameOffset - framesAgo + ${history + 1}) % ${history + 1};
	return texelFetch(u_faceLandmarksTex, ivec3(x, y, layer), 0);` : `
	return texelFetch(u_faceLandmarksTex, ivec2(x, y), 0);`}`
    )}
${history ? `
vec4 _sampleFaceMask(vec2 pos, int framesAgo) {
	int layer = (u_faceMaskFrameOffset - framesAgo + ${history + 1}) % ${history + 1};
	return texture(u_faceMask, vec3(pos, float(layer)));
}
` : ""}
${checkAt("leftEyebrow", "LEFT_EYEBROW")}
${checkAt("rightEyebrow", "RIGHT_EYEBROW")}
${checkAt("leftEye", "LEFT_EYE")}
${checkAt("rightEye", "RIGHT_EYE")}
${checkAt("lips", "MOUTH")}
${checkAt("mouth", "MOUTH", "INNER_MOUTH")}
${checkAt("innerMouth", "INNER_MOUTH")}
${checkAt("faceOval", "OVAL")}
${fn(
      "vec2",
      "faceAt",
      "vec2 pos",
      `vec4 mask = ${sampleMask};
	${decodeFaceIndex}
	return vec2(step(0.0, faceIndex), faceIndex);`
    )}
${combineLeftRight("eye", "leftEyeAt", "rightEyeAt")}
${combineLeftRight("eyebrow", "leftEyebrowAt", "rightEyebrowAt")}
${checkIn(["eyebrow", "eye", "mouth", "innerMouth", "lips", "face"])}`);
  };
}
var face_default = face;
//# sourceMappingURL=face.js.map