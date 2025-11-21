var t=`float historyZ(highp sampler2DArray tex, int frameOffset, int framesAgo) {
	int historyDepth = textureSize(tex, 0).z;
	int z = (historyDepth + frameOffset - framesAgo) % historyDepth;
	return float(z);
}
`;function i(){return function(o,e){e.injectGLSL(t)}}var a=i;export{a as default};
//# sourceMappingURL=helpers.mjs.map