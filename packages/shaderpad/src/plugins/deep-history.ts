import type {
	GLFormatString,
	Plugin,
	PluginContext,
	StepOptions,
	TextureOptions,
	TextureSource,
	UpdateTextureSource,
} from '..';
import ShaderPad from '..';
import { getSourceDimensions, spError } from '../internal/util';

export const SHADER_OUTPUT = __SHADERPAD_DEV__ ? Symbol('SHADER_OUTPUT') : Symbol();

export interface DeepHistoryOptions extends TextureOptions {
	history: number;
	chunks?: number;
}

export type DeepOutputHistoryOptions = Omit<DeepHistoryOptions, 'format' | 'colorSpace' | 'preserveY'>;

export type DeepHistoryUpdater = (source: UpdateTextureSource, historySlots?: number | number[]) => void;

function accessorGLSL(accessorName: string, format: GLFormatString, chunks: number, capacity: number) {
	const prefix = format.endsWith('I') ? (format.endsWith('UI') ? 'u' : 'i') : '';
	const samplers = Array.from({ length: chunks }, (_, index) => `${accessorName}Chunk${index}`);
	const declarations = samplers.map(sampler => `uniform highp ${prefix}sampler2DArray ${sampler};`).join('');
	const samples = samplers
		.map(
			(sampler, index) =>
				`${index < chunks - 1 ? `if(slot%${chunks}==${index})` : ''}return texture(${sampler},vec3(uv,float(slot/${chunks})));`,
		)
		.join('');
	return `${declarations}uniform int ${accessorName}Offset;${prefix}vec4 ${accessorName}(vec2 uv,int age){int slot=(${capacity}+${accessorName}Offset-age)%${capacity};${samples}}`;
}

/**
 * Creates plugin-owned history arrays for a texture source or the shader output.
 */
function deepHistory(
	accessorName: string,
	initialSource: typeof SHADER_OUTPUT,
	options: DeepOutputHistoryOptions,
): [Plugin];
function deepHistory(
	accessorName: string,
	initialSource: TextureSource,
	options: DeepHistoryOptions,
): [Plugin, DeepHistoryUpdater];
function deepHistory(
	accessorName: string,
	initialSource: TextureSource | typeof SHADER_OUTPUT,
	{ history, chunks = 2, ...textureOptions }: DeepHistoryOptions,
): [Plugin] | [Plugin, DeepHistoryUpdater] {
	const isOutputHistory = initialSource === SHADER_OUTPUT;
	const capacity = history + 1;
	if (
		!/^[_a-zA-Z]\w*$/.test(accessorName) ||
		!Number.isInteger(history) ||
		history < 1 ||
		!Number.isInteger(chunks) ||
		chunks < 1 ||
		chunks > capacity
	) {
		throw spError(64, __SHADERPAD_DEV__ && { name: accessorName, history, chunks });
	}
	const textureNames = Array.from({ length: chunks }, (_, index) => `${accessorName}Chunk${index}`);
	const offsetName = `${accessorName}Offset`;
	let [width, height] = isOutputHistory ? [0, 0] : getSourceDimensions(initialSource);
	if (!isOutputHistory && (!width || !height)) {
		throw spError(
			17,
			__SHADERPAD_DEV__ && {
				name: accessorName,
				width,
				height,
				sourceType: initialSource.constructor.name,
			},
		);
	}

	let installed = false;
	let active = false;
	let writeIndex = 0;
	let updateTexture: PluginContext['updateTexture'] | undefined;
	let shaderPad: ShaderPad | undefined;

	const update: DeepHistoryUpdater = (source, historySlots) => {
		if (!active || !updateTexture || !shaderPad) {
			throw spError(65, __SHADERPAD_DEV__ && { name: accessorName, operation: 'update' });
		}
		const upload = updateTexture;
		const shader = shaderPad;

		const isPartial = 'isPartial' in source && source.isPartial;
		const [nextWidth, nextHeight] = getSourceDimensions(source);
		if (!isPartial && nextWidth && nextHeight && (nextWidth !== width || nextHeight !== height)) {
			width = nextWidth;
			height = nextHeight;
			writeIndex = 0;
			const blank = { data: null, width, height };
			textureNames.forEach(textureName => upload(textureName, blank));
		}
		if ('data' in source && source.data === null) return;

		const slots =
			historySlots === undefined
				? [writeIndex]
				: (Array.isArray(historySlots) ? historySlots : [historySlots]).map(
						slot => ((slot % capacity) + capacity) % capacity,
					);
		const chunkLayers = Array.from({ length: chunks }, () => [] as number[]);
		slots.forEach(slot => chunkLayers[slot % chunks].push(Math.floor(slot / chunks)));
		chunkLayers.forEach((layers, chunk) => {
			if (layers.length) upload(textureNames[chunk], source, layers.length === 1 ? layers[0] : layers);
		});
		shader.updateUniforms({ [offsetName]: slots[slots.length - 1] }, { allowMissing: true });
		if (historySlots === undefined) writeIndex = (writeIndex + 1) % capacity;
	};

	const plugin: Plugin = (shader, context) => {
		if (installed) throw spError(65, __SHADERPAD_DEV__ && { name: accessorName, operation: 'install' });
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
		const format = textureOptions.format ?? 'RGBA8';
		const physicalDepth = Math.max(2, Math.ceil(capacity / chunks));
		const maxArrayTextureLayers = shader.gl.getParameter(shader.gl.MAX_ARRAY_TEXTURE_LAYERS);
		if (physicalDepth > maxArrayTextureLayers) {
			throw spError(
				64,
				__SHADERPAD_DEV__ && {
					name: accessorName,
					history,
					chunks,
					physicalDepth,
					maxArrayTextureLayers,
				},
			);
		}

		context.injectGLSL(accessorGLSL(accessorName, format, chunks, capacity));
		shader.on('_init', () => {
			if (isOutputHistory) [width, height] = getSourceDimensions(shader);
			shader.initializeUniform(offsetName, 'int', 0, { allowMissing: true });
			const blank = { data: null, width, height };
			textureNames.forEach(textureName =>
				shader.initializeTexture(textureName, blank, {
					...textureOptions,
					format,
					history: physicalDepth - 1,
				}),
			);
			active = true;
			if (!isOutputHistory) update(initialSource as UpdateTextureSource);
		});
		if (isOutputHistory) {
			shader.on('postStep', (_time: number, _frame: number, options?: StepOptions) => {
				if (!options?.skipHistory) update(shader);
			});
		}
		shader.on('reset', () => {
			writeIndex = 0;
			shader.updateUniforms({ [offsetName]: 0 }, { allowMissing: true });
		});
		shader.on('destroy', () => {
			active = false;
			shaderPad = updateTexture = undefined;
		});
	};

	return isOutputHistory ? [plugin] : [plugin, update];
}

export default deepHistory;
