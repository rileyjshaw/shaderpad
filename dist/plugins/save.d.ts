import ShaderPad, { PluginContext } from '../index.js';

declare module '../index' {
    interface ShaderPad {
        save(filename: string): Promise<void>;
    }
}
declare function save(): (shaderPad: ShaderPad, context: PluginContext) => void;
type WithSave<T extends ShaderPad> = T & {
    save(filename: string): Promise<void>;
};

export { type WithSave, save as default };
