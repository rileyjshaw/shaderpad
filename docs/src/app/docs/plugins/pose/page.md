---
title: pose
nextjs:
  metadata:
    title: pose
    description: Pose landmarks and segmentation helpers for ShaderPad.
---

{% callout title="Peer dependency requirement" %}
To use this plugin, you must install MediaPipe as a peer dependency:

```bash
npm install @mediapipe/tasks-vision
```

{% /callout %}

The `pose` plugin uses MediaPipe's [Pose Landmarker](https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker) and exposes landmark and mask data in ShaderPad-friendly GLSL form.

```typescript
import pose from 'shaderpad/plugins/pose'

const shader = new ShaderPad(fragmentShaderSrc, {
  plugins: [pose({ textureName: 'u_webcam', options: { maxPoses: 2 } })],
})
```

The plugin reads from the texture named by `textureName`. Initialize and update that exact ShaderPad texture name, or the detector will have no live source to read from.

## Options

| Option                                | Meaning                                   |
| ------------------------------------- | ----------------------------------------- |
| `modelPath?: string`                  | custom MediaPipe model path               |
| `maxPoses?: number`                   | maximum poses to detect                   |
| `minPoseDetectionConfidence?: number` | detection threshold                       |
| `minPosePresenceConfidence?: number`  | presence threshold                        |
| `minTrackingConfidence?: number`      | tracking threshold                        |
| `history?: number`                    | history depth for landmarks and pose mask |

## Events

Subscribe with `shader.on(name, callback)`.

| Event         | Callback                                      | Meaning                                                |
| ------------- | --------------------------------------------- | ------------------------------------------------------ |
| `pose:ready`  | `() => void`                                  | model assets are loaded and the plugin is ready        |
| `pose:result` | `(result: PoseLandmarkerResult) => void`      | latest MediaPipe result for the current analyzed frame |

```typescript
shader.on('pose:result', result => {
  console.log(result.landmarks.length)
})
```

## Uniforms

| Uniform              | Meaning                                                                               |
| -------------------- | ------------------------------------------------------------------------------------- |
| `u_maxPoses`         | configured maximum number of poses                                                    |
| `u_nPoses`           | current detected pose count for the latest frame                                      |
| `u_poseLandmarksTex` | raw landmark texture used internally by `nPosesAt()` and `poseLandmark()`            |
| `u_poseMask`         | body mask texture used internally by `poseAt()` and `inPose()`                        |

Most shaders should use the helper functions below instead of sampling `u_poseLandmarksTex` or `u_poseMask` directly.

## Helper Functions

If `history` is enabled, every helper below also has an overload with a trailing `int framesAgo` argument. `0` means the current analyzed frame, `1` means the previous stored frame, and so on.

### `nPosesAt`

```glsl
int nPosesAt()
int nPosesAt(int framesAgo)
```

Returns the number of poses stored for the current or historical frame.

### `poseLandmark`

```glsl
vec4 poseLandmark(int poseIndex, int landmarkIndex)
vec4 poseLandmark(int poseIndex, int landmarkIndex, int framesAgo)
```

Returns `vec4(x, y, z, visibility)`.

- `x`, `y`: normalized landmark position in ShaderPad UV space
- `z`: MediaPipe landmark depth value
- `w`: landmark visibility / confidence

```glsl
vec2 leftHip = vec2(poseLandmark(0, POSE_LANDMARK_LEFT_HIP));
vec2 rightHip = vec2(poseLandmark(0, POSE_LANDMARK_RIGHT_HIP));
```

### `poseAt`

```glsl
vec2 poseAt(vec2 pos)
vec2 poseAt(vec2 pos, int framesAgo)
```

Returns `vec2(confidence, poseIndex)`.

- `x`: segmentation confidence for the sampled pixel
- `y`: the matching `poseIndex`, or `-1.0` when no pose matched

This is the fastest way to ask “which pose owns this pixel?” without manually decoding `u_poseMask`.

```glsl
vec2 hit = poseAt(v_uv);
if (hit.y >= 0.0) {
  float confidence = hit.x;
  int poseIndex = int(hit.y);
  vec2 torso = vec2(poseLandmark(poseIndex, POSE_LANDMARK_TORSO_CENTER));
  color.rgb = mix(color.rgb, vec3(torso, confidence), confidence);
}
```

### `inPose`

```glsl
float inPose(vec2 pos)
float inPose(vec2 pos, int framesAgo)
```

Returns the confidence component from `poseAt()`. This is `0.0` when no pose matched, otherwise the pose-mask confidence for that pixel.

## Landmark Layout

The plugin exposes MediaPipe’s standard 33 pose landmarks plus six derived landmarks:

- `POSE_LANDMARK_BODY_CENTER`
- `POSE_LANDMARK_LEFT_HAND_CENTER`
- `POSE_LANDMARK_RIGHT_HAND_CENTER`
- `POSE_LANDMARK_LEFT_FOOT_CENTER`
- `POSE_LANDMARK_RIGHT_FOOT_CENTER`
- `POSE_LANDMARK_TORSO_CENTER`

Commonly useful named constants include:

- `POSE_LANDMARK_LEFT_EYE`
- `POSE_LANDMARK_RIGHT_EYE`
- `POSE_LANDMARK_LEFT_SHOULDER`
- `POSE_LANDMARK_RIGHT_SHOULDER`
- `POSE_LANDMARK_LEFT_ELBOW`
- `POSE_LANDMARK_RIGHT_ELBOW`
- `POSE_LANDMARK_LEFT_HIP`
- `POSE_LANDMARK_RIGHT_HIP`
- `POSE_LANDMARK_LEFT_KNEE`
- `POSE_LANDMARK_RIGHT_KNEE`

For the full MediaPipe landmark index map, use the upstream [Pose Landmarker model reference](https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker#pose_landmarker_model).

---

This page covers the ShaderPad-facing API surface. For MediaPipe result object structure and model changes, use the upstream [MediaPipe docs](https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker).

## Related

- [History](/docs/core-concepts/history)
- [Webcam input](/docs/guides/webcam-input)
