---
title: Plugins
nextjs:
    metadata:
        title: Plugins
        description: Write custom ShaderPad plugins with lifecycle hooks, GLSL injection, and plugin-owned textures.
---

ShaderPad plugins are plain functions. They run during construction, before the final fragment shader is compiled, so they can change both JavaScript behavior and the GLSL source seen by ShaderPad.

If you want a real example before reading an API checklist, start with the [autosize plugin source](https://github.com/miseryco/shaderpad/blob/main/packages/shaderpad/src/plugins/autosize.ts). It is small, readable, and shows the normal shape of a plugin: reading `shader.canvas`, reacting to lifecycle events, emitting a namespaced event, and cleaning up on `destroy`.

For more examples, browse the full [plugins source folder](https://github.com/miseryco/shaderpad/tree/main/packages/shaderpad/src/plugins).

## Small Example

```typescript
import type { Plugin } from 'shaderpad';

function pulse(): Plugin {
	return (shader, { injectGLSL, emit }) => {
		injectGLSL(`uniform float u_pulse;\n`);

		shader.on('_init', () => {
			shader.initializeUniform('u_pulse', 'float', 0);
		});

		shader.on('beforeStep', (time: number) => {
			shader.updateUniforms({ u_pulse: 0.5 + 0.5 * Math.sin(time) });
			emit('pulse:update', time);
		});
	};
}
```

This is the normal pattern:

- Use `injectGLSL()` to add uniforms, helper functions, or constants.
- Use `shader.on(...)` for setup, per-frame work, and cleanup.
- Use `emit(...)` for custom namespaced events such as `pulse:update`.

## What A Plugin Gets

Import `Plugin`, `PluginContext`, and `ShaderPadEventName` from `shaderpad`.

`PluginContext` exposes:

| Member                                       | Use it for                                                           |
| -------------------------------------------- | -------------------------------------------------------------------- |
| `injectGLSL(code)`                           | Inserting GLSL before shader compilation                             |
| `emit(name, ...args)`                        | Emitting plugin events such as `myPlugin:ready`                      |
| `updateTexture(name, source, historySlots?)` | Writing plugin-owned textures without firing public `updateTextures` |

Use `shader.canvas` and `shader.gl` directly when a plugin needs the backing canvas or raw WebGL access.

When `updateTexture(...)` writes to a history-backed texture, `historySlots` wraps automatically. On non-history textures it is ignored, and the last written slot becomes the frame-offset uniform.

## Lifecycle Hooks

These are the supported hook names for `shader.on(...)`:

- `_init`
- `initializeTexture`
- `updateTextures`
- `initializeUniform`
- `updateUniforms`
- `beforeStep`
- `afterStep`
- `beforeDraw`
- `afterDraw`
- `updateResolution`
- `play`
- `pause`
- `reset`
- `destroy`

The hooks most plugins actually need are:

- `_init` for setup after ShaderPad has initialized its internals.
- `beforeStep` or `beforeDraw` for ongoing work.
- `destroy` for cleanup.

## Conventions

- Keep custom events namespaced, such as `autosize:resize` or `myPlugin:ready`
- Plugin installation order is stable: `plugins[]` order controls installation, handler order, and GLSL injection order
- If you mutate shared GL state through `shader.gl`, restore it before returning

If you want to see how first-party plugins use the same public surface, the best starting points are:

- [autosize.ts](https://github.com/miseryco/shaderpad/blob/main/packages/shaderpad/src/plugins/autosize.ts) for lifecycle, events, and cleanup.
- [helpers.ts](https://github.com/miseryco/shaderpad/blob/main/packages/shaderpad/src/plugins/helpers.ts) for pure GLSL injection.
- [face.ts](https://github.com/miseryco/shaderpad/blob/main/packages/shaderpad/src/plugins/face.ts) if you need a larger example that publishes plugin-owned textures.
