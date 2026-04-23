import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import fg from 'fast-glob';
import yaml from 'js-yaml';

import { exampleRegistry } from '../src/examples/registry-data.mjs';

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const docsRoot = resolve(scriptsDir, '..');
const repoRoot = resolve(docsRoot, '..');
const appDir = join(docsRoot, 'src', 'app');
const publicDir = join(docsRoot, 'public');
const llmsTemplatePath = join(docsRoot, 'src', 'llms', 'llms-template.txt');
const examplesDir = join(docsRoot, 'src', 'examples', 'demos');
const repoReadmePath = join(repoRoot, 'README.md');
const generatedSizePath = join(docsRoot, 'src', 'generated', 'shaderpad-size.json');
const repoBlobBase = 'https://github.com/miseryco/shaderpad/blob/main/';

const siteOrigin = 'https://misery.co';
const docsBasePath = '/shaderpad';
const markdownGroupOrder = [
	'Getting Started',
	'Core Concepts',
	'Guides',
	'Examples',
	'Plugins',
	'Components',
	'API Reference',
	'Reference',
];

function sitePath(pathname) {
	if (pathname === '/') {
		return `${docsBasePath}/`;
	}

	if (/\.[a-z0-9]+$/i.test(pathname)) {
		return `${docsBasePath}${pathname}`;
	}

	return `${docsBasePath}${pathname.replace(/\/+$/, '')}/`;
}

function absoluteSiteUrl(pathname) {
	return new URL(sitePath(pathname), siteOrigin).toString();
}

function markdownPathForRoute(route) {
	if (route === '/') {
		return '/index.md';
	}

	return `${route}.md`;
}

