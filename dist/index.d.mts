type GLInternalFormatChannels = 'R' | 'RG' | 'RGB' | 'RGBA';
type GLInternalFormatDepth = '8' | '16F' | '32F' | '8UI' | '8I' | '16UI' | '16I' | '32UI' | '32I';
type GLInternalFormatString = `${GLInternalFormatChannels}${GLInternalFormatDepth}`;
type GLFormatString = 'RED' | 'RG' | 'RGB' | 'RGBA' | 'RED_INTEGER' | 'RG_INTEGER' | 'RGB_INTEGER' | 'RGBA_INTEGER';
type GLTypeString = 'UNSIGNED_BYTE' | 'BYTE' | 'FLOAT' | 'HALF_FLOAT' | 'UNSIGNED_SHORT' | 'SHORT' | 'UNSIGNED_INT' | 'INT';
type GLFilterString = 'LINEAR' | 'NEAREST';
type GLWrapString = 'CLAMP_TO_EDGE' | 'REPEAT' | 'MIRRORED_REPEAT';
interface TextureOptions {
    internalFormat?: GLInternalFormatString;
    format?: GLFormatString;
    type?: GLTypeString;
    minFilter?: GLFilterString;
    magFilter?: GLFilterString;
    wrapS?: GLWrapString;
    wrapT?: GLWrapString;
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
type LifecycleMethod = '_init' | 'initializeTexture' | 'initializeUniform' | 'updateTextures' | 'updateUniforms' | 'beforeStep' | 'afterStep' | 'beforeDraw' | 'afterDraw' | 'updateResolution' | 'play' | 'pause' | 'reset' | 'destroy' | `${string}:${string}`;
interface Options extends Exclude<TextureOptions, 'preserveY'> {
    canvas?: HTMLCanvasElement | OffscreenCanvas | {
        width: number;
        height: number;
    } | null;
    plugins?: Plugin[];
    history?: number;
    debug?: boolean;
    cursorTarget?: Window | Element;
}
interface StepOptions {
    skipClear?: boolean;
    skipHistoryWrite?: boolean;
}
declare class ShaderPad {
    private isHeadless;
    private isTouchDevice;
    private gl;
    private glHelpers;
    private uniforms;
    private textures;
    private textureUnitPool;
    private buffer;
    private vao;
    private program;
    private animationFrameId;
    private eventListeners;
    private frame;
    private startTime;
    private isPlaying;
    private cursorPosition;
    private clickPosition;
    private isMouseDown;
    canvas: HTMLCanvasElement | OffscreenCanvas;
    private resolutionObserver;
    private hooks;
    private historyDepth;
    private textureOptions;
    private debug;
    private cursorTarget;
    private intermediateFbo;
    constructor(fragmentShaderSrc: string, { canvas, plugins, history, debug, cursorTarget, ...textureOptions }?: Options);
    private resolveGLConstant;
    private emitHook;
    on(name: LifecycleMethod, fn: Function): void;
    off(name: LifecycleMethod, fn: Function): void;
    private createShader;
    private getCursorTargetRect;
    private addEventListeners;
    updateResolution(): void;
    private resizeTexture;
    private reserveTextureUnit;
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
        historyWriteIndex?: number | number[];
    }): void;
    private updateTexture;
    private bindIntermediate;
    clear(): void;
    draw(options?: StepOptions): void;
    step(options?: StepOptions): void;
    private _step;
    play(onBeforeStep?: (time: number, frame: number) => StepOptions | void): void;
    private _pause;
    pause(): void;
    reset(): void;
    destroy(): void;
}

export { type CustomTexture, type GLFilterString, type GLFormatString, type GLInternalFormatString, type GLTypeString, type GLWrapString, type Options, type PartialCustomTexture, type PluginContext, type StepOptions, type TextureOptions, type TextureSource, ShaderPad as default };
