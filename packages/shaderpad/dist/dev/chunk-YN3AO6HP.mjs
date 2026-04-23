// src/internal/autoplay.ts
function isElementInViewport(element) {
  const view = element.ownerDocument.defaultView ?? window;
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.right > 0 && rect.top < view.innerHeight && rect.left < view.innerWidth;
}
function createPlaybackVisibilityController({
  target,
  autoplay,
  autopause,
  isPlaying,
  play,
  pause,
  onVisibilityChange
}) {
  const documentRef = target.ownerDocument;
  let currentAutoplay = autoplay;
  let currentAutopause = autopause;
  let isDocumentVisible = documentRef.visibilityState === "visible";
  let isIntersecting = isElementInViewport(target);
  let isManagedPlayback = false;
  let lastVisible = null;
  const getIsVisible = () => isDocumentVisible && (typeof IntersectionObserver === "function" ? isIntersecting : isElementInViewport(target)) && target.isConnected;
  const sync = () => {
    const isVisible = getIsVisible();
    if (lastVisible !== isVisible) {
      lastVisible = isVisible;
      onVisibilityChange?.(isVisible);
    }
    if (!currentAutoplay) {
      if (isManagedPlayback && isPlaying()) {
        pause();
      }
      isManagedPlayback = false;
      return;
    }
    if (!currentAutopause || isVisible) {
      if (!isPlaying()) {
        play();
      }
      isManagedPlayback = true;
      return;
    }
    if (isManagedPlayback && isPlaying()) {
      pause();
    }
    isManagedPlayback = false;
  };
  const handleVisibilityChange = () => {
    isDocumentVisible = documentRef.visibilityState === "visible";
    sync();
  };
  documentRef.addEventListener("visibilitychange", handleVisibilityChange);
  const intersectionObserver = typeof IntersectionObserver === "function" ? new IntersectionObserver((entries) => {
    isIntersecting = entries.some((entry) => entry.isIntersecting);
    sync();
  }) : null;
  intersectionObserver?.observe(target);
  return {
    sync,
    update(options) {
      currentAutoplay = options.autoplay;
      currentAutopause = options.autopause;
      sync();
    },
    destroy() {
      intersectionObserver?.disconnect();
      documentRef.removeEventListener("visibilitychange", handleVisibilityChange);
    }
  };
}

// src/internal/declarative-textures.ts
var TEXTURE_OPTION_ATTRIBUTES = [
  ["internal-format", "internalFormat"],
  ["format", "format"],
  ["type", "type"],
  ["min-filter", "minFilter"],
  ["mag-filter", "magFilter"],
  ["wrap-s", "wrapS"],
  ["wrap-t", "wrapT"]
];
function stringFromAttribute(value) {
  if (value == null || value === false) return void 0;
  return String(value);
}
function parseBooleanLikeValue(value, defaultValue) {
  if (value == null) return defaultValue;
  if (typeof value === "boolean") return value;
  switch (String(value).trim().toLowerCase()) {
    case "false":
    case "0":
    case "no":
    case "off":
      return false;
    default:
      return true;
  }
}
function parseTextureOptionsFromAttributes(readAttribute, prefix = "") {
  const options = {};
  const historyValue = stringFromAttribute(readAttribute(`${prefix}history`));
  if (historyValue != null) {
    const parsed = Number.parseInt(historyValue, 10);
    if (Number.isFinite(parsed) && parsed >= 0) options.history = parsed;
  }
  const preserveYValue = readAttribute(`${prefix}preserve-y`);
  if (preserveYValue != null) {
    options.preserveY = parseBooleanLikeValue(preserveYValue, true);
  }
  for (const [attribute, option] of TEXTURE_OPTION_ATTRIBUTES) {
    const value = stringFromAttribute(readAttribute(`${prefix}${attribute}`));
    if (value) options[option] = value;
  }
  return options;
}
function parseTextureOptions(element, prefix = "") {
  return parseTextureOptionsFromAttributes((name) => element.getAttribute(name), prefix);
}
function isDomTextureElement(element) {
  return element instanceof HTMLImageElement || element instanceof HTMLVideoElement || element instanceof HTMLCanvasElement;
}
function isLiveDomTextureElement(element) {
  return !(element instanceof HTMLImageElement);
}
function onceEvent(target, type) {
  const options = { once: true };
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      target.removeEventListener(type, onResolve);
      target.removeEventListener("error", onReject);
    };
    const onResolve = (event) => {
      cleanup();
      resolve(event);
    };
    const onReject = (event) => {
      cleanup();
      reject(event);
    };
    target.addEventListener(type, onResolve, options);
    target.addEventListener("error", onReject, options);
  });
}
async function loadImageSource(image) {
  if (image.complete && image.naturalWidth > 0 && image.naturalHeight > 0) return image;
  await onceEvent(image, "load");
  return image;
}
async function loadVideoSource(video) {
  if (video.videoWidth > 0 && video.videoHeight > 0) return video;
  await onceEvent(video, "loadedmetadata");
  return video;
}
async function loadDomTextureSource(element) {
  if (element instanceof HTMLImageElement) return loadImageSource(element);
  if (element instanceof HTMLVideoElement) return loadVideoSource(element);
  if (element.width <= 0 || element.height <= 0) {
    throw new Error("Texture canvas elements must have a positive width and height.");
  }
  return element;
}
function getLiveDomTextureSource(element) {
  if (element instanceof HTMLVideoElement) {
    return element.videoWidth > 0 && element.videoHeight > 0 ? element : void 0;
  }
  if (element instanceof HTMLCanvasElement) {
    return element.width > 0 && element.height > 0 ? element : void 0;
  }
  return void 0;
}
function addDomTextureRefreshListener(element, listener) {
  if (element instanceof HTMLImageElement) {
    element.addEventListener("load", listener);
    return () => element.removeEventListener("load", listener);
  }
  if (element instanceof HTMLVideoElement) {
    element.addEventListener("loadedmetadata", listener);
    return () => element.removeEventListener("loadedmetadata", listener);
  }
  return void 0;
}

export {
  createPlaybackVisibilityController,
  parseBooleanLikeValue,
  parseTextureOptionsFromAttributes,
  parseTextureOptions,
  isDomTextureElement,
  isLiveDomTextureElement,
  loadDomTextureSource,
  getLiveDomTextureSource,
  addDomTextureRefreshListener
};
//# sourceMappingURL=chunk-YN3AO6HP.mjs.map