/**
 * History buffer as a grid. Each tile shows a different frame from the
 * history buffer using helpers plugin.
 */
import ShaderPad from 'shaderpad';
import helpers from 'shaderpad/plugins/helpers';
import { createFullscreenCanvas } from 'shaderpad/util';

import type { ExampleContext } from '@/examples/runtime';

const COLORS = [
	[1, 0, 0],
	[1, 0, 0.5],
	[0.5, 0, 1],
	[0, 0, 1],
];
const HISTORY_LENGTH = COLORS.length;

export async function init({ mount }: ExampleContext) {
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

	const outputCanvas = createFullscreenCanvas(mount);
	outputCanvas.width = HISTORY_LENGTH;
	outputCanvas.height = 1;
	outputCanvas.style.imageRendering = 'pixelated';

	const shader = new ShaderPad(fragmentShaderSrc, {
		canvas: outputCanvas,
		history: HISTORY_LENGTH,
		plugins: [helpers()],
		minFilter: 'NEAREST',
		magFilter: 'NEAREST',
	});

	shader.on('afterStep', (_time: number, frame: number) => {
		if (frame > HISTORY_LENGTH) shader.pause();
	});
	shader.play();

	return () => {
		shader.destroy();
		outputCanvas.remove();
	};
}
