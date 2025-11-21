import ShaderPad, { PluginContext } from '../index.js';

interface FacePluginOptions {
    modelPath?: string;
    maxFaces?: number;
    minFaceDetectionConfidence?: number;
    minFacePresenceConfidence?: number;
    minTrackingConfidence?: number;
    outputFaceBlendshapes?: boolean;
    outputFacialTransformationMatrixes?: boolean;
}
declare function face(config: {
    textureName: string;
    options?: FacePluginOptions;
}): (shaderPad: ShaderPad, context: PluginContext) => void;

export { type FacePluginOptions, face as default };
