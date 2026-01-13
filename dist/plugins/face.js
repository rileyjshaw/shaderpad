"use strict";var se=Object.create;var S=Object.defineProperty;var Ee=Object.getOwnPropertyDescriptor;var le=Object.getOwnPropertyNames;var ue=Object.getPrototypeOf,fe=Object.prototype.hasOwnProperty;var me=(o,i)=>{for(var r in i)S(o,r,{get:i[r],enumerable:!0})},z=(o,i,r,k)=>{if(i&&typeof i=="object"||typeof i=="function")for(let E of le(i))!fe.call(o,E)&&E!==r&&S(o,E,{get:()=>i[E],enumerable:!(k=Ee(i,E))||k.enumerable});return o};var _e=(o,i,r)=>(r=o!=null?se(ue(o)):{},z(i||!o||!o.__esModule?S(r,"default",{value:o,enumerable:!0}):r,o)),Te=o=>z(S({},"__esModule",{value:!0}),o);var Fe={};me(Fe,{default:()=>pe});module.exports=Te(Fe);var M=478,de=2,R=M+de,I=512,j=[336,296,334,293,300,276,283,282,295,285],q=[362,398,384,385,386,387,388,466,263,249,390,373,374,380,381,382],Z=[70,63,105,66,107,55,65,52,53,46],J=[33,246,161,160,159,158,157,173,133,155,154,153,145,144,163,7],Q=[61,185,40,39,37,0,267,269,270,409,291,375,321,405,314,17,84,181,91,146],G=[78,191,80,81,82,13,312,311,310,415,308,324,318,402,317,14,87,178,88,95],Re=Array.from({length:M},(o,i)=>i),O={LEFT_EYEBROW:j,LEFT_EYE:q,LEFT_EYE_CENTER:473,RIGHT_EYEBROW:Z,RIGHT_EYE:J,RIGHT_EYE_CENTER:468,NOSE_TIP:4,OUTER_MOUTH:Q,INNER_MOUTH:G,FACE_CENTER:M,MOUTH_CENTER:M+1},ee=["BACKGROUND","LEFT_EYEBROW","RIGHT_EYEBROW","LEFT_EYE","RIGHT_EYE","OUTER_MOUTH","INNER_MOUTH"],te=ee.length-1,A=Object.fromEntries(ee.map((o,i)=>[o,i/te])),X=.5/te;function v(o){let i=[];for(let r=1;r<o.length-1;++r)i.push(o[0],o[r],o[r+1]);return i}function Ae(o){let{textureName:i,options:r}=o,k="https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task";return function(E,ne){let{injectGLSL:ae,gl:g}=ne,p=null,b=null,H=-1,C="VIDEO",y=new Map,U=r?.maxFaces??1,D=0,s=null,Y=new OffscreenCanvas(1,1),F=new OffscreenCanvas(1,1),t=null,f=null,w=null,B=null,l={LEFT_EYEBROW:v(j),RIGHT_EYEBROW:v(Z),LEFT_EYE:v(q),RIGHT_EYE:v(J),OUTER_MOUTH:v(Q),INNER_MOUTH:v(G),TESSELATION:[],OVAL:[]};function oe(){if(t=F.getContext("webgl2",{antialias:!1,preserveDrawingBuffer:!0}),!t)throw new Error("Failed to get WebGL2 context for mask");let e=t.createShader(t.VERTEX_SHADER);t.shaderSource(e,`#version 300 es
in vec2 a_pos;
void main() {
	gl_Position = vec4(a_pos * 2.0 - 1.0, 0.0, 1.0);
}`),t.compileShader(e);let n=t.createShader(t.FRAGMENT_SHADER);t.shaderSource(n,`#version 300 es
precision mediump float;
uniform vec4 u_color;
out vec4 outColor;
void main() { outColor = u_color; }`),t.compileShader(n),f=t.createProgram(),t.attachShader(f,e),t.attachShader(f,n),t.linkProgram(f),t.deleteShader(e),t.deleteShader(n),w=t.createBuffer(),t.bindBuffer(t.ARRAY_BUFFER,w);let a=t.getAttribLocation(f,"a_pos");t.enableVertexAttribArray(a),t.vertexAttribPointer(a,2,t.FLOAT,!1,0,0),B=t.getUniformLocation(f,"u_color"),t.useProgram(f),t.enable(t.BLEND),t.blendEquation(t.MAX)}function d(e,n,a,m,c){if(!t||!s||e.length===0)return;let _=new Float32Array(e.length*2);for(let u=0;u<e.length;++u){let N=(n*R+e[u])*4;_[u*2]=s[N],_[u*2+1]=s[N+1]}t.bufferData(t.ARRAY_BUFFER,_,t.DYNAMIC_DRAW),t.uniform4f(B,a,m,c,1),t.drawArrays(t.TRIANGLES,0,e.length)}async function re(){try{let{FilesetResolver:e,FaceLandmarker:n}=await import("@mediapipe/tasks-vision");b=await e.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"),p=await n.createFromOptions(b,{baseOptions:{modelAssetPath:r?.modelPath||k,delegate:"GPU"},canvas:Y,runningMode:C,numFaces:r?.maxFaces??1,minFaceDetectionConfidence:r?.minFaceDetectionConfidence??.5,minFacePresenceConfidence:r?.minFacePresenceConfidence??.5,minTrackingConfidence:r?.minTrackingConfidence??.5,outputFaceBlendshapes:r?.outputFaceBlendshapes??!1,outputFacialTransformationMatrixes:r?.outputFacialTransformationMatrixes??!1});let a=n.FACE_LANDMARKS_TESSELATION;l.TESSELATION=[];for(let c=0;c<a.length-2;c+=3)l.TESSELATION.push(a[c].start,a[c+1].start,a[c+2].start);let m=n.FACE_LANDMARKS_FACE_OVAL.map(({start:c})=>c);l.OVAL=v(m),oe()}catch(e){throw console.error("[Face Plugin] Failed to initialize:",e),e}}function W(e,n,a){let m=1/0,c=-1/0,_=1/0,u=-1/0,N=0,x=0;for(let h of a){let T=(n*R+h)*4,$=e[T],K=e[T+1];m=Math.min(m,$),c=Math.max(c,$),_=Math.min(_,K),u=Math.max(u,K),N+=e[T+2],x+=e[T+3]}return[(m+c)/2,(_+u)/2,N/a.length,x/a.length]}function ie(e){if(!s)return;let n=e.length,a=n*R;for(let c=0;c<n;++c){let _=e[c];for(let x=0;x<M;++x){let h=_[x],T=(c*R+x)*4;s[T]=h.x,s[T+1]=1-h.y,s[T+2]=h.z??0,s[T+3]=h.visibility??1}let u=W(s,c,Re);s.set(u,(c*R+O.FACE_CENTER)*4);let N=W(s,c,G);s.set(N,(c*R+O.MOUTH_CENTER)*4)}let m=Math.ceil(a/I);E.updateTextures({u_faceLandmarksTex:{data:s,width:I,height:m,isPartial:!0}})}function ce(e){if(!(!t||!s)){F.width=Y.width,F.height=Y.height,t.viewport(0,0,F.width,F.height),t.clearColor(0,0,0,0),t.clear(t.COLOR_BUFFER_BIT);for(let n=0;n<e;++n){let a=(n+1)/U;d(l.TESSELATION,n,0,.5,a),d(l.OVAL,n,0,1,a),d(l.LEFT_EYEBROW,n,A.LEFT_EYEBROW,0,a),d(l.RIGHT_EYEBROW,n,A.RIGHT_EYEBROW,0,a),d(l.LEFT_EYE,n,A.LEFT_EYE,0,a),d(l.RIGHT_EYE,n,A.RIGHT_EYE,0,a),d(l.OUTER_MOUTH,n,A.OUTER_MOUTH,0,a),d(l.INNER_MOUTH,n,A.INNER_MOUTH,0,a)}E.updateTextures({u_faceMask:F})}}function P(e){if(!e.faceLandmarks||!s)return;let n=e.faceLandmarks.length;ie(e.faceLandmarks),ce(n),E.updateUniforms({u_nFaces:n}),r?.onResults?.(e)}async function V(e){if(y.get(i)!==e&&(H=-1),y.set(i,e),!!p)try{let a=e instanceof HTMLVideoElement?"VIDEO":"IMAGE";if(C!==a&&(C=a,await p.setOptions({runningMode:C})),e instanceof HTMLVideoElement){if(e.videoWidth===0||e.videoHeight===0||e.readyState<2)return;e.currentTime!==H&&(H=e.currentTime,P(p.detectForVideo(e,performance.now())))}else if(e instanceof HTMLImageElement||e instanceof HTMLCanvasElement){if(e.width===0||e.height===0)return;P(p.detect(e))}}catch(a){console.error("[Face Plugin] Detection error:",a)}}E.registerHook("init",async()=>{E.initializeTexture("u_faceMask",F,{minFilter:g.NEAREST,magFilter:g.NEAREST}),E.initializeUniform("u_maxFaces","int",U),E.initializeUniform("u_nFaces","int",0);let e=U*R;D=Math.ceil(e/I),s=new Float32Array(I*D*4),E.initializeTexture("u_faceLandmarksTex",{data:s,width:I,height:D},{internalFormat:g.RGBA32F,type:g.FLOAT,minFilter:g.NEAREST,magFilter:g.NEAREST}),await re(),r?.onReady?.()}),E.registerHook("initializeTexture",(e,n)=>{e===i&&V(n)}),E.registerHook("updateTextures",e=>{let n=e[i];n&&V(n)}),E.registerHook("destroy",()=>{p?.close(),p=null,t&&f&&(t.deleteProgram(f),t.deleteBuffer(w)),t=null,f=null,b=null,y.clear(),s=null});let L=(e,n=e)=>`vec4 mask = texture(u_faceMask, pos);
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return (mask.r > ${(A[e]-X).toFixed(4)} && mask.r < ${(A[n]+X).toFixed(4)}) ? vec2(1.0, faceIndex) : vec2(0.0, -1.0);`;ae(`
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
	int i = faceIndex * ${R} + landmarkIndex;
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
float inFace(vec2 pos) { return faceAt(pos).x; }`)}}var pe=Ae;
//# sourceMappingURL=face.js.map