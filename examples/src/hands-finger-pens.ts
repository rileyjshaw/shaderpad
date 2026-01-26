/**
 * Hand detection with history visualization. Draws smooth colored trailing ink
 * from whichever fingertip is furthest from the thumb.
 */
import ShaderPad from 'shaderpad';
import hands from 'shaderpad/plugins/hands';
import helpers from 'shaderpad/plugins/helpers';

const N_HISTORY_FRAMES = 100;

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

// Fingertip landmark indices
#define THUMB_TIP 4
#define INDEX_TIP 8
#define MIDDLE_TIP 12
#define RING_TIP 16
#define PINKY_TIP 20
#define HISTORY_FRAMES ${N_HISTORY_FRAMES}

// Fingertip colors
const vec3 THUMB_COLOR = vec3(1.0, 0.3, 0.3);   // Red
const vec3 INDEX_COLOR = vec3(1.0, 0.6, 0.2);   // Orange
const vec3 MIDDLE_COLOR = vec3(1.0, 1.0, 0.3);  // Yellow
const vec3 RING_COLOR = vec3(0.3, 1.0, 0.5);    // Green
const vec3 PINKY_COLOR = vec3(0.4, 0.6, 1.0);   // Blue

float distToSegment(vec2 p, vec2 a, vec2 b) {
	vec2 pa = p - a;
	vec2 ba = b - a;
	float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
	return length(pa - ba * h);
}

// Check if hand 0 was valid at the given historical frame
bool wasHandValid(int framesAgo) {
	return nHandsAt(framesAgo) > 0;
}

const float THUMB_PROXIMITY_THRESHOLD = 0.06;

int getActiveFinger(int framesAgo) {
	if (!wasHandValid(framesAgo)) return -1;
	
	vec2 thumbPos = vec2(handLandmark(0, THUMB_TIP, framesAgo));
	vec2 indexPos = vec2(handLandmark(0, INDEX_TIP, framesAgo));
	vec2 middlePos = vec2(handLandmark(0, MIDDLE_TIP, framesAgo));
	vec2 ringPos = vec2(handLandmark(0, RING_TIP, framesAgo));
	vec2 pinkyPos = vec2(handLandmark(0, PINKY_TIP, framesAgo));
	
	float indexDist = distance(indexPos, thumbPos);
	float middleDist = distance(middlePos, thumbPos);
	float ringDist = distance(ringPos, thumbPos);
	float pinkyDist = distance(pinkyPos, thumbPos);
	
	float maxDist = indexDist;
	int activeFinger = 0;
	
	if (middleDist > maxDist) { maxDist = middleDist; activeFinger = 1; }
	if (ringDist > maxDist) { maxDist = ringDist; activeFinger = 2; }
	if (pinkyDist > maxDist) { maxDist = pinkyDist; activeFinger = 3; }
	
	if (maxDist < THUMB_PROXIMITY_THRESHOLD) return -1;
	
	return activeFinger;
}

vec2 getFingerPos(int fingerIdx, int framesAgo) {
	if (fingerIdx == 0) return vec2(handLandmark(0, INDEX_TIP, framesAgo));
	if (fingerIdx == 1) return vec2(handLandmark(0, MIDDLE_TIP, framesAgo));
	if (fingerIdx == 2) return vec2(handLandmark(0, RING_TIP, framesAgo));
	return vec2(handLandmark(0, PINKY_TIP, framesAgo));
}

vec3 getFingerColor(int fingerIdx) {
	if (fingerIdx == 0) return INDEX_COLOR;
	if (fingerIdx == 1) return MIDDLE_COLOR;
	if (fingerIdx == 2) return RING_COLOR;
	return PINKY_COLOR;
}

vec4 getAllPenIntensities(vec2 uv, float lineWidthUv) {
	vec4 intensities = vec4(0.0);
	
	vec2 prevIndex = vec2(-999.0);
	vec2 prevMiddle = vec2(-999.0);
	vec2 prevRing = vec2(-999.0);
	vec2 prevPinky = vec2(-999.0);
	
	int prevIndexFrame = -1;
	int prevMiddleFrame = -1;
	int prevRingFrame = -1;
	int prevPinkyFrame = -1;
	
	for (int i = HISTORY_FRAMES - 1; i >= 0; --i) {
		int activeFinger = getActiveFinger(i);
		if (activeFinger < 0) continue;
		
		vec2 currentPos = getFingerPos(activeFinger, i);
		
		vec2 prevPos = vec2(-999.0);
		int prevFrame = -1;
		
		if (activeFinger == 0) { prevPos = prevIndex; prevFrame = prevIndexFrame; }
		else if (activeFinger == 1) { prevPos = prevMiddle; prevFrame = prevMiddleFrame; }
		else if (activeFinger == 2) { prevPos = prevRing; prevFrame = prevRingFrame; }
		else { prevPos = prevPinky; prevFrame = prevPinkyFrame; }
		
		if (prevPos.x > -500.0 && prevFrame >= 0) {
			float dist = distToSegment(uv, prevPos, currentPos);
			
			float ageFade = 1.0 - float(i) / float(HISTORY_FRAMES);
			float segmentIntensity = smoothstep(lineWidthUv * 2.0, 0.0, dist) * ageFade;
			
			if (activeFinger == 0) intensities.x = max(intensities.x, segmentIntensity);
			else if (activeFinger == 1) intensities.y = max(intensities.y, segmentIntensity);
			else if (activeFinger == 2) intensities.z = max(intensities.z, segmentIntensity);
			else intensities.w = max(intensities.w, segmentIntensity);
		}
		
		if (activeFinger == 0) { prevIndex = currentPos; prevIndexFrame = i; }
		else if (activeFinger == 1) { prevMiddle = currentPos; prevMiddleFrame = i; }
		else if (activeFinger == 2) { prevRing = currentPos; prevRingFrame = i; }
		else { prevPinky = currentPos; prevPinkyFrame = i; }
	}
	
	return intensities;
}

void main() {
	vec2 uv = fitCover(vec2(1.0 - v_uv.x, v_uv.y), vec2(textureSize(u_webcam, 0)));
	vec4 webcamColor = texture(u_webcam, uv);
	vec3 color = webcamColor.rgb;

	float pxPerUv = u_resolution.y;
	float lineWidthPx = 3.0;
	float lineWidthUv = lineWidthPx / pxPerUv;

	vec4 intensities = getAllPenIntensities(uv, lineWidthUv);

	color = mix(color, INDEX_COLOR, intensities.x);
	color = mix(color, MIDDLE_COLOR, intensities.y);
	color = mix(color, RING_COLOR, intensities.z);
	color = mix(color, PINKY_COLOR, intensities.w);

	if (u_nHands > 0) {
		int activeFinger = getActiveFinger(0);
		if (activeFinger >= 0) {
			vec2 activePos = getFingerPos(activeFinger, 0);
			vec3 activeColor = getFingerColor(activeFinger);
			
			float dotSize = 0.015;
			float dotEdge = 0.005;
			color = mix(color, activeColor, smoothstep(dotSize, dotEdge, distance(uv, activePos)));
		}
	}

	outColor = vec4(color, 1.0);
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
			helpers(),
			hands({
				textureName: 'u_webcam',
				options: {
					maxHands: 1,
					history: N_HISTORY_FRAMES,
				},
			}),
		],
	});

	shader.initializeTexture('u_webcam', video);

	shader.play(undefined, (_time, frame) => {
		const options = { skipHistoryWrite: !!(frame % 5) };
		shader!.updateTextures({ u_webcam: video! }, options);
		return options;
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
