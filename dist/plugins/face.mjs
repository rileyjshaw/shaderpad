var v=478,re=2,E=v+re,W=[336,296,334,293,300,276,283,282,295,285],V=[362,398,384,385,386,387,388,466,263,249,390,373,374,380,381,382],z=[70,63,105,66,107,55,65,52,53,46],X=[33,246,161,160,159,158,157,173,133,155,154,153,145,144,163,7],j=[61,185,40,39,37,0,267,269,270,409,291,375,321,405,314,17,84,181,91,146],w=[78,191,80,81,82,13,312,311,310,415,308,324,318,402,317,14,87,178,88,95],ie=Array.from({length:v},(C,p)=>p),x={LEFT_EYEBROW:W,LEFT_EYE:V,LEFT_EYE_CENTER:473,RIGHT_EYEBROW:z,RIGHT_EYE:X,RIGHT_EYE_CENTER:468,NOSE_TIP:4,OUTER_MOUTH:j,INNER_MOUTH:w,FACE_CENTER:v,MOUTH_CENTER:v+1},q=["BACKGROUND","LEFT_EYEBROW","RIGHT_EYEBROW","LEFT_EYE","RIGHT_EYE","OUTER_MOUTH","INNER_MOUTH"],Z=q.length-1,T=Object.fromEntries(q.map((C,p)=>[C,p/Z])),K=.5/Z;function ce(C){let{textureName:p,options:l}=C,J="https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task";return function(s,Q){let{injectGLSL:ee,gl:g}=Q,f=null,k=null,b=-1,O="VIDEO",y=new Map,H=l?.maxFaces??1,F=512,S=0,a=null,D=new OffscreenCanvas(1,1),m=document.createElement("canvas"),c=m.getContext("2d",{willReadFrequently:!0});c.imageSmoothingEnabled=!1;let U=null,Y=null;async function te(){try{let{FilesetResolver:t,FaceLandmarker:e}=await import("@mediapipe/tasks-vision");k=await t.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"),f=await e.createFromOptions(k,{baseOptions:{modelAssetPath:l?.modelPath||J,delegate:"GPU"},canvas:D,runningMode:O,numFaces:l?.maxFaces??1,minFaceDetectionConfidence:l?.minFaceDetectionConfidence??.5,minFacePresenceConfidence:l?.minFacePresenceConfidence??.5,minTrackingConfidence:l?.minTrackingConfidence??.5,outputFaceBlendshapes:l?.outputFaceBlendshapes??!1,outputFacialTransformationMatrixes:l?.outputFacialTransformationMatrixes??!1}),U=e.FACE_LANDMARKS_TESSELATION.map(({start:r})=>r),Y=e.FACE_LANDMARKS_FACE_OVAL.map(({start:r})=>r)}catch(t){throw console.error("[Face Plugin] Failed to initialize:",t),t}}function G(t,e,r){let o=1/0,n=-1/0,_=1/0,i=-1/0,u=0,A=0;for(let oe of r){let L=(e*E+oe)*4,B=t[L],P=t[L+1];o=Math.min(o,B),n=Math.max(n,B),_=Math.min(_,P),i=Math.max(i,P),u+=t[L+2],A+=t[L+3]}let M=(o+n)/2,h=(_+i)/2,I=u/r.length,N=A/r.length;return[M,h,I,N]}function d(t,e,r){if(!a)return;let{width:o,height:n}=m;c.fillStyle=`rgb(${r.r}, ${r.g}, ${r.b})`,c.beginPath();let _=(t*E+e[0])*4;c.moveTo(a[_]*o,a[_+1]*n);for(let i=1;i<e.length;++i){let u=(t*E+e[i])*4;c.lineTo(a[u]*o,a[u+1]*n)}c.closePath(),c.fill()}function ne(t){if(!a||!U||!Y)return;let{width:e,height:r}=m;c.clearRect(0,0,e,r),c.save(),c.globalCompositeOperation="lighten";for(let o=0;o<t;++o){let n=Math.round((o+1)/H*255);d(o,U,{r:0,g:128,b:n}),d(o,Y,{r:0,g:255,b:n}),d(o,W,{r:Math.round(T.LEFT_EYEBROW*255),g:0,b:n}),d(o,z,{r:Math.round(T.RIGHT_EYEBROW*255),g:0,b:n}),d(o,V,{r:Math.round(T.LEFT_EYE*255),g:0,b:n}),d(o,X,{r:Math.round(T.RIGHT_EYE*255),g:0,b:n}),d(o,j,{r:Math.round(T.OUTER_MOUTH*255),g:0,b:n}),d(o,w,{r:Math.round(T.INNER_MOUTH*255),g:0,b:n})}c.restore(),s.updateTextures({u_faceMask:m})}function ae(t){if(!a)return;let e=t.length,r=e*E;for(let n=0;n<e;++n){let _=t[n];for(let h=0;h<v;++h){let I=_[h],N=(n*E+h)*4;a[N]=I.x,a[N+1]=1-I.y,a[N+2]=I.z??0,a[N+3]=I.visibility??1}let i=G(a,n,ie),u=(n*E+x.FACE_CENTER)*4;a[u]=i[0],a[u+1]=i[1],a[u+2]=i[2],a[u+3]=i[3];let A=G(a,n,w),M=(n*E+x.MOUTH_CENTER)*4;a[M]=A[0],a[M+1]=A[1],a[M+2]=A[2],a[M+3]=A[3]}let o=Math.ceil(r/F);s.updateTextures({u_faceLandmarksTex:{data:a,width:F,height:o,isPartial:!0}})}function $(t){if(!t.faceLandmarks||!a)return;m.width=D.width,m.height=D.height;let e=t.faceLandmarks.length;ae(t.faceLandmarks),ne(e),s.updateUniforms({u_nFaces:e}),l?.onResults?.(t)}s.registerHook("init",async()=>{s.initializeTexture("u_faceMask",m,{preserveY:!0,minFilter:g.NEAREST,magFilter:g.NEAREST}),s.initializeUniform("u_maxFaces","int",H),s.initializeUniform("u_nFaces","int",0);let t=H*E;S=Math.ceil(t/F);let e=F*S*4;a=new Float32Array(e),s.initializeTexture("u_faceLandmarksTex",{data:a,width:F,height:S},{internalFormat:g.RGBA32F,type:g.FLOAT,minFilter:g.NEAREST,magFilter:g.NEAREST}),await te()}),s.registerHook("updateTextures",async t=>{let e=t[p];if(!(!e||(y.get(p)!==e&&(b=-1),y.set(p,e),!f)))try{let o=e instanceof HTMLVideoElement?"VIDEO":"IMAGE";if(O!==o&&(O=o,await f.setOptions({runningMode:O})),e instanceof HTMLVideoElement){if(e.videoWidth===0||e.videoHeight===0||e.readyState<2)return;if(e.currentTime!==b){b=e.currentTime;let n=f.detectForVideo(e,performance.now());$(n)}}else if(e instanceof HTMLImageElement||e instanceof HTMLCanvasElement){if(e.width===0||e.height===0)return;let n=f.detect(e);$(n)}}catch(o){console.error("[Face Plugin] Detection error:",o)}}),s.registerHook("destroy",()=>{f&&(f.close(),f=null),k=null,y.clear(),m.remove(),a=null});let R=(t,e=t)=>`vec4 mask = texture(u_faceMask, pos);
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return (mask.r > ${(T[t]-K).toFixed(4)} && mask.r < ${(T[e]+K).toFixed(4)})  ? vec2(1.0, faceIndex) : vec2(0.0, -1.0)`;ee(`
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
	int i = faceIndex * ${E} + landmarkIndex;
	int x = i % ${F};
	int y = i / ${F};
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
}`)}}var se=ce;export{se as default};
//# sourceMappingURL=face.mjs.map