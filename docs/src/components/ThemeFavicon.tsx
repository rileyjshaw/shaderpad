'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'

export function ThemeFavicon() {
  let { resolvedTheme } = useTheme()
  let pathname = usePathname()

  useEffect(() => {
    if (!resolvedTheme) {
      return
    }

    let icon = resolvedTheme === 'dark' ? '/icon-dark.svg' : '/icon-light.svg'
    let links = Array.from(
      document.head.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]'),
    )

    if (links.length === 0) {
      let link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
      links.push(link)
    }

    for (let link of links) {
      link.href = icon
      link.type = 'image/svg+xml'
      link.removeAttribute('media')
    }
  }, [pathname, resolvedTheme])

  return null
}
