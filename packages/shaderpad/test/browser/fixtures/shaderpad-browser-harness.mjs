import ShaderPad from 'shaderpad';
import { ShaderPadElement } from 'shaderpad/web-component';
import hands from 'shaderpad/plugins/hands';
import helpers from 'shaderpad/plugins/helpers';
import deepHistory, { SHADER_OUTPUT } from 'shaderpad/plugins/deep-history';

const HISTORY_FRAMES = 16;
const CANVAS_WIDTH = 48;
const CANVAS_HEIGHT = HISTORY_FRAMES;
const SHARED_GLSL = `
#define THUMB_TIP 4
#define INDEX_TIP 8
#define MIDDLE_TIP 12
#define RING_TIP 16
#define PINKY_TIP 20
#define N_FINGERS 4

const int FINGER_TIPS[N_FINGERS] = int[](INDEX_TIP, MIDDLE_TIP, RING_TIP, PINKY_TIP);
const vec3 FINGER_COLORS[N_FINGERS] = vec3[](
	vec3(1.0, 0.45, 0.2),
	vec3(1.0, 0.9, 0.2),
	vec3(0.2, 1.0, 0.5),
	vec3(0.3, 0.6, 1.0)
);

const float RAISE_THRESHOLD = 0.08;
`;

function installWebGlLogger() {
	if (globalThis.__shaderpadGlOps) return globalThis.__shaderpadGlOps;

	const operations = [];
	const uniformNames = new WeakMap();
	const getUniformLocation = WebGL2RenderingContext.prototype.getUniformLocation;
	WebGL2RenderingContext.prototype.getUniformLocation = function (...args) {
		const location = getUniformLocation.apply(this, args);
		if (location) uniformNames.set(location, args[1]);
		return location;
	};
	const methods = [
		'compileShader',
		'linkProgram',
		'copyTexSubImage3D',
		'readPixels',
		'texImage2D',
		'texSubImage2D',
		'texSubImage3D',
		'uniform1f',
		'uniform2f',
		'uniform3f',
		'uniform4f',
		'uniform1i',
		'uniform2i',
		'uniform3i',
		'uniform4i',
		'uniform1ui',
		'uniform2ui',
		'uniform3ui',
		'uniform4ui',
		'uniform1fv',
		'uniform2fv',
		'uniform3fv',
		'uniform4fv',
		'uniform1iv',
		'uniform2iv',
		'uniform3iv',
		'uniform4iv',
		'uniform1uiv',
		'uniform2uiv',
		'uniform3uiv',
		'uniform4uiv',
	];
	for (const name of methods) {
		const original = WebGL2RenderingContext.prototype[name];
		WebGL2RenderingContext.prototype[name] = function (...args) {
			operations.push({
				method: name,
				canvasId: this.canvas?.dataset?.testId ?? null,
				uniform: name.startsWith('uniform') ? uniformNames.get(args[0]) : undefined,
			});
			return original.apply(this, args);
		};
	}
	globalThis.__shaderpadGlOps = operations;
	return operations;
}

function resetGlOps() {
	installWebGlLogger().length = 0;
}

async function createControllableVideo(size = 32) {
	const sourceCanvas = document.createElement('canvas');
	sourceCanvas.width = size;
	sourceCanvas.height = size;
	const ctx = sourceCanvas.getContext('2d');
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, size, size);

	const video = document.createElement('video');
	video.muted = true;
	video.playsInline = true;
	video.srcObject = sourceCanvas.captureStream(1);

	let currentTime = 0;
	Object.defineProperty(video, 'currentTime', {
		get: () => currentTime,
		set: value => {
			currentTime = value;
		},
		configurable: true,
	});
	Object.defineProperty(video, 'videoWidth', {
		get: () => size,
		configurable: true,
	});
	Object.defineProperty(video, 'videoHeight', {
		get: () => size,
		configurable: true,
	});
	Object.defineProperty(video, 'readyState', {
		get: () => 4,
		configurable: true,
	});

	await video.play().catch(() => {});

	return { sourceCanvas, video };
}

