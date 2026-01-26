/**
 * Hand detection visualization using hands plugin. Shows glowing lines connecting
 * index finger to thumb and middle finger to thumb for each detected hand.
 */
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
	uniform vec2 u_resolution;

	#define THUMB_TIP 4
	#define INDEX_TIP 8
	#define MIDDLE_TIP 12
	#define RING_TIP 16
	#define PINKY_TIP 20

	float falloffEase(float x) {
		float t = clamp(1.0 - x, 0.0, 1.0);
		t *= t;
		t *= t;
		t *= t;
		return t;
	}

	float renderGlowingSegmentExpWidth(
		vec2 uv,
		vec2 p0,
		vec2 p1,
		float endpointRadiusPx,
		float sharpnessPx
	) {
		float pxPerUv = u_resolution.y;
		sharpnessPx *= 0.01;
		float endpointRadiusUv = endpointRadiusPx / pxPerUv;
		float minThicknessPx = 2.0;
		float minThicknessUv = minThicknessPx / pxPerUv;

		vec2 segment = p1 - p0;
		float segmentLengthSq = dot(segment, segment);
		float segmentLength = sqrt(segmentLengthSq);
		vec2 uvToP0 = uv - p0;

		float projected = clamp(dot(uvToP0, segment) / segmentLengthSq, 0.0, 1.0);

		float segmentLengthPx = segmentLength * pxPerUv;
		float xPx = projected * segmentLengthPx;

		float denom = 1.0 + exp(-segmentLengthPx * sharpnessPx);
		float thicknessPx = endpointRadiusPx * (
			exp(-xPx * sharpnessPx) +
			exp((xPx - segmentLengthPx) * sharpnessPx)
		) / denom;

		thicknessPx = max(minThicknessPx, thicknessPx);
		float thicknessUv = thicknessPx / pxPerUv;

		vec2 closestPoint = p0 + segment * projected;
		float distToLine = length(uv - closestPoint);
		float distToP0 = length(uv - p0);
		float distToP1 = length(uv - p1);

		float lineNorm = distToLine / thicknessUv;
		float endpointNorm0 = distToP0 / endpointRadiusUv;
		float endpointNorm1 = distToP1 / endpointRadiusUv;

		float dNorm = min(lineNorm, min(endpointNorm0, endpointNorm1));

		float inner = falloffEase(dNorm * 0.6);
		float outer = falloffEase(dNorm);
		float intensity = inner + 0.4 * outer;

		return intensity;
	}

	void main() {
		vec2 uv = vec2(1.0 - v_uv.x, v_uv.y);
		vec4 webcamColor = texture(u_webcam, uv);
		vec3 lineColor = vec3(0.0, 0.0, 0.0);
		float lineIntensity = 0.0;

		float endpointRadiusPx = 16.0;
		float sharpness = 1.5;

		for (int i = 0; i < u_nHands; ++i) {
			vec2 thumb = vec2(handLandmark(i, THUMB_TIP));
			vec2 index = vec2(handLandmark(i, INDEX_TIP));
			vec2 middle = vec2(handLandmark(i, MIDDLE_TIP));

			float indexIntensity = renderGlowingSegmentExpWidth(uv, index, thumb, endpointRadiusPx, sharpness);
			lineIntensity += indexIntensity;
			lineColor += indexIntensity * vec3(1.0, 0.0, 0.0);

			float middleIntensity = renderGlowingSegmentExpWidth(uv, middle, thumb, endpointRadiusPx, sharpness);
			lineIntensity += middleIntensity;
			lineColor += middleIntensity * vec3(0.0, 1.0, 0.0);
		}

		vec3 core = lineColor * lineColor;
		lineColor += core * 0.3;

		lineColor = lineColor / (1.0 + lineColor);
		lineColor = pow(lineColor, vec3(0.4545));

		outColor = vec4(mix(webcamColor.rgb + lineColor, lineColor, clamp(lineIntensity, 0.0, 1.0)), 1.0);
	}`;

	container = document.createElement('div');
	container.className = 'canvas-container';
	container.style.position = 'fixed';
	container.style.visibility = 'hidden';
	document.body.appendChild(container);

	video = await getWebcamStream(container);

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

	if (outputCanvas) {
		outputCanvas.remove();
		outputCanvas = null;
	}

	if (container) {
		container.remove();
		container = null;
	}
}
