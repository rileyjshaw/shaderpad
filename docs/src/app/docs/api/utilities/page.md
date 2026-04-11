---
title: Utilities
nextjs:
    metadata:
        title: Utilities
        description: Utility exports from ShaderPad.
---

## `createFullscreenCanvas(container?)`

```javascript
import { createFullscreenCanvas } from 'shaderpad/util';
```

Creates an HTML canvas, styles it for fullscreen use, appends it to the container or `document.body`, and returns it.

## `toBlob(shader, options?)`

```typescript
import { toBlob } from 'shaderpad/util';
```

Renders the current frame and returns a `Blob`. Use this when you want custom upload, clipboard, or persistence flows instead of a direct download.

| Option     | Meaning                                   |
| ---------- | ----------------------------------------- |
| `type?`    | MIME type passed to canvas blob encoding. |
| `quality?` | Quality hint for formats that support it. |

`toBlob()` works with both normal canvas-backed instances and headless `OffscreenCanvas` instances.

## `save(shader, filename?, text?, options?)`

```typescript
import { save } from 'shaderpad/util';
```

Renders the current frame, exports it, and either shares it through the Web Share API or downloads it.

| Parameter  | Meaning                                                                |
| ---------- | ---------------------------------------------------------------------- |
| `filename` | Output filename. Defaults to `export.png`.                             |
| `text`     | Optional share text when the Web Share API is used.                    |
| `options`  | `toBlob()` options plus `preventShare?: boolean` to force downloading. |
