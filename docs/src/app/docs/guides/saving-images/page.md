---
title: Saving images
nextjs:
    metadata:
        title: Saving images
        description: Export ShaderPad output to PNG with the save utility.
---

Use `save()` from `shaderpad/util` to export the current frame. On mobile, a share dialog is shown by default.

```typescript
import ShaderPad from 'shaderpad';
import autosize from 'shaderpad/plugins/autosize';
import { save } from 'shaderpad/util';

const canvas = document.createElement('canvas');
const shader = new ShaderPad(fragmentShaderSrc, {
	canvas: canvas,
	plugins: [autosize()],
});

const saveButton = document.createElement('button');
saveButton.textContent = 'Save';
saveButton.onclick = () => {
	void save(shader, 'Soft Spirals', 'Saved with ShaderPad');
};
document.body.append(canvas);
document.body.append(saveButton);

shader.play();
```

{% saving-images-preview /%}
