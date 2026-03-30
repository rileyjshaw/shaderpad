import { defineConfig } from 'tsup';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const visionEntry = require.resolve('@mediapipe/tasks-vision');
const visionPkg = JSON.parse(readFileSync(join(dirname(visionEntry), 'package.json'), 'utf-8'));

const entry = ['src/index.ts', 'src/plugins/*.ts', 'src/util.ts'];
const baseDefine = {
	__MEDIAPIPE_TASKS_VISION_VERSION__: JSON.stringify(visionPkg.version),
};

const sharedConfig = {
	entry,
	format: ['esm', 'cjs'] as const,
	target: 'esnext',
	sourcemap: true,
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
			...baseDefine,
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
			...baseDefine,
		},
	},
]);
