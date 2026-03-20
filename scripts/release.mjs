import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');
const createShaderpadDir = join(repoRoot, 'packages', 'create-shaderpad');
const starterTemplateDirs = [
	join(createShaderpadDir, 'template-basic-js'),
	join(createShaderpadDir, 'template-basic-ts'),
	join(createShaderpadDir, 'template-face-js'),
	join(createShaderpadDir, 'template-face-ts'),
];

const managedPackages = [
	{
		name: 'shaderpad',
		dir: repoRoot,
		publishArgs: ['publish'],
		latestTag: true,
	},
	{
		name: 'create-shaderpad',
		dir: createShaderpadDir,
		publishArgs: ['publish', '--workspace', 'create-shaderpad'],
		latestTag: true,
	},
];

function printHelp() {
	console.log(`Usage: node scripts/release.mjs [options]

Options:
  --tag <name>     npm publish tag to use (default: beta)
  --skip-add       Skip the interactive "npx changeset" step
  --skip-push      Skip "git push" and "git push --tags" during publish
  --skip-login     Skip npm auth check/login during publish
  --help, -h       Show this help message
`);
}

function parseArgs(argv) {
	const args = [...argv];
	if (args[0] && !args[0].startsWith('-')) {
		const command = args.shift();
		if (command !== 'release') {
			throw new Error(`Unknown command: ${command}`);
		}
	}

	const options = {
		tag: 'beta',
		skipAdd: false,
		skipPush: false,
		skipLogin: false,
	};

	for (let i = 0; i < args.length; i += 1) {
		const arg = args[i];
		if (arg === '--tag') {
			options.tag = args[i + 1];
			i += 1;
			continue;
		}
		if (arg === '--skip-add') {
			options.skipAdd = true;
			continue;
		}
		if (arg === '--skip-push') {
			options.skipPush = true;
			continue;
		}
		if (arg === '--skip-login') {
			options.skipLogin = true;
			continue;
		}
		if (arg === '--help' || arg === '-h') {
			printHelp();
			process.exit(0);
		}
		throw new Error(`Unknown argument: ${arg}`);
	}

	if (!options.tag) {
		throw new Error('Missing value for --tag');
	}

	return { options };
}

function run(command, args, { cwd = repoRoot, capture = false, allowFailure = false } = {}) {
	const result = spawnSync(command, args, {
		cwd,
		stdio: capture ? 'pipe' : 'inherit',
		encoding: 'utf8',
	});

	if (!allowFailure && result.status !== 0) {
		throw new Error(`Command failed: ${command} ${args.join(' ')}`);
	}

	return result;
}

function readPackageJson(packageDir) {
	return JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'));
}

function writePackageJson(packageDir, packageJson) {
	writeFileSync(join(packageDir, 'package.json'), `${JSON.stringify(packageJson, null, '\t')}\n`);
}

function getPackageStates() {
	return managedPackages.map(pkg => {
		const packageJson = readPackageJson(pkg.dir);
		return {
			...pkg,
			version: packageJson.version,
		};
	});
}

function ensureCleanWorktree() {
	const result = run('git', ['status', '--porcelain'], { capture: true });
	const output = result.stdout.trim();
	if (output) {
		throw new Error(
			[
				'Release flow requires a clean git worktree before it starts.',
				'Commit or stash other changes first so the release commit only contains versioning changes.',
				'Current git status:',
				output,
			].join('\n'),
		);
	}
}

function getChangedPackages(before, after) {
	return after.filter(pkg => {
		const previous = before.find(candidate => candidate.name === pkg.name);
		return previous && previous.version !== pkg.version;
	});
}

function getReleaseLabel(changedPackages) {
	const shaderpad = changedPackages.find(pkg => pkg.name === 'shaderpad');
	if (shaderpad) {
		return `v${shaderpad.version}`;
	}

	const starter = changedPackages.find(pkg => pkg.name === 'create-shaderpad');
	if (starter) {
		return `create-shaderpad@${starter.version}`;
	}

	throw new Error('No changed packages found.');
}

function ensureTagDoesNotExist(tagName) {
	const result = run('git', ['rev-parse', '-q', '--verify', `refs/tags/${tagName}`], {
		capture: true,
		allowFailure: true,
	});
	if (result.status === 0) {
		throw new Error(`Git tag already exists: ${tagName}`);
	}
}

function printReleaseSummary(changedPackages, label) {
	console.log('\nRelease summary:');
	for (const pkg of changedPackages) {
		console.log(`- ${pkg.name}@${pkg.version}`);
	}
	console.log(`- git label: ${label}\n`);
}

