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
const fragmentShaderSrc = `
precision highp float;

// Built-in variables.
varying vec2 vUv;
uniform float uTime;
uniform vec2 uResolution;
uniform vec4 uCursor; // [cursorX, cursorY, scrollX, scrollY]

// Custom variables.
uniform vec3 uCursorColor;

void main() {
  vec2 uv = vUv * uResolution;
  vec2 dotGrid = mod(uv, 50.) - 25.;
  float dotDist = length(dotGrid);
  float dot = step(dotDist, 5.);

  float cursorDist = distance(uv, uCursor.xy * uResolution);
  float cursor = step(cursorDist, 25. + sin(uTime * 5.) * 5.);

  vec3 color = mix(vec3(0., 0., 1.), vec3(1.), dot);
  color = mix(color, uCursorColor, cursor);

  gl_FragColor = vec4(color, 1.);
}
`;

// Initialize the shader.
const shader = new ShaderPad(fragmentShaderSrc /* , canvasElement */);

// Add your own custom uniforms.
const getColor = (time: number) =>
	[time, time + (Math.PI * 2) / 3, time + (Math.PI * 4) / 3].map(x => 1 + Math.sin(x) / 2);
shader.initializeUniform('uCursorColor', 'float', getColor(0));

// Start the render loop.
shader.play(time => {
	shader.updateUniforms({ uCursorColor: getColor(time) });
});

// Optionally pause the render loop.
// shader.pause();
```

See the [`examples/` directory](./examples/) for more.

## Included uniforms

| Uniform       | Type     | Description                                        |
| ------------- | -------- | -------------------------------------------------- |
| `uUv`         | float[2] | The UV coordinates of the fragment.                |
| `uTime`       | float    | The current time in seconds.                       |
| `uFrame`      | int      | The current frame number.                          |
| `uResolution` | float[2] | The canvas element's dimensions.                   |
| `uCursor`     | float[4] | Cursor position (x, y) and scroll position (z, w). |
| `uClick`      | float[3] | Click position (x, y) and left click state (z).    |

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

This will launch a local server (powered by Vite). Open the provided URL (usually `http://localhost:5173`) in your browser to view and interact with the examples.

`examples/index.html` hardcodes the `main.ts` example. To view a different example, change `<script type="module" src="/src/main.ts"></script>` to point to your new example.

### Adding an example

-   Add a new `.ts` file in `examples/src/`.
-   Follow the structure of an existing example as a template.
-   Change `<script type="module" src="/src/main.ts"></script>` in `examples/index.html` to point to your new example.
-   If your example needs images or other assets, place them in `examples/public/` and reference them with a relative path.

## License

This project is licensed under [GNU GPLv3](./LICENSE).
