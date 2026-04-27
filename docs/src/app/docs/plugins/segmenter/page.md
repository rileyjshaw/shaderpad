---
title: segmenter
nextjs:
    metadata:
        title: segmenter
        description: Segmentation masks and category/confidence sampling for ShaderPad.
---

{% callout title="Additional install" %}
If you use this plugin, also install MediaPipe:

```bash
npm install @mediapipe/tasks-vision
```

{% /callout %}

The `segmenter` plugin uses MediaPipe's [Image Segmenter](https://ai.google.dev/edge/mediapipe/solutions/vision/image_segmenter) and exposes ShaderPad mask textures and GLSL helper functions.

```javascript
import segmenter from 'shaderpad/plugins/segmenter';

const shader = new ShaderPad(fragmentShaderSrc, {
	plugins: [
		segmenter({
			textureName: 'u_webcam',
			options: { outputConfidenceMasks: true },
		}),
	],
});
```

The plugin reads from the `textureName` texture. Initialize and update that exact ShaderPad texture name, or the detector will have no source to read from.

## Config

| Field                  | Meaning                                                              |
| ---------------------- | -------------------------------------------------------------------- |
| `textureName`          | The live texture name the plugin reads from.                         |
| `wasmBaseUrl?: string` | Base URL for MediaPipe's vision WASM runtime files. Defaults to CDN. |
| `options?`             | MediaPipe and history options listed below.                          |

## MediaPipe Options

| Option                            | Meaning                                                    |
| --------------------------------- | ---------------------------------------------------------- |
| `modelPath?: string`              | Custom MediaPipe model path.                               |
| `outputConfidenceMasks?: boolean` | Expose per-category confidence instead of flat confidence. |
| `history?: number`                | History depth for the segment mask.                        |

## Events

Subscribe with `shader.on(name, callback)`.

| Event              | Callback                                 | Meaning                                                 |
| ------------------ | ---------------------------------------- | ------------------------------------------------------- |
| `segmenter:ready`  | `() => void`                             | Model assets are loaded and the plugin is ready.        |
| `segmenter:result` | `(result: ImageSegmenterResult) => void` | Latest MediaPipe result for the current analyzed frame. |

```javascript
shader.on('segmenter:result', result => {
	console.log(result.categoryMask);
});
```

## Uniforms

| Uniform           | Meaning                                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------------------------- |
| `u_segmentMask`   | Segmentation texture used internally by `segmentAt()`; direct sampling is only needed for custom decoding. |
| `u_numCategories` | Number of segmentation categories, including background.                                                   |

Most shaders should use the helper functions below instead of sampling `u_segmentMask` directly.

## Helper Functions

If `history` is enabled, every helper below also has a a trailing `int framesAgo` argument. `0` means the current analyzed frame, `1` means the previous stored frame, and so on.

### `segmentAt`

```glsl
vec2 segmentAt(vec2 pos)
vec2 segmentAt(vec2 pos, int framesAgo)
```

Returns `vec2(confidence, normalizedCategoryIndex)`.

- `x`: confidence for the winning category at `pos`
- `y`: normalized category index in the range `0.0` to `1.0`

When `outputConfidenceMasks` is `false`, the confidence component is always `1.0`.

If you need the integer category index in GLSL, recover it with:

```glsl
int categoryIndex = int(floor(segment.y * float(u_numCategories - 1) + 0.5));
```

For instance:

```glsl
vec2 segment = segmentAt(v_uv);
float confidence = segment.x;
int categoryIndex = int(floor(segment.y * float(u_numCategories - 1) + 0.5));
float isForeground = float(categoryIndex != 0) * confidence;
color.rgb = mix(color.rgb, vec3(1.0, 0.0, 1.0), isForeground);
```

{% callout title="MediaPipe Documentation" %}
This page covers the ShaderPad-facing API surface. For MediaPipe result object structure and model details, use the upstream [MediaPipe docs](https://ai.google.dev/edge/mediapipe/solutions/vision/image_segmenter).
{% /callout %}
