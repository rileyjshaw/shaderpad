# ShaderPad Agent Guide

This repository includes both the library source and the documentation site. If you are an AI coding agent helping someone build with ShaderPad, use these files first:

- `docs/public/llms.txt`
- `docs/src/app/docs/getting-started/ai-agent-guide/page.md`
- `examples/src/*.ts`

## What ShaderPad is

ShaderPad is a WebGL2-first library for fullscreen fragment shaders, live textures, history buffers, and optional MediaPipe-powered vision plugins. It is not a scene graph and not a Three.js replacement.

## Canonical imports

```ts
import ShaderPad from 'shaderpad';
import { createFullscreenCanvas } from 'shaderpad/util';
import autosize from 'shaderpad/plugins/autosize';
import helpers from 'shaderpad/plugins/helpers';
```

Plugin import paths:

- `shaderpad/plugins/autosize`
- `shaderpad/plugins/helpers`
- `shaderpad/plugins/save`
- `shaderpad/plugins/face`
- `shaderpad/plugins/pose`
- `shaderpad/plugins/hands`
- `shaderpad/plugins/segmenter`

## Default implementation pattern

1. Start with one fragment shader and one `ShaderPad` instance.
2. For browser demos, default to `createFullscreenCanvas()` plus `autosize()`.
3. Use `shader.play()` for animated work.
4. Add custom uniforms with `initializeUniform()` before `updateUniforms()`.
5. Add textures with `initializeTexture()` before `updateTextures()`.
6. Only add history, chaining, or vision plugins when the prompt actually needs them.

## Required GLSL shape

For a normal fragment shader, include:

- `#version 300 es`
- `precision highp float;`
- `in vec2 v_uv;`
- `out vec4 outColor;`

Declare built-ins only when you use them, for example:

- `uniform float u_time;`
- `uniform vec2 u_resolution;`
- `uniform vec2 u_cursor;`
- `uniform sampler2D u_webcam;`

Important:

- If you use `helpers()`, do not manually declare `u_resolution`; the plugin injects it.
- `u_cursor` and `u_click` are normalized over `cursorTarget`.
- Omitting `canvas` creates a headless `OffscreenCanvas`.

## High-value rules

- Use `play()` when time, frame count, or history should advance.
- Use `step()` for manual frame advancement.
- Use `draw()` only for render-only passes; it does not advance time, frame, or history.
- For live DOM textures like video or webcam, call `updateTextures()` every frame.
- For feedback or delay effects, use output `history` or per-texture `history`, usually with `helpers()` and `historyZ()`.
- For multi-pass pipelines, a `ShaderPad` instance can be passed directly to `initializeTexture()`.
- MediaPipe plugins require `@mediapipe/tasks-vision` as a peer dependency.
- For MediaPipe plugins, the plugin `textureName` must match the initialized live texture name.

## Useful repo commands

- `npm run build`
- `cd docs && npm run build`
- `cd examples && npm run dev`
