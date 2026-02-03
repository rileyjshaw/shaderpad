![ShaderPad logo](./ShaderPad.png)

**Minimal setup. Tiny footprint.**

ShaderPad is a lightweight, dependency-free library that reduces boilerplate when working with fragment shaders. It provides a simple interface for setup, texture and uniform management, and user interactions such as mouse movements and window resizing. It comes “batteries included” for common needs, with optional plugins — from PNG export to face/pose tracking — for more advanced use cases. Simple, performant, and portable, ShaderPad lets you focus on the fun part: writing GLSL.

## Installation

```bash
npm install shaderpad
```

## Example

```typescript
import ShaderPad from 'shaderpad';

const fragmentShaderSrc = `#version 300 es
precision highp float;

// Built-in variables.
in vec2 v_uv;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_cursor;

// Custom variables.
uniform vec3 u_cursorColor;

out vec4 outColor;

void main() {
  vec2 uv = v_uv * u_resolution;
  vec2 dotGrid = mod(uv, 50.) - 25.;
  float dotDist = length(dotGrid);
  float dot = step(dotDist, 5.);
  float cursorDist = distance(uv, u_cursor * u_resolution);
  float cursor = step(cursorDist, 25. + sin(u_time * 5.) * 5.);
  vec3 color = mix(vec3(0., 0., 1.), vec3(1.), dot);
  color = mix(color, u_cursorColor, cursor);
  outColor = vec4(color, 1.);
}
`;

const shader = new ShaderPad(fragmentShaderSrc /* , options */);
const getColor = (time: number) =>
	[time, time + (Math.PI * 2) / 3, time + (Math.PI * 4) / 3].map(x => 1 + Math.sin(x) / 2);
shader.initializeUniform('u_cursorColor', 'float', getColor(0));
shader.play(time => {
	shader.updateUniforms({ u_cursorColor: getColor(time) });
});
```

See the [`examples/` directory](./examples/src) for more.

## Usage

### Uniforms

#### `initializeUniform(name, type, value, options?)`

Initialize a uniform, which must be declared in your shader.

```typescript
shader.initializeUniform('u_speed', 'float', 1.5);
// Vectors are passed as arrays. This is a vec3:
shader.initializeUniform('u_color', 'float', [1.0, 0.5, 0.0]);
// …but you can also pass an array. This is an array of floats:
shader.initializeUniform('u_data', 'float', [1.0, 0.5, 0.0], { arrayLength: 3 });
```

**Parameters:**

-   `name` (string): Uniform name
-   `type` ('float' | 'int'): Uniform type
-   `value` (number | number[] | (number | number[])[]): Initial value(s)
-   `options` (optional): `{ arrayLength?: number }` - Required for arrays

#### `updateUniforms(updates, options?)`

Update uniform values.

```typescript
shader.updateUniforms({
	u_speed: 2.0,
	u_color: [1.0, 0.0, 0.0],
});
```

**Parameters:**

-   `updates`: Object mapping uniform names to their new values
-   `options` (optional): `{ startIndex?: number }` - Starting index for partial array updates

#### Uniform arrays

ShaderPad supports uniform arrays. Initialize them by passing an `arrayLength` option:

```typescript
// Initialize a vec2 array with 5 elements.
shader.initializeUniform(
	'u_positions',
	'float',
	[
		[0, 0],
		[1, 1],
		[2, 2],
	],
	{ arrayLength: 3 }
);

// Update all elements.
shader.updateUniforms({
	u_positions: [
		[0.1, 0.2],
		[1.1, 1.2],
		[2.1, 2.2],
	],
});

// Update a subset starting at index 2.
shader.updateUniforms(
	{
		u_positions: [
			[2.5, 2.5],
			[3.5, 3.5],
		],
	},
	{ startIndex: 2 }
);
```

#### Included uniforms

| Uniform                | Type           | Description                                                                       |
| ---------------------- | -------------- | --------------------------------------------------------------------------------- |
| `u_time`               | float          | The current time in seconds.                                                      |
| `u_frame`              | int            | The current frame number.                                                         |
| `u_resolution`         | float[2]       | The canvas element's dimensions.                                                  |
| `u_cursor`             | float[2]       | Cursor position (x, y), normalized to [0,1] over the `cursorTarget` bounding box.  |
| `u_click`              | float[3]       | Click position (x, y) and left click state (z).                                   |
| `u_history`            | sampler2DArray | Buffer texture of prior frames. Available if `history` option is set.             |
| `u_historyFrameOffset` | int            | Frame offset for accessing history texture. Available if `history` option is set. |

