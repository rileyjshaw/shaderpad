import { d as ShaderPad, l as PluginContext } from "../index-Bx7YV0w_.mjs";
//#region src/plugins/hands.d.ts
interface HandsPluginOptions {
  modelPath?: string;
  delegate?: 'GPU' | 'CPU';
  maxHands?: number;
  minHandDetectionConfidence?: number;
  minHandPresenceConfidence?: number;
  minTrackingConfidence?: number;
  history?: number;
}
interface HandsPluginConfig {
  textureName: string;
  wasmBaseUrl?: string;
  options?: HandsPluginOptions;
}
declare function hands(config: HandsPluginConfig): (shaderPad: ShaderPad, context: PluginContext) => void;
//#endregion
export { HandsPluginConfig, HandsPluginOptions, hands as default };
//# sourceMappingURL=hands.d.mts.map