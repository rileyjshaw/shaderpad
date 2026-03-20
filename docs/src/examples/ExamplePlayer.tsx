'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'

import { Logomark } from '@/components/Logo'
import { getExampleDetails } from '@/examples/details'
import { createExampleContext } from '@/examples/runtime'
import { getExampleBySlug } from '@/examples/registry'
import { withBasePath } from '@/lib/site'

import type { ExampleCleanup, ExampleModule } from '@/examples/runtime'

export function ExamplePlayer({
  slug,
  title,
  shortDescription,
  sourcePagePath,
}: {
  slug: string
  title: string
  shortDescription?: string
  sourcePagePath: string
}) {
  const mountRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const details = getExampleDetails(slug)
  const creditContent = details?.credit ?? null
  const descriptionContent =
    details?.fullDescription ??
    (shortDescription ? <p>{shortDescription}</p> : null)
  const [error, setError] = useState<string | null>(null)
  const [showDescription, setShowDescription] = useState(
    Boolean(descriptionContent),
  )

  const sourceHref = useMemo(
    () => withBasePath(sourcePagePath),
    [sourcePagePath],
  )

  useEffect(() => {
    const example = getExampleBySlug(slug)
    const mount = mountRef.current
    const overlay = overlayRef.current

    if (!example || !mount || !overlay) {
      return
    }

    const exampleMount = mount
    const exampleOverlay = overlay
    const loadExample = example.load

    let disposed = false
    let demoModule: ExampleModule | null = null
    let demoCleanup: ExampleCleanup | null = null

    function cleanupDemo() {
      if (demoCleanup) {
        demoCleanup()
        demoCleanup = null
      } else {
        demoModule?.destroy?.()
      }
      demoModule = null
    }

    async function run() {
      try {
        const loadedModule = await loadExample()
        if (disposed) {
          loadedModule.destroy?.()
          return
        }

        demoModule = loadedModule
        setError(null)
        const cleanup = await loadedModule.init(
          createExampleContext(exampleMount, exampleOverlay),
        )
        if (typeof cleanup === 'function') {
          demoCleanup = cleanup
        }

        if (disposed) {
          cleanupDemo()
        }
      } catch (err) {
        console.error('Failed to initialize example:', err)
        setError(err instanceof Error ? err.message : String(err))
        cleanupDemo()
      }
    }

    run()

    return () => {
      disposed = true
      cleanupDemo()
      exampleMount.replaceChildren()
      exampleOverlay.replaceChildren()
    }
  }, [slug])

  useEffect(() => {
    setShowDescription(Boolean(descriptionContent))
  }, [slug, descriptionContent])

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <div ref={mountRef} className="fixed inset-0" />
      <div ref={overlayRef} className="pointer-events-none fixed inset-0 z-20" />

      <div className="pointer-events-none fixed inset-0 z-30 flex flex-col justify-between items-start p-4 sm:p-6">
        <div className="inline-flex items-start gap-4 border border-white/15 rounded-r-full bg-black/60 pr-6 pl-6 -ml-6 py-4 shadow-2xl backdrop-blur">
          <Link
            href="/examples"
            aria-label="Examples"
            className="pointer-events-auto transition hover:text-white/85"
          >
            <div className="flex gap-3 text-white">
              <Logomark className="hidden h-9 w-auto fill-white/90 lg:block" />
              <span className="inline-block -mb-1 font-display text-3xl font-black">
                ShaderPad
              </span>
              <span className="hidden align-baseline text-sm text-white/70 lg:block">
                v1β
              </span>
            </div>
          </Link>
        </div>

        <div className="max-w-xl space-y-3">
          <div className="pointer-events-auto relative inline-flex max-w-full flex-col rounded-3xl border border-white/15 bg-black/60 px-5 py-4 shadow-2xl backdrop-blur">
            {descriptionContent && showDescription && (
              <button
                type="button"
                aria-label="Hide notes"
                className="absolute top-4 right-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-lg leading-none text-white transition hover:bg-white/10"
                onClick={() => setShowDescription(false)}
              >
                ×
              </button>
            )}

            <div className="pr-12">
              <div className="flex items-center gap-3">
                <p className="font-display text-2xl tracking-tight text-white sm:text-3xl">
                  {title}
                </p>
                {descriptionContent && !showDescription && (
                  <button
                    type="button"
                    aria-label="Show notes"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-sm font-semibold text-white transition hover:bg-white/10"
                    onClick={() => setShowDescription(true)}
                  >
                    i
                  </button>
                )}
              </div>

              {creditContent && (
                <p className="mt-2 text-sm font-medium leading-6 text-white/88 [&_a]:text-amber-300 [&_a]:underline [&_a]:decoration-amber-300/60 [&_a]:underline-offset-4 [&_a]:transition [&_a:hover]:text-white [&_a:hover]:decoration-amber-200">
                  {creditContent}
                </p>
              )}
            </div>

            {descriptionContent && showDescription && (
              <div className="mt-2 space-y-3 text-sm leading-6 text-white/78 sm:text-base [&_a]:text-sky-300 [&_a]:underline [&_a]:decoration-sky-400/60 [&_a]:underline-offset-4 [&_a]:transition [&_a:hover]:text-white [&_a:hover]:decoration-sky-200 [&_code]:rounded [&_code]:bg-white/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.95em] [&_code]:text-white">
                {descriptionContent}
              </div>
            )}

            {descriptionContent && showDescription && (
              <a
                href={sourceHref}
                className="mt-4 inline-flex w-fit rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
              >
                View source
              </a>
            )}
          </div>

          {error && (
            <div className="pointer-events-auto max-w-xl rounded-3xl border border-red-400/30 bg-red-950/80 px-5 py-4 text-sm text-red-100">
              Failed to load example: {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
