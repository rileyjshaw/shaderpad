/**
 * First-party React example using `shaderpad/react` to render a transparent
 * glowing sine wave between two paragraphs of article content.
 */
'use client';

import { ShaderPad } from 'shaderpad/react';
import { DocLink, docs } from '@/examples/details';

const shader = `#version 300 es
precision highp float;

in vec2 v_uv;
uniform float u_time;
uniform vec2 u_resolution;
out vec4 outColor;

void main() {
  float x = v_uv.x;
  float wave =
    0.5
    + 0.12 * sin(x * 11.0 - u_time * 2.6)
    + 0.03 * sin(x * 29.0 + u_time * 4.1);

  float distanceToWave = abs(v_uv.y - wave);
  float pixel = 1.0 / max(u_resolution.y, 1.0);
  float core = smoothstep(8.0 * pixel, 0.0, distanceToWave);
  float glow = smoothstep(56.0 * pixel, 0.0, distanceToWave);
  float shimmer = 0.7 + 0.3 * sin(u_time * 3.0 + x * 7.0);

  vec3 coreColor = vec3(0.60, 1.00, 0.76) * core;
  vec3 glowColor = vec3(0.05, 0.95, 0.35) * glow * shimmer * 0.7;
  float alpha = clamp(core + glow * 0.9, 0.0, 1.0);

  outColor = vec4(coreColor + glowColor, alpha);
}`;

export default function ReactWaveExample() {
	return (
		<div className="space-y-8">
			<p className="max-w-3xl text-lg text-slate-700 dark:text-slate-300">
				Instead of creating and tearing down a ShaderPad instance manually in an effect,{' '}
				<code>shaderpad/react</code> offers a{' '}
				<DocLink className="underline" href={docs.react}>
					React wrapper
				</DocLink>{' '}
				that renders directly inside a normal page layout. It is a good starting point for decorative overlays,
				embeds, and content-aware UI composition.
			</p>

			<section className="not-prose overflow-hidden rounded-[32px] border border-emerald-200/70 bg-white shadow-xl ring-1 shadow-emerald-100/70 ring-emerald-950/5 dark:border-emerald-500/30 dark:bg-slate-950 dark:shadow-none dark:ring-white/10">
				<div className="flex items-center justify-between border-b border-emerald-200/70 bg-emerald-50/80 px-5 py-3 text-xs font-semibold tracking-[0.18em] text-emerald-800 uppercase dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
					<span>React example</span>
					<span>Transparent wave</span>
				</div>
				<div className="relative h-72 w-full overflow-hidden bg-[linear-gradient(180deg,rgba(240,253,244,0.95),rgba(220,252,231,0.65))] dark:bg-[linear-gradient(180deg,rgba(6,24,18,0.95),rgba(3,10,8,0.98))]">
					<div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.12)_1px,transparent_1px)] bg-[size:32px_32px] opacity-60 dark:opacity-25" />
					<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.12),transparent_60%)]" />
					<ShaderPad
						shader={shader}
						aria-label="Transparent green sine wave rendered with shaderpad/react"
						className="relative z-10 h-full w-full"
					/>
				</div>
			</section>

			<p className="max-w-3xl text-lg text-slate-700 dark:text-slate-300">
				This pattern works well for embedded overlays, separators, or decorative motion inside an otherwise
				normal page layout. It is deliberately page-width content rather than a fullscreen scene to show how the
				React wrapper can fit into regular UI composition.
			</p>
		</div>
	);
}
