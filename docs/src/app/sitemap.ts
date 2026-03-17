import { type MetadataRoute } from 'next'

import { navigation } from '@/lib/navigation'
import { absoluteSiteUrl } from '@/lib/site'

const staticPaths = ['/', '/llms.txt']
export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = new Set(staticPaths)

  for (const section of navigation) {
    for (const link of section.links) {
      paths.add(link.href)
    }
  }

  return [...paths].map((path) => ({
    url: absoluteSiteUrl(path),
    lastModified: new Date(),
  }))
}
