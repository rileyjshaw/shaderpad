---
title: Web component
nextjs:
    metadata:
        title: Web component
        description: Use ShaderPad declaratively through the <shader-pad> custom element.
---

Use `shaderpad/web-component` when you want to write ShaderPad directly in HTML. Register `<shader-pad>` once in JavaScript, then put your fragment shader and texture elements inside it. {% .lead %}

Import `shaderpad/web-component.css` once when raw `<shader-pad>` markup can appear before registration runs, such as SSR pages or static HTML. The JavaScript entry also applies the same defaults after upgrade, so client-only markup still works without a CSS import.

```ts
import 'shaderpad/web-component.css';
import { createShaderPadElement } from 'shaderpad/web-component';

customElements.define('shader-pad', createShaderPadElement());
```

If you want the exact API surface, read the [Web component API page](/docs/api/web-component).

## Example

```html
<shader-pad class="hero-shader">
	<script type="x-shader/x-fragment">
		#version 300 es
		precision highp float;

		in vec2 v_uv;
		uniform float u_time;
		out vec4 outColor;

		void main() {
		  outColor = vec4(v_uv, 0.5 + 0.5 * sin(u_time), 1.0);
		}
	</script>
</shader-pad>
```

{% web-component-preview /%}

## Autoplay / autopause

By default, `<shader-pad>` starts playing after it loads and pauses while offscreen or hidden. If you want to disable the default autoplay or offscreen pausing, set the attributes explicitly:

```html
<shader-pad autoplay="false" autopause="false">
	<script type="x-shader/x-fragment">
		...
	</script>
</shader-pad>
```

`autopause` only applies to autoplay. If `autoplay="false"` and your code later calls `play()`, that playback is yours to pause or resume.

## Child texture sources

Put texture inputs inside `<shader-pad>` with a `data-texture` attribute whose value matches the shader uniform name.

```html
<shader-pad id="scene">
	<script type="x-shader/x-fragment">
		...
	</script>
	<video data-texture="u_webcam" playsinline muted></video>
	<img data-texture="u_frame" src="/frame.png" />
</shader-pad>
```

Supported texture elements:

- `<img data-texture="u_name">`
- `<video data-texture="u_name">`
- `<canvas data-texture="u_name">`
- `<shader-pad data-texture="u_name">`

For live sources such as video, canvas, and nested `<shader-pad>`, the component refreshes the texture before each rendered frame. Nested `<shader-pad>`s are useful for simple multipass shaders.

## Plugins and custom tags

To use plugins, pass them when you register the custom element:

```ts
import face from 'shaderpad/plugins/face';
import { createShaderPadElement } from 'shaderpad/web-component';

customElements.define('shader-pad-face', createShaderPadElement({
  plugins: [face({ textureName: 'u_webcam' })],
}));
```

## Canvas ownership

By default, `<shader-pad>` creates its own canvas. If you add a direct child `<canvas>` without `data-texture`, it becomes the render canvas:

```html
<shader-pad>
	<canvas></canvas>
	<script type="x-shader/x-fragment">
		...
	</script>
</shader-pad>
```

You can also bind an external canvas with `for`:

```html
<canvas id="external-canvas"></canvas>
<shader-pad for="external-canvas">
	<script type="x-shader/x-fragment">
		...
	</script>
</shader-pad>
```

When the component owns its canvas, it handles autosizing and fills its parent by default. If you bind an external canvas with `for`, size that canvas from your own code.

## Events

Listen to component events with normal DOM APIs. Use `load` to access the underlying ShaderPad instance.

```js
const scene = document.querySelector('shader-pad');

scene.addEventListener('load', event => {
	const { shader, canvas } = event.detail;
	console.log('ready', shader, canvas);

	shader.on('autosize:resize', (width, height) => {
		console.log('autosize', width, height);
	});
});

scene.addEventListener('beforeStep', event => {
	event.detail.stepOptions = { skipHistory: false };
});
```

The component emits the following events:

- `load`
- `error`
- `beforeStep`
- `visibilityChange`

For the remaining [ShaderPad events](/docs/api/events), wait for `load`, then use `event.detail.shader.on(...)`.

---

For more detailed coverage, read the [Web component API page](/docs/api/web-component).
