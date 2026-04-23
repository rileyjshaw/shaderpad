import type CoreShaderPad from '..';
import type { InitializeTextureOptions } from '..';

export type DomTextureElement = HTMLImageElement | HTMLVideoElement | HTMLCanvasElement;
export type LiveTextureSource = HTMLVideoElement | HTMLCanvasElement | CoreShaderPad;

const TEXTURE_OPTION_ATTRIBUTES = [
	['internal-format', 'internalFormat'],
	['format', 'format'],
	['type', 'type'],
	['min-filter', 'minFilter'],
	['mag-filter', 'magFilter'],
	['wrap-s', 'wrapS'],
	['wrap-t', 'wrapT'],
] as const;

type AttributeValue = string | number | boolean | null | undefined;

function stringFromAttribute(value: AttributeValue) {
	if (value == null || value === false) return undefined;
	return String(value);
}

export function parseBooleanLikeValue(value: AttributeValue, defaultValue: boolean) {
	if (value == null) return defaultValue;
	if (typeof value === 'boolean') return value;

	switch (String(value).trim().toLowerCase()) {
		case 'false':
		case '0':
		case 'no':
		case 'off':
			return false;
		default:
			return true;
	}
}

export function parseTextureOptionsFromAttributes(
	readAttribute: (name: string) => AttributeValue,
	prefix = '',
): InitializeTextureOptions {
	const options: InitializeTextureOptions = {};

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
		if (value) (options as Record<string, unknown>)[option] = value;
	}

	return options;
}

export function parseTextureOptions(element: Element, prefix = '') {
	return parseTextureOptionsFromAttributes(name => element.getAttribute(name), prefix);
}

export function isDomTextureElement(element: Element): element is DomTextureElement {
	return (
		element instanceof HTMLImageElement ||
		element instanceof HTMLVideoElement ||
		element instanceof HTMLCanvasElement
	);
}

export function isLiveDomTextureElement(element: DomTextureElement) {
	return !(element instanceof HTMLImageElement);
}

function onceEvent<T extends Event>(target: EventTarget, type: string): Promise<T> {
	const options = { once: true };

	return new Promise((resolve, reject) => {
		const cleanup = () => {
			target.removeEventListener(type, onResolve);
			target.removeEventListener('error', onReject as EventListener);
		};

		const onResolve = (event: Event) => {
			cleanup();
			resolve(event as T);
		};

		const onReject = (event: Event) => {
			cleanup();
			reject(event);
		};

		target.addEventListener(type, onResolve, options);
		target.addEventListener('error', onReject as EventListener, options);
	});
}

async function loadImageSource(image: HTMLImageElement) {
	if (image.complete && image.naturalWidth > 0 && image.naturalHeight > 0) return image;
	await onceEvent(image, 'load');
	return image;
}

async function loadVideoSource(video: HTMLVideoElement) {
	if (video.videoWidth > 0 && video.videoHeight > 0) return video;
	await onceEvent(video, 'loadedmetadata');
	return video;
}

export async function loadDomTextureSource(element: DomTextureElement) {
	if (element instanceof HTMLImageElement) return loadImageSource(element);
	if (element instanceof HTMLVideoElement) return loadVideoSource(element);
	if (element.width <= 0 || element.height <= 0) {
		throw new Error('Texture canvas elements must have a positive width and height.');
	}
	return element;
}

export function getLiveDomTextureSource(element: DomTextureElement) {
	if (element instanceof HTMLVideoElement) {
		return element.videoWidth > 0 && element.videoHeight > 0 ? element : undefined;
	}
	if (element instanceof HTMLCanvasElement) {
		return element.width > 0 && element.height > 0 ? element : undefined;
	}
	return undefined;
}

export function addDomTextureRefreshListener(element: DomTextureElement, listener: () => void) {
	if (element instanceof HTMLImageElement) {
		element.addEventListener('load', listener);
		return () => element.removeEventListener('load', listener);
	}
	if (element instanceof HTMLVideoElement) {
		element.addEventListener('loadedmetadata', listener);
		return () => element.removeEventListener('loadedmetadata', listener);
	}
	return undefined;
}
