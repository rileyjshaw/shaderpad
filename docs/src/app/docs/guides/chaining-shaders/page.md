---
title: Chaining shaders
nextjs:
    metadata:
        title: Chaining shaders
        description: Build offscreen, multi-pass, and ShaderPad-as-texture workflows.
---

ShaderPad has a flexible & performant internal texture pipeline. Chaining shaders is where that becomes especially useful.

## What “Chaining” Means

ShaderPad can accept many types of texture sources, including other ShaderPad instances. “Chaining” is when you feed the output of one ShaderPad into another for further processing.

```javascript
const passA = new ShaderPad(fragmentA, { canvas: new OffscreenCanvas(256, 256) });
// If possible, share the same canvas for better performance
const passB = new ShaderPad(fragmentB, { canvas: passA.canvas });
passB.initializeTexture('u_firstPass', passA); // Use passA’s output as an input to passB
```

## Why Chain Shaders?

Often, everything you need can be done in a single shader pass. But some effects require more than one pass. Blur is a common example: one pass might create a smaller, already-blurred version of the image, and a later pass spreads that blur back across the final image. To try to do this in a single pass would be very inefficient.

Multi-pass rendering can also help structure your code. For instance, one pass might increase contrast, another might apply a color correction, and a third might add dithering. Keeping these stages separate can make the pipeline easier to understand and iterate on. When a single pass can produce the same result, it will usually be more efficient. But performance is not the only consideration; maintainability and readability matter too.

## Share WebGL Contexts When Possible

For chained passes, the best default is to keep the whole pipeline on one canvas. This allows each ShaderPad instance to use the same WebGL context, which allows the entire pipeline to stay on the GPU.

```javascript
import { createFullscreenCanvas } from 'shaderpad/util';

const sharedCanvas = createFullscreenCanvas();

const passA = new ShaderPad(fragmentA, {
	canvas: sharedCanvas,
});

const passB = new ShaderPad(fragmentB, {
	canvas: sharedCanvas,
});

passB.initializeTexture('u_firstPass', passA);
```

If two passes live on different WebGL contexts, ShaderPad has to read pixels back to the CPU and upload them back to the GPU for the next pass. That is far more expensive than just reusing a canvas.

## Synchronizing Renders

For animated multi-pass work, the simplest pattern is to use a single `play()` call from the final shader pass, and orchestrate the rest from within that callback. For example:

```javascript
const passA = new ShaderPad(fragmentA, { canvas: sharedCanvas });
const passB = new ShaderPad(fragmentB, { canvas: sharedCanvas });

passA.initializeTexture('u_webcam', video);
passB.initializeTexture('u_webcam', video);
passB.initializeTexture('u_firstPass', passA);

passB.play(() => {
	passA.updateTextures({ u_webcam: video });
	passB.updateTextures({ u_webcam: video });
	passA.step();
	passB.updateTextures({ u_firstPass: passA });
});
```

This gives the whole chain one clock, one render loop, and a clear sequence. It avoids subtle bugs where two passes animate at different rates or sample stale intermediate textures.
