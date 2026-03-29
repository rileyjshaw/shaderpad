import { notFound } from 'next/navigation';

import { errors, getErrorByCode } from '@/generated/error-codes';
import { absoluteSiteUrl } from '@/lib/site';

export function generateStaticParams() {
	return errors.map(error => ({
		code: String(error.code),
	}));
}

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
	const { code } = await params;
	const error = getErrorByCode(code);

	if (!error) {
		return {};
	}

	return {
		title: `Minified error #${error.code}`,
		description: error.summary,
		alternates: {
			canonical: absoluteSiteUrl(`/e/${error.code}`),
		},
	};
}

export default async function ErrorPage({ params }: { params: Promise<{ code: string }> }) {
	const { code } = await params;
	const error = getErrorByCode(code);

	if (!error) {
		notFound();
	}

	return (
		<div className="min-w-0 flex-auto px-4 py-16 lg:max-w-none lg:pr-0 lg:pl-8 xl:px-16">
			<article className="mx-auto max-w-3xl">
				<p className="font-display text-sm font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
					Minified error details
				</p>
				<div className="mt-3 flex flex-wrap items-center gap-3">
					<h1 className="font-display text-3xl tracking-tight text-slate-900 dark:text-white">
						{error.title}
					</h1>
				</div>
				<p className="mt-4 text-base leading-7 text-slate-700 dark:text-slate-300">{error.summary}</p>

				<div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/70">
					<p className="text-sm font-medium text-slate-900 dark:text-white">Production error string</p>
					<code className="mt-2 block overflow-x-auto text-sm text-slate-700 dark:text-slate-300">
						ShaderPad error: {absoluteSiteUrl(`/e/${error.code}`)}
					</code>
				</div>

				<section className="mt-10">
					<h2 className="font-display text-xl tracking-tight text-slate-900 dark:text-white">
						Likely causes
					</h2>
					<ul className="mt-4 space-y-3 text-sm leading-7 text-slate-700 dark:text-slate-300">
						{error.causes.map(cause => (
							<li key={cause} className="list-inside list-disc">
								{cause}
							</li>
						))}
					</ul>
				</section>

				<section className="mt-10">
					<h2 className="font-display text-xl tracking-tight text-slate-900 dark:text-white">
						Recommended fixes
					</h2>
					<ul className="mt-4 space-y-3 text-sm leading-7 text-slate-700 dark:text-slate-300">
						{error.fixes.map(fix => (
							<li key={fix} className="list-inside list-disc">
								{fix}
							</li>
						))}
					</ul>
				</section>
			</article>
		</div>
	);
}
