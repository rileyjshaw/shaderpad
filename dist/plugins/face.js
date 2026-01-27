"use strict";var ue=Object.create;var D=Object.defineProperty;var fe=Object.getOwnPropertyDescriptor;var Ee=Object.getOwnPropertyNames;var de=Object.getPrototypeOf,_e=Object.prototype.hasOwnProperty;var Te=(a,e)=>{for(var t in e)D(a,t,{get:e[t],enumerable:!0})},J=(a,e,t,i)=>{if(e&&typeof e=="object"||typeof e=="function")for(let n of Ee(e))!_e.call(a,n)&&n!==t&&D(a,n,{get:()=>e[n],enumerable:!(i=fe(e,n))||i.enumerable});return a};var Z=(a,e,t)=>(t=a!=null?ue(de(a)):{},J(e||!a||!a.__esModule?D(t,"default",{value:a,enumerable:!0}):t,a)),pe=a=>J(D({},"__esModule",{value:!0}),a);var be={};Te(be,{default:()=>ve});module.exports=pe(be);var Ie={data:new Uint8Array(4),width:1,height:1};function Y(a){return a instanceof HTMLVideoElement||a instanceof HTMLImageElement||a instanceof HTMLCanvasElement||a instanceof OffscreenCanvas}function Q(a){return JSON.stringify(a,Object.keys(a).sort())}function w(a,e,t,i,n=0){let c=1/0,d=-1/0,l=1/0,o=-1/0,m=0,u=0;for(let f of t){let p=(n+e*i+f)*4,v=a[p],b=a[p+1];c=Math.min(c,v),d=Math.max(d,v),l=Math.min(l,b),o=Math.max(o,b),m+=a[p+2],u+=a[p+3]}return[(c+d)/2,(l+o)/2,m/t.length,u/t.length]}var P=null;function ee(){return P||(P=import("@mediapipe/tasks-vision").then(({FilesetResolver:a})=>a.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm"))),P}function te(a){return{historyParams:a?", framesAgo":"",fn:a?(i,n,c,d)=>{let l=c.replace(/\w+ /g,""),o=c?`${c}, int framesAgo`:"int framesAgo",m=l?`${l}, 0`:"0";return`${i} ${n}(${o}) {
${d}
}
${i} ${n}(${c}) { return ${n}(${m}); }`}:(i,n,c,d)=>`${i} ${n}(${c}) {
${d}
}`}}var Ae=`#version 300 es
in vec2 a_pos;
void main() { gl_Position = vec4(a_pos * 2.0 - 1.0, 0.0, 1.0); }`,Fe=`#version 300 es
precision mediump float;
uniform vec4 u_color;
out vec4 outColor;
void main() { outColor = u_color; }`,S=478,Re=2,F=S+Re,x=512,L=1,ae=[336,296,334,293,300,276,283,282,295,285],re=[362,398,384,385,386,387,388,466,263,249,390,373,374,380,381,382],se=[70,63,105,66,107,55,65,52,53,46],ie=[33,246,161,160,159,158,157,173,133,155,154,153,145,144,163,7],oe=[61,185,40,39,37,0,267,269,270,409,291,375,321,405,314,17,84,181,91,146],B=[78,191,80,81,82,13,312,311,310,415,308,324,318,402,317,14,87,178,88,95],ge=Array.from({length:S},(a,e)=>e),k={LEFT_EYEBROW:ae,LEFT_EYE:re,LEFT_EYE_CENTER:473,RIGHT_EYEBROW:se,RIGHT_EYE:ie,RIGHT_EYE_CENTER:468,NOSE_TIP:4,OUTER_MOUTH:oe,INNER_MOUTH:B,FACE_CENTER:S,MOUTH_CENTER:S+1},ce=["BACKGROUND","LEFT_EYEBROW","RIGHT_EYEBROW","LEFT_EYE","RIGHT_EYE","OUTER_MOUTH","INNER_MOUTH"],me=ce.length-1,M=Object.fromEntries(ce.map((a,e)=>[a,e/me])),ne=.5/me,Me={modelPath:"https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",maxFaces:1,minFaceDetectionConfidence:.5,minFacePresenceConfidence:.5,minTrackingConfidence:.5,outputFaceBlendshapes:!1,outputFacialTransformationMatrixes:!1};function O(a){let e=[];for(let t=1;t<a.length-1;++t)e.push(a[0],a[t],a[t+1]);return e}var T=null;function Le(a){if(!T){let e=a.FACE_LANDMARKS_TESSELATION,t=[];for(let n=0;n<e.length-2;n+=3)t.push(e[n].start,e[n+1].start,e[n+2].start);let i=a.FACE_LANDMARKS_FACE_OVAL.map(({start:n})=>n);T=Object.fromEntries(Object.entries({LEFT_EYEBROW:O(ae),RIGHT_EYEBROW:O(se),LEFT_EYE:O(re),RIGHT_EYE:O(ie),OUTER_MOUTH:O(oe),INNER_MOUTH:O(B),TESSELATION:t,OVAL:O(i)}).map(([n,c])=>[n,{triangles:c,vertices:new Float32Array(c.length*2)}]))}}var C=new Map;function he(a){let e=a.getContext("webgl2",{antialias:!1,preserveDrawingBuffer:!0}),t=e.createShader(e.VERTEX_SHADER);e.shaderSource(t,Ae),e.compileShader(t);let i=e.createShader(e.FRAGMENT_SHADER);e.shaderSource(i,Fe),e.compileShader(i);let n=e.createProgram();e.attachShader(n,t),e.attachShader(n,i),e.linkProgram(n),e.deleteShader(t),e.deleteShader(i);let c=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,c);let d=e.getAttribLocation(n,"a_pos");e.enableVertexAttribArray(d),e.vertexAttribPointer(d,2,e.FLOAT,!1,0,0);let l=e.getUniformLocation(n,"u_color");return e.useProgram(n),e.enable(e.BLEND),e.blendEquation(e.MAX),{canvas:a,gl:e,program:n,positionBuffer:c,colorLocation:l}}function g(a,e,t,i,n,c,d){let{triangles:l,vertices:o}=t,{gl:m,colorLocation:u}=a;for(let f=0;f<l.length;++f){let p=(L+i*F+l[f])*4;o[f*2]=e[p],o[f*2+1]=e[p+1]}m.bufferData(m.ARRAY_BUFFER,o,m.DYNAMIC_DRAW),m.uniform4f(u,n,c,d,1),m.drawArrays(m.TRIANGLES,0,l.length)}function xe(a,e){let t=a.landmarks.data,i=e.length;t[0]=i;for(let n=0;n<i;++n){let c=e[n];for(let o=0;o<S;++o){let m=c[o],u=(L+n*F+o)*4;t[u]=m.x,t[u+1]=1-m.y,t[u+2]=m.z??0,t[u+3]=m.visibility??1}let d=w(t,n,ge,F,L);t.set(d,(L+n*F+k.FACE_CENTER)*4);let l=w(t,n,B,F,1);t.set(l,(L+n*F+k.MOUTH_CENTER)*4)}a.state.nFaces=i}function Oe(a,e,t){if(!T)return;let{mask:i,maxFaces:n,landmarks:c,state:{nFaces:d}}=a,{gl:l,canvas:o}=i,{data:m}=c;(o.width!==e||o.height!==t)&&(o.width=e,o.height=t),l.viewport(0,0,o.width,o.height),l.clearColor(0,0,0,0),l.clear(l.COLOR_BUFFER_BIT);for(let u=0;u<d;++u){let f=(u+1)/n;g(i,m,T.TESSELATION,u,0,.5,f),g(i,m,T.OVAL,u,0,1,f),g(i,m,T.LEFT_EYEBROW,u,M.LEFT_EYEBROW,0,f),g(i,m,T.RIGHT_EYEBROW,u,M.RIGHT_EYEBROW,0,f),g(i,m,T.LEFT_EYE,u,M.LEFT_EYE,0,f),g(i,m,T.RIGHT_EYE,u,M.RIGHT_EYE,0,f),g(i,m,T.OUTER_MOUTH,u,M.OUTER_MOUTH,0,f),g(i,m,T.INNER_MOUTH,u,M.INNER_MOUTH,0,f)}}function ke(a){let{textureName:e,options:{history:t,...i}={}}=a,n={...Me,...i},c=Q({...n,textureName:e}),d=n.maxFaces*F+L,l=Math.ceil(d/x);return function(o,m){let{injectGLSL:u,emitHook:f}=m,p=C.get(c),v=p?.landmarks.data??new Float32Array(x*l*4),b=p?.mask.canvas??new OffscreenCanvas(1,1),r=null,G=!1;function N(){if(!r)return;let s=r.state.nFaces,_=s*F+L,A=Math.ceil(_/x);o.updateTextures({u_faceLandmarksTex:{data:r.landmarks.data,width:x,height:A,isPartial:!0},u_faceMask:r.mask.canvas},{skipHistoryWrite:G}),o.updateUniforms({u_nFaces:s}),f("face:result",r.state.result)}async function le(){if(C.has(c))r=C.get(c);else{let[s,{FaceLandmarker:_}]=await Promise.all([ee(),import("@mediapipe/tasks-vision")]),A=new OffscreenCanvas(1,1);r={landmarker:await _.createFromOptions(s,{baseOptions:{modelAssetPath:n.modelPath,delegate:"GPU"},canvas:A,runningMode:"VIDEO",numFaces:n.maxFaces,minFaceDetectionConfidence:n.minFaceDetectionConfidence,minFacePresenceConfidence:n.minFacePresenceConfidence,minTrackingConfidence:n.minTrackingConfidence,outputFaceBlendshapes:n.outputFaceBlendshapes,outputFacialTransformationMatrixes:n.outputFacialTransformationMatrixes}),mediapipeCanvas:A,mask:he(b),subscribers:new Map,maxFaces:n.maxFaces,state:{runningMode:"VIDEO",source:null,videoTime:-1,resultTimestamp:0,result:null,pending:Promise.resolve(),nFaces:0},landmarks:{data:v,textureHeight:l}},Le(_),C.set(c,r)}r.subscribers.set(N,!1)}let W=le(),V=0;async function K(s){let _=performance.now(),A=++V;await W,r&&(r.state.pending=r.state.pending.then(async()=>{if(A!==V||!r)return;let y=s instanceof HTMLVideoElement?"VIDEO":"IMAGE";r.state.runningMode!==y&&(r.state.runningMode=y,await r.landmarker.setOptions({runningMode:y}));let $=!1;if(s!==r.state.source?(r.state.source=s,r.state.videoTime=-1,$=!0):s instanceof HTMLVideoElement?s.currentTime!==r.state.videoTime&&(r.state.videoTime=s.currentTime,$=!0):s instanceof HTMLImageElement||_-r.state.resultTimestamp>2&&($=!0),$){let I,H,U;if(s instanceof HTMLVideoElement){if(s.videoWidth===0||s.videoHeight===0||s.readyState<2)return;H=s.videoWidth,U=s.videoHeight,I=r.landmarker.detectForVideo(s,_)}else{if(s.width===0||s.height===0)return;H=s.width,U=s.height,I=r.landmarker.detect(s)}if(I){r.state.resultTimestamp=_,r.state.result=I,xe(r,I.faceLandmarks),Oe(r,H,U);for(let q of r.subscribers.keys())q(),r.subscribers.set(q,!0)}}else r.state.result&&!r.subscribers.get(N)&&(N(),r.subscribers.set(N,!0))}),await r.state.pending)}o.on("init",()=>{o.initializeUniform("u_maxFaces","int",n.maxFaces),o.initializeUniform("u_nFaces","int",0),o.initializeTexture("u_faceLandmarksTex",{data:v,width:x,height:l},{internalFormat:"RGBA32F",type:"FLOAT",minFilter:"NEAREST",magFilter:"NEAREST",history:t}),o.initializeTexture("u_faceMask",b,{minFilter:"NEAREST",magFilter:"NEAREST",history:t}),W.then(()=>f("face:ready"))}),o.on("initializeTexture",(s,_)=>{s===e&&Y(_)&&K(_)}),o.on("updateTextures",(s,_)=>{let A=s[e];Y(A)&&(G=_?.skipHistoryWrite??!1,K(A))}),o.on("destroy",()=>{r&&(r.subscribers.delete(N),r.subscribers.size===0&&(r.landmarker.close(),r.mask.gl.deleteProgram(r.mask.program),r.mask.gl.deleteBuffer(r.mask.positionBuffer),C.delete(c))),r=null});let{fn:E,historyParams:R}=te(t),z=t?"_sampleFaceMask(pos, framesAgo)":"texture(u_faceMask, pos)",h=(s,_=s)=>`vec4 mask = ${z};
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return (mask.r > ${(M[s]-ne).toFixed(4)} && mask.r < ${(M[_]+ne).toFixed(4)}) ? vec2(1.0, faceIndex) : vec2(0.0, -1.0);`,j=s=>`vec4 mask = ${z};
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return mask.g > ${s.toFixed(2)} ? vec2(1.0, faceIndex) : vec2(0.0, -1.0);`,X=(s,_)=>`vec2 left = ${s}(pos${R});
	return left.x > 0.0 ? left : ${_}(pos${R});`;u(`
uniform int u_maxFaces;
uniform int u_nFaces;
uniform highp sampler2D${t?"Array":""} u_faceLandmarksTex;${t?`
uniform int u_faceLandmarksTexFrameOffset;`:""}
uniform sampler2D${t?"Array":""} u_faceMask;${t?`
uniform int u_faceMaskFrameOffset;`:""}

#define FACE_LANDMARK_L_EYE_CENTER ${k.LEFT_EYE_CENTER}
#define FACE_LANDMARK_R_EYE_CENTER ${k.RIGHT_EYE_CENTER}
#define FACE_LANDMARK_NOSE_TIP ${k.NOSE_TIP}
#define FACE_LANDMARK_FACE_CENTER ${k.FACE_CENTER}
#define FACE_LANDMARK_MOUTH_CENTER ${k.MOUTH_CENTER}

${E("int","nFacesAt","",t?`
	int layer = (u_faceLandmarksTexFrameOffset - framesAgo + ${t}) % ${t};
	return int(texelFetch(u_faceLandmarksTex, ivec3(0, 0, layer), 0).r + 0.5);`:`
	return int(texelFetch(u_faceLandmarksTex, ivec2(0, 0), 0).r + 0.5);`)}
${E("vec4","faceLandmark","int faceIndex, int landmarkIndex",`int i = ${L} + faceIndex * ${F} + landmarkIndex;
	int x = i % ${x};
	int y = i / ${x};${t?`
	int layer = (u_faceLandmarksTexFrameOffset - framesAgo + ${t}) % ${t};
	return texelFetch(u_faceLandmarksTex, ivec3(x, y, layer), 0);`:`
	return texelFetch(u_faceLandmarksTex, ivec2(x, y), 0);`}`)}
${t?`
vec4 _sampleFaceMask(vec2 pos, int framesAgo) {
	int layer = (u_faceMaskFrameOffset - framesAgo + ${t}) % ${t};
	return texture(u_faceMask, vec3(pos, float(layer)));
}
`:""}
${E("vec2","leftEyebrowAt","vec2 pos",h("LEFT_EYEBROW"))}
${E("vec2","rightEyebrowAt","vec2 pos",h("RIGHT_EYEBROW"))}
${E("vec2","leftEyeAt","vec2 pos",h("LEFT_EYE"))}
${E("vec2","rightEyeAt","vec2 pos",h("RIGHT_EYE"))}
${E("vec2","lipsAt","vec2 pos",h("OUTER_MOUTH"))}
${E("vec2","outerMouthAt","vec2 pos",h("OUTER_MOUTH","INNER_MOUTH"))}
${E("vec2","innerMouthAt","vec2 pos",h("INNER_MOUTH"))}
${E("vec2","faceOvalAt","vec2 pos",j(.75))}
${E("vec2","faceAt","vec2 pos",j(.25))}
${E("vec2","eyeAt","vec2 pos",X("leftEyeAt","rightEyeAt"))}
${E("vec2","eyebrowAt","vec2 pos",X("leftEyebrowAt","rightEyebrowAt"))}
${E("float","inEyebrow","vec2 pos",`return eyebrowAt(pos${R}).x;`)}
${E("float","inEye","vec2 pos",`return eyeAt(pos${R}).x;`)}
${E("float","inOuterMouth","vec2 pos",`return outerMouthAt(pos${R}).x;`)}
${E("float","inInnerMouth","vec2 pos",`return innerMouthAt(pos${R}).x;`)}
${E("float","inLips","vec2 pos",`return lipsAt(pos${R}).x;`)}
${E("float","inFace","vec2 pos",`return faceAt(pos${R}).x;`)}`)}}var ve=ke;
//# sourceMappingURL=face.js.map