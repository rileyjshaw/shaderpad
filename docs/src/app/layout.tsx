import { type Metadata } from 'next';
import localFont from 'next/font/local';
import Script from 'next/script';
import clsx from 'clsx';

import { Providers } from '@/app/providers';
import { Layout } from '@/components/Layout';
import { ThemeFavicon } from '@/components/ThemeFavicon';
import { absoluteSiteUrl, siteOrigin } from '@/lib/site';

import '@/styles/tailwind.css';

const googleTagId = 'G-KB68X7DK43';

const ufficio = localFont({
	src: '../fonts/UfficioVF.woff2',
	display: 'swap',
	variable: '--font-ufficio',
});

const ufficioDisplay = localFont({
	src: '../fonts/UfficioDisplayVF.woff2',
	display: 'swap',
	variable: '--font-ufficio-display',
});

export const metadata: Metadata = {
	metadataBase: new URL(siteOrigin),
	applicationName: 'ShaderPad Docs',
	title: {
		template: 'ShaderPad | %s',
		default: 'ShaderPad | Get creative with shaders',
	},
	description:
		'ShaderPad is a lightweight, dependency-free library that reduces boilerplate when working with fragment shaders.',
	keywords: ['ShaderPad', 'WebGL2', 'GLSL', 'fragment shaders', 'shader library', 'AI agent guide', 'LLM docs'],
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
		},
	},
	openGraph: {
		title: 'ShaderPad Docs',
		description:
			'Documentation for ShaderPad, a lightweight WebGL2 library for fullscreen fragment shaders, textures, history buffers, and vision plugins.',
		url: absoluteSiteUrl('/'),
		siteName: 'ShaderPad Docs',
		type: 'website',
	},
	twitter: {
		card: 'summary',
		title: 'ShaderPad Docs',
		description: 'Docs, examples, and AI-focused guidance for building with ShaderPad.',
	},
	icons: {
		icon: [
			{
				url: '/shaderpad/icon-light.svg',
				type: 'image/svg+xml',
				media: '(prefers-color-scheme: light)',
			},
			{
				url: '/shaderpad/icon-dark.svg',
				type: 'image/svg+xml',
				media: '(prefers-color-scheme: dark)',
			},
		],
	},
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html
			lang="en"
			className={clsx('h-full antialiased', ufficio.variable, ufficioDisplay.variable)}
			suppressHydrationWarning
		>
			<head>
				<Script
					src={`https://www.googletagmanager.com/gtag/js?id=${googleTagId}`}
					strategy="afterInteractive"
				/>
				<Script id="google-tag" strategy="afterInteractive">
					{`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', '${googleTagId}');`}
				</Script>
				<link
					rel="alternate"
					type="text/plain"
					title="ShaderPad LLM instructions"
					href={absoluteSiteUrl('/llms.txt')}
				/>
				<link
					rel="alternate"
					type="text/plain"
					title="ShaderPad full LLM corpus"
					href={absoluteSiteUrl('/llms-full.txt')}
				/>
				<link
					rel="alternate"
					type="application/json"
					title="ShaderPad LLM index"
					href={absoluteSiteUrl('/llms-index.json')}
				/>
				<link rel="sitemap" type="application/xml" href={absoluteSiteUrl('/sitemap.xml')} />
				<meta name="llms" content={absoluteSiteUrl('/llms.txt')} />
				<meta name="llms-full" content={absoluteSiteUrl('/llms-full.txt')} />
				<meta name="llms-index" content={absoluteSiteUrl('/llms-index.json')} />
				<meta name="ai-agent-guide" content={absoluteSiteUrl('/docs/getting-started/ai-agent-guide')} />
			</head>
			<body className="flex min-h-full bg-white dark:bg-slate-900">
				<Providers>
					<ThemeFavicon />
					<Layout>{children}</Layout>
				</Providers>
			</body>
		</html>
	);
}
