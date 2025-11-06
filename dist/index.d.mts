declare module '../index' {
    interface ShaderPad {
        save(filename: string): Promise<void>;
    }
}
declare function save(): (shaderPad: ShaderPad, context: PluginContext) => void;
type WithSave<T extends ShaderPad> = T & {
    save(filename: string): Promise<void>;
};

interface FacePluginOptions {
    modelPath?: string;
    numFaces?: number;
    minFaceDetectionConfidence?: number;
    minFacePresenceConfidence?: number;
    minTrackingConfidence?: number;
    outputFaceBlendshapes?: boolean;
    outputFacialTransformationMatrixes?: boolean;
}
declare function face(config: {
    textureName: string;
    options?: FacePluginOptions;
}): (shaderPad: ShaderPad, context: PluginContext) => void;
type WithFace<T extends ShaderPad> = T;

declare function helpers(): (_shader: ShaderPad, context: PluginContext) => void;

interface Uniform {
    type: 'float' | 'int';
    length: 1 | 2 | 3 | 4;
    location: WebGLUniformLocation;
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
}
type TextureSource = HTMLImageElement | HTMLVideoElement | HTMLCanvasElement;
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
    initializeUniform(name: string, type: 'float' | 'int', value: number | number[]): void;
    updateUniforms(updates: Record<string, number | number[]>): void;
    private createTexture;
    private _initializeTexture;
    initializeTexture(name: string, source: TextureSource, options?: {
        history?: number;
    }): void;
    updateTextures(updates: Record<string, TextureSource>): void;
    private updateTexture;
    step(time: number): void;
    play(callback?: (time: number, frame: number) => void): void;
    pause(): void;
    reset(): void;
    destroy(): void;
}

export { type FacePluginOptions, type Options, type PluginContext, type TextureSource, type WithFace, type WithSave, ShaderPad as default, face, helpers, save };
