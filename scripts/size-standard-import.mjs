import { gzipSync } from 'node:zlib';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const args = new Set(process.argv.slice(2));
const require = createRequire(import.meta.url);
const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(scriptDir, '..');
const shaderpadPackageJsonPath = join(repoRoot, 'packages', 'shaderpad', 'package.json');
const esbuildPath = require.resolve('esbuild', {
	paths: [process.cwd(), scriptDir, join(scriptDir, '..', 'docs')],
});
const { build } = await import(pathToFileURL(esbuildPath).href);
const shaderpadPackage = JSON.parse(await readFile(shaderpadPackageJsonPath, 'utf8'));

function formatKilobytes(bytes) {
	return `${(bytes / 1024).toFixed(1)} kB`;
}

function compareExportPaths(a, b) {
	if (a === '.') return -1;
	if (b === '.') return 1;
	return a.localeCompare(b);
}

function isMeasurableExportPath(exportPath) {
	// Package export patterns like "./helpers/*.glsl" are routing rules, not
	// concrete specifiers that esbuild can import directly. Raw GLSL helper
	// exports are also excluded here because this size report is for the JS API.
	return !exportPath.includes('*') && !exportPath.endsWith('.glsl');
}

function getSpecifier(exportPath) {
	if (exportPath === '.') {
		return shaderpadPackage.name;
	}

	return `${shaderpadPackage.name}/${exportPath.slice(2)}`;
}

async function measureExport(exportPath) {
	const specifier = getSpecifier(exportPath);

	const result = await build({
		absWorkingDir: process.cwd(),
		stdin: {
			// Hold onto the namespace at runtime so tree-shaking cannot erase the module.
			contents: `import * as entrypoint from ${JSON.stringify(specifier)};\nself.x = entrypoint;\n`,
			resolveDir: process.cwd(),
			sourcefile: `size-${exportPath === '.' ? 'root' : exportPath.slice(2).replaceAll('/', '-')}-entry.js`,
		},
		bundle: true,
		write: false,
		format: 'esm',
		platform: 'browser',
		target: 'esnext',
		mainFields: ['module', 'main'],
		conditions: ['import', 'module', 'default'],
		minify: true,
		treeShaking: true,
		logLevel: 'silent',
	});

	const [{ contents }] = result.outputFiles;
	const minifiedBytes = contents.byteLength;
	const gzippedBytes = gzipSync(contents).byteLength;

	return {
		specifier,
		minifiedBytes,
		minified: formatKilobytes(minifiedBytes),
		gzippedBytes,
		gzipped: formatKilobytes(gzippedBytes),
		gzippedLabel: `${formatKilobytes(gzippedBytes)} gzipped`,
	};
}

const exportPaths = Object.keys(shaderpadPackage.exports)
	.filter(isMeasurableExportPath)
	.sort(compareExportPaths);
const exportSizes = Object.fromEntries(
	await Promise.all(
		exportPaths.map(async exportPath => [exportPath, await measureExport(exportPath)]),
	),
);

const report = {
	schemaVersion: 1,
	packageName: shaderpadPackage.name,
	generatedAt: new Date().toISOString(),
	exports: exportSizes,
};

if (args.has('--json')) {
	console.log(JSON.stringify(report, null, 2));
} else if (args.has('--raw')) {
	console.log(
		exportPaths
			.map(exportPath => `${getSpecifier(exportPath)} ${exportSizes[exportPath].gzippedBytes}`)
			.join('\n'),
	);
} else {
	console.log(
		exportPaths
			.map(
				exportPath =>
					`${getSpecifier(exportPath)}: ${exportSizes[exportPath].minified} minified, ${exportSizes[exportPath].gzippedLabel}`,
			)
			.join('\n'),
	);
}
