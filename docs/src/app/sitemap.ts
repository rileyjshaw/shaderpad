import { type MetadataRoute } from 'next'

import { examples } from '@/examples/registry'
import { navigation } from '@/lib/navigation'
import { absoluteSiteUrl } from '@/lib/site'

function markdownPathForRoute(route: string) {
  if (route === '/') {
    return '/index.md'
  }

  return `${route}.md`
}

const staticPaths = [
  '/',
  '/index.md',
  '/llms.txt',
  '/llms-full.txt',
  '/llms-index.json',
  '/README.md',
  '/examples',
  '/examples/source',
]
export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = new Set([
    ...staticPaths,
    ...examples.map((example) => `/examples/${example.slug}`),
    ...examples.map((example) => example.sourcePath),
  ])

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
