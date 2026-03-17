---
title: Format and precision
nextjs:
  metadata:
    title: Format and precision
    description: Choose ShaderPad texture formats, data types, filters, and history precision deliberately.
---

ShaderPad exposes its underlying WebGL2 texture format controls for advanced use cases. This is useful when you want compact buffers, integer pipelines, or high-precision feedback.

## Option Defaults

Constructor options configure ShaderPad's internal render target and output history. Below are the available options, along with their default values:

- `internalFormat`: `RGBA8`
- `format`: `RGBA`
- `type`: `UNSIGNED_BYTE`
- `minFilter`: `LINEAR`
- `magFilter`: `LINEAR`
- `wrapS`: `CLAMP_TO_EDGE`
- `wrapT`: `CLAMP_TO_EDGE`

Texture options on `initializeTexture()` use the same fields, plus `preserveY: false`.

## Constructor Options

When used in the constructor, these options define how ShaderPad stores:

- The displayed canvas
- The history texture when `history` is enabled
- Chained passes when another `ShaderPad` samples this instance

```javascript
const shader = new ShaderPad(fragmentShaderSrc, {
  canvas,
  history: 24,
  internalFormat: 'RGBA32F',
  type: 'FLOAT',
  minFilter: 'NEAREST',
  magFilter: 'NEAREST',
})
```

{% callout title="Canvas Color Precision" %}
Due to browser restrictions, a rendered canvas will not display color precision beyond its native 8-bit. Reduced-channel formats such as `R8` or `RG8` can visibly change the result by dropping color channels.
{% /callout %}

## Texture Options

Texture format is configured separately from the ShaderPad instance settings, and takes similar options.

```javascript
shader.initializeTexture(
  'u_mask',
  { data: new Uint8Array(width * height), width, height },
  {
    internalFormat: 'R8',
    format: 'RED',
    type: 'UNSIGNED_BYTE',
    minFilter: 'NEAREST',
    magFilter: 'NEAREST',
  },
)
```

This is useful for:

- Input streams with a different format than the defaults
- Masks or grayscale buffers
- Passing or storing integer IDs, category indices, or precise data as a texture

If history is enabled for a texture, it will inherit the texture’s format settings.

## GLSL Sampler Types

In your GLSL code, the sampler type must match the texture’s format family:

- Use `sampler2D` for normalized color formats such as `R8` or `RGBA8`, and float formats such as `R32F` or `RGBA32F`
- Use `usampler2D` for unsigned integer formats such as `R8UI` or `RGBA16UI`
- Use `isampler2D` for signed integer formats such as `R32I` or `RGBA8I`

The same rules apply to history textures, which are stored as `sampler2DArray`, `usampler2DArray`, or `isampler2DArray`.

{% callout title="Sampler Type Mismatch" type="warning" %}
If the sampler family does not match the texture's format family, the shader will either fail to compile/link or return incorrect values.
{% /callout %}

## Defaults And Inference

If you provide `type` but not `internalFormat`, ShaderPad infers a matching storage format. For example:

- `FLOAT` defaults to `RGBA32F`
- `UNSIGNED_BYTE` defaults to `RGBA8`

If you omit `format`, ShaderPad derives one from `internalFormat`. The defaults are practical, but it’s a good idea to set all three options explicitly.

## Chained ShaderPads Preserve Format And Precision

If you initialize a texture from another `ShaderPad` without overriding its texture options, the destination texture inherits the source format settings. That means high-precision and integer data are transferred correctly by default, even when the two `ShaderPad` instances use different WebGL contexts.

{% callout title="Chain Performance" %}
Cross-context chains preserve the data format, but they do not share a GPU texture. They are correct, but slower.
{% /callout %}

