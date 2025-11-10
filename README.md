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

// Your custom GLSL fragment shader code.
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

// Initialize the shader.
const shader = new ShaderPad(fragmentShaderSrc /* , options */);

// Add your own custom uniforms.
const getColor = (time: number) =>
	[time, time + (Math.PI * 2) / 3, time + (Math.PI * 4) / 3].map(x => 1 + Math.sin(x) / 2);
shader.initializeUniform('u_cursorColor', 'float', getColor(0));

// Start the render loop.
shader.play(time => {
	shader.updateUniforms({ u_cursorColor: getColor(time) });
});

// Optionally pause or reset the render loop.
// shader.pause();
// shader.reset();

// ShaderPad also attaches a throttled resize observer that you can hook into.
// It fires when the canvas size changes visually. If you supplied a custom
// canvas, you may use this to update its `width` and `height` attributes.
// shader.onResize = (width, height) => {
// 	console.log('Canvas resized:', width, height);
// };
```

See the [`examples/` directory](./examples/) for more.

## Usage

### Uniforms

#### `initializeUniform(name, type, value, options?)`

Initialize a uniform variable. The uniform must be declared in your fragment shader.

```typescript
// Initialize a float uniform.
shader.initializeUniform('u_speed', 'float', 1.5);

// Initialize a vec3 uniform.
shader.initializeUniform('u_color', 'float', [1.0, 0.5, 0.0]);
```

**Parameters:**

-   `name` (string): The name of the uniform as declared in your shader
-   `type` ('float' | 'int'): The uniform type
-   `value` (number | number[] | (number | number[])[]): Initial value(s)
-   `options` (optional): `{ arrayLength?: number }` - Required for uniform arrays

#### `updateUniforms(updates, options?)`

Update one or more uniform values.

```typescript
shader.updateUniforms({
	u_speed: 2.0,
	u_color: [1.0, 0.0, 0.0],
});
```

**Parameters:**

-   `updates` (Record<string, number | number[] | (number | number[])[]>): Object mapping uniform names to their new values
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
		[3, 3],
		[4, 4],
	],
	{
		arrayLength: 5,
	}
);

// Update all elements.
shader.updateUniforms({
	u_positions: [
		[0.1, 0.2],
		[1.1, 1.2],
		[2.1, 2.2],
		[3.1, 3.2],
		[4.1, 4.2],
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
| `u_cursor`             | float[2]       | Cursor position (x, y).                                                           |
| `u_click`              | float[3]       | Click position (x, y) and left click state (z).                                   |
| `u_history`            | sampler2DArray | Buffer texture of prior frames. Available if `history` option is set.             |
| `u_historyFrameOffset` | int            | Frame offset for accessing history texture. Available if `history` option is set. |

#### Included varyings

| Varying | Type     | Description                         |
| ------- | -------- | ----------------------------------- |
| `v_uv`  | float[2] | The UV coordinates of the fragment. |

### Textures

#### `initializeTexture(name, source, options?)`

Initialize a texture from an image, video, or canvas element.

```typescript
// Initialize a texture from an image.
const img = new Image();
img.src = 'texture.png';
img.onload = () => {
	shader.initializeTexture('u_texture', img);
};

// Initialize a texture with history (stores previous frames).
shader.initializeTexture('u_webcam', videoElement, { history: 30 });
```

**Parameters:**

-   `name` (string): The name of the texture uniform as declared in your shader
-   `source` (HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): The texture source
-   `options` (optional): `{ history?: number }` - Number of previous frames to store

#### `updateTextures(updates)`

Update one or more textures. Useful for updating video textures each frame.

```typescript
shader.updateTextures({
	u_webcam: videoElement,
	u_overlay: overlayCanvas,
});
```

**Parameters:**

-   `updates` (Record<string, TextureSource>): Object mapping texture names to their new sources

### Lifecycle methods

#### `play(callback?)`

Start the render loop. The callback is invoked each frame with the current time and frame number.

```typescript
shader.play();
// Can optionally take a callback to invoke each frame.
shader.play((time, frame) => {
	shader.updateTextures({ u_webcam: videoElement });
});
```

#### `pause()`, `reset()`, `destroy()`

```typescript
shader.pause(); // Pause the render loop.
shader.reset(); // Reset frame counter and clear history buffers.
shader.destroy(); // Clean up resources.
```

### Properties

-   `canvas` (HTMLCanvasElement): The canvas element used for rendering
-   `onResize?: (width: number, height: number) => void`: Callback fired when the canvas is resized

## Options

ShaderPad’s constructor accepts an optional `options` object.

### canvas

The `canvas` option allows you to pass in an existing canvas element. If not provided, ShaderPad will create a new canvas element and append it to the document body.

```typescript
const canvas = document.createElement('canvas');
const shader = new ShaderPad(fragmentShaderSrc, { canvas });
shader.onResize = (width, height) => {
	canvas.width = width;
	canvas.height = height;
};
```

### history

The `history` option enables framebuffer history, allowing you to access previous frames in your shader. Pass a number to specify how many frames to keep.

```typescript
// Store the last 10 frames of shader output.
const shader = new ShaderPad(fragmentShaderSrc, { history: 10 });

