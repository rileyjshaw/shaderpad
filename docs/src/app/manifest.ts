import { type MetadataRoute } from 'next';

import { sitePath } from '@/lib/site';

const description =
	'ShaderPad docs, examples, and AI-focused guidance for fullscreen fragment shaders, textures, history buffers, and vision plugins.';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: 'ShaderPad Docs',
		short_name: 'ShaderPad',
		description,
		id: sitePath('/'),
		start_url: sitePath('/'),
		scope: sitePath('/'),
		display: 'standalone',
		background_color: '#ffffff',
		theme_color: '#0f172a',
		categories: ['developer tools', 'education', 'graphics'],
		icons: [
			{
				src: sitePath('/favicon.ico'),
				sizes: 'any',
				type: 'image/x-icon',
			},
			{
				src: sitePath('/apple-icon.png'),
				sizes: '180x180',
				type: 'image/png',
			},
			{
				src: sitePath('/icon-192.png'),
				sizes: '192x192',
				type: 'image/png',
			},
			{
				src: sitePath('/icon-512.png'),
				sizes: '512x512',
				type: 'image/png',
			},
			{
				src: sitePath('/icon-maskable-512.png'),
				sizes: '512x512',
				type: 'image/png',
				purpose: 'maskable',
			},
		],
	};
}
