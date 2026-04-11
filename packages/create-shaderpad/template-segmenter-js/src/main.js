import ShaderPad from 'shaderpad';
import autosize from 'shaderpad/plugins/autosize';
import helpers from 'shaderpad/plugins/helpers';
import segmenter from 'shaderpad/plugins/segmenter';
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
	const shader = new ShaderPad(fragmentShaderSrc, {
		canvas: createFullscreenCanvas(),
		plugins: [
			autosize(),
			helpers(),
			segmenter({
				textureName: 'u_webcam',
				options: {
					modelPath:
						'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite',
					outputConfidenceMasks: true,
				},
			}),
		],
	});

	shader.initializeTexture('u_webcam', video);
	shader.play(() => {
		shader.updateTextures({ u_webcam: video });
	});
}

main().catch(error => {
	console.error(error);
});
