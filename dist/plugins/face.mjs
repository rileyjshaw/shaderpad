var v=478,re=2,E=v+re,W=[336,296,334,293,300,276,283,282,295,285],V=[362,398,384,385,386,387,388,466,263,249,390,373,374,380,381,382],z=[70,63,105,66,107,55,65,52,53,46],X=[33,246,161,160,159,158,157,173,133,155,154,153,145,144,163,7],j=[61,185,40,39,37,0,267,269,270,409,291,375,321,405,314,17,84,181,91,146],w=[78,191,80,81,82,13,312,311,310,415,308,324,318,402,317,14,87,178,88,95],ce=Array.from({length:v},(k,x)=>x),R={LEFT_EYEBROW:W,LEFT_EYE:V,LEFT_EYE_CENTER:473,RIGHT_EYEBROW:z,RIGHT_EYE:X,RIGHT_EYE_CENTER:468,NOSE_TIP:4,OUTER_MOUTH:j,INNER_MOUTH:w,FACE_CENTER:v,MOUTH_CENTER:v+1},Z=["BACKGROUND","LEFT_EYEBROW","RIGHT_EYEBROW","LEFT_EYE","RIGHT_EYE","OUTER_MOUTH","INNER_MOUTH"],q=Z.length-1,s=Object.fromEntries(Z.map((k,x)=>[k,x/q])),K=.5/q;function se(k){let{textureName:x,options:f}=k,J="https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task";return function(i,Q){let{injectGLSL:ee,gl:C}=Q,m=null,O=null,b=-1,N="VIDEO",y=new Map,H=f?.maxFaces??1,p=512,S=0,a=null,D=new OffscreenCanvas(1,1),_=document.createElement("canvas"),u=_.getContext("2d"),U=null,Y=null;async function te(){try{let{FilesetResolver:t,FaceLandmarker:e}=await import("@mediapipe/tasks-vision");O=await t.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"),m=await e.createFromOptions(O,{baseOptions:{modelAssetPath:f?.modelPath||J,delegate:"GPU"},canvas:D,runningMode:N,numFaces:f?.maxFaces??1,minFaceDetectionConfidence:f?.minFaceDetectionConfidence??.5,minFacePresenceConfidence:f?.minFacePresenceConfidence??.5,minTrackingConfidence:f?.minTrackingConfidence??.5,outputFaceBlendshapes:f?.outputFaceBlendshapes??!1,outputFacialTransformationMatrixes:f?.outputFacialTransformationMatrixes??!1}),U=e.FACE_LANDMARKS_TESSELATION.map(({start:r})=>r),Y=e.FACE_LANDMARKS_FACE_OVAL.map(({start:r})=>r)}catch(t){throw console.error("[Face Plugin] Failed to initialize:",t),t}}function G(t,e,r){let o=1/0,n=-1/0,T=1/0,c=-1/0,l=0,F=0;for(let oe of r){let L=(e*E+oe)*4,B=t[L],P=t[L+1];o=Math.min(o,B),n=Math.max(n,B),T=Math.min(T,P),c=Math.max(c,P),l+=t[L+2],F+=t[L+3]}let M=(o+n)/2,g=(T+c)/2,h=l/r.length,I=F/r.length;return[M,g,h,I]}function d(t,e,r){if(!a)return;let{width:o,height:n}=_;u.fillStyle=`rgb(${r.r}, ${r.g}, ${r.b})`,u.beginPath();let T=(t*E+e[0])*4;u.moveTo(a[T]*o,a[T+1]*n);for(let c=1;c<e.length;++c){let l=(t*E+e[c])*4;u.lineTo(a[l]*o,a[l+1]*n)}u.closePath(),u.fill()}function ne(t){if(!a||!U||!Y)return;let{width:e,height:r}=_;u.clearRect(0,0,e,r),u.save(),u.globalCompositeOperation="lighten";for(let o=0;o<t;++o){let n=Math.round((o+1)/H*255);d(o,U,{r:0,g:128,b:n}),d(o,Y,{r:0,g:255,b:n}),d(o,W,{r:Math.round(s.LEFT_EYEBROW*255),g:0,b:n}),d(o,z,{r:Math.round(s.RIGHT_EYEBROW*255),g:0,b:n}),d(o,V,{r:Math.round(s.LEFT_EYE*255),g:0,b:n}),d(o,X,{r:Math.round(s.RIGHT_EYE*255),g:0,b:n}),d(o,j,{r:Math.round(s.OUTER_MOUTH*255),g:0,b:n}),d(o,w,{r:Math.round(s.INNER_MOUTH*255),g:0,b:n})}u.restore(),i.updateTextures({u_faceMask:_})}function ae(t){if(!a)return;let e=t.length,r=e*E;for(let n=0;n<e;++n){let T=t[n];for(let g=0;g<v;++g){let h=T[g],I=(n*E+g)*4;a[I]=h.x,a[I+1]=1-h.y,a[I+2]=h.z??0,a[I+3]=h.visibility??1}let c=G(a,n,ce),l=(n*E+R.FACE_CENTER)*4;a[l]=c[0],a[l+1]=c[1],a[l+2]=c[2],a[l+3]=c[3];let F=G(a,n,w),M=(n*E+R.MOUTH_CENTER)*4;a[M]=F[0],a[M+1]=F[1],a[M+2]=F[2],a[M+3]=F[3]}let o=Math.ceil(r/p);i.updateTextures({u_faceLandmarksTex:{data:a,width:p,height:o,isPartial:!0}})}function $(t){if(!t.faceLandmarks||!a)return;_.width=D.width,_.height=D.height;let e=t.faceLandmarks.length;ae(t.faceLandmarks),ne(e),i.updateUniforms({u_nFaces:e}),f?.onResults?.(t)}i.registerHook("init",async()=>{i.initializeTexture("u_faceMask",_,{preserveY:!0}),i.initializeUniform("u_maxFaces","int",H),i.initializeUniform("u_nFaces","int",0);let t=H*E;S=Math.ceil(t/p);let e=p*S*4;a=new Float32Array(e),i.initializeTexture("u_faceLandmarksTex",{data:a,width:p,height:S},{internalFormat:C.RGBA32F,type:C.FLOAT,minFilter:C.NEAREST,magFilter:C.NEAREST}),await te()}),i.registerHook("updateTextures",async t=>{let e=t[x];if(!(!e||(y.get(x)!==e&&(b=-1),y.set(x,e),!m)))try{let o=e instanceof HTMLVideoElement?"VIDEO":"IMAGE";if(N!==o&&(N=o,await m.setOptions({runningMode:N})),e instanceof HTMLVideoElement){if(e.videoWidth===0||e.videoHeight===0||e.readyState<2)return;if(e.currentTime!==b){b=e.currentTime;let n=m.detectForVideo(e,performance.now());$(n)}}else if(e instanceof HTMLImageElement||e instanceof HTMLCanvasElement){if(e.width===0||e.height===0)return;let n=m.detect(e);$(n)}}catch(o){console.error("[Face Plugin] Detection error:",o)}}),i.registerHook("destroy",()=>{m&&(m.close(),m=null),O=null,y.clear(),_.remove(),a=null});let A=t=>`(mask.r > ${(t-K).toFixed(4)} && mask.r < ${(t+K).toFixed(4)})  ? vec2(1.0, faceIndex) : vec2(0.0, -1.0)`;ee(`
uniform int u_maxFaces;
uniform int u_nFaces;
uniform sampler2D u_faceLandmarksTex;
uniform sampler2D u_faceMask;

#define FACE_LANDMARK_L_EYE_CENTER ${R.LEFT_EYE_CENTER}
#define FACE_LANDMARK_R_EYE_CENTER ${R.RIGHT_EYE_CENTER}
#define FACE_LANDMARK_NOSE_TIP ${R.NOSE_TIP}
#define FACE_LANDMARK_FACE_CENTER ${R.FACE_CENTER}
#define FACE_LANDMARK_MOUTH_CENTER ${R.MOUTH_CENTER}

vec4 faceLandmark(int faceIndex, int landmarkIndex) {
	int i = faceIndex * ${E} + landmarkIndex;
	int x = i % ${p};
	int y = i / ${p};
	return texelFetch(u_faceLandmarksTex, ivec2(x, y), 0);
}

vec2 leftEyebrowAt(vec2 pos) {
	vec4 mask = texture(u_faceMask, pos);
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return ${A(s.LEFT_EYEBROW)};
}

vec2 rightEyebrowAt(vec2 pos) {
	vec4 mask = texture(u_faceMask, pos);
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return ${A(s.RIGHT_EYEBROW)};
}

vec2 leftEyeAt(vec2 pos) {
	vec4 mask = texture(u_faceMask, pos);
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return ${A(s.LEFT_EYE)};
}

vec2 rightEyeAt(vec2 pos) {
	vec4 mask = texture(u_faceMask, pos);
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return ${A(s.RIGHT_EYE)};
}

vec2 outerMouthAt(vec2 pos) {
	vec4 mask = texture(u_faceMask, pos);
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return ${A(s.OUTER_MOUTH)};
}

vec2 innerMouthAt(vec2 pos) {
	vec4 mask = texture(u_faceMask, pos);
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return ${A(s.INNER_MOUTH)};
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
}`)}}var ie=se;export{ie as default};
//# sourceMappingURL=face.mjs.map