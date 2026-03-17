---
title: Performance
nextjs:
  metadata:
    title: Performance
    description: ShaderPad-specific ways to reduce bandwidth, copies, and unnecessary work.
---

ShaderPad does a lot of work under the hood to make your graphics pipeline performant. If you want to fine-tune performance even further, the most valuable changes typically involve reducing texture bandwidth and avoiding unnecessary transfers between the CPU and GPU.

## Use The Smallest Format That Works

The default `RGBA8` pipeline is fine for many effects, but it is not always the cheapest choice.

Prefer:

- `R8` or `R32F` for single-channel masks
- `RGBA8` for normal color work
- `RGBA32F` only when the effect truly needs float precision
- Integer formats only when GLSL logic depends on integer sampling

Smaller formats reduce memory traffic in both ordinary rendering and history buffers.

Channel count matters as much as numeric precision. For example, `RGBA8` and `R32F` both use 32 bits per pixel. If an effect only needs one scalar value, dropping from `RGBA` to `R` can have a significant impact.

## Keep Chained Passes On The Same WebGL Context

This is one of the biggest ShaderPad-specific wins.

If multiple passes share the same canvas or context, ShaderPad can keep chained textures on the GPU. If the source and destination are on different contexts, it has to read pixels back to the CPU and upload them again.

Prefer this:

```javascript
const sharedCanvas = new OffscreenCanvas(width, height)

const passA = new ShaderPad(fragmentA, { canvas: sharedCanvas })
const passB = new ShaderPad(fragmentB, { canvas: sharedCanvas })
```

This is especially important for:

- Multi-pass pipelines
- Webcam or video texture preprocessing
- High-resolution intermediate textures

## Use Lower Resolution For Intermediate Passes

Not every pass needs full output resolution.

Downsample when a pass is only used for:

- Blur or bloom inputs
- Masks and segmentation
- Coarse simulation fields
- Preprocessing before a full-resolution composite

```javascript
const lowResPass = new ShaderPad(fragmentShaderSrc, {
  canvas: { width: 512, height: 512 },
})
```

If your passes already share one WebGL context, resizing that shared canvas between intermediate steps can be much cheaper than splitting the work across two separate contexts. It keeps the data on the GPU instead of forcing readbacks and reuploads. This won’t work for effects that rely on history, since those buffers need a stable size.

## Reduce History Size

History increases texture bandwidth, so use it mindfully.

- Disable history entirely when the effect or texture does not sample prior frames
- Use `skipHistoryWrite: true` on updates or steps that should not become a new history frame

For instance, let's say you want to store one sample per second for the previous 10 seconds. Instead of storing every rendered frame, you can do something like this:

```javascript
const shader = new ShaderPad(fragmentShaderSrc, {
  canvas,
  history: 10,
})

let lastStoredSecond = -1
shader.play(time => {
  const currentSecond = Math.floor(time)

  if (currentSecond === lastStoredSecond) {
    return { skipHistoryWrite: true }
  }

  lastStoredSecond = currentSecond
})
```

## Prefer Partial Updates For Data Textures

If a typed-array texture changes in a small region, update only that region instead of reallocating or reuploading the whole texture.

```javascript
shader.updateTextures({
  u_data: {
    data: patch,
    width: patchWidth,
    height: patchHeight,
    x: 0,
    y: 0,
    isPartial: true,
  },
})
```

## Choose Filtering Deliberately

`NEAREST` is usually the more performant choice, so start there unless you specifically need interpolation.

- Use `NEAREST` for data textures such as masks, landmarks, IDs, integer buffers, and history lookups that should stay discrete
- Use `LINEAR` for imagery, smooth scaling, blur inputs, or anything that should blend between texels

If a texture encodes values rather than pixels, `NEAREST` is usually the right answer.

## Batched MediaPipe Detection

ShaderPad's MediaPipe plugins are designed to avoid redundant model work in chained renders.

If you attach a MediaPipe plugin to multiple `ShaderPad` instances, ShaderPad shares a detector as long as these match:

- The plugin type (`face`, `pose`, `hands`, or `segmenter`)
- The `textureName`
- The plugin options that affect detector setup
- The underlying media source object

That means you can run a chained pipeline like this without paying for multiple pose detections per frame:

```javascript
const camera = document.querySelector('video')
const sharedCanvas = new OffscreenCanvas(1, 1)

const preprocess = new ShaderPad(preprocessFrag, {
  canvas: sharedCanvas,
  plugins: [pose({ textureName: 'u_video', options: { maxPoses: 1 } })],
})

const composite = new ShaderPad(compositeFrag, {
  canvas: sharedCanvas,
  plugins: [pose({ textureName: 'u_video', options: { maxPoses: 1 } })],
  textures: { u_scene: preprocess },
})

preprocess.updateTextures({ u_video: camera })
composite.updateTextures({ u_video: camera })
```

On the first pass, the shared detector runs and caches the result for that source frame. On later passes in the same render chain, the plugin sees the same source and video timestamp, skips a new MediaPipe call, and just publishes the cached landmark or mask textures to each subscriber.

To keep batching effective:

- Reuse the same `HTMLVideoElement`, `HTMLImageElement`, `HTMLCanvasElement`, or `OffscreenCanvas`
- Keep `textureName` identical across passes
- Keep plugin options aligned across passes
- Avoid creating duplicate plugins with tiny option differences unless you really need separate detectors

Batching can be useful when several passes need the same tracking data, such as a mask-generation pass plus a later stylization or composite pass.

## Be Deliberate With Plugins

MediaPipe plugins do real work outside the fragment shader. Enable them only when required, and configure the smallest useful outputs:

- Lower history depths when tracking history is short-lived
- Avoid extra model outputs unless the shader uses them
- Update the source texture once and reuse it across passes

## Profile The Whole Workflow

With ShaderPad, the slow part is often not the fragment shader itself. It can be:

- Updating a large texture every step
- Keeping unnecessary history buffers alive
- Transferring chained data across different WebGL contexts
- Storing more channels or precision than the effect needs

The most significant performance optimizations are often structural.

