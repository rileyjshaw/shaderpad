import { defineConfig } from 'tsup';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const visionEntry = require.resolve('@mediapipe/tasks-vision');
const visionPkg = JSON.parse(readFileSync(join(dirname(visionEntry), 'package.json'), 'utf-8'));

export default defineConfig({
	entry: ['src/index.ts', 'src/plugins/*.ts', 'src/util.ts'],
	format: ['esm', 'cjs'],
	target: 'esnext',
	sourcemap: true,
	clean: true,
	dts: true,
	minify: true,
	define: {
		'process.env.NODE_ENV': '"production"',
		__SHADERPAD_DEV__: 'false',
		__MEDIAPIPE_TASKS_VISION_VERSION__: JSON.stringify(visionPkg.version),
	},
	esbuildOptions(options) {
		options.loader = {
			...options.loader,
			'.glsl': 'text',
		};
	},
});
