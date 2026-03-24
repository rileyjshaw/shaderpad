/**
 * Selfie-segmented background blur using a compact Dual Kawase chain. Keeps
 * the foreground sharp over a mirrored webcam feed while blurring the rest.
 */
import ShaderPad from 'shaderpad';
import autosize from 'shaderpad/plugins/autosize';
import helpers from 'shaderpad/plugins/helpers';
import segmenter from 'shaderpad/plugins/segmenter';
import { createFullscreenCanvas } from 'shaderpad/util';

import { getWebcamVideo, stopVideoStream } from '@/examples/demo-utils';
import type { ExampleContext } from '@/examples/runtime';

const KAWASE_PASSES = 4;
const BLUR_OFFSET = 1.5;

const firstDownFragmentShaderSrc = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_webcam;
uniform float u_offset;

void main() {
	vec2 texelSize = 1.0 / vec2(textureSize(u_webcam, 0));
	vec2 offset = texelSize * u_offset;
	vec2 uv = fitCover(vec2(1.0 - v_uv.x, v_uv.y), vec2(textureSize(u_webcam, 0)));

	vec4 sum = texture(u_webcam, uv) * 4.0;
	sum += texture(u_webcam, uv + vec2(-offset.x, -offset.y));
	sum += texture(u_webcam, uv + vec2( offset.x, -offset.y));
	sum += texture(u_webcam, uv + vec2(-offset.x,  offset.y));
	sum += texture(u_webcam, uv + vec2( offset.x,  offset.y));

	outColor = sum / 8.0;
}`;

const kawaseDownFragmentShaderSrc = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_input;
uniform float u_offset;

void main() {
	vec2 texelSize = 1.0 / vec2(textureSize(u_input, 0));
	vec2 offset = texelSize * u_offset;

	vec4 sum = texture(u_input, v_uv) * 4.0;
	sum += texture(u_input, v_uv + vec2(-offset.x, -offset.y));
	sum += texture(u_input, v_uv + vec2( offset.x, -offset.y));
	sum += texture(u_input, v_uv + vec2(-offset.x,  offset.y));
	sum += texture(u_input, v_uv + vec2( offset.x,  offset.y));

	outColor = sum / 8.0;
}`;

const kawaseUpFragmentShaderSrc = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_input;
uniform float u_offset;

void main() {
	vec2 texelSize = 1.0 / vec2(textureSize(u_input, 0));
	vec2 offset = texelSize * u_offset;

	vec4 sum = vec4(0.0);
	sum += texture(u_input, v_uv + vec2(-offset.x * 2.0, 0.0));
	sum += texture(u_input, v_uv + vec2(-offset.x, offset.y)) * 2.0;
	sum += texture(u_input, v_uv + vec2(0.0, offset.y * 2.0));
	sum += texture(u_input, v_uv + vec2(offset.x, offset.y)) * 2.0;
	sum += texture(u_input, v_uv + vec2(offset.x * 2.0, 0.0));
	sum += texture(u_input, v_uv + vec2(offset.x, -offset.y)) * 2.0;
	sum += texture(u_input, v_uv + vec2(0.0, -offset.y * 2.0));
	sum += texture(u_input, v_uv + vec2(-offset.x, -offset.y)) * 2.0;

	outColor = sum / 12.0;
}`;

const compositeFragmentShaderSrc = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_blurred;
uniform sampler2D u_webcam;

float sampleForeground(vec2 uv, int framesAgo) {
	vec2 segment = segmentAt(uv, framesAgo);
	return segment.x * (1.0 - segment.y);
}

float expandedForeground(vec2 uv, int framesAgo) {
	vec2 px = 1.0 / vec2(textureSize(u_webcam, 0));
	float mask = sampleForeground(uv, framesAgo);
	mask = max(mask, sampleForeground(uv + vec2( 2.0 * px.x,  0.0), framesAgo));
	mask = max(mask, sampleForeground(uv + vec2(-2.0 * px.x,  0.0), framesAgo));
	mask = max(mask, sampleForeground(uv + vec2( 0.0,  2.0 * px.y), framesAgo));
	mask = max(mask, sampleForeground(uv + vec2( 0.0, -2.0 * px.y), framesAgo));
	mask = max(mask, sampleForeground(uv + vec2( 1.5 * px.x,  1.5 * px.y), framesAgo));
	mask = max(mask, sampleForeground(uv + vec2(-1.5 * px.x,  1.5 * px.y), framesAgo));
	mask = max(mask, sampleForeground(uv + vec2( 1.5 * px.x, -1.5 * px.y), framesAgo));
	mask = max(mask, sampleForeground(uv + vec2(-1.5 * px.x, -1.5 * px.y), framesAgo));
	return mask;
}

float smoothedForeground(vec2 uv, int framesAgo) {
	vec2 blurStep = 5.0 / vec2(textureSize(u_webcam, 0));
	return (
		expandedForeground(uv, framesAgo) * 4.0
		+ expandedForeground(uv + vec2( blurStep.x, 0.0), framesAgo) * 2.0
		+ expandedForeground(uv + vec2(-blurStep.x, 0.0), framesAgo) * 2.0
		+ expandedForeground(uv + vec2(0.0,  blurStep.y), framesAgo) * 2.0
		+ expandedForeground(uv + vec2(0.0, -blurStep.y), framesAgo) * 2.0
		+ expandedForeground(uv + vec2( blurStep.x,  blurStep.y), framesAgo)
		+ expandedForeground(uv + vec2(-blurStep.x,  blurStep.y), framesAgo)
		+ expandedForeground(uv + vec2( blurStep.x, -blurStep.y), framesAgo)
		+ expandedForeground(uv + vec2(-blurStep.x, -blurStep.y), framesAgo)
	) / 16.0;
}

void main() {
	vec2 webcamUV = fitCover(vec2(1.0 - v_uv.x, v_uv.y), vec2(textureSize(u_webcam, 0)));
	vec3 webcamColor = texture(u_webcam, webcamUV).rgb;
	vec3 blurredColor = texture(u_blurred, v_uv).rgb;

	float currentMask = smoothedForeground(webcamUV, 0);
	float previousMask = smoothedForeground(webcamUV, 1);
	float stableMask = mix(previousMask, currentMask, 0.4);
	float foregroundMask = smoothstep(0.32, 0.82, stableMask);

	outColor = vec4(mix(blurredColor, webcamColor, foregroundMask), 1.0);
}`;

