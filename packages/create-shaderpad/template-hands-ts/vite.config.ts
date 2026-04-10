import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import glsl from 'vite-plugin-glsl';

const isStackBlitz = 'STACKBLITZ' in process.env;

export default defineConfig({
	plugins: [glsl(), ...(isStackBlitz ? [] : [basicSsl()])],
	server: {
		host: true,
		...(isStackBlitz ? {} : { https: true }),
	},
});
