import ShaderPad from 'shaderpad';

const fragmentShaderSrc = `
precision highp float;

// Built-in variables.
varying vec2 vUv;
uniform float uTime;
uniform vec2 uResolution;
uniform vec4 uCursor; // [cursorX, cursorY, scrollX, scrollY]
uniform vec3 uClick; // [clickX, clickY, isClicked]

// Custom variables.
uniform vec3 uCursorColor;

void main() {
  vec2 uv = vUv * uResolution;
  vec2 dotGrid = mod(uv, 50.) - 25.;
  float dotDist = length(dotGrid);
  float dot = step(dotDist, 5.);

  vec2 cursorPos = uCursor.xy;
  vec2 scrollPos = uCursor.zw;
  vec2 clickPos = uClick.xy;
  float isClicked = uClick.z;

  float cursorDist = distance(uv, cursorPos * uResolution);
  float clickDist = distance(uv, clickPos * uResolution);

  float cursorRadius = 25. + sin(uTime * 5.) * 5. + isClicked * 15.;
  float cursor = step(cursorDist, cursorRadius);
  float click = step(clickDist, 15.);

  vec3 color = mix(vec3(0., 0., 1.), vec3(1.), dot);
  color = mix(color, uCursorColor, cursor);
  color = mix(color, vec3(1., 1., 1.), click);
  color.r += sin(scrollPos.x);
  color.g += sin(scrollPos.y);

  gl_FragColor = vec4(color, 1.);
}
`;

// Initialize the shader.
const shader = new ShaderPad(fragmentShaderSrc);

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

let isPlaying = true;

document.addEventListener('keydown', e => {
	if (e.key === ' ') {
		isPlaying = !isPlaying;
		isPlaying ? shader.play() : shader.pause();
	}
});

document.addEventListener('keydown', e => {
	if (e.key === 's') {
		shader.save('example');
	}
});
