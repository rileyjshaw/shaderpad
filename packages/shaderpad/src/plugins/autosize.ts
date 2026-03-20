import ShaderPad, { PluginContext } from '..';

const THROTTLE_INTERVAL_DEFAULT = 1000 / 30;

export interface AutosizeOptions {
	scale?: number;
	target?: Element | Window;
	throttle?: number;
}

function autosize(options: AutosizeOptions = {}) {
	return function (shaderPad: ShaderPad, context: PluginContext) {
		const { canvas, emitHook } = context;
		const {
			scale = window.devicePixelRatio || 1,
			target = canvas instanceof HTMLCanvasElement ? canvas : window,
			throttle = THROTTLE_INTERVAL_DEFAULT,
		} = options;

		let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
		let lastResizeTime = -Infinity;
		function throttledHandleResize() {
			if (resizeTimeout) clearTimeout(resizeTimeout);
			const now = performance.now();
			const timeUntilNextResize = lastResizeTime + throttle - now;
			if (timeUntilNextResize <= 0) {
				lastResizeTime = now;
				handleResize();
			} else {
				resizeTimeout = setTimeout(() => throttledHandleResize(), timeUntilNextResize);
			}
		}

		function handleResize() {
			let width, height;
			if (target instanceof Window) {
				width = window.innerWidth * scale;
				height = window.innerHeight * scale;
			} else {
				width = target.clientWidth * scale;
				height = target.clientHeight * scale;
			}
			width = Math.max(1, Math.round(width));
			height = Math.max(1, Math.round(height));
			if (canvas.width !== width || canvas.height !== height) {
				canvas.width = width;
				canvas.height = height;
				emitHook('autosize:resize', width, height);
			}
		}

		handleResize();

		let resizeObserver: ResizeObserver | null = null;
		if (target instanceof Window) {
			window.addEventListener('resize', throttledHandleResize);
		} else if (target instanceof Element) {
			resizeObserver = new ResizeObserver(() => throttledHandleResize());
			resizeObserver.observe(target);
		}

		shaderPad.on('destroy', () => {
			if (resizeTimeout) clearTimeout(resizeTimeout);
			if (resizeObserver) resizeObserver.disconnect();
			if (target instanceof Window) {
				window.removeEventListener('resize', throttledHandleResize);
			}
		});
	};
}

export default autosize;
