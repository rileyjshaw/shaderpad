"use strict";var ce=Object.create;var b=Object.defineProperty;var se=Object.getOwnPropertyDescriptor;var ue=Object.getOwnPropertyNames;var le=Object.getPrototypeOf,Ee=Object.prototype.hasOwnProperty;var fe=(r,i)=>{for(var c in i)b(r,c,{get:i[c],enumerable:!0})},V=(r,i,c,O)=>{if(i&&typeof i=="object"||typeof i=="function")for(let s of ue(i))!Ee.call(r,s)&&s!==c&&b(r,s,{get:()=>i[s],enumerable:!(O=se(i,s))||O.enumerable});return r};var me=(r,i,c)=>(c=r!=null?ce(le(r)):{},V(i||!r||!r.__esModule?b(c,"default",{value:r,enumerable:!0}):c,r)),de=r=>V(b({},"__esModule",{value:!0}),r);var Re={};fe(Re,{default:()=>Fe});module.exports=de(Re);var C=478,_e=2,m=C+_e,X=[336,296,334,293,300,276,283,282,295,285],j=[362,398,384,385,386,387,388,466,263,249,390,373,374,380,381,382],q=[70,63,105,66,107,55,65,52,53,46],Z=[33,246,161,160,159,158,157,173,133,155,154,153,145,144,163,7],J=[61,185,40,39,37,0,267,269,270,409,291,375,321,405,314,17,84,181,91,146],$=[78,191,80,81,82,13,312,311,310,415,308,324,318,402,317,14,87,178,88,95],Te=Array.from({length:C},(r,i)=>i),g={LEFT_EYEBROW:X,LEFT_EYE:j,LEFT_EYE_CENTER:473,RIGHT_EYEBROW:q,RIGHT_EYE:Z,RIGHT_EYE_CENTER:468,NOSE_TIP:4,OUTER_MOUTH:J,INNER_MOUTH:$,FACE_CENTER:C,MOUTH_CENTER:C+1},Q=["BACKGROUND","LEFT_EYEBROW","RIGHT_EYEBROW","LEFT_EYE","RIGHT_EYE","OUTER_MOUTH","INNER_MOUTH"],ee=Q.length-1,F=Object.fromEntries(Q.map((r,i)=>[r,i/ee])),z=.5/ee;function pe(r){let{textureName:i,options:c}=r,O="https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task";return function(s,te){let{injectGLSL:ne,gl:M}=te,d=null,y=null,H=-1,L="VIDEO",S=new Map,D=c?.maxFaces??1,R=512,U=0,a=null,Y=new OffscreenCanvas(1,1),_=document.createElement("canvas"),E=_.getContext("2d",{willReadFrequently:!0});E.imageSmoothingEnabled=!1;let w=null,G=null;async function ae(){try{let{FilesetResolver:t,FaceLandmarker:e}=await import("@mediapipe/tasks-vision");y=await t.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"),d=await e.createFromOptions(y,{baseOptions:{modelAssetPath:c?.modelPath||O,delegate:"GPU"},canvas:Y,runningMode:L,numFaces:c?.maxFaces??1,minFaceDetectionConfidence:c?.minFaceDetectionConfidence??.5,minFacePresenceConfidence:c?.minFacePresenceConfidence??.5,minTrackingConfidence:c?.minTrackingConfidence??.5,outputFaceBlendshapes:c?.outputFaceBlendshapes??!1,outputFacialTransformationMatrixes:c?.outputFacialTransformationMatrixes??!1}),w=e.FACE_LANDMARKS_TESSELATION.map(({start:u})=>u),G=e.FACE_LANDMARKS_FACE_OVAL.map(({start:u})=>u)}catch(t){throw console.error("[Face Plugin] Failed to initialize:",t),t}}function B(t,e,u){let o=1/0,n=-1/0,p=1/0,l=-1/0,f=0,x=0;for(let ie of u){let k=(e*m+ie)*4,K=t[k],W=t[k+1];o=Math.min(o,K),n=Math.max(n,K),p=Math.min(p,W),l=Math.max(l,W),f+=t[k+2],x+=t[k+3]}let h=(o+n)/2,I=(p+l)/2,N=f/u.length,v=x/u.length;return[h,I,N,v]}function T(t,e,u){if(!a)return;let{width:o,height:n}=_;E.fillStyle=`rgb(${u.r}, ${u.g}, ${u.b})`,E.beginPath();let p=(t*m+e[0])*4;E.moveTo(a[p]*o,a[p+1]*n);for(let l=1;l<e.length;++l){let f=(t*m+e[l])*4;E.lineTo(a[f]*o,a[f+1]*n)}E.closePath(),E.fill()}function oe(t){if(!a||!w||!G)return;let{width:e,height:u}=_;E.clearRect(0,0,e,u),E.save(),E.globalCompositeOperation="lighten";for(let o=0;o<t;++o){let n=Math.round((o+1)/D*255);T(o,w,{r:0,g:128,b:n}),T(o,G,{r:0,g:255,b:n}),T(o,X,{r:Math.round(F.LEFT_EYEBROW*255),g:0,b:n}),T(o,q,{r:Math.round(F.RIGHT_EYEBROW*255),g:0,b:n}),T(o,j,{r:Math.round(F.LEFT_EYE*255),g:0,b:n}),T(o,Z,{r:Math.round(F.RIGHT_EYE*255),g:0,b:n}),T(o,J,{r:Math.round(F.OUTER_MOUTH*255),g:0,b:n}),T(o,$,{r:Math.round(F.INNER_MOUTH*255),g:0,b:n})}E.restore(),s.updateTextures({u_faceMask:_})}function re(t){if(!a)return;let e=t.length,u=e*m;for(let n=0;n<e;++n){let p=t[n];for(let I=0;I<C;++I){let N=p[I],v=(n*m+I)*4;a[v]=N.x,a[v+1]=1-N.y,a[v+2]=N.z??0,a[v+3]=N.visibility??1}let l=B(a,n,Te),f=(n*m+g.FACE_CENTER)*4;a[f]=l[0],a[f+1]=l[1],a[f+2]=l[2],a[f+3]=l[3];let x=B(a,n,$),h=(n*m+g.MOUTH_CENTER)*4;a[h]=x[0],a[h+1]=x[1],a[h+2]=x[2],a[h+3]=x[3]}let o=Math.ceil(u/R);s.updateTextures({u_faceLandmarksTex:{data:a,width:R,height:o,isPartial:!0}})}function P(t){if(!t.faceLandmarks||!a)return;_.width=Y.width,_.height=Y.height;let e=t.faceLandmarks.length;re(t.faceLandmarks),oe(e),s.updateUniforms({u_nFaces:e}),c?.onResults?.(t)}s.registerHook("init",async()=>{s.initializeTexture("u_faceMask",_,{preserveY:!0,minFilter:M.NEAREST,magFilter:M.NEAREST}),s.initializeUniform("u_maxFaces","int",D),s.initializeUniform("u_nFaces","int",0);let t=D*m;U=Math.ceil(t/R);let e=R*U*4;a=new Float32Array(e),s.initializeTexture("u_faceLandmarksTex",{data:a,width:R,height:U},{internalFormat:M.RGBA32F,type:M.FLOAT,minFilter:M.NEAREST,magFilter:M.NEAREST}),await ae()}),s.registerHook("updateTextures",async t=>{let e=t[i];if(!(!e||(S.get(i)!==e&&(H=-1),S.set(i,e),!d)))try{let o=e instanceof HTMLVideoElement?"VIDEO":"IMAGE";if(L!==o&&(L=o,await d.setOptions({runningMode:L})),e instanceof HTMLVideoElement){if(e.videoWidth===0||e.videoHeight===0||e.readyState<2)return;if(e.currentTime!==H){H=e.currentTime;let n=d.detectForVideo(e,performance.now());P(n)}}else if(e instanceof HTMLImageElement||e instanceof HTMLCanvasElement){if(e.width===0||e.height===0)return;let n=d.detect(e);P(n)}}catch(o){console.error("[Face Plugin] Detection error:",o)}}),s.registerHook("destroy",()=>{d&&(d.close(),d=null),y=null,S.clear(),_.remove(),a=null});let A=(t,e=t)=>`vec4 mask = texture(u_faceMask, pos);
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return (mask.r > ${(F[t]-z).toFixed(4)} && mask.r < ${(F[e]+z).toFixed(4)})  ? vec2(1.0, faceIndex) : vec2(0.0, -1.0)`;ne(`
uniform int u_maxFaces;
uniform int u_nFaces;
uniform sampler2D u_faceLandmarksTex;
uniform sampler2D u_faceMask;

#define FACE_LANDMARK_L_EYE_CENTER ${g.LEFT_EYE_CENTER}
#define FACE_LANDMARK_R_EYE_CENTER ${g.RIGHT_EYE_CENTER}
#define FACE_LANDMARK_NOSE_TIP ${g.NOSE_TIP}
#define FACE_LANDMARK_FACE_CENTER ${g.FACE_CENTER}
#define FACE_LANDMARK_MOUTH_CENTER ${g.MOUTH_CENTER}

vec4 faceLandmark(int faceIndex, int landmarkIndex) {
	int i = faceIndex * ${m} + landmarkIndex;
	int x = i % ${R};
	int y = i / ${R};
	return texelFetch(u_faceLandmarksTex, ivec2(x, y), 0);
}

vec2 leftEyebrowAt(vec2 pos) {
	${A("LEFT_EYEBROW")}
}

vec2 rightEyebrowAt(vec2 pos) {
	${A("RIGHT_EYEBROW")}
}

vec2 leftEyeAt(vec2 pos) {
	${A("LEFT_EYE")}
}

vec2 rightEyeAt(vec2 pos) {
	${A("RIGHT_EYE")}
}

vec2 lipsAt(vec2 pos) {
	${A("OUTER_MOUTH")}
}

vec2 outerMouthAt(vec2 pos) {
	${A("OUTER_MOUTH","INNER_MOUTH")}
}

vec2 innerMouthAt(vec2 pos) {
	${A("INNER_MOUTH")}
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

float inOuterMouth(vec2 pos) {
	return outerMouthAt(pos).x;
}

float inInnerMouth(vec2 pos) {
	return innerMouthAt(pos).x;
}

float inLips(vec2 pos) {
	return lipsAt(pos).x;
}

float inFace(vec2 pos) {
	return faceAt(pos).x;
}`)}}var Fe=pe;
//# sourceMappingURL=face.js.map