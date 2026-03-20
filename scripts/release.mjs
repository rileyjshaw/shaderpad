import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cancel, confirm, intro, isCancel, outro } from '@clack/prompts';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');
const changesetConfigPath = join(repoRoot, '.changeset', 'config.json');
const docsDir = join(repoRoot, 'docs');
const docsChangelogPath = join(docsDir, 'CHANGELOG.md');
const shaderpadDir = join(repoRoot, 'packages', 'shaderpad');
const createShaderpadDir = join(repoRoot, 'packages', 'create-shaderpad');
const createShaderpadChangelogPath = join(createShaderpadDir, 'CHANGELOG.md');
const starterTemplateDirs = [
	join(createShaderpadDir, 'template-basic-js'),
	join(createShaderpadDir, 'template-basic-ts'),
	join(createShaderpadDir, 'template-face-js'),
	join(createShaderpadDir, 'template-face-ts'),
];

const managedPackages = [
	{
		name: 'shaderpad',
		dir: shaderpadDir,
		publishArgs: ['publish', '--workspace', 'shaderpad'],
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
  --skip-add       Skip \`npx changeset\` and use an existing pending changeset
  --yes            Skip the final deploy confirmation prompt
  --skip-push      Skip "git push" and "git push --tags" during deploy
  --skip-login     Skip npm auth check/login during deploy
  --help, -h       Show this help message
`);
}

