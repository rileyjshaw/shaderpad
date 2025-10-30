declare function history(depth?: number): (shaderPad: ShaderPad, context: PluginContext) => void;

declare module '../index' {
    interface ShaderPad {
        save(filename: string): Promise<void>;
    }
}
declare function save(): (shaderPad: ShaderPad, context: PluginContext) => void;
type WithSave<T extends ShaderPad> = T & {
    save(filename: string): Promise<void>;
};

interface Uniform {
    type: 'float' | 'int';
    length: 1 | 2 | 3 | 4;
    location: WebGLUniformLocation;
}
interface Texture {
    texture: WebGLTexture;
    unitIndex: number;
}
interface PluginContext {
    gl: WebGL2RenderingContext;
    uniforms: Map<string, Uniform>;
    textures: Map<string, Texture>;
    program: WebGLProgram | null;
    canvas: HTMLCanvasElement;
}
type Plugin = (shaderPad: ShaderPad, context: PluginContext) => void;
type LifecycleMethod = 'init' | 'step' | 'destroy' | 'updateResolution' | 'reset';
interface Options {
    canvas?: HTMLCanvasElement | null;
    plugins?: Plugin[];
}
declare class ShaderPad {
    private isInternalCanvas;
    private isTouchDevice;
    private gl;
    private downloadLink;
    private fragmentShaderSrc;
    private uniforms;
    private textures;
    private buffer;
    private program;
    private animationFrameId;
    private resolutionObserver;
    private resizeObserver;
    private resizeTimeout;
    private lastResizeTime;
    private eventListeners;
    private frame;
    private startTime;
    private cursorPosition;
    private clickPosition;
    private isMouseDown;
    canvas: HTMLCanvasElement;
    onResize?: (width: number, height: number) => void;
    private hooks;
    constructor(fragmentShaderSrc: string, options?: Options);
    registerHook(name: LifecycleMethod, fn: Function): void;
    private init;
    private createShader;
    private setupBuffer;
    private throttledHandleResize;
    private handleResize;
    private addEventListeners;
    private updateResolution;
    initializeUniform(name: string, type: 'float' | 'int', value: number | number[]): void;
    updateUniforms(updates: Record<string, number | number[]>): void;
    step(time: number): void;
    play(callback?: (time: number, frame: number) => void): void;
    pause(): void;
    reset(): void;
    initializeTexture(name: string, source: HTMLImageElement | HTMLVideoElement): void;
    updateTextures(updates: Record<string, HTMLImageElement | HTMLVideoElement>): void;
    save(filename: string): Promise<void>;
    destroy(): void;
}

export { type PluginContext, type WithSave, ShaderPad as default, history, save };
