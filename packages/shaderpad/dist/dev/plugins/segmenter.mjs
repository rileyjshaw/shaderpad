import {
  index_default
} from "../chunk-QYD24S7K.mjs";
import "../chunk-OTFRVDNV.mjs";
import {
  DEFAULT_WASM_BASE_URL,
  dummyTexture,
  generateGLSLFn,
  getOrCreateSharedResource,
  getSharedFileset,
  hashOptions,
  isMediaPipeSource
} from "../chunk-W5VOJOKO.mjs";

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
var sharedDetectorPromises = /* @__PURE__ */ new Map();
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
  const { textureName, wasmBaseUrl = DEFAULT_WASM_BASE_URL, options: { history, ...mediapipeOptions } = {} } = config;
  const options = { ...DEFAULT_SEGMENTER_OPTIONS, ...mediapipeOptions };
  const optionsKey = hashOptions({ ...options, textureName, wasmBaseUrl });
  return function(shaderPad, context) {
    const { injectGLSL, emit, updateTexture } = context;
    const existingDetector = sharedDetectors.get(optionsKey);
    const mediapipeCanvas = existingDetector?.mask.canvas ?? new OffscreenCanvas(1, 1);
    let detector;
    let destroyed = false;
    let historySlot = -1;
    let pendingBackfillSlots = [];
    function writeTextures(historySlots) {
      if (!detector) return;
      updateTexture("u_segmentMask", detector.mask.shader, history ? historySlots : void 0);
    }
    function onResult() {
      if (history) {
        writeTextures(pendingBackfillSlots.length > 0 ? pendingBackfillSlots : historySlot);
        pendingBackfillSlots = [];
      } else {
        writeTextures(historySlot);
      }
      emit("segmenter:result", detector.state.result);
    }
    async function initializeDetector() {
      detector = await getOrCreateSharedResource(
        optionsKey,
        sharedDetectors,
        sharedDetectorPromises,
        async () => {
          const [mediaPipe, { ImageSegmenter }] = await Promise.all([
            getSharedFileset(wasmBaseUrl),
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
          const detector2 = {
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
          return detector2;
        }
      );
      if (!detector || destroyed) return;
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
        emit("segmenter:ready");
      });
    });
    function requestSegments(source) {
      if (!detector) return;
      if (history) {
        historySlot = (historySlot + 1) % (history + 1);
        writeTextures(historySlot);
        pendingBackfillSlots.push(historySlot);
      }
      detector.subscribers.set(onResult, true);
      detectSegments(source);
    }
    shaderPad.on("initializeTexture", (name, source) => {
      if (name === textureName && isMediaPipeSource(source)) {
        requestSegments(source);
      }
    });
    shaderPad.on("updateTextures", (updates) => {
      const source = updates[textureName];
      if (isMediaPipeSource(source)) {
        requestSegments(source);
      }
    });
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
          detector.segmenter.close();
          detector.mask.shader.destroy();
          sharedDetectors.delete(optionsKey);
        }
      }
      detector = void 0;
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
export {
  segmenter_default as default
};
//# sourceMappingURL=segmenter.mjs.map