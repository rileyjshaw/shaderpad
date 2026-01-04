interface Uniform {
    type: 'float' | 'int';
    length: 1 | 2 | 3 | 4;
    location: WebGLUniformLocation;
    arrayLength?: number;
}
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
interface Texture {
    texture: WebGLTexture;
    unitIndex: number;
    width: number;
    height: number;
    history?: {
        depth: number;
        writeIndex: number;
    };
    options?: TextureOptions;
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
type TextureSource = HTMLImageElement | HTMLVideoElement | HTMLCanvasElement | CustomTexture;
type UpdateTextureSource = Exclude<TextureSource, CustomTexture> | PartialCustomTexture;
interface PluginContext {
    gl: WebGL2RenderingContext;
    uniforms: Map<string, Uniform>;
    textures: Map<string | symbol, Texture>;
    get program(): WebGLProgram | null;
    canvas: HTMLCanvasElement;
    reserveTextureUnit: (name: string | symbol) => number;
    releaseTextureUnit: (name: string | symbol) => void;
    injectGLSL: (code: string) => void;
}
type Plugin = (shaderPad: ShaderPad, context: PluginContext) => void;
type LifecycleMethod = 'init' | 'step' | 'destroy' | 'updateResolution' | 'reset' | 'initializeTexture' | 'updateTextures' | 'initializeUniform' | 'updateUniforms';
interface Options {
    canvas?: HTMLCanvasElement | null;
    plugins?: Plugin[];
    history?: number;
    debug?: boolean;
}
declare class ShaderPad {
    private isInternalCanvas;
    private isTouchDevice;
    private gl;
    private fragmentShaderSrc;
    private uniforms;
    private textures;
    private textureUnitPool;
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
    private historyDepth;
    private debug;
    constructor(fragmentShaderSrc: string, options?: Options);
    registerHook(name: LifecycleMethod, fn: Function): void;
    private init;
    private createShader;
    private setupBuffer;
    private throttledHandleResize;
    private handleResize;
    private addEventListeners;
    private updateResolution;
    private reserveTextureUnit;
    private releaseTextureUnit;
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
    updateTextures(updates: Record<string, UpdateTextureSource>): void;
    private updateTexture;
    draw(): void;
    step(time: number): void;
    play(callback?: (time: number, frame: number) => void): void;
    pause(): void;
    reset(): void;
    destroy(): void;
}

export { type CustomTexture, type Options, type PartialCustomTexture, type PluginContext, type TextureOptions, type TextureSource, ShaderPad as default };