function parseArgs(argv) {
	const options = {
		tag: 'beta',
		skipAdd: false,
		yes: false,
		skipPush: false,
		skipLogin: false,
	};

	for (let i = 0; i < argv.length; i += 1) {
		const arg = argv[i];

		if (arg === '--tag') {
			const value = argv[i + 1];
			if (!value || value.startsWith('-')) {
				throw new Error('Missing value for --tag');
			}
			options.tag = value;
			i += 1;
			continue;
		}

		if (arg === '--skip-add') {
			options.skipAdd = true;
			continue;
		}

		if (arg === '--yes') {
			options.yes = true;
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

	return options;
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

function readChangesetConfig() {
	return JSON.parse(readFileSync(changesetConfigPath, 'utf8'));
}

function versionsPrivatePackages(changesetConfig) {
	if (changesetConfig.privatePackages === false) {
		return false;
	}

	if (
		changesetConfig.privatePackages &&
		typeof changesetConfig.privatePackages === 'object'
	) {
		return changesetConfig.privatePackages.version ?? true;
	}

	return true;
}

function getPackageStates() {
	return managedPackages.map(pkg => ({
		...pkg,
		version: readPackageJson(pkg.dir).version,
	}));
}

function ensureDocsStayOutOfRelease() {
	const docsPackageJson = readPackageJson(docsDir);
	const changesetConfig = readChangesetConfig();
	const ignoredPackages = Array.isArray(changesetConfig.ignore) ? changesetConfig.ignore : [];
	const docsIsIgnored = ignoredPackages.includes(docsPackageJson.name);

	if (!docsPackageJson.private) {
		throw new Error(
			[
				`Docs workspace "${docsPackageJson.name}" must remain private.`,
				'Docs are deployed by GitHub Actions on push to main, not by npm publish.',
			].join('\n'),
		);
	}

	if (existsSync(docsChangelogPath)) {
		throw new Error(
			[
				`Docs changelog found at ${docsChangelogPath}.`,
				'Docs should deploy on push to main and should not need their own release changelog.',
			].join('\n'),
		);
	}

	if (versionsPrivatePackages(changesetConfig) && !docsIsIgnored) {
		throw new Error(
			[
				`Changesets is allowed to version the docs workspace "${docsPackageJson.name}".`,
				'Set `.changeset/config.json` to `"privatePackages": false` or ignore the docs workspace.',
				'Docs should not need npm versioning, a changelog, or npm publish.',
			].join('\n'),
		);
	}
}

function ensureDocsWereNotVersioned(previousVersion) {
	const docsPackageJson = readPackageJson(docsDir);

	if (docsPackageJson.version !== previousVersion) {
		throw new Error(
			[
				`Docs version changed during release: ${previousVersion} -> ${docsPackageJson.version}.`,
				'Docs should deploy on push to main and should not be versioned or published through npm.',
			].join('\n'),
		);
	}
}

function ensureCleanWorktree() {
	const result = run('git', ['status', '--porcelain'], { capture: true });
	const output = result.stdout.trim();

	if (!output) {
		return;
	}

	throw new Error(
		[
			'Release flow requires a clean git worktree before it starts.',
			'Commit or stash other changes first so the release commit only contains versioning changes.',
			'Current git status:',
			output,
		].join('\n'),
	);
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

	throw new Error('No shaderpad version change detected.');
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

function syncDocsShaderpadVersion(shaderpadVersion) {
	const docsPackageJson = readPackageJson(docsDir);

	if (docsPackageJson.dependencies.shaderpad === shaderpadVersion) {
		return false;
	}

	docsPackageJson.dependencies.shaderpad = shaderpadVersion;
	writePackageJson(docsDir, docsPackageJson);
	return true;
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

function refreshRootLockfile() {
	run('npm', ['install', '--package-lock-only', '--ignore-scripts']);
}

function refreshStarterTemplateLockfiles() {
	for (const templateDir of starterTemplateDirs) {
		run('npm', ['install', '--package-lock-only', '--ignore-scripts'], {
			cwd: templateDir,
		});
	}
}

function deleteCreateShaderpadChangelog() {
	if (existsSync(createShaderpadChangelogPath)) {
		unlinkSync(createShaderpadChangelogPath);
	}
}

function prepareRelease(options) {
	ensureCleanWorktree();
	ensureDocsStayOutOfRelease();
	const before = getPackageStates();
	const docsVersionBefore = readPackageJson(docsDir).version;

	run('npm', ['run', 'build']);

	if (!options.skipAdd) {
		run('npx', ['changeset']);
	}

	run('npx', ['changeset', 'version']);
	ensureDocsWereNotVersioned(docsVersionBefore);

	const versionedPackages = getPackageStates();
	const shaderpadBefore = before.find(pkg => pkg.name === 'shaderpad');
	const shaderpadAfter = versionedPackages.find(pkg => pkg.name === 'shaderpad');

	if (!shaderpadBefore || !shaderpadAfter) {
		throw new Error('Unable to resolve shaderpad package state.');
	}

	if (shaderpadBefore.version !== shaderpadAfter.version) {
		syncDocsShaderpadVersion(shaderpadAfter.version);
		syncCreateShaderpadVersion(shaderpadAfter.version);
		syncStarterTemplateVersion(shaderpadAfter.version);
	}

	refreshRootLockfile();
	deleteCreateShaderpadChangelog();

	const after = getPackageStates();
	const changedPackages = getChangedPackages(before, after);
	if (changedPackages.length === 0) {
		throw new Error('No package versions changed after `changeset version`.');
	}

	const label = getReleaseLabel(changedPackages);
	ensureTagDoesNotExist(label);
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

function commitAndTagRelease(label) {
	run('git', ['add', '.']);
	run('git', ['commit', '-m', label]);
	run('git', ['tag', label]);
}

async function confirmDeploy(options, releaseInfo) {
	if (options.yes) {
		return;
	}

	if (!process.stdin.isTTY || !process.stdout.isTTY) {
		throw new Error('Release is ready. Re-run with --yes to deploy from a non-interactive shell.');
	}

	intro('ShaderPad release');

	const confirmed = await confirm({
		message: 'Deploy this release to npm and push the git tag?',
		initialValue: true,
	});

	if (isCancel(confirmed) || !confirmed) {
		cancel('Release cancelled.');
		process.exit(1);
	}
}

function deployRelease(options, releaseInfo) {
	if (!options.skipLogin) {
		ensureNpmAuth();
	}

	const packages = getPackageStates();
	const unpublishedPackages = packages.filter(pkg => !isPublished(pkg.name, pkg.version));
	const shaderpadPackage = unpublishedPackages.find(pkg => pkg.name === 'shaderpad');
	const starterPackage = unpublishedPackages.find(pkg => pkg.name === 'create-shaderpad');

	if (unpublishedPackages.length === 0) {
		console.log('\nNo unpublished package versions found. Skipping npm publish.\n');
	} else {
		console.log('\nPublishing packages:');

		if (shaderpadPackage) {
			console.log(`- ${shaderpadPackage.name}@${shaderpadPackage.version} (${options.tag})`);
			publishPackage(shaderpadPackage, options.tag);
			addLatestDistTag(shaderpadPackage);
		}
	}

	if (starterPackage) {
		refreshStarterTemplateLockfiles();
	}

	commitAndTagRelease(releaseInfo.label);

	if (starterPackage) {
		console.log(`- ${starterPackage.name}@${starterPackage.version} (${options.tag})`);
		publishPackage(starterPackage, options.tag);
		addLatestDistTag(starterPackage);
		console.log('');
	}

	if (!options.skipPush) {
		run('git', ['push']);
		run('git', ['push', '--tags']);
	}

	outro(`Release ${releaseInfo.label} complete.`);
}

async function main() {
	const options = parseArgs(process.argv.slice(2));
	const releaseInfo = prepareRelease(options);
	await confirmDeploy(options, releaseInfo);
	deployRelease(options, releaseInfo);
}

try {
	await main();
} catch (error) {
	console.error(`\n${error instanceof Error ? error.message : String(error)}\n`);
	process.exit(1);
}
