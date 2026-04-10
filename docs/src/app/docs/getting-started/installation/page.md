---
title: Installation
nextjs:
    metadata:
        title: Installation
        description: Install ShaderPad and understand when you also need MediaPipe.
---

The core `ShaderPad` bundle is currently {% shaderpad-size /%} gzipped.

## Start From A Template

If you want to create a new project, use one of the provided starter templates:

```bash
npm create shaderpad@latest
```

The CLI will prompt you to choose a starter app interactively. You can also start experimenting with the TypeScript starter templates in your browser:

- [Open the basic starter in StackBlitz](https://stackblitz.com/fork/github/miseryco/shaderpad/tree/main/packages/create-shaderpad/template-basic-ts?title=ShaderPad%20Basic%20%28TypeScript%29)
- [Open the LYGIA starter in StackBlitz](https://stackblitz.com/fork/github/miseryco/shaderpad/tree/main/packages/create-shaderpad/template-lygia-ts?title=ShaderPad%20LYGIA%20%28TypeScript%29)
- [Open the face tracking starter in StackBlitz](https://stackblitz.com/fork/github/miseryco/shaderpad/tree/main/packages/create-shaderpad/template-face-ts?title=ShaderPad%20with%20face%20tracking%20%28TypeScript%29)
- [Open the pose tracking starter in StackBlitz](https://stackblitz.com/fork/github/miseryco/shaderpad/tree/main/packages/create-shaderpad/template-pose-ts?title=ShaderPad%20with%20pose%20tracking%20%28TypeScript%29)
- [Open the hand tracking starter in StackBlitz](https://stackblitz.com/fork/github/miseryco/shaderpad/tree/main/packages/create-shaderpad/template-hands-ts?title=ShaderPad%20with%20hand%20tracking%20%28TypeScript%29)
- [Open the segmentation starter in StackBlitz](https://stackblitz.com/fork/github/miseryco/shaderpad/tree/main/packages/create-shaderpad/template-segmenter-ts?title=ShaderPad%20with%20segmentation%20%28TypeScript%29)

## Install Into An Existing Project

To add ShaderPad to a project you already have:

```bash
npm install shaderpad
```

{% callout title="Peer dependency requirements" %}
If you wish to use the tracking plugins ([face](/docs/plugins/face), [pose](/docs/plugins/pose), [hands](/docs/plugins/hands), or [segmenter](/docs/plugins/segmenter)), you’ll also need to install MediaPipe as a peer dependency:

```bash
npm install @mediapipe/tasks-vision
```

{% /callout %}

## Using AI

If you are working with Claude, Cursor, Codex, or another coding assistant, the best documentation entry point for agents is the [AI agent guide](/docs/getting-started/ai-agent-guide). That page is written for AI assistants, not humans, and it links to smaller machine-readable sources and example mirrors.

If your tool accepts extra context URLs, these are the most useful:

- [`/llms.txt`](/llms.txt) for the small discovery layer
- [`/llms-index.json`](/llms-index.json) for a structured page catalog
- [`/llms-full.txt`](/llms-full.txt) for a one-fetch docs corpus
- [`/examples/source`](/examples/source) for raw example source mirrors

The smoothest workflow is usually:

1. Start a local project with `npm create shaderpad@latest`.
2. Point your agent to the [AI agent guide](/docs/getting-started/ai-agent-guide).
3. Tell it which starter you chose and what you want to build.
4. Ask for the smallest working version first, then iterate.

Good prompts to start with:

- “Read the [ShaderPad AI agent guide](/docs/getting-started/ai-agent-guide) and turn the ‘Basic shader’ starter into an animated shader that looks like a holographic orb.”
- “Read the [ShaderPad AI agent guide](/docs/getting-started/ai-agent-guide). Using the ‘Basic shader’ starter, build an animated pattern using worley noise from the LYGIA library.”
- “Read the [ShaderPad AI agent guide](/docs/getting-started/ai-agent-guide). Using the ‘Shader with face tracking’ starter, make a face-tracked pixelation effect. Keep the first version as small and readable as possible.”

If you are working locally with an editor agent, it also helps to tell it to start with one fragment shader, one `ShaderPad` instance, `createFullscreenCanvas()` plus `autosize()`, and `shader.play()` for animation. Those defaults line up with the rest of the docs and tend to produce the cleanest first pass.
