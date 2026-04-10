float _historyZ(int historyDepth, int frameOffset, int framesAgo) {
	return float((historyDepth + frameOffset - framesAgo) % historyDepth);
}
float historyZ(highp sampler2DArray tex, int frameOffset, int framesAgo) {
	return _historyZ(textureSize(tex, 0).z, frameOffset, framesAgo);
}
float historyZ(highp usampler2DArray tex, int frameOffset, int framesAgo) {
	return _historyZ(textureSize(tex, 0).z, frameOffset, framesAgo);
}
float historyZ(highp isampler2DArray tex, int frameOffset, int framesAgo) {
	return _historyZ(textureSize(tex, 0).z, frameOffset, framesAgo);
}
