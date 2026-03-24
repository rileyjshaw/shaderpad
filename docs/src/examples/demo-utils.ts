export async function getWebcamVideo(
	videoConstraints: MediaTrackConstraints | true = true,
): Promise<HTMLVideoElement> {
	const video = document.createElement('video');
	video.autoplay = true;
	video.muted = true;
	video.playsInline = true;

	const stream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints });
	video.srcObject = stream;
	await new Promise<void>(resolve => {
		video.onloadedmetadata = () => resolve();
	});

	return video;
}

export function stopVideoStream(video: HTMLVideoElement | null) {
	if (!video) return;

	if (video.srcObject instanceof MediaStream) {
		video.srcObject.getTracks().forEach(track => track.stop());
	}

	video.srcObject = null;
	video.remove();
}

type TouchDirection = 'x' | 'y';

type TouchMoveResult = {
	skip?: boolean;
};

type TouchHandlers = {
	onTap?: (
		x: number,
		y: number,
		tapCount: number,
		finalTapPromise: Promise<boolean>,
		isLongTap: boolean,
		event: TouchEvent,
	) => void;
	onTapStart?: (tapCount: number) => void;
	onMove?: (
		direction: TouchDirection,
		delta: number,
		additionalTouchCount: number,
		initialX: number,
		initialY: number,
		event: TouchEvent,
	) => TouchMoveResult | void;
};

type TouchOptions = {
	moveThresholdPx?: number;
	tapThresholdMs?: number;
	once?: boolean;
};

type TrackedTouch = {
	x: number;
	y: number;
	initialX: number;
	initialY: number;
	direction?: TouchDirection;
};

export function handleTouch(
	element: HTMLElement,
	{ onTap, onTapStart, onMove }: TouchHandlers,
	{ moveThresholdPx = 12, tapThresholdMs = 250, once = false }: TouchOptions = {},
) {
	let latestTouch: { id: number | null; time: number } = { id: null, time: 0 };
	let isCurrentTapInvalid = false;
	let tapCount = 0;
	let finalTapResolver: ((isFinalTap: boolean) => void) | null = null;
	let finalTapResolverTimeout: number | null = null;
	const prevTouchCoordinates: Record<number, TrackedTouch> = {};

	const clearPendingTap = (isFinalTap: boolean) => {
		if (!finalTapResolver) return;

		finalTapResolver(isFinalTap);
		finalTapResolver = null;
		if (finalTapResolverTimeout !== null) {
			window.clearTimeout(finalTapResolverTimeout);
			finalTapResolverTimeout = null;
		}
	};

	function handleTouchStart(e: TouchEvent) {
		const touch = e.changedTouches[0];
		if (!touch) return;

		clearPendingTap(false);
		isCurrentTapInvalid = e.touches.length > 1;

		const now = Date.now();
		if (isCurrentTapInvalid || now - latestTouch.time > tapThresholdMs) {
			tapCount = 0;
		}
		if (!isCurrentTapInvalid) {
			tapCount += 1;
			onTapStart?.(tapCount);
		}

		latestTouch = { id: touch.identifier, time: now };
		prevTouchCoordinates[touch.identifier] = {
			x: touch.clientX,
			y: touch.clientY,
			initialX: touch.clientX,
			initialY: touch.clientY,
		};
	}

	function handleTouchMove(e: TouchEvent) {
		if (latestTouch.id === null) return;

		const touch = Array.from(e.changedTouches).find(
			currentTouch => currentTouch.identifier === latestTouch.id,
		);
		if (!touch) return;

		const prevCoords = prevTouchCoordinates[latestTouch.id];
		if (!prevCoords) return;

		let { x, y, initialX, initialY, direction } = prevCoords;

		if (direction && once) return;

		const diffX = touch.clientX - x;
		const diffY = y - touch.clientY;

		if (!direction && (Math.abs(diffX) > moveThresholdPx || Math.abs(diffY) > moveThresholdPx)) {
			direction = Math.abs(diffX) > Math.abs(diffY) ? 'x' : 'y';
			prevTouchCoordinates[latestTouch.id].direction = direction;
			isCurrentTapInvalid = true;
		}
		if (!direction || !onMove) return;

		const result = onMove(
			direction,
			direction === 'x' ? diffX : diffY,
			e.touches.length - 1,
			initialX,
			initialY,
			e,
		);
		if (result?.skip) return;

		Object.assign(prevTouchCoordinates[latestTouch.id], {
			x: touch.clientX,
			y: touch.clientY,
		});
	}

	function handleTouchEnd(e: TouchEvent) {
		Array.from(e.changedTouches).forEach(touch => {
			delete prevTouchCoordinates[touch.identifier];
			if (
				isCurrentTapInvalid ||
				!onTap ||
				touch.identifier !== latestTouch.id
			) {
				if (touch.identifier === latestTouch.id) {
					latestTouch = { id: null, time: latestTouch.time };
				}
				return;
			}

			const touchDuration = Date.now() - latestTouch.time;
			const isLongTap = touchDuration > tapThresholdMs;
			const remaining = isLongTap ? 0 : tapThresholdMs - touchDuration;
			const finalTapPromise = new Promise<boolean>(resolve => {
				finalTapResolver = resolve;
			});

			finalTapResolverTimeout = window.setTimeout(() => {
				clearPendingTap(true);
			}, remaining);

			onTap(touch.clientX, touch.clientY, tapCount, finalTapPromise, isLongTap, e);
			latestTouch = { id: null, time: latestTouch.time };
		});
	}

	function handleTouchCancel(e: TouchEvent) {
		Array.from(e.changedTouches).forEach(touch => {
			delete prevTouchCoordinates[touch.identifier];
			if (touch.identifier === latestTouch.id) {
				latestTouch = { id: null, time: latestTouch.time };
			}
		});
		clearPendingTap(false);
		isCurrentTapInvalid = true;
	}

	element.addEventListener('touchstart', handleTouchStart);
	element.addEventListener('touchmove', handleTouchMove, { passive: false });
	element.addEventListener('touchend', handleTouchEnd);
	element.addEventListener('touchcancel', handleTouchCancel);

	return () => {
		clearPendingTap(false);
		element.removeEventListener('touchstart', handleTouchStart);
		element.removeEventListener('touchmove', handleTouchMove);
		element.removeEventListener('touchend', handleTouchEnd);
		element.removeEventListener('touchcancel', handleTouchCancel);
	};
}