#### Included varyings

| Varying | Type     | Description                         |
| ------- | -------- | ----------------------------------- |
| `v_uv`  | float[2] | The UV coordinates of the fragment. |

### Textures

#### `initializeTexture(name, source, options?)`

Initialize a texture from an image, video, canvas, or typed array.

```typescript
shader.initializeTexture('u_texture', img);
shader.initializeTexture(
	'u_custom',
	{ data: new Float32Array(width * height * 4), width, height },
	{
		internalFormat: 'RGBA32F',
		type: 'FLOAT',
		minFilter: 'NEAREST',
		magFilter: 'NEAREST',
	}
);
shader.initializeTexture('u_webcam', videoElement, { history: 30 });
shader.initializeTexture('u_canvas', canvasElement, { preserveY: true });
```

**Parameters:**

-   `name` (string): The name of the texture uniform as declared in your shader
-   `options` (optional): Texture options (see below)
-   `source`: Image, video, canvas, or `{ data, width, height }`

**Texture Options:**

-   `history?: number` - Number of previous frames to store (creates a `sampler2DArray`)
-   `preserveY?: boolean` - For DOM sources only: if `true`, don't flip vertically (default: `false`, flips to match WebGL's bottom-up convention)
-   `internalFormat?: string` - Storage format in GPU memory (e.g., `'RGBA8'`, `'RGBA32F'`, `'R8'`). Defaults to `'RGBA8'` for 8-bit, or `'RGBA32F'` if `type` is `'FLOAT'`
-   `format?: string` - Source data layout (default: `'RGBA'`). Describes the channels in your input data (e.g., `'RGBA'`, `'RGB'`, `'RED'`)
-   `type?: string` - Source data type (default: `'UNSIGNED_BYTE'` for DOM sources, must be specified for typed arrays). Examples: `'UNSIGNED_BYTE'`, `'FLOAT'`, `'HALF_FLOAT'`
-   `minFilter?: string` - Minification filter (default: `'LINEAR'`). Examples: `'LINEAR'`, `'NEAREST'`
-   `magFilter?: string` - Magnification filter (default: `'LINEAR'`). Examples: `'LINEAR'`, `'NEAREST'`
-   `wrapS?: string` - Wrap mode for S coordinate (default: `'CLAMP_TO_EDGE'`). Examples: `'CLAMP_TO_EDGE'`, `'REPEAT'`, `'MIRRORED_REPEAT'`
-   `wrapT?: string` - Wrap mode for T coordinate (default: `'CLAMP_TO_EDGE'`). Examples: `'CLAMP_TO_EDGE'`, `'REPEAT'`, `'MIRRORED_REPEAT'`

**Note:** For typed array sources (`CustomTexture`), you must provide data in bottom-up orientation (WebGL convention). The `preserveY` option is ignored for typed arrays.

#### `updateTextures(updates, options?)`

```typescript
shader.updateTextures({ u_webcam: videoElement, u_overlay: overlayCanvas });
shader.updateTextures({
	u_custom: { data: partialData, width, height, isPartial: true, x: offsetX, y: offsetY },
});
shader.updateTextures({ u_camera: videoElement }, { skipHistoryWrite: true });
```

**Parameters:**

-   `updates`: Object mapping texture names to updated sources
-   `options?` (optional): `{ skipHistoryWrite?: boolean }`

### Lifecycle methods

#### `play(onBeforeStep?)`

Start the render loop.

```typescript
shader.play();

// With per-frame callbacks.
shader.play(() => {
	shader.updateTextures({ u_webcam: videoElement });
	// Only save every 10th frame to history.
	return { skipHistoryWrite: frame % 10 === 0 };
});
```

**Parameters:**

-   `onBeforeStep?`: `(time: number, frame: number) => StepOptions | void` - Called before each frame

#### `step(options?)`

Manually advance one frame. Updates `u_time` and `u_frame`, renders, then writes to history if `skipHistoryWrite` is `false` (default).

**Parameters:**

-   `options?` (optional): `StepOptions` - Options to control rendering behavior (see below)

#### `draw(options?)`

Render without updating uniforms, frame counter, or history.

```typescript
shader.draw({ skipClear: true });
```

**Parameters:**

-   `options?` (optional): `StepOptions` - Options to control rendering behavior (see below)

