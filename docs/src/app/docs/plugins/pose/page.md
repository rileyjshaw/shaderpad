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

The `pose` plugin uses MediaPipe's [Pose Landmarker](https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker) and exposes landmark and mask data in a ShaderPad-friendly GLSL format.

```javascript
import pose from 'shaderpad/plugins/pose';

const shader = new ShaderPad(fragmentShaderSrc, {
	plugins: [pose({ textureName: 'u_webcam', options: { maxPoses: 2 } })],
});
```

The plugin reads from the `textureName` texture. Initialize and update that exact ShaderPad texture name, or the detector will have no source to read from.

## Config

| Field         | Meaning                                      |
| ------------- | -------------------------------------------- |
| `textureName` | The live texture name the plugin reads from. |
| `options?`    | MediaPipe and history options listed below.  |

## MediaPipe Options

| Option                                | Meaning                                    |
| ------------------------------------- | ------------------------------------------ |
| `modelPath?: string`                  | Custom MediaPipe model path.               |
| `maxPoses?: number`                   | Maximum poses to detect.                   |
| `minPoseDetectionConfidence?: number` | Detection threshold.                       |
| `minPosePresenceConfidence?: number`  | Presence threshold.                        |
| `minTrackingConfidence?: number`      | Tracking threshold.                        |
| `history?: number`                    | History depth for landmarks and pose mask. |

## Events

Subscribe with `shader.on(name, callback)`.

| Event         | Callback                                 | Meaning                                                 |
| ------------- | ---------------------------------------- | ------------------------------------------------------- |
| `pose:ready`  | `() => void`                             | Model assets are loaded and the plugin is ready.        |
| `pose:result` | `(result: PoseLandmarkerResult) => void` | Latest MediaPipe result for the current analyzed frame. |

```javascript
shader.on('pose:result', result => {
	console.log(`${result.landmarks.length} poses detected`);
});
```

## Uniforms

| Uniform              | Meaning                                                                    |
| -------------------- | -------------------------------------------------------------------------- |
| `u_maxPoses`         | Maximum number of poses from initial config.                               |
| `u_nPoses`           | Detected pose count for the latest frame.                                  |
| `u_poseLandmarksTex` | Raw landmark texture used internally by `nPosesAt()` and `poseLandmark()`. |
| `u_poseMask`         | Body mask texture used internally by `poseAt()` and `inPose()`.            |

Most shaders should use the helper functions below instead of sampling `u_poseLandmarksTex` or `u_poseMask` directly.

## Helper Functions

If `history` is enabled, every helper below also has a a trailing `int framesAgo` argument. `0` means the current analyzed frame, `1` means the previous stored frame, and so on.

### `nPosesAt`

```glsl
int nPosesAt(int framesAgo)
```

Returns the number of poses stored for the specified frame.

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

Some landmark indices are given constants for convenience:

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

{% callout title="MediaPipe Documentation" %}
This page covers the ShaderPad-facing API surface. For MediaPipe result object structure and model details, use the upstream [MediaPipe docs](https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker).
{% /callout %}
