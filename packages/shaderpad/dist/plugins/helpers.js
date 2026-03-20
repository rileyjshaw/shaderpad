"use strict";var o=Object.defineProperty;var s=Object.getOwnPropertyDescriptor;var u=Object.getOwnPropertyNames;var n=Object.prototype.hasOwnProperty;var c=(t,e)=>{for(var i in e)o(t,i,{get:e[i],enumerable:!0})},x=(t,e,i,f)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of u(e))!n.call(t,r)&&r!==i&&o(t,r,{get:()=>e[r],enumerable:!(f=s(e,r))||f.enumerable});return t};var m=t=>x(o({},"__esModule",{value:!0}),t);var p={};c(p,{default:()=>y});module.exports=m(p);var a=`uniform vec2 u_resolution;

// Apply aspect ratio correction (object-fit: contain)
vec2 fitContain(vec2 uv, vec2 textureSize) {
	vec2 scale = u_resolution.xy * textureSize.yx / (u_resolution.yx * textureSize.xy);
	return (uv - 0.5) * max(scale, vec2(1.0)) + 0.5;
}

// Apply aspect ratio correction (object-fit: cover)
vec2 fitCover(vec2 uv, vec2 textureSize) {
	vec2 scale = u_resolution.xy * textureSize.yx / (u_resolution.yx * textureSize.xy);
	return (uv - 0.5) * min(scale, vec2(1.0)) + 0.5;
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
`;function l(){return function(t,e){e.injectGLSL(a)}}var y=l;
//# sourceMappingURL=helpers.js.map