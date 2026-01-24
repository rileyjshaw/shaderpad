import { defineConfig } from 'tsup';
import { readFileSync } from 'fs';

const visionPkg = JSON.parse(readFileSync('node_modules/@mediapipe/tasks-vision/package.json', 'utf-8'));

export default defineConfig({
	entry: ['src/index.ts'],
	format: ['esm', 'cjs'],
	target: 'esnext',
	sourcemap: true,
	clean: true,
	dts: true,
	minify: true,
	define: {
		'process.env.NODE_ENV': '"production"',
		__MEDIAPIPE_TASKS_VISION_VERSION__: JSON.stringify(visionPkg.version),
	},
	esbuildOptions(options) {
		options.loader = {
			...options.loader,
			'.glsl': 'text',
		};
	},
});
