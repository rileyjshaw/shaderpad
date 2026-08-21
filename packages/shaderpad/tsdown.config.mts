import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { transform } from 'esbuild';
import { defineConfig } from 'tsdown';

const glslIncludePattern = /^[ \t]*#include\s+["']([^"']+)["'];?\s*$/gm;

const entry = ['src/index.ts', 'src/react.tsx', 'src/web-component.ts', 'src/plugins/*.ts', 'src/util.ts'];

function inlineGLSLImports(source: string, filePath: string, stack = [filePath]): string {
	return source.replace(glslIncludePattern, (_match, request: string) => {
		const resolvedPath = resolve(dirname(filePath), request);
		if (stack.includes(resolvedPath)) {
			throw new Error(`Circular GLSL include: ${[...stack, resolvedPath].join(' -> ')}`);
		}
		return inlineGLSLImports(readFileSync(resolvedPath, 'utf-8'), resolvedPath, [...stack, resolvedPath]);
	});
}

function glslIncludePlugin() {
	return {
		name: 'shaderpad-glsl-includes',
		load(id: string) {
			const filePath = id.replace(/\?raw$/, '');
			if (!filePath.endsWith('.glsl')) return null;

			const source = inlineGLSLImports(readFileSync(filePath, 'utf-8'), filePath);
			return {
				code: `export default ${JSON.stringify(source)};`,
			};
		},
	};
}

function mangleInternalProperties() {
	const mangleCache: Record<string, string | false> = {};

	return {
		name: 'shaderpad-mangle-internal-properties',
		renderChunk: {
			sequential: true,
			async handler(code: string, chunk: { fileName: string }) {
				if (/\.d\.m?ts$/.test(chunk.fileName)) return null;
				const result = await transform(code, {
					loader: 'js',
					target: 'esnext',
					mangleProps: /_$/,
					mangleCache,
					sourcemap: true,
				});
				Object.assign(mangleCache, result.mangleCache);
				return { code: result.code, map: result.map };
			},
		},
	};
}

const sharedConfig = {
	entry,
	format: ['esm', 'cjs'] as const,
	target: 'esnext',
	sourcemap: true,
	cjsDefault: false,
	fixedExtension: false,
	plugins: [glslIncludePlugin()],
};

export default defineConfig([
	{
		...sharedConfig,
		clean: true,
		dts: {
			cjsDefault: false,
		},
		minify: true,
		plugins: [...sharedConfig.plugins, mangleInternalProperties()],
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
