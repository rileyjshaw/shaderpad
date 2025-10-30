import ShaderPad, { save, WithSave } from 'shaderpad';

const fragmentShaderSrc = `#version 300 es
precision highp float;

// Built-in variables.
in vec2 v_uv;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_cursor; // [cursorX, cursorY]
uniform vec3 u_click; // [clickX, clickY, isClicked]

// Custom variables.
uniform vec3 u_cursorColor;

out vec4 outColor;

void main() {
  vec2 uv = v_uv * u_resolution;
  vec2 dotGrid = mod(uv, 50.) - 25.;
  float dotDist = length(dotGrid);
  float dot = step(dotDist, 5.);

  vec2 clickPos = u_click.xy;
  float isClicked = u_click.z;

  float cursorDist = distance(uv, u_cursor * u_resolution);
  float clickDist = distance(uv, clickPos * u_resolution);

  float cursorRadius = 25. + sin(u_time * 5.) * 5. + isClicked * 15.;
  float cursor = step(cursorDist, cursorRadius);
  float click = step(clickDist, 15.);

  vec3 color = mix(vec3(0., 0., 1.), vec3(1.), dot);
  color = mix(color, u_cursorColor, cursor);
  color = mix(color, vec3(1., 1., 1.), click);

  outColor = vec4(color, 1.);
}`;

let shader: WithSave<ShaderPad> | null = null;
let isPlaying = true;

export async function init() {
	// Initialize the shader.
	shader = new ShaderPad(fragmentShaderSrc, {
		plugins: [save()],
	}) as WithSave<ShaderPad>;

	// Add your own custom uniforms.
	const getColor = (time: number) =>
		[time, time + (Math.PI * 2) / 3, time + (Math.PI * 4) / 3].map(x => 1 + Math.sin(x) / 2);
	shader.initializeUniform('u_cursorColor', 'float', getColor(0));

	// Start the render loop.
	shader.play(time => {
		shader!.updateUniforms({ u_cursorColor: getColor(time) });
	});

	// Add keyboard controls
	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === ' ') {
			isPlaying = !isPlaying;
			isPlaying ? shader!.play() : shader!.pause();
		}
	};
	document.addEventListener('keydown', handleKeydown);

	// Store cleanup function
	return () => {
		document.removeEventListener('keydown', handleKeydown);
	};
}

export function destroy() {
	if (shader) {
		shader.destroy();
		shader = null;
	}
	isPlaying = true;
}
