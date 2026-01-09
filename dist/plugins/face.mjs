var M=478,oe=2,A=M+oe,I=512,$=[336,296,334,293,300,276,283,282,295,285],K=[362,398,384,385,386,387,388,466,263,249,390,373,374,380,381,382],z=[70,63,105,66,107,55,65,52,53,46],X=[33,246,161,160,159,158,157,173,133,155,154,153,145,144,163,7],j=[61,185,40,39,37,0,267,269,270,409,291,375,321,405,314,17,84,181,91,146],Y=[78,191,80,81,82,13,312,311,310,415,308,324,318,402,317,14,87,178,88,95],ie=Array.from({length:M},(m,l)=>l),O={LEFT_EYEBROW:$,LEFT_EYE:K,LEFT_EYE_CENTER:473,RIGHT_EYEBROW:z,RIGHT_EYE:X,RIGHT_EYE_CENTER:468,NOSE_TIP:4,OUTER_MOUTH:j,INNER_MOUTH:Y,FACE_CENTER:M,MOUTH_CENTER:M+1},q=["BACKGROUND","LEFT_EYEBROW","RIGHT_EYEBROW","LEFT_EYE","RIGHT_EYE","OUTER_MOUTH","INNER_MOUTH"],Z=q.length-1,R=Object.fromEntries(q.map((m,l)=>[m,l/Z])),V=.5/Z;function v(m){let l=[];for(let i=1;i<m.length-1;++i)l.push(m[0],m[i],m[i+1]);return l}function se(m){let{textureName:l,options:i}=m,J="https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task";return function(u,Q){let{injectGLSL:ee,gl:h}=Q,p=null,k=null,S=-1,C="VIDEO",b=new Map,H=i?.maxFaces??1,y=0,o=null,U=new OffscreenCanvas(1,1),F=new OffscreenCanvas(1,1),t=null,f=null,D=null,w=null,c={LEFT_EYEBROW:v($),RIGHT_EYEBROW:v(z),LEFT_EYE:v(K),RIGHT_EYE:v(X),OUTER_MOUTH:v(j),INNER_MOUTH:v(Y),TESSELATION:[],OVAL:[]};function te(){if(t=F.getContext("webgl2",{antialias:!1,preserveDrawingBuffer:!0}),!t)throw new Error("Failed to get WebGL2 context for mask");let n=t.createShader(t.VERTEX_SHADER);t.shaderSource(n,`#version 300 es
in vec2 a_pos;
void main() {
	gl_Position = vec4(a_pos * 2.0 - 1.0, 0.0, 1.0);
}`),t.compileShader(n);let e=t.createShader(t.FRAGMENT_SHADER);t.shaderSource(e,`#version 300 es
precision mediump float;
uniform vec4 u_color;
out vec4 outColor;
void main() { outColor = u_color; }`),t.compileShader(e),f=t.createProgram(),t.attachShader(f,n),t.attachShader(f,e),t.linkProgram(f),t.deleteShader(n),t.deleteShader(e),D=t.createBuffer(),t.bindBuffer(t.ARRAY_BUFFER,D);let a=t.getAttribLocation(f,"a_pos");t.enableVertexAttribArray(a),t.vertexAttribPointer(a,2,t.FLOAT,!1,0,0),w=t.getUniformLocation(f,"u_color"),t.useProgram(f),t.enable(t.BLEND),t.blendEquation(t.MAX)}function d(n,e,a,s,r){if(!t||!o||n.length===0)return;let _=new Float32Array(n.length*2);for(let E=0;E<n.length;++E){let N=(e*A+n[E])*4;_[E*2]=o[N],_[E*2+1]=o[N+1]}t.bufferData(t.ARRAY_BUFFER,_,t.DYNAMIC_DRAW),t.uniform4f(w,a,s,r,1),t.drawArrays(t.TRIANGLES,0,n.length)}async function ne(){try{let{FilesetResolver:n,FaceLandmarker:e}=await import("@mediapipe/tasks-vision");k=await n.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"),p=await e.createFromOptions(k,{baseOptions:{modelAssetPath:i?.modelPath||J,delegate:"GPU"},canvas:U,runningMode:C,numFaces:i?.maxFaces??1,minFaceDetectionConfidence:i?.minFaceDetectionConfidence??.5,minFacePresenceConfidence:i?.minFacePresenceConfidence??.5,minTrackingConfidence:i?.minTrackingConfidence??.5,outputFaceBlendshapes:i?.outputFaceBlendshapes??!1,outputFacialTransformationMatrixes:i?.outputFacialTransformationMatrixes??!1});let a=e.FACE_LANDMARKS_TESSELATION;c.TESSELATION=[];for(let r=0;r<a.length-2;r+=3)c.TESSELATION.push(a[r].start,a[r+1].start,a[r+2].start);let s=e.FACE_LANDMARKS_FACE_OVAL.map(({start:r})=>r);c.OVAL=v(s),te()}catch(n){throw console.error("[Face Plugin] Failed to initialize:",n),n}}function G(n,e,a){let s=1/0,r=-1/0,_=1/0,E=-1/0,N=0,x=0;for(let g of a){let T=(e*A+g)*4,W=n[T],P=n[T+1];s=Math.min(s,W),r=Math.max(r,W),_=Math.min(_,P),E=Math.max(E,P),N+=n[T+2],x+=n[T+3]}return[(s+r)/2,(_+E)/2,N/a.length,x/a.length]}function ae(n){if(!o)return;let e=n.length,a=e*A;for(let r=0;r<e;++r){let _=n[r];for(let x=0;x<M;++x){let g=_[x],T=(r*A+x)*4;o[T]=g.x,o[T+1]=1-g.y,o[T+2]=g.z??0,o[T+3]=g.visibility??1}let E=G(o,r,ie);o.set(E,(r*A+O.FACE_CENTER)*4);let N=G(o,r,Y);o.set(N,(r*A+O.MOUTH_CENTER)*4)}let s=Math.ceil(a/I);u.updateTextures({u_faceLandmarksTex:{data:o,width:I,height:s,isPartial:!0}})}function re(n){if(!(!t||!o)){F.width=U.width,F.height=U.height,t.viewport(0,0,F.width,F.height),t.clearColor(0,0,0,0),t.clear(t.COLOR_BUFFER_BIT);for(let e=0;e<n;++e){let a=(e+1)/H;d(c.TESSELATION,e,0,.5,a),d(c.OVAL,e,0,1,a),d(c.LEFT_EYEBROW,e,R.LEFT_EYEBROW,0,a),d(c.RIGHT_EYEBROW,e,R.RIGHT_EYEBROW,0,a),d(c.LEFT_EYE,e,R.LEFT_EYE,0,a),d(c.RIGHT_EYE,e,R.RIGHT_EYE,0,a),d(c.OUTER_MOUTH,e,R.OUTER_MOUTH,0,a),d(c.INNER_MOUTH,e,R.INNER_MOUTH,0,a)}u.updateTextures({u_faceMask:F})}}function B(n){if(!n.faceLandmarks||!o)return;let e=n.faceLandmarks.length;ae(n.faceLandmarks),re(e),u.updateUniforms({u_nFaces:e}),i?.onResults?.(n)}u.registerHook("init",async()=>{u.initializeTexture("u_faceMask",F,{minFilter:h.NEAREST,magFilter:h.NEAREST}),u.initializeUniform("u_maxFaces","int",H),u.initializeUniform("u_nFaces","int",0);let n=H*A;y=Math.ceil(n/I),o=new Float32Array(I*y*4),u.initializeTexture("u_faceLandmarksTex",{data:o,width:I,height:y},{internalFormat:h.RGBA32F,type:h.FLOAT,minFilter:h.NEAREST,magFilter:h.NEAREST}),await ne()}),u.registerHook("updateTextures",async n=>{let e=n[l];if(!(!e||(b.get(l)!==e&&(S=-1),b.set(l,e),!p)))try{let s=e instanceof HTMLVideoElement?"VIDEO":"IMAGE";if(C!==s&&(C=s,await p.setOptions({runningMode:C})),e instanceof HTMLVideoElement){if(e.videoWidth===0||e.videoHeight===0||e.readyState<2)return;e.currentTime!==S&&(S=e.currentTime,B(p.detectForVideo(e,performance.now())))}else if(e instanceof HTMLImageElement||e instanceof HTMLCanvasElement){if(e.width===0||e.height===0)return;B(p.detect(e))}}catch(s){console.error("[Face Plugin] Detection error:",s)}}),u.registerHook("destroy",()=>{p?.close(),p=null,t&&f&&(t.deleteProgram(f),t.deleteBuffer(D)),t=null,f=null,k=null,b.clear(),o=null});let L=(n,e=n)=>`vec4 mask = texture(u_faceMask, pos);
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return (mask.r > ${(R[n]-V).toFixed(4)} && mask.r < ${(R[e]+V).toFixed(4)}) ? vec2(1.0, faceIndex) : vec2(0.0, -1.0);`;ee(`
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
float inFace(vec2 pos) { return faceAt(pos).x; }`)}}var ce=se;export{ce as default};
//# sourceMappingURL=face.mjs.map