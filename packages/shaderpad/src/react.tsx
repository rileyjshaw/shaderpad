'use client';

import {
	type ComponentPropsWithoutRef,
	createContext,
	forwardRef,
	type ReactNode,
	type RefObject,
	useContext,
	useEffect,
	useImperativeHandle,
	useLayoutEffect,
	useRef,
	useState,
} from 'react';

import CoreShaderPad, { type InitializeTextureOptions, type Options, type Plugin, type StepOptions } from '.';
import { createPlaybackVisibilityController, type PlaybackVisibilityController } from './internal/autoplay';
import {
	addDomTextureRefreshListener,
	type DomTextureElement,
	getLiveDomTextureSource,
	isDomTextureElement,
	isLiveDomTextureElement,
	loadDomTextureSource,
	parseTextureOptions,
	parseTextureOptionsFromAttributes,
} from './internal/declarative-textures';
import autosizePlugin, { type AutosizeOptions } from './plugins/autosize';

type CursorTarget = Window | Element | RefObject<Element | null>;
type ShaderPadOptions = Omit<Options, 'canvas' | 'plugins' | 'cursorTarget'>;

type TextureDataAttributes = {
	'data-texture'?: string;
	'data-texture-history'?: string | number;
	'data-texture-preserve-y'?: string | boolean;
	'data-texture-internal-format'?: string;
	'data-texture-format'?: string;
	'data-texture-type'?: string;
	'data-texture-min-filter'?: string;
	'data-texture-mag-filter'?: string;
	'data-texture-wrap-s'?: string;
	'data-texture-wrap-t'?: string;
};

type ShaderPadHandle = {
	readonly shader: CoreShaderPad | null;
	readonly canvas: HTMLCanvasElement | null;
	play(): void;
	pause(): void;
	step(options?: StepOptions): void;
	draw(options?: StepOptions): void;
	clear(): void;
	resetFrame(): void;
	reset(): void;
	destroy(): void;
};

export interface ShaderPadProps
	extends Omit<ComponentPropsWithoutRef<'canvas'>, 'children' | 'onError'>, TextureDataAttributes {
	shader: string;
	children?: ReactNode;
	plugins?: Plugin[];
	options?: ShaderPadOptions;
	autosize?: boolean | AutosizeOptions;
	cursorTarget?: CursorTarget;
	autoplay?: boolean;
	autopause?: boolean;
	onInit?: (shader: CoreShaderPad, canvas: HTMLCanvasElement) => void;
	onBeforeStep?: (shader: CoreShaderPad, time: number, frame: number) => StepOptions | void;
	onError?: (error: unknown) => void;
}

type ReadyWaiter = {
	resolve(shader: CoreShaderPad): void;
	reject(error: unknown): void;
};

type NestedTextureRegistration = {
	readonly id: symbol;
	readonly name: string;
	readonly options: InitializeTextureOptions;
	waitForShader(): Promise<CoreShaderPad>;
	getShader(): CoreShaderPad | null;
	step(): void;
	draw(): void;
	subscribe(listener: (shader: CoreShaderPad) => void): () => void;
};

type NestedTextureRegistry = {
	getCanvas(): HTMLCanvasElement | null;
	register(registration: NestedTextureRegistration): () => void;
};

type DomTextureBinding = {
	kind: 'dom';
	element: DomTextureElement;
	name: string;
	options: InitializeTextureOptions;
	live: boolean;
};

type NestedTextureBinding = {
	kind: 'nested';
	registration: NestedTextureRegistration;
	name: string;
	options: InitializeTextureOptions;
	live: true;
};

type TextureBinding = DomTextureBinding | NestedTextureBinding;

const ShaderPadTextureContext = createContext<NestedTextureRegistry | null>(null);
const useClientLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

function isRefTarget(target: CursorTarget | undefined): target is RefObject<Element | null> {
	return Boolean(target && typeof target === 'object' && 'current' in target);
}

function resolveCursorTarget(target: CursorTarget | undefined) {
	if (isRefTarget(target)) {
		return target.current ?? undefined;
	}

	return target;
}

function queueUnhandledError(error: unknown) {
	queueMicrotask(() => {
		throw error;
	});
}

