---
title: autosize
nextjs:
  metadata:
    title: autosize
    description: Resize the canvas automatically and keep render resolution in sync.
---

The `autosize` plugin updates canvas resolution on resize to match its rendered size. If your canvas can be resized, you should probably use this plugin.

```javascript
import autosize from 'shaderpad/plugins/autosize'

const shader = new ShaderPad(fragmentShaderSrc, {
  canvas,
  plugins: [autosize()],
})
```

## Options

| Option | Meaning |
| --- | --- |
| `scale?: number` | Resolution multiplier relative to CSS pixels; defaults to the current `devicePixelRatio`, so use `1` to ignore `devicePixelRatio`. |
| `target?: Element \| Window` | Match the size of a specific element or the window. |
| `throttle?: number` | Throttle resize handling in milliseconds (default is 1/30th of a second). |

If you want fullscreen sizing but CSS-pixel resolution, use `scale: 1`. If you want a smaller render target, pass a smaller value like `0.5`:

```javascript
const shader = new ShaderPad(fragmentShaderSrc, {
  canvas: createFullscreenCanvas(),
  plugins: [autosize({ scale: 1 })],
})
```

```javascript
const shader = new ShaderPad(fragmentShaderSrc, {
  canvas: createFullscreenCanvas(),
  plugins: [autosize({ scale: 0.5 })],
})
```

## Event Behavior

- The plugin emits an `autosize:resize` event when it changes the canvas dimensions
- Core ShaderPad emits an `updateResolution` event after the drawing buffer and internal textures are updated

Use `updateResolution` when you care about the renderer being ready. Use `autosize:resize` when you care about the plugin’s resize trigger itself.
