---
title: hands
nextjs:
    metadata:
        title: hands
        description: Hand landmarks and handedness helpers for ShaderPad.
---

{% callout title="Peer dependency requirement" %}
To use this plugin, you must install MediaPipe as a peer dependency:

```bash
npm install @mediapipe/tasks-vision
```

{% /callout %}

The `hands` plugin uses MediaPipe's [Hand Landmarker](https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker) and exposes ShaderPad textures and GLSL helper functions for hand-driven effects.

```javascript
import hands from 'shaderpad/plugins/hands';

const shader = new ShaderPad(fragmentShaderSrc, {
	plugins: [hands({ textureName: 'u_webcam', options: { maxHands: 2 } })],
});
```

The plugin reads from the `textureName` texture. Initialize and update that exact ShaderPad texture name, or the detector will have no source to read from.

## Options

| Option                                | Meaning                      |
| ------------------------------------- | ---------------------------- |
| `modelPath?: string`                  | Custom MediaPipe model path. |
| `maxHands?: number`                   | Maximum hands to detect.     |
| `minHandDetectionConfidence?: number` | Detection threshold.         |
| `minHandPresenceConfidence?: number`  | Presence threshold.          |
| `minTrackingConfidence?: number`      | Tracking threshold.          |
| `history?: number`                    | History depth for landmarks. |

## Events

Subscribe with `shader.on(name, callback)`.

| Event          | Callback                                 | Meaning                                                 |
| -------------- | ---------------------------------------- | ------------------------------------------------------- |
| `hands:ready`  | `() => void`                             | Model assets are loaded and the plugin is ready.        |
| `hands:result` | `(result: HandLandmarkerResult) => void` | Latest MediaPipe result for the current analyzed frame. |

```javascript
shader.on('hands:result', result => {
	console.log(`${result.handLandmarks.length} hands detected`);
});
```

## Uniforms

| Uniform              | Meaning                                                                                         |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| `u_maxHands`         | Maximum number of hands from initial config.                                                    |
| `u_nHands`           | Detected hand count for the latest frame.                                                       |
| `u_handLandmarksTex` | Raw landmark texture used internally by `nHandsAt()`, `handLandmark()`, and handedness helpers. |

Most shaders should use the helper functions below instead of sampling `u_handLandmarksTex` directly.

## Helper Functions

If `history` is enabled, every helper below also has a a trailing `int framesAgo` argument. `0` means the current analyzed frame, `1` means the previous stored frame, and so on.

### `nHandsAt`

```glsl
int nHandsAt(int framesAgo)
```

Returns the number of hands stored for the specified frame.

### `handLandmark`

```glsl
vec4 handLandmark(int handIndex, int landmarkIndex)
vec4 handLandmark(int handIndex, int landmarkIndex, int framesAgo)
```

Returns `vec4(x, y, z, handedness)`.

- `x`, `y`: normalized landmark position in ShaderPad UV space
- `z`: MediaPipe landmark depth value
- `w`: handedness, where `0.0` means left and `1.0` means right

Use `vec2(handLandmark(...))` when you only need the screen position.

```glsl
#define WRIST 0
#define THUMB_TIP 4
#define INDEX_TIP 8
#define HAND_CENTER 21

for (int i = 0; i < u_nHands; ++i) {
  vec4 center = handLandmark(i, HAND_CENTER);
  vec2 wrist = vec2(handLandmark(i, WRIST));
  vec2 pinchMid = 0.5 * (
    vec2(handLandmark(i, THUMB_TIP)) +
    vec2(handLandmark(i, INDEX_TIP))
  );
  float isRight = center.w;
  color.rgb += mix(vec3(0.0, 0.6, 1.0), vec3(1.0, 0.5, 0.0), isRight)
    * smoothstep(0.12, 0.0, distance(v_uv, pinchMid));
}
```

### `isRightHand`

```glsl
float isRightHand(int handIndex)
float isRightHand(int handIndex, int framesAgo)
```

Returns `1.0` for right hands and `0.0` for left hands. This is equivalent to `handLandmark(handIndex, 0).w`, but clearer to read when you only care about handedness.

### `isLeftHand`

```glsl
float isLeftHand(int handIndex)
float isLeftHand(int handIndex, int framesAgo)
```

Returns `1.0` for left hands and `0.0` for right hands.

## Landmark Layout

The plugin exposes MediaPipe’s standard 21 hand landmarks plus one derived `HAND_CENTER` point.

| Index | Landmark            | Index | Landmark            |
| ----- | ------------------- | ----- | ------------------- |
| 0     | `WRIST`             | 11    | `MIDDLE_FINGER_DIP` |
| 1     | `THUMB_CMC`         | 12    | `MIDDLE_FINGER_TIP` |
| 2     | `THUMB_MCP`         | 13    | `RING_FINGER_MCP`   |
| 3     | `THUMB_IP`          | 14    | `RING_FINGER_PIP`   |
| 4     | `THUMB_TIP`         | 15    | `RING_FINGER_DIP`   |
| 5     | `INDEX_FINGER_MCP`  | 16    | `RING_FINGER_TIP`   |
| 6     | `INDEX_FINGER_PIP`  | 17    | `PINKY_MCP`         |
| 7     | `INDEX_FINGER_DIP`  | 18    | `PINKY_PIP`         |
| 8     | `INDEX_FINGER_TIP`  | 19    | `PINKY_DIP`         |
| 9     | `MIDDLE_FINGER_MCP` | 20    | `PINKY_TIP`         |
| 10    | `MIDDLE_FINGER_PIP` | 21    | `HAND_CENTER`       |

`HAND_CENTER` is a ShaderPad convenience landmark derived from the wrist and MCP joints. It is useful when you want a stable center point for sprites, particles, or gesture indicators without averaging landmarks yourself.

{% callout title="MediaPipe Documentation" %}
This page covers the ShaderPad-facing API surface. For MediaPipe result object structure and model details, use the upstream [MediaPipe docs](https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker).
{% /callout %}
