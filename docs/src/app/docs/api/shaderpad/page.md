---
title: ShaderPad
nextjs:
    metadata:
        title: ShaderPad API
        description: Constructor overview and API entry point for ShaderPad.
---

`ShaderPad` is the core class exported by the library.

```javascript
import ShaderPad from 'shaderpad';
```

## Constructor

```typescript
new ShaderPad(fragmentShaderSrc: string, options?: Options)
```

`ShaderPad` creates a WebGL2 program, initializes built-in uniforms, allocates its render targets, optionally allocates output history, and installs plugins.

### Constructor Options Reference

| Option           | Type                                                                                | Default                                                    | Notes                                                                                                                                                                 |
| ---------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `canvas`         | `HTMLCanvasElement \| OffscreenCanvas \| { width: number; height: number } \| null` | `new OffscreenCanvas(1, 1)`                                | If you pass an actual canvas, ShaderPad renders into it. If you pass `{ width, height }`, `null`, or omit the option, ShaderPad creates a headless `OffscreenCanvas`. |
| `plugins`        | `Plugin[]`                                                                          | `[]`                                                       | Installed during construction, before the final fragment shader is compiled, so plugins can inject GLSL and hooks.                                                    |
| `history`        | `number`                                                                            | `0`                                                        | Number of previous output frames to store. `0` disables output history entirely.                                                                                      |
| `cursorTarget`   | `Window \| Element`                                                                 | The HTML canvas passed as `canvas`, otherwise `undefined`  | Used for built-in `u_cursor` and `u_click` input tracking. Offscreen or headless setups only get pointer listeners if you pass a target explicitly.                   |
| `internalFormat` | `GLInternalFormatString`                                                            | Derived from `type`, otherwise `'RGBA8'`                   | Float color targets such as `'RGBA16F'` and `'RGBA32F'` require `EXT_color_buffer_float`.                                                                             |
| `format`         | `GLFormatString`                                                                    | Derived from `internalFormat`                              | Defaults to `'RGBA'` for normalized and float color formats, and `'RGBA_INTEGER'` for integer color formats.                                                          |
| `type`           | `GLTypeString`                                                                      | Derived from `internalFormat`, otherwise `'UNSIGNED_BYTE'` | Texel data type.                                                                                                                                                      |
| `minFilter`      | `GLFilterString`                                                                    | `'LINEAR'`                                                 | Minification filter.                                                                                                                                                  |
| `magFilter`      | `GLFilterString`                                                                    | `'LINEAR'`                                                 | Magnification filter.                                                                                                                                                 |
| `wrapS`          | `GLWrapString`                                                                      | `'CLAMP_TO_EDGE'`                                          | Horizontal wrap mode.                                                                                                                                                 |
| `wrapT`          | `GLWrapString`                                                                      | `'CLAMP_TO_EDGE'`                                          | Vertical wrap mode.                                                                                                                                                   |

Constructor-level texture settings control:

- the intermediate render texture used for drawing
- the output history texture when `history > 0`
- the texture exposed when another `ShaderPad` samples this instance directly

## Exported Types

Root `shaderpad` exports `Options`, `StepOptions`, `TextureOptions`, `InitializeTextureOptions`, `TextureSource`, `UpdateTextureSource`, `CustomTexture`, `PartialCustomTexture`, `Plugin`, `PluginContext`, `ShaderPadEventName`, and the GL literal string types. `shaderpad/util` exports `ToBlobOptions` and `SaveOptions`.

### GL Literal Types

The render-texture options above use these literal unions:

- `GLInternalFormatString`: every combination of channel prefix `'R'`, `'RG'`, `'RGB'`, or `'RGBA'` with suffix `'8'`, `'16F'`, `'32F'`, `'8UI'`, `'8I'`, `'16UI'`, `'16I'`, `'32UI'`, or `'32I'` (36 total values, from `'R8'` through `'RGBA32I'`)
- `GLFormatString`: `'RED'`, `'RG'`, `'RGB'`, `'RGBA'`, `'RED_INTEGER'`, `'RG_INTEGER'`, `'RGB_INTEGER'`, `'RGBA_INTEGER'`
- `GLTypeString`: `'UNSIGNED_BYTE'`, `'BYTE'`, `'FLOAT'`, `'HALF_FLOAT'`, `'UNSIGNED_SHORT'`, `'SHORT'`, `'UNSIGNED_INT'`, `'INT'`
- `GLFilterString`: `'LINEAR'`, `'NEAREST'`
- `GLWrapString`: `'CLAMP_TO_EDGE'`, `'REPEAT'`, `'MIRRORED_REPEAT'`

## API Sections

- [Uniforms](/docs/api/uniforms)
- [Methods](/docs/api/methods)
- [Properties](/docs/api/properties)
- [Events](/docs/api/events)
- [Utilities](/docs/api/utilities)
- [Plugins](/docs/api/plugins)
- [Web component](/docs/api/web-component)
- [React](/docs/api/react)
