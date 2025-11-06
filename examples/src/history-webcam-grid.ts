import ShaderPad, { helpers } from 'shaderpad';

const FRAME_RATE = 24;
const GRID_LENGTH = 5;
const GRID_SIZE = GRID_LENGTH * GRID_LENGTH;
const FRAMES_PER_SQUARE = 5;

async function getWebcamStream() {
	const video = document.createElement('video');
	video.autoplay = video.playsInline = true;

	try {
		const stream = await navigator.mediaDevices.getUserMedia({
			video: {
				width: 480,
				frameRate: FRAME_RATE,
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
let frameCallbackHandle: number | null = null;

let webcamFrame = 0;
function startFrameCallback() {
	if (video && shader && !frameCallbackHandle) {
		const callback = () => {
			if (shader && video) {
				shader.updateUniforms({ u_webcamFrame: webcamFrame });
				shader.updateTextures({ u_webcam: video });
				frameCallbackHandle = video.requestVideoFrameCallback(callback);
				webcamFrame++;
			} else {
				frameCallbackHandle = null;
			}
		};
		frameCallbackHandle = video.requestVideoFrameCallback(callback);
	}
}

function stopFrameCallback() {
	if (frameCallbackHandle !== null && video) {
		video.cancelVideoFrameCallback(frameCallbackHandle);
		frameCallbackHandle = null;
		webcamFrame = 0;
	}
}

export async function init() {
	const fragmentShaderSrc = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 outColor;
uniform int u_webcamFrame;
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

	video = await getWebcamStream();

	outputCanvas = document.createElement('canvas');
	outputCanvas.width = video.videoWidth * 2;
	outputCanvas.height = video.videoHeight * 2;
	outputCanvas.style.position = 'fixed';
	outputCanvas.style.inset = '0';
	outputCanvas.style.width = '100vw';
	outputCanvas.style.height = '100vh';
	document.body.appendChild(outputCanvas);

	shader = new ShaderPad(fragmentShaderSrc, {
		canvas: outputCanvas,
		plugins: [helpers()],
	});
	shader.initializeUniform('u_webcamFrame', 'int', 0);
	shader.initializeTexture('u_webcam', video, { history: GRID_SIZE * FRAMES_PER_SQUARE });

	shader.play();
	startFrameCallback();
}

export function destroy() {
	stopFrameCallback();

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
