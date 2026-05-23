import Link from 'next/link';

import { sitePath } from '@/lib/site';

function isInternalHref(href: string) {
	return href.startsWith('/') && !href.startsWith('//');
}

function isStaticResourceHref(href: string) {
	let [pathname] = href.split(/[?#]/);

	return /\.[a-z0-9]+$/i.test(pathname);
}

function staticResourceHref(href: string) {
	let match = href.match(/^([^?#]*)(.*)$/);

	if (!match) {
		return href;
	}

	let [, pathname, suffix = ''] = match;

	return `${sitePath(pathname)}${suffix}`;
}

export function MarkdownLink({ href = '', children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
	if (isInternalHref(href) && isStaticResourceHref(href)) {
		return (
			<a href={staticResourceHref(href)} {...props}>
				{children}
			</a>
		);
	}

	if (isInternalHref(href)) {
		return (
			<Link href={href} {...props}>
				{children}
			</Link>
		);
	}

	return (
		<a href={href} {...props}>
			{children}
		</a>
	);
}
