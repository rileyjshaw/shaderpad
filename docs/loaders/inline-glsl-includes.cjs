const fs = require('node:fs');
const path = require('node:path');

const projectNodeModulesDir = path.resolve(__dirname, '..', '..', 'node_modules');

function resolveInclude(resourcePath, request) {
	if (request.startsWith('/')) {
		return path.resolve(projectNodeModulesDir, request.replace(/^\/+/, ''));
	}

	if (request.startsWith('.') || !request.includes('/')) {
		return path.resolve(path.dirname(resourcePath), request);
	}

	return path.resolve(projectNodeModulesDir, request);
}

function inlineIncludes(loaderContext, resourcePath, source, seen) {
	return source.replace(/#include\s+["']([^"']+)["'];?/g, (match, request) => {
		const resolvedPath = resolveInclude(resourcePath, request);
		loaderContext.addDependency(resolvedPath);

		if (seen.has(resolvedPath)) {
			return fs.readFileSync(resolvedPath, 'utf8');
		}

		seen.add(resolvedPath);
		const includedSource = fs.readFileSync(resolvedPath, 'utf8');
		const expandedSource = inlineIncludes(loaderContext, resolvedPath, includedSource, seen);
		seen.delete(resolvedPath);
		return expandedSource;
	});
}

module.exports = function inlineGlslIncludesLoader(source) {
	this.cacheable?.();
	return inlineIncludes(this, this.resourcePath, source, new Set([this.resourcePath]));
};
