import ShaderPad, { PluginContext, TextureSource } from '..';
import helpersGLSL from './helpers.glsl';

function helpers() {
	return function (_shader: ShaderPad, context: PluginContext) {
		context.injectGLSL(helpersGLSL);
	};
}

export default helpers;
