---
title: autosize
nextjs:
  metadata:
    title: autosize
    description: Resize the canvas automatically and keep render resolution in sync.
---

The `autosize` plugin updates the canvas resolution on resize to match its rendered size. If your canvas can be resized, you should probably use this plugin.

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
| `ignorePixelRatio?: boolean` | ignore `devicePixelRatio` and size in CSS pixels |
| `target?: Element \| Window` | observe a specific element or the window |
| `throttle?: number` | throttle resize handling in milliseconds |

## Event Behavior

- The plugin emits an `autosize:resize` event when it changes the canvas dimensions
- Core ShaderPad emits an `updateResolution` event after the drawing buffer and internal textures are updated
Use `updateResolution` when you care about the renderer being ready. Use `autosize:resize` when you care about the plugin’s resize trigger itself.

## Related

- [Canvas and input](/docs/core-concepts/canvas-and-input)
- [Events](/docs/api/events)
