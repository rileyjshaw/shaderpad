---
title: Built-in inputs
nextjs:
  metadata:
    title: Built-in inputs
    description: Learn the built-in varying and uniforms that ShaderPad updates for you.
---

ShaderPad’s first mental model is simple: your fragment shader gets a fullscreen varying plus a few built-in uniforms that cover the most common interactive cases.

## `v_uv`

```glsl
in vec2 v_uv;
```

- Range: `0.0` to `1.0`
- Origin: bottom-left in shader space
- Use it for normalized addressing and fullscreen effects
## Built-in Uniforms

| Name | Type | Meaning |
| --- | --- | --- |
| `u_time` | `float` | elapsed time in seconds |
| `u_frame` | `int` | frame counter |
| `u_resolution` | `vec2` | drawing buffer size in pixels |
| `u_cursor` | `vec2` | normalized cursor position |
| `u_click` | `vec3` | normalized click position plus pressed state |

## Cursor And Click Coordinates

`u_cursor` and `u_click` are normalized over the active `cursorTarget`.

- `x`: left to right
- `y`: bottom to top
- `u_click.z`: `1.0` while pressed, `0.0` otherwise

If you do not set `cursorTarget`, ShaderPad uses the HTML canvas when possible.

## Example

```glsl
in vec2 v_uv;
uniform float u_time;
uniform vec2 u_cursor;

out vec4 outColor;

void main() {
  float d = distance(v_uv, u_cursor);
  float pulse = 0.03 + 0.01 * sin(u_time * 6.0);
  float ring = smoothstep(pulse, pulse - 0.01, d);
  outColor = vec4(vec3(ring), 1.0);
}
```

## One Important Plugin Note

If you use the `helpers` plugin, it injects the `u_resolution` declaration for you. Without `helpers`, declare `u_resolution` yourself when you use it.

## Related

- [Quickstart](/docs/getting-started/quickstart)
- [Canvas and input](/docs/core-concepts/canvas-and-input)
- [helpers plugin](/docs/plugins/helpers)
