export const navigation = [
	{
		title: 'Getting Started',
		links: [
			{ title: 'Overview', href: '/' },
			{ title: 'Installation', href: '/docs/getting-started/installation' },
			{ title: 'Quickstart', href: '/docs/getting-started/quickstart' },
			{ title: 'Examples', href: '/docs/getting-started/examples' },
			{
				title: 'Learning shaders',
				href: '/docs/getting-started/learning-shaders',
			},
		],
	},
	{
		title: 'Core Concepts',
		links: [
			{
				title: 'Shader lifecycle',
				href: '/docs/core-concepts/shader-lifecycle',
			},
			{ title: 'Built-in inputs', href: '/docs/core-concepts/built-in-inputs' },
			{ title: 'Uniforms', href: '/docs/core-concepts/uniforms' },
			{ title: 'Textures', href: '/docs/core-concepts/textures' },
			{ title: 'History', href: '/docs/core-concepts/history' },
			{
				title: 'Canvas and input',
				href: '/docs/core-concepts/canvas-and-input',
			},
			{
				title: 'Format and precision',
				href: '/docs/core-concepts/format-and-precision',
			},
		],
	},
	{
		title: 'Guides',
		links: [
			{ title: 'Webcam input', href: '/docs/guides/webcam-input' },
			{ title: 'Saving images', href: '/docs/guides/saving-images' },
			{ title: 'Chaining shaders', href: '/docs/guides/chaining-shaders' },
			{ title: 'Performance', href: '/docs/guides/performance' },
		],
	},
	{
		title: 'Plugins',
		links: [
			{ title: 'helpers', href: '/docs/plugins/helpers' },
			{ title: 'autosize', href: '/docs/plugins/autosize' },
			{ title: 'save', href: '/docs/plugins/save' },
			{ title: 'face', href: '/docs/plugins/face' },
			{ title: 'pose', href: '/docs/plugins/pose' },
			{ title: 'hands', href: '/docs/plugins/hands' },
			{ title: 'segmenter', href: '/docs/plugins/segmenter' },
		],
	},
	{
		title: 'API Reference',
		links: [
			{ title: 'ShaderPad', href: '/docs/api/shaderpad' },
			{ title: 'Uniforms', href: '/docs/api/uniforms' },
			{ title: 'Methods', href: '/docs/api/methods' },
			{ title: 'Properties', href: '/docs/api/properties' },
			{ title: 'Events', href: '/docs/api/events' },
			{ title: 'Utilities', href: '/docs/api/utilities' },
		],
	},
];

export function normalizePathname(pathname: string) {
	if (pathname === '/') {
		return pathname;
	}

	return pathname.replace(/\/+$/, '');
}

export function isCurrentPath(href: string, pathname: string) {
	return normalizePathname(href) === normalizePathname(pathname);
}
