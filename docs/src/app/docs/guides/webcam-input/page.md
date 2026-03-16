---
title: Webcam input
nextjs:
  metadata:
    title: Webcam input
    description: Use webcam video as a live texture in ShaderPad.
---

Webcam input is just a live texture plus a per-frame update.

## Basic Flow

1. get a `MediaStream`
2. attach it to a `<video>`
3. initialize a texture from that video
4. update the texture every frame

```typescript
const shader = new ShaderPad(fragmentShaderSrc, { canvas })
shader.initializeTexture('u_webcam', video)

shader.play(() => {
  shader.updateTextures({ u_webcam: video })
})
```

## Common Shader Pattern

```glsl
uniform sampler2D u_webcam;

void main() {
  vec2 uv = vec2(1.0 - v_uv.x, v_uv.y);
  vec4 webcamColor = texture(u_webcam, uv);
  outColor = webcamColor;
}
```

The horizontal flip is common for selfie-style previews.

## Webcam Plus History

For delay and echo effects, enable history on the texture itself:

```typescript
shader.initializeTexture('u_webcam', video, { history: 20 })
```

## Practical Tips

- Wait for `loadedmetadata` before trusting `videoWidth` and `videoHeight`
- Update the texture in `play()` or your own loop
- Expect permission prompts and rejected access
{% callout type="warning" title="Camera access can fail" %}
Browsers can reject camera access because of permissions, insecure origins, unavailable devices, or user choice. If you’re not able to render the stream, ensure your app has proper camera access.
{% /callout %}

## Related

- [Textures](/docs/core-concepts/textures)
- [History](/docs/core-concepts/history)
- [Format and precision](/docs/core-concepts/format-and-precision)
