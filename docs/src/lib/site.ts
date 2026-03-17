export const siteOrigin = 'https://rileyjshaw.com'
export const docsBasePath = '/shaderpad'

export function sitePath(pathname: string) {
  if (pathname === '/') {
    return `${docsBasePath}/`
  }

  if (/\.[a-z0-9]+$/i.test(pathname)) {
    return `${docsBasePath}${pathname}`
  }

  return `${docsBasePath}${pathname.replace(/\/+$/, '')}/`
}

export function absoluteSiteUrl(pathname: string) {
  return new URL(sitePath(pathname), siteOrigin).toString()
}
