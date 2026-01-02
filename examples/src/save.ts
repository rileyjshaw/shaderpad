import ShaderPad from 'shaderpad';
import helpers from 'shaderpad/plugins/helpers';
import save, { WithSave } from 'shaderpad/plugins/save';

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

let shader: WithSave<ShaderPad> | null = null;
let video: HTMLVideoElement | null = null;
let saveButton: HTMLButtonElement | null = null;

export async function init() {
	const fragmentShaderSrc = `#version 300 es
precision mediump float;

in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_webcam;

void main() {
	vec2 uv = fitCover(vec2(1.0 - v_uv.x, v_uv.y), vec2(textureSize(u_webcam, 0)));
	outColor = texture(u_webcam, uv);
}`;

	video = await getWebcamStream();
	shader = new ShaderPad(fragmentShaderSrc, { plugins: [helpers(), save()] }) as WithSave<ShaderPad>;
	shader.canvas.width = video.videoWidth;
	shader.canvas.height = video.videoHeight;

	saveButton = document.createElement('button');
	saveButton.textContent = 'Save';
	saveButton.addEventListener('click', () => {
		shader!.save('selfie', 'Took this selfie with ShaderPad.');
	});
	saveButton.style.position = 'fixed';
	saveButton.style.bottom = '32px';
	saveButton.style.left = '50%';
	saveButton.style.transform = 'translateX(-50%)';
	saveButton.style.fontSize = '24px';
	document.body.appendChild(saveButton);

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

	if (saveButton) {
		saveButton.remove();
		saveButton = null;
	}
}
