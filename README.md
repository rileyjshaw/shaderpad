# 2js

2js is a lightweight, dependency-free library to reduce boilerplate when writing fragment shaders. It provides a simple interface to initialize shaders, manage uniforms, maintain an animation loop, and handle user interactions such as mouse movements and window resizing.

## Installation

```bash
npm install 2js
```

## Example

```typescript
import Shader from '2js';

// Your custom GLSL fragment shader code.
const fragmentShaderSrc = `
precision highp float;

// Built-in variables.
varying vec2 vUv;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uCursor;

// Custom variables.
uniform vec3 uCursorColor;

void main() {
  vec2 uv = vUv * uResolution;
  vec2 dotGrid = mod(uv, 50.) - 25.;
  float dotDist = length(dotGrid);
  float dot = step(dotDist, 5.);

  float cursorDist = distance(uv, uCursor * uResolution);
  float cursor = step(cursorDist, 25. + sin(uTime * 5.) * 5.);

  vec3 color = mix(vec3(0., 0., 1.), vec3(1.), dot);
  color = mix(color, uCursorColor, cursor);

  gl_FragColor = vec4(color, 1.);
}
`;

// Initialize the shader.
const shader = new Shader(fragmentShaderSrc /* , canvasElement */);

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

## Included uniforms

| Uniform       | Type     | Description                         |
| ------------- | -------- | ----------------------------------- |
| `uUv`         | float[2] | The UV coordinates of the fragment. |
| `uTime`       | float    | The current time in seconds.        |
| `uResolution` | float[2] | The canvas element’s dimensions.    |
| `uCursor`     | float[2] | The current mouse/cursor position.  |

See the [`examples/` directory](./examples/) for more.

## License

This project is licensed under [GNU GPLv3](./LICENSE).
