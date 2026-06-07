let nextId = 1;

export type FakeTextureWrite = {
	kind: 'sub3d' | 'copy3d' | 'sub2d' | 'image2d';
	slot?: number;
	width?: number;
	height?: number;
	xOffset?: number;
	yOffset?: number;
	sourceData?: unknown;
};

export type FakeGlOperation = {
	kind:
		| 'bindTexture'
		| 'texImage2D'
		| 'texSubImage2D'
		| 'texSubImage3D'
		| 'copyTexSubImage3D'
		| 'readPixels'
		| 'drawArrays'
		| 'clear'
		| 'clearBufferiv'
		| 'clearBufferuiv'
		| 'blitFramebuffer'
		| 'setDrawingBufferColorSpace'
		| 'setUnpackColorSpace';
	target?: number;
	textureId?: number;
	slot?: number;
	width?: number;
	height?: number;
	xOffset?: number;
	yOffset?: number;
	sourceData?: unknown;
	colorSpace?: string;
};

type EventMap = Map<string, Set<EventListener>>;
type FakeColorSpace = 'srgb' | 'display-p3';
let fakeColorSpaceSupport = true;

function cloneSourceData(data: unknown) {
	if (!ArrayBuffer.isView(data)) return data;
	const TypedArray = (data as ArrayBufferView).constructor as {
		new (source: ArrayBufferView): ArrayBufferView;
	};
	return new TypedArray(data as ArrayBufferView);
}

class FakeEventTarget {
	private listeners: EventMap = new Map();

	addEventListener(type: string, listener: EventListener) {
		if (!this.listeners.has(type)) {
			this.listeners.set(type, new Set());
		}
		this.listeners.get(type)!.add(listener);
	}

	removeEventListener(type: string, listener: EventListener) {
		this.listeners.get(type)?.delete(listener);
	}

	dispatchEvent(event: { type: string }) {
		for (const listener of this.listeners.get(event.type) ?? []) {
			listener.call(this, event as Event);
		}
		return true;
	}
}

export class FakeElement extends FakeEventTarget {
	style: Record<string, string> = {};
	clientWidth: number;
	clientHeight: number;
	left = 0;
	top = 0;

	constructor(width = 300, height = 150) {
		super();
		this.clientWidth = width;
		this.clientHeight = height;
	}

	getBoundingClientRect() {
		return {
			left: this.left,
			top: this.top,
			width: this.clientWidth,
			height: this.clientHeight,
		};
	}

	remove() {}
}

export class FakeWindow extends FakeEventTarget {
	innerWidth: number;
	innerHeight: number;
	devicePixelRatio: number;

	constructor({ innerWidth = 1024, innerHeight = 768, devicePixelRatio = 1 } = {}) {
		super();
		this.innerWidth = innerWidth;
		this.innerHeight = innerHeight;
		this.devicePixelRatio = devicePixelRatio;
	}
}

class FakeDocument {
	createElement(tag: string) {
		if (tag === 'canvas') return new FakeHTMLCanvasElement(300, 150);
		if (tag === 'a') return new FakeHTMLAnchorElement();
		return new FakeElement();
	}
}

class FakeHTMLAnchorElement extends FakeElement {
	download = '';
	href = '';
	clickCount = 0;

	click() {
		++this.clickCount;
	}
}

export class FakeWebGLTexture {
	id = nextId++;
	writes: FakeTextureWrite[] = [];
}

class FakeUniformLocation {
	constructor(public name: string) {}
}

export class FakeWebGL2RenderingContext {
	drawingBufferWidth: number;
	drawingBufferHeight: number;
	operations: FakeGlOperation[] = [];
	private boundTextures = new Map<number, FakeWebGLTexture | null>();
	private unpackAlignment = 4;
	private unpackFlipY = 0;
	private drawingBufferColorSpaceValue: FakeColorSpace = 'srgb';
	private unpackColorSpaceValue: FakeColorSpace = 'srgb';
	uniformValues = new Map<string, number | number[]>();

	constructor(canvas: { width: number; height: number }) {
		this.drawingBufferWidth = canvas.width;
		this.drawingBufferHeight = canvas.height;
		if (fakeColorSpaceSupport) {
			this.defineColorSpaceProperty('drawingBufferColorSpace', 'setDrawingBufferColorSpace');
			this.defineColorSpaceProperty('unpackColorSpace', 'setUnpackColorSpace');
		}
	}

