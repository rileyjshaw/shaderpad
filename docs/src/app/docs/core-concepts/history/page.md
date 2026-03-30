---
title: History
nextjs:
    metadata:
        title: History
        description: Use output history and texture history for feedback, delay, and temporal effects.
---

History is one of ShaderPad’s more unique features, and can assist with snapshots, feedback effects, and creative coding. It lets you sample earlier frames without building the ring buffer yourself.

## Shader History

Enable history of the shader’s output in the constructor:

```javascript
const shader = new ShaderPad(fragmentShaderSrc, {
	canvas,
	history: 10,
});
```

In GLSL, that gives you access to prior rendered frames, which you can sample like this:

```glsl
uniform highp sampler2DArray u_history;
uniform int u_historyFrameOffset;
```

## Texture History

You can also maintain history for an individual texture:

```javascript
shader.initializeTexture('u_webcam', videoElement, { history: 30 });
```

That creates a history texture plus a matching frame-offset uniform such as `u_webcamFrameOffset`.

## Plugin History

Some plugins can also keep history for the textures they generate. For example, MediaPipe-backed plugins such as `face`, `hands`, `pose`, and `segmenter` accept a `history` option on their internal texture config.

```javascript
import face from 'shaderpad/plugins/face';

const shader = new ShaderPad(fragmentShaderSrc, {
	plugins: [face({ textureName: 'u_webcam', options: { history: 20 } })],
});
```

Plugin history behaves like texture history, including respecting `skipHistoryWrite` on the watched texture.

## Sampling Previous Frames

The `helpers` plugin provides `historyZ()` for sampling previous frames:

```javascript
import ShaderPad from 'shaderpad';
import helpers from 'shaderpad/plugins/helpers';

const FRAME_DELAY = 10;

const fragmentShaderSrc = `#version 300 es
precision highp float;

in vec2 v_uv;
uniform sampler2DArray u_history;
uniform int u_historyFrameOffset;
out vec4 outColor;

void main() {
  // Get the output color from FRAME_DELAY frames ago.
  float z = historyZ(u_history, u_historyFrameOffset, ${FRAME_DELAY});
  vec4 previous = texture(u_history, vec3(v_uv, z));
  outColor = previous;
}`;

const canvas = document.createElement('canvas');
const shader = new ShaderPad(fragmentShaderSrc, {
	canvas,
	history: FRAME_DELAY,
	plugins: [helpers()],
});
```

Use `historyZ(..., 1)` to sample the previous stored frame. Larger values move further back in time. For texture and plugin history, `historyZ(..., 0)` is also valid and refers to the current value.

## Skipping History Writes

Each frame is written to the history buffer by default. You can prevent a step from updating history with:

```javascript
{
	skipHistoryWrite: true;
}
```

This option is either returned from the `play()` callback or passed to `step()` as an argument:

```javascript
// Only write every 10th frame to history.
shader.play((time, frame) => {
	return { skipHistoryWrite: !!(frame % 10) };
});
```

```javascript
// Skip writing this frame to history.
shader.step({ skipHistoryWrite: true });
```

## Writing To Specific Texture History Slots

`updateTextures()` also exposes `historyWriteIndex` for history textures:

```javascript
shader.updateTextures({ u_webcam: videoElement }, { historyWriteIndex: 3 }); // Write to slot 3.
```

This writes into the specified slot and updates the texture's `*FrameOffset` uniform to that slot.

## History Precision

History buffers match the [precision and format options](/docs/core-concepts/format-and-precision) of their corresponding texture. This applies to framebuffer history (configured in the `ShaderPad` constructor) and texture history (configured in `initializeTexture()`).

---

{% callout title="draw does not advance history" %}
`draw()` renders the current state only. Use `step()` when a pass should count as a new frame in history.
{% /callout %}
