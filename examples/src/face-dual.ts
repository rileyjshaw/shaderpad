/**
 * Two ShaderPad instances side-by-side with webcam input.
 * First shader displays webcam with vertical stripes in face region.
 * Second shader displays first shader output with horizontal stripes outside face region.
 */
import { FaceLandmarkerResult } from '@mediapipe/tasks-vision';
import ShaderPad from 'shaderpad';
import face from 'shaderpad/plugins/face';

async function getWebcamStream(): Promise<HTMLVideoElement> {
	const video = document.createElement('video');
	video.autoplay = video.playsInline = true;

	try {
		const stream = await navigator.mediaDevices.getUserMedia({ video: true });
		video.srcObject = stream;
		await new Promise(resolve => (video.onloadedmetadata = resolve));
	} catch (error) {
		console.error('Error accessing webcam:', error);
		throw error;
	}

	return video;
}

let shaderA: ShaderPad | null = null;
let shaderB: ShaderPad | null = null;
let video: HTMLVideoElement | null = null;
let canvasA: HTMLCanvasElement | null = null;
let canvasB: HTMLCanvasElement | null = null;
let container: HTMLDivElement | null = null;

export async function init() {
	const fragmentShaderSrcA = `#version 300 es
precision mediump float;

in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_webcam;

void main() {
	vec4 webcamColor = texture(u_webcam, v_uv);
	vec3 color = webcamColor.rgb;
	
	// Add vertical stripes in face region
	float inFaceRegion = inFace(v_uv);
	if (inFaceRegion > 0.0) {
		float stripe = mod(v_uv.x * 20.0, 1.0);
		float stripePattern = step(0.5, stripe);
		color = mix(color, vec3(1.0, 0.0, 1.0), stripePattern * 0.5);
	}
	
	outColor = vec4(color, 1.0);
}`;

	const fragmentShaderSrcB = `#version 300 es
precision mediump float;

in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_firstPass;

void main() {
	vec4 firstPassColor = texture(u_firstPass, v_uv);
	vec3 color = firstPassColor.rgb;
	
	// Add horizontal stripes outside face region
	float inFaceRegion = inFace(v_uv);
	if (inFaceRegion < 0.5) {
		float stripe = mod(v_uv.y * 20.0, 1.0);
		float stripePattern = step(0.5, stripe);
		color = mix(color, vec3(0.0, 1.0, 1.0), stripePattern * 0.5);
	}
	
	outColor = vec4(color, 1.0);
}`;

	container = document.createElement('div');
	container.className = 'canvas-container';
	container.style.display = 'flex';
	container.style.gap = '20px';
	container.style.justifyContent = 'center';
	container.style.alignItems = 'center';
	container.style.minHeight = '100vh';
	document.body.appendChild(container);

	video = await getWebcamStream();

	canvasA = document.createElement('canvas');
	canvasA.width = 512;
	canvasA.height = 512;
	canvasA.style.border = '1px solid #ccc';
	container.appendChild(canvasA);

	canvasB = document.createElement('canvas');
	canvasB.width = 512;
	canvasB.height = 512;
	canvasB.style.border = '1px solid #ccc';
	container.appendChild(canvasB);

	shaderA = new ShaderPad(fragmentShaderSrcA, {
		canvas: canvasA,
		plugins: [
			face({
				textureName: 'u_webcam',
				options: { maxFaces: 3 },
			}),
		],
	});

	shaderB = new ShaderPad(fragmentShaderSrcB, {
		canvas: canvasB,
		plugins: [
			face({
				textureName: 'u_webcam',
				options: { maxFaces: 3 },
			}),
		],
	});

	shaderA.initializeTexture('u_webcam', video);
	shaderB.initializeTexture('u_webcam', video);
	shaderB.initializeTexture('u_firstPass', shaderA);

	let resultFromShaderA: FaceLandmarkerResult | null = null;
	shaderA.on('face:result', (result: FaceLandmarkerResult) => {
		resultFromShaderA = result;
	});
	shaderB.on('face:result', (result: FaceLandmarkerResult) => {
		console.log(`Results are ${result === resultFromShaderA ? 'NOT ' : ''}the same.`);
	});

	shaderB.play(() => {
		shaderA!.updateTextures({ u_webcam: video! });
		shaderB!.updateTextures({ u_webcam: video! });
		shaderA!.step();
		shaderB!.updateTextures({ u_firstPass: shaderA! });
	});
}

export function destroy() {
	if (shaderA) {
		shaderA.destroy();
		shaderA = null;
	}

	if (shaderB) {
		shaderB.destroy();
		shaderB = null;
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
		canvasA = null;
		canvasB = null;
	}
}
