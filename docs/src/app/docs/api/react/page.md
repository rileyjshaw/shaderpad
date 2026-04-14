---
title: React
nextjs:
    metadata:
        title: React API
        description: Props, ref methods, and runtime behavior for `shaderpad/react`.
---

The `shaderpad/react` entry exports:

```tsx
import { ShaderPad, type ShaderPadProps } from 'shaderpad/react';
```

If you want the common usage patterns first, start with the [React guide](/docs/guides/react).

## Exports

| Export           | Type      | Meaning                                            |
| ---------------- | --------- | -------------------------------------------------- |
| `ShaderPad`      | component | React wrapper that renders one managed `<canvas>`. |
| `ShaderPadProps` | type      | Prop type for the component.                       |

## Props

### Required

| Prop     | Type     | Meaning                                                              |
| -------- | -------- | -------------------------------------------------------------------- |
| `shader` | `string` | Fragment shader source passed into the core `ShaderPad` constructor. |

### Core Configuration

| Prop           | Type                                                     | Default                        | Meaning                                                                                |
| -------------- | -------------------------------------------------------- | ------------------------------ | -------------------------------------------------------------------------------------- |
| `plugins`      | `Plugin[]`                                               | `[]`                           | Additional plugins to install after wrapper-owned autosize.                            |
| `options`      | `Omit<Options, 'canvas' \| 'plugins' \| 'cursorTarget'>` | `{}`                           | Core constructor options other than wrapper-owned canvas, plugins, and cursor target.  |
| `autosize`     | `boolean \| AutosizeOptions`                             | `true`                         | Enables wrapper-owned `autosize()` or passes custom autosize options.                  |
| `cursorTarget` | `Window \| Element \| RefObject<Element \| null>`        | canvas element when applicable | Target for built-in pointer uniforms. Ref targets delay initialization until resolved. |

### Playback

| Prop                 | Type      | Default | Meaning                                                                    |
| -------------------- | --------- | ------- | -------------------------------------------------------------------------- |
| `autoPlay`           | `boolean` | `true`  | Starts playback automatically after initialization.                        |
| `pauseWhenOffscreen` | `boolean` | `true`  | Pauses when offscreen or document-hidden, then resumes when visible again. |

### Callbacks

| Prop               | Type                                           | Meaning                                                                                      |
| ------------------ | ---------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `onInit`           | `(shader, canvas) => void`                     | Runs after the instance is created and subscriptions are installed, before auto-play starts. |
| `onBeforeStep`     | `(shader, time, frame) => StepOptions \| void` | Runs before each managed `play()` frame and can return step options.                         |
| `onError`          | `(error) => void`                              | Receives initialization errors instead of throwing them through React.                       |
| `onOnscreenChange` | `(isOnscreen) => void`                         | Runs when the effective onscreen state changes.                                              |
| `events`           | `Record<string, (...args: any[]) => void>`     | Subscribes to core ShaderPad events and namespaced plugin events.                            |

### Canvas Props

`ShaderPadProps` extends normal React canvas props except `children` and the DOM `onError`.

- `className`
- `style`
- `id`
- `role`
- `tabIndex`
- `aria-label`
- other standard canvas DOM props

Default inline style values:

- `display: 'block'`
- `width: '100%'`
- `height: '100%'`

Your `style` prop is merged on top of those defaults.

## Events

The `events` prop subscribes to:

- core ShaderPad events such as `updateUniforms`, `beforeStep`, and `updateResolution`
- namespaced plugin events such as `autosize:resize`

Core event signatures are documented on the main [Events](/docs/api/events) page.

## Ref API

The component uses `forwardRef`. The public way to type the ref is:

```tsx
const ref = useRef<React.ElementRef<typeof ShaderPad>>(null);
```

The ref exposes:

| Member           | Type / Behavior                                           |
| ---------------- | --------------------------------------------------------- |
| `shader`         | Underlying core `ShaderPad` instance or `null`.           |
| `canvas`         | Managed `HTMLCanvasElement` or `null`.                    |
| `play()`         | Starts playback using the latest `onBeforeStep` callback. |
| `pause()`        | Pauses playback.                                          |
| `step(options?)` | Advances one frame manually.                              |
| `draw(options?)` | Draws without advancing time or frame.                    |
| `clear()`        | Clears the current output.                                |
| `resetFrame()`   | Resets frame counting.                                    |
| `reset()`        | Resets time, frame state, and history.                    |
| `destroy()`      | Destroys the underlying instance.                         |

## Runtime Behavior

The wrapper keeps callback props and event handlers live without recreating the instance.

When `pauseWhenOffscreen` is enabled, onscreen state is computed from:

- `IntersectionObserver`
- `document.visibilityState`
- `canvas.isConnected`
- `checkVisibility()` when available, with a layout/style fallback

Behavior by prop combination:

| `autoPlay` | `pauseWhenOffscreen` | Behavior                                               |
| ---------- | -------------------- | ------------------------------------------------------ |
| `true`     | `true`               | Play when visible, pause when not visible.             |
| `true`     | `false`              | Start once after init and keep running.                |
| `false`    | either               | Never auto-start, but still report `onOnscreenChange`. |

## Rules

- Use this component only from client components in frameworks such as Next.js.
- Do not pass your own `autosize()` plugin in `plugins` unless you also set `autosize={false}`.
- The wrapper is intentionally thin. Declarative uniform and texture props are not part of this API; use `onInit`, `onBeforeStep`, events, or the ref for that work.
