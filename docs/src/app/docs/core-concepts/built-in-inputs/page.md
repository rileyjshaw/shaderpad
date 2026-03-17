---
title: Built-in inputs
nextjs:
  metadata:
    title: Built-in inputs
    description: Learn the built-in varying and uniforms that ShaderPad updates for you.
---

ShaderPad programs come with a few built-in inputs for convenience. To use them, add the corresponding declarations at the top of your fragment shader. If your program does not use a particular uniform, ShaderPad will automatically free up the resources used to manage it.

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
| `u_cursor` | `vec2` | normalized cursor position from bottom-left (0.0) to top-right (1.0) |
| `u_click` | `vec3` | normalized position of last click plus boolean pressed state |

More complete documentation is available in the [Uniforms API reference](/docs/api/uniforms).

{% callout title="Note about u_resolution" type="warning" %}
If you use the [helpers plugin](/docs/plugins/helpers), it injects the `u_resolution` declaration for you. Do not declare `u_resolution` manually in that case.
{% /callout %}

## Example

This example uses `u_time`, `u_cursor`, `u_click`, and `u_resolution` together with one custom uniform:

```javascript
import ShaderPad from 'shaderpad'

const fragmentShaderSrc = `#version 300 es
precision highp float;

// Built-in variables.
in vec2 v_uv;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_cursor;
uniform vec3 u_click;
out vec4 outColor;

// Custom uniform.
uniform vec3 u_cursorColor;

void main() {
  vec2 uv = v_uv * u_resolution;
  vec2 dotGrid = mod(uv, 50.0) - 25.0;
  float dotDist = length(dotGrid);
  float dot = step(dotDist, 5.0);

  vec2 clickPos = u_click.xy;
  float isClicked = u_click.z;

  float cursorDist = distance(uv, u_cursor * u_resolution);
  float clickDist = distance(uv, clickPos * u_resolution);

  float cursorRadius = 25.0 + sin(u_time * 5.0) * 5.0 + isClicked * 15.0;
  float cursor = step(cursorDist, cursorRadius);
  float click = step(clickDist, 15.0);

  vec3 color = mix(vec3(0.0, 0.0, 1.0), vec3(1.0), dot);
  color = mix(color, u_cursorColor, cursor);
  color = mix(color, vec3(1.0), click);

  outColor = vec4(color, 1.0);
}`

const canvas = document.createElement('canvas')
document.body.append(canvas)

const shader = new ShaderPad(fragmentShaderSrc, { canvas })

const getColor = (time) =>
  [time, time + (Math.PI * 2) / 3, time + (Math.PI * 4) / 3].map(
    (x) => 0.5 + 0.5 * Math.sin(x),
  )

shader.initializeUniform('u_cursorColor', 'float', getColor(0))

shader.play((time) => {
  shader.updateUniforms({ u_cursorColor: getColor(time) })
})
```

{% built-in-inputs-preview /%}

