import ShaderPad from './index.mjs';

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

export { type SaveOptions, type ToBlobOptions, createFullscreenCanvas, save, toBlob };
