import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import http from 'node:http';

const root = process.cwd();
const port = Number(process.env.PORT || 4173);

const contentTypes = {
	'.css': 'text/css; charset=utf-8',
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.map': 'application/json; charset=utf-8',
	'.mjs': 'text/javascript; charset=utf-8',
	'.png': 'image/png',
	'.svg': 'image/svg+xml',
	'.ts': 'text/plain; charset=utf-8',
};

function resolvePath(urlPath) {
	const safePath = normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[/\\])+/, '');
	let filePath = join(root, safePath);
	if (existsSync(filePath) && statSync(filePath).isDirectory()) {
		filePath = join(filePath, 'index.html');
	}
	return filePath;
}

const server = http.createServer((req, res) => {
	const url = new URL(req.url || '/', `http://${req.headers.host}`);
	const pathname = url.pathname === '/' ? '/packages/shaderpad/test/browser/fixtures/index.html' : url.pathname;
	const filePath = resolvePath(pathname);

	if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
		res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
		res.end('Not found');
		return;
	}

	res.writeHead(200, {
		'cache-control': 'no-store',
		'content-type': contentTypes[extname(filePath)] || 'application/octet-stream',
	});
	createReadStream(filePath).pipe(res);
});

server.listen(port, () => {
	process.stdout.write(`ShaderPad browser test server listening on http://127.0.0.1:${port}\n`);
});
