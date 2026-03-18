'use client';

import { useEffect, useRef } from 'react';
import ShaderPad from 'shaderpad';
import autosize from 'shaderpad/plugins/autosize';
import save, { WithSave } from 'shaderpad/plugins/save';

const fragmentShaderSrc = `#version 300 es
precision highp float;

in vec2 v_uv;
uniform float u_time;
uniform vec2 u_resolution;
out vec4 outColor;

// Surface tension, by @rileyjshaw: https://www.shadertoy.com/view/3XGyRV
vec2 fn(vec2 uv, float t) {
  float x = uv.x;
  float y = uv.y;
  float sx = sin(x);
  float sy = sin(y);
  float xx = x * x;
  float yy = y * y;
  float safeYY = max(yy, 0.001);

  float xOut =
    sin(t + sin(sx) + t) +
    (sin(xx - yy) + sin(t / safeYY / 3.0) / 64.0);
  float yOut =
    tan((xx + yy) - sx * t / 2.0) / 16.0 +
    tan(cos(sy + t));

  return vec2(xOut, yOut);
}

void main() {
  vec2 uv = v_uv;
  uv = uv * 10.0 - 5.0;
  uv.y *= u_resolution.y / u_resolution.x;

  float t = sin(u_time / 8.0) * 8.0;
  vec2 result = fn(uv, t);
  float tDist = t * length(result);

  float g = 0.5 - 0.5 * sin(tDist);
  float r = sin(t * (g - 1.5));
  float b = cos(tDist);

  r = (r + 1.0) / 2.0 - 0.5;
  g = (g + 3.0) / 4.0;
  b = sqrt((b + 3.0) / 4.0);

  outColor = vec4(r, g, b, 1.0);
}`;

export function SavingImagesPreview() {
	const containerRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const shaderRef = useRef<WithSave<ShaderPad> | null>(null);

	useEffect(() => {
		const container = containerRef.current;
		const canvas = canvasRef.current;

		if (!container || !canvas) return;

		const shader = new ShaderPad(fragmentShaderSrc, {
			canvas,
			plugins: [save(), autosize()],
		}) as WithSave<ShaderPad>;

		shaderRef.current = shader;

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
			shaderRef.current = null;
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			intersectionObserver?.disconnect();
			shader.destroy();
		};
	}, []);

	const handleSave = () => {
		void shaderRef.current?.save('soft-spirals', 'Saved from the ShaderPad saving images guide.');
	};

	return (
		<div
			ref={containerRef}
			className="not-prose my-8 overflow-hidden rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.9),_rgba(226,232,240,0.92)_40%,_rgba(226,232,240,0.75)_100%)] shadow-xl ring-1 ring-slate-950/5 dark:border-slate-700 dark:bg-linear-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:ring-white/10"
		>
			<div className="flex items-center justify-between border-b border-slate-900/10 px-4 py-3 text-xs font-medium tracking-[0.16em] text-slate-600 uppercase dark:border-white/10 dark:text-slate-300">
				<span>Live preview</span>
				<span>PNG export</span>
			</div>
			<div className="p-3 sm:p-4">
				<div className="relative aspect-16/10 overflow-hidden rounded-[24px] bg-slate-950 shadow-2xl ring-1 ring-black/10">
					<canvas
						ref={canvasRef}
						aria-label="Animated ShaderPad save preview"
						className="block h-full w-full"
					/>
					<div className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-950/30 via-transparent to-white/10" />
					<button
						type="button"
						onClick={handleSave}
						className="absolute bottom-4 left-4 inline-flex items-center rounded-full border border-white/20 bg-white/88 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-slate-950/25 backdrop-blur transition hover:bg-white focus:ring-2 focus:ring-sky-300/80 focus:outline-none"
					>
						Save
					</button>
				</div>
			</div>
		</div>
	);
}
