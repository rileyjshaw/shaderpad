interface Options {
    canvas?: HTMLCanvasElement | null;
    history?: number;
}
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
    private resizeTimeout;
    private lastResizeTime;
    private eventListeners;
    private frame;
    private startTime;
    private cursorPosition;
    private clickPosition;
    private isMouseDown;
    private historyLength;
    private historyTexture;
    onResize?: (width: number, height: number) => void;
    constructor(fragmentShaderSrc: string, options?: Options);
    private init;
    private initializeHistoryBuffer;
    private clearHistory;
    private createShader;
    private setupBuffer;
    private throttledHandleResize;
    private handleResize;
    private addEventListeners;
    initializeUniform(name: string, type: 'float' | 'int', value: number | number[]): void;
    updateUniforms(updates: Record<string, number | number[]>): void;
    step(time: number): void;
    play(callback?: (time: number, frame: number) => void): void;
    pause(): void;
    reset(): void;
    save(filename: string): void;
    initializeTexture(name: string, source: HTMLImageElement | HTMLVideoElement): void;
    updateTextures(updates: Record<string, HTMLImageElement | HTMLVideoElement>): void;
    destroy(): void;
}

export { ShaderPad as default };
