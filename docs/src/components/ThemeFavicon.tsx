'use client'

import { useLayoutEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'

function syncFavicon(theme: string) {
  let icon =
    theme === 'dark'
      ? '/shaderpad/icon-dark.svg'
      : '/shaderpad/icon-light.svg'
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
    if (link.href.endsWith(icon) && link.type === 'image/svg+xml' && !link.media) {
      continue
    }

    link.href = icon
    link.type = 'image/svg+xml'
    link.removeAttribute('media')
  }
}

export function ThemeFavicon() {
  let { resolvedTheme } = useTheme()
  let pathname = usePathname()

  useLayoutEffect(() => {
    let getTheme = () => {
      if (resolvedTheme) {
        return resolvedTheme
      }

      return document.documentElement.classList.contains('dark')
        ? 'dark'
        : 'light'
    }

    let applyThemeFavicon = () => syncFavicon(getTheme())

    applyThemeFavicon()

    let observer = new MutationObserver((mutations) => {
      let iconLinkChanged = mutations.some(({ addedNodes, removedNodes }) =>
        [...addedNodes, ...removedNodes].some(
          (node) =>
            node instanceof HTMLLinkElement && node.relList.contains('icon'),
        ),
      )

      if (iconLinkChanged) {
        applyThemeFavicon()
      }
    })

    observer.observe(document.head, { childList: true })

    return () => observer.disconnect()
  }, [pathname, resolvedTheme])

  return null
}
