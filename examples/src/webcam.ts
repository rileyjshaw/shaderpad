import ShaderPad from 'shaderpad';

async function getWebcamStream(): Promise<HTMLVideoElement> {
	const video = document.createElement('video');
	video.autoplay = video.playsInline = true;

	try {
		const stream = await navigator.mediaDevices.getUserMedia({ video: true });
		video.srcObject = stream;
		await new Promise(resolve => (video.onloadedmetadata = resolve));
		document.body.appendChild(video);
	} catch (error) {
		console.error('Error accessing webcam:', error);
		throw error;
	}

	return video;
}

async function main() {
	const fragmentShaderSrc = `#version 300 es
precision mediump float;

in vec2 v_uv;
uniform sampler2D uPictureFrame;
uniform sampler2D uWebcam;

out vec4 outColor;

void main() {
	vec4 frameColor = texture(uPictureFrame, v_uv);
	vec4 webcamColor = texture(uWebcam, v_uv);
	outColor = mix(webcamColor, frameColor, frameColor.a);
}`;

	const pictureFrame = new Image();
	pictureFrame.src = '/picture-frame.png';
	await new Promise((resolve, reject) => {
		pictureFrame.onload = resolve;
		pictureFrame.onerror = reject;
	});
	const video = await getWebcamStream();

	const outputCanvas = document.createElement('canvas');
	outputCanvas.width = video.videoWidth;
	outputCanvas.height = video.videoHeight;
	document.body.appendChild(outputCanvas);

	const shader = new ShaderPad(fragmentShaderSrc, { canvas: outputCanvas });
	shader.initializeTexture('uPictureFrame', pictureFrame);
	shader.initializeTexture('uWebcam', video);

	shader.play(() => {
		shader.updateTextures({ uWebcam: video });
	});
}

document.addEventListener('DOMContentLoaded', main);
