/**
 * Two ShaderPad instances side-by-side with webcam input.
 * First shader displays webcam with vertical stripes in face region.
 * Second shader displays first shader output with horizontal stripes outside face region.
 */
import ShaderPad from 'shaderpad';
import face from 'shaderpad/plugins/face';

import { getWebcamVideo, stopVideoStream } from '@/examples/demo-utils';
import type { ExampleContext } from '@/examples/runtime';

export async function init({ mount }: ExampleContext) {
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

	const container = document.createElement('div');
	container.className = 'canvas-container';
	container.style.display = 'flex';
	container.style.gap = '20px';
	container.style.justifyContent = 'center';
	container.style.alignItems = 'center';
	container.style.minHeight = '100vh';
	mount.appendChild(container);

	const video = await getWebcamVideo();

	const canvasA = document.createElement('canvas');
	canvasA.width = 512;
	canvasA.height = 512;
	canvasA.style.border = '1px solid #ccc';
	container.appendChild(canvasA);

	const canvasB = document.createElement('canvas');
	canvasB.width = 512;
	canvasB.height = 512;
	canvasB.style.border = '1px solid #ccc';
	container.appendChild(canvasB);

	const shaderA = new ShaderPad(fragmentShaderSrcA, {
		canvas: canvasA,
		plugins: [
			face({
				textureName: 'u_webcam',
				options: { maxFaces: 3 },
			}),
		],
	});

	const shaderB = new ShaderPad(fragmentShaderSrcB, {
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

	shaderB.play(() => {
		shaderA.updateTextures({ u_webcam: video });
		shaderB.updateTextures({ u_webcam: video });
		shaderA.step();
		shaderB.updateTextures({ u_firstPass: shaderA });
	});

	return () => {
		shaderA.destroy();
		shaderB.destroy();
		stopVideoStream(video);
		container.remove();
	};
}
