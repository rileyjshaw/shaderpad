---
title: Uniforms
nextjs:
  metadata:
    title: Uniforms
    description: Complete reference for ShaderPad's built-in uniforms.
---

ShaderPad initializes the following built-in uniforms for every instance. Declare only the ones your GLSL actually uses; the rest will be ignored, so performance is unaffected.

## Built-in Uniforms

| Name | Type | Initial value | Update timing | Notes |
| --- | --- | --- | --- | --- |
| `u_time` | `float` | `0.0` | Updated by `play()` and `step()` before each rendered frame | Elapsed time in seconds from the current start time. `draw()` does not advance it. |
| `u_frame` | `int` | `0` | Updated by `play()` and `step()` before each rendered frame | Current frame index. `draw()` does not advance it. |
| `u_resolution` | `vec2` | current drawing buffer size | Initialized during setup and updated whenever the drawing buffer changes size | Values are in pixels. |
| `u_cursor` | `vec2` | `[0.5, 0.5]` | Updated on mouse or touch movement on `canvas` or `cursorTarget` | Normalized from `0.0` to `1.0` from left to right and bottom to top. |
| `u_click` | `vec3` | `[0.5, 0.5, 0.0]` | Updated on mouse or touch press and release when `cursorTarget` is available | `xy` is the normalized press position and `z` is `1.0` while pressed, otherwise `0.0`. |

## Typical GLSL Declarations

```glsl
uniform float u_time;
uniform int u_frame;
uniform vec2 u_resolution;
uniform vec2 u_cursor;
uniform vec3 u_click;
```

{% callout title="Note about u_resolution" type="warning" %}
If you use the [helpers plugin](/docs/plugins/helpers), it injects the `u_resolution` declaration for you. Do not declare `u_resolution` manually in that case.
{% /callout %}

