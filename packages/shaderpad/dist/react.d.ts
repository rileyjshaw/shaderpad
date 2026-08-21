import { c as Plugin, d as ShaderPad$1, o as Options, p as StepOptions } from "./index-Bx7YV0w_.js";
import { AutosizeOptions } from "./plugins/autosize.js";
import { ComponentPropsWithoutRef, ReactNode, RefObject } from "react";
//#region src/react.d.ts
type CursorTarget = Window | Element | RefObject<Element | null>;
type ShaderPadOptions = Omit<Options, 'canvas' | 'plugins' | 'cursorTarget'>;
type TextureDataAttributes = {
  'data-texture'?: string;
  'data-texture-history'?: string | number;
  'data-texture-preserve-y'?: string | boolean;
  'data-texture-format'?: string;
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
  clearHistory(): void;
  rewind(): void;
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
  onInit?: (shader: ShaderPad$1, canvas: HTMLCanvasElement) => void | Promise<void>;
  onPreStep?: (shader: ShaderPad$1, time: number, frame: number) => StepOptions | void;
  onError?: (error: unknown) => void;
}
declare const ShaderPad: import("react").ForwardRefExoticComponent<ShaderPadProps & import("react").RefAttributes<ShaderPadHandle>>;
//#endregion
export { ShaderPad, ShaderPad as default, ShaderPadProps };
//# sourceMappingURL=react.d.ts.map