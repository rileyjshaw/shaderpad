import { readFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import type { Plugin as EsbuildPlugin } from 'esbuild';
import { defineConfig } from 'tsup';

const glslIncludePattern = /^[ \t]*#include\s+["']([^"']+)["'];?\s*$/gm;

const entry = ['src/index.ts', 'src/plugins/*.ts', 'src/util.ts'];

function inlineGLSLImports(source: string, filePath: string, stack = [filePath]): string {
	return source.replace(glslIncludePattern, (_match, request: string) => {
		const resolvedPath = resolve(dirname(filePath), request);
		if (stack.includes(resolvedPath)) {
			throw new Error(`Circular GLSL include: ${[...stack, resolvedPath].join(' -> ')}`);
		}
		return inlineGLSLImports(readFileSync(resolvedPath, 'utf-8'), resolvedPath, [...stack, resolvedPath]);
	});
}

const glslIncludePlugin: EsbuildPlugin = {
	name: 'shaderpad-glsl-includes',
	setup(build) {
		build.onLoad({ filter: /\.glsl$/ }, args => ({
			contents: inlineGLSLImports(readFileSync(args.path, 'utf-8'), args.path),
			loader: 'text',
		}));
	},
};

const sharedConfig = {
	entry,
	format: ['esm', 'cjs'] as const,
	target: 'esnext',
	sourcemap: true,
	esbuildPlugins: [glslIncludePlugin],
	esbuildOptions(options) {
		options.loader = {
			...options.loader,
			'.glsl': 'text',
		};
	},
};

export default defineConfig([
	{
		...sharedConfig,
		clean: true,
		dts: true,
		minify: true,
		define: {
			'process.env.NODE_ENV': '"production"',
			__SHADERPAD_DEV__: 'false',
		},
	},
	{
		...sharedConfig,
		outDir: 'dist/dev',
		clean: false,
		dts: false,
		minify: false,
		define: {
			'process.env.NODE_ENV': '"development"',
			__SHADERPAD_DEV__: 'true',
		},
	},
]);
