'use client';

import {
	type ComponentPropsWithoutRef,
	forwardRef,
	type RefObject,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from 'react';

import CoreShaderPad, { type Options, type Plugin, type StepOptions } from '.';
import autosizePlugin, { type AutosizeOptions } from './plugins/autosize';

type CursorTarget = Window | Element | RefObject<Element | null>;
type EventMap = Partial<Record<string, (...args: any[]) => void>>;

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

export interface ShaderPadProps extends Omit<ComponentPropsWithoutRef<'canvas'>, 'children' | 'onError'> {
	shader: string;
	plugins?: Plugin[];
	options?: Omit<Options, 'canvas' | 'plugins' | 'cursorTarget'>;
	autosize?: boolean | AutosizeOptions;
	cursorTarget?: CursorTarget;
	autoPlay?: boolean;
	pauseWhenOffscreen?: boolean;
	onInit?: (shader: CoreShaderPad, canvas: HTMLCanvasElement) => void;
	onBeforeStep?: (shader: CoreShaderPad, time: number, frame: number) => StepOptions | void;
	onError?: (error: unknown) => void;
	onOnscreenChange?: (isOnscreen: boolean) => void;
	events?: EventMap;
}

function isRefTarget(target: CursorTarget | undefined): target is RefObject<Element | null> {
	return Boolean(target && typeof target === 'object' && 'current' in target);
}

function resolveCursorTarget(target: CursorTarget | undefined) {
	if (isRefTarget(target)) {
		return target.current ?? undefined;
	}

	return target;
}

function isElementInViewport(element: HTMLElement) {
	const rect = element.getBoundingClientRect();
	return (
		rect.width > 0 &&
		rect.height > 0 &&
		rect.bottom > 0 &&
		rect.right > 0 &&
		rect.top < window.innerHeight &&
		rect.left < window.innerWidth
	);
}

function isElementRenderable(element: HTMLElement) {
	if (typeof element.checkVisibility === 'function') {
		return element.checkVisibility({
			contentVisibilityAuto: true,
			checkOpacity: true,
			checkVisibilityCSS: true,
		});
	}

	const style = window.getComputedStyle(element);
	const rect = element.getBoundingClientRect();
	return (
		rect.width > 0 &&
		rect.height > 0 &&
		style.display !== 'none' &&
		style.visibility !== 'hidden' &&
		style.opacity !== '0'
	);
}

export const ShaderPad = forwardRef<ShaderPadHandle, ShaderPadProps>(function ShaderPad(
	{
		shader,
		plugins,
		options,
		autosize = true,
		cursorTarget,
		autoPlay = true,
		pauseWhenOffscreen = true,
		onInit,
		onBeforeStep,
		onError,
		onOnscreenChange,
		events,
		style,
		...canvasProps
	},
	ref,
) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const shaderRef = useRef<CoreShaderPad | null>(null);
	const destroyedShadersRef = useRef(new WeakSet<CoreShaderPad>());
	const eventSubscriptionsRef = useRef<{
		shader: CoreShaderPad | null;
		listeners: Map<string, (...args: any[]) => void>;
	}>({
		shader: null,
		listeners: new Map(),
	});
	const syncPlaybackRef = useRef<(() => void) | null>(null);
	const onInitRef = useRef(onInit);
	const onBeforeStepRef = useRef(onBeforeStep);
	const onErrorRef = useRef(onError);
	const onOnscreenChangeRef = useRef(onOnscreenChange);
	const eventsRef = useRef(events);
	const autoPlayRef = useRef(autoPlay);
	const pauseWhenOffscreenRef = useRef(pauseWhenOffscreen);
	const [cursorTargetVersion, setCursorTargetVersion] = useState(0);

	onInitRef.current = onInit;
	onBeforeStepRef.current = onBeforeStep;
	onErrorRef.current = onError;
	onOnscreenChangeRef.current = onOnscreenChange;
	eventsRef.current = events;
	autoPlayRef.current = autoPlay;
	pauseWhenOffscreenRef.current = pauseWhenOffscreen;

	function clearEventSubscriptions(shader?: CoreShaderPad | null) {
		const store = eventSubscriptionsRef.current;
		const activeShader = shader ?? store.shader;
		if (!activeShader) {
			return;
		}

		for (const [name, listener] of store.listeners) {
			activeShader.off(name as any, listener);
		}

		store.listeners.clear();
		if (!shader || store.shader === shader) {
			store.shader = null;
		}
	}

	function syncEventSubscriptions(shader: CoreShaderPad | null) {
		const store = eventSubscriptionsRef.current;
		if (store.shader && store.shader !== shader) {
			clearEventSubscriptions(store.shader);
		}
		if (!shader) {
			return;
		}

		const entries = Object.entries(eventsRef.current ?? {}).filter(([, handler]) => typeof handler === 'function');
		const nextKeys = new Set(entries.map(([name]) => name));

		for (const [name, listener] of store.listeners) {
			if (!nextKeys.has(name)) {
				shader.off(name as any, listener);
				store.listeners.delete(name);
			}
		}

		for (const [name] of entries) {
			if (store.listeners.has(name)) {
				continue;
			}

			const listener = (...args: any[]) => {
				const handler = eventsRef.current?.[name];
				if (typeof handler === 'function') {
					handler(...args);
				}
			};

			shader.on(name as any, listener);
			store.listeners.set(name, listener);
		}

		store.shader = shader;
	}

	function destroyShader(shader: CoreShaderPad | null) {
		if (!shader || destroyedShadersRef.current.has(shader)) {
			return;
		}

		destroyedShadersRef.current.add(shader);
		clearEventSubscriptions(shader);
		if (shaderRef.current === shader) {
			shaderRef.current = null;
			syncPlaybackRef.current = null;
		}
		shader.destroy();
	}

	function playShader(shader: CoreShaderPad) {
		shader.play((time, frame) => onBeforeStepRef.current?.(shader, time, frame));
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
				const shader = shaderRef.current;
				if (shader) {
					playShader(shader);
				}
			},
			pause() {
				shaderRef.current?.pause();
			},
			step(stepOptions) {
				shaderRef.current?.step(stepOptions);
			},
			draw(stepOptions) {
				shaderRef.current?.draw(stepOptions);
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
				destroyShader(shaderRef.current);
			},
		}),
		[],
	);

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

		const installedPlugins =
			autosize === false
				? [...(plugins ?? [])]
				: [autosizePlugin(autosize === true ? undefined : autosize), ...(plugins ?? [])];

		let instance: CoreShaderPad | null = null;
		let isDisposed = false;
		let isDocumentVisible = document.visibilityState === 'visible';
		let isIntersecting = isElementInViewport(canvas);
		let lastOnscreen: boolean | null = null;
		let isPlaying = false;
		let isManagedPlayback = false;

		const handlePlay = () => {
			isPlaying = true;
		};
		const handlePause = () => {
			isPlaying = false;
		};

		const handleVisibilityChange = () => {
			isDocumentVisible = document.visibilityState === 'visible';
			syncPlayback();
		};

		const syncPlayback = () => {
			if (!instance || isDisposed) {
				return;
			}

			const isOnscreen = isDocumentVisible && isIntersecting && isElementRenderable(canvas) && canvas.isConnected;

			if (lastOnscreen !== isOnscreen) {
				lastOnscreen = isOnscreen;
				onOnscreenChangeRef.current?.(isOnscreen);
			}

			if (!autoPlayRef.current) {
				if (isManagedPlayback && isPlaying) {
					instance.pause();
				}
				isManagedPlayback = false;
				return;
			}

			if (!pauseWhenOffscreenRef.current) {
				if (!isPlaying) {
					playShader(instance);
				}
				isManagedPlayback = true;
				return;
			}

			if (isOnscreen) {
				if (!isPlaying) {
					playShader(instance);
				}
				isManagedPlayback = true;
				return;
			}

			if (isPlaying) {
				instance.pause();
			}
			isManagedPlayback = false;
		};

		const intersectionObserver =
			typeof IntersectionObserver === 'function'
				? new IntersectionObserver(
						entries => {
							isIntersecting = entries.some(entry => entry.isIntersecting && entry.intersectionRatio > 0);
							syncPlayback();
						},
						{ threshold: 0.01 },
					)
				: null;

		try {
			instance = new CoreShaderPad(shader, {
				...options,
				canvas,
				plugins: installedPlugins,
				...(resolvedCursorTarget ? { cursorTarget: resolvedCursorTarget } : {}),
			});
			instance.on('play', handlePlay);
			instance.on('pause', handlePause);
			shaderRef.current = instance;
			syncEventSubscriptions(instance);
			onInitRef.current?.(instance, canvas);

			intersectionObserver?.observe(canvas);
			document.addEventListener('visibilitychange', handleVisibilityChange);
			syncPlaybackRef.current = syncPlayback;
			syncPlayback();
		} catch (error) {
			intersectionObserver?.disconnect();
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			if (instance) {
				instance.off('play', handlePlay);
				instance.off('pause', handlePause);
			}
			destroyShader(instance);
			if (onErrorRef.current) {
				onErrorRef.current(error);
				return;
			}
			throw error;
		}

		return () => {
			isDisposed = true;
			intersectionObserver?.disconnect();
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			if (instance) {
				instance.off('play', handlePlay);
				instance.off('pause', handlePause);
			}
			destroyShader(instance);
		};
	}, [shader, plugins, options, autosize, cursorTarget, cursorTargetVersion]);

	useEffect(() => {
		syncEventSubscriptions(shaderRef.current);
	}, [
		Object.keys(events ?? {})
			.sort()
			.join('\n'),
	]);

	useEffect(() => {
		syncPlaybackRef.current?.();
	}, [autoPlay, pauseWhenOffscreen]);

	return (
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
	);
});

ShaderPad.displayName = 'ShaderPad';
