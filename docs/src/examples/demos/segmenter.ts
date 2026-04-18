/**
 * Image segmentation using segmenter plugin. Detects and highlights
 * objects in webcam feed with mask overlay.
 */
import ShaderPad from 'shaderpad';
import helpers from 'shaderpad/plugins/helpers';
import segmenter from 'shaderpad/plugins/segmenter';
import { createFullscreenCanvas } from 'shaderpad/util';

import { getWebcamVideo, stopVideoStream } from '@/examples/demo-utils';
import type { ExampleContext } from '@/examples/runtime';

export async function init({ mount }: ExampleContext) {
	const fragmentShaderSrc = `#version 300 es
precision mediump float;

in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_webcam;

vec3 palette(float t) {
	return 0.55 + 0.45 * cos(6.28318 * (vec3(0.08, 0.36, 0.67) + t));
}

void main() {
	vec2 webcamUV = fitCover(vec2(1.0 - v_uv.x, v_uv.y), vec2(textureSize(u_webcam, 0)));
	vec4 webcamColor = texture(u_webcam, webcamUV);
	vec3 color = webcamColor.rgb;

	vec2 segment = segmentAt(webcamUV);
	float confidence = segment.x;
	int category = int(floor(segment.y * float(u_numCategories - 1) + 0.5));
	float isForeground = float(category != 0) * confidence;
	vec3 segmentColor = palette(segment.y);
	color = mix(color, segmentColor, isForeground * 0.45);

	float edge = 0.0;
	vec2 pixel = vec2(1.0) / vec2(textureSize(u_webcam, 0));
	edge += abs(confidence - segmentAt(webcamUV + vec2(pixel.x, 0.0)).x);
	edge += abs(confidence - segmentAt(webcamUV + vec2(0.0, pixel.y)).x);
	color = mix(color, vec3(1.0), smoothstep(0.1, 0.3, edge) * 0.55);

	// Display mask in bottom-right corner as debug overlay.
	vec2 previewMin = vec2(0.67, 0.03);
	vec2 previewMax = vec2(0.97, 0.33);
	vec2 previewUV = (v_uv - previewMin) / (previewMax - previewMin);
	if (previewUV.x >= 0.0 && previewUV.x <= 1.0 && previewUV.y >= 0.0 && previewUV.y <= 1.0) {
		vec2 previewWebcamUV = fitCover(vec2(1.0 - previewUV.x, previewUV.y), vec2(textureSize(u_webcam, 0)));
		vec4 debugMask = texture(u_segmentMask, previewWebcamUV);
		color = mix(color, debugMask.rgb, 0.9);
		float border = 1.0 - smoothstep(0.0, 0.01, min(min(previewUV.x, 1.0 - previewUV.x), min(previewUV.y, 1.0 - previewUV.y)));
		color = mix(color, vec3(1.0, 1.0, 1.0), border * 0.8);
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
			segmenter({
				textureName: 'u_webcam',
				options: {
					modelPath:
						'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite',
					outputConfidenceMasks: true,
				},
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
