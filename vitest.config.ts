import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	define: {
		__SHADERPAD_DEV__: 'true',
		__MEDIAPIPE_TASKS_VISION_VERSION__: JSON.stringify('test'),
	},
	resolve: {
		alias: {
			'@mediapipe/tasks-vision': path.resolve(
				__dirname,
				'packages/shaderpad/test/support/mediapipe-tasks-vision.mock.ts',
			),
		},
	},
	test: {
		environment: 'node',
		include: ['packages/shaderpad/test/**/*.test.ts'],
		restoreMocks: true,
		clearMocks: true,
	},
});
