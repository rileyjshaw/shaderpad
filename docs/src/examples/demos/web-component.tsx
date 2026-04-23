'use client';

import { useLayoutEffect } from 'react';
import { createShaderPadElement } from 'shaderpad/web-component';
import { withBasePath } from '@/lib/site';
import markup from './web-component.html';

export default function WebComponentExample() {
	useLayoutEffect(() => {
		if (!customElements.get('shader-pad')) {
			customElements.define('shader-pad', createShaderPadElement());
		}
	}, []);

	const html = markup.replace('src="/trees.jpg"', `src="${withBasePath('/trees.jpg')}"`);

	return (
		<div className="space-y-6">
			<div className="max-w-3xl space-y-3 text-lg text-slate-700 dark:text-slate-300">
				<p>
					This example features declarative shader markup using <code>{'<shader-pad>'}</code>. It includes one
					image texture, one inline fragment shader, and no surrounding app code. The component can read
					texture data directly from its HTML children.
				</p>
			</div>

			<div className="not-prose inline-block space-y-3">
				<div className="overflow-hidden rounded-[32px] border border-emerald-200/70 bg-white shadow-xl ring-1 shadow-emerald-100/70 ring-emerald-950/5 dark:border-emerald-500/30 dark:bg-slate-950 dark:shadow-none dark:ring-white/10">
					<div className="bg-black">
						<div dangerouslySetInnerHTML={{ __html: html }} />
					</div>
				</div>

				<p className="text-sm leading-6 font-medium text-slate-500 dark:text-slate-400 [&_a]:text-emerald-600 [&_a]:underline [&_a]:decoration-emerald-400/60 [&_a]:underline-offset-4 dark:[&_a]:text-emerald-300">
					Photo by <a href="https://unsplash.com/@jeremybishop">Jeremy Bishop</a> on{' '}
					<a href="https://unsplash.com/photos/sun-light-passing-through-green-leafed-tree-EwKXn5CapA4">
						Unsplash
					</a>
				</p>
			</div>

			<div className="max-w-3xl space-y-3">
				<p className="text-lg text-slate-700 dark:text-slate-300">
					Embedded texture children are declared with <code>data-texture</code>. Here the image becomes the{' '}
					<code>u_trees</code> sampler, and the fragment shader can read from it immediately.
				</p>
				<pre className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-950 px-5 py-4 text-sm text-slate-100 dark:border-white/10">
					<code>{`<shader-pad>
  <img src="trees.jpg" data-texture="u_trees" />
  <script type="x-shader/x-fragment">
    // sample u_trees in the shader
  </script>
</shader-pad>`}</code>
				</pre>
			</div>
		</div>
	);
}
