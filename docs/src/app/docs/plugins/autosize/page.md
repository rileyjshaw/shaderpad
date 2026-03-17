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
| `ignorePixelRatio?: boolean` | ignore `devicePixelRatio` and match the CSS pixel size |
| `target?: Element \| Window` | match the size of a specific element or the window |
| `throttle?: number` | throttle resize handling in milliseconds (default is 1/30th of a second) |

## Event Behavior

- The plugin emits an `autosize:resize` event when it changes the canvas dimensions
- Core ShaderPad emits an `updateResolution` event after the drawing buffer and internal textures are updated

Use `updateResolution` when you care about the renderer being ready. Use `autosize:resize` when you care about the plugin’s resize trigger itself.

