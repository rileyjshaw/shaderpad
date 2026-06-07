Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

//#region src/util.ts
function getDefaultExtension(type) {
	switch (type?.toLowerCase()) {
		case "image/jpeg": return "jpg";
		case "image/webp": return "webp";
		default: return "png";
	}
}
function getCanvasBlob(canvas, { type, quality } = {}) {
	return new Promise((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (blob) resolve(blob);
			else reject(/* @__PURE__ */ new Error("Export failed."));
		}, type, quality);
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
	if (!options.preventShare && typeof navigator !== "undefined" && navigator.share) try {
		const shareData = { files: [new File([blob], normalizedFilename, { type: blob.type })] };
		if (text) shareData.text = text;
		if (!navigator.canShare || navigator.canShare(shareData)) {
			await navigator.share(shareData);
			return;
		}
	} catch (err) {
		if (err?.name === "AbortError") return;
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

//#endregion
exports.createFullscreenCanvas = createFullscreenCanvas;
exports.save = save;
exports.toBlob = toBlob;
//# sourceMappingURL=util.js.map