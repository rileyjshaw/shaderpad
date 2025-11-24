"use strict";var o=Object.defineProperty;var a=Object.getOwnPropertyDescriptor;var c=Object.getOwnPropertyNames;var s=Object.prototype.hasOwnProperty;var x=(t,e)=>{for(var i in e)o(t,i,{get:e[i],enumerable:!0})},f=(t,e,i,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of c(e))!s.call(t,r)&&r!==i&&o(t,r,{get:()=>e[r],enumerable:!(n=a(e,r))||n.enumerable});return t};var l=t=>f(o({},"__esModule",{value:!0}),t);var v={};x(v,{default:()=>p});module.exports=l(v);var u=`// Apply aspect ratio correction (object-fit: contain)
vec2 fitContain(vec2 uv, vec2 textureSize) {
	vec2 scale = u_resolution.xy * textureSize.yx / (u_resolution.yx * textureSize.xy);
	return (uv - 0.5) * min(scale, vec2(1.0)) + 0.5;
}

// Apply aspect ratio correction (object-fit: cover)
vec2 fitCover(vec2 uv, vec2 textureSize) {
	vec2 scale = u_resolution.xy * textureSize.yx / (u_resolution.yx * textureSize.xy);
	return (uv - 0.5) * max(scale, vec2(1.0)) + 0.5;
}

// Get the array index for a history texture
float historyZ(highp sampler2DArray tex, int frameOffset, int framesAgo) {
	int historyDepth = textureSize(tex, 0).z;
	int z = (historyDepth + frameOffset - framesAgo) % historyDepth;
	return float(z);
}
`;function h(){return function(t,e){e.injectGLSL(u)}}var p=h;
//# sourceMappingURL=helpers.js.map