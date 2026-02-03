/**
 * Webcam with single-channel 8-bit output (grayscale). First ShaderPad renders
 * 256×256 uint8; second ShaderPad uses it as input with history 12, showing
 * current frame on the right half and 12 frames ago on the left half.
 */
import ShaderPad from 'shaderpad';
import helpers from 'shaderpad/plugins/helpers';

const SIZE = 256;
const HISTORY_LENGTH = 12;

async function getWebcamStream(container: HTMLDivElement): Promise<HTMLVideoElement> {
	const video = document.createElement('video');
	video.autoplay = video.playsInline = true;

	try {
		const stream = await navigator.mediaDevices.getUserMedia({ video: true });
		video.srcObject = stream;
		await new Promise(resolve => (video.onloadedmetadata = resolve));
		video.style.display = 'none';
		container.appendChild(video);
	} catch (error) {
		console.error('Error accessing webcam:', error);
		throw error;
	}

	return video;
}

let bwPad: ShaderPad | null = null;
let historyPad: ShaderPad | null = null;
let video: HTMLVideoElement | null = null;
let canvasHistory: HTMLCanvasElement | null = null;
let container: HTMLDivElement | null = null;

export async function init() {
	const bwFragmentSrc = `#version 300 es
precision mediump float;

in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_webcam;

void main() {
	vec4 webcamColor = texture(u_webcam, vec2(1.0 - v_uv.x, v_uv.y));
	float gray = dot(webcamColor.rgb, vec3(0.299, 0.587, 0.114));
	outColor = vec4(gray, 0.0, 0.0, 1.0);
}`;

	const historyFragmentSrc = `#version 300 es
precision mediump float;

in vec2 v_uv;
out vec4 outColor;
uniform highp sampler2DArray u_input;
uniform int u_inputFrameOffset;

void main() {
	float zCurrent = historyZ(u_input, u_inputFrameOffset, 0);
	float zPast = historyZ(u_input, u_inputFrameOffset, ${HISTORY_LENGTH});
	vec2 uv = vec2(v_uv.x, v_uv.y);
	float z = v_uv.x < 0.5 ? zPast : zCurrent;
	float gray = texture(u_input, vec3(uv, z)).r;
	outColor = vec4(gray, gray, gray, 1.0);
}`;

	container = document.createElement('div');
	container.className = 'canvas-container';
	document.body.appendChild(container);

	video = await getWebcamStream(container);

	const canvasBwOffscreen = new OffscreenCanvas(SIZE, SIZE);

	canvasHistory = document.createElement('canvas');
	canvasHistory.width = SIZE;
	canvasHistory.height = SIZE;
	container.appendChild(canvasHistory);

	const padOptions = {
		internalFormat: 'R8' as const,
		format: 'RED' as const,
		type: 'UNSIGNED_BYTE' as const,
	};

	bwPad = new ShaderPad(bwFragmentSrc, {
		canvas: canvasBwOffscreen,
		...padOptions,
	});
	bwPad.initializeTexture('u_webcam', video);

	historyPad = new ShaderPad(historyFragmentSrc, {
		canvas: canvasHistory,
		plugins: [helpers()],
		...padOptions,
	});
	historyPad.initializeTexture('u_input', bwPad, { history: HISTORY_LENGTH, ...padOptions });

	const draw = () => {
		if (!bwPad || !historyPad || !video) return;
		bwPad.updateTextures({ u_webcam: video });
		bwPad.draw();
		historyPad.updateTextures({ u_input: bwPad });
		historyPad.draw();
	};

	bwPad.play(draw);
}

export function destroy() {
	if (bwPad) {
		bwPad.destroy();
		bwPad = null;
	}
	if (historyPad) {
		historyPad.destroy();
		historyPad = null;
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
		canvasHistory = null;
	}
}
