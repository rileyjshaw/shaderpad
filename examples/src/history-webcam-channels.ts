/**
 * RGB channel separation effect. Each channel samples from different
 * frames using texture history.
 */
import ShaderPad from 'shaderpad';
import helpers from 'shaderpad/plugins/helpers';
import autosize from 'shaderpad/plugins/autosize';
import { createFullscreenCanvas } from 'shaderpad/util';

const FRAME_DELAY_PER_CHANNEL = 15;

async function getWebcamStream() {
	const video = document.createElement('video');
	video.autoplay = video.playsInline = true;

	try {
		const stream = await navigator.mediaDevices.getUserMedia({
			video: {
				width: 640,
			},
		});
		video.srcObject = stream;
		await new Promise(resolve => (video.onloadedmetadata = resolve));
	} catch (error) {
		console.error('Error accessing webcam:', error);
		throw error;
	}

	return video;
}

let shader: ShaderPad | null = null;
let video: HTMLVideoElement | null = null;
let canvas: HTMLCanvasElement | null = null;

export async function init() {
	const fragmentShaderSrc = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 outColor;
uniform highp sampler2DArray u_webcam;
uniform int u_webcamFrameOffset;
uniform int u_frame;

void main() {
	vec2 uv = fitCover(vec2(1.0 - v_uv.x, v_uv.y), vec2(textureSize(u_webcam, 0)));

	vec4 redChannel = texture(u_webcam, vec3(uv, historyZ(u_webcam, u_webcamFrameOffset, 0)));
	vec4 greenChannel = texture(u_webcam, vec3(uv, historyZ(u_webcam, u_webcamFrameOffset, ${FRAME_DELAY_PER_CHANNEL})));
	vec4 blueChannel = texture(u_webcam, vec3(uv, historyZ(u_webcam, u_webcamFrameOffset, ${FRAME_DELAY_PER_CHANNEL * 2})));

	outColor = vec4(redChannel.r, greenChannel.g, blueChannel.b, 1.0);
}`;

	video = await getWebcamStream();
	canvas = createFullscreenCanvas();
	shader = new ShaderPad(fragmentShaderSrc, {
		canvas,
		plugins: [helpers(), autosize()],
	});
	shader.initializeTexture('u_webcam', video, { history: FRAME_DELAY_PER_CHANNEL * 2 + 1 });
	shader.play(() => {
		shader!.updateTextures({ u_webcam: video! });
	});
}

export function destroy() {
	if (shader) {
		shader.destroy();
		shader = null;
	}

	if (video) {
		video.srcObject = null;
		video.remove();
		video = null;
	}

	if (canvas) {
		canvas.remove();
		canvas = null;
	}
}
