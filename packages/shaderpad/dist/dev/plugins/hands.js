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

// src/plugins/hands.ts
var hands_exports = {};
__export(hands_exports, {
  default: () => hands_default
});
module.exports = __toCommonJS(hands_exports);

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

// src/plugins/hands.ts
var STANDARD_LANDMARK_COUNT = 21;
var CUSTOM_LANDMARK_COUNT = 1;
var LANDMARK_COUNT = STANDARD_LANDMARK_COUNT + CUSTOM_LANDMARK_COUNT;
var HAND_CENTER_LANDMARKS = [0, 0, 5, 9, 13, 17];
var LANDMARKS_TEXTURE_WIDTH = 512;
var N_LANDMARK_METADATA_SLOTS = 1;
var DEFAULT_HANDS_OPTIONS = {
  modelPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
  maxHands: 2,
  minHandDetectionConfidence: 0.5,
  minHandPresenceConfidence: 0.5,
  minTrackingConfidence: 0.5
};
var sharedDetectors = /* @__PURE__ */ new Map();
var sharedDetectorPromises = /* @__PURE__ */ new Map();
function updateLandmarksData(detector, hands2, handedness) {
  const data = detector.landmarks.data;
  const nHands = hands2.length;
  data[0] = nHands;
  for (let handIdx = 0; handIdx < nHands; ++handIdx) {
    const landmarks = hands2[handIdx];
    const isRightHand = handedness[handIdx]?.[0]?.categoryName === "Right";
    for (let lmIdx = 0; lmIdx < STANDARD_LANDMARK_COUNT; ++lmIdx) {
      const landmark = landmarks[lmIdx];
      const dataIdx = (N_LANDMARK_METADATA_SLOTS + handIdx * LANDMARK_COUNT + lmIdx) * 4;
      data[dataIdx] = landmark.x;
      data[dataIdx + 1] = 1 - landmark.y;
      data[dataIdx + 2] = landmark.z ?? 0;
      data[dataIdx + 3] = isRightHand ? 1 : 0;
    }
    const handCenter = calculateBoundingBoxCenter(
      data,
      handIdx,
      HAND_CENTER_LANDMARKS,
      LANDMARK_COUNT,
      N_LANDMARK_METADATA_SLOTS
    );
    const handCenterIdx = (N_LANDMARK_METADATA_SLOTS + handIdx * LANDMARK_COUNT + STANDARD_LANDMARK_COUNT) * 4;
    data[handCenterIdx] = handCenter[0];
    data[handCenterIdx + 1] = handCenter[1];
    data[handCenterIdx + 2] = handCenter[2];
    data[handCenterIdx + 3] = isRightHand ? 1 : 0;
  }
  detector.state.nHands = nHands;
}
function hands(config) {
  const { textureName, options: { history, ...mediapipeOptions } = {} } = config;
  const options = { ...DEFAULT_HANDS_OPTIONS, ...mediapipeOptions };
  const optionsKey = hashOptions({ ...options, textureName });
  const nLandmarksMax = options.maxHands * LANDMARK_COUNT + N_LANDMARK_METADATA_SLOTS;
  const textureHeight = Math.ceil(nLandmarksMax / LANDMARKS_TEXTURE_WIDTH);
  return function(shaderPad, context) {
    const { injectGLSL, emitHook, updateTexturesInternal } = context;
    const existingDetector = sharedDetectors.get(optionsKey);
    const landmarksData = existingDetector?.landmarks.data ?? new Float32Array(LANDMARKS_TEXTURE_WIDTH * textureHeight * 4);
    let detector;
    let destroyed = false;
    let historySlot = -1;
    let pendingBackfillSlots = [];
    function writeTextures(historySlots) {
      if (!detector) return;
      const { nHands } = detector.state;
      const nSlots = nHands * LANDMARK_COUNT + N_LANDMARK_METADATA_SLOTS;
      const rowsToUpdate = Math.ceil(nSlots / LANDMARKS_TEXTURE_WIDTH);
      updateTexturesInternal(
        {
          u_handLandmarksTex: {
            data: detector.landmarks.data,
            width: LANDMARKS_TEXTURE_WIDTH,
            height: rowsToUpdate,
            isPartial: true
          }
        },
        history ? historySlots : void 0
      );
      shaderPad.updateUniforms({ u_nHands: nHands }, { allowMissing: true });
    }
    function onResult() {
      if (history) {
        writeTextures(pendingBackfillSlots.length > 0 ? pendingBackfillSlots : historySlot);
        pendingBackfillSlots = [];
      } else {
        writeTextures(historySlot);
      }
      emitHook("hands:result", detector.state.result);
    }
    async function initializeDetector() {
      detector = await getOrCreateSharedResource(
        optionsKey,
        sharedDetectors,
        sharedDetectorPromises,
        async () => {
          const [mediaPipe, { HandLandmarker }] = await Promise.all([
            getSharedFileset(),
            import("@mediapipe/tasks-vision")
          ]);
          if (destroyed) return;
          const mediapipeCanvas = new OffscreenCanvas(1, 1);
          const handLandmarker = await HandLandmarker.createFromOptions(mediaPipe, {
            baseOptions: {
              modelAssetPath: options.modelPath,
              delegate: "GPU"
            },
            canvas: mediapipeCanvas,
            runningMode: "VIDEO",
            numHands: options.maxHands,
            minHandDetectionConfidence: options.minHandDetectionConfidence,
            minHandPresenceConfidence: options.minHandPresenceConfidence,
            minTrackingConfidence: options.minTrackingConfidence
          });
          if (destroyed) {
            handLandmarker.close();
            return;
          }
          const detector2 = {
            landmarker: handLandmarker,
            mediapipeCanvas,
            subscribers: /* @__PURE__ */ new Map(),
            maxHands: options.maxHands,
            state: {
              nCalls: 0,
              runningMode: "VIDEO",
              source: null,
              videoTime: -1,
              resultTimestamp: 0,
              result: null,
              pending: Promise.resolve(),
              nHands: 0
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
      detector.subscribers.set(onResult, false);
    }
    const initPromise = initializeDetector();
    shaderPad.on("_init", () => {
      shaderPad.initializeUniform("u_maxHands", "int", options.maxHands, { allowMissing: true });
      shaderPad.initializeUniform("u_nHands", "int", 0, { allowMissing: true });
      shaderPad.initializeTexture(
        "u_handLandmarksTex",
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
      initPromise.then(() => {
        if (destroyed || !detector) return;
        emitHook("hands:ready");
      });
    });
    function requestHands(source) {
      if (!detector) return;
      if (history) {
        historySlot = (historySlot + 1) % (history + 1);
        writeTextures(historySlot);
        pendingBackfillSlots.push(historySlot);
      }
      detector.subscribers.set(onResult, true);
      detectHands(source);
    }
    shaderPad.on("initializeTexture", (name, source) => {
      if (name === textureName && isMediaPipeSource(source)) {
        requestHands(source);
      }
    });
    shaderPad.on("updateTextures", (updates) => {
      const source = updates[textureName];
      if (isMediaPipeSource(source)) {
        requestHands(source);
      }
    });
    async function detectHands(source) {
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
            updateLandmarksData(detector, result.landmarks, result.handedness);
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
          sharedDetectors.delete(optionsKey);
        }
      }
      detector = void 0;
    });
    const { fn, historyParams } = generateGLSLFn(history);
    injectGLSL(`
uniform int u_maxHands;
uniform int u_nHands;
uniform highp sampler2D${history ? "Array" : ""} u_handLandmarksTex;${history ? `
uniform int u_handLandmarksTexFrameOffset;` : ""}

${fn(
      "int",
      "nHandsAt",
      "",
      history ? `
	int layer = (u_handLandmarksTexFrameOffset - framesAgo + ${history + 1}) % ${history + 1};
	return int(texelFetch(u_handLandmarksTex, ivec3(0, 0, layer), 0).r + 0.5);` : `
	return int(texelFetch(u_handLandmarksTex, ivec2(0, 0), 0).r + 0.5);`
    )}
${fn(
      "vec4",
      "handLandmark",
      "int handIndex, int landmarkIndex",
      `int i = ${N_LANDMARK_METADATA_SLOTS} + handIndex * ${LANDMARK_COUNT} + landmarkIndex;
	int x = i % ${LANDMARKS_TEXTURE_WIDTH};
	int y = i / ${LANDMARKS_TEXTURE_WIDTH};${history ? `
	int layer = (u_handLandmarksTexFrameOffset - framesAgo + ${history + 1}) % ${history + 1};
	return texelFetch(u_handLandmarksTex, ivec3(x, y, layer), 0);` : `
	return texelFetch(u_handLandmarksTex, ivec2(x, y), 0);`}`
    )}
${fn("float", "isRightHand", "int handIndex", `return handLandmark(handIndex, 0${historyParams}).w;`)}
${fn("float", "isLeftHand", "int handIndex", `return 1.0 - handLandmark(handIndex, 0${historyParams}).w;`)}`);
  };
}
var hands_default = hands;
//# sourceMappingURL=hands.js.map