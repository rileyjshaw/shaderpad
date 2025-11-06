function r(){return function(e,t){t.injectGLSL(`
float historyZ(highp sampler2DArray tex, int frameOffset, int framesAgo) {
	int historyDepth = textureSize(tex, 0).z;
	int z = (historyDepth + frameOffset - framesAgo) % historyDepth;
	return float(z);
}`)}}export{r as helpers};
//# sourceMappingURL=helpers.mjs.map