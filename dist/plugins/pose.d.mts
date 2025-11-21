import ShaderPad, { PluginContext } from '../index.mjs';

interface PosePluginOptions {
    modelPath?: string;
    maxPoses?: number;
    minPoseDetectionConfidence?: number;
    minPosePresenceConfidence?: number;
    minTrackingConfidence?: number;
    outputSegmentationMasks?: boolean;
}
declare function pose(config: {
    textureName: string;
    options?: PosePluginOptions;
}): (shaderPad: ShaderPad, context: PluginContext) => void;

export { type PosePluginOptions, pose as default };
