'use client';

import { ShaderPad } from 'shaderpad/react';

const shader = `#version 300 es
precision highp float;

in vec2 v_uv;
uniform float u_time;
uniform vec2 u_resolution;
out vec4 outColor;

void main() {
  float wave =
    0.5
    + 0.13 * sin(v_uv.x * 10.0 - u_time * 2.4)
    + 0.025 * sin(v_uv.x * 26.0 + u_time * 3.9);

  float distanceToWave = abs(v_uv.y - wave);
  float pixel = 1.0 / max(u_resolution.y, 1.0);
  float core = smoothstep(7.0 * pixel, 0.0, distanceToWave);
  float glow = smoothstep(46.0 * pixel, 0.0, distanceToWave) * (0.75 + 0.25 * sin(u_time * 3.2));
  float alpha = clamp(core + glow * 0.85, 0.0, 1.0);
  vec3 color = vec3(0.08, 1.0, 0.42) * glow + vec3(0.62, 1.0, 0.78) * core;

  outColor = vec4(color, alpha);
}`;

export function ReactPreview() {
	return (
		<div className="not-prose my-8 overflow-hidden rounded-[28px] border border-emerald-200/70 bg-white shadow-lg ring-1 shadow-emerald-100/70 ring-emerald-950/5 dark:border-emerald-500/30 dark:bg-slate-950 dark:shadow-none dark:ring-white/10">
			<div className="border-b border-emerald-200/70 bg-emerald-50/80 px-4 py-3 text-xs font-semibold tracking-[0.18em] text-emerald-800 uppercase dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
				React preview
			</div>
			<div className="relative h-60 overflow-hidden bg-[linear-gradient(180deg,rgba(236,253,245,0.96),rgba(209,250,229,0.72))] dark:bg-[linear-gradient(180deg,rgba(5,20,15,0.95),rgba(3,10,8,0.98))]">
				<div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.14)_1px,transparent_1px)] bg-[size:30px_30px] opacity-55 dark:opacity-25" />
				<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.12),transparent_60%)]" />
				<ShaderPad
					shader={shader}
					aria-label="ShaderPad React preview"
					className="relative z-10 h-full w-full"
				/>
			</div>
		</div>
	);
}