function createHistoryRowsShader(historyFrames) {
	return `#version 300 es
precision mediump float;
in vec2 v_uv;
out vec4 outColor;
${SHARED_GLSL}

void main() {
	float mask = 0.0;
	vec2 px = v_uv * u_resolution;

	for (int i = 0; i < ${historyFrames}; ++i) {
		if (nHandsAt(i) < 1) continue;
		vec2 pos = vec2(handLandmark(0, INDEX_TIP, i));
		vec2 dotPx = vec2(pos.x * u_resolution.x, float(i) + 0.5);
		float d = distance(px, dotPx);
		mask = max(mask, 1.0 - step(0.75, d));
	}

	outColor = vec4(vec3(mask), 1.0);
}`;
}

function createTrailMaskShader(historyFrames) {
	return `#version 300 es
precision mediump float;
in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_webcam;
#define HISTORY_FRAMES ${historyFrames}
${SHARED_GLSL}

bool isRaised(int fingerIndex, int framesAgo) {
	if (nHandsAt(framesAgo) < 1) return false;
	vec2 thumb = vec2(handLandmark(0, THUMB_TIP, framesAgo));
	vec2 tip = vec2(handLandmark(0, FINGER_TIPS[fingerIndex], framesAgo));
	return distance(tip, thumb) > RAISE_THRESHOLD;
}

float distToSegment(vec2 p, vec2 a, vec2 b) {
	vec2 ba = b - a;
	float h = clamp(dot(p - a, ba) / dot(ba, ba), 0.0, 1.0);
	return length(p - a - ba * h);
}

void main() {
	vec2 uv = fitCover(vec2(1.0 - v_uv.x, v_uv.y), vec2(textureSize(u_webcam, 0)));
	float pxPerUv = u_resolution.y;
	float alpha = 0.0;

	for (int f = 0; f < N_FINGERS; ++f) {
		if (!isRaised(f, 0)) continue;
		vec2 prev = vec2(-999.0);
		for (int i = HISTORY_FRAMES - 1; i >= 0; --i) {
			if (nHandsAt(i) < 1) {
				prev = vec2(-999.0);
				continue;
			}

			vec2 pos = vec2(handLandmark(0, FINGER_TIPS[f], i));
			if (prev.x > -500.0) {
				float age = float(i) / float(HISTORY_FRAMES);
				float d = distToSegment(uv, prev, pos);
				float coreR = mix(12.0, 3.0, age) / pxPerUv;
				alpha = max(alpha, smoothstep(coreR, coreR * 0.3, d));
			}
			prev = pos;
		}
	}

	outColor = vec4(vec3(alpha), 1.0);
}`;
}

function createMinimalOutputShader() {
	return `#version 300 es
precision mediump float;
in vec2 v_uv;
out vec4 outColor;
void main() {
	outColor = vec4(0.0, 0.0, 0.0, 1.0);
}`;
}

function interceptUniformUpdates(shader, uniformName, destination) {
	const original = shader.updateUniforms.bind(shader);
	shader.updateUniforms = (updates, options) => {
		if (Object.prototype.hasOwnProperty.call(updates, uniformName)) {
			destination.push(updates[uniformName]);
		}
		return original(updates, options);
	};
}

function readCanvasAscii(shader) {
	const source = shader.canvas;
	const width = source.width;
	const height = source.height;
	const scratch = document.createElement('canvas');
	scratch.width = width;
	scratch.height = height;
	const ctx = scratch.getContext('2d', { willReadFrequently: true });
	ctx.drawImage(source, 0, 0);
	const pixels = ctx.getImageData(0, 0, width, height).data;

	const lines = [];
	for (let y = height - 1; y >= 0; --y) {
		let line = '';
		for (let x = 0; x < width; ++x) {
			const red = pixels[(y * width + x) * 4];
			line += red > 127 ? '#' : '.';
		}
		lines.push(line);
	}
	return lines.join('\n');
}

function summarizeRowPeaks(asciiFrame) {
	return asciiFrame.split('\n').map(line => {
		const indices = [];
		for (let i = 0; i < line.length; ++i) {
			if (line[i] === '#') indices.push(i);
		}
		return indices;
	});
}

function waitForHook(shader, name) {
	return new Promise(resolve => {
		const handler = value => {
			shader.off(name, handler);
			resolve(value);
		};
		shader.on(name, handler);
	});
}

async function flushAsyncWork(turns = 2) {
	for (let i = 0; i < turns; ++i) {
		await Promise.resolve();
		await new Promise(resolve => setTimeout(resolve, 0));
	}
}

