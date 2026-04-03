import ShaderPad, { PluginContext } from '../index.mjs';

interface HandsPluginOptions {
    modelPath?: string;
    maxHands?: number;
    minHandDetectionConfidence?: number;
    minHandPresenceConfidence?: number;
    minTrackingConfidence?: number;
    history?: number;
}
interface HandsPluginConfig {
    textureName: string;
    options?: HandsPluginOptions;
}
declare function hands(config: HandsPluginConfig): (shaderPad: ShaderPad, context: PluginContext) => void;

export { type HandsPluginConfig, type HandsPluginOptions, hands as default };
