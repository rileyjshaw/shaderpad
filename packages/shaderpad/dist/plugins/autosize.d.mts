import ShaderPad, { PluginContext } from "../index.mjs";
//#region src/plugins/autosize.d.ts
interface AutosizeOptions {
  scale?: number;
  target?: Element | Window;
  throttle?: number;
}
declare function autosize(options?: AutosizeOptions): (shaderPad: ShaderPad, context: PluginContext) => void;
//#endregion
export { AutosizeOptions, autosize as default };
//# sourceMappingURL=autosize.d.mts.map