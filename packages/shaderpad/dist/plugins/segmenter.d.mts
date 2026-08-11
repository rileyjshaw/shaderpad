import ShaderPad, { PluginContext } from "../index.mjs";
//#region src/plugins/segmenter.d.ts
interface SegmenterPluginOptions {
  modelPath?: string;
  delegate?: 'GPU' | 'CPU';
  outputConfidenceMasks?: boolean;
  history?: number;
}
interface SegmenterPluginConfig {
  textureName: string;
  wasmBaseUrl?: string;
  options?: SegmenterPluginOptions;
}
declare function segmenter(config: SegmenterPluginConfig): (shaderPad: ShaderPad, context: PluginContext) => void;
//#endregion
export { SegmenterPluginConfig, SegmenterPluginOptions, segmenter as default };
//# sourceMappingURL=segmenter.d.mts.map