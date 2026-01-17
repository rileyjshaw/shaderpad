var C=478,Ee=2,A=C+Ee,I=512,j=[336,296,334,293,300,276,283,282,295,285],q=[362,398,384,385,386,387,388,466,263,249,390,373,374,380,381,382],Z=[70,63,105,66,107,55,65,52,53,46],J=[33,246,161,160,159,158,157,173,133,155,154,153,145,144,163,7],Q=[61,185,40,39,37,0,267,269,270,409,291,375,321,405,314,17,84,181,91,146],Y=[78,191,80,81,82,13,312,311,310,415,308,324,318,402,317,14,87,178,88,95],le=Array.from({length:C},(m,s)=>s),O={LEFT_EYEBROW:j,LEFT_EYE:q,LEFT_EYE_CENTER:473,RIGHT_EYEBROW:Z,RIGHT_EYE:J,RIGHT_EYE_CENTER:468,NOSE_TIP:4,OUTER_MOUTH:Q,INNER_MOUTH:Y,FACE_CENTER:C,MOUTH_CENTER:C+1},ee=["BACKGROUND","LEFT_EYEBROW","RIGHT_EYEBROW","LEFT_EYE","RIGHT_EYE","OUTER_MOUTH","INNER_MOUTH"],te=ee.length-1,R=Object.fromEntries(ee.map((m,s)=>[m,s/te])),X=.5/te;function v(m){let s=[];for(let c=1;c<m.length-1;++c)s.push(m[0],m[c],m[c+1]);return s}function ue(m){let{textureName:s,options:c}=m,ne="https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task";return function(E,ae){let{injectGLSL:oe,gl:h,emitHook:w}=ae,p=null,k=null,S=-1,g="VIDEO",b=new Map,y=c?.maxFaces??1,H=0,r=null,D=new OffscreenCanvas(1,1),F=new OffscreenCanvas(1,1),t=null,f=null,U=null,G=null,l={LEFT_EYEBROW:v(j),RIGHT_EYEBROW:v(Z),LEFT_EYE:v(q),RIGHT_EYE:v(J),OUTER_MOUTH:v(Q),INNER_MOUTH:v(Y),TESSELATION:[],OVAL:[]};function re(){if(t=F.getContext("webgl2",{antialias:!1,preserveDrawingBuffer:!0}),!t)throw new Error("Failed to get WebGL2 context for mask");let e=t.createShader(t.VERTEX_SHADER);t.shaderSource(e,`#version 300 es
in vec2 a_pos;
void main() {
	gl_Position = vec4(a_pos * 2.0 - 1.0, 0.0, 1.0);
}`),t.compileShader(e);let n=t.createShader(t.FRAGMENT_SHADER);t.shaderSource(n,`#version 300 es
precision mediump float;
uniform vec4 u_color;
out vec4 outColor;
void main() { outColor = u_color; }`),t.compileShader(n),f=t.createProgram(),t.attachShader(f,e),t.attachShader(f,n),t.linkProgram(f),t.deleteShader(e),t.deleteShader(n),U=t.createBuffer(),t.bindBuffer(t.ARRAY_BUFFER,U);let a=t.getAttribLocation(f,"a_pos");t.enableVertexAttribArray(a),t.vertexAttribPointer(a,2,t.FLOAT,!1,0,0),G=t.getUniformLocation(f,"u_color"),t.useProgram(f),t.enable(t.BLEND),t.blendEquation(t.MAX)}function d(e,n,a,i,o){if(!t||!r||e.length===0)return;let _=new Float32Array(e.length*2);for(let u=0;u<e.length;++u){let N=(n*A+e[u])*4;_[u*2]=r[N],_[u*2+1]=r[N+1]}t.bufferData(t.ARRAY_BUFFER,_,t.DYNAMIC_DRAW),t.uniform4f(G,a,i,o,1),t.drawArrays(t.TRIANGLES,0,e.length)}async function ie(){try{let{FilesetResolver:e,FaceLandmarker:n}=await import("@mediapipe/tasks-vision");k=await e.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"),p=await n.createFromOptions(k,{baseOptions:{modelAssetPath:c?.modelPath||ne,delegate:"GPU"},canvas:D,runningMode:g,numFaces:c?.maxFaces??1,minFaceDetectionConfidence:c?.minFaceDetectionConfidence??.5,minFacePresenceConfidence:c?.minFacePresenceConfidence??.5,minTrackingConfidence:c?.minTrackingConfidence??.5,outputFaceBlendshapes:c?.outputFaceBlendshapes??!1,outputFacialTransformationMatrixes:c?.outputFacialTransformationMatrixes??!1});let a=n.FACE_LANDMARKS_TESSELATION;l.TESSELATION=[];for(let o=0;o<a.length-2;o+=3)l.TESSELATION.push(a[o].start,a[o+1].start,a[o+2].start);let i=n.FACE_LANDMARKS_FACE_OVAL.map(({start:o})=>o);l.OVAL=v(i),re()}catch(e){throw console.error("[Face Plugin] Failed to initialize MediaPipe:",e),e}}let B=ie();function P(e,n,a){let i=1/0,o=-1/0,_=1/0,u=-1/0,N=0,x=0;for(let M of a){let T=(n*A+M)*4,K=e[T],z=e[T+1];i=Math.min(i,K),o=Math.max(o,K),_=Math.min(_,z),u=Math.max(u,z),N+=e[T+2],x+=e[T+3]}return[(i+o)/2,(_+u)/2,N/a.length,x/a.length]}function ce(e){if(!r)return;let n=e.length,a=n*A;for(let o=0;o<n;++o){let _=e[o];for(let x=0;x<C;++x){let M=_[x],T=(o*A+x)*4;r[T]=M.x,r[T+1]=1-M.y,r[T+2]=M.z??0,r[T+3]=M.visibility??1}let u=P(r,o,le);r.set(u,(o*A+O.FACE_CENTER)*4);let N=P(r,o,Y);r.set(N,(o*A+O.MOUTH_CENTER)*4)}let i=Math.ceil(a/I);E.updateTextures({u_faceLandmarksTex:{data:r,width:I,height:i,isPartial:!0}})}function se(e){if(!(!t||!r)){F.width=D.width,F.height=D.height,t.viewport(0,0,F.width,F.height),t.clearColor(0,0,0,0),t.clear(t.COLOR_BUFFER_BIT);for(let n=0;n<e;++n){let a=(n+1)/y;d(l.TESSELATION,n,0,.5,a),d(l.OVAL,n,0,1,a),d(l.LEFT_EYEBROW,n,R.LEFT_EYEBROW,0,a),d(l.RIGHT_EYEBROW,n,R.RIGHT_EYEBROW,0,a),d(l.LEFT_EYE,n,R.LEFT_EYE,0,a),d(l.RIGHT_EYE,n,R.RIGHT_EYE,0,a),d(l.OUTER_MOUTH,n,R.OUTER_MOUTH,0,a),d(l.INNER_MOUTH,n,R.INNER_MOUTH,0,a)}E.updateTextures({u_faceMask:F})}}function W(e){if(!e.faceLandmarks||!r)return;let n=e.faceLandmarks.length;ce(e.faceLandmarks),se(n),E.updateUniforms({u_nFaces:n}),w("face:result",e)}let V=0;async function $(e){let n=++V;if(await B,n!==V||!p)return;b.get(s)!==e&&(S=-1),b.set(s,e);try{let i=e instanceof HTMLVideoElement?"VIDEO":"IMAGE";if(g!==i&&(g=i,await p.setOptions({runningMode:g})),e instanceof HTMLVideoElement){if(e.videoWidth===0||e.videoHeight===0||e.readyState<2)return;e.currentTime!==S&&(S=e.currentTime,W(p.detectForVideo(e,performance.now())))}else if(e instanceof HTMLImageElement||e instanceof HTMLCanvasElement){if(e.width===0||e.height===0)return;W(p.detect(e))}}catch(i){console.error("[Face Plugin] Detection error:",i)}}E.on("init",async()=>{E.initializeTexture("u_faceMask",F,{minFilter:h.NEAREST,magFilter:h.NEAREST}),E.initializeUniform("u_maxFaces","int",y),E.initializeUniform("u_nFaces","int",0);let e=y*A;H=Math.ceil(e/I),r=new Float32Array(I*H*4),E.initializeTexture("u_faceLandmarksTex",{data:r,width:I,height:H},{internalFormat:h.RGBA32F,type:h.FLOAT,minFilter:h.NEAREST,magFilter:h.NEAREST}),await B,w("face:ready")}),E.on("initializeTexture",(e,n)=>{e===s&&$(n)}),E.on("updateTextures",e=>{let n=e[s];n&&$(n)}),E.on("destroy",()=>{p?.close(),p=null,t&&f&&(t.deleteProgram(f),t.deleteBuffer(U)),t=null,f=null,k=null,b.clear(),r=null});let L=(e,n=e)=>`vec4 mask = texture(u_faceMask, pos);
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return (mask.r > ${(R[e]-X).toFixed(4)} && mask.r < ${(R[n]+X).toFixed(4)}) ? vec2(1.0, faceIndex) : vec2(0.0, -1.0);`;oe(`
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
float inFace(vec2 pos) { return faceAt(pos).x; }`)}}var fe=ue;export{fe as default};
//# sourceMappingURL=face.mjs.map