async function waitFor(predicate, { timeoutMs = 2000, intervalMs = 10 } = {}) {
	const start = performance.now();
	while (!predicate()) {
		if (performance.now() - start > timeoutMs) {
			throw new Error('Timed out waiting for browser harness condition');
		}
		await new Promise(resolve => setTimeout(resolve, intervalMs));
	}
}

async function createFingerPensHarness(mount, options = {}) {
	const { __mediapipeMockState } = await import('@mediapipe/tasks-vision');
	__mediapipeMockState.reset();
	__mediapipeMockState.sequence = Array.from({ length: 256 }, (_, index) => ({
		x: 0.1 + (index % 10) * 0.08,
		y: 0.5,
	}));

	resetGlOps();

	const container = document.createElement('div');
	mount.replaceChildren(container);

	const trailsCanvas = document.createElement('canvas');
	trailsCanvas.dataset.testId = 'trails';
	trailsCanvas.width = options.width ?? CANVAS_WIDTH;
	trailsCanvas.height = options.height ?? CANVAS_HEIGHT;
	container.appendChild(trailsCanvas);

	const outputCanvas = document.createElement('canvas');
	outputCanvas.dataset.testId = 'output';
	outputCanvas.width = options.width ?? CANVAS_WIDTH;
	outputCanvas.height = options.height ?? CANVAS_HEIGHT;

	const { video } = await createControllableVideo(32);
	const records = {
		frameOffsets: [],
		trailsResults: [],
		outputResults: [],
		updateFrames: [],
		videoTimes: [],
	};

	const trailsShader = new ShaderPad(
		options.mode === 'trail-mask' ? createTrailMaskShader(HISTORY_FRAMES) : createHistoryRowsShader(HISTORY_FRAMES),
		{
			canvas: trailsCanvas,
			plugins: [
				helpers(),
				hands({
					textureName: 'u_webcam',
					options: { maxHands: 1, history: HISTORY_FRAMES },
				}),
			],
		},
	);
	const outputShader = new ShaderPad(createMinimalOutputShader(), {
		canvas: outputCanvas,
		plugins: [hands({ textureName: 'u_webcam', options: { maxHands: 1 } })],
	});

	interceptUniformUpdates(trailsShader, 'u_handLandmarksTexFrameOffset', records.frameOffsets);
	trailsShader.on('hands:result', () => records.trailsResults.push(video.currentTime));
	outputShader.on('hands:result', () => records.outputResults.push(video.currentTime));

	const trailsReady = waitForHook(trailsShader, 'hands:ready');
	const outputReady = waitForHook(outputShader, 'hands:ready');
	trailsShader.initializeTexture('u_webcam', video);
	outputShader.initializeTexture('u_webcam', video);

	await Promise.all([trailsReady, outputReady]);
	await waitFor(() => __mediapipeMockState.createCalls === 1);
	const initialUpdates = { u_webcam: video };
	trailsShader.updateTextures(initialUpdates);
	outputShader.updateTextures(initialUpdates);
	await flushAsyncWork();
	await waitFor(() => __mediapipeMockState.detectCalls.length >= 1);
	await flushAsyncWork();

	let outputFrame = 0;
	function advanceVideoFrame() {
		video.currentTime += 1 / 30;
		records.videoTimes.push(video.currentTime);
	}

	async function runOutputFrame({ updateTrails, advanceVideo }) {
		if (advanceVideo) {
			advanceVideoFrame();
		}
		const updates = { u_webcam: video };
		if (updateTrails) {
			records.updateFrames.push(outputFrame);
			trailsShader.updateTextures(updates);
			trailsShader.step();
		}
		outputShader.updateTextures(updates);
		++outputFrame;
		await flushAsyncWork();
	}

	async function runScenario({ outputFrames, trailEvery, videoEvery }) {
		for (let frame = 0; frame < outputFrames; ++frame) {
			await runOutputFrame({
				updateTrails: frame % trailEvery === 0,
				advanceVideo: frame % videoEvery === 0,
			});
		}
	}

	return {
		runScenario,
		getAsciiFrame: () => readCanvasAscii(trailsShader),
		getRowPeaks: () => summarizeRowPeaks(readCanvasAscii(trailsShader)),
		getState: () => ({
			frameOffsets: [...records.frameOffsets],
			trailsResults: [...records.trailsResults],
			outputResults: [...records.outputResults],
			updateFrames: [...records.updateFrames],
			videoTimes: [...records.videoTimes],
			detectCalls: [...__mediapipeMockState.detectCalls],
			createCalls: __mediapipeMockState.createCalls,
			glOps: [...globalThis.__shaderpadGlOps],
		}),
		destroy: () => {
			trailsShader.destroy();
			outputShader.destroy();
			for (const track of video.srcObject?.getTracks?.() ?? []) {
				track.stop();
			}
			container.remove();
		},
	};
}

