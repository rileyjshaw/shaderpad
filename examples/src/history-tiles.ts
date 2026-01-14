/**
 * History buffer as a grid. Each tile shows a different frame from the
 * history buffer using helpers plugin.
 */
import ShaderPad from 'shaderpad';
import helpers from 'shaderpad/plugins/helpers';

const COLORS = [
	[1, 0, 0],
	[1, 0, 0.5],
	[0.5, 0, 1],
	[0, 0, 1],
];
const HISTORY_LENGTH = COLORS.length;

let shader: ShaderPad | null = null;
let outputCanvas: HTMLCanvasElement | null = null;

export async function init() {
	const fragmentShaderSrc = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 outColor;
uniform int u_frame;
uniform highp sampler2DArray u_history;
uniform int u_historyFrameOffset;

void main() {
	// Flash each color for one frame.
	${COLORS.map(
		(color, i) => `if (u_frame == ${i}) {
		outColor = vec4(${color.map(c => c.toFixed(1)).join(', ')}, 1.0);
	} else `
	).join('')} if (u_frame == ${HISTORY_LENGTH}) {
		// Show the prior frames as columns.
		float scaledX = v_uv.x * ${HISTORY_LENGTH}.0;
		int age = ${HISTORY_LENGTH} - 1 - int(scaledX); // We want the first column on the left to have the highest “age”.
		vec2 historyUV = vec2(fract(scaledX), v_uv.y);
		vec4 historyColor = texture(u_history, vec3(historyUV, historyZ(u_history, u_historyFrameOffset, age)));
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
		history: HISTORY_LENGTH,
		plugins: [helpers()],
	});

	shader.play((_t, frame) => {
		// Pause for inspection now that the history buffer is full.
		if (frame >= HISTORY_LENGTH + 1) shader!.pause();
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
