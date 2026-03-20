import { withBasePath } from '@/lib/site'

export type ExampleContext = {
  mount: HTMLElement
  overlay: HTMLElement
  assetPath: (pathname: string) => string
}

export type ExampleCleanup = () => void

export type ExampleModule = {
  init: (
    context: ExampleContext,
  ) => Promise<void | ExampleCleanup> | void | ExampleCleanup
  destroy?: () => void
}

export function createExampleContext(
  mount: HTMLElement,
  overlay: HTMLElement,
): ExampleContext {
  return {
    mount,
    overlay,
    assetPath: withBasePath,
  }
}

export function enableOverlayInteraction<T extends HTMLElement>(element: T): T {
  element.style.pointerEvents = 'auto'
  return element
}
