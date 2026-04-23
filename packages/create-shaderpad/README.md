# create-shaderpad

Scaffold a [ShaderPad](https://misery.co/shaderpad/) starter project from a built-in template. Templates include a working fullscreen shader, a [LYGIA](https://lygia.xyz/) setup, and several webcam + [MediaPipe](https://ai.google.dev/edge/mediapipe/solutions/guide) starters.

## Usage

```bash
npm create shaderpad@latest
```

Equivalent direct invocation:

```bash
npx create-shaderpad@latest
```

The CLI can run interactively, or you can choose a template up front:

```bash
npm create shaderpad@latest my-app -- --template basic-ts
```

Skip dependency installation if you only want the files copied:

```bash
npm create shaderpad@latest my-app -- --template basic-ts --skip-install
```

## Templates

- `basic-ts` - Fullscreen fragment shader starter in TypeScript
- `basic-js` - Fullscreen fragment shader starter in JavaScript
- `lygia-ts` - ShaderPad starter with LYGIA imports in TypeScript
- `lygia-js` - ShaderPad starter with LYGIA imports in JavaScript
- `face-ts` - Webcam starter with MediaPipe face tracking in TypeScript
- `face-js` - Webcam starter with MediaPipe face tracking in JavaScript
- `pose-ts` - Webcam starter with MediaPipe pose tracking in TypeScript
- `pose-js` - Webcam starter with MediaPipe pose tracking in JavaScript
- `hands-ts` - Webcam starter with MediaPipe hand tracking in TypeScript
- `hands-js` - Webcam starter with MediaPipe hand tracking in JavaScript
- `segmenter-ts` - Webcam starter with MediaPipe segmentation in TypeScript
- `segmenter-js` - Webcam starter with MediaPipe segmentation in JavaScript

## CLI options

- `--template <name>` - Use a specific template instead of the interactive prompt
- `--skip-install` or `--no-install` - Copy the starter without running `npm install`
- `--help` or `-h` - Show CLI help

## Requirements

- Node.js `>=18`

## What you get

Each starter generates a small Vite project with a `package.json`, a ready-to-run ShaderPad setup, and the right dependencies for the chosen template. The vision templates also include `@mediapipe/tasks-vision`.

After scaffolding:

```bash
cd my-app
npm run dev
```

## Related links

- [ShaderPad docs](https://misery.co/shaderpad/)
- [Quickstart](https://misery.co/shaderpad/docs/getting-started/quickstart/)
- [Examples](https://misery.co/shaderpad/examples/)
