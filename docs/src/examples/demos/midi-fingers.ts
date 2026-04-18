/**
 * Hand detection visualization using hands plugin. Shows glowing lines connecting
 * each finger tip to thumb.
 */
import ShaderPad from 'shaderpad';
import autosize from 'shaderpad/plugins/autosize';
import hands from 'shaderpad/plugins/hands';
import helpers from 'shaderpad/plugins/helpers';
import { createFullscreenCanvas } from 'shaderpad/util';

import { getWebcamVideo, stopVideoStream } from '@/examples/demo-utils';
import type { ExampleContext } from '@/examples/runtime';

const THUMB_TIP = 4;
const INDEX_TIP = 8;
const MIDDLE_TIP = 12;
const RING_TIP = 16;
const PINKY_TIP = 20;

// [finger tip landmark index, CC number] per hand. Distance = finger–thumb.
const MIDI_CC_BY_HAND: Record<string, [number, number][]> = {
	Left: [
		[INDEX_TIP, 22],
		[MIDDLE_TIP, 23],
		[RING_TIP, 24],
		[PINKY_TIP, 25],
	],
	Right: [
		[INDEX_TIP, 26],
		[MIDDLE_TIP, 27],
		[RING_TIP, 28],
		[PINKY_TIP, 29],
	],
};

// In normalized coords (height = 1): below 1/8 height → 0, at 1/2 height → 127
const MIN_DISTANCE = 1 / 8;
const MAX_DISTANCE = 1 / 2;

function distance(a: { x: number; y: number; z?: number }, b: { x: number; y: number; z?: number }): number {
	const dx = a.x - b.x;
	const dy = a.y - b.y;
	const dz = (a.z ?? 0) - (b.z ?? 0);
	return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function distanceToMidiValue(d: number): number {
	if (d <= MIN_DISTANCE) return 0;
	const t = (d - MIN_DISTANCE) / (MAX_DISTANCE - MIN_DISTANCE);
	return Math.min(127, Math.round(t * 127));
}

async function getMidiOutput(): Promise<MIDIOutput | null> {
	if (!navigator.requestMIDIAccess) return null;
	const access = await navigator.requestMIDIAccess({ sysex: false });
	const outputs = access.outputs;
	if (outputs.size === 0) return null;
	return outputs.values().next().value ?? null;
}

let shader: ShaderPad | null = null;
let video: HTMLVideoElement | null = null;
let outputCanvas: HTMLCanvasElement | null = null;
let midiOutput: MIDIOutput | null = null;
let handsResultUnsubscribe: (() => void) | null = null;

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
		vec4 webcamColor = texture(u_webcam, uv);
		vec3 lineColor = vec3(0.0, 0.0, 0.0);
		float lineIntensity = 0.0;

		float endpointRadiusPx = 16.0;
		float sharpness = 1.5;

		for (int i = 0; i < u_nHands; ++i) {
			vec2 thumb = vec2(handLandmark(i, THUMB_TIP));
			vec2 index = vec2(handLandmark(i, INDEX_TIP));
			vec2 middle = vec2(handLandmark(i, MIDDLE_TIP));
			vec2 ring = vec2(handLandmark(i, RING_TIP));
			vec2 pinky = vec2(handLandmark(i, PINKY_TIP));

			float indexIntensity = renderGlowingSegmentExpWidth(uv, index, thumb, endpointRadiusPx, sharpness);
			lineIntensity += indexIntensity;
			lineColor += indexIntensity * vec3(1.0, 0.0, 0.0);

			float middleIntensity = renderGlowingSegmentExpWidth(uv, middle, thumb, endpointRadiusPx, sharpness);
			lineIntensity += middleIntensity;
			lineColor += middleIntensity * vec3(0.0, 1.0, 0.0);

			float ringIntensity = renderGlowingSegmentExpWidth(uv, ring, thumb, endpointRadiusPx, sharpness);
			lineIntensity += ringIntensity;
			lineColor += ringIntensity * vec3(0.0, 0.5, 1.0);

			float pinkyIntensity = renderGlowingSegmentExpWidth(uv, pinky, thumb, endpointRadiusPx, sharpness);
			lineIntensity += pinkyIntensity;
			lineColor += pinkyIntensity * vec3(1.0, 0.5, 0.0);
		}

		vec3 core = lineColor * lineColor;
		lineColor += core * 0.3;

		lineColor = lineColor / (1.0 + lineColor);
		lineColor = pow(lineColor, vec3(0.4545));

		outColor = vec4(mix(webcamColor.rgb + lineColor, lineColor, clamp(lineIntensity, 0.0, 1.0)), 1.0);
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

	midiOutput = await getMidiOutput();

	const onHandsResult = (
		result: {
			landmarks?: { x: number; y: number; z?: number }[][];
			handedness?: { categoryName: string }[][];
		} | null,
	) => {
		if (!midiOutput || !result?.landmarks?.length) return;
		const channel = 0;
		for (let i = 0; i < result.landmarks!.length; i++) {
			const hand = result.landmarks![i];
			const side = result.handedness?.[i]?.[0]?.categoryName;
			const bands = side ? MIDI_CC_BY_HAND[side] : null;
			if (!hand || !bands) continue;
			const thumb = hand[THUMB_TIP];
			if (!thumb) continue;
			for (const [fingerTip, cc] of bands) {
				const finger = hand[fingerTip];
				if (finger) midiOutput.send([0xb0 + channel, cc, distanceToMidiValue(distance(finger, thumb))]);
			}
		}
	};

	shader.on('hands:result', onHandsResult);
	handsResultUnsubscribe = () => shader!.off('hands:result', onHandsResult);

	shader.initializeTexture('u_webcam', video);
	shader.play(() => {
		shader!.updateTextures({ u_webcam: video! });
	});
}

export function destroy() {
	handsResultUnsubscribe?.();
	handsResultUnsubscribe = null;
	midiOutput = null;

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
