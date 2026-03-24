---
title: AI agent guide
nextjs:
    metadata:
        title: AI agent guide for ShaderPad
        description: A single-page guide for AI agents and coding assistants writing correct ShaderPad programs.
        keywords:
            - ShaderPad
            - AI agent guide
            - LLM instructions
            - coding assistant
            - WebGL2
            - fragment shaders
---

{% callout title="Not for humans" %}
This page is for AI coding agents, not human-first onboarding. If you are using Codex, Cursor, Claude, ChatGPT, or another coding assistant, point the agent here; if you are reading the docs yourself, start with [Quickstart](/docs/getting-started/quickstart) instead. Treat this page as the synthesis layer: use it for routing, defaults, and pattern selection, then open narrower API or plugin pages for exact option names.
{% /callout %}

This page is intentionally table-heavy and recipe-heavy: pick the smallest pattern that fits, then open only the linked deep-dive pages you actually need. The machine-readable entry point is [`/llms.txt`](/llms.txt); if you want a structured page catalog, use [`/llms-index.json`](/llms-index.json); if you want the full docs corpus in one fetch, use [`/llms-full.txt`](/llms-full.txt); if you want local raw example source, use [`/examples/source`](/examples/source). {% .lead %}

## Decision Order

1. Start with one fragment shader and one `ShaderPad` instance.
2. For browser fullscreen work, default to `createFullscreenCanvas()` plus `autosize()`.
3. Add only the built-ins, uniforms, textures, history, or plugins the prompt actually needs.
4. Keep chained passes on one WebGL context whenever possible.
5. Before adding more passes, reduce resolution, history depth, texture bandwidth, or detector work.

## Source Of Truth

Use the smallest source that answers the question precisely.

| Need                                                          | Best source                                                                                                             |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Fast routing, small ingest, top-level rules                   | [`/llms.txt`](/llms.txt)                                                                                                |
| Structured page catalog for tools or retrieval pipelines      | [`/llms-index.json`](/llms-index.json)                                                                                  |
| Bulk ingest of the whole docs corpus                          | [`/llms-full.txt`](/llms-full.txt)                                                                                      |
| Exact page source in raw markdown                             | the matching `.md` mirror, such as [`/docs/getting-started/ai-agent-guide.md`](/docs/getting-started/ai-agent-guide.md) |
| Concrete code patterns and public example source              | [`/examples/source`](/examples/source) and the linked `/examples/source/*.ts` mirrors                                   |
| Exact option names, helper names, uniform names, and behavior | the specific API or plugin page                                                                                         |
| Broader narrative and longer example walkthroughs             | [`README.md`](/README.md)                                                                                               |

If two sources overlap, prefer the narrower one for exact facts. For example, use the plugin page for helper function names and overloads, and use this page for routing, defaults, and recipe selection.

## Smallest Safe Browser Template

Use this when the prompt says “fullscreen shader”, “browser demo”, or “animate a fragment shader”.

```javascript
import ShaderPad from 'shaderpad';
import { createFullscreenCanvas } from 'shaderpad/util';
import autosize from 'shaderpad/plugins/autosize';

const fragmentShaderSrc = `#version 300 es
precision highp float;

in vec2 v_uv;
uniform float u_time;
out vec4 outColor;

void main() {
  outColor = vec4(v_uv, 0.5 + 0.5 * sin(u_time), 1.0);
}`;

const shader = new ShaderPad(fragmentShaderSrc, {
	canvas: createFullscreenCanvas(),
	plugins: [autosize()],
});

shader.play();
```

Add `helpers()` only when you actually need helper GLSL like `fitCover()` or `historyZ()`.

## Hard Rules

