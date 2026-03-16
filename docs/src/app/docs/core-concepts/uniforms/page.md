---
title: Uniforms
nextjs:
  metadata:
    title: Uniforms
    description: Initialize and update custom uniforms, including uniform arrays.
---

Uniforms are variables you can pass from JavaScript to your GLSL code.

## Initialize A Uniform

Uniforms are initialized one at a time with `initializeUniform()`.

```javascript
shader.initializeUniform('u_speed', 'float', 1.5) // float
shader.initializeUniform('u_color', 'float', [1, 0.5, 0]) // vec3
```

Parameters:

- `name`: `string`
- `type`: `'float' | 'int' | 'uint'`
- `value`: `number | number[] | (number | number[])[]`
- `options?`: `{ arrayLength?: number }`

## Update Uniforms

Updates are batched with key-value pairs:

```javascript
shader.updateUniforms({
  u_speed: 2.0,
  u_color: [1.0, 0.2, 0.1],
})
```

## Uniform Arrays

By default, array values represent vectors. You can declare uniform arrays by passing `arrayLength` to `initializeUniform()`. For example, to initialize a `float[24]` array:

```javascript
shader.initializeUniform('u_heights', 'float', [
  // 24 values...
], { arrayLength: 24 }) // float[24]
```

You can initialize an array of vectors like so:

```javascript
shader.initializeUniform(
  'u_points',
  'float',
  [
    [0.2, 0.3],
    [0.7, 0.8],
  ],
  { arrayLength: 2 },
)
```

Partial updates are supported with `startIndex`:

```javascript
shader.updateUniforms(
  {
    u_points: [[0.4, 0.5]],
  },
  { startIndex: 1 },
)
```

## Related

- [Built-in inputs](/docs/core-concepts/built-in-inputs)
- [API: methods](/docs/api/methods)
