#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const DEFAULT_TARGET_DIR = 'shaderpad-project';
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const starterDefinitions = {
	basic: {
		label: 'Basic shader',
		hint: 'fullscreen fragment shader',
	},
	lygia: {
		label: 'Shader with LYGIA',
		hint: 'fullscreen shader with LYGIA imports',
	},
	face: {
		label: 'Shader with face tracking',
		hint: 'MediaPipe face tracking over webcam',
	},
	pose: {
		label: 'Shader with pose tracking',
		hint: 'MediaPipe pose tracking over webcam',
	},
	hands: {
		label: 'Shader with hand tracking',
		hint: 'MediaPipe hand tracking over webcam',
	},
	segmenter: {
		label: 'Shader with segmentation',
		hint: 'MediaPipe segmentation over webcam',
	},
};
const variantDefinitions = {
	ts: {
		label: 'TypeScript',
	},
	js: {
		label: 'JavaScript',
	},
};
const templateDefinitions = Object.fromEntries(
	Object.keys(starterDefinitions).flatMap(starter =>
		Object.keys(variantDefinitions).map(variant => [
			`${starter}-${variant}`,
			{
				starter,
				variant,
				dir: `template-${starter}-${variant}`,
			},
		]),
	),
);
const defaultStarter = 'basic';
const defaultVariant = 'ts';
const defaultTemplate = `${defaultStarter}-${defaultVariant}`;

function getTemplateLabel(templateKey) {
	const template = templateDefinitions[templateKey];
	if (!template) return templateKey;
	return `${starterDefinitions[template.starter].label} (${variantDefinitions[template.variant].label})`;
}

function getTemplateHelpText() {
	return Object.keys(templateDefinitions)
		.map(templateKey => `  ${templateKey.padEnd(18)}${getTemplateLabel(templateKey)}`)
		.join('\n');
}

function printHelp() {
	console.log(`Usage: create-shaderpad [project-name] [--template <name>] [--skip-install]

Scaffold a ShaderPad starter project from one of the built-in templates.

Templates:
${getTemplateHelpText()}

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

function copySharedGitignore(variant, targetDir) {
	const sourcePath = path.resolve(__dirname, '..', 'shared', `gitignore-${variant}`);
	if (!fs.existsSync(sourcePath)) {
		fail(`Shared .gitignore template not found: ${sourcePath}`);
	}
	fs.copyFileSync(sourcePath, path.join(targetDir, '.gitignore'));
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
			if (!args[i + 1]) {
				fail('Missing value for --template');
			}
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
			message: 'Project name',
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
		const starterAnswer = await select({
			message: 'Select a starter',
			initialValue: defaultStarter,
			options: Object.entries(starterDefinitions).map(([value, starter]) => ({
				value,
				label: starter.label,
				hint: starter.hint,
			})),
		});
		if (isCancel(starterAnswer)) {
			cancel('Cancelled.');
			process.exit(0);
		}

		const variantAnswer = await select({
			message: 'Select a variant',
			initialValue: defaultVariant,
			options: Object.entries(variantDefinitions).map(([value, variant]) => ({
				value,
				label: variant.label,
			})),
		});
		if (isCancel(variantAnswer)) {
			cancel('Cancelled.');
			process.exit(0);
		}

		templateKey = `${String(starterAnswer)}-${String(variantAnswer)}`;
	}

	outro(`Using ${getTemplateLabel(templateKey)}`);
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
		fail(`Unknown template "${templateKey}". Expected one of: ${Object.keys(templateDefinitions).join(', ')}`);
	}

	const templateDir = path.resolve(__dirname, '..', template.dir);
	const targetDir = path.resolve(process.cwd(), inputDir);
	const projectName = inputDir === '.' ? path.basename(process.cwd()) : path.basename(path.normalize(targetDir));

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
	copySharedGitignore(template.variant, targetDir);

	const packageJsonPath = path.join(targetDir, 'package.json');
	const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
	packageJson.name = toValidPackageName(projectName) || DEFAULT_TARGET_DIR;
	fs.writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);

	console.log(`\nScaffolded ${getTemplateLabel(templateKey)} in ${path.relative(process.cwd(), targetDir) || '.'}`);

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
