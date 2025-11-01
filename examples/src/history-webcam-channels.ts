import ShaderPad, { history, WithHistory } from 'shaderpad';

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

let shader: WithHistory<ShaderPad> | null = null;
let video: HTMLVideoElement | null = null;
let outputCanvas: HTMLCanvasElement | null = null;

export async function init() {
	const fragmentShaderSrc = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 outColor;
uniform highp sampler2DArray u_webcam;
uniform int u_frame;

void main() {
	vec2 uv = vec2(1.0 - v_uv.x, v_uv.y); // Selfie mode: flip X-axis.
	int historyDepth = textureSize(u_webcam, 0).z;

	vec4 redChannel = texture(u_webcam, vec3(uv, u_frame % historyDepth));
	vec4 greenChannel = texture(u_webcam, vec3(uv, (u_frame + historyDepth - ${FRAME_DELAY_PER_CHANNEL}) % historyDepth));
	vec4 blueChannel = texture(u_webcam, vec3(uv, (u_frame + historyDepth - ${
		FRAME_DELAY_PER_CHANNEL * 2
	}) % historyDepth));

	outColor = vec4(redChannel.r, greenChannel.g, blueChannel.b, 1.0);
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
		plugins: [history()],
	}) as WithHistory<ShaderPad>;
	shader.initializeTexture('u_webcam', video, FRAME_DELAY_PER_CHANNEL * 2 + 1);

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
