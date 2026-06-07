Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: 'Module' } });

//#region src/plugins/autosize.ts
const THROTTLE_INTERVAL_DEFAULT = 1e3 / 30;
function autosize(options = {}) {
	return function(shaderPad, context) {
		const { emit } = context;
		const { canvas } = shaderPad;
		const { scale = window.devicePixelRatio || 1, target = canvas instanceof HTMLCanvasElement ? canvas : window, throttle = THROTTLE_INTERVAL_DEFAULT } = options;
		let resizeTimeout = null;
		let lastResizeTime = -Infinity;
		function throttledHandleResize() {
			if (resizeTimeout) clearTimeout(resizeTimeout);
			const now = performance.now();
			const timeUntilNextResize = lastResizeTime + throttle - now;
			if (timeUntilNextResize <= 0) {
				lastResizeTime = now;
				handleResize();
			} else resizeTimeout = setTimeout(() => throttledHandleResize(), timeUntilNextResize);
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
				emit("autosize:resize", width, height);
			}
		}
		handleResize();
		let resizeObserver = null;
		if (target instanceof Window) window.addEventListener("resize", throttledHandleResize);
		else if (target instanceof Element) {
			resizeObserver = new ResizeObserver(() => throttledHandleResize());
			resizeObserver.observe(target);
		}
		shaderPad.on("destroy", () => {
			if (resizeTimeout) clearTimeout(resizeTimeout);
			if (resizeObserver) resizeObserver.disconnect();
			if (target instanceof Window) window.removeEventListener("resize", throttledHandleResize);
		});
	};
}

//#endregion
exports.default = autosize;
//# sourceMappingURL=autosize.js.map