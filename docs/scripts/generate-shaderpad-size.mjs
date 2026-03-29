import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import prettier from 'prettier';

const docsDir = dirname(fileURLToPath(import.meta.url));
const docsRoot = resolve(docsDir, '..');
const repoRoot = resolve(docsRoot, '..');
const sizeScriptPath = join(repoRoot, 'scripts', 'size-standard-import.mjs');
const generatedDir = join(docsRoot, 'src', 'generated');
const outputPath = join(generatedDir, 'shaderpad-size.ts');

const output = execFileSync(process.execPath, [sizeScriptPath, '--json'], {
	cwd: docsRoot,
	encoding: 'utf8',
});
const { gzipped, gzippedBytes } = JSON.parse(output);

async function formatGeneratedArtifact(source, filepath) {
	const options = (await prettier.resolveConfig(filepath)) ?? {};
	return prettier.format(source, { ...options, filepath });
}

await mkdir(generatedDir, { recursive: true });
await writeFile(
	outputPath,
	await formatGeneratedArtifact(
		[
			`export const shaderpadStandardImportGzipBytes = ${gzippedBytes};`,
			`export const shaderpadStandardImportGzip = ${JSON.stringify(gzipped)};`,
			`export const shaderpadStandardImportGzipLabel = ${JSON.stringify(`${gzipped} gzipped`)};`,
			'',
		].join('\n'),
		outputPath,
	),
	'utf8',
);

console.log(`Updated ${outputPath} with ${gzipped} gzipped`);