// In your shader, access history using the u_history uniform:
// uniform highp sampler2DArray u_history;
// It’s stored as a ringbuffer, so you can access specific frames with the provided offset uniform:
// uniform int u_historyFrameOffset;
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

### plugins

ShaderPad supports plugins to add additional functionality. Plugins are imported from separate paths to keep bundle sizes small.

#### helpers

The `helpers` plugin provides convenience functions and constants. See [helpers.glsl](./src/plugins/helpers.glsl) for the implementation.

```typescript
import ShaderPad from 'shaderpad';
import { helpers } from 'shaderpad/plugins/helpers';

const shader = new ShaderPad(fragmentShaderSrc, {
	plugins: [helpers()],
});
```

#### save

The `save` plugin adds a `.save()` method to the shader that saves the current frame to a PNG file. It works on desktop and mobile.

```typescript
import ShaderPad from 'shaderpad';
import { save, WithSave } from 'shaderpad/plugins/save';

const shader = new ShaderPad(fragmentShaderSrc, { plugins: [save()] }) as WithSave<ShaderPad>;
shader.save('my-frame');
```

#### face

The `face` plugin uses [MediaPipe](https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker) to detect faces in video or image textures.

```typescript
import ShaderPad from 'shaderpad';
import { face } from 'shaderpad/plugins/face';

const shader = new ShaderPad(fragmentShaderSrc, {
	plugins: [
		face({
			textureName: 'u_webcam',
			options: { maxFaces: 3 },
		}),
	],
});
```

**Uniforms:**

| Uniform        | Type           | Description                                    |
| -------------- | -------------- | ---------------------------------------------- |
| `u_maxFaces`   | int            | Maximum number of faces to detect              |
| `u_nFaces`     | int            | Current number of detected faces               |
| `u_faceCenter` | vec2[maxFaces] | Face center positions                          |
| `u_leftEye`    | vec2[maxFaces] | Left eye positions                             |
| `u_rightEye`   | vec2[maxFaces] | Right eye positions                            |
| `u_noseTip`    | vec2[maxFaces] | Nose tip positions                             |
| `u_faceMask`   | sampler2D      | Face mask texture (R: mouth, G: face, B: eyes) |

**Helper functions:** `getFace(vec2 pos)`, `getEye(vec2 pos)`, `getMouth(vec2 pos)`

**Note:** The face plugin requires `@mediapipe/tasks-vision` as a peer dependency.

#### pose

The `pose` plugin uses [MediaPipe Pose Landmarker](https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker) to expose a flat array of 2D landmarks. Each pose contributes 33 landmarks, enumerated below.

```typescript
import ShaderPad from 'shaderpad';
import { pose } from 'shaderpad/plugins/pose';

const shader = new ShaderPad(fragmentShaderSrc, {
	plugins: [pose({ textureName: 'u_video', options: { maxPoses: 3 } })],
});
```

**Uniforms:**

| Uniform           | Type                | Description                              |
| ----------------- | ------------------- | ---------------------------------------- |
| `u_maxPoses`      | int                 | Maximum number of poses to track         |
| `u_nPoses`        | int                 | Current number of detected poses         |
| `u_poseLandmarks` | vec2[maxPoses * 33] | Landmark positions in UV space           |
| `u_poseMask`      | sampler2D           | Pose mask texture (G: body, B: skeleton) |

