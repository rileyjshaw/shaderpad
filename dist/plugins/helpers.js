"use strict";var n=Object.defineProperty;var a=Object.getOwnPropertyDescriptor;var f=Object.getOwnPropertyNames;var h=Object.prototype.hasOwnProperty;var s=(e,t)=>{for(var i in t)n(e,i,{get:t[i],enumerable:!0})},p=(e,t,i,o)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of f(t))!h.call(e,r)&&r!==i&&n(e,r,{get:()=>t[r],enumerable:!(o=a(t,r))||o.enumerable});return e};var m=e=>p(n({},"__esModule",{value:!0}),e);var l={};s(l,{helpers:()=>u});module.exports=m(l);function u(){return function(e,t){t.injectGLSL(`
float historyZ(highp sampler2DArray tex, int frameOffset, int framesAgo) {
	int historyDepth = textureSize(tex, 0).z;
	int z = (historyDepth + frameOffset - framesAgo) % historyDepth;
	return float(z);
}`)}}0&&(module.exports={helpers});
//# sourceMappingURL=helpers.js.map