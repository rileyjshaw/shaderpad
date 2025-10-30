import ShaderPad, { PluginContext } from '../index';

export function history(depth: number = 2) {
	if (depth < 2) {
		throw new Error('History depth must be greater than 1');
	}

	return function (shaderPad: ShaderPad, context: PluginContext) {
		let historyTexture: WebGLTexture | null = null;
		const { gl, uniforms } = context;

		shaderPad.registerHook('init', initializeHistoryBuffer);
		shaderPad.registerHook('step', (_time: number, frame: number) => {
			const writeIdx = frame % depth;

			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D_ARRAY, historyTexture);
			gl.copyTexSubImage3D(
				gl.TEXTURE_2D_ARRAY,
				0,
				0,
				0,
				writeIdx,
				0,
				0,
				gl.drawingBufferWidth,
				gl.drawingBufferHeight
			);
		});
		shaderPad.registerHook('updateResolution', () => {
			gl.deleteTexture(historyTexture);
			initializeHistoryBuffer();
		});
		shaderPad.registerHook('reset', clearHistory);
		shaderPad.registerHook('destroy', () => {
			gl.deleteTexture(historyTexture);
			historyTexture = null;
		});

		function initializeHistoryBuffer() {
			historyTexture = gl.createTexture();
			if (!historyTexture) {
				throw new Error('Failed to create history texture');
			}
			gl.bindTexture(gl.TEXTURE_2D_ARRAY, historyTexture);
			gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 1, gl.RGBA8, gl.drawingBufferWidth, gl.drawingBufferHeight, depth);
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D_ARRAY, historyTexture);

			clearHistory();

			if (!uniforms.has('u_history')) {
				shaderPad.initializeUniform('u_history', 'int', 0);
			}
		}

		function clearHistory() {
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D_ARRAY, historyTexture);
			const transparent = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4);
			for (let layer = 0; layer < depth; ++layer) {
				gl.texSubImage3D(
					gl.TEXTURE_2D_ARRAY,
					0,
					0,
					0,
					layer,
					gl.drawingBufferWidth,
					gl.drawingBufferHeight,
					1,
					gl.RGBA,
					gl.UNSIGNED_BYTE,
					transparent
				);
			}
		}
	};
}
