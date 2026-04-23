---
title: Web component
nextjs:
    metadata:
        title: Web component API
        description: Registration, properties, methods, markup rules, and events for shaderpad/web-component.
---

The `shaderpad/web-component` entry exports:

```ts
import {
  createShaderPadElement,
  ShaderPadElement,
} from 'shaderpad/web-component';
```

If you want the usage patterns first, start with the [Web component guide](/docs/components/web-component).

## Exports

| Export                   | Type     | Meaning                                                       |
| ------------------------ | -------- | ------------------------------------------------------------- |
| `ShaderPadElement`       | class    | Element class used for `<shader-pad>`.                        |
| `createShaderPadElement` | function | Creates the element you pass to `customElements.define(...)`. |

Register a tag with the browser:

```ts
customElements.define('shader-pad', createShaderPadElement());

customElements.define('shader-pad-face', createShaderPadElement({
  plugins: [face({ textureName: 'u_webcam' })],
  autopause: false,
}));
```

Pass plugins while registering a tag. You cannot set plugins later with `element.plugins`.

## Markup

### Required shader source

Put your fragment shader in a direct child script:

```html
<script type="x-shader/x-fragment">
	...
</script>
```

You can also load shader source from `src="..."`.

### Texture children

Add texture inputs inside the element with `data-texture="u_name"`:

- `HTMLImageElement`
- `HTMLVideoElement`
- `HTMLCanvasElement`
- another `<shader-pad>`

Nested `<shader-pad data-texture="u_name">` children are managed by the parent, which makes them useful for simple multipass shaders. The parent ignores the child’s autoplay/autopause values and renders the child before each parent frame.

Texture option attributes map onto `initializeTexture()`:

- `data-texture-history`
- `data-texture-preserve-y`
- `data-texture-internal-format`
- `data-texture-format`
- `data-texture-type`
- `data-texture-min-filter`
- `data-texture-mag-filter`
- `data-texture-wrap-s`
- `data-texture-wrap-t`

### Canvas

By default, the element creates and manages its own canvas. A direct child `<canvas>` without `data-texture` becomes the render canvas:

```html
<shader-pad>
	<canvas></canvas>
	<script type="x-shader/x-fragment">
		...
	</script>
</shader-pad>
```

Or bind an external canvas by id:

```html
<canvas id="preview"></canvas>
<shader-pad for="preview">
	<script type="x-shader/x-fragment">
		...
	</script>
</shader-pad>
```

The component handles autosizing when it owns the canvas. External canvases must be sized by your code.

## Properties

| Property       | Type                                                     | Default | Meaning                                                                                                                                                |
| -------------- | -------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `shader`       | `ShaderPad \| null`                                      | `null`  | Underlying ShaderPad instance after `load`.                                                                                                            |
| `canvas`       | `HTMLCanvasElement \| null`                              | `null`  | Active render canvas after `load`.                                                                                                                     |
| `options`      | `Omit<Options, 'canvas' \| 'plugins' \| 'cursorTarget'>` | `{}`    | Core constructor options other than canvas, plugins, and cursor target. Instance options override defaults registered with `createShaderPadElement()`. |
| `autosize`     | `boolean \| AutosizeOptions`                             | `true`  | Enables implicit `autosize()` when the component owns its canvas.                                                                                      |
| `cursorTarget` | `Window \| Element \| null`                              | `null`  | Overrides built-in pointer normalization target.                                                                                                       |
| `autoplay`     | `boolean`                                                | `true`  | Starts playback automatically after initialization.                                                                                                    |
| `autopause`    | `boolean`                                                | `true`  | Pauses autoplay when offscreen or document-hidden, then resumes when visible again.                                                                    |

## Attributes

| Attribute           | Meaning                                          |
| ------------------- | ------------------------------------------------ |
| `for="canvas-id"`   | Binds the component to an external canvas by id. |
| `autoplay="false"`  | Disables the default autoplay behavior.          |
| `autopause="false"` | Disables the default offscreen pausing behavior. |

Texture children use `data-texture="u_name"` to choose the shader uniform.

## Methods

| Method           | Behavior                                                  |
| ---------------- | --------------------------------------------------------- |
| `play()`         | Ensures the element is initialized, then starts playback. |
| `pause()`        | Pauses playback.                                          |
| `step(options?)` | Advances one frame manually.                              |
| `draw(options?)` | Draws without advancing time or frame.                    |
| `clear()`        | Clears the current output.                                |
| `resetFrame()`   | Resets frame counting and start time.                     |
| `reset()`        | Resets time, frame state, and history.                    |
| `destroy()`      | Destroys the underlying ShaderPad instance.               |

## Events

The element dispatches bubbling, composed `CustomEvent`s from the host.

### Component lifecycle

| Event              | Detail                                                   |
| ------------------ | -------------------------------------------------------- |
| `load`             | `{ shader, canvas }` when the component is ready.        |
| `error`            | `{ error }` when setup fails.                            |
| `visibilityChange` | `{ shader, canvas, isVisible }` when visibility changes. |

### Mutable `beforeStep`

`beforeStep` fires whenever the underlying ShaderPad emits `beforeStep`:

```ts
event.detail = {
  shader,
  canvas,
  time,
  frame,
  stepOptions,
};
```

For frames started through the element methods, set `event.detail.stepOptions` if you need to pass [step options](/docs/api/methods) into that frame.

### Other ShaderPad events

For ShaderPad and plugin events that are not listed above, wait for `load`, then use the underlying instance:

```js
scene.addEventListener('load', event => {
	const { shader } = event.detail;
	shader.on('autosize:resize', (width, height) => {
		console.log(width, height);
	});
});
```
