import ShaderPad from 'shaderpad';
import hands from 'shaderpad/plugins/hands';
import face from 'shaderpad/plugins/face';

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

#define THUMB_IP 3
#define THUMB_TIP 4
#define INDEX_DIP 7
#define INDEX_TIP 8
#define MIDDLE_DIP 11
#define MIDDLE_TIP 12
#define RING_DIP 15
#define RING_TIP 16
#define PINKY_DIP 19
#define PINKY_TIP 20

// Shout-outs:
// Ricky Reusser @rreusser
// https://github.com/Erkaman/glsl-godrays/blob/master/example/index.js
// Max Bittker @maxbittker
// https://shaderbooth.com/
vec3 fingerRays(float density, float weight, float decay, float exposure,
             int numSamples, vec2 fingertipPos,
             vec2 screenSpaceLightPos, vec2 uv) {
	vec3 fragColor = vec3(0.0, 0.0, 0.0);
	vec2 deltaTextCoord = vec2(uv - screenSpaceLightPos.xy);
	vec2 textCoo = uv.xy;
	deltaTextCoord *= (1.0 / float(numSamples)) * density;
	float illuminationDecay = 1.0;
	for (int i = 0; i < 200; i++) {
		if (numSamples < i)
			break;
		textCoo -= deltaTextCoord;

		// Calculate distance from sample point to fingertip
		float distToFingertip = distance(textCoo, fingertipPos);
		float brightness = (1.0 - smoothstep(0.0, 0.03, distToFingertip)) * 0.8;
		vec3 samp = vec3(brightness);
		samp.xy -= vec2(0.5, 0.2);
		samp.xy = max(samp.xy, 0.);
		samp.xy * -4.;
		samp = vec3(dot(samp.xy, samp.xy));

		samp *= illuminationDecay * weight;
		fragColor += samp;
		illuminationDecay *= decay;
	}
	fragColor *= vec3(1.0, 0.7, 0.5);
	fragColor *= exposure;
	return fragColor;
}

// HACK: Copypasting this for laziness.
vec3 faceRays(float density, float weight, float decay, float exposure,
             int numSamples, vec2 screenSpaceLightPos, vec2 uv) {
	vec3 fragColor = vec3(0.0, 0.0, 0.0);
	vec2 deltaTextCoord = vec2(uv - screenSpaceLightPos.xy);
	vec2 textCoo = uv.xy;
	deltaTextCoord *= (1.0 / float(numSamples)) * density;
	float illuminationDecay = 1.0;
	for (int i = 0; i < 200; i++) {
		if (numSamples < i)
			break;
		textCoo -= deltaTextCoord;

		float brightness = min(1.0, inMouth(textCoo) + inEye(textCoo));
		vec3 samp = vec3(brightness);
		samp.xy -= vec2(0.5, 0.2);
		samp.xy = max(samp.xy, 0.);
		samp.xy * -4.;
		samp = vec3(dot(samp.xy, samp.xy));

		samp *= illuminationDecay * weight;
		fragColor += samp;
		illuminationDecay *= decay;
	}
	fragColor *= vec3(1.0, 0.7, 0.5);
	fragColor *= exposure;
	return fragColor;
}

void main() {
	vec2 uv = vec2(1.0 - v_uv.x, v_uv.y);
	vec4 webcamColor = texture(u_webcam, uv);
	vec3 color = webcamColor.rgb * 0.75;

	for (int i = 0; i < u_nHands; ++i) {
		vec2 thumbIP = vec2(handLandmark(i, THUMB_IP));
		vec2 thumbTip = vec2(handLandmark(i, THUMB_TIP));
		color += fingerRays(1.0, 0.01, 1.0, 4.0, 200, thumbTip, thumbIP, uv);

		vec2 indexDIP = vec2(handLandmark(i, INDEX_DIP));
		vec2 indexTip = vec2(handLandmark(i, INDEX_TIP));
		color += fingerRays(1.0, 0.01, 1.0, 4.0, 200, indexTip, indexDIP, uv);

		vec2 middleDIP = vec2(handLandmark(i, MIDDLE_DIP));
		vec2 middleTip = vec2(handLandmark(i, MIDDLE_TIP));
		color += fingerRays(1.0, 0.01, 1.0, 4.0, 200, middleTip, middleDIP, uv);

		vec2 ringDIP = vec2(handLandmark(i, RING_DIP));
		vec2 ringTip = vec2(handLandmark(i, RING_TIP));
		color += fingerRays(1.0, 0.01, 1.0, 4.0, 200, ringTip, ringDIP, uv);

		vec2 pinkyDIP = vec2(handLandmark(i, PINKY_DIP));
		vec2 pinkyTip = vec2(handLandmark(i, PINKY_TIP));
		color += fingerRays(1.0, 0.01, 1.0, 4.0, 200, pinkyTip, pinkyDIP, uv);
	}

	for (int i = 0; i < u_nFaces; ++i) {
		color += faceRays(0.7, 0.01, 1.0, 4.0, 200, vec2(0.5, 0.5), uv);
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
			face({
				textureName: 'u_webcam',
				options: { maxFaces: 3 },
			}),
			hands({
				textureName: 'u_webcam',
				options: { maxHands: 6 },
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
