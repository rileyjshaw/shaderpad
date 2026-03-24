import { exampleRegistry } from '@/examples/registry-data.mjs';

import type { ExampleModule } from '@/examples/runtime';

type ExampleMetadata = {
	slug: string;
	title: string;
	description?: string;
};

type ExampleLoader = () => Promise<ExampleModule>;

const loaders: Record<string, ExampleLoader> = {
	basic: () => import('@/examples/demos/basic'),
	webcam: () => import('@/examples/demos/webcam'),
	'single-channel-textures': () => import('@/examples/demos/single-channel-textures'),
	sway: () => import('@/examples/demos/sway'),
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

export const examples = metadata.map(entry => ({
	...entry,
	load: loaders[entry.slug],
	sourcePath: `/examples/source/${entry.slug}.ts`,
	sourcePagePath: `/examples/source/${entry.slug}`,
}));

export type ExampleEntry = (typeof examples)[number];

export function getExampleBySlug(slug: string) {
	return examples.find(entry => entry.slug === slug);
}
