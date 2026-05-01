/**
 * Renders a Display P3 test image through a Display P3 ShaderPad. Setting
 * `colorSpace: 'display-p3'` on both the ShaderPad and the texture upload tells
 * the browser to keep the wide-gamut data intact end-to-end on supporting
 * displays; on sRGB displays it falls back gracefully.
 */
import ShaderPad from 'shaderpad';
import autosize from 'shaderpad/plugins/autosize';
import helpers from 'shaderpad/plugins/helpers';
import { createFullscreenCanvas } from 'shaderpad/util';

import type { ExampleContext } from '@/examples/runtime';

export async function init({ mount, assetPath }: ExampleContext) {
	const fragmentShaderSrc = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_image;

void main() {
	vec2 uv = fitContain(vec2(v_uv.x, 1.0 - v_uv.y), vec2(textureSize(u_image, 0)));
	if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
		outColor = vec4(0.0, 0.0, 0.0, 1.0);
		return;
	}
	outColor = texture(u_image, uv);
}`;

	const image = new Image();
	image.src = assetPath('/examples/p3-test.jpg');
	await new Promise((resolve, reject) => {
		image.onload = resolve;
		image.onerror = reject;
	});

	const outputCanvas = createFullscreenCanvas(mount);

	const shader = new ShaderPad(fragmentShaderSrc, {
		canvas: outputCanvas,
		plugins: [autosize(), helpers()],
		colorSpace: 'display-p3',
	});
	shader.initializeTexture('u_image', image, { colorSpace: 'display-p3', preserveY: true });
	shader.play();

	return () => {
		shader.destroy();
		outputCanvas.remove();
	};
}
