---
title: Installation
nextjs:
  metadata:
    title: Installation
    description: Install ShaderPad and understand when you also need MediaPipe.
---

To install the core library:

```bash
npm install shaderpad
```

The core `ShaderPad` bundle is currently {% shaderpad-size /%} gzipped.

{% callout title="Peer dependency requirements" %}
If you wish to use the tracking plugins ([face](/docs/plugins/face), [pose](/docs/plugins/pose), [hands](/docs/plugins/hands), or [segmenter](/docs/plugins/segmenter)), you’ll also need to install MediaPipe as a peer dependency:

```bash
npm install @mediapipe/tasks-vision
```
{% /callout %}
