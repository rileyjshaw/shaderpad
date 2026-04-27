import ShaderPad, { PluginContext } from '../index.js';

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
interface FacePluginConfig {
    textureName: string;
    wasmBaseUrl?: string;
    options?: FacePluginOptions;
}
declare function face(config: FacePluginConfig): (shaderPad: ShaderPad, context: PluginContext) => void;

export { type FacePluginConfig, type FacePluginOptions, face as default };
