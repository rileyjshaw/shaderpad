import CoreShaderPad, { type InitializeTextureOptions, type Options, type Plugin, type StepOptions } from '.';
import { createPlaybackVisibilityController, type PlaybackVisibilityController } from './internal/autoplay';
import {
	addDomTextureRefreshListener,
	type DomTextureElement,
	getLiveDomTextureSource,
	isDomTextureElement,
	isLiveDomTextureElement,
	loadDomTextureSource,
	parseBooleanLikeValue,
	parseTextureOptions,
} from './internal/declarative-textures';
import autosizePlugin, { type AutosizeOptions } from './plugins/autosize';

const DEFAULT_AUTOPLAY = true;
const DEFAULT_AUTOPAUSE = true;

const ShaderPadElementBase = (typeof HTMLElement === 'undefined' ? class {} : HTMLElement) as typeof HTMLElement;

type ShaderPadElementOptions = Omit<Options, 'canvas' | 'plugins' | 'cursorTarget'>;
type CursorTarget = Window | Element | null;
export type ShaderPadElementConfig = {
	plugins?: Plugin[];
	options?: ShaderPadElementOptions;
	autosize?: boolean | AutosizeOptions;
	cursorTarget?: CursorTarget;
	autoplay?: boolean;
	autopause?: boolean;
};

type NormalizedShaderPadElementConfig = {
	plugins: Plugin[];
	options: ShaderPadElementOptions;
	autosize: boolean | AutosizeOptions;
	cursorTarget: CursorTarget;
	autoplay: boolean;
	autopause: boolean;
};

export type ShaderPadElementLoadEventDetail = {
	shader: CoreShaderPad;
	canvas: HTMLCanvasElement | null;
};

export type ShaderPadElementErrorEventDetail = {
	error: unknown;
};

export type ShaderPadElementVisibilityChangeEventDetail = {
	shader: CoreShaderPad;
	canvas: HTMLCanvasElement | null;
	isVisible: boolean;
};

export type ShaderPadElementBeforeStepEventDetail = {
	shader: CoreShaderPad;
	canvas: HTMLCanvasElement | null;
	time: number;
	frame: number;
	stepOptions: StepOptions | undefined;
};

type NestedShaderPadElement = HTMLElement & {
	shader: CoreShaderPad | null;
	autoplay: boolean;
	autopause: boolean;
	pause(): void;
	step(options?: StepOptions): void;
	draw(options?: StepOptions): void;
};

type TextureElement = DomTextureElement | NestedShaderPadElement;

type TextureBinding = {
	element: TextureElement;
	name: string;
	options: InitializeTextureOptions;
	live: boolean;
};

function normalizeShaderPadConfig(config?: ShaderPadElementConfig): NormalizedShaderPadElementConfig {
	return {
		plugins: [...(config?.plugins ?? [])],
		options: { ...(config?.options ?? {}) },
		autosize: config?.autosize ?? true,
		cursorTarget: config?.cursorTarget ?? null,
		autoplay: config?.autoplay ?? DEFAULT_AUTOPLAY,
		autopause: config?.autopause ?? DEFAULT_AUTOPAUSE,
	};
}

async function loadNestedShaderPadSource(element: NestedShaderPadElement) {
	if (element.shader) return element.shader;

	return await new Promise<CoreShaderPad>((resolve, reject) => {
		const handleLoad = (event: Event) => {
			cleanup();
			resolve((event as CustomEvent<ShaderPadElementLoadEventDetail>).detail.shader);
		};
		const handleError = (event: Event) => {
			cleanup();
			reject(event);
		};
		const cleanup = () => {
			element.removeEventListener('load', handleLoad);
			element.removeEventListener('error', handleError);
		};

		element.addEventListener('load', handleLoad, { once: true });
		element.addEventListener('error', handleError, { once: true });
	});
}

export class ShaderPadElement extends ShaderPadElementBase {
	static observedAttributes = ['autoplay', 'autopause'];
	static shaderPadConfig: NormalizedShaderPadElementConfig = normalizeShaderPadConfig();

