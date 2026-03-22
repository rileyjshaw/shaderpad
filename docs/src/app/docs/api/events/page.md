---
title: Events
nextjs:
  metadata:
    title: Events
    description: Lifecycle and plugin events emitted by ShaderPad.
---

Subscribe to an event with `shader.on(eventName, callback)` and remove an event listener with `shader.off(eventName, callback)`.

## Core Events

| Event               | Arguments                       | Meaning                                     |
| ------------------- | ------------------------------- | ------------------------------------------- |
| `updateResolution`  | `(width, height)`               | Drawing buffer resolution changed.          |
| `play`              | none                            | Render loop started.                        |
| `pause`             | none                            | Render loop paused.                         |
| `reset`             | none                            | Frame/time and history were reset.          |
| `destroy`           | none                            | Resources were released.                    |
| `beforeStep`        | `(time, frame, options?)`       | Before a render step.                       |
| `afterStep`         | `(time, frame, options?)`       | After a render step.                        |
| `beforeDraw`        | `(options?)`                    | Before a draw.                              |
| `afterDraw`         | `(options?)`                    | After a draw.                               |
| `initializeTexture` | `(name, source, options?)`      | Texture initialized.                        |
| `initializeUniform` | `(name, type, value, options?)` | Uniform initialized.                        |
| `updateTextures`    | `(updates, options?)`           | Public texture update finished.             |
| `updateUniforms`    | `(updates, options?)`           | Uniform update finished.                    |

## Plugin Events

| Event                                 | Meaning                                   |
| ------------------------------------- | ----------------------------------------- |
| `autosize:resize`                     | Autosize plugin changed canvas dimensions. |
| `face:ready`, `face:result`           | Face plugin lifecycle.                     |
| `pose:ready`, `pose:result`           | Pose plugin lifecycle.                     |
| `hands:ready`, `hands:result`         | Hands plugin lifecycle.                    |
| `segmenter:ready`, `segmenter:result` | Segmenter plugin lifecycle.                |
