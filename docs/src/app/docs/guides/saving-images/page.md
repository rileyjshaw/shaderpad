---
title: Saving images
nextjs:
  metadata:
    title: Saving images
    description: Export ShaderPad output to PNG with the save plugin.
---

The `save` plugin adds a `save()` method that exports the current frame as PNG. On mobile, a share dialog is shown by default.

```typescript
import ShaderPad from 'shaderpad'
import save, { WithSave } from 'shaderpad/plugins/save'

const shader = new ShaderPad(fragmentShaderSrc, {
  canvas,
  plugins: [save()],
}) as WithSave<ShaderPad>

await shader.save('My Shader', 'Made with ShaderPad')
```

## Related

- [save plugin](/docs/plugins/save)
- [Chaining shaders](/docs/guides/chaining-shaders)
