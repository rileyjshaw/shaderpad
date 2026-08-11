---
'shaderpad': minor
---

Add per-texture history

The history plugin now supports history tracking for individual textures, in addition to framebuffer history. When initializing a texture with `initializeTexture()`, you can now specify a historyDepth parameter to maintain a buffer of prior frames for that specific texture:

```ts
// Store the last 30 webcam frames
// shader.initializeTexture('u_webcam', videoElement, 30);
```

Added two new examples demonstrating per-texture history:

-   history-webcam-channels
-   history-webcam-grid
