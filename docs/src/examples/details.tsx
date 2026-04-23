import Link from 'next/link';
import type { ReactNode } from 'react';

type ExampleDetails = {
	credit?: ReactNode;
	fullDescription: ReactNode;
};

export const docs = {
	autosize: '/docs/plugins/autosize',
	builtInInputs: '/docs/core-concepts/built-in-inputs',
	canvasAndInput: '/docs/core-concepts/canvas-and-input',
	chainingShaders: '/docs/guides/chaining-shaders',
	componentsReact: '/docs/components/react',
	componentsWebComponent: '/docs/components/web-component',
	face: '/docs/plugins/face',
	hands: '/docs/plugins/hands',
	helpers: '/docs/plugins/helpers',
	history: '/docs/core-concepts/history',
	pose: '/docs/plugins/pose',
	react: '/docs/components/react',
	savingImages: '/docs/guides/saving-images',
	segmenter: '/docs/plugins/segmenter',
	shaderLifecycle: '/docs/core-concepts/shader-lifecycle',
	textures: '/docs/core-concepts/textures',
	uniforms: '/docs/core-concepts/uniforms',
	utilities: '/docs/api/utilities',
	webcamInput: '/docs/guides/webcam-input',
	webcamTrails: '/docs/examples/demos/webcam-trails',
} as const;

export function DocLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
	return (
		<Link href={href} className={className}>
			{children}
		</Link>
	);
}

export function CodeDocLink({ href, children }: { href: string; children: ReactNode }) {
	return (
		<DocLink href={href}>
			<code>{children}</code>
		</DocLink>
	);
}

function ExtLink({ href, children }: { href: string; children: ReactNode }) {
	return (
		<a href={href} target="_blank" rel="noreferrer">
			{children}
		</a>
	);
}

