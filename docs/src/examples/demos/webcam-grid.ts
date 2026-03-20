/**
 * Webcam history as a grid. Each cell shows a different frame from
 * the texture history buffer.
 */
import ShaderPad from 'shaderpad';
import helpers from 'shaderpad/plugins/helpers';
import { createFullscreenCanvas } from 'shaderpad/util';

import { getWebcamVideo, stopVideoStream } from '@/examples/demo-utils';
import type { ExampleContext } from '@/examples/runtime';

const FRAME_RATE = 24;
const GRID_LENGTH = 5;
const GRID_SIZE = GRID_LENGTH * GRID_LENGTH;
const FRAMES_PER_SQUARE = 5;

export async function init({ mount }: ExampleContext) {
	const fragmentShaderSrc = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 outColor;
uniform highp sampler2DArray u_webcam;
uniform int u_webcamFrameOffset;

const float GRID_LENGTH = ${GRID_LENGTH}.0;
const float FRAMES_PER_SQUARE = ${FRAMES_PER_SQUARE}.0;

void main() {
	vec2 scaledUV = v_uv * GRID_LENGTH;
	vec2 localUV = fract(scaledUV); // [0.0, 1.0]
	vec2 gridPos = floor(scaledUV); // [0.0, GRID_LENGTH - 1.0]

	// Calculate which history frame to show based on grid position.
	int framesAgo = int(FRAMES_PER_SQUARE * (GRID_LENGTH - gridPos.x - 1.0 + gridPos.y * GRID_LENGTH));
	float z = historyZ(u_webcam, u_webcamFrameOffset, framesAgo);
	outColor = texture(u_webcam, vec3(1.0 - localUV.x, localUV.y, z));
}`;

	const video = await getWebcamVideo({
		width: 480,
		frameRate: FRAME_RATE,
	});

	const outputCanvas = createFullscreenCanvas(mount);
	outputCanvas.width = video.videoWidth * 2;
	outputCanvas.height = video.videoHeight * 2;

	const shader = new ShaderPad(fragmentShaderSrc, {
		canvas: outputCanvas,
		plugins: [helpers()],
	});
	shader.initializeTexture('u_webcam', video, { history: GRID_SIZE * FRAMES_PER_SQUARE });
	let frameCallbackHandle: number | null = null;
	const callback = () => {
		shader.updateTextures({ u_webcam: video });
		shader.step();
		frameCallbackHandle = video.requestVideoFrameCallback(callback);
	};
	frameCallbackHandle = video.requestVideoFrameCallback(callback);

	return () => {
		if (frameCallbackHandle !== null) {
			video.cancelVideoFrameCallback(frameCallbackHandle);
		}
		shader.destroy();
		stopVideoStream(video);
		outputCanvas.remove();
	};
}