| Rule                                                                                                                         | Why                                                              |
| ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Normal fragment shaders must include `#version 300 es`, `precision highp float;`, `in vec2 v_uv;`, and `out vec4 outColor;`. | These are the normal WebGL2 ShaderPad defaults.                  |
| Declare only the built-in uniforms you actually use.                                                                         | Avoid duplicate or stale declarations.                           |
| Call `initializeUniform()` before `updateUniforms()`.                                                                        | Updates do not create uniforms.                                  |
| Call `initializeTexture()` before `updateTextures()`.                                                                        | Updates do not create textures.                                  |
| For live DOM textures like webcam or video, call `updateTextures()` every frame.                                             | The GPU copy does not refresh itself.                            |
| Use `play()` for normal animation, `step()` for manual advancement, and `draw()` only for render-only passes.                | `draw()` does not advance time, frame count, or history.         |
| If you use `helpers()`, do not manually declare `u_resolution`.                                                              | The plugin injects it for you.                                   |
| MediaPipe plugins only read the texture named by `textureName`.                                                              | If the texture name does not match, the detector sees no source. |
| Prefer one WebGL context for chained passes.                                                                                 | Cross-context chaining forces CPU readback and re-upload.        |
| For expensive intermediates, reduce resolution before adding more math.                                                      | This is usually the highest-value performance win.               |
| For masks, IDs, position maps, and other data textures, use the smallest format and `NEAREST` filtering that works.          | This reduces bandwidth and preserves discrete values.            |

## Use This API

| Need                                                                      | Use                                                                        | Notes                                                           |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------- |
| One-time JS value in GLSL                                                 | `initializeUniform(name, type, value)`                                     | Do this before the first update.                                |
| Per-frame JS value in GLSL                                                | `updateUniforms({...})` inside `play()`                                    | Good for animation, UI controls, or sensor input.               |
| Static image, canvas, video, typed array, or another `ShaderPad` as input | `initializeTexture(name, source, options?)`                                | Another `ShaderPad` is the normal multi-pass path.              |
| Refresh a live texture                                                    | `updateTextures({...})`                                                    | Call every frame for webcam or video.                           |
| Output history / feedback                                                 | `history` on the `ShaderPad` constructor                                   | Sample with `u_history` plus `historyZ()` if using `helpers()`. |
| History on one input texture                                              | `initializeTexture(..., { history: N })`                                   | Good for delayed webcam or video effects.                       |
| Advance exactly one frame                                                 | `step(options?)`                                                           | Use this for manual pass ordering.                              |
| Render current state without advancing time, frame, or history            | `draw(options?)`                                                           | Good for pure display passes.                                   |
| Skip writing the current frame into history                               | `skipHistoryWrite: true`                                                   | Works for texture history, output history, and plugin history.  |
| Reset frame/time counters                                                 | `resetFrame()`                                                             | Useful when replay cadence changes.                             |
| Reset frame/time counters and clear history                               | `reset()`                                                                  | Useful after size or topology changes.                          |
| Update only part of a typed-array texture                                 | `updateTextures({ name: { data, width, height, x, y, isPartial: true } })` | Avoid full reuploads when a small region changes.               |

## Pick The Smallest Pattern

