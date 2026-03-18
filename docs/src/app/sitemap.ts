import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { type MetadataRoute } from 'next'

import { navigation } from '@/lib/navigation'
import { absoluteSiteUrl } from '@/lib/site'

function markdownPathForRoute(route: string) {
  if (route === '/') {
    return '/index.md'
  }

  return `${route}.md`
}

const staticPaths = ['/', '/index.md', '/llms.txt', '/llms-full.txt', '/llms-index.json', '/README.md']
export const dynamic = 'force-static'

function examplePaths() {
  try {
    return readdirSync(join(process.cwd(), 'public', 'examples', 'src'))
      .filter((name) => name.endsWith('.ts'))
      .map((name) => `/examples/src/${name}`)
  } catch {
    return []
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = new Set([...staticPaths, '/examples/index.md', ...examplePaths()])

  for (const section of navigation) {
    for (const link of section.links) {
      paths.add(link.href)
      paths.add(markdownPathForRoute(link.href))
    }
  }

  return [...paths].map((path) => ({
    url: absoluteSiteUrl(path),
    lastModified: new Date(),
  }))
}
