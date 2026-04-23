import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const result = spawnSync(npmCommand, ['exec', 'lint-staged'], {
	cwd: repoRoot,
	stdio: 'inherit',
});

if (result.error) {
	throw result.error;
}

if (result.status !== 0) {
	console.error('\nPre-commit aborted. Staged-file formatting failed or could not be applied safely.');
	console.error(
		'Only staged files are auto-formatted and re-added. If you use `git add -p`, re-stage the intended hunks and retry the commit.\n',
	);
	process.exit(result.status ?? 1);
}
