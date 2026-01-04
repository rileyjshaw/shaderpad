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

void main() {
	vec2 uv = vec2(1.0 - v_uv.x, v_uv.y);
	vec4 webcamColor = texture(u_webcam, uv);
	vec3 color = webcamColor.rgb;

	float bodyMask = inBody(uv);
	color = mix(color, vec3(0.0, 1.0, 0.0), bodyMask * 0.3);

	for (int i = 0; i < u_nPoses; ++i) {
		// Draw tiny red dots on all pose landmarks.
		for (int j = 0; j < 39; ++j) {
			vec2 landmarkPos = vec2(poseLandmark(i, j));
			float landmarkDist = distance(uv, landmarkPos);
			float landmarkDot = (1.0 - smoothstep(0.0, 0.005, landmarkDist));
			color = mix(color, vec3(1.0, 0.0, 0.0), landmarkDot);
		}
	}

	// Display mask in bottom corner as debug overlay.
	vec2 maskPreviewUV = (uv - vec2(0.65, 0.0)) * vec2(2.86, 2.86);
	if (maskPreviewUV.x >= 0.0 && maskPreviewUV.x <= 1.0 && maskPreviewUV.y >= 0.0 && maskPreviewUV.y <= 1.0) {
		vec4 debugMask = texture(u_poseMask, maskPreviewUV);
		vec3 maskVis = debugMask.rgb;
		color = mix(color, maskVis, 0.9);
		float border = 1.0 - smoothstep(0.0, 0.01, min(min(maskPreviewUV.x, 1.0 - maskPreviewUV.x), min(maskPreviewUV.y, 1.0 - maskPreviewUV.y)));
		color = mix(color, vec3(1.0, 1.0, 1.0), border * 0.8);
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