function guessTitleFromRoute(route) {
	if (route === '/') {
		return 'Overview';
	}

	const slug = route.split('/').filter(Boolean).at(-1) ?? 'Overview';
	return slug
		.split('-')
		.map(part => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ');
}

function guessTitleFromFileStem(stem) {
	return stem
		.split('-')
		.map(part => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ');
}

function descriptionForFrontmatter(frontmatter) {
	if (
		typeof frontmatter?.nextjs?.metadata?.description === 'string' &&
		frontmatter.nextjs.metadata.description.trim().length > 0
	) {
		return frontmatter.nextjs.metadata.description.trim();
	}

	if (typeof frontmatter?.description === 'string' && frontmatter.description.trim().length > 0) {
		return frontmatter.description.trim();
	}

	return null;
}

function descriptionFromLeadingComment(source) {
	const match = source.match(/^\/\*\*([\s\S]*?)\*\//);
	if (!match) {
		return null;
	}

	const text = match[1]
		.split('\n')
		.map(line => line.replace(/^\s*\*\s?/, '').trim())
		.filter(Boolean)
		.join(' ')
		.replace(/\s+/g, ' ')
		.trim();

	if (!text) {
		return null;
	}

	const firstSentence = text.match(/^.+?[.!?](?:\s|$)/);
	return (firstSentence?.[0] ?? text).trim();
}

function splitFrontmatter(source) {
	if (!source.startsWith('---\n')) {
		return { frontmatter: {}, body: source.trimStart() };
	}

	const end = source.indexOf('\n---\n', 4);
	if (end === -1) {
		return { frontmatter: {}, body: source.trimStart() };
	}

	const parsed = yaml.load(source.slice(4, end)) ?? {};
	return {
		frontmatter: parsed,
		body: source.slice(end + 5).trimStart(),
	};
}

function routeForPageFile(filePath) {
	const routePath = relative(appDir, filePath).replace(/\\/g, '/');
	if (routePath === 'page.md') {
		return '/';
	}

	return `/${routePath.slice(0, -'/page.md'.length)}`;
}

function markdownGroupForRoute(route) {
	if (route === '/' || route.startsWith('/docs/getting-started/')) {
		return 'Getting Started';
	}

	if (route.startsWith('/docs/core-concepts/')) {
		return 'Core Concepts';
	}

	if (route.startsWith('/docs/guides/')) {
		return 'Guides';
	}

	if (route.startsWith('/docs/plugins/')) {
		return 'Plugins';
	}

	if (route.startsWith('/docs/components/')) {
		return 'Components';
	}

	if (route.startsWith('/docs/api/')) {
		return 'API Reference';
	}

	return 'Reference';
}

function compareEntries(a, b) {
	const groupDiff = markdownGroupOrder.indexOf(a.group) - markdownGroupOrder.indexOf(b.group);
	if (groupDiff !== 0) {
		return groupDiff;
	}

	if (a.route === '/' && b.route !== '/') {
		return -1;
	}

	if (a.route !== '/' && b.route === '/') {
		return 1;
	}

	const aKey = a.route ?? a.assetPath ?? a.markdownPath ?? a.title;
	const bKey = b.route ?? b.assetPath ?? b.markdownPath ?? b.title;
	return aKey.localeCompare(bKey);
}

function renderMarkdownIndex(entries) {
	const lines = [];

	for (const group of markdownGroupOrder) {
		const groupEntries = entries.filter(entry => entry.group === group);
		if (groupEntries.length === 0) {
			continue;
		}

		lines.push(`### ${group}`);
		for (const entry of groupEntries) {
			lines.push(`- [${entry.title}](${entry.markdownUrl})${entry.description ? ` - ${entry.description}` : ''}`);
		}
		lines.push('');
	}

	return lines.join('\n').trim();
}

function renderExampleIndex(entries) {
	const lines = [
		'# ShaderPad example source mirrors',
		'',
		'These are raw TypeScript mirrors of the public example entry files.',
		'Use them for concrete ShaderPad patterns and ignore demo-app scaffolding when it is not relevant.',
		'',
	];

	for (const entry of entries) {
		lines.push(`- [${entry.title}](${entry.assetUrl})${entry.description ? ` - ${entry.description}` : ''}`);
	}

	return `${lines.join('\n').trim()}\n`;
}

function renderAssetIndex(entries) {
	return entries
		.map(entry => {
			const url = entry.assetUrl ?? entry.markdownUrl;
			return `- [${entry.title}](${url})${entry.description ? ` - ${entry.description}` : ''}`;
		})
		.join('\n');
}

function renderLlmsIndex(entries) {
	return JSON.stringify(
		{
			schemaVersion: 2,
			generatedAt: new Date().toISOString(),
			siteOrigin,
			docsBasePath,
			llmsUrl: absoluteSiteUrl('/llms.txt'),
			llmsFullUrl: absoluteSiteUrl('/llms-full.txt'),
			examplesIndexUrl: absoluteSiteUrl('/examples/source'),
			aiAgentGuideUrl: absoluteSiteUrl('/docs/getting-started/ai-agent-guide'),
			entries: entries.map(entry => ({
				kind: entry.kind,
				section: entry.group,
				title: entry.title,
				description: entry.description,
				markdownPath: entry.markdownPath ?? null,
				markdownUrl: entry.markdownUrl ?? null,
				assetPath: entry.assetPath ?? null,
				assetUrl: entry.assetUrl ?? null,
				htmlPath: entry.route ?? null,
				htmlUrl: entry.htmlUrl ?? null,
				language: entry.language ?? null,
				sourceUrl: entry.sourceUrl ?? null,
			})),
		},
		null,
		2,
	);
}

function exampleMirrorOutputPath(filename) {
	if (/\.html?$/i.test(filename)) {
		return join(publicDir, 'examples', 'source', 'assets', filename);
	}
	return join(publicDir, 'examples', 'source', filename);
}

function renderLlmsFull(entries) {
	const parts = [
		'# ShaderPad llms-full',
		'',
		'This file aggregates the raw markdown content that powers the ShaderPad docs site.',
		`Prefer [llms.txt](${absoluteSiteUrl('/llms.txt')}) first for the smaller curated index.`,
		`For local example source mirrors, use [examples/source](${absoluteSiteUrl('/examples/source')}).`,
	];

	for (const entry of entries) {
		parts.push('', '---', '', `## ${entry.title}`, '');
		if (entry.kind === 'example') {
			parts.push(`- Source mirror: ${entry.assetUrl}`);
			if (entry.language) {
				parts.push(`- Language: ${entry.language}`);
			}
		} else {
			parts.push(`- Markdown: ${entry.markdownUrl}`);
		}
		if (entry.htmlUrl) {
			parts.push(`- Canonical HTML: ${entry.htmlUrl}`);
		}
		if (entry.sourceUrl) {
			parts.push(`- Canonical source: ${entry.sourceUrl}`);
		}
		parts.push('', entry.llmsBody.trim(), '');
	}

	return `${parts.join('\n').trim()}\n`;
}

function renderQuickLinks(markdocBlock) {
	const matches = [...markdocBlock.matchAll(/{%\s*quick-link\s+([^%]+?)\/%\}/g)];
	if (matches.length === 0) {
		return '';
	}

	return matches
		.map(([, attrs]) => {
			const title = /title="([^"]+)"/.exec(attrs)?.[1] ?? 'Link';
			const href = /href="([^"]+)"/.exec(attrs)?.[1] ?? '#';
			const description = /description="([^"]+)"/.exec(attrs)?.[1];
			return `- [${title}](${href})${description ? ` - ${description}` : ''}`;
		})
		.join('\n');
}

