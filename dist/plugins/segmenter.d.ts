import ShaderPad, { PluginContext } from '../index.js';

interface SegmenterPluginOptions {
    modelPath?: string;
    outputConfidenceMasks?: boolean;
    history?: number;
}
declare function segmenter(config: {
    textureName: string;
    options?: SegmenterPluginOptions;
}): (shaderPad: ShaderPad, context: PluginContext) => void;

export { type SegmenterPluginOptions, segmenter as default };