#### `StepOptions`

```typescript
interface StepOptions {
	skipClear?: boolean; // Skip clearing canvas before rendering
	skipHistoryWrite?: boolean; // Skip writing to history buffers
}
```

**Options:**

-   `skipClear?: boolean` - If `true`, the canvas is not cleared before rendering. Useful for accumulating effects or multi-pass rendering.
-   `skipHistoryWrite?: boolean` - If `true`, history buffers are not updated. Useful when you want to render without affecting the history state.

#### `pause()`, `reset()`, `destroy()`

```typescript
shader.pause(); // Pause the render loop.
shader.reset(); // Reset frame counter and clear history buffers.
shader.destroy(); // Clean up resources.
```

### Properties

-   `canvas` (HTMLCanvasElement | OffscreenCanvas): The canvas element used for rendering

### Event Listeners

#### `on(event, callback)`

Register a callback for a lifecycle event.

```typescript
shader.on('updateResolution', (width, height) => {
	console.log(`New resolution: ${width}x${height}`);
});
```

**Parameters:**

-   `event` (string): The event name
-   `callback` (Function): The callback function

#### `off(event, callback)`

Remove a previously registered callback.

**Parameters:**

-   `event` (string): The event name
-   `callback` (Function): The callback function to remove

#### Available Events

| Event               | Callback Arguments                      | Description                                      |
| ------------------- | --------------------------------------- | ------------------------------------------------ |
| `resize`            | `(width: number, height: number)`       | Fired when the canvas element is resized         |
| `updateResolution`  | `(width: number, height: number)`       | Fired when the drawing buffer resolution changes |
| `play`              | none                                    | Fired when the render loop starts                |
| `pause`             | none                                    | Fired when the render loop is paused             |
| `reset`             | none                                    | Fired when the shader is reset                   |
| `destroy`           | none                                    | Fired when the shader is destroyed               |
| `beforeStep`        | `(time: number, options?: StepOptions)` | Fired before each render step                    |
| `afterStep`         | `(time: number, options?: StepOptions)` | Fired after each render step                     |
| `beforeDraw`        | `(options?: StepOptions)`               | Fired before each draw call                      |
| `afterDraw`         | `(options?: StepOptions)`               | Fired after each draw call                       |
| `initializeTexture` | `(name, source, options?)`              | Fired after a texture is initialized             |
| `initializeUniform` | `(name, type, value, options?)`         | Fired after a uniform is initialized             |
| `updateTextures`    | `(updates, options?)`                   | Fired after textures are updated                 |
| `updateUniforms`    | `(updates, options?)`                   | Fired after uniforms are updated                 |

Plugins may emit additional namespaced events (e.g., `face:ready`, `pose:results`).

## Options

ShaderPad’s constructor accepts an optional `options` object.

### canvas

The `canvas` option allows you to pass in an existing canvas element, dimensions object, or `null` for headless mode.

```typescript
const canvas = document.createElement('canvas');
const shader = new ShaderPad(fragmentShaderSrc, { canvas });

// Use utilities for a fullscreen canvas.
import autosize from 'shaderpad/plugins/autosize';
import { createFullscreenCanvas } from 'shaderpad/util';
const shader = new ShaderPad(fragmentShaderSrc, { canvas: createFullscreenCanvas(), plugins: [autosize()] });

// Create a headless ShaderPad for intermediate processing with initial dimensions.
const shader = new ShaderPad(fragmentShaderSrc, { canvas: { width: 640, height: 480 } });
```

### cursorTarget

Element (or `window`) to listen for cursor/click events; coordinates are normalized to [0,1] over its bounding box. If omitted and the canvas is an HTML canvas, the canvas is used.

```typescript
// Listen on the window (e.g. full viewport, coordinates 0–1).
const shader = new ShaderPad(fragmentShaderSrc, { cursorTarget: window });

// Listen on a specific container element.
const container = document.querySelector('.shader-container');
const shader = new ShaderPad(fragmentShaderSrc, { cursorTarget: container });
```

### history

Enable framebuffer history to access previous frames.

```typescript
// Store the last 10 frames of shader output.
const shader = new ShaderPad(fragmentShaderSrc, { history: 10 });

// In your shader, access history using the u_history uniform:
// uniform highp sampler2DArray u_history;
// It’s stored as a ringbuffer, so you can access specific frames with the provided offset uniform:
// uniform int u_historyFrameOffset;
```