| Goal                                               | Default move                                                                    | Performance-first note                                                                 | Good public starting point                                                                                                       |
| -------------------------------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Fullscreen browser shader                          | `createFullscreenCanvas()` plus `autosize()`                                    | Start with one visible canvas and one pass.                                            | [`basic.ts`](/examples/source/basic.ts)                                                                                          |
| Webcam or video compositing                        | One live texture, update it every frame                                         | Use `fitCover()` instead of stretching when aspect ratios differ.                      | [`webcam.ts`](/examples/source/webcam.ts)                                                                                        |
| Shader output feedback or trails                   | Enable `history`, add `helpers()`, sample with `historyZ()`                     | Keep history depth as small as the max delay really needs.                             | [`history.ts`](/examples/source/history.ts)                                                                                      |
| Webcam time delays or RGB echoes                   | Put `{ history: N }` on the webcam texture                                      | Compute `N` from the largest frame offset and stop there.                              | [`webcam-trails.ts`](/examples/source/webcam-trails.ts), [`webcam-channel-trails.ts`](/examples/source/webcam-channel-trails.ts) |
| Face, mouth, eye, or eyebrow region effects        | Use `face()` plus `faceAt()`, `inFace()`, or the specific region helpers        | Use a region helper first, then only do expensive math inside the hit region.          | [`face.ts`](/examples/source/face.ts), [`camo.ts`](/examples/source/camo.ts)                                                     |
| Body region effects                                | Use `pose()` plus `poseAt()` or `inPose()` and `poseLandmark()`                 | `poseAt()` tells you which pose owns a pixel without manual mask decoding.             | [`pose.ts`](/examples/source/pose.ts), [`camo.ts`](/examples/source/camo.ts)                                                     |
| Generic segmentation recolor or cutout             | Use `segmenter()` plus `segmentAt()`                                            | Request `outputConfidenceMasks` only if the shader uses category or confidence.        | [`segmenter.ts`](/examples/source/segmenter.ts)                                                                                  |
| Gesture trails from landmarks                      | Put `history` on the plugin options, then use helper overloads with `framesAgo` | Before increasing history depth, try decimating writes with `skipHistoryWrite`.        | [`finger-pens.ts`](/examples/source/finger-pens.ts)                                                                              |
| Two-pass compositing                               | Pass the first `ShaderPad` into the second as a texture                         | Keep the same source object and matching plugin config so detector work can be shared. | [`mediapipe-chaining.ts`](/examples/source/mediapipe-chaining.ts)                                                                |
| Low-bandwidth preprocessing                        | Use an offscreen pass with a smaller canvas and a smaller format                | `R8` plus `NEAREST` is often enough for masks or grayscale.                            | [`single-channel-textures.ts`](/examples/source/single-channel-textures.ts)                                                      |
| Heavy blur, glow, simulation, or sorting pipelines | Build a composite object that owns several internal `ShaderPad` passes          | Keep one context, shrink intermediates, cap iterations, and show only the final pass.  | See the recipes below.                                                                                                           |

## Vision Plugin Quick Map

All four MediaPipe plugins require `npm install @mediapipe/tasks-vision`, and all four require the configured `textureName` to match the actual initialized live texture name.

| Plugin        | Use when                                              | Fast region helper                             | Point helper                                      | History support                                                                     |
| ------------- | ----------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `face()`      | face masks, eyes, mouth, eyebrows, facial centers     | `inFace()`, `faceAt()`, `eyeAt()`, `mouthAt()` | `faceLandmark()`                                  | Set `options.history` if you need older face masks or landmarks.                    |
| `pose()`      | body ownership, body masks, torso/limb anchors        | `inPose()`, `poseAt()`                         | `poseLandmark()`                                  | Helper overloads accept `framesAgo` when `history` is enabled.                      |
| `segmenter()` | foreground/background or category-based segmentation  | `segmentAt()`                                  | none                                              | `segmentAt(..., framesAgo)` works when `history` is enabled.                        |
| `hands()`     | fingertips, handedness, hand centers, gesture anchors | none                                           | `handLandmark()`, `isLeftHand()`, `isRightHand()` | Very powerful for trails, but keep history depth and write frequency under control. |

## Format And Filter Defaults

| Texture role                                                | Good default                                |
| ----------------------------------------------------------- | ------------------------------------------- |
| Ordinary color compositing                                  | `RGBA8` with `LINEAR`                       |
| Single-channel masks or grayscale                           | `R8` with `NEAREST`                         |
| Float accumulation, halation, or trails                     | `RGBA16F` with `HALF_FLOAT`                 |
| Scalar float data                                           | `R32F` with `NEAREST`                       |
| Integer IDs, coordinates, acceptance maps, or position maps | `R32UI`, `RG16I`, or `RG32I` with `NEAREST` |

