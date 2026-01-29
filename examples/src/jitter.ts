import ShaderPad from 'shaderpad';
import helpers from 'shaderpad/plugins/helpers';

const FRAME_DELAY_PER_ECHO = 10;
const N_ECHOES = 3;

const maxFrameDelay = FRAME_DELAY_PER_ECHO * (N_ECHOES - 1) + 1;
const dimmingFactor = 2 / (N_ECHOES + 1);

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

float easeInCubic(float t) {
	return t * t * t;
}

void main() {
	vec2 uv = vec2(1.0 - v_uv.x, v_uv.y);

	vec3 color = vec3(0.0);
	for (int i = 0; i < ${N_ECHOES}; ++i) {
		float frameOffset = easeInCubic(float(i * ${FRAME_DELAY_PER_ECHO}) / ${N_ECHOES}.0) * ${N_ECHOES}.0;
		vec3 echo = texture(u_webcam, vec3(uv, historyZ(u_webcam, u_webcamFrameOffset, int(frameOffset)))).rgb;
		color += echo * ${dimmingFactor.toFixed(1)} / float(i + 1);
	}

	outColor = vec4(color, 1.0);
}`;

	video = await getWebcamStream();

	outputCanvas = document.createElement('canvas');
	outputCanvas.width = video.videoWidth * 2;
	outputCanvas.height = video.videoHeight * 2;
	outputCanvas.style.position = 'fixed';
	outputCanvas.style.inset = '0';
	outputCanvas.style.width = '100vw';
	outputCanvas.style.height = '100vh';
	outputCanvas.style.objectFit = 'cover';
	document.body.appendChild(outputCanvas);

	shader = new ShaderPad(fragmentShaderSrc, {
		canvas: outputCanvas,
		plugins: [helpers()],
	});
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