	private shaderInstance: CoreShaderPad | null = null;
	private renderCanvas: HTMLCanvasElement | null = null;
	private generatedCanvas: HTMLCanvasElement | null = null;
	private initPromise: Promise<CoreShaderPad> | null = null;
	private pluginsValue: Plugin[] = [];
	private defaultOptionsValue: ShaderPadElementOptions = {};
	private optionsValue: ShaderPadElementOptions = {};
	private autosizeValue: boolean | AutosizeOptions = true;
	private cursorTargetValue: CursorTarget = null;
	private autoplayValue = DEFAULT_AUTOPLAY;
	private autopauseValue = DEFAULT_AUTOPAUSE;
	private isPlaying = false;
	private playbackController: PlaybackVisibilityController | null = null;
	private cleanupCallbacks: Array<() => void> = [];
	private textureRestoreCallbacks: Array<() => void> = [];
	private controlVisibility = new Map<HTMLElement, boolean>();
	private liveTextures: TextureBinding[] = [];

	constructor() {
		super();
		const defaults = (this.constructor as typeof ShaderPadElement).shaderPadConfig;
		this.pluginsValue = [...defaults.plugins];
		this.defaultOptionsValue = { ...defaults.options };
		this.autosizeValue = defaults.autosize;
		this.cursorTargetValue = defaults.cursorTarget;
		this.autoplayValue = parseBooleanLikeValue(this.getAttribute('autoplay'), defaults.autoplay);
		this.autopauseValue = parseBooleanLikeValue(this.getAttribute('autopause'), defaults.autopause);
	}

	get shader() {
		return this.shaderInstance;
	}

	get canvas() {
		return this.renderCanvas;
	}

	get options() {
		return {
			...this.defaultOptionsValue,
			...this.optionsValue,
		};
	}

	set options(value: ShaderPadElementOptions | undefined) {
		this.optionsValue = value ? { ...value } : {};
	}

	get autosize() {
		return this.autosizeValue;
	}

	set autosize(value: boolean | AutosizeOptions | undefined) {
		this.autosizeValue = value ?? true;
	}

	get cursorTarget() {
		return this.cursorTargetValue;
	}

	set cursorTarget(value: CursorTarget | undefined) {
		this.cursorTargetValue = value ?? null;
	}

	get autoplay() {
		return this.autoplayValue;
	}

	set autoplay(value: boolean) {
		const nextValue = Boolean(value);
		if (this.autoplayValue === nextValue) return;
		this.autoplayValue = nextValue;
		this.reflectDefaultTrueAttribute('autoplay', nextValue);
		this.syncPlayback();
	}

	get autopause() {
		return this.autopauseValue;
	}

	set autopause(value: boolean) {
		const nextValue = Boolean(value);
		if (this.autopauseValue === nextValue) return;
		this.autopauseValue = nextValue;
		this.reflectDefaultTrueAttribute('autopause', nextValue);
		this.syncPlayback();
	}

	connectedCallback() {
		void this.ensureInitialized().catch(() => {});
	}

	disconnectedCallback() {
		this.destroyInstance();
	}

	attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
		if (oldValue === newValue) return;
		if (name !== 'autoplay' && name !== 'autopause') return;

