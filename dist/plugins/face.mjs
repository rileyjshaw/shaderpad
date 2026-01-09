var C=478,te=2,u=C+te,M=512,B=[336,296,334,293,300,276,283,282,295,285],P=[362,398,384,385,386,387,388,466,263,249,390,373,374,380,381,382],K=[70,63,105,66,107,55,65,52,53,46],W=[33,246,161,160,159,158,157,173,133,155,154,153,145,144,163,7],V=[61,185,40,39,37,0,267,269,270,409,291,375,321,405,314,17,84,181,91,146],Y=[78,191,80,81,82,13,312,311,310,415,308,324,318,402,317,14,87,178,88,95],ne=Array.from({length:C},(k,p)=>p),N={LEFT_EYEBROW:B,LEFT_EYE:P,LEFT_EYE_CENTER:473,RIGHT_EYEBROW:K,RIGHT_EYE:W,RIGHT_EYE_CENTER:468,NOSE_TIP:4,OUTER_MOUTH:V,INNER_MOUTH:Y,FACE_CENTER:C,MOUTH_CENTER:C+1},z=["BACKGROUND","LEFT_EYEBROW","RIGHT_EYEBROW","LEFT_EYE","RIGHT_EYE","OUTER_MOUTH","INNER_MOUTH"],j=z.length-1,T=Object.fromEntries(z.map((k,p)=>[k,p/j])),$=.5/j;function ae(k){let{textureName:p,options:s}=k,X="https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task";return function(c,q){let{injectGLSL:Z,gl:v}=q,A=null,L=null,g=-1,O="VIDEO",y=new Map,b=s?.maxFaces??1,H=0,o=null,D=new OffscreenCanvas(1,1),E=document.createElement("canvas"),i=E.getContext("2d"),S=null,U=null;async function J(){try{let{FilesetResolver:t,FaceLandmarker:e}=await import("@mediapipe/tasks-vision");L=await t.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"),A=await e.createFromOptions(L,{baseOptions:{modelAssetPath:s?.modelPath||X,delegate:"GPU"},canvas:D,runningMode:O,numFaces:s?.maxFaces??1,minFaceDetectionConfidence:s?.minFaceDetectionConfidence??.5,minFacePresenceConfidence:s?.minFacePresenceConfidence??.5,minTrackingConfidence:s?.minTrackingConfidence??.5,outputFaceBlendshapes:s?.outputFaceBlendshapes??!1,outputFacialTransformationMatrixes:s?.outputFacialTransformationMatrixes??!1}),S=e.FACE_LANDMARKS_TESSELATION.map(({start:r})=>r),U=e.FACE_LANDMARKS_FACE_OVAL.map(({start:r})=>r)}catch(t){throw console.error("[Face Plugin] Failed to initialize:",t),t}}function w(t,e,r){let n=1/0,a=-1/0,f=1/0,_=-1/0,R=0,d=0;for(let h of r){let l=(e*u+h)*4,x=t[l],I=t[l+1];n=Math.min(n,x),a=Math.max(a,x),f=Math.min(f,I),_=Math.max(_,I),R+=t[l+2],d+=t[l+3]}return[(n+a)/2,(f+_)/2,R/r.length,d/r.length]}function m(t,e,r,n,a){if(!o)return;let{width:f,height:_}=E;i.fillStyle=`rgba(${r}, ${n}, ${a}, 255)`,i.beginPath();let R=(t*u+e[0])*4;i.moveTo(o[R]*f,o[R+1]*_);for(let d=1;d<e.length;++d){let h=(t*u+e[d])*4;i.lineTo(o[h]*f,o[h+1]*_)}i.closePath(),i.fill()}function Q(t){if(!o||!S||!U)return;let{width:e,height:r}=E;i.clearRect(0,0,e,r),i.save(),i.globalCompositeOperation="lighten";for(let n=0;n<t;++n){let a=Math.round((n+1)/b*255);m(n,S,0,128,a),m(n,U,0,255,a),m(n,B,Math.round(T.LEFT_EYEBROW*255),0,a),m(n,K,Math.round(T.RIGHT_EYEBROW*255),0,a),m(n,P,Math.round(T.LEFT_EYE*255),0,a),m(n,W,Math.round(T.RIGHT_EYE*255),0,a),m(n,V,Math.round(T.OUTER_MOUTH*255),0,a),m(n,Y,Math.round(T.INNER_MOUTH*255),0,a)}i.restore(),c.updateTextures({u_faceMask:E})}function ee(t){if(!o)return;let e=t.length,r=e*u;for(let a=0;a<e;++a){let f=t[a];for(let l=0;l<C;++l){let x=f[l],I=(a*u+l)*4;o[I]=x.x,o[I+1]=1-x.y,o[I+2]=x.z??0,o[I+3]=x.visibility??1}let _=w(o,a,ne),R=(a*u+N.FACE_CENTER)*4;o.set(_,R);let d=w(o,a,Y),h=(a*u+N.MOUTH_CENTER)*4;o.set(d,h)}let n=Math.ceil(r/M);c.updateTextures({u_faceLandmarksTex:{data:o,width:M,height:n,isPartial:!0}})}function G(t){if(!t.faceLandmarks||!o)return;E.width=D.width,E.height=D.height;let e=t.faceLandmarks.length;ee(t.faceLandmarks),Q(e),c.updateUniforms({u_nFaces:e}),s?.onResults?.(t)}c.registerHook("init",async()=>{c.initializeTexture("u_faceMask",E,{preserveY:!0,minFilter:v.NEAREST,magFilter:v.NEAREST}),c.initializeUniform("u_maxFaces","int",b),c.initializeUniform("u_nFaces","int",0);let t=b*u;H=Math.ceil(t/M),o=new Float32Array(M*H*4),c.initializeTexture("u_faceLandmarksTex",{data:o,width:M,height:H},{internalFormat:v.RGBA32F,type:v.FLOAT,minFilter:v.NEAREST,magFilter:v.NEAREST}),await J()}),c.registerHook("updateTextures",async t=>{let e=t[p];if(!(!e||(y.get(p)!==e&&(g=-1),y.set(p,e),!A)))try{let n=e instanceof HTMLVideoElement?"VIDEO":"IMAGE";if(O!==n&&(O=n,await A.setOptions({runningMode:O})),e instanceof HTMLVideoElement){if(e.videoWidth===0||e.videoHeight===0||e.readyState<2)return;e.currentTime!==g&&(g=e.currentTime,G(A.detectForVideo(e,performance.now())))}else if(e instanceof HTMLImageElement||e instanceof HTMLCanvasElement){if(e.width===0||e.height===0)return;G(A.detect(e))}}catch(n){console.error("[Face Plugin] Detection error:",n)}}),c.registerHook("destroy",()=>{A?.close(),A=null,L=null,y.clear(),E.remove(),o=null});let F=(t,e=t)=>`vec4 mask = texture(u_faceMask, pos);
	if (mask.a < 0.9) return vec2(0.0, -1.0);
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return (mask.r > ${(T[t]-$).toFixed(4)} && mask.r < ${(T[e]+$).toFixed(4)}) ? vec2(1.0, faceIndex) : vec2(0.0, -1.0);`;Z(`
uniform int u_maxFaces;
uniform int u_nFaces;
uniform sampler2D u_faceLandmarksTex;
uniform sampler2D u_faceMask;

#define FACE_LANDMARK_L_EYE_CENTER ${N.LEFT_EYE_CENTER}
#define FACE_LANDMARK_R_EYE_CENTER ${N.RIGHT_EYE_CENTER}
#define FACE_LANDMARK_NOSE_TIP ${N.NOSE_TIP}
#define FACE_LANDMARK_FACE_CENTER ${N.FACE_CENTER}
#define FACE_LANDMARK_MOUTH_CENTER ${N.MOUTH_CENTER}

vec4 faceLandmark(int faceIndex, int landmarkIndex) {
	int i = faceIndex * ${u} + landmarkIndex;
	int x = i % ${M};
	int y = i / ${M};
	return texelFetch(u_faceLandmarksTex, ivec2(x, y), 0);
}

vec2 leftEyebrowAt(vec2 pos) {
	${F("LEFT_EYEBROW")}
}

vec2 rightEyebrowAt(vec2 pos) {
	${F("RIGHT_EYEBROW")}
}

vec2 leftEyeAt(vec2 pos) {
	${F("LEFT_EYE")}
}

vec2 rightEyeAt(vec2 pos) {
	${F("RIGHT_EYE")}
}

vec2 lipsAt(vec2 pos) {
	${F("OUTER_MOUTH")}
}

vec2 outerMouthAt(vec2 pos) {
	${F("OUTER_MOUTH","INNER_MOUTH")}
}

vec2 innerMouthAt(vec2 pos) {
	${F("INNER_MOUTH")}
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
float inFace(vec2 pos) { return faceAt(pos).x; }`)}}var oe=ae;export{oe as default};
//# sourceMappingURL=face.mjs.map