async function createTransferHarness(mount, { sharedCanvas, format }) {
	resetGlOps();

	const container = document.createElement('div');
	mount.replaceChildren(container);

	const sourceCanvas = document.createElement('canvas');
	sourceCanvas.dataset.testId = 'source';
	sourceCanvas.width = 16;
	sourceCanvas.height = 16;
	container.appendChild(sourceCanvas);

	const destCanvas = sharedCanvas ? sourceCanvas : document.createElement('canvas');
	destCanvas.dataset.testId = sharedCanvas ? 'source' : 'dest';
	destCanvas.width = 16;
	destCanvas.height = 16;
	if (!sharedCanvas) container.appendChild(destCanvas);

	const source = new ShaderPad(
		`#version 300 es
precision mediump float;
in vec2 v_uv;
out vec4 outColor;
void main() { outColor = vec4(v_uv, 0.0, 1.0); }`,
		{ canvas: sourceCanvas, format },
	);
	const [historyPlugin, updateInput] = deepHistory('inputHistory', source, { history: 1, format });
	const historySample = format?.endsWith('I') ? 'vec4(inputHistory(v_uv, 0))' : 'inputHistory(v_uv, 0)';
	const dest = new ShaderPad(
		`#version 300 es
precision mediump float;
in vec2 v_uv;
out vec4 outColor;
void main() { outColor = ${historySample}; }`,
		{ canvas: destCanvas, plugins: [historyPlugin] },
	);

	while (source.gl.getError() !== source.gl.NO_ERROR) {}
	while (dest.gl.getError() !== dest.gl.NO_ERROR) {}
	resetGlOps();
	updateInput(source);

	return {
		getOps: () => [...globalThis.__shaderpadGlOps],
		getErrors: () => ({ source: source.gl.getError(), dest: dest.gl.getError() }),
		destroy: () => {
			source.destroy();
			dest.destroy();
			container.remove();
		},
	};
}

function auditFormatUploads() {
	const shader = new ShaderPad(createMinimalOutputShader(), {
		canvas: new OffscreenCanvas(2, 2),
	});
	const cases = [
		['u_half', 'RGBA16F', null],
		['u_565', 'RGB565', new Uint16Array(1)],
		['u_5551', 'RGB5_A1', new Uint16Array(1)],
		['u_4444', 'RGBA4', new Uint16Array(1)],
		['u_111110', 'R11F_G11F_B10F', new Uint32Array(1)],
		['u_shared_exp', 'RGB9_E5', new Float32Array(3)],
	];
	const errors = [];
	for (const [name, format, data] of cases) {
		shader.initializeTexture(
			name,
			{ data, width: 1, height: 1 },
			{ format, minFilter: 'NEAREST', magFilter: 'NEAREST' },
		);
		errors.push([format, shader.gl.getError()]);
	}
	shader.updateTextures({
		u_half: { data: new Float32Array([1, 2, 3, 4]), width: 1, height: 1 },
	});
	errors.push(['RGBA16F Float32Array update', shader.gl.getError()]);
	shader.updateTextures({
		u_shared_exp: { data: new Uint32Array(1), width: 1, height: 1 },
	});
	errors.push(['RGB9_E5 Uint32Array update', shader.gl.getError()]);
	shader.initializeTexture(
		'u_half_history',
		{ data: null, width: 1, height: 1 },
		{ format: 'RGBA16F', history: 1, minFilter: 'NEAREST', magFilter: 'NEAREST' },
	);
	errors.push(['RGBA16F null history', shader.gl.getError()]);
	shader.updateTextures({
		u_half_history: { data: new Uint16Array(4), width: 1, height: 1 },
	});
	errors.push(['RGBA16F Uint16Array history update', shader.gl.getError()]);
	shader.destroy();
	return errors;
}

