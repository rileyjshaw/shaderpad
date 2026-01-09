"use strict";var ae=Object.create;var g=Object.defineProperty;var oe=Object.getOwnPropertyDescriptor;var re=Object.getOwnPropertyNames;var ce=Object.getPrototypeOf,ie=Object.prototype.hasOwnProperty;var se=(r,c)=>{for(var i in c)g(r,i,{get:c[i],enumerable:!0})},P=(r,c,i,O)=>{if(c&&typeof c=="object"||typeof c=="function")for(let s of re(c))!ie.call(r,s)&&s!==i&&g(r,s,{get:()=>c[s],enumerable:!(O=oe(c,s))||O.enumerable});return r};var le=(r,c,i)=>(i=r!=null?ae(ce(r)):{},P(c||!r||!r.__esModule?g(i,"default",{value:r,enumerable:!0}):i,r)),ue=r=>P(g({},"__esModule",{value:!0}),r);var de={};se(de,{default:()=>_e});module.exports=ue(de);var k=478,Ee=2,m=k+Ee,N=512,W=[336,296,334,293,300,276,283,282,295,285],V=[362,398,384,385,386,387,388,466,263,249,390,373,374,380,381,382],z=[70,63,105,66,107,55,65,52,53,46],j=[33,246,161,160,159,158,157,173,133,155,154,153,145,144,163,7],X=[61,185,40,39,37,0,267,269,270,409,291,375,321,405,314,17,84,181,91,146],G=[78,191,80,81,82,13,312,311,310,415,308,324,318,402,317,14,87,178,88,95],me=Array.from({length:k},(r,c)=>c),v={LEFT_EYEBROW:W,LEFT_EYE:V,LEFT_EYE_CENTER:473,RIGHT_EYEBROW:z,RIGHT_EYE:j,RIGHT_EYE_CENTER:468,NOSE_TIP:4,OUTER_MOUTH:X,INNER_MOUTH:G,FACE_CENTER:k,MOUTH_CENTER:k+1},q=["BACKGROUND","LEFT_EYEBROW","RIGHT_EYEBROW","LEFT_EYE","RIGHT_EYE","OUTER_MOUTH","INNER_MOUTH"],Z=q.length-1,A=Object.fromEntries(q.map((r,c)=>[r,c/Z])),K=.5/Z;function fe(r){let{textureName:c,options:i}=r,O="https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task";return function(s,J){let{injectGLSL:Q,gl:h}=J,F=null,y=null,b=-1,L="VIDEO",H=new Map,D=i?.maxFaces??1,S=0,o=null,U=new OffscreenCanvas(1,1),f=document.createElement("canvas"),u=f.getContext("2d"),Y=null,w=null;async function ee(){try{let{FilesetResolver:t,FaceLandmarker:e}=await import("@mediapipe/tasks-vision");y=await t.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"),F=await e.createFromOptions(y,{baseOptions:{modelAssetPath:i?.modelPath||O,delegate:"GPU"},canvas:U,runningMode:L,numFaces:i?.maxFaces??1,minFaceDetectionConfidence:i?.minFaceDetectionConfidence??.5,minFacePresenceConfidence:i?.minFacePresenceConfidence??.5,minTrackingConfidence:i?.minTrackingConfidence??.5,outputFaceBlendshapes:i?.outputFaceBlendshapes??!1,outputFacialTransformationMatrixes:i?.outputFacialTransformationMatrixes??!1}),Y=e.FACE_LANDMARKS_TESSELATION.map(({start:l})=>l),w=e.FACE_LANDMARKS_FACE_OVAL.map(({start:l})=>l)}catch(t){throw console.error("[Face Plugin] Failed to initialize:",t),t}}function $(t,e,l){let n=1/0,a=-1/0,d=1/0,T=-1/0,x=0,p=0;for(let C of l){let E=(e*m+C)*4,I=t[E],M=t[E+1];n=Math.min(n,I),a=Math.max(a,I),d=Math.min(d,M),T=Math.max(T,M),x+=t[E+2],p+=t[E+3]}return[(n+a)/2,(d+T)/2,x/l.length,p/l.length]}function _(t,e,l,n,a){if(!o)return;let{width:d,height:T}=f;u.fillStyle=`rgba(${l}, ${n}, ${a}, 255)`,u.beginPath();let x=(t*m+e[0])*4;u.moveTo(o[x]*d,o[x+1]*T);for(let p=1;p<e.length;++p){let C=(t*m+e[p])*4;u.lineTo(o[C]*d,o[C+1]*T)}u.closePath(),u.fill()}function te(t){if(!o||!Y||!w)return;let{width:e,height:l}=f;u.clearRect(0,0,e,l),u.save(),u.globalCompositeOperation="lighten";for(let n=0;n<t;++n){let a=Math.round((n+1)/D*255);_(n,Y,0,128,a),_(n,w,0,255,a),_(n,W,Math.round(A.LEFT_EYEBROW*255),0,a),_(n,z,Math.round(A.RIGHT_EYEBROW*255),0,a),_(n,V,Math.round(A.LEFT_EYE*255),0,a),_(n,j,Math.round(A.RIGHT_EYE*255),0,a),_(n,X,Math.round(A.OUTER_MOUTH*255),0,a),_(n,G,Math.round(A.INNER_MOUTH*255),0,a)}u.restore(),s.updateTextures({u_faceMask:f})}function ne(t){if(!o)return;let e=t.length,l=e*m;for(let a=0;a<e;++a){let d=t[a];for(let E=0;E<k;++E){let I=d[E],M=(a*m+E)*4;o[M]=I.x,o[M+1]=1-I.y,o[M+2]=I.z??0,o[M+3]=I.visibility??1}let T=$(o,a,me),x=(a*m+v.FACE_CENTER)*4;o.set(T,x);let p=$(o,a,G),C=(a*m+v.MOUTH_CENTER)*4;o.set(p,C)}let n=Math.ceil(l/N);s.updateTextures({u_faceLandmarksTex:{data:o,width:N,height:n,isPartial:!0}})}function B(t){if(!t.faceLandmarks||!o)return;f.width=U.width,f.height=U.height;let e=t.faceLandmarks.length;ne(t.faceLandmarks),te(e),s.updateUniforms({u_nFaces:e}),i?.onResults?.(t)}s.registerHook("init",async()=>{s.initializeTexture("u_faceMask",f,{preserveY:!0,minFilter:h.NEAREST,magFilter:h.NEAREST}),s.initializeUniform("u_maxFaces","int",D),s.initializeUniform("u_nFaces","int",0);let t=D*m;S=Math.ceil(t/N),o=new Float32Array(N*S*4),s.initializeTexture("u_faceLandmarksTex",{data:o,width:N,height:S},{internalFormat:h.RGBA32F,type:h.FLOAT,minFilter:h.NEAREST,magFilter:h.NEAREST}),await ee()}),s.registerHook("updateTextures",async t=>{let e=t[c];if(!(!e||(H.get(c)!==e&&(b=-1),H.set(c,e),!F)))try{let n=e instanceof HTMLVideoElement?"VIDEO":"IMAGE";if(L!==n&&(L=n,await F.setOptions({runningMode:L})),e instanceof HTMLVideoElement){if(e.videoWidth===0||e.videoHeight===0||e.readyState<2)return;e.currentTime!==b&&(b=e.currentTime,B(F.detectForVideo(e,performance.now())))}else if(e instanceof HTMLImageElement||e instanceof HTMLCanvasElement){if(e.width===0||e.height===0)return;B(F.detect(e))}}catch(n){console.error("[Face Plugin] Detection error:",n)}}),s.registerHook("destroy",()=>{F?.close(),F=null,y=null,H.clear(),f.remove(),o=null});let R=(t,e=t)=>`vec4 mask = texture(u_faceMask, pos);
	if (mask.a < 0.9) return vec2(0.0, -1.0);
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return (mask.r > ${(A[t]-K).toFixed(4)} && mask.r < ${(A[e]+K).toFixed(4)}) ? vec2(1.0, faceIndex) : vec2(0.0, -1.0);`;Q(`
uniform int u_maxFaces;
uniform int u_nFaces;
uniform sampler2D u_faceLandmarksTex;
uniform sampler2D u_faceMask;

#define FACE_LANDMARK_L_EYE_CENTER ${v.LEFT_EYE_CENTER}
#define FACE_LANDMARK_R_EYE_CENTER ${v.RIGHT_EYE_CENTER}
#define FACE_LANDMARK_NOSE_TIP ${v.NOSE_TIP}
#define FACE_LANDMARK_FACE_CENTER ${v.FACE_CENTER}
#define FACE_LANDMARK_MOUTH_CENTER ${v.MOUTH_CENTER}

vec4 faceLandmark(int faceIndex, int landmarkIndex) {
	int i = faceIndex * ${m} + landmarkIndex;
	int x = i % ${N};
	int y = i / ${N};
	return texelFetch(u_faceLandmarksTex, ivec2(x, y), 0);
}

vec2 leftEyebrowAt(vec2 pos) {
	${R("LEFT_EYEBROW")}
}

vec2 rightEyebrowAt(vec2 pos) {
	${R("RIGHT_EYEBROW")}
}

vec2 leftEyeAt(vec2 pos) {
	${R("LEFT_EYE")}
}

vec2 rightEyeAt(vec2 pos) {
	${R("RIGHT_EYE")}
}

vec2 lipsAt(vec2 pos) {
	${R("OUTER_MOUTH")}
}

vec2 outerMouthAt(vec2 pos) {
	${R("OUTER_MOUTH","INNER_MOUTH")}
}

vec2 innerMouthAt(vec2 pos) {
	${R("INNER_MOUTH")}
}

vec2 faceOvalAt(vec2 pos) {
	vec4 mask = texture(u_faceMask, pos);
	if (mask.a < 0.9) return vec2(0.0, -1.0);
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return mask.g > 0.75 ? vec2(1.0, faceIndex) : vec2(0.0, -1.0);
}

// Includes face mesh and oval.
vec2 faceAt(vec2 pos) {
	vec4 mask = texture(u_faceMask, pos);
	if (mask.a < 0.9) return vec2(0.0, -1.0);
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
float inFace(vec2 pos) { return faceAt(pos).x; }`)}}var _e=fe;
//# sourceMappingURL=face.js.map