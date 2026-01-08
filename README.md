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

Initialize a texture from an image, video, canvas element, or typed array.

```typescript
// Initialize a texture from an image.
const img = new Image();
img.src = 'texture.png';
img.onload = () => {
	shader.initializeTexture('u_texture', img);
};

// Initialize a texture from a typed array (Float32Array, Uint8Array, etc.).
const data = new Float32Array(width * height * 4); // RGBA data
shader.initializeTexture(
	'u_custom',
	{
		data,
		width,
		height,
	},
	{
		internalFormat: gl.RGBA32F,
		type: gl.FLOAT,
		minFilter: gl.NEAREST,
		magFilter: gl.NEAREST,
	}
);

// Initialize a texture with history (stores previous frames).
shader.initializeTexture('u_webcam', videoElement, { history: 30 });

// Preserve Y orientation for DOM sources (don't flip vertically).
shader.initializeTexture('u_canvas', canvasElement, { preserveY: true });
```

**Parameters:**

-   `name` (string): The name of the texture uniform as declared in your shader
-   `source` (HTMLImageElement | HTMLVideoElement | HTMLCanvasElement | CustomTexture): The texture source
-   `options` (optional): Texture options (see below)

**Texture Options:**

-   `history?: number` - Number of previous frames to store (creates a `sampler2DArray`)
-   `preserveY?: boolean` - For DOM sources only: if `true`, don't flip vertically (default: `false`, flips to match WebGL's bottom-up convention)
-   `internalFormat?: number` - WebGL internal format (e.g., `gl.RGBA8`, `gl.RGBA32F`)
-   `format?: number` - WebGL format (default: `gl.RGBA`)
-   `type?: number` - WebGL data type (default: `gl.UNSIGNED_BYTE` for DOM sources, must be specified for typed arrays)
-   `minFilter?: number` - Minification filter (default: `gl.LINEAR`)
-   `magFilter?: number` - Magnification filter (default: `gl.LINEAR`)
-   `wrapS?: number` - Wrap mode for S coordinate (default: `gl.CLAMP_TO_EDGE`)
-   `wrapT?: number` - Wrap mode for T coordinate (default: `gl.CLAMP_TO_EDGE`)

**Note:** For typed array sources (`CustomTexture`), you must provide data in bottom-up orientation (WebGL convention). The `preserveY` option is ignored for typed arrays.

#### `updateTextures(updates)`

Update one or more textures. Useful for updating video textures each frame.

```typescript
shader.updateTextures({
	u_webcam: videoElement,
	u_overlay: overlayCanvas,
	u_custom: {
		data: typedArray,
		width,
		height,
	},
});

// Typed arrays can be partially updated.
shader.updateTextures({
	u_custom: {
		data: partialData,
		width: regionWidth,
		height: regionHeight,
		isPartial: true,
		x: offsetX,
		y: offsetY,
	},
});
```

**Parameters:**

-   `updates` (Record<string, TextureSource | PartialCustomTexture>): Object mapping texture names to their new sources

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

### debug

The `debug` option controls whether debug logging is enabled. When enabled, ShaderPad will log warnings when uniforms or textures are not found in the shader. Defaults to `true` in development (when `process.env.NODE_ENV !== 'production'`) and `false` in production builds.

```typescript
const shader = new ShaderPad(fragmentShaderSrc, { debug: true }); // Explicitly enable debug logging.
```

### plugins

ShaderPad supports plugins to add additional functionality. Plugins are imported from separate paths to keep bundle sizes small.

#### helpers

The `helpers` plugin provides convenience functions and constants. See [helpers.glsl](./src/plugins/helpers.glsl) for the implementation.

```typescript
import ShaderPad from 'shaderpad';
import helpers from 'shaderpad/plugins/helpers';

const shader = new ShaderPad(fragmentShaderSrc, {
	plugins: [helpers()],
});
```

**Note:** The `helpers` plugin automatically injects the `u_resolution` uniform into your shader. Do not declare it yourself.

#### save

The `save` plugin adds a `.save()` method to the shader that saves the current frame to a PNG file. It works on desktop and mobile.

```typescript
import ShaderPad from 'shaderpad';
import save, { WithSave } from 'shaderpad/plugins/save';

const shader = new ShaderPad(fragmentShaderSrc, { plugins: [save()] }) as WithSave<ShaderPad>;
shader.save('filename', 'Optional mobile share text');
```

#### face

The `face` plugin uses [MediaPipe](https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker) to detect faces in video or image textures.

```typescript
import ShaderPad from 'shaderpad';
import face from 'shaderpad/plugins/face';

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

| Uniform              | Type      | Description                                                |
| -------------------- | --------- | ---------------------------------------------------------- |
| `u_maxFaces`         | int       | Maximum number of faces to detect                          |
| `u_nFaces`           | int       | Current number of detected faces                           |
| `u_faceLandmarksTex` | sampler2D | Raw landmark data texture (use `faceLandmark()` to access) |
| `u_faceMask`         | sampler2D | Face mask texture (R: mouth, G: face, B: eyes)             |

**Helper functions:**

-   `faceLandmark(int faceIndex, int landmarkIndex) -> vec4` - Returns landmark data as `vec4(x, y, z, visibility)`. Use `vec2(faceLandmark(...))` to get just the screen position.
-   `inFace(vec2 pos) -> float` - Returns face mask value at position (green channel)
-   `inEye(vec2 pos) -> float` - Returns eye mask value at position (blue channel)
-   `inMouth(vec2 pos) -> float` - Returns mouth mask value at position (red channel)

**Constants:**

-   `FACE_LANDMARK_L_EYE_CENTER` - Left eye center landmark index
-   `FACE_LANDMARK_R_EYE_CENTER` - Right eye center landmark index
-   `FACE_LANDMARK_NOSE_TIP` - Nose tip landmark index
-   `FACE_LANDMARK_FACE_CENTER` - Face center landmark index (custom, calculated from all landmarks)
-   `FACE_LANDMARK_MOUTH_CENTER` - Mouth center landmark index (custom, calculated from inner lip landmarks)

**Example usage:**

```glsl
// Get a specific landmark position.
vec2 nosePos = vec2(faceLandmark(0, FACE_LANDMARK_NOSE_TIP));