**High-precision history:** By default, history textures use 8-bit precision (RGBA8). For high-precision rendering, specify `internalFormat` and `type` options. This enables FBO rendering and preserves precision in history textures.

```typescript
// For 32-bit float precision (requires EXT_color_buffer_float extension):
const shader = new ShaderPad(fragmentShaderSrc, {
	history: 60,
	internalFormat: 'RGBA32F',
	type: 'FLOAT',
});
```

You can also enable history for individual textures:

```typescript
// Store the last 30 webcam frames.
shader.initializeTexture('u_webcam', videoElement, { history: 30 });
// In your shader, access history using the u_webcam and u_webcamFrameOffset uniforms:
// uniform highp sampler2DArray u_webcam;
// uniform int u_webcamFrameOffset;
```

It’s recommended to use the `helpers` plugin to simplify access to history textures:

```glsl
int nFramesAgo = 2; // Get the color 2 frames ago.
float zIndex = historyZ(u_webcam, u_webcamFrameOffset, nFramesAgo);
vec4 historyColor = texture(u_webcam, vec3(v_uv, zIndex));
```

### debug

Enable debug logging. Defaults to `true` in development, `false` in production.

```typescript
const shader = new ShaderPad(fragmentShaderSrc, { debug: true });
```

### plugins

ShaderPad adds additional functionality through plugins, which keeps bundle sizes small.

#### helpers

The `helpers` plugin provides convenience functions and constants. See [helpers.glsl](./src/plugins/helpers.glsl) for the implementation.

```typescript
import helpers from 'shaderpad/plugins/helpers';
const shader = new ShaderPad(fragmentShaderSrc, { plugins: [helpers()] });
```

**Note:** The `helpers` plugin automatically injects the `u_resolution` uniform into your shader. Do not declare it yourself.

#### save

The `save` plugin adds a `.save()` method to the shader that saves the current frame to a PNG file. It works on desktop and mobile.

```typescript
import save, { WithSave } from 'shaderpad/plugins/save';
const shader = new ShaderPad(fragmentShaderSrc, { plugins: [save()] }) as WithSave<ShaderPad>;
shader.save('filename', 'Optional mobile share text');
```

#### face

The `face` plugin uses [MediaPipe](https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker) to detect faces in video or image textures.

```typescript
import face from 'shaderpad/plugins/face';
const shader = new ShaderPad(fragmentShaderSrc, {
	plugins: [face({ textureName: 'u_webcam', options: { maxFaces: 3 } })],
});
```

**Options:**

-   `maxFaces?: number` - Maximum faces to detect (default: 1)
-   `history?: number` - Frames of history to store for landmarks and mask textures

**Events:**

| Event         | Callback Arguments               | Description                              |
| ------------- | -------------------------------- | ---------------------------------------- |
| `face:ready`  | none                             | Fired when the detection model is loaded |
| `face:result` | `(result: FaceLandmarkerResult)` | Fired with detection results each frame  |

**Uniforms:**

| Uniform              | Type                          | Description                                                                  |
| -------------------- | ----------------------------- | ---------------------------------------------------------------------------- |
| `u_maxFaces`         | int                           | Maximum number of faces to detect                                            |
| `u_nFaces`           | int                           | Current number of detected faces                                             |
| `u_faceLandmarksTex` | sampler2D (or sampler2DArray) | Raw landmark data texture (use `faceLandmark()` to access)                   |
| `u_faceMask`         | sampler2D (or sampler2DArray) | Face mask texture (R: region type, G: face region, B: normalized face index) |

**Helper functions:**

All region functions return `vec2(confidence, faceIndex)`. faceIndex is 0-indexed (-1 = no face). When `history` is enabled, all functions accept an optional `int framesAgo` parameter.

