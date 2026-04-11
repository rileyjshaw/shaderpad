import type ShaderPad from '.';

export interface ToBlobOptions {
	type?: string;
	quality?: number;
}

export interface SaveOptions extends ToBlobOptions {
	preventShare?: boolean;
}

function getDefaultExtension(type?: string) {
	switch (type?.toLowerCase()) {
		case 'image/jpeg':
			return 'jpg';
		case 'image/webp':
			return 'webp';
		default:
			return 'png';
	}
}

function getCanvasBlob(canvas: HTMLCanvasElement, { type, quality }: ToBlobOptions = {}) {
	return new Promise<Blob>((resolve, reject) => {
		canvas.toBlob(
			blob => {
				if (blob) resolve(blob);
				else reject(new Error('Export failed.'));
			},
			type,
			quality,
		);
	});
}

export async function toBlob(shader: ShaderPad, options: ToBlobOptions = {}) {
	shader.draw();
	const { canvas } = shader;
	return canvas instanceof HTMLCanvasElement ? getCanvasBlob(canvas, options) : canvas.convertToBlob(options);
}

export async function save(shader: ShaderPad, filename?: string, text?: string, options: SaveOptions = {}) {
	const normalizedFilename =
		filename && /\.[a-z0-9]+$/i.test(filename)
			? filename
			: `${filename || 'export'}.${getDefaultExtension(options.type)}`;
	const blob = await toBlob(shader, options);

	if (!options.preventShare && typeof navigator !== 'undefined' && navigator.share) {
		try {
			const file = new File([blob], normalizedFilename, { type: blob.type });
			const shareData: ShareData = { files: [file] };
			if (text) shareData.text = text;
			if (!navigator.canShare || navigator.canShare(shareData)) {
				await navigator.share(shareData);
				return;
			}
		} catch (err: any) {
			if (err?.name === 'AbortError') return;
		}
	}

	const downloadLink = document.createElement('a');
	downloadLink.download = normalizedFilename;
	downloadLink.href = URL.createObjectURL(blob);
	downloadLink.click();
	URL.revokeObjectURL(downloadLink.href);
}

export function createFullscreenCanvas(container?: HTMLElement): HTMLCanvasElement {
	const canvas = document.createElement('canvas');
	canvas.style.position = 'fixed';
	canvas.style.inset = '0';
	canvas.style.height = '100dvh';
	canvas.style.width = '100dvw';
	(container || document.body).appendChild(canvas);
	return canvas;
}
