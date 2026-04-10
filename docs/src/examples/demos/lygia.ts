/**
 * Animated cellular texture using GLSL #include directives to pull LYGIA helpers into a shader.
 */
import ShaderPad from 'shaderpad';
import autosize from 'shaderpad/plugins/autosize';
import { createFullscreenCanvas } from 'shaderpad/util';

import type { ExampleContext } from '@/examples/runtime';

import fragmentShaderSrc from './lygia.glsl';

export async function init({ mount }: ExampleContext) {
	const canvas = createFullscreenCanvas(mount);
	const shader = new ShaderPad(fragmentShaderSrc, {
		plugins: [autosize()],
		canvas,
	});

	shader.play();

	return () => {
		shader.destroy();
		canvas.remove();
	};
}
