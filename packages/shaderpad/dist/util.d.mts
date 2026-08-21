import { d as ShaderPad } from "./index-Bx7YV0w_.mjs";
//#region src/util.d.ts
interface ToBlobOptions {
  type?: string;
  quality?: number;
}
interface SaveOptions extends ToBlobOptions {
  preventShare?: boolean;
}
declare function toBlob(shader: ShaderPad, options?: ToBlobOptions): Promise<Blob>;
declare function save(shader: ShaderPad, filename?: string, text?: string, options?: SaveOptions): Promise<void>;
declare function createFullscreenCanvas(container?: HTMLElement): HTMLCanvasElement;
//#endregion
export { SaveOptions, ToBlobOptions, createFullscreenCanvas, save, toBlob };
//# sourceMappingURL=util.d.mts.map