-   `faceLandmark(int faceIndex, int landmarkIndex) -> vec4` - Returns landmark data as `vec4(x, y, z, visibility)`. Use `vec2(faceLandmark(...))` to get just the screen position.
-   `leftEyebrowAt(vec2 pos) -> vec2` - Returns `vec2(1.0, faceIndex)` if position is in left eyebrow, `vec2(0.0, -1.0)` otherwise.
-   `rightEyebrowAt(vec2 pos) -> vec2` - Returns `vec2(1.0, faceIndex)` if position is in right eyebrow, `vec2(0.0, -1.0)` otherwise.
-   `leftEyeAt(vec2 pos) -> vec2` - Returns `vec2(1.0, faceIndex)` if position is in left eye, `vec2(0.0, -1.0)` otherwise.
-   `rightEyeAt(vec2 pos) -> vec2` - Returns `vec2(1.0, faceIndex)` if position is in right eye, `vec2(0.0, -1.0)` otherwise.
-   `lipsAt(vec2 pos) -> vec2` - Returns `vec2(1.0, faceIndex)` if position is in lips, `vec2(0.0, -1.0)` otherwise.
-   `outerMouthAt(vec2 pos) -> vec2` - Returns `vec2(1.0, faceIndex)` if position is in outer mouth (lips + inner mouth), `vec2(0.0, -1.0)` otherwise.
-   `innerMouthAt(vec2 pos) -> vec2` - Returns `vec2(1.0, faceIndex)` if position is in inner mouth region, `vec2(0.0, -1.0)` otherwise.
-   `faceOvalAt(vec2 pos) -> vec2` - Returns `vec2(1.0, faceIndex)` if position is in face oval contour, `vec2(0.0, -1.0)` otherwise.
-   `faceAt(vec2 pos) -> vec2` - Returns `vec2(1.0, faceIndex)` if position is in face mesh or oval contour, `vec2(0.0, -1.0)` otherwise.
-   `eyeAt(vec2 pos) -> vec2` - Returns `vec2(1.0, faceIndex)` if position is in either eye, `vec2(0.0, -1.0)` otherwise.
-   `eyebrowAt(vec2 pos) -> vec2` - Returns `vec2(1.0, faceIndex)` if position is in either eyebrow, `vec2(0.0, -1.0)` otherwise.

**Convenience functions** (return confidence 0-1 if found, `0.0` otherwise):

-   `inFace(vec2 pos) -> float` - Returns confidence (0-1) if position is in face mesh, `0.0` otherwise.
-   `inEye(vec2 pos) -> float` - Returns confidence (0-1) if position is in either eye, `0.0` otherwise.
-   `inEyebrow(vec2 pos) -> float` - Returns confidence (0-1) if position is in either eyebrow, `0.0` otherwise.
-   `inOuterMouth(vec2 pos) -> float` - Returns confidence (0-1) if position is in outer mouth (lips + inner mouth), `0.0` otherwise.
-   `inInnerMouth(vec2 pos) -> float` - Returns confidence (0-1) if position is in inner mouth, `0.0` otherwise.
-   `inLips(vec2 pos) -> float` - Returns confidence (0-1) if position is in lips, `0.0` otherwise.

**Landmark Constants:**

-   `FACE_LANDMARK_L_EYE_CENTER` - Left eye center landmark index
-   `FACE_LANDMARK_R_EYE_CENTER` - Right eye center landmark index
-   `FACE_LANDMARK_NOSE_TIP` - Nose tip landmark index
-   `FACE_LANDMARK_FACE_CENTER` - Face center landmark index (custom, calculated from all landmarks)
-   `FACE_LANDMARK_MOUTH_CENTER` - Mouth center landmark index (custom, calculated from inner mouth landmarks)

**Example usage:**

```glsl
// Get a specific landmark position.
vec2 nosePos = vec2(faceLandmark(0, FACE_LANDMARK_NOSE_TIP));

// Use in* convenience functions for simple confidence checks.
float eyeMask = inEye(v_uv);

// Use faceLandmark or *At functions when you need to check a specific face index.
vec2 leftEye = leftEyeAt(v_uv);
for (int i = 0; i < u_nFaces; ++i) {
    vec4 leftEyeCenter = faceLandmark(i, FACE_LANDMARK_L_EYE_CENTER);
    vec4 rightEyeCenter = faceLandmark(i, FACE_LANDMARK_R_EYE_CENTER);
	if (leftEye.x > 0.0 && int(leftEye.y) == i) {
		// Position is inside the left eye of face i.
	}
    // ...
}
```

