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
| `updateResolution`  | `(width, height)`               | drawing buffer resolution changed           |
| `play`              | none                            | render loop started                         |
| `pause`             | none                            | render loop paused                          |
| `reset`             | none                            | frame/time and history were reset           |
| `destroy`           | none                            | resources were released                     |
| `beforeStep`        | `(time, frame, options?)`       | before a render step                        |
| `afterStep`         | `(time, frame, options?)`       | after a render step                         |
| `beforeDraw`        | `(options?)`                    | before a draw                               |
| `afterDraw`         | `(options?)`                    | after a draw                                |
| `initializeTexture` | `(name, source, options?)`      | texture initialized                         |
| `initializeUniform` | `(name, type, value, options?)` | uniform initialized                         |
| `updateTextures`    | `(updates, options?)`           | public texture update finished              |
| `updateUniforms`    | `(updates, options?)`           | uniform update finished                     |

## Plugin Events

| Event                                 | Meaning                                   |
| ------------------------------------- | ----------------------------------------- |
| `autosize:resize`                     | autosize plugin changed canvas dimensions |
| `face:ready`, `face:result`           | face plugin lifecycle                     |
| `pose:ready`, `pose:result`           | pose plugin lifecycle                     |
| `hands:ready`, `hands:result`         | hands plugin lifecycle                    |
| `segmenter:ready`, `segmenter:result` | segmenter plugin lifecycle                |
