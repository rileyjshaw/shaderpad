declare class ShaderPad {
    private isInternalCanvas;
    private isTouchDevice;
    private canvas;
    private gl;
    private downloadLink;
    private fragmentShaderSrc;
    private uniforms;
    private textures;
    private buffer;
    private program;
    private animationFrameId;
    private resizeObserver;
    private eventListeners;
    private frame;
    constructor(fragmentShaderSrc: string, canvas?: HTMLCanvasElement | null);
    private init;
    private createShader;
    private setupBuffer;
    private resizeCanvas;
    private addEventListeners;
    initializeUniform(name: string, type: 'float' | 'int', value: number | number[]): void;
    updateUniforms(updates: Record<string, number | number[]>): void;
    step(time: number): void;
    play(callback?: (time: number, frame: number) => void): void;
    pause(): void;
    save(filename: string): void;
    initializeTexture(name: string, source: HTMLImageElement | HTMLVideoElement): void;
    updateTextures(updates: Record<string, HTMLImageElement | HTMLVideoElement>): void;
    destroy(): void;
}

export { ShaderPad as default };
