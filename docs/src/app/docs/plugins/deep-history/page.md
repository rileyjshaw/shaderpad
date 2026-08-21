---
title: deepHistory
nextjs:
    metadata:
        title: deepHistory
        description: Store deep texture or output history across multiple WebGL texture arrays.
---

Use `deepHistory` when texture or output history is too deep to fit in one WebGL texture array. It splits the history across multiple arrays and provides a convenient GLSL accessor.

## Texture history

```javascript
import deepHistory from 'shaderpad/plugins/deep-history';

const [webcamHistory, updateWebcam] = deepHistory('webcamHistory', video, {
	history: 240,
	chunks: 4,
});

const shader = new ShaderPad(fragmentShaderSrc, { plugins: [webcamHistory] });

shader.play(() => {
	updateWebcam(video);
});
```

Create the plugin before constructing `ShaderPad`, and use the returned update function instead of `shader.updateTextures()` for that source.

## Output history

Pass `SHADER_OUTPUT` as the source to capture the shader’s output.

```javascript
import deepHistory, { SHADER_OUTPUT } from 'shaderpad/plugins/deep-history';

const [outputHistory] = deepHistory('outputHistory', SHADER_OUTPUT, {
	history: 320,
});

const shader = new ShaderPad(fragmentShaderSrc, { plugins: [outputHistory] });
```

An update function is not returned for `SHADER_OUTPUT` since it updates automatically after each step.

`draw()` does not advance output history. `step({ skipHistory: true })` and a `play()` callback that returns `{ skipHistory: true }` skip the capture, just like core output history.

## Options

| Option            | Meaning                                                                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `history: number` | Number of prior frames to keep, analogous to the core `history` option.                                                                          |
| `chunks?: number` | Number of texture arrays to split the history across. Defaults to `2`.                                                                           |
| Texture options   | Standard texture options including format, filtering, wrapping, etc. Don’t pass `format`, `colorSpace`, or `preserveY` if using `SHADER_OUTPUT`. |

Output history always inherits the ShaderPad render format, including integer and floating-point formats, and inherits its filtering and wrapping unless overridden.

{% callout title="Texture unit consumption" %}
Each chunk consumes a texture unit, so use the fewest number of chunks that can fit the history.
{% /callout %}

## Reading history

Use the accessor name you passed to `deepHistory` in GLSL to sample the history:

```glsl
vec4 current = webcamHistory(v_uv, 0);
vec4 older = webcamHistory(v_uv, 30);
```

The first argument is the 2D texture coordinates. The second argument is the age: `0` is the current texture value or most recently captured output, `1` is the previous value, and so on.

{% callout title="Integer formats" %}
Integer texture formats return `uvec4` or `ivec4` instead of `vec4`.
{% /callout %}
