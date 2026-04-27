import { TextureSource } from '..';

export const dummyTexture = { data: new Uint8Array(4), width: 1, height: 1 };

export type MediaPipeSource = HTMLVideoElement | HTMLImageElement | HTMLCanvasElement | OffscreenCanvas;

export function isMediaPipeSource(source: TextureSource): source is MediaPipeSource {
	return (
		source instanceof HTMLVideoElement ||
		source instanceof HTMLImageElement ||
		source instanceof HTMLCanvasElement ||
		source instanceof OffscreenCanvas
	);
}

export function hashOptions(options: object): string {
	return JSON.stringify(options, Object.keys(options).sort());
}

export function getOrCreateSharedResource<T>(
	key: string,
	sharedResources: Map<string, T>,
	sharedResourcePromises: Map<string, Promise<T | undefined>>,
	create: () => Promise<T | undefined>,
): Promise<T | undefined> {
	const existing = sharedResources.get(key);
	if (existing) return Promise.resolve(existing);

	const pending = sharedResourcePromises.get(key);
	if (pending) return pending;

	let promise: Promise<T | undefined>;
	promise = create()
		.then(resource => {
			if (resource) {
				sharedResources.set(key, resource);
			}
			return resource;
		})
		.finally(() => {
			if (sharedResourcePromises.get(key) === promise) {
				sharedResourcePromises.delete(key);
			}
		});
	sharedResourcePromises.set(key, promise);
	return promise;
}

export function calculateBoundingBoxCenter(
	data: Float32Array,
	entityIdx: number,
	landmarkIndices: readonly number[] | number[],
	landmarkCount: number,
	offset: number = 0,
): [number, number, number, number] {
	let minX = Infinity,
		maxX = -Infinity,
		minY = Infinity,
		maxY = -Infinity,
		avgZ = 0,
		avgVisibility = 0;

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
		avgVisibility / landmarkIndices.length,
	];
}

export const DEFAULT_WASM_BASE_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm';

const filesetPromises = new Map<string, Promise<any>>();

export function getSharedFileset(wasmBaseUrl: string = DEFAULT_WASM_BASE_URL): Promise<any> {
	const existing = filesetPromises.get(wasmBaseUrl);
	if (existing) return existing;

	const promise = import('@mediapipe/tasks-vision')
		.then(({ FilesetResolver }) => FilesetResolver.forVisionTasks(wasmBaseUrl))
		.catch(error => {
			filesetPromises.delete(wasmBaseUrl);
			throw error;
		});
	filesetPromises.set(wasmBaseUrl, promise);
	return promise;
}

export function generateGLSLFn(history: number | undefined) {
	const historyParams = history ? ', framesAgo' : '';
	const fn = history
		? (returnType: string, name: string, args: string, body: string) => {
				const argsOnly = args.replace(/\w+ /g, '');
				const historyArgs = args ? `${args}, int framesAgo` : 'int framesAgo';
				const callArgs = argsOnly ? `${argsOnly}, 0` : '0';
				return `${returnType} ${name}(${historyArgs}) {\n${body}\n}
${returnType} ${name}(${args}) { return ${name}(${callArgs}); }`;
			}
		: (returnType: string, name: string, args: string, body: string) =>
				`${returnType} ${name}(${args}) {\n${body}\n}`;
	return { historyParams, fn };
}
