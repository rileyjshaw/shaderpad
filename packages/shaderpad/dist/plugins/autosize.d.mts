import ShaderPad, { PluginContext } from '../index.mjs';

interface AutosizeOptions {
    ignorePixelRatio?: boolean;
    target?: Element | Window;
    throttle?: number;
}
declare function autosize(options?: AutosizeOptions): (shaderPad: ShaderPad, context: PluginContext) => void;

export { type AutosizeOptions, autosize as default };
