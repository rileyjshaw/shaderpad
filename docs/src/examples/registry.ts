import { exampleRegistry } from '@/examples/registry-data.mjs';

import type { ExampleModule } from '@/examples/runtime';

export type ExampleRenderMode = 'fullscreen' | 'article';

type ExampleMetadata = {
	slug: string;
	title: string;
	description?: string;
	renderMode?: ExampleRenderMode;
};

type ExampleLoader = () => Promise<ExampleModule>;

const loaders: Record<string, ExampleLoader> = {
	basic: () => import('@/examples/demos/basic'),
	webcam: () => import('@/examples/demos/webcam'),
	'single-channel-textures': () => import('@/examples/demos/single-channel-textures'),
	sway: () => import('@/examples/demos/sway'),
	lygia: () => import('@/examples/demos/lygia'),
	selfie: () => import('@/examples/demos/selfie'),
	'cursor-feedback': () => import('@/examples/demos/cursor-feedback'),
	'history-tiles': () => import('@/examples/demos/history-tiles'),
	'webcam-trails': () => import('@/examples/demos/webcam-trails'),
	'webcam-channel-trails': () => import('@/examples/demos/webcam-channel-trails'),
	'reading-history': () => import('@/examples/demos/reading-history'),
	'webcam-grid': () => import('@/examples/demos/webcam-grid'),
	'face-detection': () => import('@/examples/demos/face-detection'),
	camo: () => import('@/examples/demos/camo'),
	'mediapipe-chaining': () => import('@/examples/demos/mediapipe-chaining'),
	'pose-detection': () => import('@/examples/demos/pose-detection'),
	'background-blur': () => import('@/examples/demos/background-blur'),
	'hand-detection': () => import('@/examples/demos/hand-detection'),
	elastics: () => import('@/examples/demos/elastics'),
	'finger-pens': () => import('@/examples/demos/finger-pens'),
	'midi-fingers': () => import('@/examples/demos/midi-fingers'),
	segmenter: () => import('@/examples/demos/segmenter'),
	'god-rays': () => import('@/examples/demos/god-rays'),
	fragmentum: () => import('@/examples/demos/fragmentum'),
};

const metadata = exampleRegistry as ExampleMetadata[];

type BaseExampleEntry = ExampleMetadata & {
	renderMode: ExampleRenderMode;
	sourcePagePath: string;
};

export type FullscreenExampleEntry = BaseExampleEntry & {
	renderMode: 'fullscreen';
	load: ExampleLoader;
};

export type ArticleExampleEntry = BaseExampleEntry & {
	renderMode: 'article';
};

export type ExampleEntry = FullscreenExampleEntry | ArticleExampleEntry;

export const examples: ExampleEntry[] = metadata.map(entry => {
	const renderMode = entry.renderMode ?? 'fullscreen';

	if (renderMode === 'article') {
		return {
			...entry,
			renderMode: 'article',
			sourcePagePath: `/examples/source/${entry.slug}`,
		};
	}

	const load = loaders[entry.slug];
	if (!load) {
		throw new Error(`Missing example loader for "${entry.slug}"`);
	}

	return {
		...entry,
		renderMode: 'fullscreen',
		sourcePagePath: `/examples/source/${entry.slug}`,
		load,
	};
});

export function getExampleBySlug(slug: string) {
	return examples.find(entry => entry.slug === slug);
}
