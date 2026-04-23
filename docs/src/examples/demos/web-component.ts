/**
 * Fullscreen <shader-pad> example with preset-based animation controls.
 * The declarative DOM shape, including the inline fragment shader, lives in web-component.html.
 */
import {
	createShaderPadElement,
	type ShaderPadElement,
	type ShaderPadElementLoadEventDetail,
} from 'shaderpad/web-component';

import { handleTouch } from '@/examples/demo-utils';
import type { ExampleContext } from '@/examples/runtime';

import markup from './web-component.html';

const variants = [
	{
		u_maxAngle: (6 * Math.PI) / 180,
		u_speed: 2,
		u_phaseStep: Math.PI / 8,
		u_stepSize: 142,
		u_squareSize: 100,
		u_border: 0.25,
		u_isColorful: 0,
	},
	{
		u_maxAngle: Math.PI,
		u_speed: 2,
		u_phaseStep: Math.PI / 16,
		u_stepSize: 160,
		u_squareSize: 1,
		u_border: 0,
		u_isColorful: 1,
	},
	{
		u_maxAngle: Math.PI / 180,
		u_speed: 4,
		u_phaseStep: 0.3,
		u_stepSize: 1,
		u_squareSize: 120,
		u_border: 0.3,
		u_isColorful: 0,
	},
	{
		u_maxAngle: 2 * Math.PI,
		u_speed: 0.025,
		u_phaseStep: Math.PI,
		u_stepSize: 10,
		u_squareSize: 160,
		u_border: 0.2,
		u_isColorful: 0,
	},
	{
		u_maxAngle: 2 * Math.PI,
		u_speed: 0.025,
		u_phaseStep: (Math.PI * 3) / 2,
		u_stepSize: 18,
		u_squareSize: 160,
		u_border: 0.3,
		u_isColorful: 0,
	},
	{
		u_maxAngle: 2 * Math.PI,
		u_speed: 0.025,
		u_phaseStep: Math.PI,
		u_stepSize: 100,
		u_squareSize: 20,
		u_border: 0.05,
		u_isColorful: 0,
	},
	{
		u_maxAngle: 200 * Math.PI,
		u_speed: 0.001,
		u_phaseStep: Math.PI / 120,
		u_stepSize: 4,
		u_squareSize: 20,
		u_border: 0.15,
		u_isColorful: 1,
	},
	{
		u_maxAngle: Math.PI / 100,
		u_speed: 4,
		u_phaseStep: Math.PI / 42,
		u_stepSize: 10,
		u_squareSize: 42,
		u_border: 0.42,
		u_isColorful: 0,
	},
];

function createShaderElement() {
	const template = document.createElement('template');
	template.innerHTML = markup.trim();

	const shaderElement = template.content.querySelector('shader-pad') as ShaderPadElement | null;
	const shaderScript = template.content.querySelector('script[type="x-shader/x-fragment"]');

	if (!(shaderScript instanceof HTMLScriptElement) || !shaderElement) {
		throw new Error('The web component example template is missing its <shader-pad> structure.');
	}

	return shaderElement;
}

function waitForShaderLoad(element: ShaderPadElement) {
	return new Promise<ShaderPadElementLoadEventDetail['shader']>((resolve, reject) => {
		const handleLoad = (event: Event) => {
			cleanup();
			resolve((event as CustomEvent<ShaderPadElementLoadEventDetail>).detail.shader);
		};
		const handleError = (event: Event) => {
			cleanup();
			reject((event as CustomEvent<{ error: unknown }>).detail.error);
		};
		const cleanup = () => {
			element.removeEventListener('load', handleLoad);
			element.removeEventListener('error', handleError);
		};

		element.addEventListener('load', handleLoad, { once: true });
		element.addEventListener('error', handleError, { once: true });
	});
}

export async function init({ mount }: ExampleContext) {
	if (!customElements.get('shader-pad')) {
		customElements.define('shader-pad', createShaderPadElement());
	}

	const shaderElement = createShaderElement();
	mount.appendChild(shaderElement);

	const shader = await waitForShaderLoad(shaderElement);
	const canvas = shaderElement.canvas;
	if (!canvas) {
		throw new Error('The web component did not create a render canvas.');
	}

	let isPlaying = true;
	let variantIdx = 0;

	for (const [key, value] of Object.entries(variants[0])) {
		shader.initializeUniform(key, 'float', value);
	}

	const togglePlayback = () => {
		isPlaying = !isPlaying;
		isPlaying ? shader.play() : shader.pause();
	};

	const changeVariant = (step: number) => {
		variantIdx = (variantIdx + step + variants.length) % variants.length;
		shader.updateUniforms(variants[variantIdx]);
	};

	shader.play();

	const keydownHandler = (event: KeyboardEvent) => {
		switch (event.key) {
			case ' ':
				togglePlayback();
				break;
			case 'ArrowRight':
				changeVariant(1);
				break;
			case 'ArrowLeft':
				changeVariant(-1);
				break;
		}
	};

	document.addEventListener('keydown', keydownHandler);
	const removeTouchControls = handleTouch(
		canvas,
		{
			onMove(direction, delta, _additionalTouchCount, _initialX, _initialY, event) {
				if (direction !== 'x') {
					return;
				}

				event.preventDefault();
				changeVariant(delta > 0 ? 1 : -1);
			},
		},
		{ moveThresholdPx: 24, once: true },
	);

	return () => {
		document.removeEventListener('keydown', keydownHandler);
		removeTouchControls();
		shaderElement.destroy();
		shaderElement.remove();
	};
}
