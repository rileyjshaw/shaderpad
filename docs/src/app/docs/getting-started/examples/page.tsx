import Link from 'next/link';

import { DocsHeader } from '@/components/DocsHeader';
import { PrevNextLinks } from '@/components/PrevNextLinks';
import { examples } from '@/examples/registry';

type ExampleTag = {
	className: string;
};

type ExampleSection = {
	title: string;
	description: string;
	slugs: string[];
};

const tagStyles: Record<string, ExampleTag> = {
	ANIMATION: {
		className:
			'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300',
	},
	FACE: {
		className:
			'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300',
	},
	HANDS: {
		className:
			'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-300',
	},
	HISTORY: {
		className:
			'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
	},
	MIDI: {
		className:
			'border-lime-200 bg-lime-50 text-lime-700 dark:border-lime-500/30 dark:bg-lime-500/10 dark:text-lime-300',
	},
	POSE: {
		className:
			'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300',
	},
	SAVE: {
		className:
			'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
	},
	SEGMENTER: {
		className:
			'border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-300',
	},
	UNIFORMS: {
		className:
			'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300',
	},
	WEBCAM: {
		className: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300',
	},
};

const defaultTag: ExampleTag = {
	className:
		'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

const exampleTags: Record<string, string[]> = {
	basic: ['UNIFORMS'],
	sway: ['ANIMATION'],
	lygia: ['ANIMATION'],
	'history-tiles': ['HISTORY'],
	'cursor-feedback': ['HISTORY'],
	'reading-history': ['ANIMATION', 'HISTORY'],
	selfie: ['SAVE', 'WEBCAM'],
	'webcam-trails': ['HISTORY', 'WEBCAM'],
	'webcam-channel-trails': ['HISTORY', 'WEBCAM'],
	'webcam-grid': ['HISTORY', 'WEBCAM'],
	'single-channel-textures': ['HISTORY', 'WEBCAM'],
	fragmentum: ['ANIMATION'],
	webcam: ['WEBCAM'],
	'face-detection': ['FACE', 'WEBCAM'],
	'pose-detection': ['POSE', 'WEBCAM'],
	'hand-detection': ['HANDS', 'WEBCAM'],
	segmenter: ['SEGMENTER', 'WEBCAM'],
	'mediapipe-chaining': ['FACE', 'WEBCAM'],
	'background-blur': ['SEGMENTER', 'WEBCAM'],
	camo: ['FACE', 'POSE', 'HISTORY', 'WEBCAM'],
	elastics: ['HANDS', 'WEBCAM'],
	'finger-pens': ['HANDS', 'HISTORY', 'WEBCAM'],
	'midi-fingers': ['HANDS', 'MIDI', 'WEBCAM'],
	'god-rays': ['FACE', 'HANDS', 'WEBCAM'],
};

const sections: ExampleSection[] = [
	{
		title: 'Core Library',
		description:
			'Core ShaderPad patterns: uniforms, animation, save workflows, live inputs, and straightforward feedback pipelines.',
		slugs: [
			'basic',
			'sway',
			'lygia',
			'cursor-feedback',
			'history-tiles',
			'reading-history',
			'selfie',
			'webcam-trails',
			'webcam-channel-trails',
			'webcam-grid',
			'single-channel-textures',
			'fragmentum',
		],
	},
	{
		title: 'MediaPipe Vision',
		description: 'Face, pose, hands, and segmentation examples powered by the MediaPipe plugins.',
		slugs: [
			'face-detection',
			'pose-detection',
			'hand-detection',
			'segmenter',
			'mediapipe-chaining',
			'background-blur',
			'camo',
			'elastics',
			'finger-pens',
			'midi-fingers',
			'god-rays',
		],
	},
];

export const metadata = {
	title: 'Examples',
	description: 'Interactive ShaderPad examples and live demo routes.',
};

export default function ExamplesIndexPage() {
	const exampleMap = new Map(examples.map(example => [example.slug, example]));

	return (
		<div className="relative w-full">
			<div className="min-w-0 flex-auto px-4 py-16 lg:pl-8 xl:pl-16">
				<div className="mx-auto max-w-3xl">
					<DocsHeader title="Examples" />
					<p className="max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400">
						The following examples give a quick demonstration of some of ShaderPad’s features.
					</p>

					<section className="mt-10 overflow-hidden rounded-[2rem] border border-sky-200 bg-linear-to-br from-sky-50 via-white to-cyan-50 p-7 shadow-lg shadow-sky-100/60 dark:border-sky-900/60 dark:from-sky-950/40 dark:via-slate-950 dark:to-cyan-950/40 dark:shadow-none">
						<div className="flex flex-wrap items-start justify-between gap-4">
							<div className="max-w-2xl space-y-3">
								<span className="inline-flex rounded-full border border-sky-300 bg-white/80 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-sky-700 uppercase dark:border-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
									Featured
								</span>
								<div className="space-y-2">
									<h2 className="font-display text-3xl tracking-tight text-slate-900 dark:text-white">
										Strange Camera
									</h2>
									<p className="text-base leading-7 text-slate-700 dark:text-slate-300">
										A camera app built specifically to demo and test ShaderPad. Start here if you
										want to see ShaderPad in a real-world application instead of isolated feature
										demos.
									</p>
								</div>
							</div>

							<a
								href="https://strange.cam"
								target="_blank"
								rel="noreferrer"
								className="inline-flex shrink-0 items-center rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-500"
							>
								Visit strange.cam
							</a>
						</div>
					</section>

					<div className="mt-10 space-y-12">
						{sections.map(section => (
							<section key={section.title} className="space-y-4">
								<div className="space-y-2">
									<h2 className="font-display text-2xl tracking-tight text-slate-900 dark:text-white">
										{section.title}
									</h2>
									<p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
										{section.description}
									</p>
								</div>

								<div className="space-y-4">
									{section.slugs.map(slug => {
										const example = exampleMap.get(slug);
										if (!example) {
											return null;
										}

										const tags = exampleTags[example.slug] ?? ['EXAMPLE'];

										return (
											<Link
												key={example.slug}
												href={`/examples/${example.slug}`}
												className="group block rounded-3xl border border-slate-200 bg-white px-6 py-5 transition hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-sky-700 dark:hover:shadow-none"
											>
												<div className="space-y-3">
													<div className="flex flex-wrap items-start gap-3">
														<h3 className="min-w-0 flex-[999_1_18rem] font-display text-2xl tracking-tight text-slate-900 group-hover:text-sky-600 dark:text-white dark:group-hover:text-sky-400">
															{example.title}
														</h3>
														<div className="flex min-w-0 flex-[1_1_100%] flex-wrap gap-2 sm:flex-[0_1_auto] sm:justify-end">
															{tags.map(tag => {
																const tagStyle = tagStyles[tag] ?? defaultTag;

																return (
																	<span
																		key={tag}
																		className={`rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase ${tagStyle.className}`}
																	>
																		{tag}
																	</span>
																);
															})}
														</div>
													</div>
													{example.description && (
														<p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
															{example.description}
														</p>
													)}
												</div>
											</Link>
										);
									})}
								</div>
							</section>
						))}
					</div>

					<div className="mt-10">
						<Link
							href="/examples/source"
							className="text-sm font-medium text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300"
						>
							Browse raw source mirrors
						</Link>
					</div>

					<PrevNextLinks />
				</div>
			</div>
		</div>
	);
}
