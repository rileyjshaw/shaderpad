"use client";
import {
  index_default
} from "./chunk-KRIFZAFR.mjs";
import {
  autosize_default
} from "./chunk-DQT5EXJJ.mjs";
import "./chunk-OTFRVDNV.mjs";

// src/react.tsx
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from "react";
import { jsx } from "react/jsx-runtime";
function isRefTarget(target) {
  return Boolean(target && typeof target === "object" && "current" in target);
}
function resolveCursorTarget(target) {
  if (isRefTarget(target)) {
    return target.current ?? void 0;
  }
  return target;
}
function isElementInViewport(element) {
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.right > 0 && rect.top < window.innerHeight && rect.left < window.innerWidth;
}
function isElementRenderable(element) {
  if (typeof element.checkVisibility === "function") {
    return element.checkVisibility({
      contentVisibilityAuto: true,
      checkOpacity: true,
      checkVisibilityCSS: true
    });
  }
  const style = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
}
var ShaderPad = forwardRef(function ShaderPad2({
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
}, ref) {
  const canvasRef = useRef(null);
  const shaderRef = useRef(null);
  const destroyedShadersRef = useRef(/* @__PURE__ */ new WeakSet());
  const eventSubscriptionsRef = useRef({
    shader: null,
    listeners: /* @__PURE__ */ new Map()
  });
  const syncPlaybackRef = useRef(null);
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
  function clearEventSubscriptions(shader2) {
    const store = eventSubscriptionsRef.current;
    const activeShader = shader2 ?? store.shader;
    if (!activeShader) {
      return;
    }
    for (const [name, listener] of store.listeners) {
      activeShader.off(name, listener);
    }
    store.listeners.clear();
    if (!shader2 || store.shader === shader2) {
      store.shader = null;
    }
  }
  function syncEventSubscriptions(shader2) {
    const store = eventSubscriptionsRef.current;
    if (store.shader && store.shader !== shader2) {
      clearEventSubscriptions(store.shader);
    }
    if (!shader2) {
      return;
    }
    const entries = Object.entries(eventsRef.current ?? {}).filter(([, handler]) => typeof handler === "function");
    const nextKeys = new Set(entries.map(([name]) => name));
    for (const [name, listener] of store.listeners) {
      if (!nextKeys.has(name)) {
        shader2.off(name, listener);
        store.listeners.delete(name);
      }
    }
    for (const [name] of entries) {
      if (store.listeners.has(name)) {
        continue;
      }
      const listener = (...args) => {
        const handler = eventsRef.current?.[name];
        if (typeof handler === "function") {
          handler(...args);
        }
      };
      shader2.on(name, listener);
      store.listeners.set(name, listener);
    }
    store.shader = shader2;
  }
  function destroyShader(shader2) {
    if (!shader2 || destroyedShadersRef.current.has(shader2)) {
      return;
    }
    destroyedShadersRef.current.add(shader2);
    clearEventSubscriptions(shader2);
    if (shaderRef.current === shader2) {
      shaderRef.current = null;
      syncPlaybackRef.current = null;
    }
    shader2.destroy();
  }
  function playShader(shader2) {
    shader2.play((time, frame) => onBeforeStepRef.current?.(shader2, time, frame));
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
        const shader2 = shaderRef.current;
        if (shader2) {
          playShader(shader2);
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
      }
    }),
    []
  );
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
    const installedPlugins = autosize === false ? [...plugins ?? []] : [autosize_default(autosize === true ? void 0 : autosize), ...plugins ?? []];
    let instance = null;
    let isDisposed = false;
    let isDocumentVisible = document.visibilityState === "visible";
    let isIntersecting = isElementInViewport(canvas);
    let lastOnscreen = null;
    let isPlaying = false;
    let isManagedPlayback = false;
    const handlePlay = () => {
      isPlaying = true;
    };
    const handlePause = () => {
      isPlaying = false;
    };
    const handleVisibilityChange = () => {
      isDocumentVisible = document.visibilityState === "visible";
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
    const intersectionObserver = typeof IntersectionObserver === "function" ? new IntersectionObserver(
      (entries) => {
        isIntersecting = entries.some((entry) => entry.isIntersecting && entry.intersectionRatio > 0);
        syncPlayback();
      },
      { threshold: 0.01 }
    ) : null;
    try {
      instance = new index_default(shader, {
        ...options,
        canvas,
        plugins: installedPlugins,
        ...resolvedCursorTarget ? { cursorTarget: resolvedCursorTarget } : {}
      });
      instance.on("play", handlePlay);
      instance.on("pause", handlePause);
      shaderRef.current = instance;
      syncEventSubscriptions(instance);
      onInitRef.current?.(instance, canvas);
      intersectionObserver?.observe(canvas);
      document.addEventListener("visibilitychange", handleVisibilityChange);
      syncPlaybackRef.current = syncPlayback;
      syncPlayback();
    } catch (error) {
      intersectionObserver?.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (instance) {
        instance.off("play", handlePlay);
        instance.off("pause", handlePause);
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
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (instance) {
        instance.off("play", handlePlay);
        instance.off("pause", handlePause);
      }
      destroyShader(instance);
    };
  }, [shader, plugins, options, autosize, cursorTarget, cursorTargetVersion]);
  useEffect(() => {
    syncEventSubscriptions(shaderRef.current);
  }, [
    Object.keys(events ?? {}).sort().join("\n")
  ]);
  useEffect(() => {
    syncPlaybackRef.current?.();
  }, [autoPlay, pauseWhenOffscreen]);
  return /* @__PURE__ */ jsx(
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
  );
});
ShaderPad.displayName = "ShaderPad";
var react_default = ShaderPad;
export {
  ShaderPad,
  react_default as default
};
//# sourceMappingURL=react.mjs.map