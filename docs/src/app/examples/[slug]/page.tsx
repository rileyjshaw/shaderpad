import { notFound } from 'next/navigation';

import { ExampleArticlePage } from '@/examples/ExampleArticlePage';
import { ExamplePlayer } from '@/examples/ExamplePlayer';
import { examples, getExampleBySlug } from '@/examples/registry';

export function generateStaticParams() {
	return examples.map(example => ({
		slug: example.slug,
	}));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const example = getExampleBySlug(slug);

	if (!example) {
		return {};
	}

	return {
		title: `${example.title} Example`,
		description: example.description,
	};
}

export default async function ExamplePage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const example = getExampleBySlug(slug);
	if (!example) {
		notFound();
	}

	if (example.renderMode === 'article') {
		return <ExampleArticlePage example={example} />;
	}

	return (
		<ExamplePlayer
			slug={example.slug}
			title={example.title}
			shortDescription={example.description}
			sourcePagePath={example.sourcePagePath}
		/>
	);
}
