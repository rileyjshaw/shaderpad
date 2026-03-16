---
title: save
nextjs:
  metadata:
    title: save
    description: Add PNG export support to a ShaderPad instance.
---

The `save` plugin adds a `save()` method to a ShaderPad instance.

```typescript
import ShaderPad from 'shaderpad'
import save, { WithSave } from 'shaderpad/plugins/save'

const shader = new ShaderPad(fragmentShaderSrc, {
  canvas,
  plugins: [save()],
}) as WithSave<ShaderPad>
```

## Method Signature

```typescript
save(filename?: string, text?: string, options?: {
  preventShare?: boolean
}): Promise<void>
```

- `filename` defaults to `export.png`
- `text` adds a message alongside the image file when using the Web Share API on mobile
- `preventShare` forces download behavior on mobile instead of using the Web Share API
