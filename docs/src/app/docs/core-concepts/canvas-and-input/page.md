---
title: Canvas and input
nextjs:
  metadata:
    title: Canvas and input
    description: Choose canvas ownership, cursor targeting, and responsive sizing behavior.
---

ShaderPad can render into an existing canvas, or create an offscreen canvas for headless use.

## Canvas Options

```javascript
const shader = new ShaderPad(fragmentShaderSrc, { canvas })
```

Valid values for `canvas`:

- `HTMLCanvasElement`
- `OffscreenCanvas`
- `{ width, height }` creates a headless `OffscreenCanvas`
- `null` creates a 1 × 1 `OffscreenCanvas` that you can resize later

## Fullscreen Setup

Use the utility helper if you want a simple fullscreen canvas. For responsive resolution, combine it with the autosize plugin:

```javascript
import ShaderPad from 'shaderpad'
import { createFullscreenCanvas } from 'shaderpad/util'
import autosize from 'shaderpad/plugins/autosize'

const canvas = createFullscreenCanvas()
const shader = new ShaderPad(fragmentShaderSrc, { canvas, plugins: [autosize()] })
```

## Cursor Tracking

`cursorTarget` controls how `u_cursor` and `u_click` are normalized.

```javascript
const shader = new ShaderPad(fragmentShaderSrc, {
  canvas,
  cursorTarget: window,
})
```

Use `window` when the shader responds to viewport-wide input rather than canvas-local input. You can pass any DOM element to track input within that specific container.

## Resolution Changes

{% callout title="Resolution vs. Rendered Size" %}
An HTML canvas has both a rendered size controlled by CSS, and a drawing-buffer resolution controlled by its `width` and `height` attributes. That separation can be useful, so ShaderPad does not automatically adjust its resolution to match the rendered size. If you want that behavior, use the [autosize plugin](/docs/plugins/autosize).
{% /callout %}

In most cases, you will want to use the [autosize plugin](/docs/plugins/autosize) to sync the canvas `width` and `height` to its rendered size. For instance, `createFullscreenCanvas()` creates a canvas that fills the viewport, but without `autosize`, it will not automatically adjust resolution when the viewport size changes.

ShaderPad automatically updates its internal textures and render targets to match the canvas's resolution, so updating the `width` and `height` attributes will also update the GL drawing buffer size, history textures, and other internal state.

If you want to run a callback after resolution changes, use `shader.on('updateResolution', callback)`. If you use the autosize plugin, it emits an `autosize:resize` event when the rendered size changes.

## Related

- [Built-in inputs](/docs/core-concepts/built-in-inputs)
- [Autosize plugin](/docs/plugins/autosize)
- [Utilities](/docs/api/utilities)