function sanitizeMarkdocForLlmsFull(body, shaderpadSizeValue) {
	let output = body;

	output = output.replace(/\s*\{%\s*\.lead\s*%\}/g, '');
	output = output.replace(/{%\s*shaderpad-size\s*\/%\}/g, shaderpadSizeValue);
	output = output.replace(
		/{%\s*(built-in-inputs-preview|quickstart-preview)\s*\/%\}/g,
		'_Interactive preview omitted in llms-full._',
	);
	output = output.replace(/{%\s*quick-links\s*%}([\s\S]*?){%\s*\/quick-links\s*%}/g, (_, inner) =>
		renderQuickLinks(inner),
	);
	output = output.replace(/{%\s*callout([^%]*)%}([\s\S]*?){%\s*\/callout\s*%}/g, (_, attrs, inner) => {
		const title = /title="([^"]+)"/.exec(attrs)?.[1];
		const content = inner
			.trim()
			.split('\n')
			.map(line => line.trim())
			.filter(Boolean)
			.join(' ');
		return `> ${title ? `**${title}:** ` : ''}${content}`;
	});
	output = output.replace(/\]\((\/[^)]+)\)/g, (_match, path) => {
		return `](${absoluteSiteUrl(path)})`;
	});

	return output.replace(/\n{3,}/g, '\n\n').trim();
}

const pageFiles = await fg('**/page.md', {
	cwd: appDir,
	absolute: true,
	onlyFiles: true,
});
const exampleFiles = await fg('*.{ts,tsx}', {
	cwd: examplesDir,
	absolute: true,
	onlyFiles: true,
	ignore: ['*.d.ts', 'main.ts'],
});
const exampleAssetFiles = await fg('*.{ts,tsx,js,jsx,glsl,html}', {
	cwd: examplesDir,
	absolute: true,
	onlyFiles: true,
	ignore: ['*.d.ts', 'main.ts'],
});
const exampleMetadataBySlug = new Map(exampleRegistry.map(entry => [entry.slug, entry]));
const exampleOrderBySlug = new Map(exampleRegistry.map((entry, index) => [entry.slug, index]));

const generatedSizeSource = JSON.parse(await readFile(generatedSizePath, 'utf8'));
const shaderpadSizeValue = generatedSizeSource.exports['.'].gzipped;

const docEntries = [];
for (const filePath of pageFiles) {
	const raw = (await readFile(filePath, 'utf8')).replace(/\r\n/g, '\n');
	const route = routeForPageFile(filePath);
	const { frontmatter, body } = splitFrontmatter(raw);
	const title =
		typeof frontmatter.title === 'string' && frontmatter.title.trim().length > 0
			? frontmatter.title.trim()
			: guessTitleFromRoute(route);
	const description = descriptionForFrontmatter(frontmatter);
	const sourcePath = relative(repoRoot, filePath).replace(/\\/g, '/');

	docEntries.push({
		kind: 'doc',
		title,
		description,
		route,
		group: markdownGroupForRoute(route),
		raw,
		body,
		llmsBody: sanitizeMarkdocForLlmsFull(body, shaderpadSizeValue),
		markdownPath: markdownPathForRoute(route),
		markdownUrl: absoluteSiteUrl(markdownPathForRoute(route)),
		htmlUrl: absoluteSiteUrl(route),
		sourceUrl: new URL(sourcePath, repoBlobBase).toString(),
	});
}

docEntries.sort(compareEntries);

const repoReadmeRaw = (await readFile(repoReadmePath, 'utf8')).replace(/\r\n/g, '\n');
const repoReadmeEntry = {
	kind: 'reference',
	title: 'Repository README',
	description: 'Long-form repository overview, API walkthrough, and example-driven reference.',
	route: null,
	group: 'Reference',
	raw: repoReadmeRaw,
	body: repoReadmeRaw,
	llmsBody: repoReadmeRaw,
	markdownPath: '/README.md',
	markdownUrl: absoluteSiteUrl('/README.md'),
	htmlUrl: null,
	sourceUrl: 'https://github.com/miseryco/shaderpad/blob/main/README.md',
};