function auditDeepHistory() {
	const canvas = document.createElement('canvas');
	canvas.width = 4;
	canvas.height = 4;
	const source = { data: new Uint8Array(4 * 4 * 4), width: 4, height: 4 };
	const [historyPlugin] = deepHistory('inputHistory', source, { history: 3, chunks: 2 });
	const shader = new ShaderPad(
		`#version 300 es
precision mediump float;
in vec2 v_uv;
uniform int u_frame;
out vec4 outColor;
void main() {
	outColor = inputHistory(v_uv, min(u_frame, 3));
}`,
		{ canvas, plugins: [historyPlugin] },
	);
	while (shader.gl.getError() !== shader.gl.NO_ERROR) {}

	shader.step();
	const firstStep = shader.gl.getError();
	shader.step();
	const secondStep = shader.gl.getError();
	shader.draw();
	const draw = shader.gl.getError();
	shader.destroy();

	return { firstStep, secondStep, draw };
}

function auditEagerDeepHistory() {
	resetGlOps();
	const canvas = document.createElement('canvas');
	canvas.width = canvas.height = 4;
	const source = { data: new Uint8Array(4 * 4 * 4), width: 4, height: 4 };
	const [historyPlugin, updateInput] = deepHistory('inputHistory', source, { history: 7, chunks: 4 });
	const shader = new ShaderPad(
		`#version 300 es
precision mediump float;
in vec2 v_uv;
uniform vec2 u_pending;
out vec4 outColor;
void main() { outColor = inputHistory(v_uv, 0) + vec4(u_pending, 0.0, 0.0); }`,
		{ canvas, plugins: [historyPlugin] },
	);
	shader.initializeUniform('u_pending', 'float', [1, 2]);
	shader.updateUniforms({ u_pending: [3, 4] });
	const startup = [...installWebGlLogger()];
	resetGlOps();
	updateInput(source);
	shader.step();
	const warm = [...installWebGlLogger()];
	shader.destroy();

	return { startup, warm };
}

function auditTypedDeepHistoryAccessors() {
	return [
		['RGBA8', 'vec4', new Uint8Array(4)],
		['RGBA32UI', 'uvec4', new Uint32Array(4)],
		['RGBA32I', 'ivec4', new Int32Array(4)],
	].map(([format, type, data]) => {
		const [historyPlugin] = deepHistory(
			'inputHistory',
			{ data, width: 1, height: 1 },
			{
				format,
				history: 3,
				chunks: 2,
			},
		);
		const shader = new ShaderPad(
			`#version 300 es
precision highp float;
precision highp int;
in vec2 v_uv;
layout(location=0) out ${type} outColor;
void main() { outColor = inputHistory(v_uv, 0); }`,
			{ canvas: new OffscreenCanvas(4, 4), format, plugins: [historyPlugin] },
		);
		shader.draw();
		const error = shader.gl.getError();
		shader.destroy();
		return [format, error];
	});
}

function auditDeepOutputFormatInheritance() {
	const [historyPlugin] = deepHistory('outputHistory', SHADER_OUTPUT, { history: 3, chunks: 2 });
	const shader = new ShaderPad(
		`#version 300 es
precision highp float;
precision highp int;
in vec2 v_uv;
layout(location=0) out uvec4 outColor;
void main() { outColor = outputHistory(v_uv, 0) + uvec4(1u, 2u, 3u, 4u); }`,
		{ canvas: new OffscreenCanvas(4, 4), format: 'RGBA32UI', plugins: [historyPlugin] },
	);
	shader.step();
	const error = shader.gl.getError();
	shader.destroy();
	return error;
}

function readRedPixels(shader, width) {
	const pixels = new Uint8Array(width * 4);
	shader.gl.readPixels(0, 0, width, 1, shader.gl.RGBA, shader.gl.UNSIGNED_BYTE, pixels);
	return Array.from({ length: width }, (_, i) => pixels[i * 4]);
}

