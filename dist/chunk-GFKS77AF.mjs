var t=`float historyZ(highp sampler2DArray tex, int frameOffset, int framesAgo) {
	int historyDepth = textureSize(tex, 0).z;
	int z = (historyDepth + frameOffset - framesAgo) % historyDepth;
	return float(z);
}`;function f(){return function(i,e){e.injectGLSL(t)}}export{f as a};
//# sourceMappingURL=chunk-GFKS77AF.mjs.map