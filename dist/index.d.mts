interface TextureOptions {
    internalFormat?: number;
    format?: number;
    type?: number;
    minFilter?: number;
    magFilter?: number;
    wrapS?: number;
    wrapT?: number;
    preserveY?: boolean;
}
interface CustomTexture {
    data: ArrayBufferView | null;
    width: number;
    height: number;
}
interface PartialCustomTexture extends CustomTexture {
    isPartial?: boolean;
    x?: number;
    y?: number;
}
type TextureSource = HTMLImageElement | HTMLVideoElement | HTMLCanvasElement | OffscreenCanvas | ImageBitmap | WebGLTexture | CustomTexture | ShaderPad;
type UpdateTextureSource = Exclude<TextureSource, CustomTexture> | PartialCustomTexture;
interface PluginContext {
    gl: WebGL2RenderingContext;
    canvas: HTMLCanvasElement | OffscreenCanvas;
    injectGLSL: (code: string) => void;
    emitHook: (name: LifecycleMethod, ...args: any[]) => void;
}
type Plugin = (shaderPad: ShaderPad, context: PluginContext) => void;
type LifecycleMethod = 'init' | 'initializeTexture' | 'initializeUniform' | 'updateTextures' | 'updateUniforms' | 'beforeStep' | 'afterStep' | 'beforeDraw' | 'afterDraw' | 'updateResolution' | 'resize' | 'play' | 'pause' | 'reset' | 'destroy' | `${string}:${string}`;
interface Options extends Exclude<TextureOptions, 'preserveY'> {
    canvas?: HTMLCanvasElement | OffscreenCanvas | null;
    plugins?: Plugin[];
    history?: number;
    debug?: boolean;
}
interface StepOptions {
    skipClear?: boolean;
    skipHistoryWrite?: boolean;
}
declare class ShaderPad {
    private isInternalCanvas;
    private isTouchDevice;
    private gl;
    private uniforms;
    private textures;
    private textureUnitPool;
    private buffer;
    private program;
    private aPositionLocation;
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
    canvas: HTMLCanvasElement | OffscreenCanvas;
    private hooks;
    private historyDepth;
    private textureOptions;
    private debug;
    private intermediateFbo;
    constructor(fragmentShaderSrc: string, { canvas, plugins, history, debug, ...textureOptions }?: Options);
    private emitHook;
    on(name: LifecycleMethod, fn: Function): void;
    off(name: LifecycleMethod, fn: Function): void;
    private createShader;
    private throttledHandleResize;
    private handleResize;
    private addEventListeners;
    private updateResolution;
    private resizeTexture;
    private reserveTextureUnit;
    private releaseTextureUnit;
    private resolveTextureOptions;
    private getPixelArray;
    private clearHistoryTextureLayers;
    initializeUniform(name: string, type: 'float' | 'int', value: number | number[] | (number | number[])[], options?: {
        arrayLength?: number;
    }): void;
    private log;
    updateUniforms(updates: Record<string, number | number[] | (number | number[])[]>, options?: {
        startIndex?: number;
    }): void;
    private createTexture;
    private _initializeTexture;
    initializeTexture(name: string, source: TextureSource, options?: TextureOptions & {
        history?: number;
    }): void;
    updateTextures(updates: Record<string, UpdateTextureSource>, options?: {
        skipHistoryWrite?: boolean;
    }): void;
    private updateTexture;
    draw(options?: StepOptions): void;
    step(time: number, options?: StepOptions): void;
    play(onStepComplete?: (time: number, frame: number) => void, setStepOptions?: (time: number, frame: number) => StepOptions | void): void;
    pause(): void;
    reset(): void;
    destroy(): void;
}

export { type CustomTexture, type Options, type PartialCustomTexture, type PluginContext, type StepOptions, type TextureOptions, type TextureSource, ShaderPad as default };
