---
title: helpers
nextjs:
    metadata:
        title: helpers
        description: GLSL helpers for aspect fitting and history sampling.
---

The `helpers` plugin injects a few GLSL helper functions into your fragment shader.

```javascript
import helpers from 'shaderpad/plugins/helpers';

const shader = new ShaderPad(fragmentShaderSrc, {
	plugins: [helpers()],
});
```

{% callout title="Important note" type="warning" %}
When you use `helpers()`, it injects the `u_resolution` declaration for you. Do not manually declare `u_resolution` in the shader source in that case, or GLSL compilation will fail with a duplicate declaration.
{% /callout %}

If you already have a GLSL-aware bundler pipeline, ShaderPad also exposes raw helper GLSL modules for individual imports:

```javascript
import fitCoverGLSL from 'shaderpad/helpers/fitCover.glsl';
import fitCoverInverseGLSL from 'shaderpad/helpers/fitCoverInverse.glsl';
```

If you want the full helper set injected for you, use `helpers()`. The raw GLSL exports are for pulling in specific helpers yourself.

If you import `fitContain.glsl`, `fitContainInverse.glsl`, `fitCover.glsl`, or `fitCoverInverse.glsl` directly, you must declare `u_resolution` in your shader:

```glsl
uniform vec2 u_resolution;
#include "/shaderpad/helpers/fitContain.glsl"
```

For `vite-plugin-glsl`, that leading `/` matches the common `root: '/node_modules/'` setup used in the ShaderPad starters.

## `vec2 fitContain(vec2 uv, vec2 textureSize)`

Returns UVs that preserve the source aspect ratio while fitting the entire source inside the current viewport. This may result in letterboxing if the source aspect ratio differs from the viewport. This is the GLSL equivalent of [CSS `object-fit: contain`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/object-fit#contain).

Example:

```glsl
vec2 uv = fitContain(v_uv, vec2(textureSize(u_webcam, 0)));
vec4 color = texture(u_webcam, uv);
```

## `vec2 fitContainInverse(vec2 uv, vec2 textureSize)`

Maps source-texture UVs back into viewport UVs using the same aspect-preserving transform as `fitContain`. This is useful when you have coordinates in texture space and want to know where they land on screen.

Example:

```glsl
vec2 screenUV = fitContainInverse(vec2(0.5), vec2(textureSize(u_image, 0)));
```

## `vec2 fitCover(vec2 uv, vec2 textureSize)`

Returns UVs that preserve the source aspect ratio while filling the entire viewport. This may result in cropping if the source aspect ratio differs from the viewport. This is the GLSL equivalent of [CSS `object-fit: cover`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/object-fit#cover).

Example:

```glsl
vec2 uv = fitCover(v_uv, vec2(textureSize(u_image, 0)));
vec4 color = texture(u_image, uv);
```

## `vec2 fitCoverInverse(vec2 uv, vec2 textureSize)`

Maps source-texture UVs back into viewport UVs using the same aspect-preserving transform as `fitCover`. This is especially useful in ShaderPad when webcam or MediaPipe coordinates need to be converted back into output or history UVs.

Example:

```glsl
vec2 historyUV = clamp(fitCoverInverse(webcamUV, vec2(textureSize(u_webcam, 0))), 0.0, 1.0);
vec4 color = texture(u_history, vec3(historyUV, historyZ(u_history, u_historyFrameOffset, 1)));
```

## `historyZ`

```glsl
float historyZ(highp sampler2DArray tex, int frameOffset, int framesAgo)
float historyZ(highp usampler2DArray tex, int frameOffset, int framesAgo)
float historyZ(highp isampler2DArray tex, int frameOffset, int framesAgo)
```

Returns the `z` index to use when sampling a history texture like `u_history` or texture/plugin history buffers. It handles the ring-buffer offset and wraparound for you, so you can simply ask for the frame from N steps ago.

Arguments:

- `tex`: the history texture array you want to sample
- `frameOffset`: the current ShaderPad-generated write position, such as `u_historyFrameOffset`
- `framesAgo`: how many steps back to read

Returns:

- the `z` coordinate for `texture(..., vec3(uv, z))`

Example:

```glsl
float z = historyZ(u_history, u_historyFrameOffset, 1); // 1 frame ago
vec4 color = texture(u_history, vec3(v_uv, z));
```

`historyZ(..., 1)` means the previous stored frame. For textures and plugins, `historyZ(..., 0)` refers to the current or latest stored value. For all history buffers, if you set `history: N`, the oldest stored frame will be at index `historyZ(..., N)`.