function createPassSizes(width: number, height: number) {
	const sizes: Array<{ width: number; height: number }> = [];
	let currentWidth = Math.max(1, width);
	let currentHeight = Math.max(1, height);

	for (let i = 0; i < KAWASE_PASSES; i += 1) {
		currentWidth = Math.max(1, Math.floor(currentWidth / 2));
		currentHeight = Math.max(1, Math.floor(currentHeight / 2));
		sizes.push({ width: currentWidth, height: currentHeight });
	}

	return sizes;
}

function resizeBlurPasses(downShaders: ShaderPad[], upShaders: ShaderPad[], width: number, height: number) {
	const sizes = createPassSizes(width, height);

	downShaders.forEach((shader, index) => {
		shader.canvas.width = sizes[index].width;
		shader.canvas.height = sizes[index].height;
	});

	upShaders.forEach((shader, index) => {
		const size = sizes[sizes.length - 2 - index];
		shader.canvas.width = size.width;
		shader.canvas.height = size.height;
	});
}

export async function init({ mount }: ExampleContext) {
	const video = await getWebcamVideo({ facingMode: 'user' });
	const canvas = createFullscreenCanvas(mount);

	const downShaders = createPassSizes(canvas.width, canvas.height).map((size, index) => {
		const shader = new ShaderPad(index === 0 ? firstDownFragmentShaderSrc : kawaseDownFragmentShaderSrc, {
			canvas: { width: size.width, height: size.height },
			plugins: [helpers()],
		});
		shader.initializeUniform('u_offset', 'float', BLUR_OFFSET);
		return shader;
	});

	const upShaders = createPassSizes(canvas.width, canvas.height)
		.slice(0, -1)
		.reverse()
		.map(size => {
			const shader = new ShaderPad(kawaseUpFragmentShaderSrc, {
				canvas: { width: size.width, height: size.height },
				plugins: [helpers()],
			});
			shader.initializeUniform('u_offset', 'float', BLUR_OFFSET);
			return shader;
		});

	downShaders[0].initializeTexture('u_webcam', video);
	for (let i = 1; i < downShaders.length; i += 1) {
		downShaders[i].initializeTexture('u_input', downShaders[i - 1]);
	}

	upShaders[0].initializeTexture('u_input', downShaders[downShaders.length - 1]);
	for (let i = 1; i < upShaders.length; i += 1) {
		upShaders[i].initializeTexture('u_input', upShaders[i - 1]);
	}

	const shader = new ShaderPad(compositeFragmentShaderSrc, {
		canvas,
		plugins: [
			autosize(),
			helpers(),
			segmenter({
				textureName: 'u_webcam',
				options: {
					history: 1,
				},
			}),
		],
	});

	shader.initializeTexture('u_webcam', video);
	shader.initializeTexture('u_blurred', upShaders[upShaders.length - 1]);

	const syncBlurPassSizes = (width: number, height: number) => {
		resizeBlurPasses(downShaders, upShaders, width, height);
	};

	syncBlurPassSizes(canvas.width, canvas.height);
	shader.on('autosize:resize', syncBlurPassSizes);

	shader.play(() => {
		shader.updateTextures({ u_webcam: video });

		downShaders[0].updateTextures({ u_webcam: video });
		downShaders[0].step();

		for (let i = 1; i < downShaders.length; i += 1) {
			downShaders[i].updateTextures({ u_input: downShaders[i - 1] });
			downShaders[i].step();
		}

		upShaders[0].updateTextures({ u_input: downShaders[downShaders.length - 1] });
		upShaders[0].step();

		for (let i = 1; i < upShaders.length; i += 1) {
			upShaders[i].updateTextures({ u_input: upShaders[i - 1] });
			upShaders[i].step();
		}

		shader.updateTextures({ u_blurred: upShaders[upShaders.length - 1] });
	});

	return () => {
		shader.destroy();
		downShaders.forEach(downShader => downShader.destroy());
		upShaders.forEach(upShader => upShader.destroy());
		stopVideoStream(video);
		canvas.remove();
	};
}