const exampleEntries = [];
for (const filePath of exampleFiles) {
	const raw = (await readFile(filePath, 'utf8')).replace(/\r\n/g, '\n');
	const filename = relative(examplesDir, filePath).replace(/\\/g, '/');
	const stem = filename.replace(/\.tsx?$/, '');
	const metadata = exampleMetadataBySlug.get(stem);
	const language = filename.endsWith('.tsx') ? 'tsx' : 'ts';

	exampleEntries.push({
		kind: 'example',
		title: metadata?.title ?? guessTitleFromFileStem(stem),
		description: metadata?.description ?? descriptionFromLeadingComment(raw),
		route: null,
		group: 'Examples',
		raw,
		body: raw,
		llmsBody: `\`\`\`${language}\n${raw.trim()}\n\`\`\``,
		assetPath: `/examples/source/${filename}`,
		assetUrl: absoluteSiteUrl(`/examples/source/${filename}`),
		htmlUrl: null,
		language,
		slug: stem,
		sourceUrl: new URL(`docs/src/examples/demos/${filename}`, repoBlobBase).toString(),
	});
}

exampleEntries.sort(
	(a, b) =>
		(exampleOrderBySlug.get(a.slug) ?? Number.MAX_SAFE_INTEGER) -
		(exampleOrderBySlug.get(b.slug) ?? Number.MAX_SAFE_INTEGER),
);

const curatedExampleTitles = [
	'Basic',
	'LYGIA',
	'Webcam',
	'Cursor feedback',
	'Webcam trails',
	'MediaPipe chaining',
	'Camo',
	'Finger pens',
	'Single-channel textures',
];

const llmsTemplate = await readFile(llmsTemplatePath, 'utf8');
const llmsOutput = llmsTemplate
	.replace('{{LLMS_FULL_URL}}', absoluteSiteUrl('/llms-full.txt'))
	.replace('{{LLMS_INDEX_URL}}', absoluteSiteUrl('/llms-index.json'))
	.replace('{{EXAMPLES_INDEX_URL}}', absoluteSiteUrl('/examples/source'))
	.replace('{{README_MARKDOWN_URL}}', repoReadmeEntry.markdownUrl)
	.replace(
		'{{CURATED_EXAMPLES_INDEX}}',
		renderAssetIndex(
			curatedExampleTitles.map(title => exampleEntries.find(entry => entry.title === title)).filter(Boolean),
		),
	)
	.replace('{{MARKDOWN_DOCS_INDEX}}', renderMarkdownIndex([...docEntries, repoReadmeEntry].sort(compareEntries)));

if (llmsOutput.includes('{{')) {
	throw new Error('Unresolved placeholder found in llms template output.');
}

await mkdir(publicDir, { recursive: true });
await rm(join(publicDir, 'docs'), { recursive: true, force: true });
await rm(join(publicDir, 'examples', 'source'), { recursive: true, force: true });
await rm(join(publicDir, 'examples', 'src'), { recursive: true, force: true });
await rm(join(publicDir, 'examples', 'index.md'), { force: true });
await writeFile(join(publicDir, 'llms.txt'), `${llmsOutput.trim()}\n`, 'utf8');
await writeFile(
	join(publicDir, 'llms-full.txt'),
	renderLlmsFull([...docEntries, repoReadmeEntry, ...exampleEntries]),
	'utf8',
);
await writeFile(
	join(publicDir, 'llms-index.json'),
	`${renderLlmsIndex([...docEntries, ...exampleEntries, repoReadmeEntry])}\n`,
	'utf8',
);

for (const entry of [...docEntries, repoReadmeEntry]) {
	const outputPath = join(publicDir, entry.markdownPath.replace(/^\//, ''));
	await mkdir(dirname(outputPath), { recursive: true });
	await writeFile(outputPath, entry.raw, 'utf8');
}

for (const filePath of exampleAssetFiles) {
	const raw = (await readFile(filePath, 'utf8')).replace(/\r\n/g, '\n');
	const filename = relative(examplesDir, filePath).replace(/\\/g, '/');
	const outputPath = exampleMirrorOutputPath(filename);
	await mkdir(dirname(outputPath), { recursive: true });
	await writeFile(outputPath, raw, 'utf8');
}

console.log(
	`Updated LLM artifacts: llms.txt, llms-full.txt, ${docEntries.length + 1} markdown mirrors, ${exampleEntries.length} example mirrors`,
);
