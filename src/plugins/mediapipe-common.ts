import { TextureSource } from '..';

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

export function calculateBoundingBoxCenter(
	data: Float32Array,
	entityIdx: number,
	landmarkIndices: readonly number[] | number[],
	landmarkCount: number
): [number, number, number, number] {
	let minX = Infinity,
		maxX = -Infinity,
		minY = Infinity,
		maxY = -Infinity,
		avgZ = 0,
		avgVisibility = 0;

	for (const idx of landmarkIndices) {
		const dataIdx = (entityIdx * landmarkCount + idx) * 4;
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

let filesetPromise: Promise<any> | null = null;
export function getSharedFileset(): Promise<any> {
	if (!filesetPromise) {
		filesetPromise = import('@mediapipe/tasks-vision').then(({ FilesetResolver }) =>
			FilesetResolver.forVisionTasks(
				`https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${__MEDIAPIPE_TASKS_VISION_VERSION__}/wasm`
			)
		);
	}
	return filesetPromise;
}
