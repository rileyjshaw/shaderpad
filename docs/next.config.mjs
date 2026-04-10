import path from 'node:path';
import { fileURLToPath } from 'node:url';
import withMarkdoc from '@markdoc/next.js';

import withSearch from './src/markdoc/search.mjs';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const pagesBasePath = '/shaderpad';
const nodeModulesDir = path.resolve(currentDir, '..', 'node_modules');

function resolveGLSLImport(resourcePath, request) {
	if (request.startsWith('/')) {
		return path.resolve(nodeModulesDir, request.replace(/^\/+/, ''));
	}

	if (request.startsWith('.') || !request.includes('/')) {
		return path.resolve(path.dirname(resourcePath), request);
	}

	return path.resolve(nodeModulesDir, request);
}

/** @type {import('next').NextConfig} */
const nextConfig = {
	assetPrefix: pagesBasePath || undefined,
	basePath: pagesBasePath,
	images: {
		unoptimized: true,
	},
	output: 'export',
	outputFileTracingRoot: path.join(currentDir, '..'),
	pageExtensions: ['js', 'jsx', 'md', 'ts', 'tsx'],
	trailingSlash: true,
	webpack(config) {
		config.module.rules.push({
			test: /\.glsl$/i,
			use: [
				{
					loader: 'raw-loader',
					options: {
						esModule: false,
					},
				},
				{
					loader: 'glslify-loader',
				},
				{
					loader: 'string-replace-loader',
					options: {
						multiple: [
							{
								search: /#include\s+["']([^"']+)["'];?/g,
								replace(match, request) {
									const resolvedPath = resolveGLSLImport(this.resourcePath, request);
									return `#pragma glslify: import('${resolvedPath.replace(/\\/g, '/')}')`;
								},
							},
						],
					},
				},
			],
		});

		return config;
	},
};

export default withSearch(withMarkdoc({ schemaPath: './src/markdoc' })(nextConfig));
