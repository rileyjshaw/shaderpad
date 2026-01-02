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
	vec4 mask = texture(u_faceMask, v_uv);
	vec3 color = webcamColor.rgb;

	float mouthMask = mask.r;
	float faceMask = mask.g;
	float eyeMask = mask.b;

	float faceTesselation = step(faceMask, 0.5) * step(0.1, faceMask);
	float faceContour = step(0.5, faceMask);
	color = mix(color, vec3(0.0, 1.0, 0.0), faceTesselation * 0.3);
	color = mix(color, vec3(0.0, 1.0, 0.0), faceContour * 0.5);

	if (eyeMask > 0.0) {
		vec3 eyeColor = vec3(0.0);
		if (eyeMask < 0.25) {
			eyeColor = vec3(0.5, 0.0, 0.5); // Left eyebrow.
		} else if (eyeMask < 0.5) {
			eyeColor = vec3(1.0, 0.5, 0.0);  // Right eyebrow.
		} else if (eyeMask < 0.75) {
			eyeColor = vec3(1.0, 0.0, 0.0);  // Left eye.
		} else {
			eyeColor = vec3(0.0, 0.0, 1.0);  // Right eye.
		}
		color = mix(color, eyeColor, smoothstep(0.0, 0.1, eyeMask) * 0.7);
	}

	if (mouthMask > 0.0) {
		if (mouthMask < 0.5) {
			color = mix(color, vec3(1.0, 0.0, 0.0), 0.6);
		} else {
			color = mix(color, vec3(0.5, 0.0, 0.0), 0.8);
		}
	}

	for (int i = 0; i < u_nFaces; ++i) {
		// Draw nose tip dot.
		float noseTipDist = distance(v_uv, u_noseTip[i]);
		float noseTipDot = 1.0 - smoothstep(0.0, 0.01, noseTipDist);
		color = mix(color, vec3(0.0, 1.0, 0.0), noseTipDot);

		// Draw face center dot.
		float faceCenterDist = distance(v_uv, u_faceCenter[i]);
		float faceCenterDot = 1.0 - smoothstep(0.0, 0.01, faceCenterDist);
		color = mix(color, vec3(1.0, 1.0, 1.0), faceCenterDot);

		// Draw eye center dots.
		float leftEyeCenterDist = distance(v_uv, u_leftEye[i]);
		float rightEyeCenterDist = distance(v_uv, u_rightEye[i]);
		float leftEyeCenterDot = 1.0 - smoothstep(0.0, 0.01, leftEyeCenterDist);
		float rightEyeCenterDot = 1.0 - smoothstep(0.0, 0.01, rightEyeCenterDist);
		color = mix(color, vec3(0.0, 0.0, 1.0), leftEyeCenterDot);
		color = mix(color, vec3(1.0, 0.0, 0.0), rightEyeCenterDot);
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
