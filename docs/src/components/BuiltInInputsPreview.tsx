'use client';

import { useEffect, useRef } from 'react';
import ShaderPad from 'shaderpad';
import autosize from 'shaderpad/plugins/autosize';

const fragmentShaderSrc = `#version 300 es
precision highp float;

in vec2 v_uv;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_cursor;
uniform vec3 u_click;
uniform vec3 u_cursorColor;

out vec4 outColor;

void main() {
  vec2 uv = v_uv * u_resolution;
  vec2 dotGrid = mod(uv, 50.0) - 25.0;
  float dotDist = length(dotGrid);
  float dot = step(dotDist, 5.0);

  vec2 clickPos = u_click.xy;
  float isClicked = u_click.z;

  float cursorDist = distance(uv, u_cursor * u_resolution);
  float clickDist = distance(uv, clickPos * u_resolution);

  float cursorRadius = 25.0 + sin(u_time * 5.0) * 5.0 + isClicked * 15.0;
  float cursor = step(cursorDist, cursorRadius);
  float click = step(clickDist, 15.0);

  vec3 color = mix(vec3(0.0, 0.0, 1.0), vec3(1.0), dot);
  color = mix(color, u_cursorColor, cursor);
  color = mix(color, vec3(1.0), click);

  outColor = vec4(color, 1.0);
}`;

const getColor = (time: number) =>
	[time, time + (Math.PI * 2) / 3, time + (Math.PI * 4) / 3].map(x => 0.5 + 0.5 * Math.sin(x));

export function BuiltInInputsPreview() {
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

		shader.initializeUniform('u_cursorColor', 'float', getColor(0));

		let isDisposed = false;
		let isDocumentVisible = document.visibilityState === 'visible';
		let isIntersecting = true;
		let isPlaying = false;

		const syncPlayback = () => {
			if (isDisposed) return;

			const shouldPlay = isDocumentVisible && isIntersecting && canvas.isConnected;

			if (shouldPlay) {
				if (!isPlaying) {
					shader.play((time: number) => {
						shader.updateUniforms({ u_cursorColor: getColor(time) });
					});
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
						aria-label="ShaderPad built-in inputs preview"
						className="block h-full w-full"
					/>
				</div>
			</div>
		</div>
	);
}
