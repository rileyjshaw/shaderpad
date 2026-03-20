/**
 * Webcam into a real single-channel R8 texture. One ShaderPad renders grayscale
 * into an offscreen pass; a second ShaderPad chains that result with history to
 * show that reduced-channel textures can be rendered, passed around, and read.
 */
import ShaderPad from 'shaderpad';
import helpers from 'shaderpad/plugins/helpers';

import { getWebcamVideo, stopVideoStream } from '@/examples/demo-utils';
import type { ExampleContext } from '@/examples/runtime';

const SIZE = 256;
const HISTORY_LENGTH = 12;

export async function init({ mount }: ExampleContext) {
	const bwFragmentSrc = `#version 300 es
precision mediump float;

in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_webcam;

void main() {
	vec4 webcamColor = texture(u_webcam, vec2(1.0 - v_uv.x, v_uv.y));
	float gray = dot(webcamColor.rgb, vec3(0.299, 0.587, 0.114));
	outColor = vec4(gray, gray, gray, 1.0);
}`;

	const historyFragmentSrc = `#version 300 es
precision mediump float;

in vec2 v_uv;
out vec4 outColor;
uniform highp sampler2DArray u_input;
uniform int u_inputFrameOffset;

void main() {
	float zCurrent = historyZ(u_input, u_inputFrameOffset, 0);
	float zPast = historyZ(u_input, u_inputFrameOffset, ${HISTORY_LENGTH});
	vec2 uv = vec2(v_uv.x, v_uv.y);
	float z = v_uv.x < 0.5 ? zPast : zCurrent;
	float gray = texture(u_input, vec3(uv, z)).r;
	outColor = vec4(gray, gray, gray, 1.0);
}`;

	const container = document.createElement('div');
	container.className = 'canvas-container';
	mount.appendChild(container);

	const video = await getWebcamVideo();

	const canvasBwOffscreen = new OffscreenCanvas(SIZE, SIZE);

	const canvasHistory = document.createElement('canvas');
	canvasHistory.width = SIZE;
	canvasHistory.height = SIZE;
	container.appendChild(canvasHistory);

	const padOptions = {
		internalFormat: 'R8' as const,
		format: 'RED' as const,
		type: 'UNSIGNED_BYTE' as const,
	};

	const bwPad = new ShaderPad(bwFragmentSrc, {
		canvas: canvasBwOffscreen,
		...padOptions,
	});
	bwPad.initializeTexture('u_webcam', video);

	const historyPad = new ShaderPad(historyFragmentSrc, {
		canvas: canvasHistory,
		plugins: [helpers()],
		...padOptions,
	});
	historyPad.initializeTexture('u_input', bwPad, { history: HISTORY_LENGTH, ...padOptions });

	historyPad.play(() => {
		bwPad.updateTextures({ u_webcam: video });
		bwPad.draw();
		historyPad.updateTextures({ u_input: bwPad });
	});

	return () => {
		bwPad.destroy();
		historyPad.destroy();
		stopVideoStream(video);
		container.remove();
	};
}
