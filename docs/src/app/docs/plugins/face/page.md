---
title: face
nextjs:
  metadata:
    title: face
    description: Face landmarks, masks, and helper functions for ShaderPad.
---

{% callout title="Peer dependency requirement" %}
To use this plugin, you must install MediaPipe as a peer dependency:

```bash
npm install @mediapipe/tasks-vision
```

{% /callout %}

The `face` plugin uses MediaPipe’s [Face Landmarker](https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker) and exposes ShaderPad-specific uniforms, helper functions, and events for face-driven effects.

```javascript
import face from 'shaderpad/plugins/face'

const shader = new ShaderPad(fragmentShaderSrc, {
  plugins: [face({ textureName: 'u_webcam', options: { maxFaces: 3 } })],
})
```

The plugin reads from the `textureName` texture. Initialize and update that exact ShaderPad texture name, or the detector will have no source to read from.

## Options

| Option                                         | Meaning                                       |
| ---------------------------------------------- | --------------------------------------------- |
| `modelPath?: string`                           | custom MediaPipe model path                   |
| `maxFaces?: number`                            | maximum faces to detect                       |
| `minFaceDetectionConfidence?: number`          | detection threshold                           |
| `minFacePresenceConfidence?: number`           | face presence threshold                       |
| `minTrackingConfidence?: number`               | tracking threshold                            |
| `outputFaceBlendshapes?: boolean`              | forwarded to MediaPipe                        |
| `outputFacialTransformationMatrixes?: boolean` | forwarded to MediaPipe                        |
| `history?: number`                             | history depth for landmarks and mask textures |

## Events

Subscribe with `shader.on(name, callback)`.

| Event         | Callback                                      | Meaning                                                |
| ------------- | --------------------------------------------- | ------------------------------------------------------ |
| `face:ready`  | `() => void`                                  | model assets are loaded and the plugin is ready        |
| `face:result` | `(result: FaceLandmarkerResult) => void`      | latest MediaPipe result for the current analyzed frame |

```javascript
shader.on('face:result', result => {
  console.log(`${result.faceLandmarks.length} faces detected`)
})
```

## Uniforms

| Uniform              | Meaning                                                                                 |
| -------------------- | --------------------------------------------------------------------------------------- |
| `u_maxFaces`         | maximum number of faces from initial config                                             |
| `u_nFaces`           | detected face count for the latest frame                                        |
| `u_faceLandmarksTex` | raw landmark texture used internally by `nFacesAt()` and `faceLandmark()`               |
| `u_faceMask`         | region mask texture used internally by the `*At()` and `in*()` face-region helper calls |

Most shaders should use the helper functions below instead of sampling `u_faceLandmarksTex` or `u_faceMask` directly.

## Helper Functions

If `history` is enabled, every helper below also has a a trailing `int framesAgo` argument. `0` means the current analyzed frame, `1` means the previous stored frame, and so on.

### `nFacesAt`

```glsl
int nFacesAt(int framesAgo)
```

Returns the number of faces stored for the specified frame. This is useful when `history` is enabled and you want loop bounds that match an older frame.

### `faceLandmark`

```glsl
vec4 faceLandmark(int faceIndex, int landmarkIndex)
vec4 faceLandmark(int faceIndex, int landmarkIndex, int framesAgo)
```

Returns `vec4(x, y, z, visibility)`.

- `x`, `y`: normalized landmark position in ShaderPad UV space
- `z`: MediaPipe landmark depth value
- `w`: landmark visibility / confidence

Use `vec2(faceLandmark(...))` when you only need the screen position.

```glsl
vec2 nosePos = vec2(faceLandmark(0, FACE_LANDMARK_NOSE_TIP));
```

### `leftEyeAt`

```glsl
vec2 leftEyeAt(vec2 pos)
vec2 leftEyeAt(vec2 pos, int framesAgo)
```

Returns `vec2(hit, faceIndex)`.

- `x`: `1.0` when `pos` is inside the left eye region, otherwise `0.0`
- `y`: the matching `faceIndex`, or `-1.0` when no face matched

### `rightEyeAt`

```glsl
vec2 rightEyeAt(vec2 pos)
vec2 rightEyeAt(vec2 pos, int framesAgo)
```

Returns the same `vec2(hit, faceIndex)` tuple as `leftEyeAt()`, but for the right eye region.

### `eyeAt`

```glsl
vec2 eyeAt(vec2 pos)
vec2 eyeAt(vec2 pos, int framesAgo)
```

Checks both eyes and returns `vec2(hit, faceIndex)`. This is the easiest entry point when you only care whether a pixel belongs to either eye.

