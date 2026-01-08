import ShaderPad, { PluginContext } from '../index.mjs';
import { PoseLandmarkerResult } from '@mediapipe/tasks-vision';

interface PosePluginOptions {
    modelPath?: string;
    maxPoses?: number;
    minPoseDetectionConfidence?: number;
    minPosePresenceConfidence?: number;
    minTrackingConfidence?: number;
    onResults?: (results: PoseLandmarkerResult) => void;
}
declare function pose(config: {
    textureName: string;
    options?: PosePluginOptions;
}): (shaderPad: ShaderPad, context: PluginContext) => void;

export { type PosePluginOptions, pose as default };