	private writeUniform(name: string, value: number | number[]) {
		this.uniformValues.set(name, Array.isArray(value) ? [...value] : value);
	}

	private boundTexture(target: number) {
		return this.boundTextures.get(target) ?? null;
	}

	private log(operation: FakeGlOperation) {
		this.operations.push(operation);
	}

	private defineColorSpaceProperty(
		property: 'drawingBufferColorSpace' | 'unpackColorSpace',
		kind: Extract<FakeGlOperation['kind'], 'setDrawingBufferColorSpace' | 'setUnpackColorSpace'>,
	) {
		const field = property === 'drawingBufferColorSpace' ? 'drawingBufferColorSpaceValue' : 'unpackColorSpaceValue';
		Object.defineProperty(this, property, {
			get: () => this[field],
			set: (value: string) => {
				if (value !== 'srgb' && value !== 'display-p3') return;
				this[field] = value;
				this.log({ kind, colorSpace: value });
			},
			configurable: true,
			enumerable: true,
		});
	}

	readonly MAX_COMBINED_TEXTURE_IMAGE_UNITS = 1;
	readonly UNPACK_ALIGNMENT = 2;
	readonly UNPACK_FLIP_Y_WEBGL = 3;
	readonly FLOAT = 4;
	readonly HALF_FLOAT = 5;
	readonly UNSIGNED_SHORT = 6;
	readonly SHORT = 7;
	readonly BYTE = 8;
	readonly UNSIGNED_INT = 9;
	readonly INT = 10;
	readonly UNSIGNED_BYTE = 11;
	readonly RGBA32F = 12;
	readonly RGBA16F = 13;
	readonly RGBA32UI = 14;
	readonly RGBA32I = 15;
	readonly RGBA8 = 16;
	readonly R32F = 17;
	readonly RED = 18;
	readonly RG = 19;
	readonly RGB = 20;
	readonly RGBA = 21;
	readonly RED_INTEGER = 22;
	readonly RG_INTEGER = 23;
	readonly RGB_INTEGER = 24;
	readonly RGBA_INTEGER = 25;
	readonly LINEAR = 26;
	readonly NEAREST = 27;
	readonly CLAMP_TO_EDGE = 28;
	readonly REPEAT = 29;
	readonly MIRRORED_REPEAT = 30;
	readonly TEXTURE_2D_ARRAY = 31;
	readonly TEXTURE_2D = 32;
	readonly TEXTURE0 = 33;
	readonly ARRAY_BUFFER = 34;
	readonly STATIC_DRAW = 35;
	readonly VERTEX_SHADER = 36;
	readonly FRAGMENT_SHADER = 37;
	readonly LINK_STATUS = 38;
	readonly COMPILE_STATUS = 39;
	readonly FRAMEBUFFER = 40;
	readonly READ_FRAMEBUFFER = 41;
	readonly DRAW_FRAMEBUFFER = 42;
	readonly COLOR_ATTACHMENT0 = 43;
	readonly COLOR_BUFFER_BIT = 44;
	readonly TRIANGLES = 45;
	readonly TEXTURE_WRAP_S = 46;
	readonly TEXTURE_WRAP_T = 47;
	readonly TEXTURE_MIN_FILTER = 48;
	readonly TEXTURE_MAG_FILTER = 49;
	readonly COLOR = 50;
	readonly R8 = 51;
	readonly FRAMEBUFFER_COMPLETE = 52;
	readonly DYNAMIC_DRAW = 53;
	readonly BLEND = 54;
	readonly MAX = 55;
	readonly ONE = 56;
	readonly FUNC_ADD = 57;

	getParameter(param: number) {
		if (param === this.MAX_COMBINED_TEXTURE_IMAGE_UNITS) return 32;
		if (param === this.UNPACK_ALIGNMENT) return this.unpackAlignment;
		if (param === this.UNPACK_FLIP_Y_WEBGL) return this.unpackFlipY;
		return 0;
	}

	getExtension(_name: string) {
		return {};
	}

	createProgram() {
		return { id: nextId++ };
	}

	deleteProgram(_program: unknown) {}

	createShader(type: number) {
		return { id: nextId++, type, source: '' };
	}

	shaderSource(shader: { source: string }, source: string) {
		shader.source = source;
	}

	compileShader(_shader: unknown) {}

	getShaderParameter(_shader: unknown, param: number) {
		return param === this.COMPILE_STATUS;
	}

	getShaderInfoLog(_shader: unknown) {
		return '';
	}

	deleteShader(_shader: unknown) {}

