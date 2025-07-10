import ShaderPad from 'shaderpad';

const fragmentShaderSrc = `#version 300 es
precision highp float;

// Built-in variables.
in vec2 v_uv;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec4 u_cursor; // [cursorX, cursorY, scrollX, scrollY]
uniform vec3 u_click; // [clickX, clickY, isClicked]

// Custom variables.
uniform vec3 u_cursorColor;

out vec4 outColor;

void main() {
  vec2 uv = v_uv * u_resolution;
  vec2 dotGrid = mod(uv, 50.) - 25.;
  float dotDist = length(dotGrid);
  float dot = step(dotDist, 5.);

  vec2 cursorPos = u_cursor.xy;
  vec2 scrollPos = u_cursor.zw;
  vec2 clickPos = u_click.xy;
  float isClicked = u_click.z;

  float cursorDist = distance(uv, cursorPos * u_resolution);
  float clickDist = distance(uv, clickPos * u_resolution);

  float cursorRadius = 25. + sin(u_time * 5.) * 5. + isClicked * 15.;
  float cursor = step(cursorDist, cursorRadius);
  float click = step(clickDist, 15.);

  vec3 color = mix(vec3(0., 0., 1.), vec3(1.), dot);
  color = mix(color, u_cursorColor, cursor);
  color = mix(color, vec3(1., 1., 1.), click);
  color.r += sin(scrollPos.x);
  color.g += sin(scrollPos.y);

  outColor = vec4(color, 1.);
}`;

// Initialize the shader.
const shader = new ShaderPad(fragmentShaderSrc);

// Add your own custom uniforms.
const getColor = (time: number) =>
	[time, time + (Math.PI * 2) / 3, time + (Math.PI * 4) / 3].map(x => 1 + Math.sin(x) / 2);
shader.initializeUniform('u_cursorColor', 'float', getColor(0));

// Start the render loop.
shader.play(time => {
	shader.updateUniforms({ u_cursorColor: getColor(time) });
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
