---
title: ShaderPad
nextjs:
  metadata:
    title: ShaderPad API
    description: Constructor overview and API entry point for ShaderPad.
---

`ShaderPad` is the core class exported by the library.

```typescript
import ShaderPad from 'shaderpad'
```

## Constructor

```typescript
new ShaderPad(fragmentShaderSrc: string, options?: Options)
```

`ShaderPad` creates a WebGL2 program, initializes built-in uniforms, allocates its internal render target, optionally allocates output history, and installs plugins.

### Constructor Options Reference

| Option           | Type                                                               | Default                                              | Notes |
| ---------------- | ------------------------------------------------------------------ | ---------------------------------------------------- | ----- |
| `canvas`         | `HTMLCanvasElement \| OffscreenCanvas \| { width: number; height: number } \| null` | `new OffscreenCanvas(1, 1)`                          | If you pass an actual canvas, ShaderPad renders into it. If you pass `{ width, height }`, `null`, or omit the option, ShaderPad creates a headless `OffscreenCanvas`. |
| `plugins`        | `Plugin[]`                                                         | `[]`                                                 | Installed during construction, before the final fragment shader is compiled, so plugins can inject GLSL and hooks. |
| `history`        | `number`                                                           | `0`                                                  | Number of previous output frames to retain. `0` disables output history entirely. |
| `debug`          | `boolean`                                                          | `false` | Enables internal debug logging such as skipped uniform updates. |
| `cursorTarget`   | `Window \| Element`                                                | The HTML canvas passed as `canvas`, otherwise `undefined` | Used to normalize built-in `u_cursor` and `u_click` input tracking. Offscreen or headless setups only get pointer listeners if you pass a target explicitly. |
| `internalFormat` | `GLInternalFormatString`                                           | Derived from `type`, otherwise `'RGBA8'`             | Applies to ShaderPad's internal render texture and output history texture. Float color targets such as `'RGBA16F'` and `'RGBA32F'` require `EXT_color_buffer_float`. |
| `format`         | `GLFormatString`                                                   | Derived from `internalFormat`                        | Defaults to `'RGBA'` for normalized and float color formats, and `'RGBA_INTEGER'` for integer color formats. |
| `type`           | `GLTypeString`                                                     | Derived from `internalFormat`, otherwise `'UNSIGNED_BYTE'` | Controls the texel data type used for the internal render target and output history. |
| `minFilter`      | `GLFilterString`                                                   | `'LINEAR'`                                           | Minification filter for the internal render texture and output history texture. |
| `magFilter`      | `GLFilterString`                                                   | `'LINEAR'`                                           | Magnification filter for the internal render texture and output history texture. |
| `wrapS`          | `GLWrapString`                                                     | `'CLAMP_TO_EDGE'`                                    | Horizontal wrap mode for the internal render texture and output history texture. |
| `wrapT`          | `GLWrapString`                                                     | `'CLAMP_TO_EDGE'`                                    | Vertical wrap mode for the internal render texture and output history texture. |

Constructor-level texture settings control:

- the intermediate render texture used for drawing
- the output history texture when `history > 0`
- the texture exposed when another `ShaderPad` samples this instance directly

### GL Literal Types

The render-texture options above use these literal unions:

- `GLInternalFormatString`: channel/depth combinations such as `'R8'`, `'RG8'`, `'RGB8'`, `'RGBA8'`, `'R16F'`, `'RGBA32F'`, `'R8UI'`, `'RG16I'`, `'RGBA32UI'`
- `GLFormatString`: `'RED'`, `'RG'`, `'RGB'`, `'RGBA'`, `'RED_INTEGER'`, `'RG_INTEGER'`, `'RGB_INTEGER'`, `'RGBA_INTEGER'`
- `GLTypeString`: `'UNSIGNED_BYTE'`, `'BYTE'`, `'FLOAT'`, `'HALF_FLOAT'`, `'UNSIGNED_SHORT'`, `'SHORT'`, `'UNSIGNED_INT'`, `'INT'`
- `GLFilterString`: `'LINEAR'`, `'NEAREST'`
- `GLWrapString`: `'CLAMP_TO_EDGE'`, `'REPEAT'`, `'MIRRORED_REPEAT'`

## API Sections

- [Uniforms](/docs/api/uniforms)
- [Methods](/docs/api/methods)
- [Events](/docs/api/events)
- [Utilities](/docs/api/utilities)
