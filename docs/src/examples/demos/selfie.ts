/**
 * Canvas saving using the utility helpers. Exports shader output with
 * custom metadata.
 */
import ShaderPad from 'shaderpad';
import helpers from 'shaderpad/plugins/helpers';
import autosize from 'shaderpad/plugins/autosize';
import { createFullscreenCanvas, save } from 'shaderpad/util';

import { getWebcamVideo, stopVideoStream } from '@/examples/demo-utils';
import type { ExampleContext } from '@/examples/runtime';
import './save.css';

export async function init({ mount, overlay }: ExampleContext) {
	const fragmentShaderSrc = `#version 300 es
precision mediump float;

in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_webcam;

void main() {
	vec2 uv = fitCover(vec2(1.0 - v_uv.x, v_uv.y), vec2(textureSize(u_webcam, 0)));
	outColor = texture(u_webcam, uv);
}`;

	const video = await getWebcamVideo();
	const canvas = createFullscreenCanvas(mount);
	const shader = new ShaderPad(fragmentShaderSrc, {
		canvas,
		plugins: [helpers(), autosize()],
	});

	const saveButton = document.createElement('button');
	saveButton.textContent = '✨Selfie🤳';
	saveButton.className = 'save-demo-button';
	saveButton.addEventListener('click', () => {
		void save(shader, 'Selfie', 'I took this selfie with ShaderPad.');
	});
	overlay.appendChild(saveButton);

	shader.initializeTexture('u_webcam', video);
	shader.play(() => {
		shader.updateTextures({ u_webcam: video });
	});

	return () => {
		shader.destroy();
		canvas.remove();
		stopVideoStream(video);
		saveButton.remove();
	};
}
