export type GLFormatString =
	| 'R8'
	| 'R8_SNORM'
	| 'R16F'
	| 'R32F'
	| 'R8UI'
	| 'R8I'
	| 'R16UI'
	| 'R16I'
	| 'R32UI'
	| 'R32I'
	| 'RG8'
	| 'RG8_SNORM'
	| 'RG16F'
	| 'RG32F'
	| 'RG8UI'
	| 'RG8I'
	| 'RG16UI'
	| 'RG16I'
	| 'RG32UI'
	| 'RG32I'
	| 'RGB8'
	| 'SRGB8'
	| 'RGB565'
	| 'RGB8_SNORM'
	| 'R11F_G11F_B10F'
	| 'RGB9_E5'
	| 'RGB16F'
	| 'RGB32F'
	| 'RGB8UI'
	| 'RGB8I'
	| 'RGB16UI'
	| 'RGB16I'
	| 'RGB32UI'
	| 'RGB32I'
	| 'RGBA8'
	| 'SRGB8_ALPHA8'
	| 'RGBA8_SNORM'
	| 'RGB5_A1'
	| 'RGBA4'
	| 'RGB10_A2'
	| 'RGBA16F'
	| 'RGBA32F'
	| 'RGBA8UI'
	| 'RGBA8I'
	| 'RGB10_A2UI'
	| 'RGBA16UI'
	| 'RGBA16I'
	| 'RGBA32UI'
	| 'RGBA32I';

export type GLRenderFormatString = Exclude<
	GLFormatString,
	| 'R8_SNORM'
	| 'RG8_SNORM'
	| 'SRGB8'
	| 'RGB8_SNORM'
	| 'RGB9_E5'
	| 'RGB16F'
	| 'RGB32F'
	| 'RGB8UI'
	| 'RGB8I'
	| 'RGB16UI'
	| 'RGB16I'
	| 'RGB32UI'
	| 'RGB32I'
	| 'RGBA8_SNORM'
>;

export type GLUploadFormatString =
	'RED' | 'RG' | 'RGB' | 'RGBA' | 'RED_INTEGER' | 'RG_INTEGER' | 'RGB_INTEGER' | 'RGBA_INTEGER';

export const channelsFor = (format: GLFormatString) =>
	+format.includes('A') + +format.includes('B') + +format.includes('G') + 1;

export function uploadFormatFor(format: GLFormatString): GLUploadFormatString {
	const channels = channelsFor(format);
	const name = channels < 2 ? 'RED' : 'RGBA'.slice(0, channels);
	return `${name}${format.endsWith('I') ? '_INTEGER' : ''}` as GLUploadFormatString;
}

export function typeFor(format: GLFormatString, data?: ArrayBufferView | null): number {
	if (format[4] === '0') return 33640; // UNSIGNED_INT_2_10_10_10_REV
	if (format[1] === '1' && data instanceof Uint32Array) return 35899; // UNSIGNED_INT_10F_11F_11F_REV
	if (format[3] === '9' && data instanceof Uint32Array) return 35902; // UNSIGNED_INT_5_9_9_9_REV
	if (data instanceof Uint16Array) {
		if (format[3] === '5') return format[4] === '_' ? 32820 : 33635; // 5_5_5_1 : 5_6_5
		if (format[4] === '4') return 32819; // UNSIGNED_SHORT_4_4_4_4
	}
	if (format.includes('F') || format[3] === '9') {
		return data instanceof Uint16Array && !format.includes('32F') ? 5131 : 5126; // HALF_FLOAT : FLOAT
	}
	if (format.endsWith('I')) {
		return (format.includes('8') ? 5120 : format.includes('16') ? 5122 : 5124) + +format.endsWith('UI');
	}
	return 5121 - +format.endsWith('SNORM');
}

const ARRAY_TYPES = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array];

export function arrayForType(type: number): new (length: number) => ArrayBufferView {
	return (type > 30000 ? (type < 33640 ? Uint16Array : Uint32Array) : ARRAY_TYPES[type === 5131 ? 3 : type - 5120])!;
}
