import { type Metadata } from 'next'
import localFont from 'next/font/local'
import clsx from 'clsx'

import { Providers } from '@/app/providers'
import { Layout } from '@/components/Layout'
import { ThemeFavicon } from '@/components/ThemeFavicon'

import '@/styles/tailwind.css'

const ufficio = localFont({
  src: '../fonts/UfficioVF.woff2',
  display: 'swap',
  variable: '--font-ufficio',
})

const ufficioDisplay = localFont({
  src: '../fonts/UfficioDisplayVF.woff2',
  display: 'swap',
  variable: '--font-ufficio-display',
})

export const metadata: Metadata = {
  title: {
    template: '%s - Docs',
    default: 'ShaderPad - Get creative with shaders.',
  },
  description:
    'ShaderPad is a lightweight, dependency-free library that reduces boilerplate when working with fragment shaders.',
  icons: {
    icon: [
      {
        url: '/shaderpad/icon-light.svg',
        type: 'image/svg+xml',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/shaderpad/icon-dark.svg',
        type: 'image/svg+xml',
        media: '(prefers-color-scheme: dark)',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={clsx(
        'h-full antialiased',
        ufficio.variable,
        ufficioDisplay.variable,
      )}
      suppressHydrationWarning
    >
      <body className="flex min-h-full bg-white dark:bg-slate-900">
        <Providers>
          <ThemeFavicon />
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  )
}