**Helper functions:** `poseLandmark(int poseIndex, int landmarkIndex)`, `getBody(vec2 pos)`, `getSkeleton(vec2 pos)`

Use `poseLandmark(int poseIndex, int landmarkIndex)` in GLSL to retrieve a specific point. Landmark indices are:

| Index | Landmark          | Index | Landmark         |
| ----- | ----------------- | ----- | ---------------- |
| 0     | nose              | 17    | left pinky       |
| 1     | left eye (inner)  | 18    | right pinky      |
| 2     | left eye          | 19    | left index       |
| 3     | left eye (outer)  | 20    | right index      |
| 4     | right eye (inner) | 21    | left thumb       |
| 5     | right eye         | 22    | right thumb      |
| 6     | right eye (outer) | 23    | left hip         |
| 7     | left ear          | 24    | right hip        |
| 8     | right ear         | 25    | left knee        |
| 9     | mouth (left)      | 26    | right knee       |
| 10    | mouth (right)     | 27    | left ankle       |
| 11    | left shoulder     | 28    | right ankle      |
| 12    | right shoulder    | 29    | left heel        |
| 13    | left elbow        | 30    | right heel       |
| 14    | right elbow       | 31    | left foot index  |
| 15    | left wrist        | 32    | right foot index |
| 16    | right wrist       |       |                  |

[Source](https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker#pose_landmarker_model)

A minimal fragment shader loop looks like:

```glsl
int POSE_LANDMARK_LEFT_HIP = 23;
int POSE_LANDMARK_RIGHT_HIP = 24;
for (int i = 0; i < u_maxPoses; ++i) {
	if (i >= u_nPoses) break;
	vec2 leftHip = poseLandmark(i, POSE_LANDMARK_LEFT_HIP);
	vec2 rightHip = poseLandmark(i, POSE_LANDMARK_RIGHT_HIP);
	// …
}
```

#### hands

The `hands` plugin uses [MediaPipe Hand Landmarker](https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker) to expose a flat array of 2D landmarks. Each hand contributes 22 landmarks, enumerated below.

```typescript
import ShaderPad from 'shaderpad';
import { hands } from 'shaderpad/plugins/hands';

const shader = new ShaderPad(fragmentShaderSrc, {
	plugins: [hands({ textureName: 'u_video', options: { maxHands: 2 } })],
});
```

**Uniforms:**

| Uniform           | Type                | Description                      |
| ----------------- | ------------------- | -------------------------------- |
| `u_maxHands`      | int                 | Maximum number of hands to track |
| `u_nHands`        | int                 | Current number of detected hands |
| `u_handLandmarks` | vec2[maxHands * 22] | Landmark positions in UV space   |

**Helper functions:** `handLandmark(int handIndex, int landmarkIndex)`

Use `handLandmark(int handIndex, int landmarkIndex)` in GLSL to retrieve a specific point. Landmark indices are:

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
int HAND_LANDMARK_WRIST = 0;
int HAND_LANDMARK_THUMB_TIP = 4;
int HAND_LANDMARK_INDEX_TIP = 8;
for (int i = 0; i < u_maxHands; ++i) {
	if (i >= u_nHands) break;
	vec2 wrist = handLandmark(i, HAND_LANDMARK_WRIST);
	vec2 thumbTip = handLandmark(i, HAND_LANDMARK_THUMB_TIP);
	vec2 indexTip = handLandmark(i, HAND_LANDMARK_INDEX_TIP);
	// …
}
```

**Note:** The hands plugin requires `@mediapipe/tasks-vision` as a peer dependency.

## Contributing

### Running an example

```bash
# Clone the repository.
git clone https://github.com/your-username/shaderpad.git
cd shaderpad

# Install dependencies and start the development server.
cd examples
npm install
npm run dev
```

This will launch a local server. Open the provided URL (usually `http://localhost:5173`) in your browser to view and interact with the examples. Use the select box to view different examples.

### Adding an example

-   Add a new `.ts` file in `examples/src/`.
-   Follow the structure of an existing example as a template. The example must export an `init` function and a `destroy` function.
-   Add the example to the `demos` array in `examples/src/main.ts`.
-   If your example needs images or other assets, place them in `examples/public/` and reference them with a relative path.

## License

This project is licensed under [GNU GPLv3](./LICENSE).
