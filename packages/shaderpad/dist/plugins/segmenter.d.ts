import ShaderPad, { PluginContext } from '../index.js';

interface SegmenterPluginOptions {
    modelPath?: string;
    outputConfidenceMasks?: boolean;
    history?: number;
}
interface SegmenterPluginConfig {
    textureName: string;
    wasmBaseUrl?: string;
    options?: SegmenterPluginOptions;
}
declare function segmenter(config: SegmenterPluginConfig): (shaderPad: ShaderPad, context: PluginContext) => void;

export { type SegmenterPluginConfig, type SegmenterPluginOptions, segmenter as default };
