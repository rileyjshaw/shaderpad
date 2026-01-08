import ShaderPad, { PluginContext } from '../index';

declare module '../index' {
	interface ShaderPad {
		save(filename: string, text?: string): Promise<void>;
	}
}

function save() {
	return function (shaderPad: ShaderPad, context: PluginContext) {
		const { gl, canvas } = context;
		const downloadLink = document.createElement('a');

		(shaderPad as any).save = async function (filename: string, text?: string) {
			gl.clear(gl.COLOR_BUFFER_BIT);
			gl.drawArrays(gl.TRIANGLES, 0, 6);

			if (filename && !`${filename}`.toLowerCase().endsWith('.png')) {
				filename = `${filename}.png`;
			}
			filename = filename || 'export.png';

			const blob: Blob = await (canvas instanceof HTMLCanvasElement
				? new Promise(resolve => canvas.toBlob(resolve as BlobCallback, 'image/png'))
				: canvas.convertToBlob({ type: 'image/png' }));

			if ('ongesturechange' in window) {
				// Mobile.
				try {
					const file = new File([blob], filename, { type: blob.type });
					const shareData: ShareData = { files: [file] };
					if (text) shareData.text = text;

					if (navigator.canShare?.(shareData)) {
						await navigator.share(shareData);
						return;
					}
				} catch (error) {
					console.warn('Web Share API failed:', error);
				}
			}

			// Desktop / mobile fallback.
			downloadLink.download = filename;
			downloadLink.href = URL.createObjectURL(blob);
			downloadLink.click();
			URL.revokeObjectURL(downloadLink.href);
		};
	};
}

// Type helper.
export type WithSave<T extends ShaderPad> = T & {
	save(filename: string, text?: string): Promise<void>;
};

export default save;
