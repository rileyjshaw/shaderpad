---
title: Webcam input
nextjs:
  metadata:
    title: Webcam input
    description: Use webcam video as a live texture in ShaderPad.
---

ShaderPad makes it easy to ingest video textures, including live webcam streams.

## Basic Flow

1. Get a `MediaStream`
2. Attach it to a `<video>`
3. Initialize a texture from that video
4. Update the texture every frame

## Example

```javascript
import ShaderPad from 'shaderpad'
import { createFullscreenCanvas } from 'shaderpad/util'
import autosize from 'shaderpad/plugins/autosize'
import helpers from 'shaderpad/plugins/helpers'

async function init() {
  const fragmentShaderSrc = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_webcam;

void main() {
  vec2 uv = vec2(1.0 - v_uv.x, v_uv.y); // Flip x-axis for selfie-style preview.
  uv = fitCover(uv, vec2(textureSize(u_webcam, 0))); // Fill the fullscreen canvas without stretching.
  outColor = texture(u_webcam, uv); // Output the webcam color for this pixel.
}`

  const video = document.createElement('video')
  video.autoplay = true
  video.muted = true
  video.playsInline = true

  let stream
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true })
  } catch (error) {
    // Show fallback UI here to handle a rejected stream.
    throw error
  }

  video.srcObject = stream
  await new Promise((resolve) => {
    video.onloadedmetadata = () => resolve()
  })
  await video.play()

  const shader = new ShaderPad(fragmentShaderSrc, {
    canvas: createFullscreenCanvas(),
    plugins: [autosize(), helpers()],
  })
  shader.initializeTexture('u_webcam', video)
  shader.play(() => {
    shader.updateTextures({ u_webcam: video })
  })
}

init()
```

This mirrors the webcam for a selfie-style preview and uses `fitCover(...)` so the video fills the canvas without stretching.

## Practical Tips

- Wait for `loadedmetadata` before trusting `videoWidth` and `videoHeight`
- Update the texture in a callback passed to `play()`

{% callout type="warning" title="Camera access can fail" %}
Browsers can reject camera access because of permissions, insecure origins, unavailable devices, or user choice. If you’re not able to render the stream, ensure your app has proper camera access.
{% /callout %}

