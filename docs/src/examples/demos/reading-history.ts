/**
 * Framebuffer history visualization. Compares logical history access via
 * historyZ() with direct static texture-array layer reads.
 */
import ShaderPad from 'shaderpad';
import autosize from 'shaderpad/plugins/autosize';
import helpers from 'shaderpad/plugins/helpers';
import { createFullscreenCanvas } from 'shaderpad/util';

import type { ExampleContext } from '@/examples/runtime';

const HISTORY_DEPTH = 60;

export async function init({ mount }: ExampleContext) {
	const fragmentShaderSrc = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 outColor;
uniform float u_time;
uniform highp sampler2DArray u_history;
uniform int u_historyFrameOffset;

float circleMask(vec2 uv, vec2 center, float radius) {
	vec2 deltaPx = (uv - center) * u_resolution;
	float radiusPx = radius * min(u_resolution.x, u_resolution.y);
	return 1.0 - step(radiusPx, length(deltaPx));
}

vec2 lissajousPosition(float time) {
	float x = sin(time * 1.7 + 0.2);
	float y = sin(time * 2.3);
	return 0.5 + 0.36 * vec2(x, y);
}

float whiteMask(vec3 color) {
	return step(0.99, min(min(color.r, color.g), color.b));
}

void main() {
	vec2 center = lissajousPosition(u_time);
	float currentCircle = circleMask(v_uv, center, 0.04);

	vec3 color = vec3(0.0);

	vec3 rollingSample = texture(
		u_history,
		vec3(v_uv, historyZ(u_history, u_historyFrameOffset, ${HISTORY_DEPTH}))
	).rgb;
	color = mix(color, vec3(0.33), whiteMask(rollingSample));

	vec3 static20 = texture(u_history, vec3(v_uv, 20.0)).rgb;
	color = mix(color, vec3(1.0, 0.9, 0.0), whiteMask(static20));

	vec3 static40 = texture(u_history, vec3(v_uv, 40.0)).rgb;
	color = mix(color, vec3(1.0, 0.0, 0.0), whiteMask(static40));

	vec3 static60 = texture(u_history, vec3(v_uv, 60.0)).rgb;
	color = mix(color, vec3(0.0, 0.4, 1.0), whiteMask(static60));

	color = mix(color, vec3(1.0), currentCircle);

	outColor = vec4(color, 1.0);
}`;

	const canvas = createFullscreenCanvas(mount);
	canvas.style.imageRendering = 'pixelated';

	const shader = new ShaderPad(fragmentShaderSrc, {
		canvas,
		history: HISTORY_DEPTH,
		plugins: [autosize({ scale: 0.25 }), helpers()],
	});
	shader.play();

	return () => {
		shader.destroy();
		canvas.remove();
	};
}
