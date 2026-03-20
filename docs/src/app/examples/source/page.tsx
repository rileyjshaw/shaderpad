import { DocsHeader } from '@/components/DocsHeader'
import { examples } from '@/examples/registry'
import { withBasePath } from '@/lib/site'

export const metadata = {
  title: 'Example Source',
  description: 'Raw source mirrors for the public ShaderPad examples.',
}

export default function ExampleSourceIndexPage() {
  return (
    <div className="relative w-full">
      <div className="min-w-0 flex-auto px-4 py-16 lg:pl-8 xl:pl-16">
        <div className="mx-auto max-w-3xl">
          <DocsHeader title="Example Source" />
          <p className="max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400">
            These are raw source mirrors for the interactive examples. Use them
            when you want to read the example entry file directly.
          </p>

          <div className="mt-10 space-y-3">
            {examples.map((example) => (
              <a
                key={example.slug}
                href={withBasePath(example.sourcePagePath)}
                className="block rounded-2xl border border-slate-200 bg-white px-5 py-4 transition hover:border-sky-300 hover:bg-sky-50/70 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-sky-700 dark:hover:bg-slate-800"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display text-xl tracking-tight text-slate-900 dark:text-white">
                      {example.title}
                    </h2>
                    {example.description && (
                      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                        {example.description}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-sm font-medium text-sky-600 dark:text-sky-400">
                    View
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
