import Link from 'next/link';

import { Logomark } from '@/components/Logo';

export function ExampleBackLink() {
	return (
		<div className="-ml-6 inline-flex items-start gap-4 rounded-r-full border border-white/15 bg-black/60 py-4 pr-6 pl-6 shadow-2xl backdrop-blur">
			<Link
				href="/docs/getting-started/examples"
				aria-label="Examples"
				className="transition hover:text-white/85"
			>
				<div className="flex gap-3 text-white">
					<Logomark className="hidden h-9 w-auto fill-white/90 lg:block" />
					<span className="-mb-1 inline-block font-display text-3xl font-black">ShaderPad</span>
					<span className="hidden align-baseline text-sm text-white/70 lg:block">v1β</span>
				</div>
			</Link>
		</div>
	);
}
