import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
	plugins: [
		glsl({
			root: '/node_modules/',
			removeDuplicatedImports: true,
		}),
	],
	server: {
		host: true,
	},
});
