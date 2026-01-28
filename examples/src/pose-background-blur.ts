/**
 * Pose detection with background blur. Blurs the background while keeping
 * detected poses in focus.
 */
import ShaderPad from 'shaderpad';
import pose from 'shaderpad/plugins/pose';

async function getWebcamStream(container: HTMLDivElement): Promise<HTMLVideoElement> {
	const video = document.createElement('video');
	video.autoplay = video.playsInline = true;

	try {
		const stream = await navigator.mediaDevices.getUserMedia({ video: true });
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

export async function init() {
	const fragmentShaderSrc = `#version 300 es
precision mediump float;

in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_webcam;
uniform vec2 u_resolution;

// Box blur function with more samples for stronger blur
vec3 blur(sampler2D tex, vec2 uv, float radius) {
	vec2 texelSize = 1.0 / u_resolution;
	vec3 color = vec3(0.0);
	float total = 0.0;
	
	// Increased sample count for stronger blur (15x15 = 225 samples)
	int sampleRadius = 7;
	float step = radius / float(sampleRadius);
	
	for (int x = -7; x <= 7; ++x) {
		for (int y = -7; y <= 7; ++y) {
			vec2 offset = vec2(float(x), float(y)) * step * texelSize;
			color += texture(tex, uv + offset).rgb;
			total += 1.0;
		}
	}
	
	return color / total;
}

void main() {
	vec2 uv = vec2(1.0 - v_uv.x, v_uv.y);
	vec4 currentColor = texture(u_webcam, uv);
	vec3 current = currentColor.rgb;
	
	// Calculate blurred color with increased blur radius
	vec3 blurred = blur(u_webcam, uv, 20.0);
	
	// Check if current pixel is in a pose
	// Use the same UV coordinates as the webcam (flipped X for selfie mode)
	float inPoseValue = 0.0;
	if (u_nPoses > 0) {
		vec2 pose = poseAt(uv);
		// Only consider it "in pose" if confidence is above threshold
		inPoseValue = step(0.1, pose.x);
	}
	
	// Mix: blurred when not in pose, current when in pose
	vec3 color = mix(blurred, current, inPoseValue);
	
	outColor = vec4(color, 1.0);
}`;

	container = document.createElement('div');
	container.className = 'canvas-container';
	document.body.appendChild(container);

	video = await getWebcamStream(container);

	outputCanvas = document.createElement('canvas');
	outputCanvas.width = video.videoWidth;
	outputCanvas.height = video.videoHeight;
	container.appendChild(outputCanvas);

	shader = new ShaderPad(fragmentShaderSrc, {
		canvas: outputCanvas,
		plugins: [
			pose({
				textureName: 'u_webcam',
				options: { maxPoses: 2 },
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
