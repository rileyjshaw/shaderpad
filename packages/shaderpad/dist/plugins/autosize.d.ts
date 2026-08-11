import ShaderPad, { PluginContext } from "../index.js";
//#region src/plugins/autosize.d.ts
interface AutosizeOptions {
  scale?: number;
  target?: Element | Window;
  throttle?: number;
}
declare function autosize(options?: AutosizeOptions): (shaderPad: ShaderPad, context: PluginContext) => void;
//#endregion
export { AutosizeOptions, autosize as default };
//# sourceMappingURL=autosize.d.ts.map