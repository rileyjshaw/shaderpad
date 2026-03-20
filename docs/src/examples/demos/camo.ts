/**
 * Combined face/body camouflage demo with a UI toggle. Uses both MediaPipe
 * plugins up front and switches the tracked region in one shader.
 */
import ShaderPad from 'shaderpad';
import face from 'shaderpad/plugins/face';
import helpers from 'shaderpad/plugins/helpers';
import pose from 'shaderpad/plugins/pose';
import { createFullscreenCanvas } from 'shaderpad/util';

import { getWebcamVideo, stopVideoStream } from '@/examples/demo-utils';
import type { ExampleContext } from '@/examples/runtime';

const MODE_FACE = 0;
const MODE_BODY = 1;

let shader: ShaderPad | null = null;
let video: HTMLVideoElement | null = null;
let outputCanvas: HTMLCanvasElement | null = null;
let controls: HTMLDivElement | null = null;
let faceButton: HTMLButtonElement | null = null;
let bodyButton: HTMLButtonElement | null = null;

function updateButtonStyles(mode: number) {
	if (!faceButton || !bodyButton) return;

	const activeStyle = 'rgba(255, 255, 255, 0.95)';
	const inactiveStyle = 'rgba(255, 255, 255, 0.16)';
	const activeColor = '#0f172a';
	const inactiveColor = 'rgba(255, 255, 255, 0.88)';

	faceButton.style.background = mode === MODE_FACE ? activeStyle : inactiveStyle;
	faceButton.style.color = mode === MODE_FACE ? activeColor : inactiveColor;
	faceButton.setAttribute('aria-pressed', String(mode === MODE_FACE));

	bodyButton.style.background = mode === MODE_BODY ? activeStyle : inactiveStyle;
	bodyButton.style.color = mode === MODE_BODY ? activeColor : inactiveColor;
	bodyButton.setAttribute('aria-pressed', String(mode === MODE_BODY));
}

function setMode(mode: number) {
	shader?.updateUniforms({ u_mode: mode });
	updateButtonStyles(mode);
}

function createModeButton(label: string) {
	const button = document.createElement('button');
	button.type = 'button';
	button.textContent = label;
	button.style.border = '0';
	button.style.borderRadius = '999px';
	button.style.padding = '10px 16px';
	button.style.font = '600 14px/1.2 system-ui, sans-serif';
	button.style.cursor = 'pointer';
	button.style.transition = 'background 160ms ease, color 160ms ease';
	return button;
}

export async function init({ mount, overlay }: ExampleContext) {
	const fragmentShaderSrc = `#version 300 es
precision mediump float;

in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_webcam;
uniform highp sampler2DArray u_history;
uniform int u_historyFrameOffset;
uniform int u_mode;

vec3 applyFaceCamo(vec2 uv, vec3 color, vec2 pixel) {
	float closestCenter = 2.0;

	for (int i = 0; i < u_nFaces; ++i) {
		vec2 faceCenterPos = vec2(faceLandmark(i, FACE_LANDMARK_FACE_CENTER));
		vec2 dir = uv - faceCenterPos;
		float lenDir = length(dir);
		if (lenDir >= closestCenter) continue;

		closestCenter = lenDir;
		if (lenDir < 1e-5) {
			dir = vec2(0.0, 1.0);
		} else {
			dir /= lenDir;
		}

		vec2 uvNearerFaceCenter = uv - dir * 80.0 * pixel;
		float faceConfidence = inFace(uv) + inFace(uvNearerFaceCenter);
		if (faceConfidence > 0.0) {
			vec2 target = uv + dir * (20.0 * pixel);
			float z = historyZ(u_history, u_historyFrameOffset, 1);
			color = texture(u_history, vec3(target, z)).rgb;
		}
	}

	return color;
}

vec3 applyBodyCamo(vec2 uv, vec3 color, vec2 pixel) {
	float closestCenter = 2.0;

	for (int i = 0; i < u_nPoses; ++i) {
		vec2 dir = uv - vec2(poseLandmark(i, POSE_LANDMARK_BODY_CENTER));
		float lenDir = length(dir);
		if (lenDir >= closestCenter) continue;

		closestCenter = lenDir;
		if (lenDir < 1e-5) {
			dir = vec2(0.0, 1.0);
		} else {
			dir /= lenDir;
		}

		vec2 uvNearerPoseCenter = uv - dir * 80.0 * pixel;
		vec2 pose = poseAt(uv);
		vec2 nearerPose = poseAt(uvNearerPoseCenter);
		if ((pose.x > 0.0 && int(pose.y) == i) || (nearerPose.x > 0.0 && int(nearerPose.y) == i)) {
			vec2 target = uv + dir * (20.0 * pixel);
			float z = historyZ(u_history, u_historyFrameOffset, 1);
			color = texture(u_history, vec3(target, z)).rgb;
		}
	}

	return color;
}

void main() {
	vec2 uv = v_uv;
	vec2 pixel = vec2(1.0) / vec2(textureSize(u_webcam, 0));
	vec3 color = texture(u_webcam, uv).rgb;

	if (u_mode == ${MODE_FACE}) {
		color = applyFaceCamo(uv, color, pixel);
	} else {
		color = applyBodyCamo(uv, color, pixel);
	}

	outColor = vec4(color, 1.0);
}`;

	video = await getWebcamVideo();

	outputCanvas = createFullscreenCanvas(mount);
	outputCanvas.width = video.videoWidth;
	outputCanvas.height = video.videoHeight;
	outputCanvas.style.objectFit = 'cover';

	controls = document.createElement('div');
	controls.style.position = 'fixed';
	controls.style.top = '20px';
	controls.style.left = '50%';
	controls.style.transform = 'translateX(-50%)';
	controls.style.display = 'flex';
	controls.style.gap = '8px';
	controls.style.padding = '8px';
	controls.style.borderRadius = '999px';
	controls.style.background = 'rgba(15, 23, 42, 0.55)';
	controls.style.backdropFilter = 'blur(10px)';
	controls.style.pointerEvents = 'auto';
	controls.style.zIndex = '1000';

	faceButton = createModeButton('Face');
	bodyButton = createModeButton('Body');
	faceButton.addEventListener('click', () => setMode(MODE_FACE));
	bodyButton.addEventListener('click', () => setMode(MODE_BODY));
	controls.appendChild(faceButton);
	controls.appendChild(bodyButton);
	overlay.appendChild(controls);

	shader = new ShaderPad(fragmentShaderSrc, {
		canvas: outputCanvas,
		history: 1,
		plugins: [
			helpers(),
			face({
				textureName: 'u_webcam',
				options: { maxFaces: 3 },
			}),
			pose({
				textureName: 'u_webcam',
				options: { maxPoses: 2 },
			}),
		],
	});

	shader.initializeUniform('u_mode', 'int', MODE_FACE);
	shader.initializeTexture('u_webcam', video);
	updateButtonStyles(MODE_FACE);

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

	if (controls) {
		controls.remove();
		controls = null;
	}

	faceButton = null;
	bodyButton = null;
}
