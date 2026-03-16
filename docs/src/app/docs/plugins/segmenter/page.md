---
title: segmenter
nextjs:
  metadata:
    title: segmenter
    description: Segmentation masks and category/confidence sampling for ShaderPad.
---

{% callout title="Peer dependency requirement" %}
To use this plugin, you must install MediaPipe as a peer dependency:

```bash
npm install @mediapipe/tasks-vision
```

{% /callout %}

The `segmenter` plugin uses MediaPipe's [Image Segmenter](https://ai.google.dev/edge/mediapipe/solutions/vision/image_segmenter) and exposes ShaderPad mask textures and GLSL helper functions.

```typescript
import segmenter from 'shaderpad/plugins/segmenter'

const shader = new ShaderPad(fragmentShaderSrc, {
  plugins: [
    segmenter({
      textureName: 'u_webcam',
      options: { outputConfidenceMasks: true },
    }),
  ],
})
```

The plugin reads from the texture named by `textureName`. Initialize and update that exact ShaderPad texture name, or the detector will have no live source to read from.

## Options

| Option                            | Meaning                                                   |
| --------------------------------- | --------------------------------------------------------- |
| `modelPath?: string`              | custom MediaPipe model path                               |
| `outputConfidenceMasks?: boolean` | expose per-category confidence instead of flat confidence |
| `history?: number`                | history depth for the segment mask                        |

## Events

Subscribe with `shader.on(name, callback)`.

| Event              | Callback                                      | Meaning                                                |
| ------------------ | --------------------------------------------- | ------------------------------------------------------ |
| `segmenter:ready`  | `() => void`                                  | model assets are loaded and the plugin is ready        |
| `segmenter:result` | `(result: ImageSegmenterResult) => void`      | latest MediaPipe result for the current analyzed frame |

```typescript
shader.on('segmenter:result', result => {
  console.log(result.categoryMask)
})
```

## Uniforms

| Uniform           | Meaning                                                                                   |
| ----------------- | ----------------------------------------------------------------------------------------- |
| `u_segmentMask`   | segmentation texture used internally by `segmentAt()`; direct sampling is only needed for custom decoding |
| `u_numCategories` | number of segmentation categories, including background                                   |

`u_segmentMask` stores:

- `R`: confidence for the winning category at that pixel
- `G`: normalized category index in the range `0.0` to `1.0`

If you need the integer category index in GLSL, recover it with:

```glsl
int categoryIndex = int(floor(segment.y * float(u_numCategories - 1) + 0.5));
```

## Helper Functions

If `history` is enabled, the helper below also has an overload with a trailing `int framesAgo` argument. `0` means the current analyzed frame, `1` means the previous stored frame, and so on.

### `segmentAt`

```glsl
vec2 segmentAt(vec2 pos)
vec2 segmentAt(vec2 pos, int framesAgo)
```

Returns `vec2(confidence, normalizedCategoryIndex)`.

- `x`: confidence for the winning category at `pos`
- `y`: normalized category index in the range `0.0` to `1.0`

When `outputConfidenceMasks` is `false`, the confidence component is always `1.0`.

```glsl
vec2 segment = segmentAt(v_uv);
float confidence = segment.x;
int categoryIndex = int(floor(segment.y * float(u_numCategories - 1) + 0.5));
float isForeground = float(categoryIndex != 0) * confidence;
color.rgb = mix(color.rgb, vec3(1.0, 0.0, 1.0), isForeground);
```

---

This page covers the ShaderPad-facing API surface. For MediaPipe result object structure and model changes, use the upstream [MediaPipe docs](https://ai.google.dev/edge/mediapipe/solutions/vision/image_segmenter).

## Related

- [History](/docs/core-concepts/history)
- [Webcam input](/docs/guides/webcam-input)
