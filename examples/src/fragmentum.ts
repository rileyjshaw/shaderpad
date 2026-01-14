/**
 * Procedural 3D animation (ported from Shadertoy). Uses u_time uniform
 * for animation. Spacebar to pause/play.
 */
import ShaderPad from 'shaderpad';

const fragmentShaderSrc = `#version 300 es
precision highp float;

// Built-in variables.
in vec2 v_uv;
uniform float u_time;
uniform vec2 u_resolution;

out vec4 outColor;

// Fragmentum by Jaenam
// https://www.shadertoy.com/view/t3SyzV

void main() {
	vec2 I = gl_FragCoord.xy;
	vec4 O = vec4(0.0);
	float i,d,s;
    vec2 r = u_resolution;
	vec3 p;
	mat2 R = mat2(cos(u_time/2.+vec4(0,33,11,0)));

	for(O*=i; i++<1e2; O+=max(1.3*sin(vec4(1,2,3,1)+i*.3)/s,-length(p*p)))
		p = vec3((I+I - r.xy)/r.y*d*R, d-8.), p.xz*=R,
		d+=s=.012+.07*abs(max(sin(length(fract(p)*p)),length(p)-4.)-i/1e2);  

	outColor=tanh(O*O/8e5);
}`;

let shader: ShaderPad | null = null;
let isPlaying = true;
let keydownHandler: ((e: KeyboardEvent) => void) | null = null;

export async function init() {
	shader = new ShaderPad(fragmentShaderSrc);
	shader.canvas.style.height = shader.canvas.style.width = '512px';
	shader.canvas.style.left = shader.canvas.style.top = '50%';
	shader.canvas.style.transform = 'translate(-50%, -50%)';
	shader.play();

	keydownHandler = (e: KeyboardEvent) => {
		if (e.key === ' ') {
			isPlaying = !isPlaying;
			isPlaying ? shader!.play() : shader!.pause();
		}
	};
	document.addEventListener('keydown', keydownHandler);
}

export function destroy() {
	if (shader) {
		shader.destroy();
		shader = null;
	}

	if (keydownHandler) {
		document.removeEventListener('keydown', keydownHandler);
		keydownHandler = null;
	}

	isPlaying = true;
}
