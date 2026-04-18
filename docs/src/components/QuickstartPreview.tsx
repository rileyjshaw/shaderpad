'use client';

import { useEffect, useRef } from 'react';
import ShaderPad from 'shaderpad';
import autosize from 'shaderpad/plugins/autosize';

const fragmentShaderSrc = `#version 300 es
precision highp float;

in vec2 v_uv;
uniform float u_time;
uniform vec2 u_cursor;
uniform vec2 u_resolution;

out vec4 outColor;

void main() {
  vec2 cursor = u_cursor * 2.0 - 1.0;
  vec2 uv = v_uv * 2.0 - 1.0 - cursor;
  uv.x *= u_resolution.x / u_resolution.y;
  float r = length(uv);
  float glow = 0.25 / max(r, 0.001);
  vec3 color = 0.5 + 0.5 * cos(u_time + r + vec3(0.0, 2.0, 4.0));
  outColor = vec4(color * glow, 1.0);
}`;

export function QuickstartPreview() {
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
		let isIntersecting = true;
		let isPlaying = false;

		const syncPlayback = () => {
			if (isDisposed) return;

			const shouldPlay = isDocumentVisible && isIntersecting && canvas.isConnected;

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
			shader.destroy();
		};
	}, []);

	return (
		<div
			ref={containerRef}
			className="not-prose my-8 overflow-hidden rounded-2xl border border-slate-200 bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 shadow-lg ring-1 ring-slate-950/5 dark:border-slate-700 dark:ring-white/10"
		>
			<div className="border-b border-white/10 px-4 py-3 text-xs font-medium tracking-[0.16em] text-slate-300 uppercase">
				Live preview
			</div>
			<div className="p-3 sm:p-4">
				<div className="aspect-16/10 overflow-hidden rounded-xl bg-slate-950">
					<canvas
						ref={canvasRef}
						aria-label="Animated ShaderPad quickstart preview"
						className="block h-full w-full"
					/>
				</div>
			</div>
		</div>
	);
}
