"use client";
import {
  addDomTextureRefreshListener,
  createPlaybackVisibilityController,
  getLiveDomTextureSource,
  isDomTextureElement,
  isLiveDomTextureElement,
  loadDomTextureSource,
  parseTextureOptions,
  parseTextureOptionsFromAttributes
} from "./chunk-YN3AO6HP.mjs";
import {
  index_default
} from "./chunk-QYD24S7K.mjs";
import {
  autosize_default
} from "./chunk-DQT5EXJJ.mjs";
import "./chunk-OTFRVDNV.mjs";

// src/react.tsx
import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState
} from "react";
import { jsx, jsxs } from "react/jsx-runtime";
var ShaderPadTextureContext = createContext(null);
var useClientLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
function isRefTarget(target) {
  return Boolean(target && typeof target === "object" && "current" in target);
}
function resolveCursorTarget(target) {
  if (isRefTarget(target)) {
    return target.current ?? void 0;
  }
  return target;
}
function queueUnhandledError(error) {
  queueMicrotask(() => {
    throw error;
  });
}
var ShaderPad = forwardRef(function ShaderPad2({
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
  "data-texture": textureNameValue,
  "data-texture-history": textureHistory,
  "data-texture-preserve-y": texturePreserveY,
  "data-texture-internal-format": textureInternalFormat,
  "data-texture-format": textureFormat,
  "data-texture-type": textureType,
  "data-texture-min-filter": textureMinFilter,
  "data-texture-mag-filter": textureMagFilter,
  "data-texture-wrap-s": textureWrapS,
  "data-texture-wrap-t": textureWrapT,
  ...canvasProps
}, ref) {
  const parentTextureRegistry = useContext(ShaderPadTextureContext);
  const canvasRef = useRef(null);
  const textureHostRef = useRef(null);
  const shaderRef = useRef(null);
  const liveTexturesRef = useRef([]);
  const playbackControllerRef = useRef(null);
  const destroyedShadersRef = useRef(/* @__PURE__ */ new WeakSet());
  const readyWaitersRef = useRef([]);
  const nestedTextureListenersRef = useRef(/* @__PURE__ */ new Set());
  const nestedTextureRegistrationsRef = useRef(/* @__PURE__ */ new Map());
  const nestedTextureNameRef = useRef(void 0);
  const nestedTextureOptionsRef = useRef({});
  const nestedTextureRegistrationRef = useRef(null);
  const textureRegistryRef = useRef(null);
  const onInitRef = useRef(onInit);
  const onBeforeStepRef = useRef(onBeforeStep);
  const onErrorRef = useRef(onError);
  const autoplayRef = useRef(autoplay);
  const autopauseRef = useRef(autopause);
  const [cursorTargetVersion, setCursorTargetVersion] = useState(0);
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
  nestedTextureOptionsRef.current = parseTextureOptionsFromAttributes(
    (name) => nestedTextureAttributes[name],
    "data-texture-"
  );
  onInitRef.current = onInit;
  onBeforeStepRef.current = onBeforeStep;
  onErrorRef.current = onError;
  autoplayRef.current = autoplay;
  autopauseRef.current = autopause;
  if (!nestedTextureRegistrationRef.current) {
    nestedTextureRegistrationRef.current = {
      id: /* @__PURE__ */ Symbol("ShaderPad texture"),
      get name() {
        return nestedTextureNameRef.current ?? "";
      },
      get options() {
        return nestedTextureOptionsRef.current;
      },
      waitForShader() {
        if (shaderRef.current) return Promise.resolve(shaderRef.current);
        return new Promise((resolve, reject) => {
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
      }
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
      }
    };
  }
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
    rejectReadyWaiters(new Error("ShaderPad was destroyed before initialization completed."));
  }
  function updateLiveTextures(shaderInstance, nestedRenderMode) {
    if (liveTexturesRef.current.length === 0) return;
    const updates = {};
    for (const binding of liveTexturesRef.current) {
      if (binding.kind === "dom") {
        const source = getLiveDomTextureSource(binding.element);
        if (source) updates[binding.name] = source;
        continue;
      }
      const nestedShader = binding.registration.getShader();
      if (!nestedShader) continue;
      if (nestedRenderMode === "step") {
        binding.registration.step();
      } else if (nestedRenderMode === "draw") {
        binding.registration.draw();
      }
      updates[binding.name] = nestedShader;
    }
    if (Object.keys(updates).length > 0) shaderInstance.updateTextures(updates);
  }
  function playShader(shaderInstance) {
    shaderInstance.play(() => onBeforeStepRef.current ? {} : void 0);
  }
  function managedStepShader(shaderInstance) {
    shaderInstance.step(onBeforeStepRef.current ? {} : void 0);
  }
  function stepShader(shaderInstance, stepOptions) {
    shaderInstance.step(stepOptions ? { ...stepOptions } : onBeforeStepRef.current ? {} : void 0);
  }
  function drawShader(shaderInstance, stepOptions) {
    updateLiveTextures(shaderInstance, "draw");
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
      }
    }),
    []
  );
  useClientLayoutEffect(() => {
    if (!parentTextureRegistry || !nestedTextureName) return;
    return parentTextureRegistry.register(nestedTextureRegistrationRef.current);
  }, [parentTextureRegistry, nestedTextureName]);
  useEffect(() => {
    if (!isRefTarget(cursorTarget) || cursorTarget.current) {
      return;
    }
    let frameId = null;
    let isDisposed = false;
    const poll = () => {
      if (isDisposed) {
        return;
      }
      if (cursorTarget.current) {
        setCursorTargetVersion((version) => version + 1);
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
    const effectiveAutosize = isManagedTexture && autosize === true ? { target: parentTextureRegistry?.getCanvas() ?? canvas } : autosize;
    const installedPlugins = effectiveAutosize === false ? [...plugins ?? []] : [autosize_default(effectiveAutosize === true ? void 0 : effectiveAutosize), ...plugins ?? []];
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
    const handleBeforeStep = (time, frame, stepOptions) => {
      if (!instance) return;
      updateLiveTextures(instance, "step");
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
        instance.off("play", handlePlay);
        instance.off("pause", handlePause);
        instance.off("beforeStep", handleBeforeStep);
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
        instance = new index_default(shader, {
          ...options,
          canvas,
          plugins: installedPlugins,
          ...resolvedCursorTarget ? { cursorTarget: resolvedCursorTarget } : {}
        });
        instance.on("play", handlePlay);
        instance.on("pause", handlePause);
        instance.on("beforeStep", handleBeforeStep);
        const domTextureBindings = [];
        for (const child of Array.from(textureHostRef.current?.children ?? [])) {
          const name = child.getAttribute("data-texture");
          if (!name || !isDomTextureElement(child)) continue;
          domTextureBindings.push({
            kind: "dom",
            element: child,
            name,
            options: parseTextureOptions(child, "data-texture-"),
            live: isLiveDomTextureElement(child)
          });
        }
        const nestedTextureBindings = Array.from(
          nestedTextureRegistrationsRef.current.values()
        ).filter((registration) => registration.name).map((registration) => ({
          kind: "nested",
          registration,
          name: registration.name,
          options: registration.options,
          live: true
        }));
        const textureBindings = [...domTextureBindings, ...nestedTextureBindings];
        for (const binding of textureBindings) {
          const source = binding.kind === "dom" ? await loadDomTextureSource(binding.element) : await binding.registration.waitForShader();
          if (isDisposed) return;
          instance.initializeTexture(binding.name, source, binding.options);
        }
        liveTexturesRef.current = textureBindings.filter((binding) => binding.live);
        for (const binding of textureBindings) {
          if (binding.kind === "dom") {
            const cleanup = addDomTextureRefreshListener(binding.element, () => {
              instance?.updateTextures({ [binding.name]: binding.element });
            });
            if (cleanup) cleanupCallbacks.push(cleanup);
            continue;
          }
          cleanupCallbacks.push(
            binding.registration.subscribe((nestedShader) => {
              instance?.updateTextures({ [binding.name]: nestedShader });
            })
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
          pause: () => instance?.pause()
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
    parentTextureRegistry
  ]);
  useEffect(() => {
    playbackControllerRef.current?.update({
      autoplay: isManagedTexture ? false : autoplay,
      autopause: isManagedTexture ? false : autopause
    });
  }, [autoplay, autopause, isManagedTexture]);
  return /* @__PURE__ */ jsxs(ShaderPadTextureContext.Provider, { value: textureRegistryRef.current, children: [
    /* @__PURE__ */ jsx(
      "canvas",
      {
        ref: canvasRef,
        style: {
          display: "block",
          width: "100%",
          height: "100%",
          ...style
        },
        ...canvasProps
      }
    ),
    children ? /* @__PURE__ */ jsx("div", { ref: textureHostRef, hidden: true, children }) : null
  ] });
});
ShaderPad.displayName = "ShaderPad";
var react_default = ShaderPad;
export {
  ShaderPad,
  react_default as default
};
//# sourceMappingURL=react.mjs.map