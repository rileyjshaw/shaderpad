/**
 * Echo effect on webcam using texture history. Combines multiple
 * time-delayed frames with easing for smooth trails.
 */
import ShaderPad from 'shaderpad';
import helpers from 'shaderpad/plugins/helpers';

const FRAME_DELAY_PER_ECHO = 20;
const N_ECHOES = 8;

const maxFrameDelay = FRAME_DELAY_PER_ECHO * (N_ECHOES - 1) + 1;
const dimmingFactor = 2 / (N_ECHOES + 1) / N_ECHOES;

function toFloatStr(n: number) {
	const s = n.toString();
	return s.includes('.') ? s : s + '.0';
}

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
let outputCanvas: HTMLCanvasElement | null = null;

export async function init() {
	const fragmentShaderSrc = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 outColor;
uniform highp sampler2DArray u_webcam;
uniform int u_webcamFrameOffset;
uniform int u_frame;

float easeIn(float t) {
	return pow(t, 1.5);
}

void main() {
	vec2 uv = fitCover(vec2(1.0 - v_uv.x, v_uv.y), vec2(textureSize(u_webcam, 0)));

	vec3 color = vec3(0.0);
	for (int i = 0; i < ${N_ECHOES}; ++i) {
		int frameOffset = int(easeIn(float(i) / ${toFloatStr(N_ECHOES)}) * ${toFloatStr(N_ECHOES * FRAME_DELAY_PER_ECHO)});
		vec3 echo = texture(u_webcam, vec3(uv, historyZ(u_webcam, u_webcamFrameOffset, frameOffset))).rgb;
		color += echo * ${toFloatStr(dimmingFactor)} * float(${N_ECHOES} - i);
	}

	outColor = vec4(color, 1.0);
}`;

	video = await getWebcamStream();

	shader = new ShaderPad(fragmentShaderSrc, { plugins: [helpers()] });
	shader.initializeTexture('u_webcam', video, { history: maxFrameDelay });

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

	if (outputCanvas) {
		outputCanvas.remove();
		outputCanvas = null;
	}
}
