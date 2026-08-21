---
title: Format and precision
nextjs:
    metadata:
        title: Format and precision
        description: Choose ShaderPad texture formats, data types, filters, and history precision deliberately.
---

ShaderPad exposes its underlying WebGL2 texture format controls for advanced use cases. This is useful when you want compact buffers, integer pipelines, or high-precision feedback.

## Option Defaults

Constructor options configure ShaderPad’s internal render target and output history. Below are the available options, along with their default values:

- `format`: `RGBA8`
- `minFilter`: `LINEAR`, or `NEAREST` for integer formats
- `magFilter`: `LINEAR`, or `NEAREST` for integer formats
- `wrapS`: `CLAMP_TO_EDGE`
- `wrapT`: `CLAMP_TO_EDGE`
- `colorSpace`: browser default (`srgb`)

Texture options on `initializeTexture()` use the same fields, plus `preserveY: false`.

The constructor accepts only framebuffer-renderable formats. `initializeTexture()` accepts every sized colour texture format, including texture-only formats such as `RGB9_E5` and `RGB16F`.

## Constructor Options

When used in the constructor, these options define how ShaderPad stores:

- The displayed canvas
- The history texture when `history` is enabled
- Chained passes when another `ShaderPad` samples this instance

```javascript
const shader = new ShaderPad(fragmentShaderSrc, {
	canvas,
	history: 24,
	format: 'RGBA32F',
	minFilter: 'NEAREST',
	magFilter: 'NEAREST',
	colorSpace: 'display-p3',
});
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
		format: 'R8',
		minFilter: 'NEAREST',
		magFilter: 'NEAREST',
	},
);
```

This is useful for:

- Input streams with a different format than the defaults
- Masks or grayscale buffers
- Passing or storing integer IDs, category indices, or precise data as a texture

If history is enabled for a texture, it will inherit the texture’s format settings.

`colorSpace` is independent of `format`. It tells WebGL which color space the values represent for drawing-buffer output and DOM texture uploads. The storage options still control precision and channel layout. For high-precision wide-gamut work, pair `colorSpace: 'display-p3'` with a float render target such as `format: 'RGBA16F'`.

## GLSL Sampler Types

In your GLSL code, the sampler type must match the texture’s format family:

- Use `sampler2D` for normalized color formats such as `R8` or `RGBA8`, and float formats such as `R32F` or `RGBA32F`
- Use `usampler2D` for unsigned integer formats such as `R8UI` or `RGBA16UI`
- Use `isampler2D` for signed integer formats such as `R32I` or `RGBA8I`

The same rules apply to history textures, which are stored as `sampler2DArray`, `usampler2DArray`, or `isampler2DArray`.

{% callout title="Sampler Type Mismatch" type="warning" %}
If the sampler family does not match the texture’s format family, the shader will either fail to compile/link or return incorrect values.
{% /callout %}

## Texture Storage and Upload Data

The `format` option describes how WebGL stores a texture on the GPU. Its name usually identifies three things:

- The channels: `R`, `RG`, `RGB`, or `RGBA`
- The precision of each channel, such as 8, 16, or 32 bits
- The numeric representation: normalized by default, `F` for floating point, `UI` for unsigned integers, or `I` for signed integers

For example, `R8` is a one-channel normalized texture, `RGBA16F` is a four-channel floating-point texture, and `RG16UI` is a two-channel unsigned-integer texture. Packed and sRGB formats such as `RGB565` and `SRGB8_ALPHA8` use the same `format` option. You can see the [full list of formats here](https://github.com/miseryco/shaderpad/blob/main/packages/shaderpad/src/internal/formats.ts).

Integer formats default both texture filters to `NEAREST`, since WebGL cannot linearly filter integer samplers. Normalized and floating-point formats default to `LINEAR`. Explicit `minFilter` and `magFilter` options override these defaults.

ShaderPad derives the corresponding WebGL upload settings from this format. When uploading a custom texture, provide a typed array that is compatible with its numeric representation and precision. Common pairings include `Uint8Array` for `R8` or `RGBA8`, `Float32Array` for float formats, and the matching signed or unsigned integer array for integer formats.

Some storage formats accept more than one data representation. For example, a 16-bit float texture can receive ordinary values from a `Float32Array` or encoded half-float bits from a `Uint16Array`. Packed formats similarly accept their packed integer arrays. ShaderPad examines the data on every upload, so an empty texture can later be updated using any compatible representation:

```javascript
shader.initializeTexture('u_field', { data: null, width, height }, { format: 'RGBA16F' });

shader.updateTextures({
	u_field: { data: new Float32Array(width * height * 4), width, height },
});
```

## Chained ShaderPads Preserve Format, Precision, And Color Space

If you initialize a texture from another `ShaderPad` without overriding its texture options, the destination texture inherits the source format settings and `colorSpace`. That means high-precision, integer, and wide-gamut pipelines transfer correctly by default, even when the two `ShaderPad` instances use different WebGL contexts.

{% callout title="Chain Performance" %}
Cross-context chains preserve the data format, but they do not share a GPU texture. They are correct, but slower.
{% /callout %}
