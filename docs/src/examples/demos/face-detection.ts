/**
 * Face detection visualization using face plugin. Shows landmarks, mesh, and
 * region masks over a fullscreen mirrored webcam feed.
 */
import ShaderPad from 'shaderpad';
import face from 'shaderpad/plugins/face';
import helpers from 'shaderpad/plugins/helpers';
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

void main() {
	vec2 webcamUV = fitCover(vec2(1.0 - v_uv.x, v_uv.y), vec2(textureSize(u_webcam, 0)));
	vec4 webcamColor = texture(u_webcam, webcamUV);
	vec3 color = webcamColor.rgb;

	// Draw face and oval regions.
	vec2 faceHit = faceAt(webcamUV);
	vec2 faceOval = faceOvalAt(webcamUV);
	color = mix(color, vec3(0.0, 1.0, 0.0), faceHit.x * 0.5 + faceOval.x * 0.2);

	// Draw eyebrows.
	vec2 leftEyebrow = leftEyebrowAt(webcamUV);
	vec2 rightEyebrow = rightEyebrowAt(webcamUV);
	color = mix(color, vec3(0.5, 0.0, 0.5), leftEyebrow.x * 0.7);
	color = mix(color, vec3(1.0, 0.5, 0.0), rightEyebrow.x * 0.7);

	// Draw eyes.
	vec2 leftEye = leftEyeAt(webcamUV);
	vec2 rightEye = rightEyeAt(webcamUV);
	color = mix(color, vec3(1.0, 0.0, 0.0), leftEye.x * 0.7);
	color = mix(color, vec3(0.0, 0.0, 1.0), rightEye.x * 0.7);

	// Draw mouth.
	vec2 mouth = mouthAt(webcamUV);
	vec2 innerMouth = innerMouthAt(webcamUV);
	color = mix(color, vec3(1.0, 0.0, 0.0), mouth.x * 0.6);
	color = mix(color, vec3(0.5, 0.0, 0.0), innerMouth.x * 0.8);

	for (int i = 0; i < u_nFaces; ++i) {
		// Draw tiny red dots on all face landmarks.
		for (int j = 0; j < 478; ++j) {
			vec2 landmarkPos = vec2(faceLandmark(i, j));
			float landmarkDist = distance(webcamUV, landmarkPos);
			float landmarkDot = 1.0 - smoothstep(0.0, 0.005, landmarkDist);
			color = mix(color, vec3(1.0, 0.0, 0.0), landmarkDot);
		}

		// Draw nose tip dot.
		vec2 noseTipPos = vec2(faceLandmark(i, FACE_LANDMARK_NOSE_TIP));
		float noseTipDist = distance(webcamUV, noseTipPos);
		float noseTipDot = 1.0 - smoothstep(0.0, 0.01, noseTipDist);
		color = mix(color, vec3(0.0, 1.0, 0.0), noseTipDot);

		// Draw face center dot.
		vec2 faceCenterPos = vec2(faceLandmark(i, FACE_LANDMARK_FACE_CENTER));
		float faceCenterDist = distance(webcamUV, faceCenterPos);
		float faceCenterDot = 1.0 - smoothstep(0.0, 0.01, faceCenterDist);
		color = mix(color, vec3(1.0, 1.0, 1.0), faceCenterDot);

		// Draw eye center dots.
		vec2 leftEyePos = vec2(faceLandmark(i, FACE_LANDMARK_L_EYE_CENTER));
		vec2 rightEyePos = vec2(faceLandmark(i, FACE_LANDMARK_R_EYE_CENTER));
		float leftEyeCenterDist = distance(webcamUV, leftEyePos);
		float rightEyeCenterDist = distance(webcamUV, rightEyePos);
		float leftEyeCenterDot = 1.0 - smoothstep(0.0, 0.01, leftEyeCenterDist);
		float rightEyeCenterDot = 1.0 - smoothstep(0.0, 0.01, rightEyeCenterDist);
		color = mix(color, vec3(0.0, 0.0, 1.0), leftEyeCenterDot);
		color = mix(color, vec3(1.0, 0.0, 0.0), rightEyeCenterDot);

		// Draw mouth center dot.
		vec2 mouthPos = vec2(faceLandmark(i, FACE_LANDMARK_MOUTH_CENTER));
		float mouthCenterDist = distance(webcamUV, mouthPos);
		float mouthCenterDot = 1.0 - smoothstep(0.0, 0.01, mouthCenterDist);
		color = mix(color, vec3(1.0, 1.0, 0.0), mouthCenterDot);
	}

	// Display mask in bottom-right corner as debug overlay.
	vec2 previewMin = vec2(0.67, 0.03);
	vec2 previewMax = vec2(0.97, 0.33);
	vec2 previewUV = (v_uv - previewMin) / (previewMax - previewMin);
	if (previewUV.x >= 0.0 && previewUV.x <= 1.0 && previewUV.y >= 0.0 && previewUV.y <= 1.0) {
		vec2 previewWebcamUV = fitCover(vec2(1.0 - previewUV.x, previewUV.y), vec2(textureSize(u_webcam, 0)));
		vec4 debugMask = texture(u_faceMask, previewWebcamUV);
		color = mix(color, debugMask.rgb, 0.9);
		float border = 1.0 - smoothstep(0.0, 0.01, min(min(previewUV.x, 1.0 - previewUV.x), min(previewUV.y, 1.0 - previewUV.y)));
		color = mix(color, vec3(1.0, 1.0, 1.0), border * 0.8);
	}

	outColor = vec4(color, 1.0);
}`;

	video = await getWebcamVideo({
		width: { ideal: 1280 },
		height: { ideal: 720 },
		facingMode: 'user',
	});
	outputCanvas = createFullscreenCanvas(mount);
	outputCanvas.width = video.videoWidth;
	outputCanvas.height = video.videoHeight;
	outputCanvas.style.objectFit = 'cover';

	shader = new ShaderPad(fragmentShaderSrc, {
		canvas: outputCanvas,
		plugins: [
			helpers(),
			face({
				textureName: 'u_webcam',
				options: { maxFaces: 3 },
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
