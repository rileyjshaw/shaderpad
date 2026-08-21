Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: 'Module' } });
const require_util = require('../util-DAwznktR.js');

//#region src/plugins/deep-history.ts
const SHADER_OUTPUT = Symbol("SHADER_OUTPUT");
function accessorGLSL(accessorName, format, chunks, capacity) {
	const prefix = format.endsWith("I") ? format.endsWith("UI") ? "u" : "i" : "";
	const samplers = Array.from({ length: chunks }, (_, index) => `${accessorName}Chunk${index}`);
	return `${samplers.map((sampler) => `uniform highp ${prefix}sampler2DArray ${sampler};`).join("")}uniform int ${accessorName}Offset;${prefix}vec4 ${accessorName}(vec2 uv,int age){int slot=(${capacity}+${accessorName}Offset-age)%${capacity};${samplers.map((sampler, index) => `${index < chunks - 1 ? `if(slot%${chunks}==${index})` : ""}return texture(${sampler},vec3(uv,float(slot/${chunks})));`).join("")}}`;
}
function deepHistory(accessorName, initialSource, { history, chunks = 2, ...textureOptions }) {
	const isOutputHistory = initialSource === SHADER_OUTPUT;
	const capacity = history + 1;
	if (!/^[_a-zA-Z]\w*$/.test(accessorName) || !Number.isInteger(history) || history < 1 || !Number.isInteger(chunks) || chunks < 1 || chunks > capacity) throw require_util.spError(64, {
		name: accessorName,
		history,
		chunks
	});
	const textureNames = Array.from({ length: chunks }, (_, index) => `${accessorName}Chunk${index}`);
	const offsetName = `${accessorName}Offset`;
	let [width, height] = isOutputHistory ? [0, 0] : require_util.getSourceDimensions(initialSource);
	if (!isOutputHistory && (!width || !height)) throw require_util.spError(17, {
		name: accessorName,
		width,
		height,
		sourceType: initialSource.constructor.name
	});
	let installed = false;
	let active = false;
	let writeIndex = 0;
	let updateTexture;
	let shaderPad;
	const update = (source, historySlots) => {
		if (!active || !updateTexture || !shaderPad) throw require_util.spError(65, {
			name: accessorName,
			operation: "update"
		});
		const upload = updateTexture;
		const shader = shaderPad;
		const isPartial = "isPartial" in source && source.isPartial;
		const [nextWidth, nextHeight] = require_util.getSourceDimensions(source);
		if (!isPartial && nextWidth && nextHeight && (nextWidth !== width || nextHeight !== height)) {
			width = nextWidth;
			height = nextHeight;
			writeIndex = 0;
			const blank = {
				data: null,
				width,
				height
			};
			textureNames.forEach((textureName) => upload(textureName, blank));
		}
		if ("data" in source && source.data === null) return;
		const slots = historySlots === void 0 ? [writeIndex] : (Array.isArray(historySlots) ? historySlots : [historySlots]).map((slot) => (slot % capacity + capacity) % capacity);
		const chunkLayers = Array.from({ length: chunks }, () => []);
		slots.forEach((slot) => chunkLayers[slot % chunks].push(Math.floor(slot / chunks)));
		chunkLayers.forEach((layers, chunk) => {
			if (layers.length) upload(textureNames[chunk], source, layers.length === 1 ? layers[0] : layers);
		});
		shader.updateUniforms({ [offsetName]: slots[slots.length - 1] }, { allowMissing: true });
		if (historySlots === void 0) writeIndex = (writeIndex + 1) % capacity;
	};
	const plugin = (shader, context) => {
		if (installed) throw require_util.spError(65, {
			name: accessorName,
			operation: "install"
		});
		installed = true;
		shaderPad = shader;
		updateTexture = context.updateTexture;
		if (isOutputHistory) {
			textureOptions.minFilter ??= context.options.minFilter;
			textureOptions.magFilter ??= context.options.magFilter;
			textureOptions.wrapS ??= context.options.wrapS;
			textureOptions.wrapT ??= context.options.wrapT;
			textureOptions.format = context.options.format;
		}
		const format = textureOptions.format ?? "RGBA8";
		const physicalDepth = Math.max(2, Math.ceil(capacity / chunks));
		const maxArrayTextureLayers = shader.gl.getParameter(shader.gl.MAX_ARRAY_TEXTURE_LAYERS);
		if (physicalDepth > maxArrayTextureLayers) throw require_util.spError(64, {
			name: accessorName,
			history,
			chunks,
			physicalDepth,
			maxArrayTextureLayers
		});
		context.injectGLSL(accessorGLSL(accessorName, format, chunks, capacity));
		shader.on("_init", () => {
			if (isOutputHistory) [width, height] = require_util.getSourceDimensions(shader);
			shader.initializeUniform(offsetName, "int", 0, { allowMissing: true });
			const blank = {
				data: null,
				width,
				height
			};
			textureNames.forEach((textureName) => shader.initializeTexture(textureName, blank, {
				...textureOptions,
				format,
				history: physicalDepth - 1
			}));
			active = true;
			if (!isOutputHistory) update(initialSource);
		});
		if (isOutputHistory) shader.on("postStep", (_time, _frame, options) => {
			if (!options?.skipHistory) update(shader);
		});
		shader.on("reset", () => {
			writeIndex = 0;
			shader.updateUniforms({ [offsetName]: 0 }, { allowMissing: true });
		});
		shader.on("destroy", () => {
			active = false;
			shaderPad = updateTexture = void 0;
		});
	};
	return isOutputHistory ? [plugin] : [plugin, update];
}

//#endregion
exports.SHADER_OUTPUT = SHADER_OUTPUT;
exports.default = deepHistory;
//# sourceMappingURL=deep-history.js.map