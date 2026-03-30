// src/util.ts
function createFullscreenCanvas(container) {
  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.inset = "0";
  canvas.style.height = "100dvh";
  canvas.style.width = "100dvw";
  (container || document.body).appendChild(canvas);
  return canvas;
}
export {
  createFullscreenCanvas
};
//# sourceMappingURL=util.mjs.map