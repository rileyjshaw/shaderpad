import ShaderPad, { history } from 'shaderpad';

const historyLength = 4;

let shader: ShaderPad | null = null;
let outputCanvas: HTMLCanvasElement | null = null;

export async function init() {
	const fragmentShaderSrc = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 outColor;
uniform int u_frame;
uniform highp sampler2DArray u_history;

void main() {
    if (u_frame == 0) {
        outColor = vec4(1.0, 0.0, 0.0, 1.0);
    } else if (u_frame == 1) {
        outColor = vec4(1.0, 0.0, 0.5, 1.0);
    } else if (u_frame == 2) {
        outColor = vec4(0.5, 0.0, 1.0, 1.0);
    } else if (u_frame == 3) {
        outColor = vec4(0.0, 0.0, 1.0, 1.0);
    } else if (u_frame == 4) {
        // Show the prior 4 frames as columns.
        float scaledX = v_uv.x * 4.0;
        float columnX = floor(scaledX);
        vec2 historyUV = vec2(fract(scaledX), v_uv.y);
        vec4 historyColor = texture(u_history, vec3(historyUV, columnX));
        outColor = historyColor;
    }
}`;

	outputCanvas = document.createElement('canvas');
	outputCanvas.width = 32;
	outputCanvas.height = 32;
	outputCanvas.style.position = 'fixed';
	outputCanvas.style.inset = '0';
	outputCanvas.style.width = '100vw';
	outputCanvas.style.height = '100vh';
	document.body.appendChild(outputCanvas);

	shader = new ShaderPad(fragmentShaderSrc, {
		canvas: outputCanvas,
		plugins: [history(historyLength)],
	});

	shader.play((_t, frame) => {
		if (frame >= 5) {
			console.log('History is full; pausing the shader.');
			shader!.pause();
		}
	});
}

export function destroy() {
	if (shader) {
		shader.destroy();
		shader = null;
	}

	if (outputCanvas) {
		outputCanvas.remove();
		outputCanvas = null;
	}
}
