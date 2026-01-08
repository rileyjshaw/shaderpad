"use strict";var se=Object.create;var b=Object.defineProperty;var ie=Object.getOwnPropertyDescriptor;var ue=Object.getOwnPropertyNames;var le=Object.getPrototypeOf,fe=Object.prototype.hasOwnProperty;var Ee=(r,c)=>{for(var s in c)b(r,s,{get:c[s],enumerable:!0})},V=(r,c,s,C)=>{if(c&&typeof c=="object"||typeof c=="function")for(let i of ue(c))!fe.call(r,i)&&i!==s&&b(r,i,{get:()=>c[i],enumerable:!(C=ie(c,i))||C.enumerable});return r};var me=(r,c,s)=>(s=r!=null?se(le(r)):{},V(c||!r||!r.__esModule?b(s,"default",{value:r,enumerable:!0}):s,r)),_e=r=>V(b({},"__esModule",{value:!0}),r);var Fe={};Ee(Fe,{default:()=>pe});module.exports=_e(Fe);var k=478,de=2,_=k+de,X=[336,296,334,293,300,276,283,282,295,285],j=[362,398,384,385,386,387,388,466,263,249,390,373,374,380,381,382],Z=[70,63,105,66,107,55,65,52,53,46],q=[33,246,161,160,159,158,157,173,133,155,154,153,145,144,163,7],J=[61,185,40,39,37,0,267,269,270,409,291,375,321,405,314,17,84,181,91,146],$=[78,191,80,81,82,13,312,311,310,415,308,324,318,402,317,14,87,178,88,95],Te=Array.from({length:k},(r,c)=>c),A={LEFT_EYEBROW:X,LEFT_EYE:j,LEFT_EYE_CENTER:473,RIGHT_EYEBROW:Z,RIGHT_EYE:q,RIGHT_EYE_CENTER:468,NOSE_TIP:4,OUTER_MOUTH:J,INNER_MOUTH:$,FACE_CENTER:k,MOUTH_CENTER:k+1},Q=["BACKGROUND","LEFT_EYEBROW","RIGHT_EYEBROW","LEFT_EYE","RIGHT_EYE","OUTER_MOUTH","INNER_MOUTH"],ee=Q.length-1,f=Object.fromEntries(Q.map((r,c)=>[r,c/ee])),z=.5/ee;function xe(r){let{textureName:c,options:s}=r,C="https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task";return function(i,te){let{injectGLSL:ne,gl:N}=te,d=null,y=null,H=-1,L="VIDEO",S=new Map,D=s?.maxFaces??1,F=512,U=0,a=null,Y=new OffscreenCanvas(1,1),T=document.createElement("canvas"),E=T.getContext("2d"),w=null,G=null;async function ae(){try{let{FilesetResolver:t,FaceLandmarker:e}=await import("@mediapipe/tasks-vision");y=await t.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"),d=await e.createFromOptions(y,{baseOptions:{modelAssetPath:s?.modelPath||C,delegate:"GPU"},canvas:Y,runningMode:L,numFaces:s?.maxFaces??1,minFaceDetectionConfidence:s?.minFaceDetectionConfidence??.5,minFacePresenceConfidence:s?.minFacePresenceConfidence??.5,minTrackingConfidence:s?.minTrackingConfidence??.5,outputFaceBlendshapes:s?.outputFaceBlendshapes??!1,outputFacialTransformationMatrixes:s?.outputFacialTransformationMatrixes??!1}),w=e.FACE_LANDMARKS_TESSELATION.map(({start:u})=>u),G=e.FACE_LANDMARKS_FACE_OVAL.map(({start:u})=>u)}catch(t){throw console.error("[Face Plugin] Failed to initialize:",t),t}}function B(t,e,u){let o=1/0,n=-1/0,p=1/0,l=-1/0,m=0,R=0;for(let ce of u){let O=(e*_+ce)*4,K=t[O],W=t[O+1];o=Math.min(o,K),n=Math.max(n,K),p=Math.min(p,W),l=Math.max(l,W),m+=t[O+2],R+=t[O+3]}let g=(o+n)/2,h=(p+l)/2,I=m/u.length,v=R/u.length;return[g,h,I,v]}function x(t,e,u){if(!a)return;let{width:o,height:n}=T;E.fillStyle=`rgb(${u.r}, ${u.g}, ${u.b})`,E.beginPath();let p=(t*_+e[0])*4;E.moveTo(a[p]*o,a[p+1]*n);for(let l=1;l<e.length;++l){let m=(t*_+e[l])*4;E.lineTo(a[m]*o,a[m+1]*n)}E.closePath(),E.fill()}function oe(t){if(!a||!w||!G)return;let{width:e,height:u}=T;E.clearRect(0,0,e,u),E.save(),E.globalCompositeOperation="lighten";for(let o=0;o<t;++o){let n=Math.round((o+1)/D*255);x(o,w,{r:0,g:128,b:n}),x(o,G,{r:0,g:255,b:n}),x(o,X,{r:Math.round(f.LEFT_EYEBROW*255),g:0,b:n}),x(o,Z,{r:Math.round(f.RIGHT_EYEBROW*255),g:0,b:n}),x(o,j,{r:Math.round(f.LEFT_EYE*255),g:0,b:n}),x(o,q,{r:Math.round(f.RIGHT_EYE*255),g:0,b:n}),x(o,J,{r:Math.round(f.OUTER_MOUTH*255),g:0,b:n}),x(o,$,{r:Math.round(f.INNER_MOUTH*255),g:0,b:n})}E.restore(),i.updateTextures({u_faceMask:T})}function re(t){if(!a)return;let e=t.length,u=e*_;for(let n=0;n<e;++n){let p=t[n];for(let h=0;h<k;++h){let I=p[h],v=(n*_+h)*4;a[v]=I.x,a[v+1]=1-I.y,a[v+2]=I.z??0,a[v+3]=I.visibility??1}let l=B(a,n,Te),m=(n*_+A.FACE_CENTER)*4;a[m]=l[0],a[m+1]=l[1],a[m+2]=l[2],a[m+3]=l[3];let R=B(a,n,$),g=(n*_+A.MOUTH_CENTER)*4;a[g]=R[0],a[g+1]=R[1],a[g+2]=R[2],a[g+3]=R[3]}let o=Math.ceil(u/F);i.updateTextures({u_faceLandmarksTex:{data:a,width:F,height:o,isPartial:!0}})}function P(t){if(!t.faceLandmarks||!a)return;T.width=Y.width,T.height=Y.height;let e=t.faceLandmarks.length;re(t.faceLandmarks),oe(e),i.updateUniforms({u_nFaces:e}),s?.onResults?.(t)}i.registerHook("init",async()=>{i.initializeTexture("u_faceMask",T,{preserveY:!0}),i.initializeUniform("u_maxFaces","int",D),i.initializeUniform("u_nFaces","int",0);let t=D*_;U=Math.ceil(t/F);let e=F*U*4;a=new Float32Array(e),i.initializeTexture("u_faceLandmarksTex",{data:a,width:F,height:U},{internalFormat:N.RGBA32F,type:N.FLOAT,minFilter:N.NEAREST,magFilter:N.NEAREST}),await ae()}),i.registerHook("updateTextures",async t=>{let e=t[c];if(!(!e||(S.get(c)!==e&&(H=-1),S.set(c,e),!d)))try{let o=e instanceof HTMLVideoElement?"VIDEO":"IMAGE";if(L!==o&&(L=o,await d.setOptions({runningMode:L})),e instanceof HTMLVideoElement){if(e.videoWidth===0||e.videoHeight===0||e.readyState<2)return;if(e.currentTime!==H){H=e.currentTime;let n=d.detectForVideo(e,performance.now());P(n)}}else if(e instanceof HTMLImageElement||e instanceof HTMLCanvasElement){if(e.width===0||e.height===0)return;let n=d.detect(e);P(n)}}catch(o){console.error("[Face Plugin] Detection error:",o)}}),i.registerHook("destroy",()=>{d&&(d.close(),d=null),y=null,S.clear(),T.remove(),a=null});let M=t=>`(mask.r > ${(t-z).toFixed(4)} && mask.r < ${(t+z).toFixed(4)})  ? vec2(1.0, faceIndex) : vec2(0.0, -1.0)`;ne(`
uniform int u_maxFaces;
uniform int u_nFaces;
uniform sampler2D u_faceLandmarksTex;
uniform sampler2D u_faceMask;

#define FACE_LANDMARK_L_EYE_CENTER ${A.LEFT_EYE_CENTER}
#define FACE_LANDMARK_R_EYE_CENTER ${A.RIGHT_EYE_CENTER}
#define FACE_LANDMARK_NOSE_TIP ${A.NOSE_TIP}
#define FACE_LANDMARK_FACE_CENTER ${A.FACE_CENTER}
#define FACE_LANDMARK_MOUTH_CENTER ${A.MOUTH_CENTER}

vec4 faceLandmark(int faceIndex, int landmarkIndex) {
	int i = faceIndex * ${_} + landmarkIndex;
	int x = i % ${F};
	int y = i / ${F};
	return texelFetch(u_faceLandmarksTex, ivec2(x, y), 0);
}

vec2 leftEyebrowAt(vec2 pos) {
	vec4 mask = texture(u_faceMask, pos);
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return ${M(f.LEFT_EYEBROW)};
}

vec2 rightEyebrowAt(vec2 pos) {
	vec4 mask = texture(u_faceMask, pos);
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return ${M(f.RIGHT_EYEBROW)};
}

vec2 leftEyeAt(vec2 pos) {
	vec4 mask = texture(u_faceMask, pos);
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return ${M(f.LEFT_EYE)};
}

vec2 rightEyeAt(vec2 pos) {
	vec4 mask = texture(u_faceMask, pos);
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return ${M(f.RIGHT_EYE)};
}

vec2 outerMouthAt(vec2 pos) {
	vec4 mask = texture(u_faceMask, pos);
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return ${M(f.OUTER_MOUTH)};
}

vec2 innerMouthAt(vec2 pos) {
	vec4 mask = texture(u_faceMask, pos);
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return ${M(f.INNER_MOUTH)};
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
	vec2 right = rightEyeAt(pos);
	return left.x >= 0.0 ? left : right;
}

vec2 eyebrowAt(vec2 pos) {
	vec2 left = leftEyebrowAt(pos);
	vec2 right = rightEyebrowAt(pos);
	return left.x >= 0.0 ? left : right;
}

float inEyebrow(vec2 pos) {
	return eyebrowAt(pos).x;
}

float inEye(vec2 pos) {
	return eyeAt(pos).x;
}

float inMouth(vec2 pos) {
	return innerMouthAt(pos).x;
}

float inLips(vec2 pos) {
	float lips = outerMouthAt(pos).x;
	float mouth = innerMouthAt(pos).x;
	return max(0.0, lips - mouth);
}

float inFace(vec2 pos) {
	return faceAt(pos).x;
}`)}}var pe=xe;
//# sourceMappingURL=face.js.map