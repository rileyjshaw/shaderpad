"use strict";var te=Object.create;var C=Object.defineProperty;var ne=Object.getOwnPropertyDescriptor;var ae=Object.getOwnPropertyNames;var re=Object.getPrototypeOf,oe=Object.prototype.hasOwnProperty;var se=(t,e)=>{for(var r in e)C(t,r,{get:e[r],enumerable:!0})},G=(t,e,r,s)=>{if(e&&typeof e=="object"||typeof e=="function")for(let n of ae(e))!oe.call(t,n)&&n!==r&&C(t,n,{get:()=>e[n],enumerable:!(s=ne(e,n))||s.enumerable});return t};var V=(t,e,r)=>(r=t!=null?te(re(t)):{},G(e||!t||!t.__esModule?C(r,"default",{value:t,enumerable:!0}):r,t)),ie=t=>G(C({},"__esModule",{value:!0}),t);var Re={};se(Re,{default:()=>Ae});module.exports=ie(Re);function D(t){return t instanceof HTMLVideoElement||t instanceof HTMLImageElement||t instanceof HTMLCanvasElement||t instanceof OffscreenCanvas}function W(t){return JSON.stringify(t,Object.keys(t).sort())}function H(t,e,r,s){let n=1/0,m=-1/0,l=1/0,o=-1/0,c=0,f=0;for(let u of r){let T=(e*s+u)*4,d=t[T],A=t[T+1];n=Math.min(n,d),m=Math.max(m,d),l=Math.min(l,A),o=Math.max(o,A),c+=t[T+2],f+=t[T+3]}return[(n+m)/2,(l+o)/2,c/r.length,f/r.length]}var S=null;function $(){return S||(S=import("@mediapipe/tasks-vision").then(({FilesetResolver:t})=>t.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm"))),S}var ce=`#version 300 es
in vec2 a_pos;
void main() { gl_Position = vec4(a_pos * 2.0 - 1.0, 0.0, 1.0); }`,le=`#version 300 es
precision mediump float;
uniform vec4 u_color;
out vec4 outColor;
void main() { outColor = u_color; }`,I=478,me=2,p=I+me,v=512,z=[336,296,334,293,300,276,283,282,295,285],j=[362,398,384,385,386,387,388,466,263,249,390,373,374,380,381,382],X=[70,63,105,66,107,55,65,52,53,46],q=[33,246,161,160,159,158,157,173,133,155,154,153,145,144,163,7],J=[61,185,40,39,37,0,267,269,270,409,291,375,321,405,314,17,84,181,91,146],y=[78,191,80,81,82,13,312,311,310,415,308,324,318,402,317,14,87,178,88,95],Ee=Array.from({length:I},(t,e)=>e),x={LEFT_EYEBROW:z,LEFT_EYE:j,LEFT_EYE_CENTER:473,RIGHT_EYEBROW:X,RIGHT_EYE:q,RIGHT_EYE_CENTER:468,NOSE_TIP:4,OUTER_MOUTH:J,INNER_MOUTH:y,FACE_CENTER:I,MOUTH_CENTER:I+1},Z=["BACKGROUND","LEFT_EYEBROW","RIGHT_EYEBROW","LEFT_EYE","RIGHT_EYE","OUTER_MOUTH","INNER_MOUTH"],Q=Z.length-1,F=Object.fromEntries(Z.map((t,e)=>[t,e/Q])),K=.5/Q,ue={modelPath:"https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",maxFaces:1,minFaceDetectionConfidence:.5,minFacePresenceConfidence:.5,minTrackingConfidence:.5,outputFaceBlendshapes:!1,outputFacialTransformationMatrixes:!1};function M(t){let e=[];for(let r=1;r<t.length-1;++r)e.push(t[0],t[r],t[r+1]);return e}var _=null;function fe(t){if(!_){let e=t.FACE_LANDMARKS_TESSELATION,r=[];for(let n=0;n<e.length-2;n+=3)r.push(e[n].start,e[n+1].start,e[n+2].start);let s=t.FACE_LANDMARKS_FACE_OVAL.map(({start:n})=>n);_=Object.fromEntries(Object.entries({LEFT_EYEBROW:M(z),RIGHT_EYEBROW:M(X),LEFT_EYE:M(j),RIGHT_EYE:M(q),OUTER_MOUTH:M(J),INNER_MOUTH:M(y),TESSELATION:r,OVAL:M(s)}).map(([n,m])=>[n,{triangles:m,vertices:new Float32Array(m.length*2)}]))}}var N=new Map;function de(t){let e=t.mask.canvas.getContext("webgl2",{antialias:!1,preserveDrawingBuffer:!0}),r=e.createShader(e.VERTEX_SHADER);e.shaderSource(r,ce),e.compileShader(r);let s=e.createShader(e.FRAGMENT_SHADER);e.shaderSource(s,le),e.compileShader(s);let n=e.createProgram();e.attachShader(n,r),e.attachShader(n,s),e.linkProgram(n),e.deleteShader(r),e.deleteShader(s);let m=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,m);let l=e.getAttribLocation(n,"a_pos");e.enableVertexAttribArray(l),e.vertexAttribPointer(l,2,e.FLOAT,!1,0,0);let o=e.getUniformLocation(n,"u_color");e.useProgram(n),e.enable(e.BLEND),e.blendEquation(e.MAX),t.mask={...t.mask,gl:e,program:n,positionBuffer:m,colorLocation:o}}function R(t,e,r,s,n,m){let{triangles:l,vertices:o}=e,{mask:{gl:c,colorLocation:f},landmarks:u}=t,{data:T}=u;for(let d=0;d<l.length;++d){let A=(r*p+l[d])*4;o[d*2]=T[A],o[d*2+1]=T[A+1]}c.bufferData(c.ARRAY_BUFFER,o,c.DYNAMIC_DRAW),c.uniform4f(f,s,n,m,1),c.drawArrays(c.TRIANGLES,0,l.length)}function _e(t,e){let r=t.landmarks.data,s=e.length;for(let n=0;n<s;++n){let m=e[n];for(let c=0;c<I;++c){let f=m[c],u=(n*p+c)*4;r[u]=f.x,r[u+1]=1-f.y,r[u+2]=f.z??0,r[u+3]=f.visibility??1}let l=H(r,n,Ee,p);r.set(l,(n*p+x.FACE_CENTER)*4);let o=H(r,n,y,p);r.set(o,(n*p+x.MOUTH_CENTER)*4)}t.state.nFaces=s}function Te(t){if(!_)return;let{mask:e,canvas:r,maxFaces:s,state:{nFaces:n}}=t,{gl:m,canvas:l}=e;l.width=r.width,l.height=r.height,m.viewport(0,0,l.width,l.height),m.clearColor(0,0,0,0),m.clear(m.COLOR_BUFFER_BIT);for(let o=0;o<n;++o){let c=(o+1)/s;R(t,_.TESSELATION,o,0,.5,c),R(t,_.OVAL,o,0,1,c),R(t,_.LEFT_EYEBROW,o,F.LEFT_EYEBROW,0,c),R(t,_.RIGHT_EYEBROW,o,F.RIGHT_EYEBROW,0,c),R(t,_.LEFT_EYE,o,F.LEFT_EYE,0,c),R(t,_.RIGHT_EYE,o,F.RIGHT_EYE,0,c),R(t,_.OUTER_MOUTH,o,F.OUTER_MOUTH,0,c),R(t,_.INNER_MOUTH,o,F.INNER_MOUTH,0,c)}}function pe(t){let{textureName:e,options:r={}}=t,s={...ue,...r},n=W({...s,textureName:e}),m=s.maxFaces*p,l=Math.ceil(m/v);return function(o,c){let{injectGLSL:f,gl:u,emitHook:T}=c,d=N.get(n),A=d?.landmarks.data??new Float32Array(v*l*4),U=d?.mask.canvas??new OffscreenCanvas(1,1),a=null;function O(){if(!a)return;let i=a.state.nFaces,E=i*p,L=Math.ceil(E/v);o.updateTextures({u_faceLandmarksTex:{data:a.landmarks.data,width:v,height:L,isPartial:i<s.maxFaces},u_faceMask:a.mask.canvas}),o.updateUniforms({u_nFaces:i}),T("face:result",a.state.result)}async function ee(){if(N.has(n))a=N.get(n);else{let[i,{FaceLandmarker:E}]=await Promise.all([$(),import("@mediapipe/tasks-vision")]),L=new OffscreenCanvas(1,1);a={landmarker:await E.createFromOptions(i,{baseOptions:{modelAssetPath:s.modelPath,delegate:"GPU"},canvas:L,runningMode:"VIDEO",numFaces:s.maxFaces,minFaceDetectionConfidence:s.minFaceDetectionConfidence,minFacePresenceConfidence:s.minFacePresenceConfidence,minTrackingConfidence:s.minTrackingConfidence,outputFaceBlendshapes:s.outputFaceBlendshapes,outputFacialTransformationMatrixes:s.outputFacialTransformationMatrixes}),canvas:L,subscribers:new Map,maxFaces:s.maxFaces,state:{runningMode:"VIDEO",source:null,videoTime:-1,resultTimestamp:0,result:null,pending:Promise.resolve(),nFaces:0},landmarks:{data:A,textureHeight:l},mask:{canvas:U}},fe(E),de(a),N.set(n,a)}a.subscribers.set(O,!1)}let Y=ee(),B=0;async function P(i){let E=performance.now(),L=++B;await Y,a&&(a.state.pending=a.state.pending.then(async()=>{if(L!==B||!a)return;let h=i instanceof HTMLVideoElement?"VIDEO":"IMAGE";a.state.runningMode!==h&&(a.state.runningMode=h,await a.landmarker.setOptions({runningMode:h}));let b=!1;if(i!==a.state.source?(a.state.source=i,a.state.videoTime=-1,b=!0):i instanceof HTMLVideoElement?i.currentTime!==a.state.videoTime&&(a.state.videoTime=i.currentTime,b=!0):i instanceof HTMLImageElement||E-a.state.resultTimestamp>2&&(b=!0),b){let k;if(i instanceof HTMLVideoElement){if(i.videoWidth===0||i.videoHeight===0||i.readyState<2)return;k=a.landmarker.detectForVideo(i,E)}else{if(i.width===0||i.height===0)return;k=a.landmarker.detect(i)}if(k){a.state.resultTimestamp=E,a.state.result=k,_e(a,k.faceLandmarks),Te(a);for(let w of a.subscribers.keys())w(),a.subscribers.set(w,!0)}}else a.state.result&&!a.subscribers.get(O)&&(O(),a.subscribers.set(O,!0))}),await a.state.pending)}o.on("init",()=>{o.initializeUniform("u_maxFaces","int",s.maxFaces),o.initializeUniform("u_nFaces","int",0),o.initializeTexture("u_faceLandmarksTex",{data:A,width:v,height:l},{internalFormat:u.RGBA32F,type:u.FLOAT,minFilter:u.NEAREST,magFilter:u.NEAREST}),o.initializeTexture("u_faceMask",U,{minFilter:u.NEAREST,magFilter:u.NEAREST}),Y.then(()=>T("face:ready"))}),o.on("initializeTexture",(i,E)=>{i===e&&D(E)&&P(E)}),o.on("updateTextures",i=>{let E=i[e];D(E)&&P(E)}),o.on("destroy",()=>{a&&(a.subscribers.delete(O),a.subscribers.size===0&&(a.landmarker.close(),a.mask.gl.deleteProgram(a.mask.program),a.mask.gl.deleteBuffer(a.mask.positionBuffer),N.delete(n))),a=null});let g=(i,E=i)=>`vec4 mask = texture(u_faceMask, pos);
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return (mask.r > ${(F[i]-K).toFixed(4)} && mask.r < ${(F[E]+K).toFixed(4)}) ? vec2(1.0, faceIndex) : vec2(0.0, -1.0);`;f(`
uniform int u_maxFaces;
uniform int u_nFaces;
uniform sampler2D u_faceLandmarksTex;
uniform sampler2D u_faceMask;

#define FACE_LANDMARK_L_EYE_CENTER ${x.LEFT_EYE_CENTER}
#define FACE_LANDMARK_R_EYE_CENTER ${x.RIGHT_EYE_CENTER}
#define FACE_LANDMARK_NOSE_TIP ${x.NOSE_TIP}
#define FACE_LANDMARK_FACE_CENTER ${x.FACE_CENTER}
#define FACE_LANDMARK_MOUTH_CENTER ${x.MOUTH_CENTER}

vec4 faceLandmark(int faceIndex, int landmarkIndex) {
	int i = faceIndex * ${p} + landmarkIndex;
	int x = i % ${v};
	int y = i / ${v};
	return texelFetch(u_faceLandmarksTex, ivec2(x, y), 0);
}

vec2 leftEyebrowAt(vec2 pos) {
	${g("LEFT_EYEBROW")}
}

vec2 rightEyebrowAt(vec2 pos) {
	${g("RIGHT_EYEBROW")}
}

vec2 leftEyeAt(vec2 pos) {
	${g("LEFT_EYE")}
}

vec2 rightEyeAt(vec2 pos) {
	${g("RIGHT_EYE")}
}

vec2 lipsAt(vec2 pos) {
	${g("OUTER_MOUTH")}
}

vec2 outerMouthAt(vec2 pos) {
	${g("OUTER_MOUTH","INNER_MOUTH")}
}

vec2 innerMouthAt(vec2 pos) {
	${g("INNER_MOUTH")}
}

vec2 faceOvalAt(vec2 pos) {
	vec4 mask = texture(u_faceMask, pos);
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return mask.g > 0.75 ? vec2(1.0, faceIndex) : vec2(0.0, -1.0);
}

// Includes face mesh and oval.
vec2 faceAt(vec2 pos) {
	vec4 mask = texture(u_faceMask, pos);
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return mask.g > 0.25 ? vec2(1.0, faceIndex) : vec2(0.0, -1.0);
}

vec2 eyeAt(vec2 pos) {
	vec2 left = leftEyeAt(pos);
	return left.x > 0.0 ? left : rightEyeAt(pos);
}

vec2 eyebrowAt(vec2 pos) {
	vec2 left = leftEyebrowAt(pos);
	return left.x > 0.0 ? left : rightEyebrowAt(pos);
}

float inEyebrow(vec2 pos) { return eyebrowAt(pos).x; }
float inEye(vec2 pos) { return eyeAt(pos).x; }
float inOuterMouth(vec2 pos) { return outerMouthAt(pos).x; }
float inInnerMouth(vec2 pos) { return innerMouthAt(pos).x; }
float inLips(vec2 pos) { return lipsAt(pos).x; }
float inFace(vec2 pos) { return faceAt(pos).x; }`)}}var Ae=pe;
//# sourceMappingURL=face.js.map