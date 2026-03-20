---
title: Installation
nextjs:
  metadata:
    title: Installation
    description: Install ShaderPad and understand when you also need MediaPipe.
---

The core `ShaderPad` bundle is currently {% shaderpad-size /%} gzipped.

To install the library into an existing project:

```bash
npm install shaderpad
```

{% callout title="Peer dependency requirements" %}
If you wish to use the tracking plugins ([face](/docs/plugins/face), [pose](/docs/plugins/pose), [hands](/docs/plugins/hands), or [segmenter](/docs/plugins/segmenter)), you’ll also need to install MediaPipe as a peer dependency:

```bash
npm install @mediapipe/tasks-vision
```
{% /callout %}

If you want a ready-to-edit starter app instead, you can use either of these entry points:

```bash
npm create shaderpad@latest
```

The CLI will prompt you to choose a starter template interactively.

- [Open the basic starter (TS) in StackBlitz](https://stackblitz.com/fork/github/rileyjshaw/shaderpad/tree/main/packages/create-shaderpad/template-basic-ts?title=ShaderPad%20Basic%20TypeScript)
- [Open the basic starter (JS) in StackBlitz](https://stackblitz.com/fork/github/rileyjshaw/shaderpad/tree/main/packages/create-shaderpad/template-basic-js?title=ShaderPad%20Basic%20JavaScript)
- [Open the face filter starter (TS) in StackBlitz](https://stackblitz.com/fork/github/rileyjshaw/shaderpad/tree/main/packages/create-shaderpad/template-face-ts?title=ShaderPad%20Face%20TypeScript)
- [Open the face filter starter (JS) in StackBlitz](https://stackblitz.com/fork/github/rileyjshaw/shaderpad/tree/main/packages/create-shaderpad/template-face-js?title=ShaderPad%20Face%20JavaScript)