function syncStarterTemplateVersion(shaderpadVersion) {
	let didChange = false;
	for (const templateDir of starterTemplateDirs) {
		const templatePackageJson = readPackageJson(templateDir);
		if (templatePackageJson.dependencies.shaderpad === shaderpadVersion) {
			continue;
		}

		templatePackageJson.dependencies.shaderpad = shaderpadVersion;
		writePackageJson(templateDir, templatePackageJson);
		didChange = true;
	}

	return didChange;
}

function syncCreateShaderpadVersion(shaderpadVersion) {
	const starterPackageJson = readPackageJson(createShaderpadDir);
	if (starterPackageJson.version === shaderpadVersion) {
		return false;
	}

	starterPackageJson.version = shaderpadVersion;
	writePackageJson(createShaderpadDir, starterPackageJson);
	return true;
}

function prepareRelease(options) {
	ensureCleanWorktree();
	const before = getPackageStates();

	run('npm', ['run', 'build']);
	if (!options.skipAdd) {
		run('npx', ['changeset']);
	}
	run('npx', ['changeset', 'version']);

	const versionedPackages = getPackageStates();
	const shaderpadBefore = before.find(pkg => pkg.name === 'shaderpad');
	const shaderpadAfter = versionedPackages.find(pkg => pkg.name === 'shaderpad');
	if (!shaderpadBefore || !shaderpadAfter) {
		throw new Error('Unable to resolve shaderpad package state.');
	}

	if (shaderpadBefore.version !== shaderpadAfter.version) {
		syncCreateShaderpadVersion(shaderpadAfter.version);
		syncStarterTemplateVersion(shaderpadAfter.version);
	}

	run('npm', ['install', '--package-lock-only', '--ignore-scripts']);
	for (const templateDir of starterTemplateDirs) {
		run('npm', ['install', '--package-lock-only', '--ignore-scripts'], {
			cwd: templateDir,
		});
	}

	const after = getPackageStates();
	const changedPackages = getChangedPackages(before, after);
	if (changedPackages.length === 0) {
		throw new Error('No package versions changed after `changeset version`.');
	}

	const label = getReleaseLabel(changedPackages);
	ensureTagDoesNotExist(label);

	run('git', ['add', '.']);
	run('git', ['commit', '-m', label]);
	run('git', ['tag', label]);

	printReleaseSummary(changedPackages, label);
	return { changedPackages, label };
}

function ensureNpmAuth() {
	const whoami = run('npm', ['whoami'], { capture: true, allowFailure: true });
	if (whoami.status === 0) {
		return;
	}

	console.log('\nNo active npm session found. Starting `npm login`.\n');
	run('npm', ['login']);
}

function isPublished(packageName, version) {
	const result = run('npm', ['view', `${packageName}@${version}`, 'version', '--json'], {
		capture: true,
		allowFailure: true,
	});
	return result.status === 0;
}

function publishPackage(pkg, tag) {
	run('npm', [...pkg.publishArgs, '--tag', tag]);
}

function addLatestDistTag(pkg) {
	if (!pkg.latestTag) {
		return;
	}
	run('npm', ['dist-tag', 'add', `${pkg.name}@${pkg.version}`, 'latest']);
}

function publishRelease(options) {
	ensureCleanWorktree();
	const packages = getPackageStates();
	const unpublishedPackages = packages.filter(pkg => !isPublished(pkg.name, pkg.version));

	if (unpublishedPackages.length === 0) {
		console.log('\nNo unpublished package versions found. Nothing to publish.\n');
		return { unpublishedPackages };
	}

	if (!options.skipLogin) {
		ensureNpmAuth();
	}

	console.log('\nPublishing packages:');
	for (const pkg of unpublishedPackages) {
		console.log(`- ${pkg.name}@${pkg.version} (${options.tag})`);
		publishPackage(pkg, options.tag);
		addLatestDistTag(pkg);
	}
	console.log('');

	if (!options.skipPush) {
		run('git', ['push']);
		run('git', ['push', '--tags']);
	}

	return { unpublishedPackages };
}

function main() {
	const argv = process.argv.slice(2);
	if (argv.includes('--help') || argv.includes('-h')) {
		printHelp();
		return;
	}
	const { options } = parseArgs(argv);
	prepareRelease(options);
	publishRelease(options);
}

try {
	main();
} catch (error) {
	console.error(`\n${error instanceof Error ? error.message : String(error)}\n`);
	process.exit(1);
}
