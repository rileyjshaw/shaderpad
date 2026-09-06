/**
 * Hand detection visualization using hands plugin. Shows the entire hand skeleton
 * as glowing connections for each detected hand.
 */
import ShaderPad from 'shaderpad';
import autosize from 'shaderpad/plugins/autosize';
import helpers from 'shaderpad/plugins/helpers';
import hands from 'shaderpad/plugins/hands';
import { createFullscreenCanvas } from 'shaderpad/util';

import { getWebcamVideo, stopVideoStream } from '@/examples/demo-utils';
import type { ExampleContext } from '@/examples/runtime';

let shader: ShaderPad | null = null;
let video: HTMLVideoElement | null = null;
let outputCanvas: HTMLCanvasElement | null = null;

export async function init({ mount }: ExampleContext) {
	const fragmentShaderSrc = `#version 300 es
precision mediump float;

in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_webcam;

#define N_CONNECTIONS 21
const ivec2 HAND_CONNECTIONS[N_CONNECTIONS] = ivec2[](
	ivec2(0, 1), ivec2(1, 2), ivec2(2, 3), ivec2(3, 4),
	ivec2(0, 5), ivec2(5, 6), ivec2(6, 7), ivec2(7, 8),
	ivec2(5, 9), ivec2(9, 10), ivec2(10, 11), ivec2(11, 12),
	ivec2(9, 13), ivec2(13, 14), ivec2(14, 15), ivec2(15, 16),
	ivec2(13, 17), ivec2(17, 18), ivec2(18, 19), ivec2(19, 20),
	ivec2(0, 17)
);

float falloffEase(float x) {
	float t = clamp(1.0 - x, 0.0, 1.0);
	t *= t;
	t *= t;
	t *= t;
	return t;
}

float renderGlowingSegmentExpWidth(
	vec2 uv,
	vec2 p0,
	vec2 p1,
	float endpointRadiusPx,
	float sharpnessPx
) {
	float pxPerUv = u_resolution.y;
	sharpnessPx *= 0.01;
	float endpointRadiusUv = endpointRadiusPx / pxPerUv;
	float minThicknessPx = 2.0;
	float minThicknessUv = minThicknessPx / pxPerUv;

	vec2 segment = p1 - p0;
	float segmentLengthSq = dot(segment, segment);
	float segmentLength = sqrt(segmentLengthSq);
	vec2 uvToP0 = uv - p0;

	float projected = clamp(dot(uvToP0, segment) / segmentLengthSq, 0.0, 1.0);

	float segmentLengthPx = segmentLength * pxPerUv;
	float xPx = projected * segmentLengthPx;

	float denom = 1.0 + exp(-segmentLengthPx * sharpnessPx);
	float thicknessPx = endpointRadiusPx * (
		exp(-xPx * sharpnessPx) +
		exp((xPx - segmentLengthPx) * sharpnessPx)
	) / denom;

	thicknessPx = max(minThicknessPx, thicknessPx);
	float thicknessUv = thicknessPx / pxPerUv;

	vec2 closestPoint = p0 + segment * projected;
	float distToLine = length(uv - closestPoint);
	float distToP0 = length(uv - p0);
	float distToP1 = length(uv - p1);

	float lineNorm = distToLine / thicknessUv;
	float endpointNorm0 = distToP0 / endpointRadiusUv;
	float endpointNorm1 = distToP1 / endpointRadiusUv;

	float dNorm = min(lineNorm, min(endpointNorm0, endpointNorm1));

	float inner = falloffEase(dNorm * 0.6);
	float outer = falloffEase(dNorm);
	float intensity = inner + 0.4 * outer;

	return intensity;
}

void main() {
	vec2 uv = fitCover(vec2(1.0 - v_uv.x, v_uv.y), vec2(textureSize(u_webcam, 0)));
	vec3 lineColor = vec3(0.0, 0.0, 0.0);

	float endpointRadiusPx = 14.0;
	float sharpness = 1.5;

	for (int i = 0; i < u_nHands; ++i) {
		for (int c = 0; c < N_CONNECTIONS; ++c) {
			vec2 a = vec2(handLandmark(i, HAND_CONNECTIONS[c].x));
			vec2 b = vec2(handLandmark(i, HAND_CONNECTIONS[c].y));
			float segmentIntensity = renderGlowingSegmentExpWidth(uv, a, b, endpointRadiusPx, sharpness);
			lineColor += segmentIntensity * vec3(0.3, 0.85, 1.0);
		}
	}

	vec3 core = lineColor * lineColor;
	lineColor += core * 0.3;

	lineColor = lineColor / (1.0 + lineColor);
	lineColor = pow(lineColor, vec3(0.4545));

	outColor = vec4(lineColor, 1.0);
}`;

	video = await getWebcamVideo();

	outputCanvas = createFullscreenCanvas(mount);

	shader = new ShaderPad(fragmentShaderSrc, {
		canvas: outputCanvas,
		plugins: [
			autosize(),
			helpers(),
			hands({
				textureName: 'u_webcam',
				options: { maxHands: 3 },
			}),
		],
	});

	shader.initializeTexture('u_webcam', video);
	shader.play(() => {
		shader!.updateTextures({ u_webcam: video! });
	});
}

export function destroy() {
	if (shader) {
		shader.destroy();
		shader = null;
	}

	if (video) {
		stopVideoStream(video);
		video = null;
	}

	if (outputCanvas) {
		outputCanvas.remove();
		outputCanvas = null;
	}
}
