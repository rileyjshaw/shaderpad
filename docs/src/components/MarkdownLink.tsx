import Link from 'next/link'

function isInternalHref(href: string) {
  return href.startsWith('/') && !href.startsWith('//')
}

export function MarkdownLink({
  href = '',
  children,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (isInternalHref(href)) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    )
  }

  return (
    <a href={href} {...props}>
      {children}
    </a>
  )
}
