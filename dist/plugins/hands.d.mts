import ShaderPad, { PluginContext } from '../index.mjs';
import { HandLandmarkerResult } from '@mediapipe/tasks-vision';

interface HandsPluginOptions {
    modelPath?: string;
    maxHands?: number;
    minHandDetectionConfidence?: number;
    minHandPresenceConfidence?: number;
    minTrackingConfidence?: number;
    onReady?: () => void;
    onResults?: (results: HandLandmarkerResult) => void;
}
declare function hands(config: {
    textureName: string;
    options?: HandsPluginOptions;
}): (shaderPad: ShaderPad, context: PluginContext) => void;

export { type HandsPluginOptions, hands as default };
