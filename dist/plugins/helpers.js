"use strict";var o=Object.defineProperty;var h=Object.getOwnPropertyDescriptor;var a=Object.getOwnPropertyNames;var s=Object.prototype.hasOwnProperty;var p=(e,t)=>{for(var i in t)o(e,i,{get:t[i],enumerable:!0})},m=(e,t,i,n)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of a(t))!s.call(e,r)&&r!==i&&o(e,r,{get:()=>t[r],enumerable:!(n=h(t,r))||n.enumerable});return e};var l=e=>m(o({},"__esModule",{value:!0}),e);var d={};p(d,{helpers:()=>x});module.exports=l(d);var f=`float historyZ(highp sampler2DArray tex, int frameOffset, int framesAgo) {
	int historyDepth = textureSize(tex, 0).z;
	int z = (historyDepth + frameOffset - framesAgo) % historyDepth;
	return float(z);
}
`;function x(){return function(e,t){t.injectGLSL(f)}}0&&(module.exports={helpers});
//# sourceMappingURL=helpers.js.map