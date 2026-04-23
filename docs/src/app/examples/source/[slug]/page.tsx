import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { notFound } from 'next/navigation';

import { DocsHeader } from '@/components/DocsHeader';
import { Fence } from '@/components/Fence';
import { type ExampleEntry, examples, getExampleBySlug } from '@/examples/registry';
import { sitePath } from '@/lib/site';

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
		title: `${example.title}`,
		description: example.description,
	};
}

async function tryAddSource(
	sources: Array<{ filename: string; language: string }>,
	demosDir: string,
	filename: string,
	language: string,
) {
	try {
		await access(join(demosDir, filename));
		sources.push({ filename, language });
		return true;
	} catch {
		return false;
	}
}

async function readExampleSource(example: ExampleEntry) {
	const demosDir = join(process.cwd(), 'src', 'examples', 'demos');

	if (example.slug === 'web-component') {
		const html = await readFile(join(demosDir, 'web-component.html'), 'utf8');

		return [
			{
				filename: 'index.html',
				language: 'html',
				content: `<script type="module">
  import 'shaderpad/web-component.css';
  import { createShaderPadElement } from 'shaderpad/web-component';
  customElements.define('shader-pad', createShaderPadElement());
</script>

${html}`,
			},
		];
	}

	const sources: Array<{ filename: string; language: string }> = [];

	await tryAddSource(sources, demosDir, `${example.slug}.html`, 'html');

	for (const candidate of [
		{ filename: `${example.slug}.ts`, language: 'ts' },
		{ filename: `${example.slug}.tsx`, language: 'tsx' },
		{ filename: `${example.slug}.js`, language: 'js' },
		{ filename: `${example.slug}.jsx`, language: 'jsx' },
	]) {
		if (await tryAddSource(sources, demosDir, candidate.filename, candidate.language)) {
			break;
		}
	}

	if (sources.length === 0) {
		throw new Error(`Missing source file for example "${example.slug}"`);
	}

	await tryAddSource(sources, demosDir, `${example.slug}.glsl`, 'glsl');

	return Promise.all(
		sources.map(async source => ({
			...source,
			content: await readFile(join(demosDir, source.filename), 'utf8'),
		})),
	);
}

export default async function ExampleSourcePage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const example = getExampleBySlug(slug);

	if (!example) {
		notFound();
	}

	const sources = await readExampleSource(example);

	return (
		<div className="relative w-full">
			<div className="min-w-0 flex-auto px-4 py-16 lg:pl-8 xl:pl-16">
				<div className="mx-auto max-w-4xl">
					<DocsHeader title={`${example.title}`} />
					<div className="mb-8 flex flex-wrap items-center gap-4">
						<p className="max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400">
							{example.description}
						</p>
						<a
							href={sitePath(`/examples/${example.slug}`)}
							className="inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-sky-700 transition hover:border-sky-300 hover:bg-sky-50 dark:border-slate-700 dark:text-sky-300 dark:hover:border-sky-700 dark:hover:bg-slate-800"
						>
							View live demo
						</a>
					</div>

					<div className="space-y-8">
						{sources.map(source => (
							<section key={source.filename} className="space-y-3">
								<h2 className="font-display text-2xl tracking-tight text-slate-900 dark:text-white">
									{source.filename}
								</h2>
								<Fence language={source.language}>{source.content}</Fence>
							</section>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
