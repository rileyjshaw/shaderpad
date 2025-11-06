import ShaderPad, { PluginContext } from '../index';
import helpersGLSL from './helpers.glsl';

export function helpers() {
	return function (_shader: ShaderPad, context: PluginContext) {
		context.injectGLSL(helpersGLSL);
	};
}