Use `RGBA32F` only when half-float or single-channel formats are not enough.

## Recipes

These recipes are distilled from the public examples plus larger real-world ShaderPad pipelines. They focus on structure, not on app scaffolding or effect-specific math.

### Recolor Part Of A Segmenter Result

Use this for “change hair color”, “tint only the foreground”, or “highlight segmented regions”.

```javascript
import ShaderPad from 'shaderpad';
import segmenter from 'shaderpad/plugins/segmenter';

const shader = new ShaderPad(fragmentShaderSrc, {
	canvas,
	plugins: [
		segmenter({
			textureName: 'u_webcam',
			options: {
				outputConfidenceMasks: true,
			},
		}),
	],
});

shader.initializeTexture('u_webcam', video);
shader.play(() => {
	shader.updateTextures({ u_webcam: video });
});
```

```glsl
uniform sampler2D u_webcam;
uniform int u_numCategories;

void main() {
  vec3 color = texture(u_webcam, v_uv).rgb;

  vec2 seg = segmentAt(v_uv);
  float confidence = seg.x;
  int category = int(floor(seg.y * float(u_numCategories - 1) + 0.5));
  float isForeground = float(category != 0) * confidence;

  color = mix(color, vec3(0.0, 1.0, 0.4), isForeground * 0.35);
  outColor = vec4(color, 1.0);
}
```

Use a custom `modelPath` when you need a domain-specific segmentation model. If you only need a flat mask and not category/confidence blending, avoid `outputConfidenceMasks` to keep the output smaller and simpler.

### Distort Or Recolor Relative To A Tracked Face Or Body Center

Use this for “camouflage”, “magnify the face”, “pixelate only the head”, or “shift pixels around a body center”.

```glsl
uniform sampler2D u_webcam;

void main() {
  vec3 color = texture(u_webcam, v_uv).rgb;
  vec2 faceHit = faceAt(v_uv);

  if (faceHit.x > 0.0) {
    int i = int(faceHit.y);
    vec2 center = vec2(faceLandmark(i, FACE_LANDMARK_FACE_CENTER));
    vec2 delta = v_uv - center;
    float lenDelta = max(length(delta), 1e-5);
    vec2 dir = delta / lenDelta;

    vec2 px = 1.0 / vec2(textureSize(u_webcam, 0));
    vec2 sampleUV = v_uv + dir * 20.0 * px;
    color = texture(u_webcam, sampleUV).rgb;
  }

  outColor = vec4(color, 1.0);
}
```

The structure matters more than the exact numbers:

- Use `faceAt()` or `poseAt()` once to determine ownership.
- Use `faceLandmark()` or `poseLandmark()` for the anchor point.
- Convert pixel offsets to UV with `1.0 / textureSize(...)`.
- Do not loop over every landmark per pixel unless the effect truly needs it.

### Delay Or Echo Live Input With Texture History

Use this for RGB channel offsets, webcam echoes, row/column delays, or tiled time slices.

```javascript
import ShaderPad from 'shaderpad';
import helpers from 'shaderpad/plugins/helpers';

const MAX_DELAY = 30;

const shader = new ShaderPad(fragmentShaderSrc, {
	canvas,
	plugins: [helpers()],
});

shader.initializeTexture('u_webcam', video, { history: MAX_DELAY });
shader.play(() => {
	shader.updateTextures({ u_webcam: video });
});
```

```glsl
uniform highp sampler2DArray u_webcam;
uniform int u_webcamFrameOffset;

void main() {
  vec2 uv = fitCover(vec2(1.0 - v_uv.x, v_uv.y), vec2(textureSize(u_webcam, 0)));

  vec3 now = texture(u_webcam, vec3(uv, historyZ(u_webcam, u_webcamFrameOffset, 0))).rgb;
  vec3 past = texture(u_webcam, vec3(uv, historyZ(u_webcam, u_webcamFrameOffset, 12))).rgb;

  outColor = vec4(now.r, past.g, past.b, 1.0);
}
```

