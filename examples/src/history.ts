import ShaderPad, { helpers } from 'shaderpad';

const gridLength = 5;
const gridSize = gridLength * gridLength;

const fragmentShaderSrc = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 outColor;
uniform int u_frame;
uniform vec2 u_cursor;

uniform highp sampler2DArray u_history;
uniform int u_historyFrameOffset;

void main() {
	vec2 gridUV = fract(v_uv * ${gridLength}.0);
	vec2 gridPos = floor(v_uv * ${gridLength}.0);

	// Calculate which history frame to show based on grid position.
	int historyLength = textureSize(u_history, 0).z;
	int outputFrameIndex = u_frame % historyLength; // Index of the frame this full render will write to.
	int age = int(${gridLength}.0 - gridPos.x + gridPos.y * ${gridLength}.0); // 25 is top left, 1 is bottom right.

	// Sample from history texture; dim old frames.
	float z = historyZ(u_history, u_historyFrameOffset, age);
	vec3 historyColor = texture(u_history, vec3(gridUV, z)).rgb;
	float dim = 1.0 - float(age) / float(historyLength);
	historyColor *= dim;

	// Add cursor overlay.
	float cursorDist = distance(v_uv, u_cursor);
	float cursor = smoothstep(0.05, 0.02, cursorDist);
	vec3 cursorColor = vec3(cursor, 0.0, 0.0);

	vec3 finalColor = historyColor + cursorColor;
	outColor = vec4(finalColor, 1.0);
}`;

let shader: ShaderPad | null = null;
let canvas: HTMLCanvasElement | null = null;

export async function init() {
	canvas = document.createElement('canvas');
	canvas.width = 1000;
	canvas.height = 1000;
	canvas.style.position = 'fixed';
	canvas.style.inset = '0';
	canvas.style.height = '100dvh';
	canvas.style.width = '100dvw';
	document.body.appendChild(canvas);

	shader = new ShaderPad(fragmentShaderSrc, {
		canvas,
		history: gridSize,
		plugins: [helpers()],
	});
	shader.play();
}

export function destroy() {
	if (shader) {
		shader.destroy();
		shader = null;
	}
	if (canvas) {
		canvas.remove();
		canvas = null;
	}
}
