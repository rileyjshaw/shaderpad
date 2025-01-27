declare class Shader {
    private canvas;
    private gl;
    private downloadLink;
    private fragmentShaderSrc;
    private uniforms;
    private animationFrameId;
    private resizeObserver;
    private program;
    constructor(fragmentShaderSrc: string, canvas?: HTMLCanvasElement | null);
    private init;
    private createShader;
    private setupBuffer;
    private resizeCanvas;
    private addEventListeners;
    initializeUniform(name: string, type: 'float' | 'int', value: number | number[]): void;
    updateUniforms(updates: Record<string, number | number[]>): void;
    play(callback?: (time: number) => void): void;
    pause(): void;
    save(filename: string): void;
}

export { Shader as default };
