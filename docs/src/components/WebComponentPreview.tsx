'use client';

import { createElement, useLayoutEffect } from 'react';

import { createShaderPadElement } from 'shaderpad/web-component';

const shader = `#version 300 es
precision highp float;

in vec2 v_uv;
uniform float u_time;
uniform vec2 u_resolution;
out vec4 outColor;

void main() {
  vec2 uv = v_uv * 2.0 - 1.0;
  uv.x *= u_resolution.x / u_resolution.y;

  float radius = length(uv);
  float ring = smoothstep(0.68, 0.22, abs(radius - (0.32 + 0.03 * sin(u_time * 1.6))));
  float bloom = smoothstep(0.95, 0.08, radius);
  float pulse = 0.62 + 0.38 * sin(u_time * 2.4 + radius * 9.0);
  vec3 color = vec3(0.06, 0.96, 0.46) * bloom + vec3(0.68, 1.0, 0.82) * ring * pulse;

  outColor = vec4(color, clamp(bloom + ring, 0.0, 1.0));
}`;

export function WebComponentPreview() {
	useLayoutEffect(() => {
		if (!customElements.get('shader-pad')) {
			customElements.define('shader-pad', createShaderPadElement());
		}
	}, []);

	return (
		<div className="not-prose my-8 overflow-hidden rounded-[28px] border border-emerald-200/70 bg-white shadow-lg ring-1 shadow-emerald-100/70 ring-emerald-950/5 dark:border-emerald-500/30 dark:bg-slate-950 dark:shadow-none dark:ring-white/10">
			<div className="border-b border-emerald-200/70 bg-emerald-50/80 px-4 py-3 text-xs font-semibold tracking-[0.18em] text-emerald-800 uppercase dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
				Web component preview
			</div>
			<div className="relative h-60 overflow-hidden bg-[linear-gradient(180deg,rgba(236,253,245,0.96),rgba(209,250,229,0.72))] dark:bg-[linear-gradient(180deg,rgba(5,20,15,0.95),rgba(3,10,8,0.98))]">
				<div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.14)_1px,transparent_1px)] bg-[size:30px_30px] opacity-55 dark:opacity-25" />
				<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.12),transparent_60%)]" />
				{createElement(
					'shader-pad',
					{
						className: 'relative z-10 block h-full w-full',
						'aria-label': 'ShaderPad web component preview',
					},
					createElement('script', { type: 'x-shader/x-fragment' }, shader),
				)}
			</div>
		</div>
	);
}
