import { notFound } from 'next/navigation';

import { DocsHeader } from '@/components/DocsHeader';
import { ExampleBackLink } from '@/examples/ExampleBackLink';
import { getArticleExampleBySlug } from '@/examples/article-registry';
import { getExampleDetails } from '@/examples/details';
import { type ArticleExampleEntry } from '@/examples/registry';
import { withBasePath } from '@/lib/site';

export function ExampleArticlePage({ example }: { example: ArticleExampleEntry }) {
	const ArticleExample = getArticleExampleBySlug(example.slug);
	const details = getExampleDetails(example.slug);

	if (!ArticleExample) {
		notFound();
	}

	return (
		<div className="relative w-full">
			<div className="pointer-events-none fixed inset-x-0 top-0 z-30 p-4 sm:p-6">
				<div className="pointer-events-auto w-fit">
					<ExampleBackLink />
				</div>
			</div>

			<div className="min-w-0 flex-auto px-4 py-16 lg:pl-8 xl:pl-16">
				<div className="mx-auto max-w-6xl">
					<div className="h-24" aria-hidden="true" />
					<DocsHeader title={example.title} />

					<div className="mb-10 flex flex-wrap items-start justify-between gap-4">
						<div className="max-w-2xl space-y-2">
							<p className="text-base leading-7 text-slate-600 dark:text-slate-400">
								{example.description}
							</p>
							{details?.credit && (
								<p className="text-sm leading-6 font-medium text-slate-500 dark:text-slate-400 [&_a]:text-emerald-600 [&_a]:underline [&_a]:decoration-emerald-400/60 [&_a]:underline-offset-4 dark:[&_a]:text-emerald-300">
									{details.credit}
								</p>
							)}
						</div>

						<div className="flex flex-wrap gap-3">
							<a
								href={withBasePath(example.sourcePagePath)}
								className="inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50 dark:border-slate-700 dark:text-emerald-300 dark:hover:border-emerald-700 dark:hover:bg-slate-800"
							>
								View source
							</a>
						</div>
					</div>

					<ArticleExample />
				</div>
			</div>
		</div>
	);
}
