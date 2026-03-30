// src/plugins/save.ts
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
export {
  save_default as default
};
//# sourceMappingURL=save.mjs.map