/**
 * Two chained ShaderPad instances share one webcam source. The first pass
 * stripes the detected face region, and the second pass composites a
 * complementary treatment outside the face.
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
	vec2 webcamUV = vec2(1.0 - v_uv.x, v_uv.y);
	vec4 webcamColor = texture(u_webcam, webcamUV);
	vec3 color = webcamColor.rgb;
	
	// Add vertical stripes in face region
	float inFaceRegion = inFace(webcamUV);
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
	// Add horizontal stripes outside face region
	vec3 color = texture(u_firstPass, v_uv).rgb;

	float inFaceRegion = inFace(vec2(1.0 - v_uv.x, v_uv.y));
	if (inFaceRegion < 0.5) {
		float stripe = mod(v_uv.y * 20.0, 1.0);
		float stripePattern = step(0.5, stripe);
		color = mix(color, vec3(0.0, 1.0, 1.0), stripePattern * 0.5);
	}

	outColor = vec4(color, 1.0);
}`;

	const video = await getWebcamVideo();
	const canvas = document.createElement('canvas');
	canvas.width = video.videoWidth;
	canvas.height = video.videoHeight;
	canvas.style.position = 'fixed';
	canvas.style.inset = '0';
	canvas.style.width = '100dvw';
	canvas.style.height = '100dvh';
	canvas.style.objectFit = 'cover';
	mount.appendChild(canvas);

	const shaderA = new ShaderPad(fragmentShaderSrcA, {
		canvas,
		plugins: [face({
			textureName: 'u_webcam',
			options: { maxFaces: 3 },
		})],
	});

	const shaderB = new ShaderPad(fragmentShaderSrcB, {
		canvas,
		plugins: [face({
			textureName: 'u_webcam',
			options: { maxFaces: 3 },
		})],
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
		canvas.remove();
	};
}
