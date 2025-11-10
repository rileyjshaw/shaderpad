import ShaderPad, { PluginContext } from '../index.js';

interface HandsPluginOptions {
    modelPath?: string;
    maxHands?: number;
    minHandDetectionConfidence?: number;
    minHandPresenceConfidence?: number;
    minTrackingConfidence?: number;
}
declare function hands(config: {
    textureName: string;
    options?: HandsPluginOptions;
}): (shaderPad: ShaderPad, context: PluginContext) => void;

export { type HandsPluginOptions, hands };
