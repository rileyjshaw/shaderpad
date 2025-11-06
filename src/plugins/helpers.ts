import ShaderPad, { PluginContext } from '../index';

export function helpers() {
	return function (_shader: ShaderPad, context: PluginContext) {
		context.injectGLSL(`
float historyZ(highp sampler2DArray tex, int frameOffset, int framesAgo) {
	int historyDepth = textureSize(tex, 0).z;
	int z = (historyDepth + frameOffset - framesAgo) % historyDepth;
	return float(z);
}`);
	};
}
