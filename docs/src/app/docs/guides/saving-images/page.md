---
title: Saving images
nextjs:
    metadata:
        title: Saving images
        description: Export ShaderPad output to PNG with the save plugin.
---

The `save` plugin adds a `save()` method that exports the current frame as a PNG file. On mobile, a share dialog is shown by default.

```typescript
import ShaderPad from 'shaderpad';
import autosize from 'shaderpad/plugins/autosize';
import save, { WithSave } from 'shaderpad/plugins/save';

const canvas = document.createElement('canvas');
const shader = new ShaderPad(fragmentShaderSrc, {
	canvas: canvas,
	plugins: [save(), autosize()],
}) as WithSave<ShaderPad>;

const saveButton = document.createElement('button');
saveButton.textContent = 'Save';
saveButton.onclick = () => {
	shader.save('Soft Spirals', 'Saved with ShaderPad');
};
document.body.append(canvas);
document.body.append(saveButton);

shader.play();
```

{% saving-images-preview /%}
