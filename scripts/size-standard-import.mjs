import { gzipSync } from 'node:zlib';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const args = new Set(process.argv.slice(2));
const require = createRequire(import.meta.url);
const scriptDir = dirname(fileURLToPath(import.meta.url));
const esbuildPath = require.resolve('esbuild', {
	paths: [process.cwd(), scriptDir, join(scriptDir, '..', 'docs')],
});
const { build } = await import(pathToFileURL(esbuildPath).href);

function formatKilobytes(bytes) {
	return `${(bytes / 1024).toFixed(1)} kB`;
}

const result = await build({
	absWorkingDir: process.cwd(),
	stdin: {
		// Re-export the default import so tree-shaking cannot discard it.
		contents: "export { default } from 'shaderpad';\n",
		resolveDir: process.cwd(),
		sourcefile: 'size-standard-import-entry.js',
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
const gzippedBytes = gzipSync(contents).byteLength;
const gzipped = formatKilobytes(gzippedBytes);

if (args.has('--json')) {
	console.log(JSON.stringify({ gzippedBytes, gzipped }));
} else if (args.has('--raw')) {
	console.log(String(gzippedBytes));
} else {
	console.log(`Core ShaderPad import: ${gzipped} gzipped`);
}
