import Link from 'next/link'
import type { ReactNode } from 'react'

type ExampleDetails = {
  credit?: ReactNode
  fullDescription: ReactNode
}

const docs = {
  autosize: '/docs/plugins/autosize',
  builtInInputs: '/docs/core-concepts/built-in-inputs',
  canvasAndInput: '/docs/core-concepts/canvas-and-input',
  chainingShaders: '/docs/guides/chaining-shaders',
  face: '/docs/plugins/face',
  hands: '/docs/plugins/hands',
  helpers: '/docs/plugins/helpers',
  history: '/docs/core-concepts/history',
  pose: '/docs/plugins/pose',
  save: '/docs/plugins/save',
  savingImages: '/docs/guides/saving-images',
  segmenter: '/docs/plugins/segmenter',
  shaderLifecycle: '/docs/core-concepts/shader-lifecycle',
  textures: '/docs/core-concepts/textures',
  uniforms: '/docs/core-concepts/uniforms',
  utilities: '/docs/api/utilities',
  webcamInput: '/docs/guides/webcam-input',
  webcamTrails: '/docs/examples/demos/webcam-trails',
} as const

function DocLink({
  href,
  children,
}: {
  href: string
  children: ReactNode
}) {
  return <Link href={href}>{children}</Link>
}

function CodeDocLink({
  href,
  children,
}: {
  href: string
  children: ReactNode
}) {
  return (
    <DocLink href={href}>
      <code>{children}</code>
    </DocLink>
  )
}

function ExtLink({
  href,
  children,
}: {
  href: string
  children: ReactNode
}) {
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  )
}

