/** Samples a looping video through 320 frames of deep texture history. */
import ShaderPad from 'shaderpad';
import autosize from 'shaderpad/plugins/autosize';
import deepHistory from 'shaderpad/plugins/deep-history';
import helpers from 'shaderpad/plugins/helpers';
import { createFullscreenCanvas } from 'shaderpad/util';

import type { ExampleContext } from '@/examples/runtime';

const HEIGHT = 1280;
const ROW_HEIGHT = 2;
const HISTORY = Math.ceil(HEIGHT / ROW_HEIGHT);

export async function init({ mount, assetPath }: ExampleContext) {
	const video = document.createElement('video');
	video.src = assetPath('/street.mp4');
	video.loop = true;
	video.muted = true;
	video.playsInline = true;
	await new Promise<void>((resolve, reject) => {
		video.addEventListener('loadeddata', () => resolve(), { once: true });
		video.addEventListener('error', () => reject(video.error), { once: true });
	});
	await video.play();

	const fragmentShaderSrc = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 outColor;

void main() {
	vec2 uv = fitCover(v_uv, vec2(${HEIGHT}.0, 720.0));
	float y = v_uv.y * ${HISTORY}.0;
	int age = int(floor(y / ${ROW_HEIGHT}.0)) * ${ROW_HEIGHT};
	outColor = videoHistory(uv, age);
}`;

	const [videoHistoryPlugin, updateVideo] = deepHistory('videoHistory', video, { history: HISTORY, chunks: 4 });
	const canvas = createFullscreenCanvas(mount);
	const shader = new ShaderPad(fragmentShaderSrc, {
		canvas,
		plugins: [videoHistoryPlugin, helpers(), autosize()],
	});
	shader.play(() => updateVideo(video));

	return () => {
		shader.destroy();
		video.pause();
		video.remove();
		canvas.remove();
	};
}
