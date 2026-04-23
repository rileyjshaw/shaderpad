import * as react from 'react';
import { ComponentPropsWithoutRef, ReactNode, RefObject } from 'react';
import ShaderPad$1, { Plugin, Options, StepOptions } from './index.mjs';
import { AutosizeOptions } from './plugins/autosize.mjs';

type CursorTarget = Window | Element | RefObject<Element | null>;
type ShaderPadOptions = Omit<Options, 'canvas' | 'plugins' | 'cursorTarget'>;
type TextureDataAttributes = {
    'data-texture'?: string;
    'data-texture-history'?: string | number;
    'data-texture-preserve-y'?: string | boolean;
    'data-texture-internal-format'?: string;
    'data-texture-format'?: string;
    'data-texture-type'?: string;
    'data-texture-min-filter'?: string;
    'data-texture-mag-filter'?: string;
    'data-texture-wrap-s'?: string;
    'data-texture-wrap-t'?: string;
};
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
interface ShaderPadProps extends Omit<ComponentPropsWithoutRef<'canvas'>, 'children' | 'onError'>, TextureDataAttributes {
    shader: string;
    children?: ReactNode;
    plugins?: Plugin[];
    options?: ShaderPadOptions;
    autosize?: boolean | AutosizeOptions;
    cursorTarget?: CursorTarget;
    autoplay?: boolean;
    autopause?: boolean;
    onInit?: (shader: ShaderPad$1, canvas: HTMLCanvasElement) => void;
    onBeforeStep?: (shader: ShaderPad$1, time: number, frame: number) => StepOptions | void;
    onError?: (error: unknown) => void;
}
declare const ShaderPad: react.ForwardRefExoticComponent<ShaderPadProps & react.RefAttributes<ShaderPadHandle>>;

export { ShaderPad, type ShaderPadProps, ShaderPad as default };
