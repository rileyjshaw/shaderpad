/**
 * Hand detection visualization using hands plugin. Shows the entire hand
 * skeleton, with colored dots on fingertips and hand centers.
 */
import ShaderPad from 'shaderpad';
import helpers from 'shaderpad/plugins/helpers';
import hands from 'shaderpad/plugins/hands';
import { createFullscreenCanvas } from 'shaderpad/util';

import { getWebcamVideo, stopVideoStream } from '@/examples/demo-utils';
import type { ExampleContext } from '@/examples/runtime';

export async function init({ mount }: ExampleContext) {
	const fragmentShaderSrc = `#version 300 es
precision mediump float;

in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_webcam;

#define THUMB_TIP 4
#define INDEX_TIP 8
#define MIDDLE_TIP 12
#define RING_TIP 16
#define PINKY_TIP 20
#define HAND_CENTER 21

#define N_CONNECTIONS 21
const ivec2 HAND_CONNECTIONS[N_CONNECTIONS] = ivec2[](
	ivec2(0, 1), ivec2(1, 2), ivec2(2, 3), ivec2(3, 4),
	ivec2(0, 5), ivec2(5, 6), ivec2(6, 7), ivec2(7, 8),
	ivec2(5, 9), ivec2(9, 10), ivec2(10, 11), ivec2(11, 12),
	ivec2(9, 13), ivec2(13, 14), ivec2(14, 15), ivec2(15, 16),
	ivec2(13, 17), ivec2(17, 18), ivec2(18, 19), ivec2(19, 20),
	ivec2(0, 17)
);

float marker(vec2 uv, vec2 pos, float radius, float feather) {
	return 1.0 - smoothstep(radius, radius + feather, distance(uv, pos));
}

float distToSegment(vec2 p, vec2 a, vec2 b) {
	vec2 ba = b - a;
	float denom = dot(ba, ba);
	if (denom == 0.0) return distance(p, a);
	float h = clamp(dot(p - a, ba) / denom, 0.0, 1.0);
	return length(p - a - ba * h);
}

void main() {
	vec2 uv = fitCover(vec2(1.0 - v_uv.x, v_uv.y), vec2(textureSize(u_webcam, 0)));
	vec4 webcamColor = texture(u_webcam, uv);
	vec3 color = webcamColor.rgb;

	for (int i = 0; i < u_nHands; ++i) {
		for (int c = 0; c < N_CONNECTIONS; ++c) {
			vec2 a = vec2(handLandmark(i, HAND_CONNECTIONS[c].x));
			vec2 b = vec2(handLandmark(i, HAND_CONNECTIONS[c].y));
			float edge = 0.0015;
			float boneLine = smoothstep(0.003 + edge, max(0.003 - edge, 0.0), distToSegment(uv, a, b));
			color = mix(color, vec3(1.0), boneLine * 0.8);
		}

		for (int lm = 0; lm < 21; ++lm) {
			vec2 joint = vec2(handLandmark(i, lm));
			color = mix(color, vec3(1.0), marker(uv, joint, 0.005, 0.004));
		}

		vec2 center = vec2(handLandmark(i, HAND_CENTER));
		vec3 handednessColor = mix(vec3(0.08, 0.92, 1.0), vec3(1.0, 0.58, 0.14), isRightHand(i));
		color = mix(color, handednessColor, marker(uv, center, 0.03, 0.015) * 0.75);
		color = mix(color, vec3(1.0), marker(uv, center, 0.012, 0.008));

		color = mix(color, vec3(1.0, 0.92, 0.15), marker(uv, vec2(handLandmark(i, THUMB_TIP)), 0.015, 0.008));
		color = mix(color, vec3(1.0, 0.2, 0.25), marker(uv, vec2(handLandmark(i, INDEX_TIP)), 0.015, 0.008));
		color = mix(color, vec3(0.2, 1.0, 0.45), marker(uv, vec2(handLandmark(i, MIDDLE_TIP)), 0.015, 0.008));
		color = mix(color, vec3(0.2, 0.55, 1.0), marker(uv, vec2(handLandmark(i, RING_TIP)), 0.015, 0.008));
		color = mix(color, vec3(0.95, 0.28, 1.0), marker(uv, vec2(handLandmark(i, PINKY_TIP)), 0.015, 0.008));
	}

	outColor = vec4(color, 1.0);
}`;

	const video = await getWebcamVideo({
		width: { ideal: 1280 },
		height: { ideal: 720 },
		facingMode: 'user',
	});

	const outputCanvas = createFullscreenCanvas(mount);
	outputCanvas.width = video.videoWidth;
	outputCanvas.height = video.videoHeight;
	outputCanvas.style.objectFit = 'cover';

	const shader = new ShaderPad(fragmentShaderSrc, {
		canvas: outputCanvas,
		plugins: [
			helpers(),
			hands({
				textureName: 'u_webcam',
				options: { maxHands: 3 },
			}),
		],
	});

	shader.initializeTexture('u_webcam', video);
	shader.play(() => {
		shader.updateTextures({ u_webcam: video });
	});

	return () => {
		shader.destroy();
		stopVideoStream(video);
		outputCanvas.remove();
	};
}
