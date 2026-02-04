import ShaderPad, { PluginContext } from '../index.js';

declare module '..' {
    interface ShaderPad {
        save(filename: string, text?: string): Promise<void>;
    }
}
interface SaveOptions {
    preventShare?: boolean;
}
declare function save(): (shaderPad: ShaderPad, context: PluginContext) => void;
type WithSave<T extends ShaderPad> = T & {
    save(filename: string, text?: string): Promise<void>;
};

export { type SaveOptions, type WithSave, save as default };
