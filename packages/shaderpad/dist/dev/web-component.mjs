import {
  addDomTextureRefreshListener,
  createPlaybackVisibilityController,
  getLiveDomTextureSource,
  isDomTextureElement,
  isLiveDomTextureElement,
  loadDomTextureSource,
  parseBooleanLikeValue,
  parseTextureOptions
} from "./chunk-YN3AO6HP.mjs";
import {
  index_default
} from "./chunk-QYD24S7K.mjs";
import {
  autosize_default
} from "./chunk-DQT5EXJJ.mjs";
import "./chunk-OTFRVDNV.mjs";

// src/web-component.ts
var DEFAULT_AUTOPLAY = true;
var DEFAULT_AUTOPAUSE = true;
var HOST_DEFAULT_ATTRIBUTE = "data-shaderpad-host";
var HOST_DEFAULT_STYLE_ID = "shaderpad-web-component-defaults";
var ShaderPadElementBase = typeof HTMLElement === "undefined" ? class {
} : HTMLElement;
function normalizeShaderPadConfig(config) {
  return {
    plugins: [...config?.plugins ?? []],
    options: { ...config?.options ?? {} },
    autosize: config?.autosize ?? true,
    cursorTarget: config?.cursorTarget ?? null,
    autoplay: config?.autoplay ?? DEFAULT_AUTOPLAY,
    autopause: config?.autopause ?? DEFAULT_AUTOPAUSE
  };
}
function ensureShaderPadHostDefaults(element) {
  if (!element.hasAttribute(HOST_DEFAULT_ATTRIBUTE)) {
    element.setAttribute(HOST_DEFAULT_ATTRIBUTE, "");
  }
  const document = element.ownerDocument;
  if (!document || document.getElementById(HOST_DEFAULT_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = HOST_DEFAULT_STYLE_ID;
  style.textContent = [
    `:where([${HOST_DEFAULT_ATTRIBUTE}]) { display: block; width: 100%; }`,
    `:where([${HOST_DEFAULT_ATTRIBUTE}]:not([for])) { height: 100%; }`
  ].join("\n");
  (document.head ?? document.documentElement ?? document.body)?.appendChild(style);
}
async function loadNestedShaderPadSource(element) {
  if (element.shader) return element.shader;
  return await new Promise((resolve, reject) => {
    const handleLoad = (event) => {
      cleanup();
      resolve(event.detail.shader);
    };
    const handleError = (event) => {
      cleanup();
      reject(event);
    };
    const cleanup = () => {
      element.removeEventListener("load", handleLoad);
      element.removeEventListener("error", handleError);
    };
    element.addEventListener("load", handleLoad, { once: true });
    element.addEventListener("error", handleError, { once: true });
  });
}
var ShaderPadElement = class _ShaderPadElement extends ShaderPadElementBase {
  static observedAttributes = ["autoplay", "autopause"];
  static shaderPadConfig = normalizeShaderPadConfig();
  shaderInstance = null;
  renderCanvas = null;
  generatedCanvas = null;
  initPromise = null;
  pluginsValue = [];
  defaultOptionsValue = {};
  optionsValue = {};
  autosizeValue = true;
  cursorTargetValue = null;
  autoplayValue = DEFAULT_AUTOPLAY;
  autopauseValue = DEFAULT_AUTOPAUSE;
  isPlaying = false;
  playbackController = null;
  cleanupCallbacks = [];
  textureRestoreCallbacks = [];
  controlVisibility = /* @__PURE__ */ new Map();
  liveTextures = [];
  constructor() {
    super();
    ensureShaderPadHostDefaults(this);
    const defaults = this.constructor.shaderPadConfig;
    this.pluginsValue = [...defaults.plugins];
    this.defaultOptionsValue = { ...defaults.options };
    this.autosizeValue = defaults.autosize;
    this.cursorTargetValue = defaults.cursorTarget;
    this.autoplayValue = parseBooleanLikeValue(this.getAttribute("autoplay"), defaults.autoplay);
    this.autopauseValue = parseBooleanLikeValue(this.getAttribute("autopause"), defaults.autopause);
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
      ...this.optionsValue
    };
  }
  set options(value) {
    this.optionsValue = value ? { ...value } : {};
  }
  get autosize() {
    return this.autosizeValue;
  }
  set autosize(value) {
    this.autosizeValue = value ?? true;
  }
  get cursorTarget() {
    return this.cursorTargetValue;
  }
  set cursorTarget(value) {
    this.cursorTargetValue = value ?? null;
  }
  get autoplay() {
    return this.autoplayValue;
  }
  set autoplay(value) {
    const nextValue = Boolean(value);
    if (this.autoplayValue === nextValue) return;
    this.autoplayValue = nextValue;
    this.reflectDefaultTrueAttribute("autoplay", nextValue);
    this.syncPlayback();
  }
  get autopause() {
    return this.autopauseValue;
  }
  set autopause(value) {
    const nextValue = Boolean(value);
    if (this.autopauseValue === nextValue) return;
    this.autopauseValue = nextValue;
    this.reflectDefaultTrueAttribute("autopause", nextValue);
    this.syncPlayback();
  }
  connectedCallback() {
    void this.ensureInitialized().catch(() => {
    });
  }
  disconnectedCallback() {
    this.destroyInstance();
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name !== "autoplay" && name !== "autopause") return;
    const defaults = this.constructor.shaderPadConfig;
    const value = parseBooleanLikeValue(newValue, defaults[name]);
    if (name === "autoplay") this.autoplayValue = value;
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
  step(options) {
    const instance = this.shaderInstance;
    if (!instance) return;
    instance.step(options ? { ...options } : {});
  }
  draw(options) {
    this.updateLiveTextures("draw");
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
  emit(type, detail) {
    this.dispatchEvent(
      new CustomEvent(type, {
        detail,
        bubbles: true,
        composed: true
      })
    );
  }
  addCleanupListener(target, type, listener) {
    target.addEventListener(type, listener);
    this.cleanupCallbacks.push(() => target.removeEventListener(type, listener));
  }
  reflectDefaultTrueAttribute(name, value) {
    if (value) {
      this.removeAttribute(name);
      return;
    }
    this.setAttribute(name, String(value));
  }
  ensureInitialized() {
    if (this.shaderInstance) return Promise.resolve(this.shaderInstance);
    if (this.initPromise) return this.initPromise;
    if (!this.isConnected) {
      return Promise.reject(new Error("Cannot initialize <shader-pad> while it is disconnected."));
    }
    this.initPromise = this.initialize().catch((error) => {
      this.initPromise = null;
      throw error;
    });
    return this.initPromise;
  }
  async initialize() {
    try {
      const fragmentScript = this.getFragmentShaderScript();
      if (!fragmentScript) {
        throw new Error('A direct child <script type="x-shader/x-fragment"> is required.');
      }
      const fragmentShaderSrc = await this.getFragmentShaderSource(fragmentScript);
      const { canvas, owned } = this.resolveRenderCanvas();
      const textureBindings = this.getTextureBindings();
      this.prepareNestedTextureChildren(textureBindings);
      const instance = new index_default(fragmentShaderSrc, {
        ...this.defaultOptionsValue,
        ...this.optionsValue,
        canvas,
        plugins: this.getInstalledPlugins(owned),
        ...this.cursorTargetValue ? { cursorTarget: this.cursorTargetValue } : {}
      });
      this.shaderInstance = instance;
      this.renderCanvas = canvas;
      this.bindInstanceEvents(instance);
      await this.initializeTextures(instance, textureBindings);
      this.liveTextures = textureBindings.filter((binding) => binding.live);
      this.installChildListeners(textureBindings);
      this.hideControlChildren([fragmentScript, ...textureBindings.map((binding) => binding.element)]);
      this.setupPlayback(instance, canvas);
      this.emit("load", { shader: instance, canvas });
      this.playbackController?.sync();
      return instance;
    } catch (error) {
      this.destroyInstance();
      this.emit("error", { error });
      throw error;
    }
  }
  getInstalledPlugins(ownedCanvas) {
    if (!ownedCanvas || this.autosizeValue === false) return [...this.pluginsValue];
    const autosizeOptions = this.autosizeValue === true ? { target: this } : { target: this, ...this.autosizeValue };
    return [autosize_default(autosizeOptions), ...this.pluginsValue];
  }
  bindInstanceEvents(instance) {
    const handlePlay = () => {
      this.isPlaying = true;
    };
    const handlePause = () => {
      this.isPlaying = false;
    };
    const handleBeforeStep = (time, frame, options) => {
      this.updateLiveTextures("step");
      this.dispatchMutableBeforeStep(instance, time, frame, options);
    };
    instance.on("play", handlePlay);
    instance.on("pause", handlePause);
    instance.on("beforeStep", handleBeforeStep);
    this.cleanupCallbacks.push(() => {
      instance.off("play", handlePlay);
      instance.off("pause", handlePause);
      instance.off("beforeStep", handleBeforeStep);
    });
  }
  setupPlayback(instance, canvas) {
    this.playbackController?.destroy();
    this.playbackController = createPlaybackVisibilityController({
      target: canvas,
      autoplay: this.autoplayValue,
      autopause: this.autopauseValue,
      isPlaying: () => this.isPlaying,
      play: () => this.playInstance(instance),
      pause: () => instance.pause(),
      onVisibilityChange: (isVisible) => {
        this.emit("visibilityChange", {
          shader: instance,
          canvas,
          isVisible
        });
      }
    });
  }
  syncPlayback() {
    this.playbackController?.update({
      autoplay: this.autoplayValue,
      autopause: this.autopauseValue
    });
  }
  destroyInstance() {
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
  getFragmentShaderScript() {
    return Array.from(this.children).find(
      (child) => child instanceof HTMLScriptElement && child.getAttribute("type") === "x-shader/x-fragment"
    );
  }
  async getFragmentShaderSource(script) {
    if (script.hasAttribute("src")) {
      const response = await fetch(script.src);
      if (!response.ok) throw new Error(`Failed to load fragment shader from "${script.src}".`);
      return await response.text();
    }
    const source = script.textContent?.trim() ?? "";
    if (!source) throw new Error("The fragment shader script is empty.");
    return source;
  }
  resolveRenderCanvas() {
    const forId = this.getAttribute("for")?.trim();
    if (forId) {
      this.removeGeneratedCanvas();
      const candidate = this.ownerDocument.getElementById(forId);
      if (!(candidate instanceof HTMLCanvasElement)) {
        throw new Error(`No <canvas> with id "${forId}" was found for <shader-pad for="${forId}">.`);
      }
      return { canvas: candidate, owned: false };
    }
    const ownedCanvas = Array.from(this.children).find(
      (child) => child instanceof HTMLCanvasElement && child !== this.generatedCanvas && !child.hasAttribute("data-texture")
    );
    if (ownedCanvas) {
      this.removeGeneratedCanvas();
      return { canvas: ownedCanvas, owned: true };
    }
    return { canvas: this.ensureGeneratedCanvas(), owned: true };
  }
  ensureGeneratedCanvas() {
    if (this.generatedCanvas?.parentElement === this) return this.generatedCanvas;
    const canvas = this.ownerDocument.createElement("canvas");
    canvas.dataset.shaderpadGenerated = "true";
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    this.appendChild(canvas);
    this.generatedCanvas = canvas;
    return canvas;
  }
  removeGeneratedCanvas() {
    if (this.generatedCanvas?.parentElement === this) {
      this.generatedCanvas.remove();
    }
  }
  getTextureBindings() {
    const bindings = [];
    for (const child of Array.from(this.children)) {
      const name = child.getAttribute("data-texture");
      if (!name) continue;
      if (isDomTextureElement(child)) {
        bindings.push({
          element: child,
          name,
          options: parseTextureOptions(child, "data-texture-"),
          live: isLiveDomTextureElement(child)
        });
        continue;
      }
      if (child instanceof _ShaderPadElement) {
        bindings.push({
          element: child,
          name,
          options: parseTextureOptions(child, "data-texture-"),
          live: true
        });
      }
    }
    return bindings;
  }
  prepareNestedTextureChildren(bindings) {
    for (const binding of bindings) {
      if (!(binding.element instanceof _ShaderPadElement)) continue;
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
  async initializeTextures(instance, bindings) {
    for (const binding of bindings) {
      const source = isDomTextureElement(binding.element) ? await loadDomTextureSource(binding.element) : await loadNestedShaderPadSource(binding.element);
      instance.initializeTexture(binding.name, source, binding.options);
    }
  }
  installChildListeners(bindings) {
    for (const binding of bindings) {
      if (isDomTextureElement(binding.element)) {
        const cleanup = addDomTextureRefreshListener(binding.element, () => {
          this.shaderInstance?.updateTextures({ [binding.name]: binding.element });
        });
        if (cleanup) this.cleanupCallbacks.push(cleanup);
        continue;
      }
      if (binding.element instanceof _ShaderPadElement) {
        const nested = binding.element;
        const handleLoad = () => {
          if (nested.shader) this.shaderInstance?.updateTextures({ [binding.name]: nested.shader });
        };
        this.addCleanupListener(nested, "load", handleLoad);
      }
    }
  }
  runCallbacks(callbacks) {
    for (const callback of callbacks.splice(0)) callback();
  }
  hideControlChildren(elements) {
    this.controlVisibility.clear();
    for (const element of elements) {
      if (element === this.generatedCanvas) continue;
      this.controlVisibility.set(element, Boolean(element.hidden));
      element.hidden = true;
    }
  }
  showControlChildren() {
    for (const [element, previousHidden] of this.controlVisibility) {
      element.hidden = previousHidden;
    }
    this.controlVisibility.clear();
  }
  updateLiveTextures(nestedRenderMode) {
    const instance = this.shaderInstance;
    if (!instance || this.liveTextures.length === 0) return;
    const updates = {};
    for (const binding of this.liveTextures) {
      if (isDomTextureElement(binding.element)) {
        const source = getLiveDomTextureSource(binding.element);
        if (source) updates[binding.name] = source;
        continue;
      }
      if (binding.element instanceof _ShaderPadElement && binding.element.shader) {
        if (nestedRenderMode === "step") {
          binding.element.step();
        } else if (nestedRenderMode === "draw") {
          binding.element.draw();
        }
        updates[binding.name] = binding.element.shader;
      }
    }
    if (Object.keys(updates).length > 0) instance.updateTextures(updates);
  }
  playInstance(instance) {
    instance.play(() => ({}));
  }
  dispatchMutableBeforeStep(instance, time, frame, options) {
    const detail = {
      shader: instance,
      canvas: this.renderCanvas,
      time,
      frame,
      stepOptions: options ? { ...options } : void 0
    };
    this.emit("beforeStep", detail);
    if (options && detail.stepOptions) {
      Object.assign(options, detail.stepOptions);
    }
  }
};
function createShaderPadElement(config) {
  const definition = normalizeShaderPadConfig(config);
  class ConfiguredShaderPadElement extends ShaderPadElement {
    static shaderPadConfig = definition;
  }
  return ConfiguredShaderPadElement;
}
export {
  ShaderPadElement,
  createShaderPadElement
};
//# sourceMappingURL=web-component.mjs.map