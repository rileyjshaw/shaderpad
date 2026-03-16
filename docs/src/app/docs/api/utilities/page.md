---
title: Utilities
nextjs:
  metadata:
    title: Utilities
    description: Utility exports from ShaderPad.
---

## `createFullscreenCanvas(container?)`

```javascript
import { createFullscreenCanvas } from 'shaderpad/util'
```

Creates an HTML canvas, styles it for fullscreen use, appends it to the container or `document.body`, and returns it.

## `safeMod(i, m)`

```javascript
import { safeMod } from 'shaderpad/util'
```

Returns a positive modulo result equal to GLSL’s `mod()` in most cases. Most users will not need this directly, but it can be useful for custom indexing logic.
