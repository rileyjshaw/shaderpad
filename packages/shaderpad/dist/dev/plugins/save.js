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

// src/plugins/save.ts
var save_exports = {};
__export(save_exports, {
  default: () => save_default
});
module.exports = __toCommonJS(save_exports);
function save() {
  return function(shaderPad, context) {
    const { gl, canvas } = context;
    const downloadLink = document.createElement("a");
    shaderPad.save = async function(filename, text, options = {}) {
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (filename && !`${filename}`.toLowerCase().endsWith(".png")) {
        filename = `${filename}.png`;
      }
      filename = filename || "export.png";
      const blob = await (canvas instanceof HTMLCanvasElement ? new Promise((resolve) => canvas.toBlob(resolve, "image/png")) : canvas.convertToBlob({ type: "image/png" }));
      if (!options.preventShare && navigator.share) {
        try {
          const file = new File([blob], filename, {
            type: blob.type
          });
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
      downloadLink.download = filename;
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.click();
      URL.revokeObjectURL(downloadLink.href);
    };
  };
}
var save_default = save;
//# sourceMappingURL=save.js.map