const exampleDetails: Record<string, ExampleDetails> = {
	basic: {
		fullDescription: (
			<>
				<p>
					This is the smallest "real" browser setup in the examples: a fullscreen canvas created with{' '}
					<CodeDocLink href={docs.utilities}>createFullscreenCanvas</CodeDocLink> and kept in sync with the
					viewport by <CodeDocLink href={docs.autosize}>autosize</CodeDocLink>. Resize the window, move the
					pointer around, and click to see how the shader responds to canvas size changes and live input
					without any surrounding app code.
				</p>
				<p>
					The shader uses several <DocLink href={docs.builtInInputs}>built-in inputs</DocLink> such as{' '}
					<code>u_time</code>, <code>u_resolution</code>, <code>u_cursor</code>, and <code>u_click</code>,
					plus a <DocLink href={docs.uniforms}>custom color uniform</DocLink>.
				</p>
			</>
		),
	},
	'uniform-presets': {
		fullDescription: (
			<>
				<p>
					This demo keeps several looks for the same shader in a small presets object. Clicking or using the
					arrow keys swaps those values with a single{' '}
					<CodeDocLink href={docs.uniforms}>updateUniforms</CodeDocLink> call.
				</p>
				<p>
					It is a compact example of using one shader to capture multiple moods without changing the GLSL
					itself.
				</p>
			</>
		),
	},
	'web-component': {
		fullDescription: (
			<>
				<p>
					A minimal <code>&lt;shader-pad&gt;</code> example using one image texture and one inline fragment
					shader.
				</p>
			</>
		),
	},
	react: {
		fullDescription: (
			<>
				<p>
					Instead of creating and tearing down a ShaderPad instance manually in an effect,{' '}
					<code>shaderpad/react</code> offers a convenient <DocLink href={docs.react}>React wrapper</DocLink>{' '}
					that renders inside a normal page layout. It is a good starting point for decorative overlays,
					embeds, and content-aware UI composition.
				</p>
			</>
		),
	},
	webcam: {
		fullDescription: (
			<>
				<p>
					This is a simple live-texture composite: it loads the webcam, uploads it with{' '}
					<CodeDocLink href={docs.textures}>initializeTexture</CodeDocLink> and{' '}
					<CodeDocLink href={docs.textures}>updateTextures</CodeDocLink>, then blends it with a transparent
					picture-frame image. It follows the same pattern shown in the{' '}
					<DocLink href={docs.webcamInput}>webcam input guide</DocLink>.
				</p>
				<p>
					There is no history, no extra pass, and no plugin state here - just one shader combining a static
					texture with a live one. It is useful for stickers, overlays, or simple camera compositing.
				</p>
			</>
		),
	},
	'single-channel-textures': {
		fullDescription: (
			<>
				<p>
					This shows how single-channel textures can be used, stored to{' '}
					<DocLink href={docs.history}>history</DocLink>, and rendered. The first pass renders the webcam into
					an <code>R8</code> offscreen texture. The second pass samples that ShaderPad instance via{' '}
					<CodeDocLink href={docs.textures}>initializeTexture</CodeDocLink>. Single-channel data can be passed
					between ShaderPads and read back like any other texture.
				</p>
				<p>
					A brief history delay is added between the left and right halves to show that they are reading from
					different parts of the chain.
				</p>
			</>
		),
	},
	lygia: {
		credit: (
			<>
				Credit: <ExtLink href="https://lygia.xyz/">LYGIA</ExtLink> by Patricio Gonzalez Vivo and contributors
			</>
		),
		fullDescription: (
			<>
				<p>
					This example keeps the ShaderPad side deliberately small: one fullscreen canvas, one{' '}
					<code>ShaderPad</code> instance, and one imported fragment shader. The interesting bit is the shader
					file itself, which uses <code>#include</code> directives to pull in LYGIA&apos;s <code>ratio</code>{' '}
					and <code>worley</code> helpers before ShaderPad compiles the final GLSL.
				</p>
			</>
		),
	},
	selfie: {
		fullDescription: (
			<>
				<p>
					Selfie is a practical template for the <code>save</code> utility. It sets up a fullscreen webcam
					view with <CodeDocLink href={docs.utilities}>createFullscreenCanvas</CodeDocLink>,{' '}
					<CodeDocLink href={docs.autosize}>autosize</CodeDocLink>, and{' '}
					<CodeDocLink href={docs.helpers}>fitCover</CodeDocLink> to fill the screen without stretching.
				</p>
				<p>
					Click the on-screen <code>Save</code> button to call{' '}
					<CodeDocLink href={docs.utilities}>save</CodeDocLink> with a filename and caption. For the API
					details, read the <DocLink href={docs.savingImages}>saving images guide</DocLink>.
				</p>
			</>
		),
	},
	'cursor-feedback': {
		fullDescription: (
			<>
				<p>
					This ShaderPad instance enables a 25-frame <DocLink href={docs.history}>output history</DocLink> and
					tiles it into a 5x5 grid. The bottom-right is the newest stored frame, the top-left is the oldest,
					and the rest are sampled in-between.
				</p>
				<p>
					The large red cursor is the only live input. The rest of the dots are the shader feeding back on
					itself through history.
				</p>
			</>
		),
	},
	'history-tiles': {
		fullDescription: (
			<>
				<p>
					This is the simplest example using <DocLink href={docs.history}>output history</DocLink>. The shader
					flashes a new solid color for the first 4 frames. On the 5th frame, it samples the stored frames
					using <CodeDocLink href={docs.helpers}>historyZ</CodeDocLink> and arranges them in a grid. After the
					5th frame, the demo pauses so you can inspect it.
				</p>
			</>
		),
	},
	'webcam-trails': {
		fullDescription: (
			<>
				<p>
					This demo applies per-texture <DocLink href={docs.history}>history</DocLink> to the webcam itself,
					then accumulates several delayed samples into a soft echo trail. It uses{' '}
					<CodeDocLink href={docs.utilities}>createFullscreenCanvas</CodeDocLink>,{' '}
					<CodeDocLink href={docs.autosize}>autosize</CodeDocLink>, and{' '}
					<CodeDocLink href={docs.helpers}>helpers</CodeDocLink> so the shader can use{' '}
					<CodeDocLink href={docs.helpers}>fitCover</CodeDocLink> and{' '}
					<CodeDocLink href={docs.helpers}>historyZ</CodeDocLink> without extra setup.
				</p>
				<p>
					The eased frame offsets keep the newer echoes tighter and the older ones farther apart, so motion
					feels smeared instead of simply repeated.
				</p>
			</>
		),
	},
	'webcam-channel-trails': {
		fullDescription: (
			<>
				<p>
					This demo is a slight variation on the{' '}
					<DocLink href={docs.webcamTrails}>webcam trails demo</DocLink>. It demonstrates that history frames
					don’t need to be rendered exactly as they’re sampled. Here, each frame is pulled using{' '}
					<CodeDocLink href={docs.helpers}>historyZ</CodeDocLink> and reduced to a single color channel before
					rendering.
				</p>
			</>
		),
	},
	'reading-history': {
		fullDescription: (
			<>
				<p>
					This visualizes a rolling <DocLink href={docs.history}>history framebuffer</DocLink>. The grey
					circle illustrates history buffer access with{' '}
					<CodeDocLink href={docs.helpers}>historyZ</CodeDocLink>. The yellow, red, and blue circles show
					direct access through static indices.
				</p>
				<p>
					As you can see from the colored circles, accessing a static index will produce the same image until
					the buffer rolls over and overwrites it. For smooth, “N frames ago” access, use{' '}
					<CodeDocLink href={docs.helpers}>historyZ</CodeDocLink>.
				</p>
			</>
		),
	},
	'webcam-grid': {
		fullDescription: (
			<>
				<p>
					This demo visualizes webcam history as a timeline. It uses the webcam’s{' '}
					<DocLink href={docs.textures}>texture history</DocLink> and{' '}
					<CodeDocLink href={docs.helpers}>historyZ</CodeDocLink> to assign each cell in the grid to an older
					frame.
				</p>
			</>
		),
	},
	'face-detection': {
		fullDescription: (
			<>
				<p>
					This example uses the <CodeDocLink href={docs.face}>face plugin</CodeDocLink> to draw region masks
					and facial landmarks. The bottom-right corner shows the raw face mask texture, though you never need
					to access it directly.
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
					<DocLink href={docs.history}>history</DocLink> in one toggleable demo. Switch between face and body
					mode to see the same camouflage idea driven by different tracked regions.
				</p>
			</>
		),
	},
	'mediapipe-chaining': {
		fullDescription: (
			<>
				<p>
					In this example, two separate ShaderPad instances efficiently share resources for a single MediaPipe
					face detector. The first pass renders vertical stripes inside the face region, and the second pass
					adds horizontal stripes outside the face.
				</p>
				<p>
					It’s a contrived example, but it shows how the <DocLink href={docs.face}>face plugin</DocLink>{' '}
					shares resources when possible. It also serves as an example of{' '}
					<DocLink href={docs.chainingShaders}>chaining shaders</DocLink>.
				</p>
			</>
		),
	},
	'pose-detection': {
		fullDescription: (
			<>
				<p>
					This example uses the <CodeDocLink href={docs.pose}>pose plugin</CodeDocLink> to draw landmarks and
					color-coded body regions on the live webcam feed. The bottom-right corner shows the raw pose mask
					texture, though you never need to access it directly.
				</p>
			</>
		),
	},
	'background-blur': {
		fullDescription: (
			<>
				<p>
					This example uses the <DocLink href={docs.segmenter}>segmenter plugin</DocLink> with the selfie
					segmentation model as a matte for a compact Dual Kawase blur pipeline. A few small offscreen passes
					build the blur efficiently, then the final pass applies the filter over the background, keeping the
					foreground sharp.
				</p>
				<p>
					This is a good example of a multi-pass effect, where stepping through multiple render passes is
					actually more efficient than a single pass.
				</p>
			</>
		),
	},
	'hand-detection': {
		fullDescription: (
			<>
				<p>
					This example uses the <CodeDocLink href={docs.hands}>hands plugin</CodeDocLink> to mark fingertips
					and hand centers on the live webcam feed, color-coded by handedness.
				</p>
			</>
		),
	},
	elastics: {
		fullDescription: (
			<>
				<p>
					Elastics uses the <DocLink href={docs.hands}>hands plugin</DocLink> to create a stylized glow
					between thumb, index, and middle fingertips. It shows how to turn tracked points into something more
					expressive than debug dots.
				</p>
			</>
		),
	},
	'finger-pens': {
		fullDescription: (
			<>
				<p>Raise your hand into view and lift any finger to draw with it.</p>
				<p>
					This demo uses two <DocLink href={docs.chainingShaders}>chained ShaderPads</DocLink>. One renders
					the trail, and the other composites the webcam plus live fingertip markers. Because both passes stay
					on the same canvas, the chain stays on the GPU.
				</p>
				<p>
					Both passes use the <DocLink href={docs.hands}>hands plugin</DocLink>. Since they read the same
					source texture with the same options, detection is shared instead of duplicated.
				</p>
				<p>
					The trail pass only updates every 3rd frame, stretching the history so the ink trails last longer.
					The final pass updates every frame so the webcam and fingertip markers stay responsive.
				</p>
			</>
		),
	},
	'midi-fingers': {
		fullDescription: (
			<>
				<p>
					MIDI fingers uses the <DocLink href={docs.hands}>hands plugin</DocLink> to track fingertips, then
					mirrors those finger-to-thumb distances into Web MIDI control changes in JavaScript. The shader
					helps you visualize the CC values as elastics between your fingers.
				</p>
				<p>
					The current mapping is <code>22-25</code> for the left-hand fingers and <code>26-29</code> for the
					right-hand fingers. It sends to the first available MIDI output.
				</p>
			</>
		),
	},
	segmenter: {
		fullDescription: (
			<>
				<p>
					This example uses the <CodeDocLink href={docs.segmenter}>segmenter plugin</CodeDocLink> to query
					category and confidence with <CodeDocLink href={docs.segmenter}>segmentAt</CodeDocLink> on the live
					webcam feed. The bottom-right corner shows the raw segmentation mask; confidence masks are enabled.
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
					God Rays combines the <DocLink href={docs.face}>face plugin</DocLink> and the{' '}
					<DocLink href={docs.hands}>hands plugin</DocLink> in one pass to cast rays from tracked fingertips,
					mouths, and eyes. It’s an example of how multiple MediaPipe plugins can work on the same shader.
				</p>
			</>
		),
	},
	fragmentum: {
		credit: (
			<>
				Credit:{' '}
				<ExtLink href="https://www.shadertoy.com/view/t3SyzV">Fragmentum by Jaenam on Shadertoy</ExtLink>
			</>
		),
		fullDescription: (
			<>
				<p>
					Fragmentum is here as a reminder that ShaderPad does not need a lot of scaffolding to host a dense
					fragment shader. This demo is a direct port of an existing procedural piece, driven mostly by{' '}
					<CodeDocLink href={docs.builtInInputs}>u_time</CodeDocLink> and{' '}
					<CodeDocLink href={docs.builtInInputs}>u_resolution</CodeDocLink> and kept intentionally close to
					the original GLSL.
				</p>
				<p>
					Press <code>Space</code> to pause or resume.
				</p>
			</>
		),
	},
};

export function getExampleDetails(slug: string) {
	return exampleDetails[slug] ?? null;
}
