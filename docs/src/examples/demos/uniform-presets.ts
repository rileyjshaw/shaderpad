import ShaderPad from 'shaderpad';
import autosize from 'shaderpad/plugins/autosize';
import { createFullscreenCanvas } from 'shaderpad/util';

import type { ExampleContext } from '@/examples/runtime';

const shader = `#version 300 es
precision highp float;

in vec2 v_uv;
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_maxAngle;
uniform float u_speed;
uniform float u_phaseStep;
uniform float u_stepSize;
uniform float u_squareSize;
uniform float u_border;
uniform float u_isColorful;
out vec4 outColor;

vec3 color_tl = vec3(0.0, 1.0, 0.0);
vec3 color_bl = vec3(0.0, 0.0, 1.0);
vec3 color_tr = vec3(1.0, 0.5, 0.0);
vec3 color_br = vec3(1.0, 0.0, 0.0);

void main() {
  vec2 center = u_resolution * 0.5;
  vec2 pos = gl_FragCoord.xy - center;
  float dist = length(pos);
  float ring = floor(dist / u_stepSize);
  float phase = -ring * u_phaseStep;
  float angle = sin(u_time * u_speed + phase) * u_maxAngle;
  float s = sin(angle);
  float c = cos(angle);
  vec2 rotated = vec2(c * pos.x - s * pos.y, s * pos.x + c * pos.y);
  vec2 gridUv = rotated + center;
  vec2 uv = gridUv / u_resolution;
  vec3 colorLeft = mix(color_bl, color_tl, uv.y);
  vec3 colorRight = mix(color_br, color_tr, uv.y);
  vec3 gradient = mix(colorLeft, colorRight, uv.x);
  vec3 baseColor = u_isColorful > 0.5 ? gradient : vec3(1.0);
  vec2 offset = mod(u_resolution, u_squareSize) * 0.5;
  vec2 grid = fract((gridUv - offset) / u_squareSize);
  float mask = step(u_border, grid.x) * step(u_border, grid.y);
  mask *= step(grid.x, 1.0 - u_border) * step(grid.y, 1.0 - u_border);
  vec3 color = mix(vec3(0.0), baseColor, mask);
  outColor = vec4(color, 1.0);
}`;

const presets = [
	{
		u_maxAngle: (6 * Math.PI) / 180,
		u_speed: 2,
		u_phaseStep: Math.PI / 8,
		u_stepSize: 142,
		u_squareSize: 100,
		u_border: 0.25,
		u_isColorful: 0,
	},
	{
		u_maxAngle: Math.PI,
		u_speed: 2,
		u_phaseStep: Math.PI / 16,
		u_stepSize: 160,
		u_squareSize: 1,
		u_border: 0,
		u_isColorful: 1,
	},
	{
		u_maxAngle: Math.PI / 180,
		u_speed: 4,
		u_phaseStep: 0.3,
		u_stepSize: 1,
		u_squareSize: 120,
		u_border: 0.3,
		u_isColorful: 0,
	},
	{
		u_maxAngle: 2 * Math.PI,
		u_speed: 0.025,
		u_phaseStep: Math.PI,
		u_stepSize: 10,
		u_squareSize: 160,
		u_border: 0.2,
		u_isColorful: 0,
	},
	{
		u_maxAngle: Math.PI / 100,
		u_speed: 4,
		u_phaseStep: Math.PI / 42,
		u_stepSize: 10,
		u_squareSize: 42,
		u_border: 0.42,
		u_isColorful: 0,
	},
];

export function init({ mount }: ExampleContext) {
	const canvas = createFullscreenCanvas(mount);
	canvas.style.touchAction = 'manipulation';

	const scene = new ShaderPad(shader, {
		canvas,
		plugins: [autosize()],
	});

	for (const [name, value] of Object.entries(presets[0])) {
		scene.initializeUniform(name, 'float', value);
	}

	let index = 0;
	const applyPreset = () => scene.updateUniforms(presets[index]);
	const cyclePreset = (step: number) => {
		index = (index + step + presets.length) % presets.length;
		applyPreset();
	};

	const handleClick = () => cyclePreset(1);
	const handleKeydown = (event: KeyboardEvent) => {
		if (event.key === 'ArrowRight') cyclePreset(1);
		if (event.key === 'ArrowLeft') cyclePreset(-1);
	};

	canvas.addEventListener('click', handleClick);
	document.addEventListener('keydown', handleKeydown);
	scene.play();

	return () => {
		canvas.removeEventListener('click', handleClick);
		document.removeEventListener('keydown', handleKeydown);
		scene.destroy();
		canvas.remove();
	};
}
