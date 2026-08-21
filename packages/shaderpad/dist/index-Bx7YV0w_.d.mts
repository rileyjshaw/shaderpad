//#region src/internal/formats.d.ts
type GLFormatString = 'R8' | 'R8_SNORM' | 'R16F' | 'R32F' | 'R8UI' | 'R8I' | 'R16UI' | 'R16I' | 'R32UI' | 'R32I' | 'RG8' | 'RG8_SNORM' | 'RG16F' | 'RG32F' | 'RG8UI' | 'RG8I' | 'RG16UI' | 'RG16I' | 'RG32UI' | 'RG32I' | 'RGB8' | 'SRGB8' | 'RGB565' | 'RGB8_SNORM' | 'R11F_G11F_B10F' | 'RGB9_E5' | 'RGB16F' | 'RGB32F' | 'RGB8UI' | 'RGB8I' | 'RGB16UI' | 'RGB16I' | 'RGB32UI' | 'RGB32I' | 'RGBA8' | 'SRGB8_ALPHA8' | 'RGBA8_SNORM' | 'RGB5_A1' | 'RGBA4' | 'RGB10_A2' | 'RGBA16F' | 'RGBA32F' | 'RGBA8UI' | 'RGBA8I' | 'RGB10_A2UI' | 'RGBA16UI' | 'RGBA16I' | 'RGBA32UI' | 'RGBA32I';
type GLRenderFormatString = Exclude<GLFormatString, 'R8_SNORM' | 'RG8_SNORM' | 'SRGB8' | 'RGB8_SNORM' | 'RGB9_E5' | 'RGB16F' | 'RGB32F' | 'RGB8UI' | 'RGB8I' | 'RGB16UI' | 'RGB16I' | 'RGB32UI' | 'RGB32I' | 'RGBA8_SNORM'>;
//#endregion
//#region src/index.d.ts
type UniformValue = number | number[] | (number | number[])[];
interface Uniform {
  type_: 'float' | 'int' | 'uint';
  length_: 1 | 2 | 3 | 4;
  location_: WebGLUniformLocation;
  arrayLength_?: number;
}
type GLFilterString = 'LINEAR' | 'NEAREST';
type GLWrapString = 'CLAMP_TO_EDGE' | 'REPEAT' | 'MIRRORED_REPEAT';
type ColorSpace = PredefinedColorSpace;
interface TextureOptions {
  format?: GLFormatString;
  minFilter?: GLFilterString;
  magFilter?: GLFilterString;
  wrapS?: GLWrapString;
  wrapT?: GLWrapString;
  colorSpace?: ColorSpace;
  preserveY?: boolean;
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
interface InitializeTextureOptions extends TextureOptions {
  history?: number;
}
type TextureSource = HTMLImageElement | HTMLVideoElement | HTMLCanvasElement | OffscreenCanvas | ImageBitmap | WebGLTexture | CustomTexture | ShaderPad;
type UpdateTextureSource = Exclude<TextureSource, CustomTexture> | PartialCustomTexture;
interface PluginContext {
  readonly options: Options;
  injectGLSL: (code: string) => void;
  emit: (name: ShaderPadEventName, ...args: any[]) => void;
  updateTexture: (name: string, source: UpdateTextureSource, historySlots?: HistorySlots) => void;
}
type Plugin = (shaderPad: ShaderPad, context: PluginContext) => void;
type ShaderPadEventName = '_init' | 'initializeTexture' | 'initializeUniform' | 'updateTextures' | 'updateUniforms' | 'preStep' | 'postStep' | 'preDraw' | 'postDraw' | 'updateResolution' | 'play' | 'pause' | 'reset' | 'destroy' | `${string}:${string}`;
interface RenderTextureOptions extends Omit<TextureOptions, 'format' | 'preserveY'> {
  format?: GLRenderFormatString;
}
interface Options extends RenderTextureOptions {
  canvas?: HTMLCanvasElement | OffscreenCanvas | {
    width: number;
    height: number;
  } | null;
  plugins?: Plugin[];
  history?: number;
  cursorTarget?: Window | Element;
}
interface StepOptions {
  skipClear?: boolean;
  skipHistory?: boolean;
}
type HistorySlots = number | number[];
declare class ShaderPad {
  #private;
  readonly gl: WebGL2RenderingContext;
  canvas: HTMLCanvasElement | OffscreenCanvas;
  constructor(fragmentShaderSrc: string, options?: Options);
  on(name: ShaderPadEventName, fn: Function): void;
  off(name: ShaderPadEventName, fn: Function): void;
  initializeUniform(name: string, type: Uniform['type_'], value: UniformValue, options?: {
    arrayLength?: number;
    allowMissing?: boolean;
  }): void;
  updateUniforms(updates: Record<string, UniformValue>, options?: {
    startIndex?: number;
    allowMissing?: boolean;
  }): void;
  initializeTexture(name: string, source: TextureSource, options?: InitializeTextureOptions): void;
  updateTextures(updates: Record<string, UpdateTextureSource>): void;
  clear(): void;
  clearHistory(): void;
  draw(options?: StepOptions | void): void;
  step(options?: StepOptions): void;
  play(onPreStep?: (time: number, frame: number) => StepOptions | void): void;
  pause(): void;
  rewind(): void;
  reset(): void;
  destroy(): void;
}
//#endregion
export { GLFormatString as _, InitializeTextureOptions as a, Plugin as c, ShaderPad as d, ShaderPadEventName as f, UpdateTextureSource as g, TextureSource as h, GLWrapString as i, PluginContext as l, TextureOptions as m, CustomTexture as n, Options as o, StepOptions as p, GLFilterString as r, PartialCustomTexture as s, ColorSpace as t, RenderTextureOptions as u, GLRenderFormatString as v };
//# sourceMappingURL=index-Bx7YV0w_.d.mts.map