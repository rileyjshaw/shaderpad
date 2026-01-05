import ShaderPad, { PluginContext } from '../index.js';
import { FaceLandmarkerResult } from '@mediapipe/tasks-vision';

interface FacePluginOptions {
    modelPath?: string;
    maxFaces?: number;
    minFaceDetectionConfidence?: number;
    minFacePresenceConfidence?: number;
    minTrackingConfidence?: number;
    outputFaceBlendshapes?: boolean;
    outputFacialTransformationMatrixes?: boolean;
    onResults?: (results: FaceLandmarkerResult) => void;
}
declare function face(config: {
    textureName: string;
    options?: FacePluginOptions;
}): (shaderPad: ShaderPad, context: PluginContext) => void;

export { type FacePluginOptions, face as default };