	attachShader(_program: unknown, _shader: unknown) {}

	bindAttribLocation(_program: unknown, _index: number, _name: string) {}

	linkProgram(_program: unknown) {}

	getProgramParameter(_program: unknown, param: number) {
		return param === this.LINK_STATUS;
	}

	getProgramInfoLog(_program: unknown) {
		return '';
	}

	getAttribLocation(_program: unknown, _name: string) {
		return 0;
	}

	createVertexArray() {
		return { id: nextId++ };
	}

	deleteVertexArray(_vao: unknown) {}

	bindVertexArray(_vao: unknown) {}

	createBuffer() {
		return { id: nextId++ };
	}

	deleteBuffer(_buffer: unknown) {}

	bindBuffer(_target: number, _buffer: unknown) {}

	bufferData(_target: number, _data: unknown, _usage: number) {}

	enableVertexAttribArray(_index: number) {}

	enable(_capability: number) {}

	vertexAttribPointer(
		_index: number,
		_size: number,
		_type: number,
		_normalized: boolean,
		_stride: number,
		_offset: number,
	) {}

	viewport(_x: number, _y: number, width: number, height: number) {
		this.drawingBufferWidth = width;
		this.drawingBufferHeight = height;
	}

	useProgram(_program: Record<string, unknown> | null) {}

	getUniformLocation(_program: unknown, name: string) {
		return new FakeUniformLocation(name);
	}

	uniform1f(location: FakeUniformLocation, x: number) {
		this.writeUniform(location.name, x);
	}

	uniform2f(location: FakeUniformLocation, x: number, y: number) {
		this.writeUniform(location.name, [x, y]);
	}

	uniform3f(location: FakeUniformLocation, x: number, y: number, z: number) {
		this.writeUniform(location.name, [x, y, z]);
	}

	uniform4f(location: FakeUniformLocation, x: number, y: number, z: number, w: number) {
		this.writeUniform(location.name, [x, y, z, w]);
	}

	uniform1i(location: FakeUniformLocation, x: number) {
		this.writeUniform(location.name, x);
	}

	uniform2i(location: FakeUniformLocation, x: number, y: number) {
		this.writeUniform(location.name, [x, y]);
	}

	uniform3i(location: FakeUniformLocation, x: number, y: number, z: number) {
		this.writeUniform(location.name, [x, y, z]);
	}

	uniform4i(location: FakeUniformLocation, x: number, y: number, z: number, w: number) {
		this.writeUniform(location.name, [x, y, z, w]);
	}

	uniform1ui(location: FakeUniformLocation, x: number) {
		this.writeUniform(location.name, x);
	}

	uniform2ui(location: FakeUniformLocation, x: number, y: number) {
		this.writeUniform(location.name, [x, y]);
	}

	uniform3ui(location: FakeUniformLocation, x: number, y: number, z: number) {
		this.writeUniform(location.name, [x, y, z]);
	}

	uniform4ui(location: FakeUniformLocation, x: number, y: number, z: number, w: number) {
		this.writeUniform(location.name, [x, y, z, w]);
	}

	uniform1fv(location: FakeUniformLocation, values: Float32Array) {
		this.writeUniform(location.name, Array.from(values));
	}

	uniform2fv(location: FakeUniformLocation, values: Float32Array) {
		this.writeUniform(location.name, Array.from(values));
	}

	uniform3fv(location: FakeUniformLocation, values: Float32Array) {
		this.writeUniform(location.name, Array.from(values));
	}

	uniform4fv(location: FakeUniformLocation, values: Float32Array) {
		this.writeUniform(location.name, Array.from(values));
	}

	uniform1iv(location: FakeUniformLocation, values: Int32Array) {
		this.writeUniform(location.name, Array.from(values));
	}

	uniform2iv(location: FakeUniformLocation, values: Int32Array) {
		this.writeUniform(location.name, Array.from(values));
	}

	uniform3iv(location: FakeUniformLocation, values: Int32Array) {
		this.writeUniform(location.name, Array.from(values));
	}

	uniform4iv(location: FakeUniformLocation, values: Int32Array) {
		this.writeUniform(location.name, Array.from(values));
	}

	uniform1uiv(location: FakeUniformLocation, values: Uint32Array) {
		this.writeUniform(location.name, Array.from(values));
	}

	uniform2uiv(location: FakeUniformLocation, values: Uint32Array) {
		this.writeUniform(location.name, Array.from(values));
	}

