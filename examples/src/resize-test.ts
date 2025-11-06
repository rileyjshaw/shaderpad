import ShaderPad, { helpers } from 'shaderpad';

let shader: ShaderPad | null = null;
let inputCanvasSmall: HTMLCanvasElement | null = null;
let inputCanvasBig: HTMLCanvasElement | null = null;
let outputCanvas: HTMLCanvasElement | null = null;
let currentInput: 'small' | 'big' = 'small';
let outputSize: 'small' | 'big' = 'big';

const SMALL_SIZE = 32;
const BIG_SIZE = 512;

function createInputCanvas(sizeName: 'small' | 'big'): HTMLCanvasElement {
	const canvas = document.createElement('canvas');
	const size = sizeName === 'small' ? SMALL_SIZE : BIG_SIZE;
	canvas.width = size;
	canvas.height = size;
	const ctx = canvas.getContext('2d')!;

	if (sizeName === 'small') {
		// Red circle with black outline
		ctx.fillStyle = 'red';
		ctx.strokeStyle = 'black';
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.arc(size / 2, size / 2, size / 4, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
	} else {
		// Blue triangle with yellow outline
		ctx.fillStyle = 'blue';
		ctx.strokeStyle = 'yellow';
		ctx.lineWidth = 4;
		ctx.beginPath();
		ctx.moveTo(size / 2, size / 4);
		ctx.lineTo(size / 4, (size * 3) / 4);
		ctx.lineTo((size * 3) / 4, (size * 3) / 4);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	}

	return canvas;
}

export async function init() {
	const fragmentShaderSrc = `#version 300 es
precision mediump float;

in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_input;
uniform highp sampler2DArray u_history;
uniform int u_historyFrameOffset;

void main() {
	vec2 uv = v_uv;
	
	// Sample input texture
	vec3 inputColor = texture(u_input, uv).rgb;
	
	// Sample history with feedback going up and to the left
	vec2 feedbackUV = fract(uv + vec2(0.1, 0.1)); // Shift up and left
	float z = historyZ(u_history, u_historyFrameOffset, 1);
	vec3 historyColor = texture(u_history, vec3(feedbackUV, z)).rgb;
	
	// Mix input and history for feedback effect
	vec3 color = mix(inputColor, historyColor, 0.5);
	
	outColor = vec4(color, 1.0);
}`;

	// Create input canvases
	inputCanvasSmall = createInputCanvas('small');
	inputCanvasBig = createInputCanvas('big');

	// Create output canvas
	const initialOutputSize = outputSize === 'small' ? SMALL_SIZE : BIG_SIZE;
	outputCanvas = document.createElement('canvas');
	outputCanvas.width = initialOutputSize;
	outputCanvas.height = initialOutputSize;
	outputCanvas.style.position = 'fixed';
	outputCanvas.style.top = '50%';
	outputCanvas.style.left = '50%';
	outputCanvas.style.transform = 'translate(-50%, -50%)';
	outputCanvas.style.border = '2px solid #333';
	document.body.appendChild(outputCanvas);

	// Create buttons
	const buttonContainer = document.createElement('div');
	buttonContainer.style.position = 'fixed';
	buttonContainer.style.top = '20px';
	buttonContainer.style.left = '50%';
	buttonContainer.style.transform = 'translateX(-50%)';
	buttonContainer.style.display = 'flex';
	buttonContainer.style.gap = '10px';
	buttonContainer.style.zIndex = '1000';

	const smallInputBtn = document.createElement('button');
	smallInputBtn.textContent = 'Small Input';
	smallInputBtn.addEventListener('click', () => {
		currentInput = 'small';
		if (shader) {
			shader.updateTextures({ u_input: inputCanvasSmall! });
		}
	});

	const bigInputBtn = document.createElement('button');
	bigInputBtn.textContent = 'Big Input';
	bigInputBtn.addEventListener('click', () => {
		currentInput = 'big';
		if (shader) {
			shader.updateTextures({ u_input: inputCanvasBig! });
		}
	});

	const smallOutputBtn = document.createElement('button');
	smallOutputBtn.textContent = 'Small Output';
	smallOutputBtn.addEventListener('click', () => {
		outputSize = 'small';
		if (outputCanvas) {
			outputCanvas.width = SMALL_SIZE;
			outputCanvas.height = SMALL_SIZE;
		}
	});

	const bigOutputBtn = document.createElement('button');
	bigOutputBtn.textContent = 'Big Output';
	bigOutputBtn.addEventListener('click', () => {
		outputSize = 'big';
		if (outputCanvas) {
			outputCanvas.width = BIG_SIZE;
			outputCanvas.height = BIG_SIZE;
		}
	});

	buttonContainer.appendChild(smallInputBtn);
	buttonContainer.appendChild(bigInputBtn);
	buttonContainer.appendChild(smallOutputBtn);
	buttonContainer.appendChild(bigOutputBtn);
	document.body.appendChild(buttonContainer);

	shader = new ShaderPad(fragmentShaderSrc, {
		canvas: outputCanvas,
		history: 1,
		plugins: [helpers()],
	});

	// Initialize input texture with current input
	shader.initializeTexture('u_input', currentInput === 'small' ? inputCanvasSmall! : inputCanvasBig!);

	window.setInterval(() => {
		shader!.updateTextures({
			u_input: currentInput === 'small' ? inputCanvasSmall! : inputCanvasBig!,
		});
		shader!.step(Date.now() / 1000);
	}, 500);
}

export function destroy() {
	if (shader) {
		shader.destroy();
		shader = null;
	}

	if (inputCanvasSmall) {
		inputCanvasSmall.remove();
		inputCanvasSmall = null;
	}

	if (inputCanvasBig) {
		inputCanvasBig.remove();
		inputCanvasBig = null;
	}

	if (outputCanvas) {
		outputCanvas.remove();
		outputCanvas = null;
	}

	// Remove buttons
	const buttonContainers = document.querySelectorAll('div');
	buttonContainers.forEach(container => {
		if (
			container.style.position === 'fixed' &&
			container.style.top === '20px' &&
			container.style.display === 'flex'
		) {
			container.remove();
		}
	});
}