[Landmark indices are documented here.](https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker#face_landmarker_model) This library adds two custom landmarks: `FACE_CENTER` and `MOUTH_CENTER`. This brings the total landmark count to 480.

**Note:** The face plugin requires `@mediapipe/tasks-vision` as a peer dependency.

**Note:** Confidence values are currently limited to 0.0 or 1.0.

#### pose

The `pose` plugin uses [MediaPipe Pose Landmarker](https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker) to expose a flat array of 2D landmarks. Each pose contributes 39 landmarks (33 standard + 6 custom), enumerated below.

```typescript
import pose from 'shaderpad/plugins/pose';
const shader = new ShaderPad(fragmentShaderSrc, {
	plugins: [pose({ textureName: 'u_video', options: { maxPoses: 3 } })],
});
```

**Options:**

-   `maxPoses?: number` - Maximum poses to detect (default: 1)
-   `history?: number` - Frames of history to store for landmarks and mask textures

**Events:**

| Event         | Callback Arguments               | Description                              |
| ------------- | -------------------------------- | ---------------------------------------- |
| `pose:ready`  | none                             | Fired when the detection model is loaded |
| `pose:result` | `(result: PoseLandmarkerResult)` | Fired with detection results each frame  |

**Uniforms:**

| Uniform              | Type                          | Description                                                                   |
| -------------------- | ----------------------------- | ----------------------------------------------------------------------------- |
| `u_maxPoses`         | int                           | Maximum number of poses to track                                              |
| `u_nPoses`           | int                           | Current number of detected poses                                              |
| `u_poseLandmarksTex` | sampler2D (or sampler2DArray) | Raw landmark data texture (RGBA: x, y, z, visibility)                         |
| `u_poseMask`         | sampler2D (or sampler2DArray) | Pose mask texture (R: body detected, G: confidence, B: normalized pose index) |

**Helper functions:**

When `history` is enabled, all functions accept an optional `int framesAgo` parameter.

-   `poseLandmark(int poseIndex, int landmarkIndex) -> vec4` - Returns landmark data as `vec4(x, y, z, visibility)`. Use `vec2(poseLandmark(...))` to get just the screen position.
-   `poseAt(vec2 pos) -> vec2` - Returns `vec2(confidence, poseIndex)`. poseIndex is 0-indexed (-1 = no pose), confidence is the segmentation confidence.
-   `inPose(vec2 pos) -> float` - Returns confidence (0-1) if position is in any pose, `0.0` otherwise.

**Constants:**

-   `POSE_LANDMARK_LEFT_EYE` - Left eye landmark index (2)
-   `POSE_LANDMARK_RIGHT_EYE` - Right eye landmark index (5)
-   `POSE_LANDMARK_LEFT_SHOULDER` - Left shoulder landmark index (11)
-   `POSE_LANDMARK_RIGHT_SHOULDER` - Right shoulder landmark index (12)
-   `POSE_LANDMARK_LEFT_ELBOW` - Left elbow landmark index (13)
-   `POSE_LANDMARK_RIGHT_ELBOW` - Right elbow landmark index (14)
-   `POSE_LANDMARK_LEFT_HIP` - Left hip landmark index (23)
-   `POSE_LANDMARK_RIGHT_HIP` - Right hip landmark index (24)
-   `POSE_LANDMARK_LEFT_KNEE` - Left knee landmark index (25)
-   `POSE_LANDMARK_RIGHT_KNEE` - Right knee landmark index (26)
-   `POSE_LANDMARK_BODY_CENTER` - Body center landmark index (33, custom, calculated from all landmarks)
-   `POSE_LANDMARK_LEFT_HAND_CENTER` - Left hand center landmark index (34, custom, calculated from pinky, thumb, wrist, index)
-   `POSE_LANDMARK_RIGHT_HAND_CENTER` - Right hand center landmark index (35, custom, calculated from pinky, thumb, wrist, index)
-   `POSE_LANDMARK_LEFT_FOOT_CENTER` - Left foot center landmark index (36, custom, calculated from ankle, heel, foot index)
-   `POSE_LANDMARK_RIGHT_FOOT_CENTER` - Right foot center landmark index (37, custom, calculated from ankle, heel, foot index)
-   `POSE_LANDMARK_TORSO_CENTER` - Torso center landmark index (38, custom, calculated from shoulders and hips)

**Note:** For connecting pose landmarks (e.g., drawing skeleton lines), `PoseLandmarker.POSE_CONNECTIONS` from `@mediapipe/tasks-vision` provides an array of `{ start, end }` pairs that define which landmarks should be connected.

Use `poseLandmark(int poseIndex, int landmarkIndex)` in GLSL to retrieve a specific point. Landmark indices are:

| Index | Landmark          | Index | Landmark                   |
| ----- | ----------------- | ----- | -------------------------- |
| 0     | nose              | 20    | right index                |
| 1     | left eye (inner)  | 21    | left thumb                 |
| 2     | left eye          | 22    | right thumb                |
| 3     | left eye (outer)  | 23    | left hip                   |
| 4     | right eye (inner) | 24    | right hip                  |
| 5     | right eye         | 25    | left knee                  |
| 6     | right eye (outer) | 26    | right knee                 |
| 7     | left ear          | 27    | left ankle                 |
| 8     | right ear         | 28    | right ankle                |
| 9     | mouth (left)      | 29    | left heel                  |
| 10    | mouth (right)     | 30    | right heel                 |
| 11    | left shoulder     | 31    | left foot index            |
| 12    | right shoulder    | 32    | right foot index           |
| 13    | left elbow        | 33    | body center (custom)       |
| 14    | right elbow       | 34    | left hand center (custom)  |
| 15    | left wrist        | 35    | right hand center (custom) |
| 16    | right wrist       | 36    | left foot center (custom)  |
| 17    | left pinky        | 37    | right foot center (custom) |
| 18    | right pinky       | 38    | torso center (custom)      |
| 19    | left index        |       |                            |

[Source](https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker#pose_landmarker_model)

[Landmark indices are documented here.](https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker#pose_landmarker_model) This library adds six custom landmarks: `BODY_CENTER`, `LEFT_HAND_CENTER`, `RIGHT_HAND_CENTER`, `LEFT_FOOT_CENTER`, `RIGHT_FOOT_CENTER`, and `TORSO_CENTER`. This brings the total landmark count to 39.

A minimal fragment shader loop looks like:

```glsl
for (int i = 0; i < u_maxPoses; ++i) {
	if (i >= u_nPoses) break;
	vec2 leftHip = vec2(poseLandmark(i, POSE_LANDMARK_LEFT_HIP));
	vec2 rightHip = vec2(poseLandmark(i, POSE_LANDMARK_RIGHT_HIP));
	// …
}
```

#### hands

The `hands` plugin uses [MediaPipe Hand Landmarker](https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker) to expose a flat array of 2D landmarks. Each hand contributes 22 landmarks, enumerated below.

```typescript
import hands from 'shaderpad/plugins/hands';
const shader = new ShaderPad(fragmentShaderSrc, {
	plugins: [hands({ textureName: 'u_video', options: { maxHands: 2 } })],
});
```

**Options:**

-   `maxHands?: number` - Maximum hands to detect (default: 2)
-   `history?: number` - Frames of history to store for landmarks texture

**Events:**

| Event          | Callback Arguments               | Description                              |
| -------------- | -------------------------------- | ---------------------------------------- |
| `hands:ready`  | none                             | Fired when the detection model is loaded |
| `hands:result` | `(result: HandLandmarkerResult)` | Fired with detection results each frame  |

**Uniforms:**

| Uniform              | Type                          | Description                                           |
| -------------------- | ----------------------------- | ----------------------------------------------------- |
| `u_maxHands`         | int                           | Maximum number of hands to track                      |
| `u_nHands`           | int                           | Current number of detected hands                      |
| `u_handLandmarksTex` | sampler2D (or sampler2DArray) | Raw landmark data texture (RGBA: x, y, z, handedness) |

**Helper functions:**

When `history` is enabled, all functions accept an optional `int framesAgo` parameter.

-   `handLandmark(int handIndex, int landmarkIndex) -> vec4` - Returns landmark data as `vec4(x, y, z, handedness)`. Use `vec2(handLandmark(...))` to get just the screen position. Handedness: 0.0 = left hand, 1.0 = right hand.
-   `isRightHand(int handIndex) -> float` - Returns 1.0 if the hand is a right hand, 0.0 if left.
-   `isLeftHand(int handIndex) -> float` - Returns 1.0 if the hand is a left hand, 0.0 if right.

**Landmark Indices:**

| Index | Landmark          | Index | Landmark          |
| ----- | ----------------- | ----- | ----------------- |
| 0     | WRIST             | 11    | MIDDLE_FINGER_DIP |
| 1     | THUMB_CMC         | 12    | MIDDLE_FINGER_TIP |
| 2     | THUMB_MCP         | 13    | RING_FINGER_MCP   |
| 3     | THUMB_IP          | 14    | RING_FINGER_PIP   |
| 4     | THUMB_TIP         | 15    | RING_FINGER_DIP   |
| 5     | INDEX_FINGER_MCP  | 16    | RING_FINGER_TIP   |
| 6     | INDEX_FINGER_PIP  | 17    | PINKY_MCP         |
| 7     | INDEX_FINGER_DIP  | 18    | PINKY_PIP         |
| 8     | INDEX_FINGER_TIP  | 19    | PINKY_DIP         |
| 9     | MIDDLE_FINGER_MCP | 20    | PINKY_TIP         |
| 10    | MIDDLE_FINGER_PIP | 21    | HAND_CENTER       |

[Source](https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker#models)

A minimal fragment shader loop looks like:

```glsl
#define WRIST 0
#define THUMB_TIP 4
#define INDEX_TIP 8
#define HAND_CENTER 21

for (int i = 0; i < u_maxHands; ++i) {
	if (i >= u_nHands) break;
	vec2 wrist = vec2(handLandmark(i, WRIST));
	vec2 thumbTip = vec2(handLandmark(i, THUMB_TIP));
	vec2 indexTip = vec2(handLandmark(i, INDEX_TIP));
	vec2 handCenter = vec2(handLandmark(i, HAND_CENTER));

	// Use handedness for coloring (0.0 = left/black, 1.0 = right/white).
	vec3 handColor = vec3(isRightHand(i));
	// …
}
```

**Note:** The hands plugin requires `@mediapipe/tasks-vision` as a peer dependency.

#### segmenter

The `segmenter` plugin uses [MediaPipe Image Segmenter](https://ai.google.dev/edge/mediapipe/solutions/vision/image_segmenter) to segment objects in video or image textures. It supports models with multiple categories (e.g., background, hair, chair, dog…). By default, it uses the [hair segmentation model](https://ai.google.dev/edge/mediapipe/solutions/vision/image_segmenter#hair-model).

```typescript
import ShaderPad from 'shaderpad';
import segmenter from 'shaderpad/plugins/segmenter';

const shader = new ShaderPad(fragmentShaderSrc, {
	plugins: [
		segmenter({
			textureName: 'u_webcam',
			options: {
				modelPath:
					'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite',
			},
		}),
	],
});
```

**Options:**

-   `modelPath?: string` - Path to the segmentation model (default: DeepLab v3)
-   `outputConfidenceMasks?: boolean` - Whether to output per-category confidence masks (default: `false`). If `false`, confidence is always 1.
-   `history?: number` - Frames of history to store for mask texture

**Events:**

| Event              | Callback Arguments               | Description                                 |
| ------------------ | -------------------------------- | ------------------------------------------- |
| `segmenter:ready`  | none                             | Fired when the segmentation model is loaded |
| `segmenter:result` | `(result: ImageSegmenterResult)` | Fired with segmentation results each frame  |

**Uniforms:**

| Uniform           | Type                          | Description                                                             |
| ----------------- | ----------------------------- | ----------------------------------------------------------------------- |
| `u_segmentMask`   | sampler2D (or sampler2DArray) | Segment mask texture (R: normalized category, G: confidence, B: unused) |
| `u_numCategories` | int                           | Number of segmentation categories (including background)                |

**Helper functions:**

When `history` is enabled, all functions accept an optional `int framesAgo` parameter.

-   `segmentAt(vec2 pos) -> vec2` - Returns `vec2(confidence, category)`. confidence is the segmentation confidence (0–1, or 1 if `outputConfidenceMasks` is false). category is the normalized category index (0–1).

**Example usage:**

```glsl
vec2 segment = segmentAt(v_uv);
float confidence = segment.x;
float category = segment.y;
float isForeground = step(0.0, category) * confidence;
color = mix(color, vec3(1.0, 0.0, 1.0), isForeground);
```

**Note:** The segmenter plugin requires `@mediapipe/tasks-vision` as a peer dependency.

#### autosize

The `autosize` plugin handles automatic canvas resolution updates with ResizeObserver.

**Options:**

-   `ignorePixelRatio?: boolean` - If `true`, don't scale with devicePixelRatio (default: `false`)
-   `target?: Element | Window` - What to observe for resize (default: canvas itself for HTMLCanvasElement, window for OffscreenCanvas)
-   `throttle?: number` - Throttle interval in milliseconds (default: 33ms)

## Contributing

### Running an example

```bash
git clone https://github.com/rileyjshaw/shaderpad.git
cd shaderpad/examples
npm install
npm run dev
```

### Adding an example

Add a `.ts` file in `examples/src/` that exports `init` and `destroy` functions. Add it to the `demos` array in `examples/src/main.ts`.

## License

This project is licensed under [GNU GPLv3](./LICENSE).