### `leftEyebrowAt`

```glsl
vec2 leftEyebrowAt(vec2 pos)
vec2 leftEyebrowAt(vec2 pos, int framesAgo)
```

Returns `vec2(hit, faceIndex)` for the left eyebrow region.

### `rightEyebrowAt`

```glsl
vec2 rightEyebrowAt(vec2 pos)
vec2 rightEyebrowAt(vec2 pos, int framesAgo)
```

Returns `vec2(hit, faceIndex)` for the right eyebrow region.

### `eyebrowAt`

```glsl
vec2 eyebrowAt(vec2 pos)
vec2 eyebrowAt(vec2 pos, int framesAgo)
```

Checks both eyebrows and returns `vec2(hit, faceIndex)`.

### `lipsAt`

```glsl
vec2 lipsAt(vec2 pos)
vec2 lipsAt(vec2 pos, int framesAgo)
```

Returns `vec2(hit, faceIndex)` for the lip ring only. Unlike `outerMouthAt()`, this does not include the inner mouth opening.

### `outerMouthAt`

```glsl
vec2 outerMouthAt(vec2 pos)
vec2 outerMouthAt(vec2 pos, int framesAgo)
```

Returns `vec2(hit, faceIndex)` for the full outer mouth area, including the lips and inner-mouth hole.

### `innerMouthAt`

```glsl
vec2 innerMouthAt(vec2 pos)
vec2 innerMouthAt(vec2 pos, int framesAgo)
```

Returns `vec2(hit, faceIndex)` for the inner mouth opening only.

### `faceOvalAt`

```glsl
vec2 faceOvalAt(vec2 pos)
vec2 faceOvalAt(vec2 pos, int framesAgo)
```

Returns `vec2(hit, faceIndex)` for pixels that fall inside the broader face-oval mask. This is usually the best match for full-face compositing or background replacement around the head.

### `faceAt`

```glsl
vec2 faceAt(vec2 pos)
vec2 faceAt(vec2 pos, int framesAgo)
```

Returns `vec2(hit, faceIndex)` for pixels inside the face mesh or face oval. Use this when you want one quick “is this part of a face?” check.

```glsl
vec2 faceHit = faceAt(v_uv);
if (faceHit.x > 0.0) {
  int i = int(faceHit.y);
  vec2 center = vec2(faceLandmark(i, FACE_LANDMARK_FACE_CENTER));
  color.rgb = mix(color.rgb, vec3(center, 1.0), 0.25);
}
```

### `inFace`

```glsl
float inFace(vec2 pos)
float inFace(vec2 pos, int framesAgo)
```

Returns the `hit` component from `faceAt()`: `1.0` when the point belongs to a face, otherwise `0.0`.

### `inEye`

```glsl
float inEye(vec2 pos)
float inEye(vec2 pos, int framesAgo)
```

Returns `1.0` when `pos` is inside either eye, otherwise `0.0`.

### `inEyebrow`

```glsl
float inEyebrow(vec2 pos)
float inEyebrow(vec2 pos, int framesAgo)
```

Returns `1.0` when `pos` is inside either eyebrow, otherwise `0.0`.

### `inOuterMouth`

```glsl
float inOuterMouth(vec2 pos)
float inOuterMouth(vec2 pos, int framesAgo)
```

Returns `1.0` when `pos` is inside the outer mouth area, otherwise `0.0`.

### `inInnerMouth`

```glsl
float inInnerMouth(vec2 pos)
float inInnerMouth(vec2 pos, int framesAgo)
```

Returns `1.0` when `pos` is inside the inner mouth opening, otherwise `0.0`.

### `inLips`

```glsl
float inLips(vec2 pos)
float inLips(vec2 pos, int framesAgo)
```

Returns `1.0` when `pos` is inside the lip ring, otherwise `0.0`.

## Landmark Layout

The plugin exposes MediaPipe’s standard 478 face landmarks plus two derived landmarks:

- `FACE_LANDMARK_FACE_CENTER`: center of the overall face bounds
- `FACE_LANDMARK_MOUTH_CENTER`: center of the inner-mouth bounds

The most commonly used named constants are:

- `FACE_LANDMARK_L_EYE_CENTER`
- `FACE_LANDMARK_R_EYE_CENTER`
- `FACE_LANDMARK_NOSE_TIP`

For the full MediaPipe landmark index map, use the upstream [Face Landmarker model reference](https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker#face_landmarker_model).

{% callout title="MediaPipe Documentation" %}
This page covers the ShaderPad-facing API surface. For MediaPipe result object structure and model details, use the upstream [MediaPipe docs](https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker).
{% /callout %}
