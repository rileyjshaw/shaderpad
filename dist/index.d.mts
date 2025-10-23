interface Options {
    canvas?: HTMLCanvasElement | null;
    history?: number;
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
    private historyLength;
    private historyTexture;
    canvas: HTMLCanvasElement;
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

export { ShaderPad as default };
