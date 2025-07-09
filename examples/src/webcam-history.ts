import ShaderPad from 'shaderpad';

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

async function main() {
	const fragmentShaderSrc = `#version 300 es
precision highp float;

in vec2 v_uv;
uniform int u_frame;
uniform vec4 u_cursor;
uniform highp sampler2DArray u_history;
uniform sampler2D u_webcam;

out vec4 fragColor;

void main() {
    vec2 uv = v_uv;

    vec2 gridUV = fract(uv * ${gridLength}.0);
    vec2 gridPos = floor(uv * ${gridLength}.0);

    // Calculate which history frame to show based on grid position
    int historyLength = textureSize(u_history, 0).z;
    int outputFrameIndex = u_frame % historyLength; // Index of the frame this full render will write to.
    float age = ${gridLength}.0 - gridPos.x + gridPos.y * ${gridLength}.0 - 1.0; // 25 is top left, 1 is bottom right.
    int historyIndex = (outputFrameIndex + historyLength - int(age)) % historyLength; // Newest frame is at the bottom right.

    vec3 historyColor = texture(u_history, vec3(gridUV, float(historyIndex))).rgb;
    vec4 webcamColor = texture(u_webcam, gridUV);

    vec3 finalColor = mix(webcamColor.rgb, historyColor, step(0.5, age));
    fragColor = vec4(finalColor, 1.0);
}`;

	let isPlaying = true;
	document.addEventListener('keydown', e => {
		switch (e.key) {
			case ' ':
				isPlaying = !isPlaying;
				isPlaying ? shader.play() : shader.pause();
				break;
			case 's':
				shader.save('shift');
				break;
		}
	});

	const video = await getWebcamStream();

	const outputCanvas = document.createElement('canvas');
	outputCanvas.width = video.videoWidth;
	outputCanvas.height = video.videoHeight;
	outputCanvas.style.position = 'fixed';
	outputCanvas.style.inset = '0';
	outputCanvas.style.width = '100vw';
	outputCanvas.style.height = '100vh';
	document.body.appendChild(outputCanvas);

	const shader = new ShaderPad(fragmentShaderSrc, { canvas: outputCanvas, history: gridSize - 1 });
	shader.initializeTexture('u_webcam', video);

	shader.play(() => {
		shader.updateTextures({ u_webcam: video });
	});
}

document.addEventListener('DOMContentLoaded', main);
