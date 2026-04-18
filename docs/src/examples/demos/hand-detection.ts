/**
 * Hand detection visualization using hands plugin. Shows colored dots on
 * fingertips and hand centers.
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

float marker(vec2 uv, vec2 pos, float radius, float feather) {
	return 1.0 - smoothstep(radius, radius + feather, distance(uv, pos));
}

void main() {
	vec2 uv = fitCover(vec2(1.0 - v_uv.x, v_uv.y), vec2(textureSize(u_webcam, 0)));
	vec4 webcamColor = texture(u_webcam, uv);
	vec3 color = webcamColor.rgb;

	for (int i = 0; i < u_nHands; ++i) {
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
