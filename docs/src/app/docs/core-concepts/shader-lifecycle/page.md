---
title: Shader lifecycle
nextjs:
  metadata:
    title: Shader lifecycle
    description: Understand construction, rendering, stepping, pausing, and cleanup.
---

ShaderPad has the following render lifecycle:

1. Construct a shader using `new ShaderPad()`
1. Initialize custom uniforms or textures using `initializeUniform()` and `initializeTexture()`
1. Render with `play()`, `step()`, or `draw()`
1. Clean up with `destroy()`

You can go over the details of each method in the [Methods](/docs/api/methods) API reference. Below is a quick overview, including when you may want to use each method.

## Constructor

```typescript
const shader = new ShaderPad(fragmentShaderSrc, { canvas })
```

## Rendering Methods

{% callout title="Quick Reference" %}
- Use `play()` for animation loops
- Use `step()` for manual time/frame advancement
- Use `draw()` when time, frame, and history should remain unchanged
{% /callout %}

### `play(onBeforeStep?)`

`play()` starts the animation loop. `u_time` and `u_frame` uniforms are updated automatically, and history is kept up to date.

```typescript
shader.play((time, frame) => {
  shader.updateUniforms({ u_speed: Math.sin(time) })
})
```

Use it when:

- You want to animate the shader over time
- You don’t need manual control over timing
- You’re rendering a single shader or a straightforward rendering pipeline

### `step(options?)`

`step()` advances exactly one frame, and renders without triggering the animation loop. `u_time` and `u_frame` uniforms are updated automatically, and history is kept up to date.

```typescript
shader.step({ skipHistoryWrite: true })
```

Use it when:

- You want deterministic manual control over the animation frame
- Another loop owns timing
- You are building a chained or offscreen pipeline

### `draw(options?)`

`draw()` renders without updating `u_time`, `u_frame`, or history.

```typescript
shader.draw({ skipClear: true })
```

Use it when:

- The current uniforms already represent the exact state you want
- The output should not count as a new animation step

## Pause, Reset, Destroy

- `pause()` stops the animation loop started by `play()`
- `resetFrame()` resets the clock and frame counter
- `reset()` resets the clock and frame counter, and also clears history buffers
- `destroy()` releases WebGL resources and event listeners

## Related

- [Built-in inputs](/docs/core-concepts/built-in-inputs)
- [History](/docs/core-concepts/history)
- [Chaining shaders](/docs/guides/chaining-shaders)
