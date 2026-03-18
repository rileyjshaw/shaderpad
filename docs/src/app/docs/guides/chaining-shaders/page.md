---
title: Chaining shaders
nextjs:
  metadata:
    title: Chaining shaders
    description: Build offscreen, multi-pass, and ShaderPad-as-texture workflows.
---

ShaderPad has a flexible & performant internal texture pipeline. Chaining shaders is where that becomes especially useful.

## What “Chaining” Means

ShaderPad can accept many types of texture sources, including other ShaderPad instances. “Chaining” is when you feed the output of one ShaderPad into another for further processing.

```javascript
const passA = new ShaderPad(fragmentA, { canvas: new OffscreenCanvas(256, 256) })
// If possible, share the same canvas for better performance
const passB = new ShaderPad(fragmentB, { canvas: passA.canvas })
passB.initializeTexture('u_firstPass', passA) // Use passA’s output as an input to passB
```

## Why Chain Shaders?

Often, everything you need can be done in a single shader pass. But some effects require more than one pass. Blur is a common example: one pass might create a smaller, already-blurred version of the image, and a later pass spreads that blur back across the final image. To try to do this in a single pass would be very inefficient.

Multi-pass rendering can also help structure your code. For instance, one pass might increase contrast, another might apply a color correction, and a third might add dithering. Keeping these stages separate can make the pipeline easier to understand and iterate on. When a single pass can produce the same result, it will usually be more efficient. But performance is not the only consideration; maintainability and readability matter too.

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
