/**
 * Webcam with picture frame overlay. Blends webcam texture with
 * static image using alpha channel.
 */
import ShaderPad from 'shaderpad';
import autosize from 'shaderpad/plugins/autosize';
import { createFullscreenCanvas } from 'shaderpad/util';

import { getWebcamVideo, stopVideoStream } from '@/examples/demo-utils';
import type { ExampleContext } from '@/examples/runtime';

export async function init({ mount, assetPath }: ExampleContext) {
	const fragmentShaderSrc = `#version 300 es
precision mediump float;

in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_pictureFrame;
uniform sampler2D u_webcam;

void main() {
	vec4 frameColor = texture(u_pictureFrame, v_uv);
	vec4 webcamColor = texture(u_webcam, vec2(1.0 - v_uv.x, v_uv.y));
	outColor = mix(webcamColor, frameColor, frameColor.a);
}`;

	const pictureFrame = new Image();
	pictureFrame.src = assetPath('/examples/picture-frame.png');
	await new Promise((resolve, reject) => {
		pictureFrame.onload = resolve;
		pictureFrame.onerror = reject;
	});

	const video = await getWebcamVideo();
	const outputCanvas = createFullscreenCanvas(mount);

	const shader = new ShaderPad(fragmentShaderSrc, {
		canvas: outputCanvas,
		plugins: [autosize()],
	});
	shader.initializeTexture('u_pictureFrame', pictureFrame);
	shader.initializeTexture('u_webcam', video);

	shader.play(() => {
		shader.updateTextures({ u_webcam: video });
	});

	return () => {
		shader.destroy();
		stopVideoStream(video);
		outputCanvas.remove();
	};
}
