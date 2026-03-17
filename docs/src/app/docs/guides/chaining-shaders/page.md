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
