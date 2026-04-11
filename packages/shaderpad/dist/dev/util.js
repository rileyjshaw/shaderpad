"use strict";
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

// src/util.ts
var util_exports = {};
__export(util_exports, {
  createFullscreenCanvas: () => createFullscreenCanvas,
  save: () => save,
  toBlob: () => toBlob
});
module.exports = __toCommonJS(util_exports);
function getDefaultExtension(type) {
  switch (type?.toLowerCase()) {
    case "image/jpeg":
      return "jpg";
    case "image/webp":
      return "webp";
    default:
      return "png";
  }
}
function getCanvasBlob(canvas, { type, quality } = {}) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Export failed."));
      },
      type,
      quality
    );
  });
}
async function toBlob(shader, options = {}) {
  shader.draw();
  const { canvas } = shader;
  return canvas instanceof HTMLCanvasElement ? getCanvasBlob(canvas, options) : canvas.convertToBlob(options);
}
async function save(shader, filename, text, options = {}) {
  const normalizedFilename = filename && /\.[a-z0-9]+$/i.test(filename) ? filename : `${filename || "export"}.${getDefaultExtension(options.type)}`;
  const blob = await toBlob(shader, options);
  if (!options.preventShare && typeof navigator !== "undefined" && navigator.share) {
    try {
      const file = new File([blob], normalizedFilename, { type: blob.type });
      const shareData = { files: [file] };
      if (text) shareData.text = text;
      if (!navigator.canShare || navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return;
      }
    } catch (err) {
      if (err?.name === "AbortError") return;
    }
  }
  const downloadLink = document.createElement("a");
  downloadLink.download = normalizedFilename;
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.click();
  URL.revokeObjectURL(downloadLink.href);
}
function createFullscreenCanvas(container) {
  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.inset = "0";
  canvas.style.height = "100dvh";
  canvas.style.width = "100dvw";
  (container || document.body).appendChild(canvas);
  return canvas;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createFullscreenCanvas,
  save,
  toBlob
});
//# sourceMappingURL=util.js.map