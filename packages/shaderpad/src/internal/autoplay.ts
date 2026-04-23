export type PlaybackVisibilityController = {
	sync: () => void;
	update: (options: { autoplay: boolean; autopause: boolean }) => void;
	destroy: () => void;
};

type PlaybackVisibilityOptions = {
	target: HTMLElement;
	autoplay: boolean;
	autopause: boolean;
	isPlaying: () => boolean;
	play: () => void;
	pause: () => void;
	onVisibilityChange?: (isVisible: boolean) => void;
};

function isElementInViewport(element: HTMLElement) {
	const view = element.ownerDocument.defaultView ?? window;
	const rect = element.getBoundingClientRect();
	return (
		rect.width > 0 &&
		rect.height > 0 &&
		rect.bottom > 0 &&
		rect.right > 0 &&
		rect.top < view.innerHeight &&
		rect.left < view.innerWidth
	);
}

export function createPlaybackVisibilityController({
	target,
	autoplay,
	autopause,
	isPlaying,
	play,
	pause,
	onVisibilityChange,
}: PlaybackVisibilityOptions): PlaybackVisibilityController {
	const documentRef = target.ownerDocument;
	let currentAutoplay = autoplay;
	let currentAutopause = autopause;
	let isDocumentVisible = documentRef.visibilityState === 'visible';
	let isIntersecting = isElementInViewport(target);
	let isManagedPlayback = false;
	let lastVisible: boolean | null = null;

	const getIsVisible = () =>
		isDocumentVisible &&
		(typeof IntersectionObserver === 'function' ? isIntersecting : isElementInViewport(target)) &&
		target.isConnected;

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
		isDocumentVisible = documentRef.visibilityState === 'visible';
		sync();
	};
	documentRef.addEventListener('visibilitychange', handleVisibilityChange);

	const intersectionObserver =
		typeof IntersectionObserver === 'function'
			? new IntersectionObserver(entries => {
					isIntersecting = entries.some(entry => entry.isIntersecting);
					sync();
				})
			: null;
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
			documentRef.removeEventListener('visibilitychange', handleVisibilityChange);
		},
	};
}
