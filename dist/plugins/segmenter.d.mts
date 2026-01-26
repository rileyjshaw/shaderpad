import ShaderPad, { PluginContext } from '../index.mjs';

interface SegmenterPluginOptions {
    modelPath?: string;
    outputCategoryMask?: boolean;
    history?: number;
}
declare function segmenter(config: {
    textureName: string;
    options?: SegmenterPluginOptions;
}): (shaderPad: ShaderPad, context: PluginContext) => void;

export { type SegmenterPluginOptions, segmenter as default };
