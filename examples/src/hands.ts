import ShaderPad from 'shaderpad';
import hands from 'shaderpad/plugins/hands';

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

int THUMB_TIP = 4;
int INDEX_TIP = 8;
int MIDDLE_TIP = 12;
int RING_TIP = 16;
int PINKY_TIP = 20;
int HAND_CENTER = 21;

void main() {
	vec4 webcamColor = texture(u_webcam, v_uv);
	vec3 color = webcamColor.rgb;

	for (int i = 0; i < u_nHands; ++i) {
		// Draw hand center dot (white).
		float handCenterDist = distance(v_uv, handLandmark(i, HAND_CENTER));
		float handCenterDot = 1.0 - smoothstep(0.0, 0.01, handCenterDist);
		color = mix(color, vec3(1.0, 1.0, 1.0), handCenterDot);

		// Draw thumb tip (yellow).
		float thumbTipDist = distance(v_uv, handLandmark(i, THUMB_TIP));
		float thumbTipDot = 1.0 - smoothstep(0.0, 0.01, thumbTipDist);
		color = mix(color, vec3(1.0, 1.0, 0.0), thumbTipDot);

		// Draw index finger tip (red).
		float indexTipDist = distance(v_uv, handLandmark(i, INDEX_TIP));
		float indexTipDot = 1.0 - smoothstep(0.0, 0.01, indexTipDist);
		color = mix(color, vec3(1.0, 0.0, 0.0), indexTipDot);

		// Draw middle finger tip (green).
		float middleTipDist = distance(v_uv, handLandmark(i, MIDDLE_TIP));
		float middleTipDot = 1.0 - smoothstep(0.0, 0.01, middleTipDist);
		color = mix(color, vec3(0.0, 1.0, 0.0), middleTipDot);

		// Draw ring finger tip (blue).
		float ringTipDist = distance(v_uv, handLandmark(i, RING_TIP));
		float ringTipDot = 1.0 - smoothstep(0.0, 0.01, ringTipDist);
		color = mix(color, vec3(0.0, 0.0, 1.0), ringTipDot);

		// Draw pinky tip (magenta).
		float pinkyTipDist = distance(v_uv, handLandmark(i, PINKY_TIP));
		float pinkyTipDot = 1.0 - smoothstep(0.0, 0.01, pinkyTipDist);
		color = mix(color, vec3(1.0, 0.0, 1.0), pinkyTipDot);
	}

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
			hands({
				textureName: 'u_webcam',
				options: { maxHands: 3 },
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

	if (container) {
		container.remove();
		container = null;
		outputCanvas = null;
	}
}
