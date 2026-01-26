"use strict";var le=Object.create;var D=Object.defineProperty;var ue=Object.getOwnPropertyDescriptor;var fe=Object.getOwnPropertyNames;var Ee=Object.getPrototypeOf,de=Object.prototype.hasOwnProperty;var _e=(t,e)=>{for(var n in e)D(t,n,{get:e[n],enumerable:!0})},q=(t,e,n,m)=>{if(e&&typeof e=="object"||typeof e=="function")for(let a of fe(e))!de.call(t,a)&&a!==n&&D(t,a,{get:()=>e[a],enumerable:!(m=ue(e,a))||m.enumerable});return t};var J=(t,e,n)=>(n=t!=null?le(Ee(t)):{},q(e||!t||!t.__esModule?D(n,"default",{value:t,enumerable:!0}):n,t)),Te=t=>q(D({},"__esModule",{value:!0}),t);var he={};_e(he,{default:()=>ve});module.exports=Te(he);var be={data:new Uint8Array(4),width:1,height:1};function U(t){return t instanceof HTMLVideoElement||t instanceof HTMLImageElement||t instanceof HTMLCanvasElement||t instanceof OffscreenCanvas}function Z(t){return JSON.stringify(t,Object.keys(t).sort())}function P(t,e,n,m,a=0){let i=1/0,l=-1/0,c=1/0,s=-1/0,E=0,_=0;for(let T of n){let d=(a+e*m+T)*4,g=t[d],N=t[d+1];i=Math.min(i,g),l=Math.max(l,g),c=Math.min(c,N),s=Math.max(s,N),E+=t[d+2],_+=t[d+3]}return[(i+l)/2,(c+s)/2,E/n.length,_/n.length]}var H=null;function Q(){return H||(H=import("@mediapipe/tasks-vision").then(({FilesetResolver:t})=>t.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm"))),H}function ee(t){return{historyParams:t?", framesAgo":"",fn:t?(m,a,i,l)=>{let c=i.replace(/\w+ /g,""),s=i?`${i}, int framesAgo`:"int framesAgo",E=c?`${c}, 0`:"0";return`${m} ${a}(${s}) {
${l}
}
${m} ${a}(${i}) { return ${a}(${E}); }`}:(m,a,i,l)=>`${m} ${a}(${i}) {
${l}
}`}}var pe=`#version 300 es
in vec2 a_pos;
void main() { gl_Position = vec4(a_pos * 2.0 - 1.0, 0.0, 1.0); }`,Ae=`#version 300 es
precision mediump float;
uniform vec4 u_color;
out vec4 outColor;
void main() { outColor = u_color; }`,S=478,Fe=2,F=S+Fe,O=512,M=1,ne=[336,296,334,293,300,276,283,282,295,285],ae=[362,398,384,385,386,387,388,466,263,249,390,373,374,380,381,382],re=[70,63,105,66,107,55,65,52,53,46],se=[33,246,161,160,159,158,157,173,133,155,154,153,145,144,163,7],ie=[61,185,40,39,37,0,267,269,270,409,291,375,321,405,314,17,84,181,91,146],Y=[78,191,80,81,82,13,312,311,310,415,308,324,318,402,317,14,87,178,88,95],ge=Array.from({length:S},(t,e)=>e),h={LEFT_EYEBROW:ne,LEFT_EYE:ae,LEFT_EYE_CENTER:473,RIGHT_EYEBROW:re,RIGHT_EYE:se,RIGHT_EYE_CENTER:468,NOSE_TIP:4,OUTER_MOUTH:ie,INNER_MOUTH:Y,FACE_CENTER:S,MOUTH_CENTER:S+1},oe=["BACKGROUND","LEFT_EYEBROW","RIGHT_EYEBROW","LEFT_EYE","RIGHT_EYE","OUTER_MOUTH","INNER_MOUTH"],ce=oe.length-1,x=Object.fromEntries(oe.map((t,e)=>[t,e/ce])),te=.5/ce,Re={modelPath:"https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",maxFaces:1,minFaceDetectionConfidence:.5,minFacePresenceConfidence:.5,minTrackingConfidence:.5,outputFaceBlendshapes:!1,outputFacialTransformationMatrixes:!1};function v(t){let e=[];for(let n=1;n<t.length-1;++n)e.push(t[0],t[n],t[n+1]);return e}var p=null;function Le(t){if(!p){let e=t.FACE_LANDMARKS_TESSELATION,n=[];for(let a=0;a<e.length-2;a+=3)n.push(e[a].start,e[a+1].start,e[a+2].start);let m=t.FACE_LANDMARKS_FACE_OVAL.map(({start:a})=>a);p=Object.fromEntries(Object.entries({LEFT_EYEBROW:v(ne),RIGHT_EYEBROW:v(re),LEFT_EYE:v(ae),RIGHT_EYE:v(se),OUTER_MOUTH:v(ie),INNER_MOUTH:v(Y),TESSELATION:n,OVAL:v(m)}).map(([a,i])=>[a,{triangles:i,vertices:new Float32Array(i.length*2)}]))}}var C=new Map;function xe(t){let e=t.mask.canvas.getContext("webgl2",{antialias:!1,preserveDrawingBuffer:!0}),n=e.createShader(e.VERTEX_SHADER);e.shaderSource(n,pe),e.compileShader(n);let m=e.createShader(e.FRAGMENT_SHADER);e.shaderSource(m,Ae),e.compileShader(m);let a=e.createProgram();e.attachShader(a,n),e.attachShader(a,m),e.linkProgram(a),e.deleteShader(n),e.deleteShader(m);let i=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,i);let l=e.getAttribLocation(a,"a_pos");e.enableVertexAttribArray(l),e.vertexAttribPointer(l,2,e.FLOAT,!1,0,0);let c=e.getUniformLocation(a,"u_color");e.useProgram(a),e.enable(e.BLEND),e.blendEquation(e.MAX),t.mask={...t.mask,gl:e,program:a,positionBuffer:i,colorLocation:c}}function L(t,e,n,m,a,i){let{triangles:l,vertices:c}=e,{mask:{gl:s,colorLocation:E},landmarks:_}=t,{data:T}=_;for(let d=0;d<l.length;++d){let g=(M+n*F+l[d])*4;c[d*2]=T[g],c[d*2+1]=T[g+1]}s.bufferData(s.ARRAY_BUFFER,c,s.DYNAMIC_DRAW),s.uniform4f(E,m,a,i,1),s.drawArrays(s.TRIANGLES,0,l.length)}function Me(t,e){let n=t.landmarks.data,m=e.length;n[0]=m;for(let a=0;a<m;++a){let i=e[a];for(let s=0;s<S;++s){let E=i[s],_=(M+a*F+s)*4;n[_]=E.x,n[_+1]=1-E.y,n[_+2]=E.z??0,n[_+3]=E.visibility??1}let l=P(n,a,ge,F,M);n.set(l,(M+a*F+h.FACE_CENTER)*4);let c=P(n,a,Y,F,1);n.set(c,(M+a*F+h.MOUTH_CENTER)*4)}t.state.nFaces=m}function ke(t){if(!p)return;let{mask:e,canvas:n,maxFaces:m,state:{nFaces:a}}=t,{gl:i,canvas:l}=e;l.width=n.width,l.height=n.height,i.viewport(0,0,l.width,l.height),i.clearColor(0,0,0,0),i.clear(i.COLOR_BUFFER_BIT);for(let c=0;c<a;++c){let s=(c+1)/m;L(t,p.TESSELATION,c,0,.5,s),L(t,p.OVAL,c,0,1,s),L(t,p.LEFT_EYEBROW,c,x.LEFT_EYEBROW,0,s),L(t,p.RIGHT_EYEBROW,c,x.RIGHT_EYEBROW,0,s),L(t,p.LEFT_EYE,c,x.LEFT_EYE,0,s),L(t,p.RIGHT_EYE,c,x.RIGHT_EYE,0,s),L(t,p.OUTER_MOUTH,c,x.OUTER_MOUTH,0,s),L(t,p.INNER_MOUTH,c,x.INNER_MOUTH,0,s)}}function Oe(t){let{textureName:e,options:{history:n,...m}={}}=t,a={...Re,...m},i=Z({...a,textureName:e}),l=a.maxFaces*F+M,c=Math.ceil(l/O);return function(s,E){let{injectGLSL:_,gl:T,emitHook:d}=E,g=C.get(i),N=g?.landmarks.data??new Float32Array(O*c*4),B=g?.mask.canvas??new OffscreenCanvas(1,1),r=null,w=!1;function b(){if(!r)return;let o=r.state.nFaces,f=o*F+M,A=Math.ceil(f/O);s.updateTextures({u_faceLandmarksTex:{data:r.landmarks.data,width:O,height:A,isPartial:!0},u_faceMask:r.mask.canvas},{skipHistoryWrite:w}),s.updateUniforms({u_nFaces:o}),d("face:result",r.state.result)}async function me(){if(C.has(i))r=C.get(i);else{let[o,{FaceLandmarker:f}]=await Promise.all([Q(),import("@mediapipe/tasks-vision")]),A=new OffscreenCanvas(1,1);r={landmarker:await f.createFromOptions(o,{baseOptions:{modelAssetPath:a.modelPath,delegate:"GPU"},canvas:A,runningMode:"VIDEO",numFaces:a.maxFaces,minFaceDetectionConfidence:a.minFaceDetectionConfidence,minFacePresenceConfidence:a.minFacePresenceConfidence,minTrackingConfidence:a.minTrackingConfidence,outputFaceBlendshapes:a.outputFaceBlendshapes,outputFacialTransformationMatrixes:a.outputFacialTransformationMatrixes}),canvas:A,subscribers:new Map,maxFaces:a.maxFaces,state:{runningMode:"VIDEO",source:null,videoTime:-1,resultTimestamp:0,result:null,pending:Promise.resolve(),nFaces:0},landmarks:{data:N,textureHeight:c},mask:{canvas:B}},Le(f),xe(r),C.set(i,r)}r.subscribers.set(b,!1)}let G=me(),W=0;async function V(o){let f=performance.now(),A=++W;await G,r&&(r.state.pending=r.state.pending.then(async()=>{if(A!==W||!r)return;let y=o instanceof HTMLVideoElement?"VIDEO":"IMAGE";r.state.runningMode!==y&&(r.state.runningMode=y,await r.landmarker.setOptions({runningMode:y}));let $=!1;if(o!==r.state.source?(r.state.source=o,r.state.videoTime=-1,$=!0):o instanceof HTMLVideoElement?o.currentTime!==r.state.videoTime&&(r.state.videoTime=o.currentTime,$=!0):o instanceof HTMLImageElement||f-r.state.resultTimestamp>2&&($=!0),$){let I;if(o instanceof HTMLVideoElement){if(o.videoWidth===0||o.videoHeight===0||o.readyState<2)return;I=r.landmarker.detectForVideo(o,f)}else{if(o.width===0||o.height===0)return;I=r.landmarker.detect(o)}if(I){r.state.resultTimestamp=f,r.state.result=I,Me(r,I.faceLandmarks),ke(r);for(let X of r.subscribers.keys())X(),r.subscribers.set(X,!0)}}else r.state.result&&!r.subscribers.get(b)&&(b(),r.subscribers.set(b,!0))}),await r.state.pending)}s.on("init",()=>{s.initializeUniform("u_maxFaces","int",a.maxFaces),s.initializeUniform("u_nFaces","int",0),s.initializeTexture("u_faceLandmarksTex",{data:N,width:O,height:c},{internalFormat:T.RGBA32F,type:T.FLOAT,minFilter:T.NEAREST,magFilter:T.NEAREST,history:n}),s.initializeTexture("u_faceMask",B,{minFilter:T.NEAREST,magFilter:T.NEAREST,history:n}),G.then(()=>d("face:ready"))}),s.on("initializeTexture",(o,f)=>{o===e&&U(f)&&V(f)}),s.on("updateTextures",(o,f)=>{let A=o[e];U(A)&&(w=f?.skipHistoryWrite??!1,V(A))}),s.on("destroy",()=>{r&&(r.subscribers.delete(b),r.subscribers.size===0&&(r.landmarker.close(),r.mask.gl.deleteProgram(r.mask.program),r.mask.gl.deleteBuffer(r.mask.positionBuffer),C.delete(i))),r=null});let{fn:u,historyParams:R}=ee(n),K=n?"_sampleFaceMask(pos, framesAgo)":"texture(u_faceMask, pos)",k=(o,f=o)=>`vec4 mask = ${K};
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return (mask.r > ${(x[o]-te).toFixed(4)} && mask.r < ${(x[f]+te).toFixed(4)}) ? vec2(1.0, faceIndex) : vec2(0.0, -1.0);`,z=o=>`vec4 mask = ${K};
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return mask.g > ${o.toFixed(2)} ? vec2(1.0, faceIndex) : vec2(0.0, -1.0);`,j=(o,f)=>`vec2 left = ${o}(pos${R});
	return left.x > 0.0 ? left : ${f}(pos${R});`;_(`
uniform int u_maxFaces;
uniform int u_nFaces;
uniform highp sampler2D${n?"Array":""} u_faceLandmarksTex;${n?`
uniform int u_faceLandmarksTexFrameOffset;`:""}
uniform sampler2D${n?"Array":""} u_faceMask;${n?`
uniform int u_faceMaskFrameOffset;`:""}

#define FACE_LANDMARK_L_EYE_CENTER ${h.LEFT_EYE_CENTER}
#define FACE_LANDMARK_R_EYE_CENTER ${h.RIGHT_EYE_CENTER}
#define FACE_LANDMARK_NOSE_TIP ${h.NOSE_TIP}
#define FACE_LANDMARK_FACE_CENTER ${h.FACE_CENTER}
#define FACE_LANDMARK_MOUTH_CENTER ${h.MOUTH_CENTER}

${u("int","nFacesAt","",n?`
	int layer = (u_faceLandmarksTexFrameOffset - framesAgo + ${n}) % ${n};
	return int(texelFetch(u_faceLandmarksTex, ivec3(0, 0, layer), 0).r + 0.5);`:`
	return int(texelFetch(u_faceLandmarksTex, ivec2(0, 0), 0).r + 0.5);`)}
${u("vec4","faceLandmark","int faceIndex, int landmarkIndex",`int i = ${M} + faceIndex * ${F} + landmarkIndex;
	int x = i % ${O};
	int y = i / ${O};${n?`
	int layer = (u_faceLandmarksTexFrameOffset - framesAgo + ${n}) % ${n};
	return texelFetch(u_faceLandmarksTex, ivec3(x, y, layer), 0);`:`
	return texelFetch(u_faceLandmarksTex, ivec2(x, y), 0);`}`)}
${n?`
vec4 _sampleFaceMask(vec2 pos, int framesAgo) {
	int layer = (u_faceMaskFrameOffset - framesAgo + ${n}) % ${n};
	return texture(u_faceMask, vec3(pos, float(layer)));
}
`:""}
${u("vec2","leftEyebrowAt","vec2 pos",k("LEFT_EYEBROW"))}
${u("vec2","rightEyebrowAt","vec2 pos",k("RIGHT_EYEBROW"))}
${u("vec2","leftEyeAt","vec2 pos",k("LEFT_EYE"))}
${u("vec2","rightEyeAt","vec2 pos",k("RIGHT_EYE"))}
${u("vec2","lipsAt","vec2 pos",k("OUTER_MOUTH"))}
${u("vec2","outerMouthAt","vec2 pos",k("OUTER_MOUTH","INNER_MOUTH"))}
${u("vec2","innerMouthAt","vec2 pos",k("INNER_MOUTH"))}
${u("vec2","faceOvalAt","vec2 pos",z(.75))}
${u("vec2","faceAt","vec2 pos",z(.25))}
${u("vec2","eyeAt","vec2 pos",j("leftEyeAt","rightEyeAt"))}
${u("vec2","eyebrowAt","vec2 pos",j("leftEyebrowAt","rightEyebrowAt"))}
${u("float","inEyebrow","vec2 pos",`return eyebrowAt(pos${R}).x;`)}
${u("float","inEye","vec2 pos",`return eyeAt(pos${R}).x;`)}
${u("float","inOuterMouth","vec2 pos",`return outerMouthAt(pos${R}).x;`)}
${u("float","inInnerMouth","vec2 pos",`return innerMouthAt(pos${R}).x;`)}
${u("float","inLips","vec2 pos",`return lipsAt(pos${R}).x;`)}
${u("float","inFace","vec2 pos",`return faceAt(pos${R}).x;`)}`)}}var ve=Oe;
//# sourceMappingURL=face.js.map