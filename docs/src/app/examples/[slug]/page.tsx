import { notFound } from 'next/navigation';

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

	return (
		<ExamplePlayer
			slug={example.slug}
			title={example.title}
			shortDescription={example.description}
			sourcePagePath={example.sourcePagePath}
		/>
	);
}
