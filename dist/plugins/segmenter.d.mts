import ShaderPad, { PluginContext } from '../index.mjs';
import { ImageSegmenterResult } from '@mediapipe/tasks-vision';

interface SegmenterPluginOptions {
    modelPath?: string;
    outputCategoryMask?: boolean;
    onReady?: () => void;
    onResults?: (results: ImageSegmenterResult) => void;
}
declare function segmenter(config: {
    textureName: string;
    options?: SegmenterPluginOptions;
}): (shaderPad: ShaderPad, context: PluginContext) => void;

export { type SegmenterPluginOptions, segmenter as default };
