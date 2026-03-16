import path from 'node:path'
import { fileURLToPath } from 'node:url'
import withMarkdoc from '@markdoc/next.js'

import withSearch from './src/markdoc/search.mjs'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const pagesBasePath = '/shaderpad'

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
}

export default withSearch(
  withMarkdoc({ schemaPath: './src/markdoc' })(nextConfig),
)
