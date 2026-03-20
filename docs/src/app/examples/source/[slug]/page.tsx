import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { notFound } from 'next/navigation'

import { DocsHeader } from '@/components/DocsHeader'
import { Fence } from '@/components/Fence'
import { examples, getExampleBySlug } from '@/examples/registry'
import { withBasePath } from '@/lib/site'

export function generateStaticParams() {
  return examples.map((example) => ({
    slug: example.slug,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const example = getExampleBySlug(slug)

  if (!example) {
    return {}
  }

  return {
    title: `${example.title}`,
    description: example.description,
  }
}

async function readExampleSource(slug: string) {
  const sourcePath = join(process.cwd(), 'src', 'examples', 'demos', `${slug}.ts`)
  return readFile(sourcePath, 'utf8')
}

export default async function ExampleSourcePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const example = getExampleBySlug(slug)

  if (!example) {
    notFound()
  }

  const source = await readExampleSource(slug)

  return (
    <div className="relative w-full">
      <div className="min-w-0 flex-auto px-4 py-16 lg:pl-8 xl:pl-16">
        <div className="mx-auto max-w-4xl">
          <DocsHeader title={`${example.title}`} />
          <div className="mb-8 flex flex-wrap items-center gap-4">
            <p className="max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400">
              {example.description}
            </p>
            <a
              href={withBasePath(`/examples/${example.slug}`)}
              className="inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-sky-700 transition hover:border-sky-300 hover:bg-sky-50 dark:border-slate-700 dark:text-sky-300 dark:hover:border-sky-700 dark:hover:bg-slate-800"
            >
              View live demo
            </a>
            <a
              href={withBasePath(example.sourcePath)}
              className="inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-sky-700 transition hover:border-sky-300 hover:bg-sky-50 dark:border-slate-700 dark:text-sky-300 dark:hover:border-sky-700 dark:hover:bg-slate-800"
            >
              Raw .ts
            </a>
          </div>

          <Fence language="tsx">{source}</Fence>
        </div>
      </div>
    </div>
  )
}
