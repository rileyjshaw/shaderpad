var M=478,ie=2,R=M+ie,I=512,K=[336,296,334,293,300,276,283,282,295,285],z=[362,398,384,385,386,387,388,466,263,249,390,373,374,380,381,382],X=[70,63,105,66,107,55,65,52,53,46],j=[33,246,161,160,159,158,157,173,133,155,154,153,145,144,163,7],q=[61,185,40,39,37,0,267,269,270,409,291,375,321,405,314,17,84,181,91,146],Y=[78,191,80,81,82,13,312,311,310,415,308,324,318,402,317,14,87,178,88,95],ce=Array.from({length:M},(f,c)=>c),O={LEFT_EYEBROW:K,LEFT_EYE:z,LEFT_EYE_CENTER:473,RIGHT_EYEBROW:X,RIGHT_EYE:j,RIGHT_EYE_CENTER:468,NOSE_TIP:4,OUTER_MOUTH:q,INNER_MOUTH:Y,FACE_CENTER:M,MOUTH_CENTER:M+1},Z=["BACKGROUND","LEFT_EYEBROW","RIGHT_EYEBROW","LEFT_EYE","RIGHT_EYE","OUTER_MOUTH","INNER_MOUTH"],J=Z.length-1,A=Object.fromEntries(Z.map((f,c)=>[f,c/J])),$=.5/J;function v(f){let c=[];for(let i=1;i<f.length-1;++i)c.push(f[0],f[i],f[i+1]);return c}function se(f){let{textureName:c,options:i}=f,Q="https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task";return function(s,ee){let{injectGLSL:te,gl:g}=ee,p=null,C=null,S=-1,k="VIDEO",b=new Map,H=i?.maxFaces??1,y=0,r=null,U=new OffscreenCanvas(1,1),F=new OffscreenCanvas(1,1),t=null,u=null,D=null,w=null,E={LEFT_EYEBROW:v(K),RIGHT_EYEBROW:v(X),LEFT_EYE:v(z),RIGHT_EYE:v(j),OUTER_MOUTH:v(q),INNER_MOUTH:v(Y),TESSELATION:[],OVAL:[]};function ne(){if(t=F.getContext("webgl2",{antialias:!1,preserveDrawingBuffer:!0}),!t)throw new Error("Failed to get WebGL2 context for mask");let e=t.createShader(t.VERTEX_SHADER);t.shaderSource(e,`#version 300 es
in vec2 a_pos;
void main() {
	gl_Position = vec4(a_pos * 2.0 - 1.0, 0.0, 1.0);
}`),t.compileShader(e);let n=t.createShader(t.FRAGMENT_SHADER);t.shaderSource(n,`#version 300 es
precision mediump float;
uniform vec4 u_color;
out vec4 outColor;
void main() { outColor = u_color; }`),t.compileShader(n),u=t.createProgram(),t.attachShader(u,e),t.attachShader(u,n),t.linkProgram(u),t.deleteShader(e),t.deleteShader(n),D=t.createBuffer(),t.bindBuffer(t.ARRAY_BUFFER,D);let a=t.getAttribLocation(u,"a_pos");t.enableVertexAttribArray(a),t.vertexAttribPointer(a,2,t.FLOAT,!1,0,0),w=t.getUniformLocation(u,"u_color"),t.useProgram(u),t.enable(t.BLEND),t.blendEquation(t.MAX)}function d(e,n,a,m,o){if(!t||!r||e.length===0)return;let _=new Float32Array(e.length*2);for(let l=0;l<e.length;++l){let N=(n*R+e[l])*4;_[l*2]=r[N],_[l*2+1]=r[N+1]}t.bufferData(t.ARRAY_BUFFER,_,t.DYNAMIC_DRAW),t.uniform4f(w,a,m,o,1),t.drawArrays(t.TRIANGLES,0,e.length)}async function ae(){try{let{FilesetResolver:e,FaceLandmarker:n}=await import("@mediapipe/tasks-vision");C=await e.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"),p=await n.createFromOptions(C,{baseOptions:{modelAssetPath:i?.modelPath||Q,delegate:"GPU"},canvas:U,runningMode:k,numFaces:i?.maxFaces??1,minFaceDetectionConfidence:i?.minFaceDetectionConfidence??.5,minFacePresenceConfidence:i?.minFacePresenceConfidence??.5,minTrackingConfidence:i?.minTrackingConfidence??.5,outputFaceBlendshapes:i?.outputFaceBlendshapes??!1,outputFacialTransformationMatrixes:i?.outputFacialTransformationMatrixes??!1});let a=n.FACE_LANDMARKS_TESSELATION;E.TESSELATION=[];for(let o=0;o<a.length-2;o+=3)E.TESSELATION.push(a[o].start,a[o+1].start,a[o+2].start);let m=n.FACE_LANDMARKS_FACE_OVAL.map(({start:o})=>o);E.OVAL=v(m),ne()}catch(e){throw console.error("[Face Plugin] Failed to initialize:",e),e}}function G(e,n,a){let m=1/0,o=-1/0,_=1/0,l=-1/0,N=0,x=0;for(let h of a){let T=(n*R+h)*4,P=e[T],V=e[T+1];m=Math.min(m,P),o=Math.max(o,P),_=Math.min(_,V),l=Math.max(l,V),N+=e[T+2],x+=e[T+3]}return[(m+o)/2,(_+l)/2,N/a.length,x/a.length]}function oe(e){if(!r)return;let n=e.length,a=n*R;for(let o=0;o<n;++o){let _=e[o];for(let x=0;x<M;++x){let h=_[x],T=(o*R+x)*4;r[T]=h.x,r[T+1]=1-h.y,r[T+2]=h.z??0,r[T+3]=h.visibility??1}let l=G(r,o,ce);r.set(l,(o*R+O.FACE_CENTER)*4);let N=G(r,o,Y);r.set(N,(o*R+O.MOUTH_CENTER)*4)}let m=Math.ceil(a/I);s.updateTextures({u_faceLandmarksTex:{data:r,width:I,height:m,isPartial:!0}})}function re(e){if(!(!t||!r)){F.width=U.width,F.height=U.height,t.viewport(0,0,F.width,F.height),t.clearColor(0,0,0,0),t.clear(t.COLOR_BUFFER_BIT);for(let n=0;n<e;++n){let a=(n+1)/H;d(E.TESSELATION,n,0,.5,a),d(E.OVAL,n,0,1,a),d(E.LEFT_EYEBROW,n,A.LEFT_EYEBROW,0,a),d(E.RIGHT_EYEBROW,n,A.RIGHT_EYEBROW,0,a),d(E.LEFT_EYE,n,A.LEFT_EYE,0,a),d(E.RIGHT_EYE,n,A.RIGHT_EYE,0,a),d(E.OUTER_MOUTH,n,A.OUTER_MOUTH,0,a),d(E.INNER_MOUTH,n,A.INNER_MOUTH,0,a)}s.updateTextures({u_faceMask:F})}}function B(e){if(!e.faceLandmarks||!r)return;let n=e.faceLandmarks.length;oe(e.faceLandmarks),re(n),s.updateUniforms({u_nFaces:n}),i?.onResults?.(e)}async function W(e){if(b.get(c)!==e&&(S=-1),b.set(c,e),!!p)try{let a=e instanceof HTMLVideoElement?"VIDEO":"IMAGE";if(k!==a&&(k=a,await p.setOptions({runningMode:k})),e instanceof HTMLVideoElement){if(e.videoWidth===0||e.videoHeight===0||e.readyState<2)return;e.currentTime!==S&&(S=e.currentTime,B(p.detectForVideo(e,performance.now())))}else if(e instanceof HTMLImageElement||e instanceof HTMLCanvasElement){if(e.width===0||e.height===0)return;B(p.detect(e))}}catch(a){console.error("[Face Plugin] Detection error:",a)}}s.registerHook("init",async()=>{s.initializeTexture("u_faceMask",F,{minFilter:g.NEAREST,magFilter:g.NEAREST}),s.initializeUniform("u_maxFaces","int",H),s.initializeUniform("u_nFaces","int",0);let e=H*R;y=Math.ceil(e/I),r=new Float32Array(I*y*4),s.initializeTexture("u_faceLandmarksTex",{data:r,width:I,height:y},{internalFormat:g.RGBA32F,type:g.FLOAT,minFilter:g.NEAREST,magFilter:g.NEAREST}),await ae(),i?.onReady?.()}),s.registerHook("initializeTexture",(e,n)=>{e===c&&W(n)}),s.registerHook("updateTextures",e=>{let n=e[c];n&&W(n)}),s.registerHook("destroy",()=>{p?.close(),p=null,t&&u&&(t.deleteProgram(u),t.deleteBuffer(D)),t=null,u=null,C=null,b.clear(),r=null});let L=(e,n=e)=>`vec4 mask = texture(u_faceMask, pos);
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return (mask.r > ${(A[e]-$).toFixed(4)} && mask.r < ${(A[n]+$).toFixed(4)}) ? vec2(1.0, faceIndex) : vec2(0.0, -1.0);`;te(`
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
float inFace(vec2 pos) { return faceAt(pos).x; }`)}}var Ee=se;export{Ee as default};
//# sourceMappingURL=face.mjs.map