---
title: Quickstart
nextjs:
    metadata:
        title: Quickstart
        description: Render your first animated shader with ShaderPad.
---

If you want the fastest way to start a new ShaderPad project, run `npm create shaderpad@latest` locally or open the [basic starter in StackBlitz](https://stackblitz.com/fork/github/miseryco/shaderpad/tree/main/packages/create-shaderpad/template-basic-ts?title=ShaderPad%20Basic%20shader%20%28TypeScript%29). For more setup options, including how to work with AI tooling, see [Installation](/docs/getting-started/installation). {% .lead %}

---

Let’s start with a simple animated ShaderPad that tracks your cursor:

```javascript
import ShaderPad from 'shaderpad';

const fragmentShaderSrc = `#version 300 es
precision highp float;

in vec2 v_uv;
uniform float u_time;
uniform vec2 u_cursor;
uniform vec2 u_resolution;
out vec4 outColor;

void main() {
  vec2 uv = (v_uv - u_cursor) * 2.0;
  uv.x *= u_resolution.x / u_resolution.y;

  float glow = 0.25 / max(length(uv), 0.001);
  vec3 color = 0.5 + 0.5 * cos(u_time + uv.xyx + vec3(0.0, 2.0, 4.0));
  outColor = vec4(color * glow, 1.0);
}`;

const canvas = document.createElement('canvas');
const shader = new ShaderPad(fragmentShaderSrc, { canvas });

shader.play();
```

{% quickstart-preview /%}

## Required GLSL Declarations

In your fragment shader, you must declare `in vec2 v_uv` (normalized shader coordinates) and `out vec4 outColor` (the output color). You can also declare any of the [built-in uniforms](/docs/core-concepts/built-in-inputs) like `u_time`, `u_cursor`, or `u_resolution`, as shown in the shader above. The complete built-in uniform list is documented in the [Uniforms API reference](/docs/api/uniforms).

## Make It Fullscreen

To make a fullscreen ShaderPad, use the `createFullscreenCanvas` utility along with the `autosize` plugin.

```javascript
import ShaderPad from 'shaderpad';
import { createFullscreenCanvas } from 'shaderpad/util';
import autosize from 'shaderpad/plugins/autosize';

const fragmentShaderSrc = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 outColor;

void main() {
  outColor = vec4(v_uv, 0.0, 1.0);
}`;

const shader = new ShaderPad(fragmentShaderSrc, {
	canvas: createFullscreenCanvas(),
	plugins: [autosize()],
});
shader.play();
```

## Add Dynamic Data

You can synchronize dynamic data from JavaScript to your shader through custom uniforms and textures, and update them with a callback passed to `play()`.

```javascript
import ShaderPad from 'shaderpad';
import { createFullscreenCanvas } from 'shaderpad/util';
import autosize from 'shaderpad/plugins/autosize';

const fragmentShaderSrc = `#version 300 es
precision highp float;

in vec2 v_uv;
uniform sampler2D u_video;
uniform float u_playhead;
out vec4 outColor;

void main() {
  vec4 color = texture(u_video, v_uv);
  color.rgb = mix(color.rgb, 1.0 - color.rgb, u_playhead);
  outColor = color;
}`;

const video = document.querySelector('video');
video.play(); // To support autoplay, videos require a `muted` attribute

const shader = new ShaderPad(fragmentShaderSrc, {
	canvas: createFullscreenCanvas(),
	plugins: [autosize()],
});
shader.initializeUniform('u_playhead', 'float', 0.0);
shader.initializeTexture('u_video', video);
shader.play(() => {
	shader.updateUniforms({ u_playhead: video.currentTime / video.duration || 0 });
	shader.updateTextures({ u_video: video });
});
```

These examples show some very basic applications of ShaderPad to get you started quickly. Continue reading for a closer look at how it works.
