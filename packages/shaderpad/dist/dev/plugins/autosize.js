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

// src/plugins/autosize.ts
var autosize_exports = {};
__export(autosize_exports, {
  default: () => autosize_default
});
module.exports = __toCommonJS(autosize_exports);
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
//# sourceMappingURL=autosize.js.map