import ShaderPad from 'shaderpad';
import pose from 'shaderpad/plugins/pose';
import helpers from 'shaderpad/plugins/helpers';

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
uniform highp sampler2DArray u_history;
uniform int u_historyFrameOffset;
uniform int u_frame;

void main() {
	vec2 uv = v_uv;
	vec2 pixel = vec2(1.0) / vec2(textureSize(u_webcam, 0));
	vec3 color = texture(u_webcam, uv).rgb;

	float closestCenter = 2.0;
	for (int i = 0; i < u_nPoses; ++i) {
		vec2 dir = uv - vec2(poseLandmark(i, POSE_LANDMARK_BODY_CENTER));
		float lenDir = length(dir);
		if (lenDir >= closestCenter) continue;

		closestCenter = lenDir;
		if (lenDir < 1e-5) {
			dir = vec2(0.0, 1.0); // Avoid divide-by-zero at exact center.
		} else {
			dir /= lenDir; // It looks cool if you comment this out!
		}

		vec2 uvNearerPoseCenter = uv - dir * 80.0 * pixel;
		float body = inBody(uv) + inBody(uvNearerPoseCenter);
		if (body > 0.0) {
			vec2 target = uv + dir * (20.0 * pixel); // Grab the color 20px away from your body center.
			float z = historyZ(u_history, u_historyFrameOffset, 1);
			color = texture(u_history, vec3(target, z)).rgb;
		}
	}

	outColor = vec4(color.x, color.y * 1.0, color.z, 1.0);
}`;

	video = await getWebcamStream();

	outputCanvas = document.createElement('canvas');
	outputCanvas.width = video.videoWidth;
	outputCanvas.height = video.videoHeight;
	outputCanvas.style.position = 'fixed';
	outputCanvas.style.inset = '0';
	outputCanvas.style.width = '100vw';
	outputCanvas.style.height = '100vh';
	outputCanvas.style.objectFit = 'cover';
	document.body.appendChild(outputCanvas);

	shader = new ShaderPad(fragmentShaderSrc, {
		canvas: outputCanvas,
		history: 1,
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
