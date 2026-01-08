import ShaderPad from 'shaderpad';
import face from 'shaderpad/plugins/face';

async function getWebcamStream(facingMode: string, container: HTMLDivElement): Promise<HTMLVideoElement> {
	const video = document.createElement('video');
	video.autoplay = video.playsInline = true;

	try {
		const stream = await navigator.mediaDevices.getUserMedia({
			video: { facingMode },
		});
		video.srcObject = stream;
		await new Promise(resolve => (video.onloadedmetadata = resolve));
		container.appendChild(video);
	} catch (error) {
		console.error('Error accessing webcam:', error);
		throw error;
	}

	return video;
}

let shader: ShaderPad | null = null;
let video: HTMLVideoElement | null = null;
let outputCanvas: HTMLCanvasElement | null = null;
let container: HTMLDivElement | null = null;
let currentFacingMode = 'user';

export async function init() {
	const fragmentShaderSrc = `#version 300 es
precision mediump float;

in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_webcam;

void main() {
	vec4 webcamColor = texture(u_webcam, v_uv);
	vec3 color = webcamColor.rgb;

	// Draw face mesh and oval regions.
	vec2 faceMesh = faceAt(v_uv);
	vec2 faceOval = faceOvalAt(v_uv);
	color = mix(color, vec3(0.0, 1.0, 0.0), faceMesh.x * 0.5);
	color = mix(color, vec3(0.0, 1.0, 0.0), faceOval.x * 0.2);

	// Draw eyebrows.
	vec2 leftEyebrow = leftEyebrowAt(v_uv);
	vec2 rightEyebrow = rightEyebrowAt(v_uv);
	color = mix(color, vec3(0.5, 0.0, 0.5), leftEyebrow.x * 0.7);
	color = mix(color, vec3(1.0, 0.5, 0.0), rightEyebrow.x * 0.7);

	// Draw eyes.
	vec2 leftEye = leftEyeAt(v_uv);
	vec2 rightEye = rightEyeAt(v_uv);
	color = mix(color, vec3(1.0, 0.0, 0.0), leftEye.x * 0.7);
	color = mix(color, vec3(0.0, 0.0, 1.0), rightEye.x * 0.7);

	// Draw mouth.
	vec2 outerMouth = outerMouthAt(v_uv);
	vec2 innerMouth = innerMouthAt(v_uv);
	color = mix(color, vec3(1.0, 0.0, 0.0), outerMouth.x * 0.6);
	color = mix(color, vec3(0.5, 0.0, 0.0), innerMouth.x * 0.8);

	for (int i = 0; i < u_nFaces; ++i) {
		// Draw tiny red dots on all face landmarks.
		for (int j = 0; j < 478; ++j) {
			vec2 landmarkPos = vec2(faceLandmark(i, j));
			float landmarkDist = distance(v_uv, landmarkPos);
			float landmarkDot = (1.0 - smoothstep(0.0, 0.005, landmarkDist));
			color = mix(color, vec3(1.0, 0.0, 0.0), landmarkDot);
		}

		// Draw nose tip dot.
		vec2 noseTipPos = vec2(faceLandmark(i, FACE_LANDMARK_NOSE_TIP));
		float noseTipDist = distance(v_uv, noseTipPos);
		float noseTipDot = 1.0 - smoothstep(0.0, 0.01, noseTipDist);
		color = mix(color, vec3(0.0, 1.0, 0.0), noseTipDot);

		// Draw face center dot.
		vec2 faceCenterPos = vec2(faceLandmark(i, FACE_LANDMARK_FACE_CENTER));
		float faceCenterDist = distance(v_uv, faceCenterPos);
		float faceCenterDot = 1.0 - smoothstep(0.0, 0.01, faceCenterDist);
		color = mix(color, vec3(1.0, 1.0, 1.0), faceCenterDot);

		// Draw eye center dots.
		vec2 leftEyePos = vec2(faceLandmark(i, FACE_LANDMARK_L_EYE_CENTER));
		vec2 rightEyePos = vec2(faceLandmark(i, FACE_LANDMARK_R_EYE_CENTER));
		float leftEyeCenterDist = distance(v_uv, leftEyePos);
		float rightEyeCenterDist = distance(v_uv, rightEyePos);
		float leftEyeCenterDot = 1.0 - smoothstep(0.0, 0.01, leftEyeCenterDist);
		float rightEyeCenterDot = 1.0 - smoothstep(0.0, 0.01, rightEyeCenterDist);
		color = mix(color, vec3(0.0, 0.0, 1.0), leftEyeCenterDot);
		color = mix(color, vec3(1.0, 0.0, 0.0), rightEyeCenterDot);

		// Draw mouth center dot.
		vec2 mouthPos = vec2(faceLandmark(i, FACE_LANDMARK_MOUTH_CENTER));
		float mouthCenterDist = distance(v_uv, mouthPos);
		float mouthCenterDot = 1.0 - smoothstep(0.0, 0.01, mouthCenterDist);
		color = mix(color, vec3(1.0, 1.0, 0.0), mouthCenterDot);
	}

	// Display mask in bottom-right corner as debug overlay.
	vec2 maskPreviewUV = (v_uv - vec2(0.65, 0.0)) * vec2(2.86, 2.86);
	if (maskPreviewUV.x >= 0.0 && maskPreviewUV.x <= 1.0 && maskPreviewUV.y >= 0.0 && maskPreviewUV.y <= 1.0) {
		vec4 debugMask = texture(u_faceMask, maskPreviewUV);
		// Show mask as RGB visualization.
		vec3 maskVis = debugMask.rgb;
		color = mix(color, maskVis, 0.9);
		// Add white border.
		float border = 1.0 - smoothstep(0.0, 0.01, min(min(maskPreviewUV.x, 1.0 - maskPreviewUV.x), min(maskPreviewUV.y, 1.0 - maskPreviewUV.y)));
		color = mix(color, vec3(1.0, 1.0, 1.0), border * 0.8);
	}

	outColor = vec4(color, 1.0);
}`;

	container = document.createElement('div');
	container.className = 'canvas-container';
	document.body.appendChild(container);

	video = await getWebcamStream(currentFacingMode, container);

	outputCanvas = document.createElement('canvas');
	outputCanvas.width = video.videoWidth;
	outputCanvas.height = video.videoHeight;
	container.appendChild(outputCanvas);

	shader = new ShaderPad(fragmentShaderSrc, {
		canvas: outputCanvas,
		plugins: [
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

	// Double-tap to switch camera
	let lastTapTime = 0;
	let tapCount = 0;
	let touchStartTime = 0;

	const handleTouchStart = (e: TouchEvent) => {
		if (e.touches.length === 1) {
			const now = Date.now();
			touchStartTime = now;
		}
	};

	const handleTouchEnd = (e: TouchEvent) => {
		// Only handle if it's a single touch that ended quickly (tap, not drag)
		if (e.changedTouches.length === 1 && e.touches.length === 0) {
			const now = Date.now();
			const touchDuration = now - touchStartTime;

			// Only count as tap if it was quick (< 300ms)
			if (touchDuration < 300) {
				// Reset if too much time passed since last tap
				if (now - lastTapTime > 300) {
					tapCount = 1;
				} else {
					tapCount++;
				}

				lastTapTime = now;

				if (tapCount === 2) {
					tapCount = 0;
					switchCamera();
				}
			}
		}
	};

	document.body.addEventListener('touchstart', handleTouchStart, { passive: true });
	document.body.addEventListener('touchend', handleTouchEnd, { passive: true });
}

async function switchCamera() {
	if (!video || !shader) return;

	// Stop old stream
	if (video.srcObject) {
		(video.srcObject as MediaStream).getTracks().forEach(track => track.stop());
	}

	const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
	try {
		const stream = await navigator.mediaDevices.getUserMedia({
			video: { facingMode: newFacingMode },
		});
		video.srcObject = stream;
		await new Promise(resolve => {
			if (video) {
				video.onloadedmetadata = resolve;
			}
		});
		if (video.parentElement !== container) {
			container!.appendChild(video);
		}
		shader.updateTextures({ u_webcam: video });
		currentFacingMode = newFacingMode;
	} catch (error) {
		console.error('Failed to switch camera:', error);
	}
}

export function destroy() {
	if (shader) {
		shader.destroy();
		shader = null;
	}

	if (video) {
		if (video.srcObject) {
			(video.srcObject as MediaStream).getTracks().forEach(track => track.stop());
		}
		video.srcObject = null;
		video.remove();
		video = null;
	}

	if (container) {
		container.remove();
		container = null;
		outputCanvas = null;
	}
}
