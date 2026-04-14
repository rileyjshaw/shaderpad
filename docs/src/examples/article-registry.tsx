import ReactExample from '@/examples/demos/react';

const articleExamples = {
	react: ReactExample,
};

export function getArticleExampleBySlug(slug: string) {
	return articleExamples[slug as keyof typeof articleExamples] ?? null;
}
