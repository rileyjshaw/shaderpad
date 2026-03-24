'use client';

import { useEffect, useRef } from 'react';
import ShaderPad from 'shaderpad';
import autosize from 'shaderpad/plugins/autosize';

const DEFAULT_SIZE = 668;

const fragmentShaderSrc = `#version 300 es
precision highp float;

in vec2 v_uv;
uniform float u_time;
uniform vec2 u_resolution;

out vec4 outColor;

// Fragmentum by Jaenam
// https://www.shadertoy.com/view/t3SyzV

void main() {
	vec2 I = gl_FragCoord.xy;
	vec4 O = vec4(0.0);
	float i,d,s;
	vec2 r = u_resolution;
	vec3 p;
	mat2 R = mat2(cos(u_time/2.+vec4(0,33,11,0)));

	for(O*=i; i++<1e2; O+=max(1.3*sin(vec4(1,2,3,1)+i*.3)/s,-length(p*p)))
		p = vec3((I+I - r.xy)/r.y*d*R, d-8.), p.xz*=R,
		d+=s=.012+.07*abs(max(sin(length(fract(p)*p)),length(p)-4.)-i/1e2);

	outColor=tanh(O*O/8e5);
}`;

function isElementInViewport(element: HTMLElement) {
	const rect = element.getBoundingClientRect();
	return (
		rect.width > 0 &&
		rect.height > 0 &&
		rect.bottom > 0 &&
		rect.right > 0 &&
		rect.top < window.innerHeight &&
		rect.left < window.innerWidth
	);
}

function isElementRenderable(element: HTMLElement) {
	if (typeof element.checkVisibility === 'function') {
		return element.checkVisibility({
			contentVisibilityAuto: true,
			checkOpacity: true,
			checkVisibilityCSS: true,
		});
	}

	const style = window.getComputedStyle(element);
	const rect = element.getBoundingClientRect();
	return (
		rect.width > 0 &&
		rect.height > 0 &&
		style.display !== 'none' &&
		style.visibility !== 'hidden' &&
		style.opacity !== '0'
	);
}

export function HeroBackground({ className, style, ...props }: React.ComponentPropsWithoutRef<'div'>) {
	const containerRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const container = containerRef.current;
		const canvas = canvasRef.current;

		if (!container || !canvas) return;

		const shader = new ShaderPad(fragmentShaderSrc, {
			canvas,
			plugins: [autosize()],
		});

		let isDisposed = false;
		let isDocumentVisible = document.visibilityState === 'visible';
		let isIntersecting = isElementInViewport(container);
		let isPlaying = false;

		const syncPlayback = () => {
			if (isDisposed) return;

			const shouldPlay =
				isDocumentVisible && isIntersecting && isElementRenderable(container) && canvas.isConnected;

			if (shouldPlay) {
				if (!isPlaying) {
					shader.play();
					isPlaying = true;
				}
				return;
			}

			if (isPlaying) {
				shader.pause();
				isPlaying = false;
			}
		};

		const intersectionObserver =
			typeof IntersectionObserver === 'function'
				? new IntersectionObserver(
						entries => {
							isIntersecting = entries.some(entry => entry.isIntersecting && entry.intersectionRatio > 0);
							syncPlayback();
						},
						{ threshold: 0.01 },
					)
				: null;

		intersectionObserver?.observe(container);

		const resizeObserver =
			typeof ResizeObserver === 'function'
				? new ResizeObserver(() => {
						isIntersecting = isElementInViewport(container);
						syncPlayback();
					})
				: null;

		resizeObserver?.observe(container);

		const handleVisibilityChange = () => {
			isDocumentVisible = document.visibilityState === 'visible';
			syncPlayback();
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);
		syncPlayback();

		return () => {
			isDisposed = true;
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			intersectionObserver?.disconnect();
			resizeObserver?.disconnect();
			shader.destroy();
		};
	}, []);

	return (
		<div
			ref={containerRef}
			aria-hidden="true"
			className={className}
			style={{ width: DEFAULT_SIZE, aspectRatio: '1 / 1', ...style }}
			{...props}
		>
			<canvas ref={canvasRef} className="block size-full opacity-60" style={{ display: 'block' }} />
		</div>
	);
}
