---
title: React
nextjs:
    metadata:
        title: React
        description: Use ShaderPad as a React component through the `shaderpad/react` export.
---

The `shaderpad/react` export wraps the normal ShaderPad canvas lifecycle in a React component. It owns the canvas element, enables `autosize()` by default, pauses and resumes with visibility changes, and still gives you direct access to the underlying ShaderPad instance when you need it. {% .lead %}

If you want the full prop and ref reference, read the [React API page](/docs/api/react).

## Example usage

```tsx
'use client';

import { ShaderPad } from 'shaderpad/react';

const shader = `#version 300 es
precision highp float;

in vec2 v_uv;
uniform float u_time;
uniform vec2 u_resolution;
out vec4 outColor;

void main() {
  vec2 uv = v_uv * 2.0 - 1.0;
  uv.x *= u_resolution.x / u_resolution.y;

  float glow = 0.25 / max(length(uv), 0.001);
  vec3 color = 0.5 + 0.5 * cos(u_time + uv.xyx + vec3(0.0, 2.0, 4.0));
  outColor = vec4(color * glow, 1.0);
}`;

export default function ReactExample() {
  return (
    <div style={{ height: 320 }}>
      <ShaderPad shader={shader} />
    </div>
  );
}
```

{% react-preview /%}

## Client Components

Use the wrapper from a client component:

```tsx
'use client';

import { ShaderPad } from 'shaderpad/react';
```

## Common Patterns

{% callout title="Autosize ownership" %}
If you want the wrapper to own resizing, leave `autosize` alone and pass your other plugins through `plugins`. If you need to install your own `autosize()` instance, disable wrapper autosize first with `autosize={false}`.
{% /callout %}

### Extra plugins and options

Pass extra plugins through `plugins` and any remaining core constructor options through `options`.

```tsx
'use client';

import { ShaderPad } from 'shaderpad/react';
import helpers from 'shaderpad/plugins/helpers';

export default function HistoryExample() {
  return (
    <div style={{ height: 280 }}>
      <ShaderPad
        shader={shader}
        plugins={[helpers()]}
        options={{ history: 8 }}
      />
    </div>
  );
}
```

### `onInit` And `onBeforeStep`

Use `onInit` for setup such as custom uniforms or textures. Use `onBeforeStep` for per-frame updates.

```tsx
<ShaderPad
  shader={shader}
  onInit={shader => {
    shader.initializeUniform('u_accent', 'float', [0.0, 1.0, 0.5]);
  }}
  onBeforeStep={(shader, time) => {
    shader.updateUniforms({
      u_accent: [0.4 + 0.4 * Math.sin(time), 1.0, 0.6],
    });
  }}
/>
```

### Events and visibility

Use `events` for core or plugin events, and `onOnscreenChange` when you only care about visibility state.

```tsx
<ShaderPad
  shader={shader}
  events={{
    updateUniforms: (updates, options) => {
      console.log('uniforms', updates, options);
    },
    'autosize:resize': (width, height) => {
      console.log('autosize', width, height);
    },
  }}
  onOnscreenChange={isOnscreen => {
    console.log('visible', isOnscreen);
  }}
/>
```

### Imperative refs

Use a ref when you want direct control over playback or the underlying ShaderPad instance.

```tsx
'use client';

import { useRef } from 'react';
import { ShaderPad } from 'shaderpad/react';

export default function RefExample() {
  const shaderRef = useRef<React.ElementRef<typeof ShaderPad>>(null);

  return (
    <>
      <button type="button" onClick={() => shaderRef.current?.pause()}>
        Pause
      </button>
      <button type="button" onClick={() => shaderRef.current?.play()}>
        Play
      </button>
      <div style={{ height: 280 }}>
        <ShaderPad ref={shaderRef} shader={shader} />
      </div>
    </>
  );
}
```

### When the wrapper rebuilds

The wrapper recreates the underlying ShaderPad instance when these configuration-like inputs change:

- `shader`
- `plugins`
- `options`
- `autosize`
- `cursorTarget`

Keep `plugins` arrays, `options` objects, and custom `autosize` objects stable unless you intend to reconfigure the instance. Callback props and `events` handlers stay live without forcing a rebuild.

---

The full prop list, ref methods, defaults, and runtime behavior are documented on the [React API page](/docs/api/react).