if (inMouth(v_uv) > 0.0) {
	// Position is inside a mouth.
}

// Iterate through all faces and landmarks.
for (int i = 0; i < u_nFaces; ++i) {
    vec4 leftEye = faceLandmark(i, FACE_LANDMARK_L_EYE_CENTER);
    vec4 rightEye = faceLandmark(i, FACE_LANDMARK_R_EYE_CENTER);
    // ...
}
```

[Landmark indices are documented here.](https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker#face_landmarker_model) This library adds two custom landmarks: `FACE_CENTER` and `MOUTH_CENTER`. This brings the total landmark count to 480.

**Note:** The face plugin requires `@mediapipe/tasks-vision` as a peer dependency.

#### pose

The `pose` plugin uses [MediaPipe Pose Landmarker](https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker) to expose a flat array of 2D landmarks. Each pose contributes 39 landmarks (33 standard + 6 custom), enumerated below.

```typescript
import ShaderPad from 'shaderpad';
import pose from 'shaderpad/plugins/pose';

const shader = new ShaderPad(fragmentShaderSrc, {
	plugins: [pose({ textureName: 'u_video', options: { maxPoses: 3 } })],
});
```

**Uniforms:**

| Uniform              | Type      | Description                                           |
| -------------------- | --------- | ----------------------------------------------------- |
| `u_maxPoses`         | int       | Maximum number of poses to track                      |
| `u_nPoses`           | int       | Current number of detected poses                      |
| `u_poseLandmarksTex` | sampler2D | Raw landmark data texture (RGBA: x, y, z, visibility) |
| `u_poseMask`         | sampler2D | Pose mask texture (G: body)                           |

**Helper functions:**

-   `poseLandmark(int poseIndex, int landmarkIndex) -> vec4` - Returns landmark data as `vec4(x, y, z, visibility)`. Use `vec2(poseLandmark(...))` to get just the screen position.
-   `inBody(vec2 pos) -> int` - Returns 0 if no body at position, otherwise returns a 1-indexed pose index

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
import ShaderPad from 'shaderpad';
import hands from 'shaderpad/plugins/hands';

const shader = new ShaderPad(fragmentShaderSrc, {
	plugins: [hands({ textureName: 'u_video', options: { maxHands: 2 } })],
});
```

**Uniforms:**

| Uniform              | Type      | Description                                           |
| -------------------- | --------- | ----------------------------------------------------- |
| `u_maxHands`         | int       | Maximum number of hands to track                      |
| `u_nHands`           | int       | Current number of detected hands                      |
| `u_handLandmarksTex` | sampler2D | Raw landmark data texture (RGBA: x, y, z, visibility) |

**Helper functions:**

-   `handLandmark(int handIndex, int landmarkIndex) -> vec4` - Returns landmark data as `vec4(x, y, z, visibility)`. Use `vec2(handLandmark(...))` to get just the screen position.

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
#define HAND_LANDMARK_WRIST 0
#define HAND_LANDMARK_THUMB_TIP 4
#define HAND_LANDMARK_INDEX_TIP 8
#define HAND_LANDMARK_HAND_CENTER 21
for (int i = 0; i < u_maxHands; ++i) {
	if (i >= u_nHands) break;
	vec2 wrist = vec2(handLandmark(i, HAND_LANDMARK_WRIST));
	vec2 thumbTip = vec2(handLandmark(i, HAND_LANDMARK_THUMB_TIP));
	vec2 indexTip = vec2(handLandmark(i, HAND_LANDMARK_INDEX_TIP));
	vec2 handCenter = vec2(handLandmark(i, HAND_LANDMARK_HAND_CENTER));
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
				outputCategoryMask: true,
				outputConfidenceMasks: false,
			},
		}),
	],
});
```

**Uniforms:**

| Uniform         | Type      | Description                                                                                                              |
| --------------- | --------- | ------------------------------------------------------------------------------------------------------------------------ |
| `u_segmentMask` | sampler2D | Segment mask texture (R: normalized category value, 0.0 for background, >0.0 for segments, spread evenly over 0-1 range) |

**Helper functions:**

-   `inSegment(vec2 pos) -> float` - Returns segment mask value at position (red channel). Returns 0.0 for background, >0.0 for segments. The value is normalized based on the number of categories, with segments spread evenly over the 0-1 range. For instance, with 3 categories: 0→0.0 (background), 1→0.5 (segment 1), 2→1.0 (segment 2).

**Example usage:**

```glsl
bool isForeground = inSegment(v_uv) > 0.0;
color = mix(color, vec3(1.0, 0.0, 1.0), isForeground);
```

**Note:** The segmenter plugin requires `@mediapipe/tasks-vision` as a peer dependency.

## Contributing

### Running an example

```bash
# Clone the repository.
git clone https://github.com/rileyjshaw/shaderpad.git
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
