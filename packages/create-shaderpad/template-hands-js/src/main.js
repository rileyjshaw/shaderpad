import ShaderPad from 'shaderpad';
import autosize from 'shaderpad/plugins/autosize';
import helpers from 'shaderpad/plugins/helpers';
import hands from 'shaderpad/plugins/hands';
import { createFullscreenCanvas } from 'shaderpad/util';

import fragmentShaderSrc from './shaders/fragment.glsl';

async function getWebcam() {
	const video = document.createElement('video');
	video.autoplay = true;
	video.muted = true;
	video.playsInline = true;

	const stream = await navigator.mediaDevices.getUserMedia({
		video: {
			facingMode: 'user',
		},
		audio: false,
	});
	video.srcObject = stream;
	await video.play();
	return video;
}

async function main() {
	const video = await getWebcam();
	const canvas = createFullscreenCanvas();
	const shader = new ShaderPad(fragmentShaderSrc, {
		plugins: [
			autosize(),
			helpers(),
			hands({
				textureName: 'u_webcam',
				options: {
					maxHands: 2,
				},
			}),
		],
		canvas,
	});

	shader.initializeTexture('u_webcam', video);
	shader.play(() => {
		shader.updateTextures({ u_webcam: video });
	});
}

main().catch(error => {
	console.error(error);
});
