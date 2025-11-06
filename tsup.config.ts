import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['src/index.ts'],
	format: ['esm', 'cjs'],
	target: 'esnext',
	sourcemap: true,
	clean: true,
	dts: true,
	minify: true,
	esbuildOptions(options) {
		options.loader = {
			...options.loader,
			'.glsl': 'text',
		};
	},
});
