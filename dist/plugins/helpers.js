"use strict";var o=Object.defineProperty;var a=Object.getOwnPropertyDescriptor;var h=Object.getOwnPropertyNames;var s=Object.prototype.hasOwnProperty;var p=(e,t)=>{for(var i in t)o(e,i,{get:t[i],enumerable:!0})},m=(e,t,i,f)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of h(t))!s.call(e,r)&&r!==i&&o(e,r,{get:()=>t[r],enumerable:!(f=a(t,r))||f.enumerable});return e};var l=e=>m(o({},"__esModule",{value:!0}),e);var g={};p(g,{default:()=>x});module.exports=l(g);var n=`float historyZ(highp sampler2DArray tex, int frameOffset, int framesAgo) {
	int historyDepth = textureSize(tex, 0).z;
	int z = (historyDepth + frameOffset - framesAgo) % historyDepth;
	return float(z);
}
`;function d(){return function(e,t){t.injectGLSL(n)}}var x=d;
//# sourceMappingURL=helpers.js.map