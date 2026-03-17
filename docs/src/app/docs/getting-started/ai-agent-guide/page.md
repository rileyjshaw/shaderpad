---
title: AI agent guide
nextjs:
  metadata:
    title: AI agent guide for ShaderPad
    description: A single-page guide for AI agents and coding assistants writing correct ShaderPad programs.
    keywords:
      - ShaderPad
      - AI agent guide
      - LLM instructions
      - coding assistant
      - WebGL2
      - fragment shaders
---

This page is the shortest path from “I need a shader effect” to a correct ShaderPad program. If you are an AI agent, start here, then pull in only the specific API or plugin pages you actually need. The machine-readable public entry point is [`/llms.txt`](/llms.txt), and concrete examples live in [`examples/src` on GitHub](https://github.com/rileyjshaw/shaderpad/tree/main/examples/src). {% .lead %}

## Default Mental Model

ShaderPad is a fragment-shader runtime, not a scene graph.

- Write one fragment shader.
- Feed it built-in uniforms, custom uniforms, and textures.
- Let ShaderPad handle WebGL2 setup, render loops, and history buffers.
- Add plugins only when the prompt clearly requires them.

## Best Default Template

If the user asks for “a fullscreen shader in the browser”, this is the safest minimal default:

```javascript
import ShaderPad from 'shaderpad'
import { createFullscreenCanvas } from 'shaderpad/util'
import autosize from 'shaderpad/plugins/autosize'

const fragmentShaderSrc = `#version 300 es
precision highp float;

in vec2 v_uv;
uniform vec2 u_resolution;
out vec4 outColor;

void main() {
  vec2 uv = v_uv;
  uv.x *= u_resolution.x / u_resolution.y;

  outColor = vec4(uv.xy, 0.0, 1.0);
}`

const shader = new ShaderPad(fragmentShaderSrc, {
  canvas: createFullscreenCanvas(),
  plugins: [autosize()],
})

shader.play()
```

## Core Rules

- Always include `#version 300 es`, `in vec2 v_uv;`, and `out vec4 outColor;` in normal fragment shaders.
- Declare only the built-in uniforms you actually use, such as `u_time`, `u_resolution`, or `u_cursor`.
- Call `initializeUniform()` before `updateUniforms()`.
- Call `initializeTexture()` before `updateTextures()`.
- For live video or webcam inputs, update the texture every frame inside `play()`.
- Use `play()` for animation, `step()` for manual frame advancement, and `draw()` only for render-only passes.
- `draw()` does not advance `u_time`, `u_frame`, or history buffers.
- If you use the `helpers` plugin, do not manually declare `u_resolution`; the plugin injects it for you.
- If the canvas might resize, add `autosize()`.
- Omitting `canvas` creates a headless `OffscreenCanvas`, which is great for offscreen passes but not for DOM interaction by itself.

## Pick The Right Feature

| Goal | Default move |
| --- | --- |
| Fullscreen shader demo | `createFullscreenCanvas()` plus `autosize()` |
| Animate over time | `u_time` plus `shader.play()` |
| Feed JS values into GLSL | `initializeUniform()` then `updateUniforms()` |
| Sample an image, video, or canvas | `initializeTexture()` then `updateTextures()` as needed |
| Webcam effect | use a `<video>` texture and update it every frame |
| Delay, trails, feedback | enable `history` and usually add `helpers()` for `historyZ()` |
| Multi-pass pipeline | pass one `ShaderPad` instance directly into another as a texture |
| Face, pose, hands, segmentation | install `@mediapipe/tasks-vision` and use the matching plugin |

## Performance Rules

- Prefer one WebGL context whenever possible.
- Multi-pass ShaderPad pipelines should almost always share the same canvas or context rather than creating multiple visible canvases.
- Even if a pass is visible, it can often render into the same on-screen canvas as the final pass.
- In a normal `requestAnimationFrame` loop, the last draw to that canvas is what the user actually sees on screen.
- Use headless or offscreen ShaderPad instances for intermediate passes when that keeps the pipeline simpler, but do not create extra contexts unless the task truly needs them.
- Passing one `ShaderPad` instance into another as a texture is the preferred multi-pass path.
- Be conservative with resolution and history depth before adding more passes.

## Canonical Imports

```typescript
import ShaderPad from 'shaderpad'
import { createFullscreenCanvas } from 'shaderpad/util'
import autosize from 'shaderpad/plugins/autosize'
import helpers from 'shaderpad/plugins/helpers'
import save, { WithSave } from 'shaderpad/plugins/save'
import face from 'shaderpad/plugins/face'
import pose from 'shaderpad/plugins/pose'
import hands from 'shaderpad/plugins/hands'
import segmenter from 'shaderpad/plugins/segmenter'
```

## Common Recipes

### Custom Uniform Animation

```javascript
shader.initializeUniform('u_strength', 'float', 0.0)
shader.play((time) => {
  shader.updateUniforms({ u_strength: 0.5 + 0.5 * Math.sin(time) })
})
```

### Webcam Or Video Shader

```javascript
shader.initializeTexture('u_webcam', video)
shader.play(() => {
  shader.updateTextures({ u_webcam: video })
})
```

```glsl
uniform sampler2D u_webcam;

void main() {
  vec2 uv = vec2(1.0 - v_uv.x, v_uv.y);
  outColor = texture(u_webcam, uv);
}
```

### History And Feedback

```javascript
import helpers from 'shaderpad/plugins/helpers'

const shader = new ShaderPad(fragmentShaderSrc, {
  canvas,
  history: 20,
  plugins: [helpers()],
})
```

```glsl
uniform highp sampler2DArray u_history;
uniform int u_historyFrameOffset;

float z = historyZ(u_history, u_historyFrameOffset, 1);
vec4 previous = texture(u_history, vec3(v_uv, z));
```

Use `step()` or `play()` when history should advance. Do not use `draw()` if the effect depends on new history frames.

### Chained Multi-Pass Shader

```javascript
const passA = new ShaderPad(fragmentA, {
  canvas: { width: 512, height: 512 },
})

const passB = new ShaderPad(fragmentB, { canvas })
passB.initializeTexture('u_passA', passA)
```

Use a headless or offscreen pass for intermediates, and call `step()` on a pass if it should advance time, frame, or history.

## MediaPipe Plugin Rules

The `face`, `pose`, `hands`, and `segmenter` plugins all require:

```bash
npm install @mediapipe/tasks-vision
```

They also all depend on a live texture name. If the plugin is configured with `textureName: 'u_webcam'`, then the actual ShaderPad texture must also be initialized as `u_webcam`.

## Preflight Checklist

- The shader includes `#version 300 es`.
- The shader includes `precision highp float;`.
- The shader includes `in vec2 v_uv;`.
- The shader includes `out vec4 outColor;`.
- Every custom uniform is initialized before being updated.
- Every texture is initialized before being updated.
- Live textures like webcam or video are refreshed every frame.
- If the effect needs previous frames, `history` is enabled.
- If `helpers()` is installed, `u_resolution` is not manually declared.
- If a MediaPipe plugin is used, `@mediapipe/tasks-vision` is installed.
- If a MediaPipe plugin is used, its `textureName` matches the actual initialized texture name.

## Common Failure Modes

### The shader compiles badly

Usually one of these:

- missing `#version 300 es`
- missing `out vec4 outColor;`
- duplicate `u_resolution` declaration caused by `helpers()`

### The effect renders black

Usually one of these:

- the code never called `shader.play()`
- a live texture was initialized but never updated
- the shader is sampling the wrong texture uniform name
- the pass that should advance history is using `draw()` instead of `step()` or `play()`

### The vision plugin does nothing

Usually one of these:

- `@mediapipe/tasks-vision` is not installed
- the plugin `textureName` does not match the actual texture name
- the webcam texture exists, but the code never updates it every frame

## Recommended Reading Order

When you need more than this page, pull context in this order:

1. [Quickstart](/docs/getting-started/quickstart)
2. [ShaderPad API](/docs/api/shaderpad)
3. [Methods](/docs/api/methods)
4. [Built-in inputs](/docs/core-concepts/built-in-inputs)
5. [History](/docs/core-concepts/history), if the effect depends on previous frames
6. [Chaining shaders](/docs/guides/chaining-shaders), if the effect is multi-pass
7. The page for a specific plugin, but only if you are actually using that plugin
