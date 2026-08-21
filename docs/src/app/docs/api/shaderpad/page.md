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

| Option         | Type                                                                                | Default                                                   | Notes                                                                                                                                                                 |
| -------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `canvas`       | `HTMLCanvasElement \| OffscreenCanvas \| { width: number; height: number } \| null` | `new OffscreenCanvas(1, 1)`                               | If you pass an actual canvas, ShaderPad renders into it. If you pass `{ width, height }`, `null`, or omit the option, ShaderPad creates a headless `OffscreenCanvas`. |
| `plugins`      | `Plugin[]`                                                                          | `[]`                                                      | Installed during construction, before the final fragment shader is compiled, so plugins can inject GLSL and hooks.                                                    |
| `history`      | `number`                                                                            | `0`                                                       | Number of previous output frames to store. `0` disables output history entirely.                                                                                      |
| `cursorTarget` | `Window \| Element`                                                                 | The HTML canvas passed as `canvas`, otherwise `undefined` | Used for built-in `u_cursor` and `u_click` input tracking. Offscreen or headless setups only get pointer listeners if you pass a target explicitly.                   |
| `format`       | `GLRenderFormatString`                                                              | `'RGBA8'`                                                 | GPU render-target format. Float color targets such as `'RGBA16F'` and `'RGBA32F'` require `EXT_color_buffer_float`.                                                   |
| `minFilter`    | `GLFilterString`                                                                    | `'LINEAR'`, or `'NEAREST'` for integer formats            | Minification filter.                                                                                                                                                  |
| `magFilter`    | `GLFilterString`                                                                    | `'LINEAR'`, or `'NEAREST'` for integer formats            | Magnification filter.                                                                                                                                                 |
| `wrapS`        | `GLWrapString`                                                                      | `'CLAMP_TO_EDGE'`                                         | Horizontal wrap mode.                                                                                                                                                 |
| `wrapT`        | `GLWrapString`                                                                      | `'CLAMP_TO_EDGE'`                                         | Vertical wrap mode.                                                                                                                                                   |
| `colorSpace`   | `ColorSpace`                                                                        | Browser default (`'srgb'`)                                | Sets the WebGL drawing buffer color space when supported. Use `'display-p3'` for opt-in wide-gamut output.                                                            |

Constructor-level texture settings control:

- the intermediate render texture used for drawing
- the output history texture when `history > 0`
- the texture exposed when another `ShaderPad` samples this instance directly

## Exported Types

Root `shaderpad` exports `Options`, `StepOptions`, `TextureOptions`, `InitializeTextureOptions`, `TextureSource`, `UpdateTextureSource`, `CustomTexture`, `PartialCustomTexture`, `Plugin`, `PluginContext`, `ShaderPadEventName`, `ColorSpace`, and the GL literal string types. `shaderpad/util` exports `ToBlobOptions` and `SaveOptions`.

### GL Literal Types

The render-texture options above use these literal unions:

- `GLFormatString`: every sized colour texture format WebGL2 defines (49 values, such as `'RGBA8'`, `'R8'`, and `'RGB9_E5'`). Used for `initializeTexture()`.
- `GLRenderFormatString`: the renderable subset of `GLFormatString` that WebGL2 permits as framebuffer colour attachments. Used for the `ShaderPad` constructor.
- `GLFilterString`: `'LINEAR'`, `'NEAREST'`
- `GLWrapString`: `'CLAMP_TO_EDGE'`, `'REPEAT'`, `'MIRRORED_REPEAT'`
- `ColorSpace`: browser `PredefinedColorSpace`, currently `'srgb'` or `'display-p3'`

## API Sections

- [Uniforms](/docs/api/uniforms)
- [Methods](/docs/api/methods)
- [Properties](/docs/api/properties)
- [Events](/docs/api/events)
- [Utilities](/docs/api/utilities)
- [Plugins](/docs/api/plugins)
- [Web component](/docs/api/web-component)
- [React](/docs/api/react)