Compute the history depth from the largest frame offset you actually sample. If the maximum delay is `12`, do not allocate `120`.

### Use Plugin History, But Write To It Sparingly

Use this for landmark trails, gesture drawing, and any effect that samples older MediaPipe landmarks or masks.

```javascript
import ShaderPad from 'shaderpad';
import helpers from 'shaderpad/plugins/helpers';
import hands from 'shaderpad/plugins/hands';

const HISTORY = 120;

const shader = new ShaderPad(fragmentShaderSrc, {
	canvas,
	plugins: [
		helpers(),
		hands({
			textureName: 'u_webcam',
			options: { maxHands: 1, history: HISTORY },
		}),
	],
});

shader.initializeTexture('u_webcam', video);
shader.play((_time, frame) => {
	const options = { skipHistoryWrite: frame % 4 !== 0 };
	shader.updateTextures({ u_webcam: video }, options);
	return options;
});
```

```glsl
vec2 current = vec2(handLandmark(0, INDEX_FINGER_TIP));
vec2 older = vec2(handLandmark(0, INDEX_FINGER_TIP, 8));
```

If the effect still looks good with every fourth or fifth frame stored, do that before increasing history depth.

### Share One Detector Across Multiple Passes

Use this when multiple passes need the same face, pose, hands, or segmenter data.

```javascript
const passA = new ShaderPad(fragmentA, {
	canvas: sharedCanvas,
	plugins: [face({ textureName: 'u_webcam', options: { maxFaces: 3 } })],
});

const passB = new ShaderPad(fragmentB, {
	canvas: sharedCanvas,
	plugins: [face({ textureName: 'u_webcam', options: { maxFaces: 3 } })],
});

passA.initializeTexture('u_webcam', video);
passB.initializeTexture('u_webcam', video);
passB.initializeTexture('u_passA', passA);

passB.play(() => {
	passA.updateTextures({ u_webcam: video });
	passB.updateTextures({ u_webcam: video });
	passA.step();
	passB.updateTextures({ u_passA: passA });
});
```

Detector batching works best when these all match across passes:

- plugin type
- `textureName`
- detector setup options
- underlying source object, such as the same `HTMLVideoElement`

### Run An Expensive Blur Or Composite Pipeline

Use this for masked blur, bloom, glow, or any effect where most of the cost is in intermediate convolution passes.

```javascript
const blurDown = new ShaderPad(blurDownFrag, {
	canvas: { width: 512, height: 512 },
	plugins: [helpers()],
});

const blurUp = new ShaderPad(blurUpFrag, {
	canvas: { width: 512, height: 512 },
	plugins: [helpers()],
});

const main = new ShaderPad(compositeFrag, {
	canvas,
	plugins: [helpers(), autosize(), segmenter({ textureName: 'u_webcam' })],
});

blurDown.initializeTexture('u_input', video);
blurUp.initializeTexture('u_input', blurDown);
main.initializeTexture('u_blurred', blurUp);
main.initializeTexture('u_webcam', video);

main.play(() => {
	main.updateTextures({ u_webcam: video });

	blurDown.updateTextures({ u_input: video });
	blurDown.step();

	blurUp.updateTextures({ u_input: blurDown });
	blurUp.step();

	main.updateTextures({ u_blurred: blurUp });
});
```

Performance rules for this pattern:

- Keep intermediates smaller than the final output.
- Keep all passes on one context if you can; if different pass sizes make separate offscreen passes simpler, make those intermediates much smaller.
- Only the final composite needs to be visible.
- If resize matters, resize the intermediate canvases too.
- Put history only on the pass or plugin that really needs it.

### Run An Iterative Data Pipeline

Use this for field simulations, iterative refinement, or GPU data-map pipelines such as sorting, diffusion, or acceptance maps.

