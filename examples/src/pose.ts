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

function loadVideoFile(file: File, container: HTMLDivElement): Promise<HTMLVideoElement> {
	return new Promise((resolve, reject) => {
		if (!file.type.startsWith('video/')) {
			reject(new Error('File must be a video'));
			return;
		}

		const video = document.createElement('video');
		video.autoplay = true;
		video.playsInline = true;
		video.loop = true;
		video.muted = true;

		video.onloadedmetadata = () => {
			container.appendChild(video);
			resolve(video);
		};

		video.onerror = e => {
			reject(new Error('Failed to load video file: ' + (e as ErrorEvent).message));
		};

		video.src = URL.createObjectURL(file);
	});
}

let shader: ShaderPad | null = null;
let video: HTMLVideoElement | null = null;
let outputCanvas: HTMLCanvasElement | null = null;
let container: HTMLDivElement | null = null;
let dropZone: HTMLElement | null = null;
let handleDragOver: ((e: DragEvent) => void) | null = null;
let handleDragLeave: ((e: DragEvent) => void) | null = null;
let handleDrop: ((e: DragEvent) => void) | null = null;

async function setupShader(videoElement: HTMLVideoElement) {
	const fragmentShaderSrc = `#version 300 es
precision mediump float;

in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_video;

void main() {
	vec2 uv = vec2(1.0 - v_uv.x, v_uv.y);
	vec4 videoColor = texture(u_video, uv);
	vec3 color = videoColor.rgb;

	float bodyMask = getBody(uv);
	color = mix(color, vec3(0.0, 1.0, 0.0), bodyMask * 0.3);
	float skeletonMask = getSkeleton(uv);
	color = mix(color, vec3(0.0, 0.0, 1.0), skeletonMask * 0.3);

	for (int i = 0; i < u_maxPoses; ++i) {
		if (i >= u_nPoses) break;
		for (int j = 0; j < 33; ++j) {
			if (j == 0) continue;
			vec2 landmark = poseLandmark(i, j);
			color = mix(color, vec3(1.0, 0.0, 0.0), step(distance(uv, landmark), .008) * bodyMask);
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

	if (shader) {
		shader.destroy();
		shader = null;
	}

	if (container) {
		container.remove();
		container = null;
		outputCanvas = null;
	}

	container = document.createElement('div');
	container.className = 'canvas-container';
	document.body.appendChild(container);

	outputCanvas = document.createElement('canvas');
	outputCanvas.width = videoElement.videoWidth;
	outputCanvas.height = videoElement.videoHeight;
	container.appendChild(outputCanvas);

	shader = new ShaderPad(fragmentShaderSrc, {
		canvas: outputCanvas,
		plugins: [
			pose({
				textureName: 'u_video',
				options: { maxPoses: 2 },
			}),
		],
	});

	shader.initializeTexture('u_video', videoElement);
	shader.play(() => {
		shader!.updateTextures({ u_video: videoElement });
	});
}

export async function init() {
	// Create container first
	container = document.createElement('div');
	container.className = 'canvas-container';
	document.body.appendChild(container);

	// Try to get webcam first, but don't fail if it's not available
	try {
		video = await getWebcamStream(container);
		await setupShader(video);
	} catch (error) {
		console.warn('Webcam not available, waiting for video file drop:', error);
	}

	// Set up drag and drop
	dropZone = document.createElement('div');
	dropZone.style.position = 'fixed';
	dropZone.style.top = '0';
	dropZone.style.left = '0';
	dropZone.style.width = '100%';
	dropZone.style.height = '100%';
	dropZone.style.pointerEvents = 'none';
	dropZone.style.zIndex = '1000';
	dropZone.style.display = 'flex';
	dropZone.style.alignItems = 'center';
	dropZone.style.justifyContent = 'center';
	dropZone.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
	dropZone.style.opacity = '0';
	dropZone.style.transition = 'opacity 0.2s';
	dropZone.textContent = 'Drop video file here';
	dropZone.style.color = 'white';
	dropZone.style.fontSize = '24px';
	dropZone.style.fontWeight = 'bold';
	document.body.appendChild(dropZone);

	handleDragOver = (e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (dropZone) {
			dropZone.style.pointerEvents = 'auto';
			dropZone.style.opacity = '1';
		}
	};

	handleDragLeave = (e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (dropZone) {
			dropZone.style.pointerEvents = 'none';
			dropZone.style.opacity = '0';
		}
	};

	handleDrop = async (e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (dropZone) {
			dropZone.style.pointerEvents = 'none';
			dropZone.style.opacity = '0';
		}

		const files = e.dataTransfer?.files;
		if (files && files.length > 0) {
			const file = files[0];
			try {
				// Clean up old video if it exists
				if (video) {
					if (video.srcObject) {
						(video.srcObject as MediaStream).getTracks().forEach(track => track.stop());
					}
					if (video.src) {
						URL.revokeObjectURL(video.src);
					}
					video.remove();
					video = null;
				}

				video = await loadVideoFile(file, container);
				await setupShader(video);
			} catch (error) {
				console.error('Error loading video file:', error);
				alert('Error loading video file: ' + error);
			}
		}
	};

	document.addEventListener('dragover', handleDragOver);
	document.addEventListener('dragleave', handleDragLeave);
	document.addEventListener('drop', handleDrop);
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
		if (video.src) {
			URL.revokeObjectURL(video.src);
		}
		video.remove();
		video = null;
	}

	if (container) {
		container.remove();
		container = null;
		outputCanvas = null;
	}

	if (dropZone) {
		dropZone.remove();
		dropZone = null;
	}

	// Remove event listeners
	if (handleDragOver) {
		document.removeEventListener('dragover', handleDragOver);
		handleDragOver = null;
	}
	if (handleDragLeave) {
		document.removeEventListener('dragleave', handleDragLeave);
		handleDragLeave = null;
	}
	if (handleDrop) {
		document.removeEventListener('drop', handleDrop);
		handleDrop = null;
	}
}