	uniform3uiv(location: FakeUniformLocation, values: Uint32Array) {
		this.writeUniform(location.name, Array.from(values));
	}

	uniform4uiv(location: FakeUniformLocation, values: Uint32Array) {
		this.writeUniform(location.name, Array.from(values));
	}

	createTexture() {
		return new FakeWebGLTexture();
	}

	deleteTexture(_texture: unknown) {}

	activeTexture(_unit: number) {}

	bindTexture(target: number, texture: FakeWebGLTexture | null) {
		this.boundTextures.set(target, texture);
		this.log({
			kind: 'bindTexture',
			target,
			textureId: texture?.id,
		});
	}

	texParameteri(_target: number, _pname: number, _param: number) {}

	texStorage3D(
		_target: number,
		_levels: number,
		_internalFormat: number,
		_width: number,
		_height: number,
		_depth: number,
	) {}

	texImage2D(
		target: number,
		_level: number,
		_internalFormat: number,
		width: number,
		height: number,
		_border: number,
		_format: number,
		_type: number,
		data: unknown,
	) {
		const texture = this.boundTexture(target);
		const clonedData = cloneSourceData(data);
		texture?.writes.push({ kind: 'image2d', width, height, sourceData: clonedData });
		this.log({
			kind: 'texImage2D',
			target,
			textureId: texture?.id,
			width,
			height,
			sourceData: clonedData,
		});
	}

	texSubImage2D(
		target: number,
		_level: number,
		xOffset: number,
		yOffset: number,
		width: number,
		height: number,
		_format: number,
		_type: number,
		data: unknown,
	) {
		const texture = this.boundTexture(target);
		const clonedData = cloneSourceData(data);
		texture?.writes.push({ kind: 'sub2d', xOffset, yOffset, width, height, sourceData: clonedData });
		this.log({
			kind: 'texSubImage2D',
			target,
			textureId: texture?.id,
			xOffset,
			yOffset,
			width,
			height,
			sourceData: clonedData,
		});
	}

	texSubImage3D(
		target: number,
		_level: number,
		xOffset: number,
		yOffset: number,
		zOffset: number,
		width: number,
		height: number,
		_depth: number,
		_format: number,
		_type: number,
		data: unknown,
	) {
		const texture = this.boundTexture(target);
		const clonedData = cloneSourceData(data);
		texture?.writes.push({
			kind: 'sub3d',
			slot: zOffset,
			xOffset,
			yOffset,
			width,
			height,
			sourceData: clonedData,
		});
		this.log({
			kind: 'texSubImage3D',
			target,
			textureId: texture?.id,
			slot: zOffset,
			xOffset,
			yOffset,
			width,
			height,
			sourceData: clonedData,
		});
	}

	copyTexSubImage3D(
		target: number,
		_level: number,
		_xOffset: number,
		_yOffset: number,
		zOffset: number,
		_x: number,
		_y: number,
		width: number,
		height: number,
	) {
		const texture = this.boundTexture(target);
		texture?.writes.push({ kind: 'copy3d', slot: zOffset, width, height });
		this.log({
			kind: 'copyTexSubImage3D',
			target,
			textureId: texture?.id,
			slot: zOffset,
			width,
			height,
		});
	}

	createFramebuffer() {
		return { id: nextId++ };
	}

	deleteFramebuffer(_fbo: unknown) {}

	bindFramebuffer(_target: number, _framebuffer: unknown) {}

	framebufferTexture2D(_target: number, _attachment: number, _textarget: number, _texture: unknown, _level: number) {}

	checkFramebufferStatus(_target: number) {
		return this.FRAMEBUFFER_COMPLETE;
	}

	colorMask(_red: boolean, _green: boolean, _blue: boolean, _alpha: boolean) {}

	blendEquation(_mode: number) {}

	blendFunc(_sfactor: number, _dfactor: number) {}

	blitFramebuffer(
		_srcX0: number,
		_srcY0: number,
		_srcX1: number,
		_srcY1: number,
		_dstX0: number,
		_dstY0: number,
		_dstX1: number,
		_dstY1: number,
		_mask: number,
		_filter: number,
	) {
		this.log({ kind: 'blitFramebuffer' });
	}

	readPixels(
		_x: number,
		_y: number,
		width: number,
		height: number,
		_format: number,
		_type: number,
		pixels: ArrayBufferView,
	) {
		this.log({
			kind: 'readPixels',
			width,
			height,
		});
		if ('fill' in pixels && typeof pixels.fill === 'function') {
			(pixels as Uint8Array).fill(0);
		}
	}

