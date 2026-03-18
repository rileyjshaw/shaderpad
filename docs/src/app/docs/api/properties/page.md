---
title: Properties
nextjs:
  metadata:
    title: Properties
    description: Public instance and class properties exposed by ShaderPad.
---

`ShaderPad` intentionally exposes a small public property surface. Most interaction happens through [methods](/docs/api/methods).

## Instance Properties

### `shader.canvas`

```typescript
canvas: HTMLCanvasElement | OffscreenCanvas
```

The canvas backing this `ShaderPad` instance.

- If you pass an `HTMLCanvasElement` or `OffscreenCanvas` to the constructor, `shader.canvas` is that same object.
- If you pass `{ width, height }`, `null`, or omit `canvas`, ShaderPad creates a headless `OffscreenCanvas` and exposes it here.

Use `canvas` when you need the underlying canvas directly, such as checking its size or reusing it for another `ShaderPad` instance.

```javascript
const shader = new ShaderPad(fragmentShaderSrc, {
  canvas: createFullscreenCanvas(),
})
console.log(shader.canvas.width, shader.canvas.height)
```

{% callout title="Chaining ShaderPads" %}
If you want to sample one `ShaderPad` from another, pass the `ShaderPad` instance itself to `initializeTexture()` instead of using `shader.canvas`.
{% /callout %}
