"use strict";var ue=Object.create;var S=Object.defineProperty;var fe=Object.getOwnPropertyDescriptor;var me=Object.getOwnPropertyNames;var _e=Object.getPrototypeOf,Te=Object.prototype.hasOwnProperty;var de=(o,r)=>{for(var i in r)S(o,i,{get:r[i],enumerable:!0})},q=(o,r,i,g)=>{if(r&&typeof r=="object"||typeof r=="function")for(let E of me(r))!Te.call(o,E)&&E!==i&&S(o,E,{get:()=>r[E],enumerable:!(g=fe(r,E))||g.enumerable});return o};var Ae=(o,r,i)=>(i=o!=null?ue(_e(o)):{},q(r||!o||!o.__esModule?S(i,"default",{value:o,enumerable:!0}):i,o)),Re=o=>q(S({},"__esModule",{value:!0}),o);var xe={};de(xe,{default:()=>Ne});module.exports=Re(xe);var C=478,pe=2,A=C+pe,I=512,J=[336,296,334,293,300,276,283,282,295,285],Q=[362,398,384,385,386,387,388,466,263,249,390,373,374,380,381,382],ee=[70,63,105,66,107,55,65,52,53,46],te=[33,246,161,160,159,158,157,173,133,155,154,153,145,144,163,7],ne=[61,185,40,39,37,0,267,269,270,409,291,375,321,405,314,17,84,181,91,146],G=[78,191,80,81,82,13,312,311,310,415,308,324,318,402,317,14,87,178,88,95],Fe=Array.from({length:C},(o,r)=>r),O={LEFT_EYEBROW:J,LEFT_EYE:Q,LEFT_EYE_CENTER:473,RIGHT_EYEBROW:ee,RIGHT_EYE:te,RIGHT_EYE_CENTER:468,NOSE_TIP:4,OUTER_MOUTH:ne,INNER_MOUTH:G,FACE_CENTER:C,MOUTH_CENTER:C+1},ae=["BACKGROUND","LEFT_EYEBROW","RIGHT_EYEBROW","LEFT_EYE","RIGHT_EYE","OUTER_MOUTH","INNER_MOUTH"],oe=ae.length-1,R=Object.fromEntries(ae.map((o,r)=>[o,r/oe])),Z=.5/oe;function v(o){let r=[];for(let i=1;i<o.length-1;++i)r.push(o[0],o[i],o[i+1]);return r}function Le(o){let{textureName:r,options:i}=o,g="https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task";return function(E,re){let{injectGLSL:ie,gl:h,emitHook:B}=re,p=null,b=null,y=-1,k="VIDEO",H=new Map,D=i?.maxFaces??1,U=0,s=null,Y=new OffscreenCanvas(1,1),F=new OffscreenCanvas(1,1),t=null,m=null,w=null,P=null,u={LEFT_EYEBROW:v(J),RIGHT_EYEBROW:v(ee),LEFT_EYE:v(Q),RIGHT_EYE:v(te),OUTER_MOUTH:v(ne),INNER_MOUTH:v(G),TESSELATION:[],OVAL:[]};function ce(){if(t=F.getContext("webgl2",{antialias:!1,preserveDrawingBuffer:!0}),!t)throw new Error("Failed to get WebGL2 context for mask");let e=t.createShader(t.VERTEX_SHADER);t.shaderSource(e,`#version 300 es
in vec2 a_pos;
void main() {
	gl_Position = vec4(a_pos * 2.0 - 1.0, 0.0, 1.0);
}`),t.compileShader(e);let n=t.createShader(t.FRAGMENT_SHADER);t.shaderSource(n,`#version 300 es
precision mediump float;
uniform vec4 u_color;
out vec4 outColor;
void main() { outColor = u_color; }`),t.compileShader(n),m=t.createProgram(),t.attachShader(m,e),t.attachShader(m,n),t.linkProgram(m),t.deleteShader(e),t.deleteShader(n),w=t.createBuffer(),t.bindBuffer(t.ARRAY_BUFFER,w);let a=t.getAttribLocation(m,"a_pos");t.enableVertexAttribArray(a),t.vertexAttribPointer(a,2,t.FLOAT,!1,0,0),P=t.getUniformLocation(m,"u_color"),t.useProgram(m),t.enable(t.BLEND),t.blendEquation(t.MAX)}function d(e,n,a,l,c){if(!t||!s||e.length===0)return;let _=new Float32Array(e.length*2);for(let f=0;f<e.length;++f){let N=(n*A+e[f])*4;_[f*2]=s[N],_[f*2+1]=s[N+1]}t.bufferData(t.ARRAY_BUFFER,_,t.DYNAMIC_DRAW),t.uniform4f(P,a,l,c,1),t.drawArrays(t.TRIANGLES,0,e.length)}async function se(){try{let{FilesetResolver:e,FaceLandmarker:n}=await import("@mediapipe/tasks-vision");b=await e.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"),p=await n.createFromOptions(b,{baseOptions:{modelAssetPath:i?.modelPath||g,delegate:"GPU"},canvas:Y,runningMode:k,numFaces:i?.maxFaces??1,minFaceDetectionConfidence:i?.minFaceDetectionConfidence??.5,minFacePresenceConfidence:i?.minFacePresenceConfidence??.5,minTrackingConfidence:i?.minTrackingConfidence??.5,outputFaceBlendshapes:i?.outputFaceBlendshapes??!1,outputFacialTransformationMatrixes:i?.outputFacialTransformationMatrixes??!1});let a=n.FACE_LANDMARKS_TESSELATION;u.TESSELATION=[];for(let c=0;c<a.length-2;c+=3)u.TESSELATION.push(a[c].start,a[c+1].start,a[c+2].start);let l=n.FACE_LANDMARKS_FACE_OVAL.map(({start:c})=>c);u.OVAL=v(l),ce()}catch(e){throw console.error("[Face Plugin] Failed to initialize MediaPipe:",e),e}}let W=se();function V(e,n,a){let l=1/0,c=-1/0,_=1/0,f=-1/0,N=0,x=0;for(let M of a){let T=(n*A+M)*4,X=e[T],j=e[T+1];l=Math.min(l,X),c=Math.max(c,X),_=Math.min(_,j),f=Math.max(f,j),N+=e[T+2],x+=e[T+3]}return[(l+c)/2,(_+f)/2,N/a.length,x/a.length]}function Ee(e){if(!s)return;let n=e.length,a=n*A;for(let c=0;c<n;++c){let _=e[c];for(let x=0;x<C;++x){let M=_[x],T=(c*A+x)*4;s[T]=M.x,s[T+1]=1-M.y,s[T+2]=M.z??0,s[T+3]=M.visibility??1}let f=V(s,c,Fe);s.set(f,(c*A+O.FACE_CENTER)*4);let N=V(s,c,G);s.set(N,(c*A+O.MOUTH_CENTER)*4)}let l=Math.ceil(a/I);E.updateTextures({u_faceLandmarksTex:{data:s,width:I,height:l,isPartial:!0}})}function le(e){if(!(!t||!s)){F.width=Y.width,F.height=Y.height,t.viewport(0,0,F.width,F.height),t.clearColor(0,0,0,0),t.clear(t.COLOR_BUFFER_BIT);for(let n=0;n<e;++n){let a=(n+1)/D;d(u.TESSELATION,n,0,.5,a),d(u.OVAL,n,0,1,a),d(u.LEFT_EYEBROW,n,R.LEFT_EYEBROW,0,a),d(u.RIGHT_EYEBROW,n,R.RIGHT_EYEBROW,0,a),d(u.LEFT_EYE,n,R.LEFT_EYE,0,a),d(u.RIGHT_EYE,n,R.RIGHT_EYE,0,a),d(u.OUTER_MOUTH,n,R.OUTER_MOUTH,0,a),d(u.INNER_MOUTH,n,R.INNER_MOUTH,0,a)}E.updateTextures({u_faceMask:F})}}function $(e){if(!e.faceLandmarks||!s)return;let n=e.faceLandmarks.length;Ee(e.faceLandmarks),le(n),E.updateUniforms({u_nFaces:n}),B("face:result",e)}let K=0;async function z(e){let n=++K;if(await W,n!==K||!p)return;H.get(r)!==e&&(y=-1),H.set(r,e);try{let l=e instanceof HTMLVideoElement?"VIDEO":"IMAGE";if(k!==l&&(k=l,await p.setOptions({runningMode:k})),e instanceof HTMLVideoElement){if(e.videoWidth===0||e.videoHeight===0||e.readyState<2)return;e.currentTime!==y&&(y=e.currentTime,$(p.detectForVideo(e,performance.now())))}else if(e instanceof HTMLImageElement||e instanceof HTMLCanvasElement){if(e.width===0||e.height===0)return;$(p.detect(e))}}catch(l){console.error("[Face Plugin] Detection error:",l)}}E.on("init",async()=>{E.initializeTexture("u_faceMask",F,{minFilter:h.NEAREST,magFilter:h.NEAREST}),E.initializeUniform("u_maxFaces","int",D),E.initializeUniform("u_nFaces","int",0);let e=D*A;U=Math.ceil(e/I),s=new Float32Array(I*U*4),E.initializeTexture("u_faceLandmarksTex",{data:s,width:I,height:U},{internalFormat:h.RGBA32F,type:h.FLOAT,minFilter:h.NEAREST,magFilter:h.NEAREST}),await W,B("face:ready")}),E.on("initializeTexture",(e,n)=>{e===r&&z(n)}),E.on("updateTextures",e=>{let n=e[r];n&&z(n)}),E.on("destroy",()=>{p?.close(),p=null,t&&m&&(t.deleteProgram(m),t.deleteBuffer(w)),t=null,m=null,b=null,H.clear(),s=null});let L=(e,n=e)=>`vec4 mask = texture(u_faceMask, pos);
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return (mask.r > ${(R[e]-Z).toFixed(4)} && mask.r < ${(R[n]+Z).toFixed(4)}) ? vec2(1.0, faceIndex) : vec2(0.0, -1.0);`;ie(`
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
float inFace(vec2 pos) { return faceAt(pos).x; }`)}}var Ne=Le;
//# sourceMappingURL=face.js.map