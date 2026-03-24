---
title: Textures
nextjs:
    metadata:
        title: Textures
        description: Work with images, videos, canvases, typed arrays, and ShaderPad outputs.
---

ShaderPad can ingest a variety of texture sources, including images, videos, canvases, typed arrays, and chained ShaderPad outputs. It smoothly and performantly handles these with the same API, so you can spend less time on plumbing.

## Supported Texture Sources

`initializeTexture()` accepts:

- `HTMLImageElement`
- `HTMLVideoElement`
- `HTMLCanvasElement`
- `OffscreenCanvas`
- `ImageBitmap`
- `WebGLTexture`
- `ShaderPad`
- `{ data, width, height }` typed-array textures

## Initialize A Texture

```javascript
shader.initializeTexture('u_webcam', videoElement);
shader.initializeTexture('u_image', imageElement);
```

Custom typed-array textures are also supported:

```javascript
shader.initializeTexture(
	'u_data',
	{ data: new Float32Array(width * height * 4), width, height },
	{
		internalFormat: 'RGBA32F',
		type: 'FLOAT',
		minFilter: 'NEAREST',
		magFilter: 'NEAREST',
	},
);
```

## Updating Live Textures

Live sources such as videos should usually be updated each frame:

```javascript
shader.play(() => {
	shader.updateTextures({ u_webcam: videoElement });
});
```

## Partial Texture Updates

For typed-array textures, you can update a sub-region for efficiency:

```javascript
shader.updateTextures({
	u_data: { data, width, height, x, y, isPartial: true },
});
```

## Orientation Rules

- DOM-backed sources are flipped vertically by default to match WebGL expectations
- Set `preserveY: true` to keep DOM source orientation unchanged
- Typed-array sources are expected to already be in WebGL’s bottom-up orientation

## Texture History

Any texture can maintain its own history:

```javascript
shader.initializeTexture('u_webcam', videoElement, { history: 30 });
```

That creates:

- A `sampler2DArray` texture in GLSL
- A matching frame-offset uniform such as `u_webcamFrameOffset`

With the `helpers` plugin, you can sample earlier frames like this:

```glsl
float z = historyZ(u_webcam, u_webcamFrameOffset, 1);
vec4 color = texture(u_webcam, vec3(v_uv, z));
```

Here, `historyZ(..., 1)` means the previous stored texture sample. `historyZ(..., 0)` is also valid for texture history and refers to the current value.

## ShaderPad As A Texture Source

You can feed one ShaderPad instance into another:

```javascript
passB.initializeTexture('u_firstPass', passA);
```

This is the basis for chaining and multi-pass workflows, which are covered in detail [here](/docs/guides/chaining-shaders).
