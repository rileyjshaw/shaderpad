'use client';

Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: 'Module' } });
const require_index = require('./index.js');
const require_declarative_textures = require('./declarative-textures-AVGdoaZl.js');
const require_plugins_autosize = require('./plugins/autosize.js');
let react = require("react");
let react_jsx_runtime = require("react/jsx-runtime");

//#region src/react.tsx
const ShaderPadTextureContext = (0, react.createContext)(null);
const useClientLayoutEffect = typeof window === "undefined" ? react.useEffect : react.useLayoutEffect;
function isRefTarget(target) {
	return Boolean(target && typeof target === "object" && "current" in target);
}
function resolveCursorTarget(target) {
	if (isRefTarget(target)) return target.current ?? void 0;
	return target;
}
function queueUnhandledError(error) {
	queueMicrotask(() => {
		throw error;
	});
}
const ShaderPad = (0, react.forwardRef)(function ShaderPad({ shader, children, plugins, options, autosize: autosize$1 = true, cursorTarget, autoplay = true, autopause = true, onInit, onPreStep, onError, style, "data-texture": textureNameValue, "data-texture-history": textureHistory, "data-texture-preserve-y": texturePreserveY, "data-texture-internal-format": textureInternalFormat, "data-texture-format": textureFormat, "data-texture-type": textureType, "data-texture-min-filter": textureMinFilter, "data-texture-mag-filter": textureMagFilter, "data-texture-wrap-s": textureWrapS, "data-texture-wrap-t": textureWrapT, ...canvasProps }, ref) {
	const parentTextureRegistry = (0, react.useContext)(ShaderPadTextureContext);
	const canvasRef = (0, react.useRef)(null);
	const textureHostRef = (0, react.useRef)(null);
	const shaderRef = (0, react.useRef)(null);
	const liveTexturesRef = (0, react.useRef)([]);
	const playbackControllerRef = (0, react.useRef)(null);
	const destroyedShadersRef = (0, react.useRef)(/* @__PURE__ */ new WeakSet());
	const readyWaitersRef = (0, react.useRef)([]);
	const nestedTextureListenersRef = (0, react.useRef)(/* @__PURE__ */ new Set());
	const nestedTextureRegistrationsRef = (0, react.useRef)(/* @__PURE__ */ new Map());
	const nestedTextureNameRef = (0, react.useRef)(void 0);
	const nestedTextureOptionsRef = (0, react.useRef)({});
	const nestedTextureRegistrationRef = (0, react.useRef)(null);
	const textureRegistryRef = (0, react.useRef)(null);
	const onInitRef = (0, react.useRef)(onInit);
	const onPreStepRef = (0, react.useRef)(onPreStep);
	const onErrorRef = (0, react.useRef)(onError);
	const autoplayRef = (0, react.useRef)(autoplay);
	const autopauseRef = (0, react.useRef)(autopause);
	const [cursorTargetVersion, setCursorTargetVersion] = (0, react.useState)(0);
	const nestedTextureName = textureNameValue?.trim() || void 0;
	const isManagedTexture = Boolean(parentTextureRegistry && nestedTextureName);
	const nestedTextureAttributes = {
		"data-texture-history": textureHistory,
		"data-texture-preserve-y": texturePreserveY,
		"data-texture-internal-format": textureInternalFormat,
		"data-texture-format": textureFormat,
		"data-texture-type": textureType,
		"data-texture-min-filter": textureMinFilter,
		"data-texture-mag-filter": textureMagFilter,
		"data-texture-wrap-s": textureWrapS,
		"data-texture-wrap-t": textureWrapT
	};
	nestedTextureNameRef.current = nestedTextureName;
	nestedTextureOptionsRef.current = require_declarative_textures.parseTextureOptionsFromAttributes((name) => nestedTextureAttributes[name], "data-texture-");
	onInitRef.current = onInit;
	onPreStepRef.current = onPreStep;
	onErrorRef.current = onError;
	autoplayRef.current = autoplay;
	autopauseRef.current = autopause;
	if (!nestedTextureRegistrationRef.current) nestedTextureRegistrationRef.current = {
		id: Symbol("ShaderPad texture"),
		get name() {
			return nestedTextureNameRef.current ?? "";
		},
		get options() {
			return nestedTextureOptionsRef.current;
		},
		waitForShader() {
			if (shaderRef.current) return Promise.resolve(shaderRef.current);
			return new Promise((resolve, reject) => {
				readyWaitersRef.current.push({
					resolve,
					reject
				});
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
		pause() {
			const shaderInstance = shaderRef.current;
			if (shaderInstance) pauseShader(shaderInstance);
		},
		subscribe(listener) {
			nestedTextureListenersRef.current.add(listener);
			return () => nestedTextureListenersRef.current.delete(listener);
		}
	};
	if (!textureRegistryRef.current) textureRegistryRef.current = {
		getCanvas: () => canvasRef.current,
		register(registration) {
			nestedTextureRegistrationsRef.current.set(registration.id, registration);
			return () => {
				if (nestedTextureRegistrationsRef.current.get(registration.id) === registration) nestedTextureRegistrationsRef.current.delete(registration.id);
			};
		}
	};
	function resolveReadyWaiters(shaderInstance) {
		const waiters = readyWaitersRef.current.splice(0);
		for (const waiter of waiters) waiter.resolve(shaderInstance);
		for (const listener of nestedTextureListenersRef.current) listener(shaderInstance);
	}
	function rejectReadyWaiters(error) {
		const waiters = readyWaitersRef.current.splice(0);
		for (const waiter of waiters) waiter.reject(error);
	}
	function destroyShader(shaderInstance) {
		if (!shaderInstance || destroyedShadersRef.current.has(shaderInstance)) return;
		destroyedShadersRef.current.add(shaderInstance);
		if (shaderRef.current === shaderInstance) shaderRef.current = null;
		shaderInstance.destroy();
	}
	function destroyCurrentInstance() {
		playbackControllerRef.current?.destroy();
		playbackControllerRef.current = null;
		liveTexturesRef.current = [];
		destroyShader(shaderRef.current);
		rejectReadyWaiters(/* @__PURE__ */ new Error("ShaderPad was destroyed before initialization completed."));
	}
	function updateLiveTextures(shaderInstance, nestedRenderMode) {
		if (liveTexturesRef.current.length === 0) return;
		const updates = {};
		for (const binding of liveTexturesRef.current) {
			if (binding.kind === "dom") {
				const source = require_declarative_textures.getLiveDomTextureSource(binding.element);
				if (source) updates[binding.name] = source;
				continue;
			}
			const nestedShader = binding.registration.getShader();
			if (!nestedShader) continue;
			if (nestedRenderMode === "step") binding.registration.step();
			else if (nestedRenderMode === "draw") binding.registration.draw();
			updates[binding.name] = nestedShader;
		}
		if (Object.keys(updates).length > 0) shaderInstance.updateTextures(updates);
	}
	function pauseManagedTextures() {
		for (const binding of liveTexturesRef.current) if (binding.kind === "nested") binding.registration.pause();
	}
	function playShader(shaderInstance) {
		shaderInstance.play(() => onPreStepRef.current ? {} : void 0);
	}
	function pauseShader(shaderInstance) {
		shaderInstance.pause();
		pauseManagedTextures();
	}
	function managedStepShader(shaderInstance) {
		shaderInstance.step(onPreStepRef.current ? {} : void 0);
	}
	function stepShader(shaderInstance, stepOptions) {
		shaderInstance.step(stepOptions ? { ...stepOptions } : onPreStepRef.current ? {} : void 0);
	}
	function drawShader(shaderInstance, stepOptions) {
		updateLiveTextures(shaderInstance, "draw");
		shaderInstance.draw(stepOptions);
	}
	(0, react.useImperativeHandle)(ref, () => ({
		get shader() {
			return shaderRef.current;
		},
		get canvas() {
			return canvasRef.current;
		},
		play() {
			const shaderInstance = shaderRef.current;
			if (shaderInstance) playShader(shaderInstance);
		},
		pause() {
			const shaderInstance = shaderRef.current;
			if (shaderInstance) pauseShader(shaderInstance);
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
		clearHistory() {
			shaderRef.current?.clearHistory();
		},
		rewind() {
			shaderRef.current?.rewind();
		},
		reset() {
			shaderRef.current?.reset();
		},
		destroy() {
			destroyCurrentInstance();
		}
	}), []);
	useClientLayoutEffect(() => {
		if (!parentTextureRegistry || !nestedTextureName) return;
		return parentTextureRegistry.register(nestedTextureRegistrationRef.current);
	}, [parentTextureRegistry, nestedTextureName]);
	(0, react.useEffect)(() => {
		if (!isRefTarget(cursorTarget) || cursorTarget.current) return;
		let frameId = null;
		let isDisposed = false;
		const poll = () => {
			if (isDisposed) return;
			if (cursorTarget.current) {
				setCursorTargetVersion((version) => version + 1);
				return;
			}
			frameId = requestAnimationFrame(poll);
		};
		frameId = requestAnimationFrame(poll);
		return () => {
			isDisposed = true;
			if (frameId !== null) cancelAnimationFrame(frameId);
		};
	}, [cursorTarget]);
	(0, react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const resolvedCursorTarget = resolveCursorTarget(cursorTarget);
		if (isRefTarget(cursorTarget) && !resolvedCursorTarget) return;
		const effectiveAutosize = isManagedTexture && autosize$1 === true ? { target: parentTextureRegistry?.getCanvas() ?? canvas } : autosize$1;
		const installedPlugins = effectiveAutosize === false ? [...plugins ?? []] : [require_plugins_autosize.default(effectiveAutosize === true ? void 0 : effectiveAutosize), ...plugins ?? []];
		let instance = null;
		let playbackController = null;
		let isDisposed = false;
		let isPlaying = false;
		const cleanupCallbacks = [];
		const handlePlay = () => {
			isPlaying = true;
		};
		const handlePause = () => {
			isPlaying = false;
		};
		const handlePreStep = (time, frame, stepOptions) => {
			if (!instance) return;
			updateLiveTextures(instance, "step");
			const nextOptions = onPreStepRef.current?.(instance, time, frame);
			if (nextOptions && stepOptions) Object.assign(stepOptions, nextOptions);
		};
		const cleanupInstance = () => {
			if (playbackControllerRef.current === playbackController) playbackControllerRef.current = null;
			playbackController?.destroy();
			for (const cleanup of cleanupCallbacks.splice(0)) cleanup();
			liveTexturesRef.current = [];
			if (instance) {
				instance.off("play", handlePlay);
				instance.off("pause", handlePause);
				instance.off("preStep", handlePreStep);
			}
			destroyShader(instance);
		};
		const handleSetupError = (error) => {
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
				instance = new require_index.default(shader, {
					...options,
					canvas,
					plugins: installedPlugins,
					...resolvedCursorTarget ? { cursorTarget: resolvedCursorTarget } : {}
				});
				instance.on("play", handlePlay);
				instance.on("pause", handlePause);
				instance.on("preStep", handlePreStep);
				const domTextureBindings = [];
				for (const child of Array.from(textureHostRef.current?.children ?? [])) {
					const name = child.getAttribute("data-texture");
					if (!name || !require_declarative_textures.isDomTextureElement(child)) continue;
					domTextureBindings.push({
						kind: "dom",
						element: child,
						name,
						options: require_declarative_textures.parseTextureOptions(child, "data-texture-"),
						live: require_declarative_textures.isLiveDomTextureElement(child)
					});
				}
				const nestedTextureBindings = Array.from(nestedTextureRegistrationsRef.current.values()).filter((registration) => registration.name).map((registration) => ({
					kind: "nested",
					registration,
					name: registration.name,
					options: registration.options,
					live: true
				}));
				const textureBindings = [...domTextureBindings, ...nestedTextureBindings];
				for (const binding of textureBindings) {
					const source = binding.kind === "dom" ? await require_declarative_textures.loadDomTextureSource(binding.element) : await binding.registration.waitForShader();
					if (isDisposed) return;
					instance.initializeTexture(binding.name, source, binding.options);
				}
				liveTexturesRef.current = textureBindings.filter((binding) => binding.live);
				for (const binding of textureBindings) {
					if (binding.kind === "dom") {
						const cleanup = require_declarative_textures.addDomTextureRefreshListener(binding.element, () => {
							instance?.updateTextures({ [binding.name]: binding.element });
						});
						if (cleanup) cleanupCallbacks.push(cleanup);
						continue;
					}
					cleanupCallbacks.push(binding.registration.subscribe((nestedShader) => {
						instance?.updateTextures({ [binding.name]: nestedShader });
					}));
				}
				if (isDisposed) return;
				shaderRef.current = instance;
				onInitRef.current?.(instance, canvas);
				resolveReadyWaiters(instance);
				playbackController = require_declarative_textures.createPlaybackVisibilityController({
					target: canvas,
					autoplay: isManagedTexture ? false : autoplayRef.current,
					autopause: isManagedTexture ? false : autopauseRef.current,
					isPlaying: () => isPlaying,
					play: () => {
						if (instance && !isDisposed) playShader(instance);
					},
					pause: () => {
						if (instance) pauseShader(instance);
					}
				});
				playbackControllerRef.current = playbackController;
				playbackController.sync();
			} catch (error) {
				if (!isDisposed) handleSetupError(error);
			}
		};
		initialize();
		return () => {
			isDisposed = true;
			cleanupInstance();
		};
	}, [
		shader,
		plugins,
		options,
		autosize$1,
		cursorTarget,
		cursorTargetVersion,
		isManagedTexture,
		parentTextureRegistry
	]);
	(0, react.useEffect)(() => {
		playbackControllerRef.current?.update({
			autoplay: isManagedTexture ? false : autoplay,
			autopause: isManagedTexture ? false : autopause
		});
	}, [
		autoplay,
		autopause,
		isManagedTexture
	]);
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(ShaderPadTextureContext.Provider, {
		value: textureRegistryRef.current,
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("canvas", {
			ref: canvasRef,
			style: {
				display: "block",
				width: "100%",
				height: "100%",
				...style
			},
			...canvasProps
		}), children ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			ref: textureHostRef,
			hidden: true,
			children
		}) : null]
	});
});
ShaderPad.displayName = "ShaderPad";

//#endregion
exports.ShaderPad = ShaderPad;
exports.default = ShaderPad;
//# sourceMappingURL=react.js.map