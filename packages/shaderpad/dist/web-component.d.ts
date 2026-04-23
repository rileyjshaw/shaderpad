import ShaderPad, { Plugin, Options, StepOptions } from './index.js';
import { AutosizeOptions } from './plugins/autosize.js';

declare const ShaderPadElementBase: typeof HTMLElement;
type ShaderPadElementOptions = Omit<Options, 'canvas' | 'plugins' | 'cursorTarget'>;
type CursorTarget = Window | Element | null;
type ShaderPadElementConfig = {
    plugins?: Plugin[];
    options?: ShaderPadElementOptions;
    autosize?: boolean | AutosizeOptions;
    cursorTarget?: CursorTarget;
    autoplay?: boolean;
    autopause?: boolean;
};
type NormalizedShaderPadElementConfig = {
    plugins: Plugin[];
    options: ShaderPadElementOptions;
    autosize: boolean | AutosizeOptions;
    cursorTarget: CursorTarget;
    autoplay: boolean;
    autopause: boolean;
};
type ShaderPadElementLoadEventDetail = {
    shader: ShaderPad;
    canvas: HTMLCanvasElement | null;
};
type ShaderPadElementErrorEventDetail = {
    error: unknown;
};
type ShaderPadElementVisibilityChangeEventDetail = {
    shader: ShaderPad;
    canvas: HTMLCanvasElement | null;
    isVisible: boolean;
};
type ShaderPadElementBeforeStepEventDetail = {
    shader: ShaderPad;
    canvas: HTMLCanvasElement | null;
    time: number;
    frame: number;
    stepOptions: StepOptions | undefined;
};
declare class ShaderPadElement extends ShaderPadElementBase {
    static observedAttributes: string[];
    static shaderPadConfig: NormalizedShaderPadElementConfig;
    private shaderInstance;
    private renderCanvas;
    private generatedCanvas;
    private initPromise;
    private pluginsValue;
    private defaultOptionsValue;
    private optionsValue;
    private autosizeValue;
    private cursorTargetValue;
    private autoplayValue;
    private autopauseValue;
    private isPlaying;
    private playbackController;
    private cleanupCallbacks;
    private textureRestoreCallbacks;
    private controlVisibility;
    private liveTextures;
    constructor();
    get shader(): ShaderPad | null;
    get canvas(): HTMLCanvasElement | null;
    get options(): ShaderPadElementOptions | undefined;
    set options(value: ShaderPadElementOptions | undefined);
    get autosize(): boolean | AutosizeOptions | undefined;
    set autosize(value: boolean | AutosizeOptions | undefined);
    get cursorTarget(): CursorTarget | undefined;
    set cursorTarget(value: CursorTarget | undefined);
    get autoplay(): boolean;
    set autoplay(value: boolean);
    get autopause(): boolean;
    set autopause(value: boolean);
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void;
    play(): Promise<void>;
    pause(): void;
    step(options?: StepOptions): void;
    draw(options?: StepOptions): void;
    clear(): void;
    resetFrame(): void;
    reset(): void;
    destroy(): void;
    private emit;
    private addCleanupListener;
    private reflectDefaultTrueAttribute;
    private ensureInitialized;
    private initialize;
    private getInstalledPlugins;
    private bindInstanceEvents;
    private setupPlayback;
    private syncPlayback;
    private destroyInstance;
    private getFragmentShaderScript;
    private getFragmentShaderSource;
    private resolveRenderCanvas;
    private ensureGeneratedCanvas;
    private removeGeneratedCanvas;
    private getTextureBindings;
    private prepareNestedTextureChildren;
    private initializeTextures;
    private installChildListeners;
    private runCallbacks;
    private hideControlChildren;
    private showControlChildren;
    private updateLiveTextures;
    private playInstance;
    private dispatchMutableBeforeStep;
}
declare function createShaderPadElement(config?: ShaderPadElementConfig): typeof ShaderPadElement;
declare global {
    interface HTMLElementTagNameMap {
        'shader-pad': ShaderPadElement;
    }
}

export { ShaderPadElement, type ShaderPadElementBeforeStepEventDetail, type ShaderPadElementConfig, type ShaderPadElementErrorEventDetail, type ShaderPadElementLoadEventDetail, type ShaderPadElementVisibilityChangeEventDetail, createShaderPadElement };