```javascript
const chainOpts = {
	canvas: sharedCanvas,
	plugins: [helpers()],
	minFilter: 'NEAREST',
	magFilter: 'NEAREST',
};

const score = new ShaderPad(scoreFrag, {
	...chainOpts,
	internalFormat: 'RG16I',
	format: 'RG_INTEGER',
	type: 'SHORT',
});

const state = new ShaderPad(stateFrag, {
	...chainOpts,
	history: 1,
	internalFormat: 'R32UI',
	format: 'RED_INTEGER',
	type: 'UNSIGNED_INT',
});

const output = new ShaderPad(outputFrag, {
	canvas,
	plugins: [helpers(), autosize()],
});

score.initializeTexture('u_state', state);
state.initializeTexture('u_score', score);
output.initializeTexture('u_state', state);

output.play(() => {
	for (let i = 0; i < iterationsPerFrame; i++) {
		score.updateTextures({ u_state: state });
		score.step();

		state.updateTextures({ u_score: score });
		state.step();
	}

	output.updateTextures({ u_state: state });
});
```

Use this structure when the effect is fundamentally “update a data structure, then visualize it”.

- Use integer or single-channel formats for non-color data.
- Use `NEAREST` for data maps.
- Keep a fixed iteration budget per frame.
- If resolution, pixel size, or topology changes invalidate the state, call `resetFrame()` or `reset()`.
- When possible, run the solver at a smaller resolution than the final composite.

### Turn Plugin Results Into A CPU-Drawn Overlay Texture

Use this when the plugin gives you landmarks, but the cheapest or simplest overlay is easier to rasterize in JS than in GLSL.

```javascript
const overlay = document.createElement('canvas');
overlay.width = overlay.height = 1024;
const ctx = overlay.getContext('2d');

const shader = new ShaderPad(fragmentShaderSrc, {
	canvas,
	plugins: [face({ textureName: 'u_webcam', options: { maxFaces: 3 } })],
});

shader.initializeTexture('u_overlay', overlay);

shader.on('face:result', result => {
	drawFaceMeshToCanvas(ctx, result.faceLandmarks);
	shader.updateTextures({ u_overlay: overlay });
});
```

This is often better than building a second detector or encoding a lot of 2D line logic in the fragment shader. The detector already ran; reuse the result event.

## Common Failure Modes

| Symptom                                   | Usually this means                                                                                                                         |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Shader compiles badly                     | Missing `#version 300 es`, missing `out vec4 outColor;`, or duplicate `u_resolution` because `helpers()` already injected it.              |
| Effect renders black                      | `play()` was never called, a live texture was never updated, or the shader is sampling the wrong texture name.                             |
| History-dependent effect stays frozen     | The pass is using `draw()` instead of `play()` or `step()`, or history writes are being skipped.                                           |
| Vision plugin appears inactive            | The `@mediapipe/tasks-vision` package is missing, `textureName` does not match the real texture, or the live texture is not being updated. |
| Multi-pass pipeline is unexpectedly slow  | Passes are on different WebGL contexts, intermediates are full resolution, or data textures use bigger formats than necessary.             |
| Landmark or mask history is too expensive | History depth is too large, or frames are being written more often than the effect needs.                                                  |

## Recommended Reading Order

When you need more than this page, pull context in this order:

1. [Quickstart](/docs/getting-started/quickstart)
2. [ShaderPad API](/docs/api/shaderpad)
3. [Methods](/docs/api/methods)
4. [Built-in inputs](/docs/core-concepts/built-in-inputs)
5. [History](/docs/core-concepts/history), if the effect depends on previous frames
6. [Performance](/docs/guides/performance), if the task is multi-pass, high-resolution, or MediaPipe-heavy
7. [Chaining shaders](/docs/guides/chaining-shaders), if the effect is multi-pass
8. The specific plugin page, but only if you are actually using that plugin
