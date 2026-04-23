import { copyFile, mkdir, readdir, readFile, rm, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageDir = dirname(scriptDir);
const srcDir = join(packageDir, 'src', 'helpers');
const outputDir = join(packageDir, 'dist', 'helpers');
const cssFile = 'web-component.css';
const typeDefinition = 'declare const value: string;\nexport default value;\n';

const helperFiles = (await readdir(srcDir)).filter(name => name.endsWith('.glsl') && name !== 'all.glsl').sort();
const helperSources = await Promise.all(
	helperFiles.map(async name => ({
		name,
		source: await readFile(join(srcDir, name), 'utf8'),
	})),
);

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

for (const { name, source } of helperSources) {
	await writeFile(join(outputDir, name), source);
	await writeFile(join(outputDir, `${name}.d.ts`), typeDefinition);
}

await copyFile(join(packageDir, 'src', cssFile), join(packageDir, 'dist', cssFile));
