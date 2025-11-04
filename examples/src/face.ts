import ShaderPad, { face } from 'shaderpad';

async function getWebcamStream(): Promise<HTMLVideoElement> {
	const video = document.createElement('video');
	video.autoplay = video.playsInline = true;

	try {
		const stream = await navigator.mediaDevices.getUserMedia({ video: true });
		video.srcObject = stream;
		await new Promise(resolve => (video.onloadedmetadata = resolve));
		document.body.appendChild(video);
	} catch (error) {
		console.error('Error accessing webcam:', error);
		throw error;
	}

	return video;
}

let shader: ShaderPad | null = null;
let video: HTMLVideoElement | null = null;
let outputCanvas: HTMLCanvasElement | null = null;

export async function init() {
	const fragmentShaderSrc = `#version 300 es
precision mediump float;

in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_webcam;

// Face plugin uniforms
uniform vec2 u_faceCenter;
uniform vec2 u_leftEye;
uniform vec2 u_rightEye;
uniform vec2 u_noseTip;

// Single combined mask texture (internal/private)
uniform sampler2D u_faceMask;

// Helper functions to sample masks
float getFace(vec2 pos) {
	return texture(u_faceMask, pos).g;  // Green channel: 1.0 if in face
}

float getEye(vec2 pos) {
	return texture(u_faceMask, pos).b;  // Blue channel: 0.25 left eyebrow, 0.5 right eyebrow, 0.75 left eye, 1.0 right eye
}

float getMouth(vec2 pos) {
	return texture(u_faceMask, pos).r;  // Red channel: 0.5 for lips, 1.0 for mouth hole
}

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

	// Draw nose tip dot.
	float noseTipDist = distance(v_uv, u_noseTip);
	float noseTipDot = 1.0 - smoothstep(0.0, 0.01, noseTipDist);
	color = mix(color, vec3(0.0, 1.0, 0.0), noseTipDot);

	// Draw face center dot.
	float faceCenterDist = distance(v_uv, u_faceCenter);
	float faceCenterDot = 1.0 - smoothstep(0.0, 0.01, faceCenterDist);
	color = mix(color, vec3(1.0, 1.0, 1.0), faceCenterDot);

	// Draw eye center dots.
	float leftEyeCenterDist = distance(v_uv, u_leftEye);
	float rightEyeCenterDist = distance(v_uv, u_rightEye);
	float leftEyeCenterDot = 1.0 - smoothstep(0.0, 0.01, leftEyeCenterDist);
	float rightEyeCenterDot = 1.0 - smoothstep(0.0, 0.01, rightEyeCenterDist);
	color = mix(color, vec3(0.0, 0.0, 1.0), leftEyeCenterDot);
	color = mix(color, vec3(1.0, 0.0, 0.0), rightEyeCenterDot);
	
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

	video = await getWebcamStream();

	outputCanvas = document.createElement('canvas');
	outputCanvas.width = video.videoWidth;
	outputCanvas.height = video.videoHeight;
	document.body.appendChild(outputCanvas);

	shader = new ShaderPad(fragmentShaderSrc, {
		canvas: outputCanvas,
		plugins: [
			face({
				textureName: 'u_webcam',
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
		video.srcObject = null;
		video.remove();
		video = null;
	}

	if (outputCanvas) {
		outputCanvas.remove();
		outputCanvas = null;
	}
}
