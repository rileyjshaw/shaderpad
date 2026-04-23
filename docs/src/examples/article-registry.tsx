import ReactExample from '@/examples/demos/react';
import WebComponentExample from '@/examples/demos/web-component';

const articleExamples = {
	'web-component': WebComponentExample,
	react: ReactExample,
};

export function getArticleExampleBySlug(slug: string) {
	return articleExamples[slug as keyof typeof articleExamples] ?? null;
}
