import ShaderPad, { PluginContext } from "../index.mjs";
//#region src/plugins/face.d.ts
interface FacePluginOptions {
  modelPath?: string;
  delegate?: 'GPU' | 'CPU';
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
//#endregion
export { FacePluginConfig, FacePluginOptions, face as default };
//# sourceMappingURL=face.d.mts.map