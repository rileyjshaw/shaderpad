import { type MetadataRoute } from 'next'

import { absoluteSiteUrl } from '@/lib/site'

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/shaderpad/',
    },
    sitemap: absoluteSiteUrl('/sitemap.xml'),
  }
}
