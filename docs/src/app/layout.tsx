import { type Metadata, type Viewport } from 'next';
import localFont from 'next/font/local';
import Script from 'next/script';
import clsx from 'clsx';

import { Providers } from '@/app/providers';
import { Layout } from '@/components/Layout';
import { ThemeFavicon } from '@/components/ThemeFavicon';
import { absoluteSiteUrl, siteOrigin, sitePath } from '@/lib/site';

import '@/styles/tailwind.css';
import 'shaderpad/web-component.css';

const googleTagId = 'G-KB68X7DK43';
const siteName = 'ShaderPad Docs';
const siteDescription =
	'Documentation for ShaderPad, a lightweight WebGL2 library for fullscreen fragment shaders, textures, history buffers, and vision plugins.';

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
	metadataBase: new URL(sitePath('/'), siteOrigin),
	applicationName: siteName,
	title: {
		template: 'ShaderPad | %s',
		default: 'ShaderPad | Get creative with shaders',
	},
	description: siteDescription,
	keywords: ['ShaderPad', 'WebGL2', 'GLSL', 'fragment shaders', 'shader library', 'AI agent guide', 'LLM docs'],
	authors: [{ name: 'Misery and Co.', url: siteOrigin }],
	alternates: {
		canonical: './',
	},
	creator: 'Misery and Co.',
	publisher: 'Misery and Co.',
	category: 'developer tools',
	formatDetection: {
		address: false,
		email: false,
		telephone: false,
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
		},
	},
	openGraph: {
		siteName,
		locale: 'en_US',
		url: './',
		images: [
			{
				url: absoluteSiteUrl('/opengraph-image.png'),
				alt: 'ShaderPad wordmark over abstract fragment shader artwork.',
				type: 'image/png',
				width: 1200,
				height: 630,
			},
		],
		type: 'website',
	},
	twitter: {
		card: 'summary_large_image',
		images: [
			{
				url: absoluteSiteUrl('/twitter-image.png'),
				alt: 'ShaderPad wordmark over abstract fragment shader artwork.',
				type: 'image/png',
				width: 1200,
				height: 630,
			},
		],
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
		apple: [
			{
				url: '/shaderpad/apple-icon.png',
				type: 'image/png',
				sizes: '180x180',
			},
		],
	},
};

export const viewport: Viewport = {
	colorScheme: 'light dark',
	themeColor: [
		{ media: '(prefers-color-scheme: light)', color: '#ffffff' },
		{ media: '(prefers-color-scheme: dark)', color: '#0f172a' },
	],
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
