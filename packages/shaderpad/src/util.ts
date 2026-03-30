export function createFullscreenCanvas(container?: HTMLElement): HTMLCanvasElement {
	const canvas = document.createElement('canvas');
	canvas.style.position = 'fixed';
	canvas.style.inset = '0';
	canvas.style.height = '100dvh';
	canvas.style.width = '100dvw';
	(container || document.body).appendChild(canvas);
	return canvas;
}