		const defaults = (this.constructor as typeof ShaderPadElement).shaderPadConfig;
		const value = parseBooleanLikeValue(newValue, defaults[name]);
		if (name === 'autoplay') this.autoplayValue = value;
		else this.autopauseValue = value;
		this.syncPlayback();
	}

	async play() {
		const instance = await this.ensureInitialized();
		this.playInstance(instance);
	}

	pause() {
		this.shaderInstance?.pause();
	}

	step(options?: StepOptions) {
		const instance = this.shaderInstance;
		if (!instance) return;

		instance.step(options ? { ...options } : {});
	}

	draw(options?: StepOptions) {
		this.updateLiveTextures('draw');
		this.shaderInstance?.draw(options);
	}

	clear() {
		this.shaderInstance?.clear();
	}

	resetFrame() {
		this.shaderInstance?.resetFrame();
	}

	reset() {
		this.shaderInstance?.reset();
	}

	destroy() {
		this.destroyInstance();
	}

	private emit<T>(type: string, detail: T) {
		this.dispatchEvent(
			new CustomEvent<T>(type, {
				detail,
				bubbles: true,
				composed: true,
			}),
		);
	}

	private addCleanupListener(target: EventTarget, type: string, listener: EventListener) {
		target.addEventListener(type, listener);
		this.cleanupCallbacks.push(() => target.removeEventListener(type, listener));
	}

	private reflectDefaultTrueAttribute(name: string, value: boolean) {
		if (value) {
			this.removeAttribute(name);
			return;
		}
		this.setAttribute(name, String(value));
	}

	private ensureInitialized() {
		if (this.shaderInstance) return Promise.resolve(this.shaderInstance);
		if (this.initPromise) return this.initPromise;
		if (!this.isConnected) {
			return Promise.reject(new Error('Cannot initialize <shader-pad> while it is disconnected.'));
		}

		this.initPromise = this.initialize().catch(error => {
			this.initPromise = null;
			throw error;
		});
		return this.initPromise;
	}

	private async initialize() {
		try {
			const fragmentScript = this.getFragmentShaderScript();
			if (!fragmentScript) {
				throw new Error('A direct child <script type="x-shader/x-fragment"> is required.');
			}

			const fragmentShaderSrc = await this.getFragmentShaderSource(fragmentScript);
			const { canvas, owned } = this.resolveRenderCanvas();
			const textureBindings = this.getTextureBindings();
			this.prepareNestedTextureChildren(textureBindings);

			const instance = new CoreShaderPad(fragmentShaderSrc, {
				...this.defaultOptionsValue,
				...this.optionsValue,
				canvas,
				plugins: this.getInstalledPlugins(owned),
				...(this.cursorTargetValue ? { cursorTarget: this.cursorTargetValue } : {}),
			});

			this.shaderInstance = instance;
			this.renderCanvas = canvas;
			this.bindInstanceEvents(instance);

			await this.initializeTextures(instance, textureBindings);

			this.liveTextures = textureBindings.filter(binding => binding.live);
			this.installChildListeners(textureBindings);
			this.hideControlChildren([fragmentScript, ...textureBindings.map(binding => binding.element)]);
			this.setupPlayback(instance, canvas);

			this.emit<ShaderPadElementLoadEventDetail>('load', { shader: instance, canvas });

			this.playbackController?.sync();
			return instance;
		} catch (error) {
			this.destroyInstance();
			this.emit<ShaderPadElementErrorEventDetail>('error', { error });
			throw error;
		}
	}

	private getInstalledPlugins(ownedCanvas: boolean) {
		if (!ownedCanvas || this.autosizeValue === false) return [...this.pluginsValue];

		const autosizeOptions =
			this.autosizeValue === true ? { target: this } : { target: this, ...this.autosizeValue };
		return [autosizePlugin(autosizeOptions), ...this.pluginsValue];
	}

	private bindInstanceEvents(instance: CoreShaderPad) {
		const handlePlay = () => {
			this.isPlaying = true;
		};
		const handlePause = () => {
			this.isPlaying = false;
		};
		const handleBeforeStep = (time: number, frame: number, options?: StepOptions) => {
			this.updateLiveTextures('step');
			this.dispatchMutableBeforeStep(instance, time, frame, options);
		};

		instance.on('play', handlePlay);
		instance.on('pause', handlePause);
		instance.on('beforeStep', handleBeforeStep);
		this.cleanupCallbacks.push(() => {
			instance.off('play', handlePlay);
			instance.off('pause', handlePause);
			instance.off('beforeStep', handleBeforeStep);
		});
	}

	private setupPlayback(instance: CoreShaderPad, canvas: HTMLCanvasElement) {
		this.playbackController?.destroy();
		this.playbackController = createPlaybackVisibilityController({
			target: canvas,
			autoplay: this.autoplayValue,
			autopause: this.autopauseValue,
			isPlaying: () => this.isPlaying,
			play: () => this.playInstance(instance),
			pause: () => instance.pause(),
			onVisibilityChange: isVisible => {
				this.emit<ShaderPadElementVisibilityChangeEventDetail>('visibilityChange', {
					shader: instance,
					canvas,
					isVisible,
				});
			},
		});
	}

	private syncPlayback() {
		this.playbackController?.update({
			autoplay: this.autoplayValue,
			autopause: this.autopauseValue,
		});
	}

	private destroyInstance() {
		this.runCallbacks(this.cleanupCallbacks);
		this.playbackController?.destroy();
		this.playbackController = null;
		this.runCallbacks(this.textureRestoreCallbacks);
		this.showControlChildren();
		this.liveTextures = [];
		this.isPlaying = false;
		this.shaderInstance?.destroy();
		this.shaderInstance = null;
		this.renderCanvas = null;
		this.initPromise = null;
	}

	private getFragmentShaderScript() {
		return Array.from(this.children).find(
			child => child instanceof HTMLScriptElement && child.getAttribute('type') === 'x-shader/x-fragment',
		) as HTMLScriptElement | undefined;
	}

	private async getFragmentShaderSource(script: HTMLScriptElement) {
		if (script.hasAttribute('src')) {
			const response = await fetch(script.src);
			if (!response.ok) throw new Error(`Failed to load fragment shader from "${script.src}".`);
			return await response.text();
		}

		const source = script.textContent?.trim() ?? '';
		if (!source) throw new Error('The fragment shader script is empty.');
		return source;
	}

	private resolveRenderCanvas() {
		const forId = this.getAttribute('for')?.trim();
		if (forId) {
			this.removeGeneratedCanvas();
			const candidate = this.ownerDocument.getElementById(forId);
			if (!(candidate instanceof HTMLCanvasElement)) {
				throw new Error(`No <canvas> with id "${forId}" was found for <shader-pad for="${forId}">.`);
			}
			return { canvas: candidate, owned: false };
		}

		const ownedCanvas = Array.from(this.children).find(
			child =>
				child instanceof HTMLCanvasElement &&
				child !== this.generatedCanvas &&
				!child.hasAttribute('data-texture'),
		) as HTMLCanvasElement | undefined;
		if (ownedCanvas) {
			this.removeGeneratedCanvas();
			return { canvas: ownedCanvas, owned: true };
		}

		return { canvas: this.ensureGeneratedCanvas(), owned: true };
	}

	private ensureGeneratedCanvas() {
		if (this.generatedCanvas?.parentElement === this) return this.generatedCanvas;

		const canvas = this.ownerDocument.createElement('canvas');
		canvas.dataset.shaderpadGenerated = 'true';
		canvas.style.display = 'block';
		canvas.style.width = '100%';
		canvas.style.height = '100%';
		this.appendChild(canvas);
		this.generatedCanvas = canvas;
		return canvas;
	}

	private removeGeneratedCanvas() {
		if (this.generatedCanvas?.parentElement === this) {
			this.generatedCanvas.remove();
		}
	}

	private getTextureBindings() {
		const bindings: TextureBinding[] = [];

		for (const child of Array.from(this.children)) {
			const name = child.getAttribute('data-texture');
			if (!name) continue;

			if (isDomTextureElement(child)) {
				bindings.push({
					element: child,
					name,
					options: parseTextureOptions(child, 'data-texture-'),
					live: isLiveDomTextureElement(child),
				});
				continue;
			}

			if (child instanceof ShaderPadElement) {
				bindings.push({
					element: child,
					name,
					options: parseTextureOptions(child, 'data-texture-'),
					live: true,
				});
			}
		}

		return bindings;
	}

	private prepareNestedTextureChildren(bindings: TextureBinding[]) {
		for (const binding of bindings) {
			if (!(binding.element instanceof ShaderPadElement)) continue;

			const nested = binding.element;
			const previousAutoplay = nested.autoplay;
			const previousAutopause = nested.autopause;
			nested.autoplay = false;
			nested.autopause = false;
			nested.pause();
			this.textureRestoreCallbacks.push(() => {
				nested.autoplay = previousAutoplay;
				nested.autopause = previousAutopause;
			});
		}
	}

	private async initializeTextures(instance: CoreShaderPad, bindings: TextureBinding[]) {
		for (const binding of bindings) {
			const source = isDomTextureElement(binding.element)
				? await loadDomTextureSource(binding.element)
				: await loadNestedShaderPadSource(binding.element);
			instance.initializeTexture(binding.name, source, binding.options);
		}
	}

	private installChildListeners(bindings: TextureBinding[]) {
		for (const binding of bindings) {
			if (isDomTextureElement(binding.element)) {
				const cleanup = addDomTextureRefreshListener(binding.element, () => {
					this.shaderInstance?.updateTextures({ [binding.name]: binding.element as DomTextureElement });
				});
				if (cleanup) this.cleanupCallbacks.push(cleanup);
				continue;
			}

			if (binding.element instanceof ShaderPadElement) {
				const nested = binding.element;
				const handleLoad = () => {
					if (nested.shader) this.shaderInstance?.updateTextures({ [binding.name]: nested.shader });
				};
				this.addCleanupListener(nested, 'load', handleLoad);
			}
		}
	}

	private runCallbacks(callbacks: Array<() => void>) {
		for (const callback of callbacks.splice(0)) callback();
	}

	private hideControlChildren(elements: HTMLElement[]) {
		this.controlVisibility.clear();
		for (const element of elements) {
			if (element === this.generatedCanvas) continue;
			this.controlVisibility.set(element, Boolean(element.hidden));
			element.hidden = true;
		}
	}

	private showControlChildren() {
		for (const [element, previousHidden] of this.controlVisibility) {
			element.hidden = previousHidden;
		}
		this.controlVisibility.clear();
	}

	private updateLiveTextures(nestedRenderMode?: 'step' | 'draw') {
		const instance = this.shaderInstance;
		if (!instance || this.liveTextures.length === 0) return;

		const updates: Record<string, HTMLVideoElement | HTMLCanvasElement | CoreShaderPad> = {};
		for (const binding of this.liveTextures) {
			if (isDomTextureElement(binding.element)) {
				const source = getLiveDomTextureSource(binding.element);
				if (source) updates[binding.name] = source;
				continue;
			}

			if (binding.element instanceof ShaderPadElement && binding.element.shader) {
				if (nestedRenderMode === 'step') {
					binding.element.step();
				} else if (nestedRenderMode === 'draw') {
					binding.element.draw();
				}
				updates[binding.name] = binding.element.shader;
			}
		}

		if (Object.keys(updates).length > 0) instance.updateTextures(updates);
	}

	private playInstance(instance: CoreShaderPad) {
		instance.play(() => ({}));
	}

	private dispatchMutableBeforeStep(instance: CoreShaderPad, time: number, frame: number, options?: StepOptions) {
		const detail: ShaderPadElementBeforeStepEventDetail = {
			shader: instance,
			canvas: this.renderCanvas,
			time,
			frame,
			stepOptions: options ? { ...options } : undefined,
		};

		this.emit<ShaderPadElementBeforeStepEventDetail>('beforeStep', detail);

		if (options && detail.stepOptions) {
			Object.assign(options, detail.stepOptions);
		}
	}
}

export function createShaderPadElement(config?: ShaderPadElementConfig): typeof ShaderPadElement {
	const definition = normalizeShaderPadConfig(config);

	class ConfiguredShaderPadElement extends ShaderPadElement {
		static shaderPadConfig = definition;
	}

	return ConfiguredShaderPadElement;
}

declare global {
	interface HTMLElementTagNameMap {
		'shader-pad': ShaderPadElement;
	}
}
