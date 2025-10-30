import ShaderPad from 'shaderpad';

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
uniform sampler2D u_pictureFrame;
uniform sampler2D u_webcam;

void main() {
	vec4 frameColor = texture(u_pictureFrame, v_uv);
	vec4 webcamColor = texture(u_webcam, v_uv);
	outColor = mix(webcamColor, frameColor, frameColor.a);
}`;

	const pictureFrame = new Image();
	pictureFrame.src = '/picture-frame.png';
	await new Promise((resolve, reject) => {
		pictureFrame.onload = resolve;
		pictureFrame.onerror = reject;
	});
	
	video = await getWebcamStream();

	outputCanvas = document.createElement('canvas');
	outputCanvas.width = video.videoWidth;
	outputCanvas.height = video.videoHeight;
	document.body.appendChild(outputCanvas);

	shader = new ShaderPad(fragmentShaderSrc, { canvas: outputCanvas });
	shader.initializeTexture('u_pictureFrame', pictureFrame);
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
