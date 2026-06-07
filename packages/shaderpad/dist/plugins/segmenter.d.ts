import ShaderPad, { PluginContext } from "../index.js";

//#region src/plugins/segmenter.d.ts
interface SegmenterPluginOptions {
  modelPath?: string;
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
//# sourceMappingURL=segmenter.d.ts.map