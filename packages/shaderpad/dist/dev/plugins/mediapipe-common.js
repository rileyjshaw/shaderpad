Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

//#region src/plugins/mediapipe-common.ts
const dummyTexture = {
	data: new Uint8Array(4),
	width: 1,
	height: 1
};
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
		if (resource) sharedResources.set(key, resource);
		return resource;
	}).finally(() => {
		if (sharedResourcePromises.get(key) === promise) sharedResourcePromises.delete(key);
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
const DEFAULT_WASM_BASE_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm";
const filesetPromises = /* @__PURE__ */ new Map();
function getSharedFileset(wasmBaseUrl = DEFAULT_WASM_BASE_URL) {
	const existing = filesetPromises.get(wasmBaseUrl);
	if (existing) return existing;
	const promise = import("@mediapipe/tasks-vision").then(({ FilesetResolver }) => FilesetResolver.forVisionTasks(wasmBaseUrl)).catch((error) => {
		filesetPromises.delete(wasmBaseUrl);
		throw error;
	});
	filesetPromises.set(wasmBaseUrl, promise);
	return promise;
}
function generateGLSLFn(history) {
	return {
		historyParams: history ? ", framesAgo" : "",
		fn: history ? (returnType, name, args, body) => {
			const argsOnly = args.replace(/\w+ /g, "");
			return `${returnType} ${name}(${args ? `${args}, int framesAgo` : "int framesAgo"}) {\n${body}\n}
${returnType} ${name}(${args}) { return ${name}(${argsOnly ? `${argsOnly}, 0` : "0"}); }`;
		} : (returnType, name, args, body) => `${returnType} ${name}(${args}) {\n${body}\n}`
	};
}

//#endregion
exports.DEFAULT_WASM_BASE_URL = DEFAULT_WASM_BASE_URL;
exports.calculateBoundingBoxCenter = calculateBoundingBoxCenter;
exports.dummyTexture = dummyTexture;
exports.generateGLSLFn = generateGLSLFn;
exports.getOrCreateSharedResource = getOrCreateSharedResource;
exports.getSharedFileset = getSharedFileset;
exports.hashOptions = hashOptions;
exports.isMediaPipeSource = isMediaPipeSource;
//# sourceMappingURL=mediapipe-common.js.map