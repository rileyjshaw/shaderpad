---
title: Methods
nextjs:
    metadata:
        title: Methods
        description: Public methods on ShaderPad instances.
---

## Core Render Methods

- `play(onBeforeStep?)`
- `step(options?)`
- `draw(options?)`
- `pause()`
- `resetFrame()`
- `reset()`
- `destroy()`

## Uniform Methods

- `initializeUniform(name, type, value, options?)`
- `updateUniforms(updates, options?)`

## Texture Methods

- `initializeTexture(name, source, options?)`
- `updateTextures(updates, options?)`

## Event Methods

- `on(name, callback)`
- `off(name, callback)`

## Method Details

### `play(onBeforeStep?)`

```typescript
play(onBeforeStep?: (time: number, frame: number) => StepOptions | void): void
```

`play()` starts the animation loop and updates `u_time`, `u_frame`, and output history on each frame.

### `play()` Parameters

| Parameter      | Type                                                   | Default     | Notes                                                                                                                                                                                                                                       |
| -------------- | ------------------------------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `onBeforeStep` | `(time: number, frame: number) => StepOptions \| void` | `undefined` | Called on every frame before the animation step runs. `time` is measured in seconds from the current start time, and `frame` is the current frame index before it is incremented. Returning a `StepOptions` object affects that frame only. |

```javascript
shader.play((time, frame) => {
	shader.updateUniforms({ u_speed: Math.sin(time) });
	if (frame < 5) {
		return { skipHistoryWrite: true };
	}
});
```

This overlaps with the `beforeStep` event, but they are not identical:

- Use the `play()` callback for simplicity if your app only calls `play()` once.
- Use the `play()` callback if the logic only belongs to this specific `play()` call.
- Use `beforeStep` when you want a reusable listener that fires for any `play()` or `step()` calls.
- Only the `play()` callback can return `StepOptions` to affect the current frame.

### `step(options?)`

```typescript
step(options?: StepOptions): void
```

`step()` advances exactly one frame, updates `u_time` and `u_frame`, renders, and writes to history unless disabled.

### `draw(options?)`

```typescript
draw(options?: StepOptions): void
```

`draw()` renders immediately without advancing time, frame, or history.

### Render Step Options Reference

`step(options?)`, `draw(options?)`, and the return value from `play(onBeforeStep)` all accept the same object shape:

| Option             | Type      | Default | Applies to                                   | Notes                                                                                                                                                              |
| ------------------ | --------- | ------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `skipClear`        | `boolean` | `false` | `step()`, `draw()`, `play()` callback return | Draws to the render target without clearing it first. Useful for accumulation, trails, and some multi-pass patterns.                                               |
| `skipHistoryWrite` | `boolean` | `false` | `step()`, `draw()`, `play()` callback return | Prevents output-history writes for that frame. `draw()` accepts the field for API consistency, but it has no effect there because `draw()` never advances history. |

### `initializeUniform(name, type, value, options?)`

```typescript
initializeUniform(
  name: string,
  type: 'float' | 'int' | 'uint',
  value: number | number[] | (number | number[])[],
  options?: { arrayLength?: number, allowMissing?: boolean },
): void
```

Registers a shader uniform and seeds it with an initial value.

### `initializeUniform()` Options

| Option         | Type      | Default     | Notes                                                                                                                                                 |
| -------------- | --------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `arrayLength`  | `number`  | `undefined` | Declares that the uniform is a fixed-length array. When set, initialization must include exactly that many elements.                                  |
| `allowMissing` | `boolean` | `false`     | When `true`, ShaderPad silently skips initialization if the uniform is not present in the compiled shader. Useful for optional internals and plugins. |

### `updateUniforms(updates, options?)`

```typescript
updateUniforms(
  updates: Record<string, number | number[] | (number | number[])[]>,
  options?: { startIndex?: number, allowMissing?: boolean },
): void
```

Updates one or more initialized uniforms.

### `updateUniforms()` Options

| Option         | Type      | Default     | Notes                                                                                                               |
| -------------- | --------- | ----------- | ------------------------------------------------------------------------------------------------------------------- |
| `startIndex`   | `number`  | `undefined` | Only relevant for uniform arrays. Starts the write at `startIndex` instead of `0`.                                  |
| `allowMissing` | `boolean` | `false`     | When `true`, ShaderPad silently skips updates for uniforms that are intentionally optional and not present in GLSL. |

### `initializeTexture(name, source, options?)`

```typescript
initializeTexture(
  name: string,
  source: TextureSource,
  options?: TextureOptions & { history?: number },
): void
```

`initializeTexture()` registers a named texture input. If `source` is another `ShaderPad` instance and you omit texture options, the destination texture inherits the source instance's internal render-texture settings.

### Texture Options Reference

| Option           | Type                     | Default                                                    | Notes                                                                                                                                                                             |
| ---------------- | ------------------------ | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `history`        | `number`                 | `0`                                                        | Number of previous frames to store for this texture. Publicly, `history: N` gives you access to the current frame plus `N` previous frames.                                       |
| `preserveY`      | `boolean`                | Omitted, which behaves like `false` for DOM-backed sources | DOM-backed sources are vertically flipped by default to match WebGL coordinates. Set `preserveY: true` to keep their original orientation. Typed-array sources are never flipped. |
| `internalFormat` | `GLInternalFormatString` | Derived from `type`, otherwise `'RGBA8'`                   | GPU storage format for this texture.                                                                                                                                              |
| `format`         | `GLFormatString`         | Derived from `internalFormat`                              | Defaults to `'RGBA'` for normalized and float color formats, and `'RGBA_INTEGER'` for integer color formats.                                                                      |
| `type`           | `GLTypeString`           | Derived from `internalFormat`, otherwise `'UNSIGNED_BYTE'` | Source texel data type.                                                                                                                                                           |
| `minFilter`      | `GLFilterString`         | `'LINEAR'`                                                 | Minification filter.                                                                                                                                                              |
| `magFilter`      | `GLFilterString`         | `'LINEAR'`                                                 | Magnification filter.                                                                                                                                                             |
| `wrapS`          | `GLWrapString`           | `'CLAMP_TO_EDGE'`                                          | Horizontal wrap mode.                                                                                                                                                             |
| `wrapT`          | `GLWrapString`           | `'CLAMP_TO_EDGE'`                                          | Vertical wrap mode.                                                                                                                                                               |

### `updateTextures(updates, options?)`

```typescript
updateTextures(
  updates: Record<string, UpdateTextureSource>,
  options?: { skipHistoryWrite?: boolean },
): void
```

Updates one or more previously initialized textures.

### `updateTextures()` Options

| Option             | Type      | Default | Notes                                                                                                                                                    |
| ------------------ | --------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `skipHistoryWrite` | `boolean` | `false` | Only relevant for textures that were initialized with history. When `true`, the texture data is updated without advancing that texture's history layers. |