	pixelStorei(param: number, value: number | boolean) {
		if (param === this.UNPACK_ALIGNMENT) this.unpackAlignment = Number(value);
		if (param === this.UNPACK_FLIP_Y_WEBGL) this.unpackFlipY = Number(value);
	}

	clearBufferuiv(_buffer: number, _drawbuffer: number, _values: Uint32Array) {
		this.log({ kind: 'clearBufferuiv' });
	}

	clearBufferiv(_buffer: number, _drawbuffer: number, _values: Int32Array) {
		this.log({ kind: 'clearBufferiv' });
	}

	clearColor(_red: number, _green: number, _blue: number, _alpha: number) {}

	clear(_mask: number) {
		this.log({ kind: 'clear' });
	}

	drawArrays(_mode: number, _first: number, _count: number) {
		this.log({ kind: 'drawArrays' });
	}
}

export class FakeOffscreenCanvas {
	private context: FakeWebGL2RenderingContext | null = null;
	private _width: number;
	private _height: number;

	constructor(width: number, height: number) {
		this._width = width;
		this._height = height;
	}

	get width() {
		return this._width;
	}

	set width(value: number) {
		this._width = value;
		if (this.context) this.context.drawingBufferWidth = value;
	}

	get height() {
		return this._height;
	}

	set height(value: number) {
		this._height = value;
		if (this.context) this.context.drawingBufferHeight = value;
	}

	getContext(type: string) {
		if (type !== 'webgl2') return null;
		if (!this.context) {
			this.context = new FakeWebGL2RenderingContext(this);
		}
		return this.context;
	}

	async convertToBlob(_options?: { type?: string }) {
		return new Blob([], { type: 'image/png' });
	}
}

export class FakeHTMLCanvasElement extends FakeElement {
	private context: FakeWebGL2RenderingContext | null = null;
	private _width: number;
	private _height: number;

	constructor(width: number, height: number) {
		super(width, height);
		this._width = width;
		this._height = height;
	}

	get width() {
		return this._width;
	}

	set width(value: number) {
		this._width = value;
		this.clientWidth = value;
		if (this.context) this.context.drawingBufferWidth = value;
		FakeMutationObserver.notify(this);
	}

	get height() {
		return this._height;
	}

	set height(value: number) {
		this._height = value;
		this.clientHeight = value;
		if (this.context) this.context.drawingBufferHeight = value;
		FakeMutationObserver.notify(this);
	}

	getContext(type: string) {
		if (type !== 'webgl2') return null;
		if (!this.context) {
			this.context = new FakeWebGL2RenderingContext(this);
		}
		return this.context;
	}

	toBlob(callback: BlobCallback, _type?: string) {
		callback(new Blob([], { type: 'image/png' }));
	}
}

export class FakeHTMLVideoElement {
	videoWidth = 4;
	videoHeight = 4;
	readyState = 2;
	currentTime = 0;
}

export class FakeHTMLImageElement {
	width = 4;
	height = 4;
	naturalWidth = 4;
	naturalHeight = 4;
}

export class FakeImageBitmap {
	width = 4;
	height = 4;
}

export class FakeMutationObserver {
	private static observers = new Set<FakeMutationObserver>();
	private targets = new Set<object>();
	private callback: MutationCallback;

	constructor(callback: MutationCallback) {
		this.callback = callback;
		FakeMutationObserver.observers.add(this);
	}

	observe(target: Node, _options?: MutationObserverInit) {
		this.targets.add(target);
	}

	disconnect() {
		this.targets.clear();
		FakeMutationObserver.observers.delete(this);
	}

	static notify(target: object) {
		for (const observer of FakeMutationObserver.observers) {
			if (!observer.targets.has(target)) continue;
			observer.callback([] as MutationRecord[], observer as unknown as MutationObserver);
		}
	}
}

export class FakeResizeObserver {
	private static observers = new Set<FakeResizeObserver>();
	private targets = new Set<object>();
	private callback: ResizeObserverCallback;

	constructor(callback: ResizeObserverCallback) {
		this.callback = callback;
		FakeResizeObserver.observers.add(this);
	}

	observe(target: Element) {
		this.targets.add(target);
	}

	disconnect() {
		this.targets.clear();
		FakeResizeObserver.observers.delete(this);
	}

	static notify(target: object) {
		for (const observer of FakeResizeObserver.observers) {
			if (!observer.targets.has(target)) continue;
			observer.callback([{ target } as ResizeObserverEntry], observer as unknown as ResizeObserver);
		}
	}
}

