# ShaderPad

ShaderPad is a lightweight, dependency-free library to reduce boilerplate when writing fragment shaders. It provides a simple interface to initialize shaders, manage uniforms, maintain an animation loop, and handle user interactions such as mouse movements and window resizing.

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
uniform vec4 u_cursor; // [cursorX, cursorY, scrollX, scrollY]

// Custom variables.
uniform vec3 u_cursorColor;

out vec4 outColor;

void main() {
  vec2 uv = v_uv * u_resolution;
  vec2 dotGrid = mod(uv, 50.) - 25.;
  float dotDist = length(dotGrid);
  float dot = step(dotDist, 5.);

  float cursorDist = distance(uv, u_cursor.xy * u_resolution);
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

### plugins

ShaderPad supports plugins to add additional functionality.

#### history

The `history` plugin can capture both the framebuffer output and texture history. The plugin argument controls how many frames to keep for the framebuffer (defaults to `1`).

```typescript
import ShaderPad, { history, WithHistory } from 'shaderpad';

// Store the last 10 frames of shader output.
const shaderWithOutputHistory = new ShaderPad(fragmentShaderSrc, { plugins: [history(10)] });

// Store the last 30 webcam frames.
const shader = new ShaderPad(fragmentShaderSrc, { plugins: [history()] }) as WithHistory<ShaderPad>;
shader.initializeTexture('u_webcam', videoElement, 30);
```

#### save

The `save` plugin adds a `.save()` method to the shader that saves the current frame to a PNG file.

```typescript
import ShaderPad, { save, WithSave } from 'shaderpad';
const shader = new ShaderPad(fragmentShaderSrc, { plugins: [save()] }) as WithSave<ShaderPad>;
shader.save('my-frame');
```

## Included uniforms

| Uniform        | Type           | Description                                                                     |
| -------------- | -------------- | ------------------------------------------------------------------------------- |
| `u_time`       | float          | The current time in seconds.                                                    |
| `u_frame`      | int            | The current frame number.                                                       |
| `u_resolution` | float[2]       | The canvas element's dimensions.                                                |
| `u_cursor`     | float[2]       | Cursor position (x, y).                                                         |
| `u_click`      | float[3]       | Click position (x, y) and left click state (z).                                 |
| `u_history`    | sampler2DArray | Buffer texture of prior frames. Only available if the `history` plugin is used. |

## Included varyings

| Varying | Type     | Description                         |
| ------- | -------- | ----------------------------------- |
| `v_uv`  | float[2] | The UV coordinates of the fragment. |

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

This will launch a local server. Open the provided URL (usually `http://localhost:5173`) in your browser to view and interact with the examples. Use the select box to view a different example.

### Adding an example

-   Add a new `.ts` file in `examples/src/`.
-   Follow the structure of an existing example as a template. The example must export an `init` function and a `destroy` function.
-   Add the example to the `demos` array in `examples/src/main.ts`.
-   If your example needs images or other assets, place them in `examples/public/` and reference them with a relative path.

## License

This project is licensed under [GNU GPLv3](./LICENSE).
