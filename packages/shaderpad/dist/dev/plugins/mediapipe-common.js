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

// src/plugins/mediapipe-common.ts
var mediapipe_common_exports = {};
__export(mediapipe_common_exports, {
  calculateBoundingBoxCenter: () => calculateBoundingBoxCenter,
  dummyTexture: () => dummyTexture,
  generateGLSLFn: () => generateGLSLFn,
  getOrCreateSharedResource: () => getOrCreateSharedResource,
  getSharedFileset: () => getSharedFileset,
  hashOptions: () => hashOptions,
  isMediaPipeSource: () => isMediaPipeSource
});
module.exports = __toCommonJS(mediapipe_common_exports);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  calculateBoundingBoxCenter,
  dummyTexture,
  generateGLSLFn,
  getOrCreateSharedResource,
  getSharedFileset,
  hashOptions,
  isMediaPipeSource
});
//# sourceMappingURL=mediapipe-common.js.map