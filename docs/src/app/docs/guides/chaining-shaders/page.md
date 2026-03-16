---
title: Chaining shaders
nextjs:
  metadata:
    title: Chaining shaders
    description: Build offscreen, multi-pass, and ShaderPad-as-texture workflows.
---

Chaining shaders is where ShaderPad’s internal texture handling becomes especially useful.

## What “Chaining” Means

One ShaderPad instance renders into an internal texture, and another ShaderPad samples that output.

```javascript
const passA = new ShaderPad(fragmentA, { canvas: new OffscreenCanvas(256, 256) })
const passB = new ShaderPad(fragmentB, { canvas })

passB.initializeTexture('u_firstPass', passA)
```

## Offscreen And Headless Usage

You do not need an HTML canvas for every pass.

```javascript
const offscreen = new ShaderPad(fragmentShaderSrc, {
  canvas: { width: 512, height: 512 },
})
```

That creates an internal `OffscreenCanvas` and is useful for:

- Intermediate passes
- Preprocessing
- Reduced-resolution buffers
- Texture-format conversion pipelines
## `draw()` Versus `step()`

Use `step()` when the pass should advance time, frame count, or history.

Use `draw()` when the pass should simply render current state without advancing those values.

This distinction matters in multi-pass and feedback workflows.

## Why Constructor Texture Options Exist

ShaderPad constructor options accept render-texture settings such as:

- `internalFormat`
- `format`
- `type`
- `minFilter`
- `magFilter`
- `wrapS`
- `wrapT`

These apply to ShaderPad’s internal render targets and history textures.

They matter when you want:

- Float or integer pipelines
- Reduced-channel storage such as `R8`
- Precision preservation across passes
- Explicit filtering behavior in chained shaders
## Example Pattern

The `webcam-bw` example demonstrates a good chained workflow:

- First pass renders webcam to a compact grayscale buffer
- Second pass samples that buffer and its history
## Related

- [Textures](/docs/core-concepts/textures)
- [History](/docs/core-concepts/history)
- [Format and precision](/docs/core-concepts/format-and-precision)
- [Performance](/docs/guides/performance)
