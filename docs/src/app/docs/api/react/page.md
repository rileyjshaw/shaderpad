---
title: React
nextjs:
    metadata:
        title: React API
        description: Props, ref methods, and runtime behavior for shaderpad/react.
---

The `shaderpad/react` entry exports:

```tsx
import ShaderPad, { type ShaderPadProps } from 'shaderpad/react';
```

If you want the usage patterns first, start with [Components / React](/docs/components/react).

## Exports

| Export           | Type      | Meaning                                            |
| ---------------- | --------- | -------------------------------------------------- |
| default          | component | React wrapper that renders one managed `<canvas>`. |
| `ShaderPad`      | component | Alias for the default export.                      |
| `ShaderPadProps` | type      | Prop type for the component.                       |

## Props

### Required

| Prop     | Type     | Meaning                 |
| -------- | -------- | ----------------------- |
| `shader` | `string` | Fragment shader source. |

### Core Configuration

| Prop           | Type                                                     | Default                        | Meaning                                                                                |
| -------------- | -------------------------------------------------------- | ------------------------------ | -------------------------------------------------------------------------------------- |
| `plugins`      | `Plugin[]`                                               | `[]`                           | Additional plugins to install after wrapper-owned autosize.                            |
| `options`      | `Omit<Options, 'canvas' \| 'plugins' \| 'cursorTarget'>` | `{}`                           | Core constructor options other than wrapper-owned canvas, plugins, and cursor target.  |
| `autosize`     | `boolean \| AutosizeOptions`                             | `true`                         | Enables wrapper-owned `autosize()` or passes custom autosize options.                  |
| `cursorTarget` | `Window \| Element \| RefObject<Element \| null>`        | canvas element when applicable | Target for built-in pointer uniforms. Ref targets delay initialization until resolved. |

### Playback

| Prop        | Type      | Default | Meaning                                                                             |
| ----------- | --------- | ------- | ----------------------------------------------------------------------------------- |
| `autoplay`  | `boolean` | `true`  | Starts playback automatically after initialization.                                 |
| `autopause` | `boolean` | `true`  | Pauses autoplay when offscreen or document-hidden, then resumes when visible again. |

### Callbacks

| Prop           | Type                                           | Meaning                                                                                                                         |
| -------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `onInit`       | `(shader, canvas) => void`                     | Runs after setup, before autoplay starts.                                                                                       |
| `onBeforeStep` | `(shader, time, frame) => StepOptions \| void` | Runs whenever the underlying ShaderPad emits `beforeStep`. Returned step options apply to frames started through the component. |
| `onError`      | `(error) => void`                              | Receives constructor/setup errors instead of letting them surface as uncaught runtime errors.                                   |

### Texture Children

`ShaderPadProps` allows children for declarative texture sources:

```tsx
<ShaderPad shader={shader}>
  <img data-texture="u_image" src="/image.png" alt="" />
  <video data-texture="u_video" src="/video.mp4" muted playsInline />
  <canvas data-texture="u_canvas" width={512} height={512} />
  <ShaderPad shader={passShader} data-texture="u_pass" />
</ShaderPad>
```

Texture option props map onto `initializeTexture()`:

| Prop                           | Meaning                        |
| ------------------------------ | ------------------------------ |
| `data-texture-history`         | Texture history depth.         |
| `data-texture-preserve-y`      | Preserves or flips source Y.   |
| `data-texture-internal-format` | WebGL internal texture format. |
| `data-texture-format`          | WebGL texture format.          |
| `data-texture-type`            | WebGL texture type.            |
| `data-texture-min-filter`      | WebGL minification filter.     |
| `data-texture-mag-filter`      | WebGL magnification filter.    |
| `data-texture-wrap-s`          | WebGL horizontal wrap mode.    |
| `data-texture-wrap-t`          | WebGL vertical wrap mode.      |

### Canvas Props

`ShaderPadProps` extends normal React canvas props, like `className` and `aria-label`, except the DOM `onError`.

Default inline style values:

- `display: 'block'`
- `width: '100%'`
- `height: '100%'`

Your `style` prop is merged on top of those defaults.

## Events

To add events listeners, subscribe through the underlying ShaderPad instance:

```tsx
const ref = useRef<React.ElementRef<typeof ShaderPad>>(null);

useEffect(() => {
  const shader = ref.current?.shader;
  if (!shader) return;

  const handleResize = (width: number, height: number) => {};
  shader.on('autosize:resize', handleResize);
  return () => shader.off('autosize:resize', handleResize);
}, [ready]);
```

Core event signatures are documented on the main [Events](/docs/api/events) page.

## Ref API

The component uses `forwardRef`. The public way to type the ref is:

```tsx
const ref = useRef<React.ElementRef<typeof ShaderPad>>(null);
```

The ref exposes the managed `canvas`, the underlying core `shader`, and the same playback methods documented on the [ShaderPad API page](/docs/api/shaderpad).

## Runtime Behavior

The wrapper keeps callback props and playback props live without recreating the instance. By default, it starts playing after setup and pauses autoplay while the canvas is not visible.

Behavior by prop combination:

| `autoplay` | `autopause` | Behavior                                                     |
| ---------- | ----------- | ------------------------------------------------------------ |
| `true`     | `true`      | Play when visible, pause autoplay when not visible.          |
| `true`     | `false`     | Start after init and keep running until user code pauses it. |
| `false`    | either      | Never auto-start.                                            |

`autopause` only affects automatic playback started by the component. If you call `play()` yourself, pausing and resuming that loop is up to your code.

## Rules

- Use this component only from client components in frameworks such as Next.js.
- Do not pass your own `autosize()` plugin in `plugins` unless you also set `autosize={false}`.
- Use `onInit`, `onBeforeStep`, or the ref for dynamic uniform and texture work.