const exampleDetails: Record<string, ExampleDetails> = {
  basic: {
    fullDescription: (
      <>
        <p>
          This is the smallest "real" browser setup in the examples: a fullscreen
          canvas created with{' '}
          <CodeDocLink href={docs.utilities}>createFullscreenCanvas</CodeDocLink> and
          kept in sync with the viewport by{' '}
          <CodeDocLink href={docs.autosize}>autosize</CodeDocLink>. Resize the window,
          move the pointer around, and click to see how the shader responds
          to canvas size changes and live input without any surrounding app code.
        </p>
        <p>
          The shader uses several{' '}
          <DocLink href={docs.builtInInputs}>
            built-in inputs
          </DocLink>{' '}
          such as <code>u_time</code>, <code>u_resolution</code>, <code>u_cursor</code>, and <code>u_click</code>, plus a{' '}
          <DocLink href={docs.uniforms}>
            custom color uniform
          </DocLink>
          .
        </p>
      </>
    ),
  },
  webcam: {
    fullDescription: (
      <>
        <p>
          This is a simple live-texture composite: it loads the webcam, uploads
          it with{' '}
          <CodeDocLink href={docs.textures}>initializeTexture</CodeDocLink> and{' '}
          <CodeDocLink href={docs.textures}>updateTextures</CodeDocLink>
          , then blends it with a transparent picture-frame image. It follows the
          same pattern shown in the{' '}
          <DocLink href={docs.webcamInput}>webcam input guide</DocLink>.
        </p>
        <p>
          There is no history, no extra pass, and no plugin state here - just
          one shader combining a static texture with a live one. It is useful
          for stickers, overlays, or simple camera compositing.
        </p>
      </>
    ),
  },
  'single-channel-textures': {
    fullDescription: (
      <>
        <p>
          This shows how single-channel textures can be used, stored to {' '}
          <DocLink href={docs.history}>history</DocLink>, and rendered. The
          first pass renders the webcam into an <code>R8</code> offscreen
          texture. The second pass samples that ShaderPad instance via{' '}
          <CodeDocLink href={docs.textures}>initializeTexture</CodeDocLink>.
          Single-channel data can be passed between ShaderPads and read back
          like any other texture.
        </p>
        <p>
          A brief history delay is added between the left and right halves to
          show that they are reading from different parts of the chain.
        </p>
      </>
    ),
  },
  sway: {
    fullDescription: (
      <>
        <p>
          This demo has seven uniforms controlling its animation behavior, from
          maximum sway angle to whether it uses color. These values are 
          organized into “presets” and swapped with a single {' '}
          <CodeDocLink href={docs.uniforms}>updateUniforms</CodeDocLink> call.
        </p>
        <p>
          Swipe or use <code>Left Arrow</code> and <code>Right Arrow</code> to cycle
          through presets, and press <code>Space</code> to pause or resume. It
          shows how to get multiple looks out of one shader with a small set of
          uniforms.
        </p>
      </>
    ),
  },
  selfie: {
    fullDescription: (
      <>
        <p>
          Selfie is a practical template using the{' '}
          <DocLink href={docs.save}>save plugin</DocLink>. It sets up a
          fullscreen webcam view with{' '}
          <CodeDocLink href={docs.utilities}>createFullscreenCanvas</CodeDocLink>,{' '}
          <CodeDocLink href={docs.autosize}>autosize</CodeDocLink>, and{' '}
          <CodeDocLink href={docs.helpers}>fitCover</CodeDocLink> to fill the screen
          without stretching.
        </p>
        <p>
          Click the on-screen <code>Save</code> button to call{' '}
          <CodeDocLink href={docs.save}>save</CodeDocLink> with a filename and caption.
          For the API details, read the{' '}
          <DocLink href={docs.savingImages}>saving images guide</DocLink>.
        </p>
      </>
    ),
  },
  'cursor-feedback': {
    fullDescription: (
      <>
        <p>
          This ShaderPad instance enables a 25-frame{' '}
          <DocLink href={docs.history}>output history</DocLink> and tiles it into
          a 5x5 grid. The bottom-right is the newest stored frame, the top-left
          is the oldest, and the rest are sampled in-between.
        </p>
        <p>
          The large red cursor is the only live input. The rest of the dots are
          the shader feeding back on itself through history.
        </p>
      </>
    ),
  },
  'history-tiles': {
    fullDescription: (
      <>
        <p>
          This is the simplest example using{' '}
          <DocLink href={docs.history}>output history</DocLink>. The
          shader flashes a new solid color for the first 4 frames. On the 5th frame, it samples
          the stored frames using{' '}
          <CodeDocLink href={docs.helpers}>historyZ</CodeDocLink> and arranges them in
          a grid. After the 5th frame, the demo pauses so you can inspect it.
        </p>
      </>
    ),
  },
  'webcam-trails': {
    fullDescription: (
      <>
        <p>
          This demo applies per-texture{' '}
          <DocLink href={docs.history}>history</DocLink> to the webcam itself,
          then accumulates several delayed samples into a soft echo trail. It
          uses <CodeDocLink href={docs.utilities}>createFullscreenCanvas</CodeDocLink>,{' '}
          <CodeDocLink href={docs.autosize}>autosize</CodeDocLink>, and{' '}
          <CodeDocLink href={docs.helpers}>helpers</CodeDocLink> so the shader can use{' '}
          <CodeDocLink href={docs.helpers}>fitCover</CodeDocLink> and{' '}
          <CodeDocLink href={docs.helpers}>historyZ</CodeDocLink> without extra setup.
        </p>
        <p>
          The eased frame offsets keep the newer echoes tighter and the older
          ones farther apart, so motion feels smeared instead of simply repeated.
        </p>
      </>
    ),
  },
  'webcam-channel-trails': {
    fullDescription: (
      <>
        <p>
          This demo is a slight variation on the <DocLink href={docs.webcamTrails}>webcam trails demo</DocLink>. It
          demonstrates that history frames don’t need to be rendered exactly as they’re sampled. Here, each frame is pulled using <CodeDocLink href={docs.helpers}>historyZ</CodeDocLink> and
          reduced to a single color channel before rendering.
        </p>
      </>
    ),
  },
  'reading-history': {
    fullDescription: (
      <>
        <p>
          This visualizes a rolling {' '}
          <DocLink href={docs.history}>history framebuffer</DocLink>. The grey circle
          illustrates history buffer access with{' '}
          <CodeDocLink href={docs.helpers}>historyZ</CodeDocLink>. The yellow, red,
          and blue circles show direct access through static indices.
        </p>
        <p>As you can see from the colored circles, accessing a static index will produce the same image until the buffer rolls over and overwrites it. For smooth, “N frames ago” access, use <CodeDocLink href={docs.helpers}>historyZ</CodeDocLink>.</p>
      </>
    ),
  },
  'webcam-grid': {
    fullDescription: (
      <>
        <p>
          This demo visualizes webcam history as a timeline. It uses the webcam’s{' '}
          <DocLink href={docs.textures}>texture history</DocLink> and{' '}
          <CodeDocLink href={docs.helpers}>historyZ</CodeDocLink> to assign each cell
          in the grid to an older frame.
        </p>
      </>
    ),
  },
  'face-detection': {
    fullDescription: (
      <>
        <p>
          This is the main "what does the face plugin expose?" demo. It uses the{' '}
          <CodeDocLink href={docs.face}>face</CodeDocLink> plugin to draw region masks,
          facial landmarks, and debug overlays in one pass, including brows,
          eyes, mouth regions, and the face mask texture in the corner.
        </p>
        <p>
          It shows both levels of the API at once: region helpers such as{' '}
          <CodeDocLink href={docs.face}>faceAt</CodeDocLink> and raw landmark access.
          On touch devices, double-tap to switch cameras.
        </p>
      </>
    ),
  },
  camo: {
    fullDescription: (
      <>
        <p>
          Camo combines the <DocLink href={docs.face}>face plugin</DocLink>, the{' '}
          <DocLink href={docs.pose}>pose plugin</DocLink>, and output{' '}
          <DocLink href={docs.history}>history</DocLink> in one toggleable demo.
          Switch between face and body mode to see the same camouflage idea driven
          by different tracked regions.
        </p>
        <p>
          It still stays in one pass. With <CodeDocLink href={docs.helpers}>helpers</CodeDocLink>
          , one history frame, and a small overlay UI, it becomes a compact recipe
          for invisibility-style effects without a full segmentation pipeline.
        </p>
      </>
    ),
  },
  'mediapipe-chaining': {
    fullDescription: (
      <>
        <p>
          MediaPipe chaining is the best example here for{' '}
          <DocLink href={docs.chainingShaders}>multi-pass ShaderPad chaining</DocLink>
          . The first pass renders webcam stripes inside the face region, and the
          second pass samples that first ShaderPad instance as a texture via{' '}
          <CodeDocLink href={docs.textures}>initializeTexture</CodeDocLink> before
          adding a complementary effect outside the face.
        </p>
        <p>
          It also demonstrates deliberate pass ordering: pass A advances with{' '}
          <CodeDocLink href={docs.shaderLifecycle}>step</CodeDocLink>, then pass B reads
          its fresh output in the same loop. Both passes use the same{' '}
          <CodeDocLink href={docs.face}>face</CodeDocLink> setup, so it is a clear
          example of face-aware compositing.
        </p>
      </>
    ),
  },
  'pose-detection': {
    fullDescription: (
      <>
        <p>
          Pose detection is the equivalent of the face debug example for the{' '}
          <DocLink href={docs.pose}>pose plugin</DocLink>. It overlays tracked
          landmarks, color-coded body regions, and a pose-mask preview, all on
          top of the live webcam feed.
        </p>
        <p>
          It shows the difference between higher-level region queries and raw
          landmark access in one file, which makes it a straightforward place to
          start for
          pose-based effects.
        </p>
      </>
    ),
  },
  'background-blur': {
    fullDescription: (
      <>
        <p>
          This example uses the <DocLink href={docs.segmenter}>segmenter plugin</DocLink>{' '}
          with the selfie segmentation model as a matte for a compact Dual
          Kawase blur pipeline. A few small offscreen passes build the blur
          efficiently, then the final pass keeps the segmented foreground sharp
          over the mirrored webcam feed.
        </p>
        <p>
          It is a good reference for multi-pass webcam compositing when you want
          a cleaner person outline than pose masks usually give, without paying
          for a huge one-pass kernel.
        </p>
      </>
    ),
  },
  'hand-detection': {
    fullDescription: (
      <>
        <p>
          This is the simplest demonstration of the{' '}
          <DocLink href={docs.hands}>hands plugin</DocLink>. It draws colored
          dots on the fingertips plus a center marker for each detected hand,
          making it easy to see the landmark layout and handedness at a glance.
        </p>
        <p>
          If you are about to build gestures, brushes, or music controls, this
          gives you a clean debugging view first.
        </p>
      </>
    ),
  },
  elastics: {
    fullDescription: (
      <>
        <p>
          Elastics turns the{' '}
          <DocLink href={docs.hands}>hands plugin</DocLink> into a stylized glow
          renderer. Instead of only marking points, it builds variable-width
          segments between thumb, index, and middle fingertips, then blends that
          glow back over the live camera image.
        </p>
        <p>
          Once the landmarks are available, the rest is just geometry and falloff
          in GLSL. It shows how to turn tracked points into something more
          expressive than debug dots.
        </p>
      </>
    ),
  },
  'finger-pens': {
    fullDescription: (
      <>
        <p>
          This demo combines plugin landmark history with visual history
          compression. The{' '}
          <DocLink href={docs.hands}>hands plugin</DocLink> is configured with
          its own <DocLink href={docs.history}>history</DocLink>, and the shader
          samples older landmark positions to connect strokes from whichever
          fingertip is currently farthest from the thumb.
        </p>
        <p>
          It is also a good performance example. The render loop returns{' '}
          <CodeDocLink href={docs.history}>skipHistoryWrite</CodeDocLink> from{' '}
          <CodeDocLink href={docs.shaderLifecycle}>play</CodeDocLink> so history is
          only written every few frames. The active fingertip changes color, so
          you can see the gesture-selection logic while drawing.
        </p>
      </>
    ),
  },
  'midi-fingers': {
    fullDescription: (
      <>
        <p>
          MIDI fingers is half visualizer and half controller. It uses the{' '}
          <DocLink href={docs.hands}>hands plugin</DocLink> for tracked
          fingertips, then mirrors those finger-to-thumb distances into Web MIDI
          control changes in JavaScript. The overlay on screen helps you see the
          same values you are sending to your synth or DAW.
        </p>
        <p>
          The current mapping is{' '}
          <code>41-43</code> for selected left-hand fingers and{' '}
          <code>44-47</code> for selected right-hand fingers. It sends to the
          first available MIDI output.
        </p>
      </>
    ),
  },
  segmenter: {
    fullDescription: (
      <>
        <p>
          Segmenter demonstrates the{' '}
          <DocLink href={docs.segmenter}>segmenter plugin</DocLink> as both a
          high-level query and a raw mask source. The shader reads category and
          confidence through <CodeDocLink href={docs.segmenter}>segmentAt</CodeDocLink>
          , then also previews the full segmentation mask in the corner.
        </p>
        <p>
          It helps show what the plugin is actually returning before doing more
          ambitious compositing. This demo also
          enables confidence masks explicitly.
        </p>
      </>
    ),
  },
  'god-rays': {
    credit: (
      <>
        Credit:{' '}
        <ExtLink href="https://github.com/Erkaman/glsl-godrays/blob/master/example/index.js">
          Ricky Reusser&apos;s god-rays example
        </ExtLink>{' '}
        from <ExtLink href="https://shaderbooth.com/">Max Bittker&apos;s Shaderbooth</ExtLink>
      </>
    ),
    fullDescription: (
      <>
        <p>
          God Rays combines the <DocLink href={docs.face}>face plugin</DocLink>{' '}
          and the <DocLink href={docs.hands}>hands plugin</DocLink> in one pass
          to cast rays from tracked fingertips, mouths, and eyes. It is less
          about realism and more about turning landmark data into a procedural
          lighting source.
        </p>
        <p>
          The effect is less about realism and more about treating tracked
          landmarks as procedural light sources you can stylize aggressively.
        </p>
      </>
    ),
  },
  fragmentum: {
    credit: (
      <>
        Credit:{' '}
        <ExtLink href="https://www.shadertoy.com/view/t3SyzV">
          Fragmentum by Jaenam on Shadertoy
        </ExtLink>
      </>
    ),
    fullDescription: (
      <>
        <p>
          Fragmentum is here as a reminder that ShaderPad does not need a lot of
          scaffolding to host a dense fragment shader. This demo is a
          direct port of an existing procedural piece, driven mostly by{' '}
          <CodeDocLink href={docs.builtInInputs}>
            u_time
          </CodeDocLink>{' '}
          and{' '}
          <CodeDocLink href={docs.builtInInputs}>
            u_resolution
          </CodeDocLink>{' '}
          and kept intentionally close to the original GLSL.
        </p>
        <p>
          Press <code>Space</code> to pause or resume.
        </p>
      </>
    ),
  },
}

export function getExampleDetails(slug: string) {
  return exampleDetails[slug] ?? null
}
