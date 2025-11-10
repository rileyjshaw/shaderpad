import ShaderPad, { PluginContext } from '../index.js';

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

export { type PosePluginOptions, pose };
