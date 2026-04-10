"use strict";var o=Object.defineProperty;var a=Object.getOwnPropertyDescriptor;var n=Object.getOwnPropertyNames;var c=Object.prototype.hasOwnProperty;var f=(t,e)=>{for(var i in e)o(t,i,{get:e[i],enumerable:!0})},x=(t,e,i,u)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of n(e))!c.call(t,r)&&r!==i&&o(t,r,{get:()=>e[r],enumerable:!(u=a(e,r))||u.enumerable});return t};var v=t=>x(o({},"__esModule",{value:!0}),t);var h={};f(h,{default:()=>m});module.exports=v(h);var s=`uniform vec2 u_resolution;

// Apply aspect ratio correction (object-fit: contain)
vec2 fitContain(vec2 uv, vec2 textureSize) {
	vec2 scale = u_resolution.xy * textureSize.yx / (u_resolution.yx * textureSize.xy);
	return (uv - 0.5) * max(scale, vec2(1.0)) + 0.5;
}

// Map source UVs back into viewport UVs using object-fit: contain.
vec2 fitContainInverse(vec2 uv, vec2 textureSize) {
	vec2 scale = u_resolution.xy * textureSize.yx / (u_resolution.yx * textureSize.xy);
	return (uv - 0.5) / max(scale, vec2(1.0)) + 0.5;
}

// Apply aspect ratio correction (object-fit: cover)
vec2 fitCover(vec2 uv, vec2 textureSize) {
	vec2 scale = u_resolution.xy * textureSize.yx / (u_resolution.yx * textureSize.xy);
	return (uv - 0.5) * min(scale, vec2(1.0)) + 0.5;
}

// Map source UVs back into viewport UVs using object-fit: cover.
vec2 fitCoverInverse(vec2 uv, vec2 textureSize) {
	vec2 scale = u_resolution.xy * textureSize.yx / (u_resolution.yx * textureSize.xy);
	return (uv - 0.5) / min(scale, vec2(1.0)) + 0.5;
}

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
`;function y(){return function(t,e){e.injectGLSL(s)}}var m=y;
//# sourceMappingURL=helpers.js.map