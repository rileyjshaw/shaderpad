import ShaderPad from 'shaderpad';
import autosize from 'shaderpad/plugins/autosize';
import { createFullscreenCanvas } from 'shaderpad/util';

import fragmentShaderSrc from './shaders/fragment.glsl';

const canvas = createFullscreenCanvas();
const shader = new ShaderPad(fragmentShaderSrc, {
	plugins: [autosize()],
	canvas,
});
shader.play();
