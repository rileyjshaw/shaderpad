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
out vec4 outColor;
uniform sampler2D u_webcam;

void main() {
    vec2 uv = vec2(1.0 - v_uv.x, v_uv.y);
	outColor = texture(u_webcam, uv);
}`;
	const video = await getWebcamStream();
	const shader = new ShaderPad(fragmentShaderSrc);
	shader.canvas.width = video.videoWidth;
	shader.canvas.height = video.videoHeight;
	const saveButton = document.createElement('button');
	saveButton.textContent = 'Save';
	saveButton.addEventListener('click', () => {
		shader.save('selfie');
	});
	saveButton.style.position = 'fixed';
	saveButton.style.bottom = '32px';
	saveButton.style.left = '50%';
	saveButton.style.transform = 'translateX(-50%)';
	saveButton.style.fontSize = '24px';
	document.body.appendChild(saveButton);
	shader.initializeTexture('u_webcam', video);
	shader.play(() => {
		shader.updateTextures({ u_webcam: video });
	});
}

document.addEventListener('DOMContentLoaded', main);
