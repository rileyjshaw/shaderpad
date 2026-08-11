import ShaderPad, { PluginContext } from "../index.js";
//#region src/plugins/pose.d.ts
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
//#endregion
export { PosePluginConfig, PosePluginOptions, pose as default };
//# sourceMappingURL=pose.d.ts.map