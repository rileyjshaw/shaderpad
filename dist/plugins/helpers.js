"use strict";var i=Object.defineProperty;var c=Object.getOwnPropertyDescriptor;var a=Object.getOwnPropertyNames;var s=Object.prototype.hasOwnProperty;var x=(t,e)=>{for(var o in e)i(t,o,{get:e[o],enumerable:!0})},f=(t,e,o,u)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of a(e))!s.call(t,r)&&r!==o&&i(t,r,{get:()=>e[r],enumerable:!(u=c(e,r))||u.enumerable});return t};var l=t=>f(i({},"__esModule",{value:!0}),t);var p={};x(p,{default:()=>h});module.exports=l(p);var n=`uniform vec2 u_resolution;

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

// Get the array index for a history texture
float historyZ(highp sampler2DArray tex, int frameOffset, int framesAgo) {
	int historyDepth = textureSize(tex, 0).z;
	int z = (historyDepth + frameOffset - framesAgo) % historyDepth;
	return float(z);
}
`;function y(){return function(t,e){e.injectGLSL(n)}}var h=y;
//# sourceMappingURL=helpers.js.map