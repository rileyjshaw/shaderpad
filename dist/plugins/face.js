"use strict";var se=Object.create;var S=Object.defineProperty;var ce=Object.getOwnPropertyDescriptor;var Ee=Object.getOwnPropertyNames;var le=Object.getPrototypeOf,ue=Object.prototype.hasOwnProperty;var fe=(r,i)=>{for(var o in i)S(r,o,{get:i[o],enumerable:!0})},K=(r,i,o,C)=>{if(i&&typeof i=="object"||typeof i=="function")for(let E of Ee(i))!ue.call(r,E)&&E!==o&&S(r,E,{get:()=>i[E],enumerable:!(C=ce(i,E))||C.enumerable});return r};var me=(r,i,o)=>(o=r!=null?se(le(r)):{},K(i||!r||!r.__esModule?S(o,"default",{value:r,enumerable:!0}):o,r)),_e=r=>K(S({},"__esModule",{value:!0}),r);var pe={};fe(pe,{default:()=>Re});module.exports=_e(pe);var M=478,Te=2,A=M+Te,I=512,X=[336,296,334,293,300,276,283,282,295,285],j=[362,398,384,385,386,387,388,466,263,249,390,373,374,380,381,382],q=[70,63,105,66,107,55,65,52,53,46],Z=[33,246,161,160,159,158,157,173,133,155,154,153,145,144,163,7],J=[61,185,40,39,37,0,267,269,270,409,291,375,321,405,314,17,84,181,91,146],G=[78,191,80,81,82,13,312,311,310,415,308,324,318,402,317,14,87,178,88,95],de=Array.from({length:M},(r,i)=>i),O={LEFT_EYEBROW:X,LEFT_EYE:j,LEFT_EYE_CENTER:473,RIGHT_EYEBROW:q,RIGHT_EYE:Z,RIGHT_EYE_CENTER:468,NOSE_TIP:4,OUTER_MOUTH:J,INNER_MOUTH:G,FACE_CENTER:M,MOUTH_CENTER:M+1},Q=["BACKGROUND","LEFT_EYEBROW","RIGHT_EYEBROW","LEFT_EYE","RIGHT_EYE","OUTER_MOUTH","INNER_MOUTH"],ee=Q.length-1,R=Object.fromEntries(Q.map((r,i)=>[r,i/ee])),z=.5/ee;function v(r){let i=[];for(let o=1;o<r.length-1;++o)i.push(r[0],r[o],r[o+1]);return i}function Ae(r){let{textureName:i,options:o}=r,C="https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task";return function(E,te){let{injectGLSL:ne,gl:h}=te,p=null,b=null,H=-1,k="VIDEO",y=new Map,U=o?.maxFaces??1,D=0,c=null,Y=new OffscreenCanvas(1,1),F=new OffscreenCanvas(1,1),t=null,m=null,w=null,B=null,u={LEFT_EYEBROW:v(X),RIGHT_EYEBROW:v(q),LEFT_EYE:v(j),RIGHT_EYE:v(Z),OUTER_MOUTH:v(J),INNER_MOUTH:v(G),TESSELATION:[],OVAL:[]};function ae(){if(t=F.getContext("webgl2",{antialias:!1,preserveDrawingBuffer:!0}),!t)throw new Error("Failed to get WebGL2 context for mask");let n=t.createShader(t.VERTEX_SHADER);t.shaderSource(n,`#version 300 es
in vec2 a_pos;
void main() {
	gl_Position = vec4(a_pos * 2.0 - 1.0, 0.0, 1.0);
}`),t.compileShader(n);let e=t.createShader(t.FRAGMENT_SHADER);t.shaderSource(e,`#version 300 es
precision mediump float;
uniform vec4 u_color;
out vec4 outColor;
void main() { outColor = u_color; }`),t.compileShader(e),m=t.createProgram(),t.attachShader(m,n),t.attachShader(m,e),t.linkProgram(m),t.deleteShader(n),t.deleteShader(e),w=t.createBuffer(),t.bindBuffer(t.ARRAY_BUFFER,w);let a=t.getAttribLocation(m,"a_pos");t.enableVertexAttribArray(a),t.vertexAttribPointer(a,2,t.FLOAT,!1,0,0),B=t.getUniformLocation(m,"u_color"),t.useProgram(m),t.enable(t.BLEND),t.blendEquation(t.MAX)}function d(n,e,a,l,s){if(!t||!c||n.length===0)return;let _=new Float32Array(n.length*2);for(let f=0;f<n.length;++f){let N=(e*A+n[f])*4;_[f*2]=c[N],_[f*2+1]=c[N+1]}t.bufferData(t.ARRAY_BUFFER,_,t.DYNAMIC_DRAW),t.uniform4f(B,a,l,s,1),t.drawArrays(t.TRIANGLES,0,n.length)}async function re(){try{let{FilesetResolver:n,FaceLandmarker:e}=await import("@mediapipe/tasks-vision");b=await n.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"),p=await e.createFromOptions(b,{baseOptions:{modelAssetPath:o?.modelPath||C,delegate:"GPU"},canvas:Y,runningMode:k,numFaces:o?.maxFaces??1,minFaceDetectionConfidence:o?.minFaceDetectionConfidence??.5,minFacePresenceConfidence:o?.minFacePresenceConfidence??.5,minTrackingConfidence:o?.minTrackingConfidence??.5,outputFaceBlendshapes:o?.outputFaceBlendshapes??!1,outputFacialTransformationMatrixes:o?.outputFacialTransformationMatrixes??!1});let a=e.FACE_LANDMARKS_TESSELATION;u.TESSELATION=[];for(let s=0;s<a.length-2;s+=3)u.TESSELATION.push(a[s].start,a[s+1].start,a[s+2].start);let l=e.FACE_LANDMARKS_FACE_OVAL.map(({start:s})=>s);u.OVAL=v(l),ae()}catch(n){throw console.error("[Face Plugin] Failed to initialize:",n),n}}function W(n,e,a){let l=1/0,s=-1/0,_=1/0,f=-1/0,N=0,x=0;for(let g of a){let T=(e*A+g)*4,V=n[T],$=n[T+1];l=Math.min(l,V),s=Math.max(s,V),_=Math.min(_,$),f=Math.max(f,$),N+=n[T+2],x+=n[T+3]}return[(l+s)/2,(_+f)/2,N/a.length,x/a.length]}function oe(n){if(!c)return;let e=n.length,a=e*A;for(let s=0;s<e;++s){let _=n[s];for(let x=0;x<M;++x){let g=_[x],T=(s*A+x)*4;c[T]=g.x,c[T+1]=1-g.y,c[T+2]=g.z??0,c[T+3]=g.visibility??1}let f=W(c,s,de);c.set(f,(s*A+O.FACE_CENTER)*4);let N=W(c,s,G);c.set(N,(s*A+O.MOUTH_CENTER)*4)}let l=Math.ceil(a/I);E.updateTextures({u_faceLandmarksTex:{data:c,width:I,height:l,isPartial:!0}})}function ie(n){if(!(!t||!c)){F.width=Y.width,F.height=Y.height,t.viewport(0,0,F.width,F.height),t.clearColor(0,0,0,0),t.clear(t.COLOR_BUFFER_BIT);for(let e=0;e<n;++e){let a=(e+1)/U;d(u.TESSELATION,e,0,.5,a),d(u.OVAL,e,0,1,a),d(u.LEFT_EYEBROW,e,R.LEFT_EYEBROW,0,a),d(u.RIGHT_EYEBROW,e,R.RIGHT_EYEBROW,0,a),d(u.LEFT_EYE,e,R.LEFT_EYE,0,a),d(u.RIGHT_EYE,e,R.RIGHT_EYE,0,a),d(u.OUTER_MOUTH,e,R.OUTER_MOUTH,0,a),d(u.INNER_MOUTH,e,R.INNER_MOUTH,0,a)}E.updateTextures({u_faceMask:F})}}function P(n){if(!n.faceLandmarks||!c)return;let e=n.faceLandmarks.length;oe(n.faceLandmarks),ie(e),E.updateUniforms({u_nFaces:e}),o?.onResults?.(n)}E.registerHook("init",async()=>{E.initializeTexture("u_faceMask",F,{minFilter:h.NEAREST,magFilter:h.NEAREST}),E.initializeUniform("u_maxFaces","int",U),E.initializeUniform("u_nFaces","int",0);let n=U*A;D=Math.ceil(n/I),c=new Float32Array(I*D*4),E.initializeTexture("u_faceLandmarksTex",{data:c,width:I,height:D},{internalFormat:h.RGBA32F,type:h.FLOAT,minFilter:h.NEAREST,magFilter:h.NEAREST}),await re()}),E.registerHook("updateTextures",async n=>{let e=n[i];if(!(!e||(y.get(i)!==e&&(H=-1),y.set(i,e),!p)))try{let l=e instanceof HTMLVideoElement?"VIDEO":"IMAGE";if(k!==l&&(k=l,await p.setOptions({runningMode:k})),e instanceof HTMLVideoElement){if(e.videoWidth===0||e.videoHeight===0||e.readyState<2)return;e.currentTime!==H&&(H=e.currentTime,P(p.detectForVideo(e,performance.now())))}else if(e instanceof HTMLImageElement||e instanceof HTMLCanvasElement){if(e.width===0||e.height===0)return;P(p.detect(e))}}catch(l){console.error("[Face Plugin] Detection error:",l)}}),E.registerHook("destroy",()=>{p?.close(),p=null,t&&m&&(t.deleteProgram(m),t.deleteBuffer(w)),t=null,m=null,b=null,y.clear(),c=null});let L=(n,e=n)=>`vec4 mask = texture(u_faceMask, pos);
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return (mask.r > ${(R[n]-z).toFixed(4)} && mask.r < ${(R[e]+z).toFixed(4)}) ? vec2(1.0, faceIndex) : vec2(0.0, -1.0);`;ne(`
uniform int u_maxFaces;
uniform int u_nFaces;
uniform sampler2D u_faceLandmarksTex;
uniform sampler2D u_faceMask;

#define FACE_LANDMARK_L_EYE_CENTER ${O.LEFT_EYE_CENTER}
#define FACE_LANDMARK_R_EYE_CENTER ${O.RIGHT_EYE_CENTER}
#define FACE_LANDMARK_NOSE_TIP ${O.NOSE_TIP}
#define FACE_LANDMARK_FACE_CENTER ${O.FACE_CENTER}
#define FACE_LANDMARK_MOUTH_CENTER ${O.MOUTH_CENTER}

vec4 faceLandmark(int faceIndex, int landmarkIndex) {
	int i = faceIndex * ${A} + landmarkIndex;
	int x = i % ${I};
	int y = i / ${I};
	return texelFetch(u_faceLandmarksTex, ivec2(x, y), 0);
}

vec2 leftEyebrowAt(vec2 pos) {
	${L("LEFT_EYEBROW")}
}

vec2 rightEyebrowAt(vec2 pos) {
	${L("RIGHT_EYEBROW")}
}

vec2 leftEyeAt(vec2 pos) {
	${L("LEFT_EYE")}
}

vec2 rightEyeAt(vec2 pos) {
	${L("RIGHT_EYE")}
}

vec2 lipsAt(vec2 pos) {
	${L("OUTER_MOUTH")}
}

vec2 outerMouthAt(vec2 pos) {
	${L("OUTER_MOUTH","INNER_MOUTH")}
}

vec2 innerMouthAt(vec2 pos) {
	${L("INNER_MOUTH")}
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
float inFace(vec2 pos) { return faceAt(pos).x; }`)}}var Re=Ae;
//# sourceMappingURL=face.js.map