export function installFakeBrowserGlobals(options?: {
	innerWidth?: number;
	innerHeight?: number;
	devicePixelRatio?: number;
	colorSpaceSupport?: boolean;
}) {
	fakeColorSpaceSupport = options?.colorSpaceSupport ?? true;
	const originals = {
		OffscreenCanvas: globalThis.OffscreenCanvas,
		HTMLCanvasElement: globalThis.HTMLCanvasElement,
		HTMLVideoElement: globalThis.HTMLVideoElement,
		HTMLImageElement: globalThis.HTMLImageElement,
		ImageBitmap: globalThis.ImageBitmap,
		MutationObserver: globalThis.MutationObserver,
		ResizeObserver: globalThis.ResizeObserver,
		WebGLTexture: globalThis.WebGLTexture,
		window: globalThis.window,
		Window: globalThis.Window,
		Element: globalThis.Element,
		document: globalThis.document,
		navigator: globalThis.navigator,
		requestAnimationFrame: globalThis.requestAnimationFrame,
		cancelAnimationFrame: globalThis.cancelAnimationFrame,
	};

	const setGlobal = (name: keyof typeof originals, value: unknown) => {
		Object.defineProperty(globalThis, name, {
			value,
			configurable: true,
			writable: true,
		});
	};

	const fakeWindow = new FakeWindow(options);
	const document = new FakeDocument();
	const requestAnimationFrame = (callback: FrameRequestCallback) =>
		setTimeout(() => callback(performance.now()), 16) as unknown as number;
	const cancelAnimationFrame = (handle: number) => clearTimeout(handle);

	setGlobal('OffscreenCanvas', FakeOffscreenCanvas);
	setGlobal('HTMLCanvasElement', FakeHTMLCanvasElement);
	setGlobal('HTMLVideoElement', FakeHTMLVideoElement);
	setGlobal('HTMLImageElement', FakeHTMLImageElement);
	setGlobal('ImageBitmap', FakeImageBitmap);
	setGlobal('MutationObserver', FakeMutationObserver);
	setGlobal('ResizeObserver', FakeResizeObserver);
	setGlobal('WebGLTexture', FakeWebGLTexture);
	setGlobal('window', fakeWindow);
	setGlobal('Window', FakeWindow);
	setGlobal('Element', FakeElement);
	setGlobal('document', document);
	setGlobal('navigator', { share: undefined, canShare: undefined });
	setGlobal('requestAnimationFrame', requestAnimationFrame);
	setGlobal('cancelAnimationFrame', cancelAnimationFrame);

	return () => {
		fakeColorSpaceSupport = true;
		(Object.entries(originals) as Array<[keyof typeof originals, unknown]>).forEach(([name, value]) => {
			setGlobal(name, value);
		});
	};
}

export function createFakeCanvas(width = 4, height = 4) {
	return new FakeHTMLCanvasElement(width, height);
}

export function createFakeVideo(currentTime = 0) {
	const video = new FakeHTMLVideoElement();
	video.currentTime = currentTime;
	return video;
}

export function dispatchFakeEvent(
	target: { dispatchEvent(event: { type: string }): boolean },
	type: string,
	init = {},
) {
	target.dispatchEvent({ type, ...init });
}

export function triggerResize(target: object) {
	FakeResizeObserver.notify(target);
}

export function getUniformValue(shader: any, name: string) {
	return shader.gl.uniformValues.get(name);
}

function getTextureRecord(shader: any, name: string) {
	const direct = shader.textures.get(name);
	if (direct) return direct;
	for (const [key, value] of shader.textures.entries()) {
		if (typeof key === 'symbol' && key.description === name) {
			return value;
		}
	}
	return null;
}

export function getTextureWrites(shader: any, name: string) {
	return getTextureRecord(shader, name)?.texture?.writes ?? [];
}

export function getTextureInfo(shader: any, name: string) {
	return getTextureRecord(shader, name);
}

export function getGl(shader: any): FakeWebGL2RenderingContext {
	return shader.gl;
}

export function getGlOperations(shader: any, kind?: FakeGlOperation['kind']) {
	const operations = getGl(shader).operations;
	return kind ? operations.filter(operation => operation.kind === kind) : operations;
}

export function clearGlOperations(...shaders: any[]) {
	for (const shader of shaders) {
		getGl(shader).operations.length = 0;
	}
}
