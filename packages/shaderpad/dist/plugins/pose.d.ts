import ShaderPad, { PluginContext } from '../index.js';

interface PosePluginOptions {
    modelPath?: string;
    maxPoses?: number;
    minPoseDetectionConfidence?: number;
    minPosePresenceConfidence?: number;
    minTrackingConfidence?: number;
    history?: number;
}
interface PosePluginConfig {
    textureName: string;
    wasmBaseUrl?: string;
    options?: PosePluginOptions;
}
declare function pose(config: PosePluginConfig): (shaderPad: ShaderPad, context: PluginContext) => void;

export { type PosePluginConfig, type PosePluginOptions, pose as default };
