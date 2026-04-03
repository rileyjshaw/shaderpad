/**
 * Hand detection with history visualization. Draws ink trails from raised fingertips.
 */
import ShaderPad, { TextureSource } from 'shaderpad';
import autosize from 'shaderpad/plugins/autosize';
import hands from 'shaderpad/plugins/hands';
import helpers from 'shaderpad/plugins/helpers';
import { createFullscreenCanvas } from 'shaderpad/util';

import { getWebcamVideo, stopVideoStream } from '@/examples/demo-utils';
import type { ExampleContext } from '@/examples/runtime';

const N_HISTORY_FRAMES = 60;

let trailsShader: ShaderPad | null = null;
let outputShader: ShaderPad | null = null;
let video: HTMLVideoElement | null = null;
let canvas: HTMLCanvasElement | null = null;

const SHARED_GLSL = `
#define THUMB_TIP 4
#define INDEX_TIP 8
#define MIDDLE_TIP 12
#define RING_TIP 16
#define PINKY_TIP 20
#define N_FINGERS 4

const float TRAIL_RADIUS_START = 0.016;
const float TRAIL_RADIUS_END = 0.00045;

const int FINGER_TIPS[N_FINGERS] = int[](INDEX_TIP, MIDDLE_TIP, RING_TIP, PINKY_TIP);
const vec3 FINGER_COLORS[N_FINGERS] = vec3[](
	vec3(1.0, 0.45, 0.2),  // Index — orange
	vec3(1.0, 0.9, 0.2),   // Middle — yellow
	vec3(0.2, 1.0, 0.5),   // Ring — green
	vec3(0.3, 0.6, 1.0)    // Pinky — blue
);
`;

export async function init({ mount }: ExampleContext) {
	const trailsFragmentShaderSrc = `#version 300 es
precision mediump float;
in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_webcam;
#define HISTORY_FRAMES ${N_HISTORY_FRAMES}
${SHARED_GLSL}
bool isRaised(int hand, int finger, int framesAgo) {
	if (nHandsAt(framesAgo) <= hand) return false;
	vec2 thumb = vec2(handLandmark(hand, THUMB_TIP, framesAgo));
	vec2 tip = vec2(handLandmark(hand, FINGER_TIPS[finger], framesAgo));
	return distance(tip, thumb) > 0.08;
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
	vec3 color = vec3(0.0);
	float alpha = 0.0;

	for (int hand = 0; hand < u_nHands; ++hand) {
		for (int finger = 0; finger < N_FINGERS; ++finger) {
			if (!isRaised(hand, finger, 0)) continue;

			vec2 prev = vec2(-1.0);
			for (int i = HISTORY_FRAMES - 1; i >= 0; --i) {
				if (!isRaised(hand, finger, i)) {
					prev = vec2(-1.0);
					continue;
				}

				vec2 pos = vec2(handLandmark(hand, FINGER_TIPS[finger], i));
				if (prev.x >= 0.0) {
					float age = float(i) / float(HISTORY_FRAMES);
					float radius = mix(TRAIL_RADIUS_START, TRAIL_RADIUS_END, age);
					float edge = max(0.001, radius * 0.22);
					float line = smoothstep(radius + edge, max(radius - edge, 0.0), distToSegment(uv, prev, pos));
					color = mix(color, FINGER_COLORS[finger], line);
					alpha = max(alpha, line);
				}
				prev = pos;
			}
		}
	}

	outColor = vec4(color, alpha);
}`;

	const fragmentShaderSrc = `#version 300 es
precision mediump float;
in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_webcam;
uniform sampler2D u_trails;
${SHARED_GLSL}

void main() {
	vec2 uv = fitCover(vec2(1.0 - v_uv.x, v_uv.y), vec2(textureSize(u_webcam, 0)));
	vec3 color = texture(u_webcam, uv).rgb;

	vec4 trails = texture(u_trails, v_uv);
	color = mix(color, trails.rgb, trails.a);

	for (int hand = 0; hand < u_nHands; ++hand) {
		for (int finger = 0; finger < N_FINGERS; ++finger) {
			vec2 tip = vec2(handLandmark(hand, FINGER_TIPS[finger]));
			float edge = max(0.001, TRAIL_RADIUS_START * 0.22);
			float dot = smoothstep(TRAIL_RADIUS_START + edge, max(TRAIL_RADIUS_START - edge, 0.0), distance(uv, tip));
			color = mix(color, FINGER_COLORS[finger], dot);
		}
	}

	outColor = vec4(color, 1.0);
}`;

	video = await getWebcamVideo({ width: { ideal: 1280 }, height: { ideal: 720 } });
	canvas = createFullscreenCanvas(mount);
	trailsShader = new ShaderPad(trailsFragmentShaderSrc, {
		canvas,
		plugins: [
			autosize(),
			helpers(),
			hands({
				textureName: 'u_webcam',
				options: { maxHands: 1, history: N_HISTORY_FRAMES },
			}),
		],
	});
	outputShader = new ShaderPad(fragmentShaderSrc, {
		canvas,
		plugins: [autosize(), helpers(), hands({ textureName: 'u_webcam', options: { maxHands: 1 } })],
	});
	trailsShader.initializeTexture('u_webcam', video);
	outputShader.initializeTexture('u_webcam', video);
	outputShader.initializeTexture('u_trails', trailsShader);
	outputShader.play((_time, frame) => {
		const updates: Record<string, TextureSource> = { u_webcam: video! };
		if (frame % 3 === 0) {
			trailsShader!.updateTextures(updates);
			trailsShader!.step();
			updates.u_trails = trailsShader!;
		}
		outputShader!.updateTextures(updates);
	});
}

export function destroy() {
	if (trailsShader) {
		trailsShader.destroy();
		trailsShader = null;
	}

	if (outputShader) {
		outputShader.destroy();
		outputShader = null;
	}

	if (video) {
		stopVideoStream(video);
		video = null;
	}

	if (canvas) {
		canvas.remove();
		canvas = null;
	}
}
