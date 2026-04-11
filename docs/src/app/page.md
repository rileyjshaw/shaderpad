---
title: Overview
nextjs:
    metadata:
        title: ShaderPad | Get creative with shaders
        description: ShaderPad is a lightweight, dependency-free library that reduces boilerplate when working with fragment shaders.
---

ShaderPad handles the repetitive work required to render fragment shaders in the browser. It’s performant, flexible, and comes “batteries included” for most needs. ShaderPad has optional plugins — from PNG export to face/pose tracking — for more specific requirements. Simple, performant, and portable, ShaderPad lets you focus on writing GLSL. {% .lead %}

{% quick-links %}

{% quick-link title="Installation" icon="installation" href="/docs/getting-started/installation" description="Install ShaderPad, start from a template, or set up an AI-assisted workflow." /%}

{% quick-link title="Quickstart" icon="lightbulb" href="/docs/getting-started/quickstart" description="Get started by rendering your first simple example shaders." /%}

{% quick-link title="Examples" icon="presets" href="/docs/getting-started/examples" description="Browse runnable examples and source code for common ShaderPad patterns." /%}

{% quick-link title="API reference" icon="plugins" href="/docs/api/shaderpad" description="Jump straight to options, methods, events, and utilities." /%}

{% /quick-links %}

## Meet ShaderPad

ShaderPad is a minimal fragment shader library for the web. It handles WebGL2 scaffolding, uniform and texture synchronization, resizing, history buffers, and other runtime plumbing. It’s performant by default and lets you focus on the creative parts of graphics programming. With a small footprint ({% shaderpad-size /%} gzipped), effects load quickly and run well on any device. And if you want face filters, pose-driven visuals, hand tracking, or object segmentation, MediaPipe-powered plugins give you one of the fastest ways to start building.

![Face mesh created with ShaderPad’s face plugin](/wink.png)

## What can I build with ShaderPad?

- Create fullscreen interactive shaders in under 10 lines of JS code.
- Add post-processing effects to existing `canvas`, `img` and `video` elements.
- Efficiently create multi-pass graphics pipelines with minimal overhead.
- Make your own face filters or pose detection apps like [Strange Camera](https://strange.cam).
- Vibe code your first shader using the [AI entry points](/docs/getting-started/installation#using-ai).

## Comparisons To Other Libraries

[ThreeJS](https://threejs.org) is an incredible framework, but it’s nearly 30x the size of ShaderPad. If you want to use your GPU without a full 3D library, ShaderPad is a great choice.

Hosted shader playgrounds like [ShaderToy](https://www.shadertoy.com) are perfect for sketches, but they keep your work locked into that platform. ShaderPad aims to provide a similar speed of iteration while giving you something you can drop into any project.

## Inspiration

- [ShaderToy](https://www.shadertoy.com): The original shader playground. Still one of the coolest places on the Internet.
- [ThreeJS](https://threejs.org): The most popular 3D library on the web by a landslide, for good reason.
- [TWGL](https://twgljs.org/): A performant and unopinionated WebGL library for the browser.
- [ShaderBooth](https://shaderbooth.com/): A fun, immediate, and inspiring way to learn and experiment with shaders.

{% callout title="WebGL2 is required" %}
ShaderPad targets WebGL 2.0, which is [widely available across all major browsers.](https://caniuse.com/webgl2)
{% /callout %}

## Interested? Choose a path

### Start here

- [Installation](/docs/getting-started/installation)
- [Quickstart](/docs/getting-started/quickstart)
- [Learning shaders](/docs/getting-started/learning-shaders)
- [Built-in inputs](/docs/core-concepts/built-in-inputs)

### Camera effects and filters

- [Webcam input](/docs/guides/webcam-input)
- [Textures](/docs/core-concepts/textures)
- [History](/docs/core-concepts/history)
- [Face plugin](/docs/plugins/face)

### Advanced / multi-pass effects

- [Chaining shaders](/docs/guides/chaining-shaders)
- [Format and precision](/docs/core-concepts/format-and-precision)
- [Performance](/docs/guides/performance)
- [API reference](/docs/api/shaderpad)