export const ShaderPad = forwardRef<ShaderPadHandle, ShaderPadProps>(function ShaderPad(
	{
		shader,
		children,
		plugins,
		options,
		autosize = true,
		cursorTarget,
		autoplay = true,
		autopause = true,
		onInit,
		onBeforeStep,
		onError,
		style,
		'data-texture': textureNameValue,
		'data-texture-history': textureHistory,
		'data-texture-preserve-y': texturePreserveY,
		'data-texture-internal-format': textureInternalFormat,
		'data-texture-format': textureFormat,
		'data-texture-type': textureType,
		'data-texture-min-filter': textureMinFilter,
		'data-texture-mag-filter': textureMagFilter,
		'data-texture-wrap-s': textureWrapS,
		'data-texture-wrap-t': textureWrapT,
		...canvasProps
	},
	ref,
) {
	const parentTextureRegistry = useContext(ShaderPadTextureContext);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const textureHostRef = useRef<HTMLDivElement>(null);
	const shaderRef = useRef<CoreShaderPad | null>(null);
	const liveTexturesRef = useRef<TextureBinding[]>([]);
	const playbackControllerRef = useRef<PlaybackVisibilityController | null>(null);
	const destroyedShadersRef = useRef(new WeakSet<CoreShaderPad>());
	const readyWaitersRef = useRef<ReadyWaiter[]>([]);
	const nestedTextureListenersRef = useRef(new Set<(shader: CoreShaderPad) => void>());
	const nestedTextureRegistrationsRef = useRef(new Map<symbol, NestedTextureRegistration>());
	const nestedTextureNameRef = useRef<string | undefined>(undefined);
	const nestedTextureOptionsRef = useRef<InitializeTextureOptions>({});
	const nestedTextureRegistrationRef = useRef<NestedTextureRegistration | null>(null);
	const textureRegistryRef = useRef<NestedTextureRegistry | null>(null);
	const onInitRef = useRef(onInit);
	const onBeforeStepRef = useRef(onBeforeStep);
	const onErrorRef = useRef(onError);
	const autoplayRef = useRef(autoplay);
	const autopauseRef = useRef(autopause);
	const [cursorTargetVersion, setCursorTargetVersion] = useState(0);

	const nestedTextureName = textureNameValue?.trim() || undefined;
	const isManagedTexture = Boolean(parentTextureRegistry && nestedTextureName);
	const nestedTextureAttributes: TextureDataAttributes = {
		'data-texture-history': textureHistory,
		'data-texture-preserve-y': texturePreserveY,
		'data-texture-internal-format': textureInternalFormat,
		'data-texture-format': textureFormat,
		'data-texture-type': textureType,
		'data-texture-min-filter': textureMinFilter,
		'data-texture-mag-filter': textureMagFilter,
		'data-texture-wrap-s': textureWrapS,
		'data-texture-wrap-t': textureWrapT,
	};

	nestedTextureNameRef.current = nestedTextureName;
	nestedTextureOptionsRef.current = parseTextureOptionsFromAttributes(
		name => nestedTextureAttributes[name as keyof TextureDataAttributes],
		'data-texture-',
	);
	onInitRef.current = onInit;
	onBeforeStepRef.current = onBeforeStep;
	onErrorRef.current = onError;
	autoplayRef.current = autoplay;
	autopauseRef.current = autopause;

	if (!nestedTextureRegistrationRef.current) {
		nestedTextureRegistrationRef.current = {
			id: Symbol('ShaderPad texture'),
			get name() {
				return nestedTextureNameRef.current ?? '';
			},
			get options() {
				return nestedTextureOptionsRef.current;
			},
			waitForShader() {
				if (shaderRef.current) return Promise.resolve(shaderRef.current);
				return new Promise<CoreShaderPad>((resolve, reject) => {
					readyWaitersRef.current.push({ resolve, reject });
				});
			},
			getShader() {
				return shaderRef.current;
			},
			step() {
				const shaderInstance = shaderRef.current;
				if (shaderInstance) managedStepShader(shaderInstance);
			},
			draw() {
				const shaderInstance = shaderRef.current;
				if (shaderInstance) drawShader(shaderInstance);
			},
			subscribe(listener) {
				nestedTextureListenersRef.current.add(listener);
				return () => nestedTextureListenersRef.current.delete(listener);
			},
		};
	}

	if (!textureRegistryRef.current) {
		textureRegistryRef.current = {
			getCanvas: () => canvasRef.current,
			register(registration) {
				nestedTextureRegistrationsRef.current.set(registration.id, registration);
				return () => {
					if (nestedTextureRegistrationsRef.current.get(registration.id) === registration) {
						nestedTextureRegistrationsRef.current.delete(registration.id);
					}
				};
			},
		};
	}

	function resolveReadyWaiters(shaderInstance: CoreShaderPad) {
		const waiters = readyWaitersRef.current.splice(0);
		for (const waiter of waiters) waiter.resolve(shaderInstance);
		for (const listener of nestedTextureListenersRef.current) listener(shaderInstance);
	}

	function rejectReadyWaiters(error: unknown) {
		const waiters = readyWaitersRef.current.splice(0);
		for (const waiter of waiters) waiter.reject(error);
	}

	function destroyShader(shaderInstance: CoreShaderPad | null) {
		if (!shaderInstance || destroyedShadersRef.current.has(shaderInstance)) {
			return;
		}

		destroyedShadersRef.current.add(shaderInstance);
		if (shaderRef.current === shaderInstance) {
			shaderRef.current = null;
		}
		shaderInstance.destroy();
	}

	function destroyCurrentInstance() {
		playbackControllerRef.current?.destroy();
		playbackControllerRef.current = null;
		liveTexturesRef.current = [];
		destroyShader(shaderRef.current);
		rejectReadyWaiters(new Error('ShaderPad was destroyed before initialization completed.'));
	}

	function updateLiveTextures(shaderInstance: CoreShaderPad, nestedRenderMode?: 'step' | 'draw') {
		if (liveTexturesRef.current.length === 0) return;

		const updates: Record<string, HTMLVideoElement | HTMLCanvasElement | CoreShaderPad> = {};
		for (const binding of liveTexturesRef.current) {
			if (binding.kind === 'dom') {
				const source = getLiveDomTextureSource(binding.element);
				if (source) updates[binding.name] = source;
				continue;
			}

			const nestedShader = binding.registration.getShader();
			if (!nestedShader) continue;
			if (nestedRenderMode === 'step') {
				binding.registration.step();
			} else if (nestedRenderMode === 'draw') {
				binding.registration.draw();
			}
			updates[binding.name] = nestedShader;
		}

		if (Object.keys(updates).length > 0) shaderInstance.updateTextures(updates);
	}

	function playShader(shaderInstance: CoreShaderPad) {
		shaderInstance.play(() => (onBeforeStepRef.current ? {} : undefined));
	}

	function managedStepShader(shaderInstance: CoreShaderPad) {
		shaderInstance.step(onBeforeStepRef.current ? {} : undefined);
	}

	function stepShader(shaderInstance: CoreShaderPad, stepOptions?: StepOptions) {
		shaderInstance.step(stepOptions ? { ...stepOptions } : onBeforeStepRef.current ? {} : undefined);
	}

	function drawShader(shaderInstance: CoreShaderPad, stepOptions?: StepOptions) {
		updateLiveTextures(shaderInstance, 'draw');
		shaderInstance.draw(stepOptions);
	}

	useImperativeHandle(
		ref,
		() => ({
			get shader() {
				return shaderRef.current;
			},
			get canvas() {
				return canvasRef.current;
			},
			play() {
				const shaderInstance = shaderRef.current;
				if (shaderInstance) {
					playShader(shaderInstance);
				}
			},
			pause() {
				shaderRef.current?.pause();
			},
			step(stepOptions) {
				const shaderInstance = shaderRef.current;
				if (shaderInstance) stepShader(shaderInstance, stepOptions);
			},
			draw(stepOptions) {
				const shaderInstance = shaderRef.current;
				if (shaderInstance) drawShader(shaderInstance, stepOptions);
			},
			clear() {
				shaderRef.current?.clear();
			},
			resetFrame() {
				shaderRef.current?.resetFrame();
			},
			reset() {
				shaderRef.current?.reset();
			},
			destroy() {
				destroyCurrentInstance();
			},
		}),
		[],
	);

	useClientLayoutEffect(() => {
		if (!parentTextureRegistry || !nestedTextureName) return;
		return parentTextureRegistry.register(nestedTextureRegistrationRef.current!);
	}, [parentTextureRegistry, nestedTextureName]);

	useEffect(() => {
		if (!isRefTarget(cursorTarget) || cursorTarget.current) {
			return;
		}

		let frameId: number | null = null;
		let isDisposed = false;

		const poll = () => {
			if (isDisposed) {
				return;
			}
			if (cursorTarget.current) {
				setCursorTargetVersion(version => version + 1);
				return;
			}
			frameId = requestAnimationFrame(poll);
		};

		frameId = requestAnimationFrame(poll);

		return () => {
			isDisposed = true;
			if (frameId !== null) {
				cancelAnimationFrame(frameId);
			}
		};
	}, [cursorTarget]);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return;
		}

		const resolvedCursorTarget = resolveCursorTarget(cursorTarget);
		if (isRefTarget(cursorTarget) && !resolvedCursorTarget) {
			return;
		}

		const effectiveAutosize =
			isManagedTexture && autosize === true ? { target: parentTextureRegistry?.getCanvas() ?? canvas } : autosize;
		const installedPlugins =
			effectiveAutosize === false
				? [...(plugins ?? [])]
				: [autosizePlugin(effectiveAutosize === true ? undefined : effectiveAutosize), ...(plugins ?? [])];

		let instance: CoreShaderPad | null = null;
		let playbackController: PlaybackVisibilityController | null = null;
		let isDisposed = false;
		let isPlaying = false;
		const cleanupCallbacks: Array<() => void> = [];

		const handlePlay = () => {
			isPlaying = true;
		};
		const handlePause = () => {
			isPlaying = false;
		};
		const handleBeforeStep = (time: number, frame: number, stepOptions?: StepOptions) => {
			if (!instance) return;

			updateLiveTextures(instance, 'step');
			const nextOptions = onBeforeStepRef.current?.(instance, time, frame);
			if (nextOptions && stepOptions) {
				Object.assign(stepOptions, nextOptions);
			}
		};
		const cleanupInstance = () => {
			if (playbackControllerRef.current === playbackController) {
				playbackControllerRef.current = null;
			}
			playbackController?.destroy();
			for (const cleanup of cleanupCallbacks.splice(0)) cleanup();
			liveTexturesRef.current = [];
			if (instance) {
				instance.off('play', handlePlay);
				instance.off('pause', handlePause);
				instance.off('beforeStep', handleBeforeStep);
			}
			destroyShader(instance);
		};
		const handleSetupError = (error: unknown) => {
			cleanupInstance();
			rejectReadyWaiters(error);
			if (onErrorRef.current) {
				onErrorRef.current(error);
				return;
			}
			queueUnhandledError(error);
		};

		const initialize = async () => {
			try {
				instance = new CoreShaderPad(shader, {
					...options,
					canvas,
					plugins: installedPlugins,
					...(resolvedCursorTarget ? { cursorTarget: resolvedCursorTarget } : {}),
				});
				instance.on('play', handlePlay);
				instance.on('pause', handlePause);
				instance.on('beforeStep', handleBeforeStep);

				const domTextureBindings: DomTextureBinding[] = [];
				for (const child of Array.from(textureHostRef.current?.children ?? [])) {
					const name = child.getAttribute('data-texture');
					if (!name || !isDomTextureElement(child)) continue;
					domTextureBindings.push({
						kind: 'dom',
						element: child,
						name,
						options: parseTextureOptions(child, 'data-texture-'),
						live: isLiveDomTextureElement(child),
					});
				}
				const nestedTextureBindings: NestedTextureBinding[] = Array.from(
					nestedTextureRegistrationsRef.current.values(),
				)
					.filter(registration => registration.name)
					.map(registration => ({
						kind: 'nested',
						registration,
						name: registration.name,
						options: registration.options,
						live: true,
					}));
				const textureBindings: TextureBinding[] = [...domTextureBindings, ...nestedTextureBindings];

				for (const binding of textureBindings) {
					const source =
						binding.kind === 'dom'
							? await loadDomTextureSource(binding.element)
							: await binding.registration.waitForShader();
					if (isDisposed) return;
					instance.initializeTexture(binding.name, source, binding.options);
				}

				liveTexturesRef.current = textureBindings.filter(binding => binding.live);
				for (const binding of textureBindings) {
					if (binding.kind === 'dom') {
						const cleanup = addDomTextureRefreshListener(binding.element, () => {
							instance?.updateTextures({ [binding.name]: binding.element });
						});
						if (cleanup) cleanupCallbacks.push(cleanup);
						continue;
					}

					cleanupCallbacks.push(
						binding.registration.subscribe(nestedShader => {
							instance?.updateTextures({ [binding.name]: nestedShader });
						}),
					);
				}

				if (isDisposed) return;
				shaderRef.current = instance;
				onInitRef.current?.(instance, canvas);
				resolveReadyWaiters(instance);

				playbackController = createPlaybackVisibilityController({
					target: canvas,
					autoplay: isManagedTexture ? false : autoplayRef.current,
					autopause: isManagedTexture ? false : autopauseRef.current,
					isPlaying: () => isPlaying,
					play: () => {
						if (instance && !isDisposed) {
							playShader(instance);
						}
					},
					pause: () => instance?.pause(),
				});
				playbackControllerRef.current = playbackController;
				playbackController.sync();
			} catch (error) {
				if (!isDisposed) handleSetupError(error);
			}
		};

		void initialize();

		return () => {
			isDisposed = true;
			cleanupInstance();
		};
	}, [
		shader,
		plugins,
		options,
		autosize,
		cursorTarget,
		cursorTargetVersion,
		isManagedTexture,
		parentTextureRegistry,
	]);

	useEffect(() => {
		playbackControllerRef.current?.update({
			autoplay: isManagedTexture ? false : autoplay,
			autopause: isManagedTexture ? false : autopause,
		});
	}, [autoplay, autopause, isManagedTexture]);

	return (
		<ShaderPadTextureContext.Provider value={textureRegistryRef.current}>
			<canvas
				ref={canvasRef}
				style={{
					display: 'block',
					width: '100%',
					height: '100%',
					...style,
				}}
				{...canvasProps}
			/>
			{children ? (
				<div ref={textureHostRef} hidden>
					{children}
				</div>
			) : null}
		</ShaderPadTextureContext.Provider>
	);
});

ShaderPad.displayName = 'ShaderPad';

export default ShaderPad;
