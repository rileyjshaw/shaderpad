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

The CLI will prompt you to choose a starter app interactively. You can also start exparimenting with the templates in your browser:

- [Open the basic starter (TS) in StackBlitz](https://stackblitz.com/fork/github/rileyjshaw/shaderpad/tree/main/packages/create-shaderpad/template-basic-ts?title=ShaderPad%20Basic%20TypeScript)
- [Open the basic starter (JS) in StackBlitz](https://stackblitz.com/fork/github/rileyjshaw/shaderpad/tree/main/packages/create-shaderpad/template-basic-js?title=ShaderPad%20Basic%20JavaScript)
- [Open the face filter starter (TS) in StackBlitz](https://stackblitz.com/fork/github/rileyjshaw/shaderpad/tree/main/packages/create-shaderpad/template-face-ts?title=ShaderPad%20Face%20TypeScript)
- [Open the face filter starter (JS) in StackBlitz](https://stackblitz.com/fork/github/rileyjshaw/shaderpad/tree/main/packages/create-shaderpad/template-face-js?title=ShaderPad%20Face%20JavaScript)

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

- “Read the [ShaderPad AI agent guide](/docs/getting-started/ai-agent-guide) and turn the basic starter into an animated shader that looks like a holographic orb.”
- “Using the basic ShaderPad starter, build an animated pattern using Cairo tiling.”
- “Using the face filter starter, make a face-tracked pixelation effect. Keep the first version as small and readable as possible.”

If you are working locally with an editor agent, it also helps to tell it to start with one fragment shader, one `ShaderPad` instance, `createFullscreenCanvas()` plus `autosize()`, and `shader.play()` for animation. Those defaults line up with the rest of the docs and tend to produce the cleanest first pass.