function auditHistoryChronology() {
	const inputCanvas = document.createElement('canvas');
	inputCanvas.width = 5;
	inputCanvas.height = 1;
	const source = value => ({ data: new Uint8Array([value, 0, 0, 255]), width: 1, height: 1 });
	const [historyPlugin, updateInput] = deepHistory('inputHistory', source(10), {
		history: 4,
		chunks: 2,
		minFilter: 'NEAREST',
		magFilter: 'NEAREST',
	});
	const input = new ShaderPad(
		`#version 300 es
precision mediump float;
in vec2 v_uv;
out vec4 outColor;
void main() { outColor = inputHistory(v_uv, int(floor(v_uv.x * 5.0))); }`,
		{ canvas: inputCanvas, plugins: [historyPlugin] },
	);
	for (const value of [20, 30, 40, 50]) updateInput(source(value));
	input.draw();
	const beforeWrap = readRedPixels(input, 5);
	updateInput(source(60));
	input.draw();
	const afterWrap = readRedPixels(input, 5);
	input.destroy();

	const outputCanvas = document.createElement('canvas');
	outputCanvas.width = 3;
	outputCanvas.height = 1;
	const output = new ShaderPad(
		`#version 300 es
precision mediump float;
in vec2 v_uv;
uniform int u_frame;
uniform highp sampler2DArray u_history;
uniform int u_historyFrameOffset;
out vec4 outColor;
void main() {
		if (u_frame < 3) outColor = vec4(float(u_frame) / 4.0, 0.0, 0.0, 1.0);
		else outColor = texture(u_history, vec3(v_uv, historyZ(u_history, u_historyFrameOffset, 1 + int(floor(v_uv.x * 3.0)))));
}`,
		{ canvas: outputCanvas, history: 3, minFilter: 'NEAREST', magFilter: 'NEAREST', plugins: [helpers()] },
	);
	for (let i = 0; i < 4; ++i) output.step();
	const outputAges = readRedPixels(output, 3);
	output.destroy();

	return { beforeWrap, afterWrap, outputAges };
}

function auditDeepOutputHistory() {
	const canvas = document.createElement('canvas');
	canvas.width = 3;
	canvas.height = 1;
	const [historyPlugin] = deepHistory('outputHistory', SHADER_OUTPUT, {
		history: 4,
		chunks: 2,
		minFilter: 'NEAREST',
		magFilter: 'NEAREST',
	});
	const shader = new ShaderPad(
		`#version 300 es
precision mediump float;
in vec2 v_uv;
uniform int u_frame;
out vec4 outColor;
void main() {
	if (u_frame < 4) outColor = vec4(float(u_frame) / 4.0, 0.0, 0.0, 1.0);
	else outColor = outputHistory(v_uv, int(floor(v_uv.x * 3.0)));
}`,
		{ canvas, plugins: [historyPlugin] },
	);
	for (let i = 0; i < 5; ++i) shader.step();
	const ages = readRedPixels(shader, 3);
	const error = shader.gl.getError();
	shader.destroy();
	return { ages, error };
}

function defineTestElement() {
	if (!customElements.get('shader-pad-test')) customElements.define('shader-pad-test', ShaderPadElement);
}

async function auditConcurrentTextureLoading(mount) {
	defineTestElement();
	const element = document.createElement('shader-pad-test');
	element.autoplay = false;
	element.autosize = false;
	const script = document.createElement('script');
	script.type = 'x-shader/x-fragment';
	script.textContent = `#version 300 es
precision mediump float;
in vec2 v_uv;
out vec4 outColor;
void main() { outColor = vec4(v_uv, 0.0, 1.0); }`;
	element.append(script);

	const listening = [];
	const images = ['u_first', 'u_second'].map((name, i) => {
		const image = document.createElement('img');
		image.dataset.texture = name;
		const addEventListener = image.addEventListener.bind(image);
		image.addEventListener = (type, listener, options) => {
			if (type === 'load') listening[i] = true;
			return addEventListener(type, listener, options);
		};
		element.append(image);
		return image;
	});
	mount.append(element);
	for (let i = 0; i < 20 && listening.filter(Boolean).length < 2; ++i) {
		await new Promise(resolve => setTimeout(resolve));
	}
	images.forEach(image => image.dispatchEvent(new Event('error')));
	element.remove();
	return listening;
}

export async function installBrowserHarness(mount) {
	installWebGlLogger();
	globalThis.__shaderpadBrowserHarness = {
		auditDeepHistory,
		auditDeepOutputHistory,
		auditEagerDeepHistory,
		auditTypedDeepHistoryAccessors,
		auditDeepOutputFormatInheritance,
		auditHistoryChronology,
		auditConcurrentTextureLoading: () => auditConcurrentTextureLoading(mount),
		auditFormatUploads,
		createFingerPensHarness: options => createFingerPensHarness(mount, options),
		createTransferHarness: options => createTransferHarness(mount, options),
	};
}
