'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import { Highlight } from 'prism-react-renderer';

export function Fence({ children, language }: { children: string; language: string }) {
	let [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
	let resetTimeoutRef = useRef<number | null>(null);
	let code = children.trimEnd();

	useEffect(() => {
		return () => {
			if (resetTimeoutRef.current !== null) {
				window.clearTimeout(resetTimeoutRef.current);
			}
		};
	}, []);

	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(code);
			setCopyState('copied');
		} catch {
			setCopyState('error');
		}

		if (resetTimeoutRef.current !== null) {
			window.clearTimeout(resetTimeoutRef.current);
		}

		resetTimeoutRef.current = window.setTimeout(() => {
			setCopyState('idle');
			resetTimeoutRef.current = null;
		}, 2000);
	}

	return (
		<Highlight code={code} language={language} theme={{ plain: {}, styles: [] }}>
			{({ className, style, tokens, getTokenProps }) => (
				<div className="group relative">
					<button
						type="button"
						onClick={handleCopy}
						aria-label={copyState === 'copied' ? 'Code copied' : 'Copy code'}
						className="absolute top-2 right-2 z-10 inline-flex h-8 items-center gap-1.5 rounded-md border border-white/10 bg-slate-800/90 px-2.5 text-xs font-medium text-slate-200 opacity-0 shadow-lg backdrop-blur transition group-hover:opacity-100 hover:border-sky-400/40 hover:text-white focus:opacity-100 focus:ring-2 focus:ring-sky-400/70 focus:outline-none"
					>
						<CopyIcon />
						<span>{copyState === 'copied' ? 'Copied' : copyState === 'error' ? 'Failed' : 'Copy'}</span>
					</button>
					<pre
						className={`${className} m-0 overflow-x-auto rounded-xl bg-slate-900 p-6 text-sm leading-7 shadow-lg dark:bg-slate-800/60 dark:shadow-none dark:ring-1 dark:ring-slate-300/10`}
						style={style}
					>
						<code>
							{tokens.map((line, lineIndex) => (
								<Fragment key={lineIndex}>
									{line
										.filter(token => !token.empty)
										.map((token, tokenIndex) => (
											<span key={tokenIndex} {...getTokenProps({ token })} />
										))}
									{'\n'}
								</Fragment>
							))}
						</code>
					</pre>
				</div>
			)}
		</Highlight>
	);
}

function CopyIcon() {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 16 16"
			className="h-3.5 w-3.5 fill-none stroke-current"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<rect x="5.25" y="3.25" width="7.5" height="9.5" rx="1.25" />
			<path d="M3.25 10.75h-.5A1.5 1.5 0 0 1 1.25 9.25v-6.5a1.5 1.5 0 0 1 1.5-1.5h4.5a1.5 1.5 0 0 1 1.5 1.5v.5" />
		</svg>
	);
}
