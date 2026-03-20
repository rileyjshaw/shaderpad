#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const DEFAULT_TARGET_DIR = 'shaderpad-app';
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const templateDefinitions = {
	'basic-ts': {
		label: 'Basic + TypeScript',
		hint: 'default',
		dir: 'template-basic-ts',
	},
	'basic-js': {
		label: 'Basic + JavaScript',
		dir: 'template-basic-js',
	},
	'face-ts': {
		label: 'Face Plugin + TypeScript',
		hint: 'webcam + MediaPipe',
		dir: 'template-face-ts',
	},
	'face-js': {
		label: 'Face Plugin + JavaScript',
		hint: 'webcam + MediaPipe',
		dir: 'template-face-js',
	},
};
const defaultTemplate = 'basic-ts';

function printHelp() {
	console.log(`Usage: create-shaderpad [project-name] [--template <name>] [--skip-install]

Scaffold a ShaderPad starter project from one of the built-in templates.

Templates:
  basic-ts  Basic starter with TypeScript
  basic-js  Basic starter with JavaScript
  face-ts   Face plugin starter with TypeScript
  face-js   Face plugin starter with JavaScript

Options:
  --template <name>              Choose a template (default: ${defaultTemplate})
  --skip-install, --no-install  Copy files without running npm install
  --help, -h                    Show this message
`);
}

function toValidPackageName(projectName) {
	return projectName
		.trim()
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/^[._]+/, '')
		.replace(/[^a-z0-9-~]+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
}

function copyTemplateFiles(sourceDir, targetDir) {
	for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
		const sourcePath = path.join(sourceDir, entry.name);
		const targetPath = path.join(targetDir, entry.name);
		fs.cpSync(sourcePath, targetPath, { recursive: true });
	}
}

function fail(message) {
	console.error(`\n${message}`);
	process.exit(1);
}

function parseArgs(args) {
	const options = {
		template: undefined,
		shouldInstall: true,
		inputDir: undefined,
	};

	for (let i = 0; i < args.length; i += 1) {
		const arg = args[i];
		if (arg === '--help' || arg === '-h') {
			printHelp();
			process.exit(0);
		}
		if (arg === '--skip-install' || arg === '--no-install') {
			options.shouldInstall = false;
			continue;
		}
		if (arg === '--template') {
			options.template = args[i + 1];
			i += 1;
			continue;
		}
		if (arg.startsWith('-')) {
			fail(`Unknown option: ${arg}`);
		}
		if (!options.inputDir) {
			options.inputDir = arg;
			continue;
		}
		fail(`Unexpected extra argument: ${arg}`);
	}

	return options;
}

async function promptForMissingOptions(options) {
	const prompts = await import('@clack/prompts');
	const { cancel, intro, isCancel, outro, select, text } = prompts;

	intro('create-shaderpad');

	let inputDir = options.inputDir;
	if (!inputDir) {
		const answer = await text({
			message: 'Where should we create your project?',
			placeholder: DEFAULT_TARGET_DIR,
			initialValue: DEFAULT_TARGET_DIR,
			validate(value) {
				if (!value || !String(value).trim()) {
					return 'Please enter a directory name.';
				}
			},
		});
		if (isCancel(answer)) {
			cancel('Cancelled.');
			process.exit(0);
		}
		inputDir = String(answer);
	}

	let templateKey = options.template;
	if (!templateKey) {
		const answer = await select({
			message: 'Which starter do you want?',
			initialValue: defaultTemplate,
			options: Object.entries(templateDefinitions).map(([value, template]) => ({
				value,
				label: template.label,
				hint: template.hint,
			})),
		});
		if (isCancel(answer)) {
			cancel('Cancelled.');
			process.exit(0);
		}
		templateKey = String(answer);
	}

	outro(`Using ${templateDefinitions[templateKey].label}`);
	return { inputDir, templateKey };
}

async function main() {
	const parsed = parseArgs(process.argv.slice(2));
	const hasPromptContext = process.stdin.isTTY && process.stdout.isTTY;
	const { inputDir, templateKey } =
		hasPromptContext && (!parsed.inputDir || !parsed.template)
			? await promptForMissingOptions(parsed)
			: {
					inputDir: parsed.inputDir ?? DEFAULT_TARGET_DIR,
					templateKey: parsed.template ?? defaultTemplate,
				};

	const template = templateDefinitions[templateKey];
	if (!template) {
		fail(
			`Unknown template "${templateKey}". Expected one of: ${Object.keys(templateDefinitions).join(', ')}`,
		);
	}

	const templateDir = path.resolve(__dirname, '..', template.dir);
	const targetDir = path.resolve(process.cwd(), inputDir);
	const projectName =
		inputDir === '.' ? path.basename(process.cwd()) : path.basename(path.normalize(targetDir));

	if (!fs.existsSync(templateDir)) {
		fail(`Template directory not found: ${templateDir}`);
	}

	if (fs.existsSync(targetDir)) {
		const existingEntries = fs.readdirSync(targetDir);
		if (existingEntries.length > 0) {
			fail(`Target directory is not empty: ${targetDir}`);
		}
	} else {
		fs.mkdirSync(targetDir, { recursive: true });
	}

	copyTemplateFiles(templateDir, targetDir);

	const packageJsonPath = path.join(targetDir, 'package.json');
	const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
	packageJson.name = toValidPackageName(projectName) || 'shaderpad-app';
	fs.writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);

	console.log(
		`\nScaffolded ${template.label} in ${path.relative(process.cwd(), targetDir) || '.'}`,
	);

	if (parsed.shouldInstall) {
		console.log('\nInstalling dependencies...\n');
		const result = spawnSync(npmCommand, ['install'], {
			cwd: targetDir,
			stdio: 'inherit',
		});

		if (result.status !== 0) {
			fail('npm install failed.');
		}
	}

	const relativeTargetDir = path.relative(process.cwd(), targetDir) || '.';
	const cdCommand = inputDir === '.' ? '' : `cd ${JSON.stringify(relativeTargetDir)}\n`;
	console.log(`\nNext steps:\n${cdCommand}npm run dev\n`);
}

main().catch(error => {
	fail(error instanceof Error ? error.message : String(error));
});
