/**
 * Pose detection visualization using pose plugin. Shows landmarks and
 * body segmentation mask with color-coded regions.
 */
import ShaderPad from 'shaderpad';
import helpers from 'shaderpad/plugins/helpers';
import pose from 'shaderpad/plugins/pose';
import { createFullscreenCanvas } from 'shaderpad/util';

import { getWebcamVideo, stopVideoStream } from '@/examples/demo-utils';
import type { ExampleContext } from '@/examples/runtime';

export async function init({ mount }: ExampleContext) {
	const fragmentShaderSrc = `#version 300 es
precision mediump float;

in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_webcam;

void main() {
	vec2 webcamUV = fitCover(vec2(1.0 - v_uv.x, v_uv.y), vec2(textureSize(u_webcam, 0)));
	vec4 webcamColor = texture(u_webcam, webcamUV);
	vec3 color = webcamColor.rgb;

	for (int i = 0; i < u_nPoses; ++i) {
		vec2 pose = poseAt(webcamUV);
		vec3 poseColor = vec3(float(i % 3 == 0), float(i % 3 == 1), float(i % 3 == 2));
		if (int(pose.y) == i) {
			color = mix(color, poseColor, pose.x * 0.3);
		}
	}

	for (int i = 0; i < u_nPoses; ++i) {
		// Draw tiny red dots on all pose landmarks.
		for (int j = 0; j < 39; ++j) {
			vec2 landmarkPos = vec2(poseLandmark(i, j));
			float landmarkDist = distance(webcamUV, landmarkPos);
			float landmarkDot = (1.0 - smoothstep(0.0, 0.005, landmarkDist));
			color = mix(color, vec3(1.0, 0.0, 0.0), landmarkDot);
		}
	}

	// Display mask in bottom-right corner as debug overlay.
	vec2 previewMin = vec2(0.67, 0.03);
	vec2 previewMax = vec2(0.97, 0.33);
	vec2 previewUV = (v_uv - previewMin) / (previewMax - previewMin);
	if (previewUV.x >= 0.0 && previewUV.x <= 1.0 && previewUV.y >= 0.0 && previewUV.y <= 1.0) {
		vec2 previewWebcamUV = fitCover(vec2(1.0 - previewUV.x, previewUV.y), vec2(textureSize(u_webcam, 0)));
		vec4 debugMask = texture(u_poseMask, previewWebcamUV);
		vec3 maskVis = debugMask.rgb;
		color = mix(color, maskVis, 0.9);
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
			pose({
				textureName: 'u_webcam',
				options: { maxPoses: 2 },
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
