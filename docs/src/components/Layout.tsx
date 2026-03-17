'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

import { Hero } from '@/components/Hero'
import { Logo, Logomark } from '@/components/Logo'
import { MobileNavigation } from '@/components/MobileNavigation'
import { Navigation } from '@/components/Navigation'
import { Search } from '@/components/Search'
import { ThemeSelector } from '@/components/ThemeSelector'

function GitHubIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" {...props}>
      <path d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z" />
    </svg>
  )
}

function Header() {
  let [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setIsScrolled(window.scrollY > 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <header
      className={clsx(
        'sticky top-0 z-50 flex flex-none flex-wrap items-center justify-between bg-white px-4 py-5 shadow-md shadow-slate-900/5 transition duration-500 sm:px-6 lg:px-8 dark:shadow-none',
        isScrolled
          ? 'dark:bg-slate-900/95 dark:backdrop-blur-sm dark:[@supports(backdrop-filter:blur(0))]:bg-slate-900/75'
          : 'dark:bg-transparent',
      )}
    >
      <div className="mr-3 flex lg:hidden">
        <MobileNavigation />
      </div>
      <div className="@container/header relative flex grow basis-0 items-center">
        <Link href="/" aria-label="Home page">
          <Logo />
        </Link>
      </div>
      <div className="-my-5 mr-6 sm:mr-8 md:mr-0">
        <Search />
      </div>
      <div className="relative flex basis-0 justify-end gap-6 sm:gap-8 md:grow">
        <ThemeSelector className="relative z-10" />
        <Link
          href="https://github.com/rileyjshaw/shaderpad"
          className="group"
          aria-label="GitHub"
        >
          <GitHubIcon className="h-6 w-6 fill-slate-400 group-hover:fill-slate-500 dark:group-hover:fill-slate-300" />
        </Link>
      </div>
    </header>
  )
}

export function Layout({ children }: { children: React.ReactNode }) {
  let pathname = usePathname()
  let isHomePage = pathname === '/'
  let currentYear = new Date().getFullYear()

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />

      <main className="flex flex-1 flex-col">
        <nav aria-label="AI resources" className="sr-only">
          <Link href="/docs/getting-started/ai-agent-guide">
            ShaderPad AI agent guide
          </Link>
          <Link href="/llms.txt">ShaderPad llms.txt instructions</Link>
          <a href="https://github.com/rileyjshaw/shaderpad/tree/main/examples/src">
            ShaderPad examples on GitHub
          </a>
        </nav>
        {isHomePage && <Hero />}

        <div className="relative mx-auto w-full max-w-8xl flex-1 sm:px-2 lg:px-8 xl:px-12">
          <div className="hidden lg:absolute lg:inset-y-0 lg:left-8 lg:block lg:w-64 xl:left-12 xl:w-72">
            <div className="absolute inset-y-0 right-0 w-[50vw] bg-slate-50 dark:hidden" />
            <div className="absolute top-16 right-0 bottom-0 hidden h-12 w-px bg-linear-to-t from-slate-800 dark:block" />
            <div className="absolute top-28 right-0 bottom-0 hidden w-px bg-slate-800 dark:block" />
            <div className="sticky top-19 -ml-0.5 h-[calc(100vh-4.75rem)] w-64 overflow-x-hidden overflow-y-auto py-16 pr-8 pl-0.5 xl:w-72 xl:pr-16">
              <Navigation />
            </div>
          </div>

          <div className="flex w-full min-w-0 justify-center lg:pl-64 xl:pl-72">
            {children}
          </div>
        </div>
      </main>
      <footer className="relative z-10 border-t border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex w-full max-w-8xl justify-center">
          <p className="max-w-2xl text-balance text-center text-sm text-slate-600 dark:text-slate-400">
            Written by <a className="underline" href="https://rileyjshaw.com">Riley</a> at <a className="underline" href="https://misery.co">Misery &amp; Company</a>,
            {' '}
            2024-{currentYear}. MIT license.
          </p>
        </div>
      </footer>
    </div>
  )
}
