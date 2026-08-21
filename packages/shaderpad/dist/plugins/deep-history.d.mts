import { c as Plugin, g as UpdateTextureSource, h as TextureSource, m as TextureOptions } from "../index-Bx7YV0w_.mjs";
//#region src/plugins/deep-history.d.ts
declare const SHADER_OUTPUT: symbol;
interface DeepHistoryOptions extends TextureOptions {
  history: number;
  chunks?: number;
}
type DeepOutputHistoryOptions = Omit<DeepHistoryOptions, 'format' | 'colorSpace' | 'preserveY'>;
type DeepHistoryUpdater = (source: UpdateTextureSource, historySlots?: number | number[]) => void;
/**
 * Creates plugin-owned history arrays for a texture source or the shader output.
 */
declare function deepHistory(accessorName: string, initialSource: typeof SHADER_OUTPUT, options: DeepOutputHistoryOptions): [Plugin];
declare function deepHistory(accessorName: string, initialSource: TextureSource, options: DeepHistoryOptions): [Plugin, DeepHistoryUpdater];
//#endregion
export { DeepHistoryOptions, DeepHistoryUpdater, DeepOutputHistoryOptions, SHADER_OUTPUT, deepHistory as default };
//# sourceMappingURL=deep-history.d.mts.map