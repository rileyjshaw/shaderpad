---
title: React
nextjs:
    metadata:
        title: React
        description: Use ShaderPad as a React component through the shaderpad/react adapter.
---

The `shaderpad/react` export is a small React wrapper around the core `ShaderPad` constructor. It renders one managed `<canvas>`, handles autosize and managed playback by default, and gives you direct access to the underlying instance when you need it. {% .lead %}

If you want the exact prop and ref reference, read the [React API page](/docs/api/react).

## Example

```tsx
'use client';
import ShaderPad from 'shaderpad/react';

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

## Common Patterns

### Extra plugins and options

The `autosize` plugin is included by default. Pass extra plugins through `plugins` and any remaining core constructor options through `options`.

```tsx
'use client';

import ShaderPad from 'shaderpad/react';
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

{% callout title="Autosize ownership" %}
If you want the wrapper to own resizing, leave `autosize` alone and pass your other plugins through `plugins`. If you need to install your own `autosize()` instance, disable wrapper autosize first with `autosize={false}`.
{% /callout %}

### `onInit` and `onBeforeStep`

Use `onInit` for setup such as custom uniforms or textures. Use `onBeforeStep` for per-frame updates and to return optional `StepOptions`.

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

### Texture children

React supports declarative texture children with `data-texture` attributes.

```tsx
<ShaderPad shader={shader}>
  <img data-texture="u_frame" src="/frame.png" alt="" />
  <video data-texture="u_webcam" src="/camera.mp4" muted playsInline />
  <canvas data-texture="u_overlay" width={512} height={512} />
</ShaderPad>
```

Texture option props use the `data-texture-*` prefix:

```tsx
<video
  data-texture="u_trail"
  data-texture-history={24}
  data-texture-preserve-y={false}
  src="/trail.mp4"
  muted
  playsInline
  autoPlay
  loop
/>
```

Nested `<ShaderPad>` children are managed by the parent and can be used for multipass rendering:

```tsx
<ShaderPad shader={compositeShader}>
  <ShaderPad shader={passShader} data-texture="u_pass" />
</ShaderPad>
```

For live sources such as video, canvas, and nested `<ShaderPad>`, the wrapper refreshes the texture before each rendered frame.

### Playback

The wrapper autoplays by default, and automatically pauses playback when offscreen. Disable either behavior with their corresponding props:

```tsx
<ShaderPad shader={shader} autoplay={false} autopause={false} />
```

`autopause` only applies to autoplay. If `autoplay={false}` and you call `ref.current?.play()`, that playback is yours to pause or resume.

### Core and plugin events

For events that are not represented by React props, use the underlying instance and normal `shader.on(...)` subscriptions.

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import ShaderPad from 'shaderpad/react';

export default function EventExample() {
  const shaderRef = useRef<React.ElementRef<typeof ShaderPad>>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const shader = shaderRef.current?.shader;
    if (!shader) return;

    const handleResize = (width: number, height: number) => {
      console.log('autosize', width, height);
    };

    shader.on('autosize:resize', handleResize);
    return () => shader.off('autosize:resize', handleResize);
  }, [ready]);

  return <ShaderPad ref={shaderRef} shader={shader} onInit={() => setReady(true)} />;
}
```

### Imperative refs

Use a ref when you want direct control over playback or the underlying ShaderPad instance.

```tsx
'use client';

import { useRef } from 'react';
import ShaderPad from 'shaderpad/react';

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

### Unstable props can cause a rebuild

The wrapper creates a new ShaderPad instance when core setup props such as these change:

- `shader`
- `cursorTarget`
- `plugins`
- `options`
- `autosize`

Keep `plugins`, `options`, and custom `autosize` values stable unless you want a fresh instance. Callback props and playback props update without recreating the instance.

---

For more detailed coverage, read the [React API page](/docs/api/react).
