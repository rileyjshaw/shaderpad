import ShaderPad, { PluginContext } from '../index';

declare module '../index' {
	interface ShaderPad {
		save(filename: string): Promise<void>;
	}
}

function save() {
	return function (shaderPad: ShaderPad, context: PluginContext) {
		const { gl, canvas } = context;
		const downloadLink = document.createElement('a');

		(shaderPad as any).save = async function (filename: string) {
			gl.clear(gl.COLOR_BUFFER_BIT);
			gl.drawArrays(gl.TRIANGLES, 0, 6);

			if (filename && !`${filename}`.toLowerCase().endsWith('.png')) {
				filename = `${filename}.png`;
			}
			filename = filename || 'export.png';
			if ('ongesturechange' in window) {
				// Mobile.
				try {
					const blob: Blob = await new Promise(resolve =>
						canvas.toBlob(resolve as BlobCallback, 'image/png')
					);
					const file = new File([blob], filename, { type: blob.type });

					if (navigator.canShare?.({ files: [file] })) {
						await navigator.share({ files: [file] });
						return;
					}
				} catch (error) {
					console.warn('Web Share API failed:', error);
				}
			} else {
				// Desktop.
				downloadLink.download = filename;
				downloadLink.href = canvas.toDataURL();
				downloadLink.click();
			}
		};
	};
}

// Type helper.
export type WithSave<T extends ShaderPad> = T & {
	save(filename: string): Promise<void>;
};

export default save;
