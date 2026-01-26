import ShaderPad, { PluginContext } from '../index.mjs';

interface FacePluginOptions {
    modelPath?: string;
    maxFaces?: number;
    minFaceDetectionConfidence?: number;
    minFacePresenceConfidence?: number;
    minTrackingConfidence?: number;
    outputFaceBlendshapes?: boolean;
    outputFacialTransformationMatrixes?: boolean;
    history?: number;
}
declare function face(config: {
    textureName: string;
    options?: FacePluginOptions;
}): (shaderPad: ShaderPad, context: PluginContext) => void;

export { type FacePluginOptions, face as default };
