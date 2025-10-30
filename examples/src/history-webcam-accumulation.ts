import ShaderPad, { history } from 'shaderpad';

const gridLength = 5;
const gridSize = gridLength * gridLength;

async function getWebcamStream() {
	const video = document.createElement('video');
	video.autoplay = video.playsInline = true;

	try {
		const stream = await navigator.mediaDevices.getUserMedia({ video: true });
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
let isPlaying = true;
let keydownHandler: ((e: KeyboardEvent) => void) | null = null;

export async function init() {
	const fragmentShaderSrc = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 outColor;
uniform int u_frame;
uniform highp sampler2DArray u_history;
uniform sampler2D u_webcam;

void main() {
    const float gridLength = ${gridLength}.0;
    vec2 scaledUV = v_uv * gridLength;
    vec2 localUV = fract(scaledUV);
    vec2 gridPos = floor(scaledUV);

    // Calculate which history frame to show based on grid position
    int historyLength = textureSize(u_history, 0).z;
    int outputFrameIndex = u_frame % historyLength; // Index of the frame this full render will write to.
    float age = gridLength - gridPos.x + gridPos.y * gridLength - 1.0; // 25 is top left, 1 is bottom right.
    int historyIndex = (outputFrameIndex + historyLength - int(age)) % historyLength; // Newest frame is at the bottom right.

    vec4 historyColor = texture(u_history, vec3(localUV, float(historyIndex)));
    vec4 webcamColor = texture(u_webcam, vec2(1.0 - localUV.x, localUV.y));

    vec4 finalColor = vec4(mix(webcamColor, historyColor, step(0.5, age)).rgb, 1.0);
    outColor = finalColor;
}`;

	keydownHandler = (e: KeyboardEvent) => {
		switch (e.key) {
			case ' ':
				isPlaying = !isPlaying;
				isPlaying ? shader!.play() : shader!.pause();
				break;
		}
	};
	document.addEventListener('keydown', keydownHandler);

	video = await getWebcamStream();

	outputCanvas = document.createElement('canvas');
	outputCanvas.width = video.videoWidth * 2;
	outputCanvas.height = video.videoHeight * 2;
	outputCanvas.style.position = 'fixed';
	outputCanvas.style.inset = '0';
	outputCanvas.style.width = '100vw';
	outputCanvas.style.height = '100vh';
	document.body.appendChild(outputCanvas);

	shader = new ShaderPad(fragmentShaderSrc, { canvas: outputCanvas, plugins: [history(gridSize - 1)] });
	shader.initializeTexture('u_webcam', video);

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

	if (keydownHandler) {
		document.removeEventListener('keydown', keydownHandler);
		keydownHandler = null;
	}

	isPlaying = true;
}
