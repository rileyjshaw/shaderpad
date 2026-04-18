import * as react from 'react';
import { ComponentPropsWithoutRef, RefObject } from 'react';
import ShaderPad$1, { Plugin, Options, StepOptions } from './index.js';
import { AutosizeOptions } from './plugins/autosize.js';

type CursorTarget = Window | Element | RefObject<Element | null>;
type EventMap = Partial<Record<string, (...args: any[]) => void>>;
type ShaderPadHandle = {
    readonly shader: ShaderPad$1 | null;
    readonly canvas: HTMLCanvasElement | null;
    play(): void;
    pause(): void;
    step(options?: StepOptions): void;
    draw(options?: StepOptions): void;
    clear(): void;
    resetFrame(): void;
    reset(): void;
    destroy(): void;
};
interface ShaderPadProps extends Omit<ComponentPropsWithoutRef<'canvas'>, 'children' | 'onError'> {
    shader: string;
    plugins?: Plugin[];
    options?: Omit<Options, 'canvas' | 'plugins' | 'cursorTarget'>;
    autosize?: boolean | AutosizeOptions;
    cursorTarget?: CursorTarget;
    autoPlay?: boolean;
    pauseWhenOffscreen?: boolean;
    onInit?: (shader: ShaderPad$1, canvas: HTMLCanvasElement) => void;
    onBeforeStep?: (shader: ShaderPad$1, time: number, frame: number) => StepOptions | void;
    onError?: (error: unknown) => void;
    onOnscreenChange?: (isOnscreen: boolean) => void;
    events?: EventMap;
}
declare const ShaderPad: react.ForwardRefExoticComponent<ShaderPadProps & react.RefAttributes<ShaderPadHandle>>;

export { ShaderPad, type ShaderPadProps, ShaderPad as default };
