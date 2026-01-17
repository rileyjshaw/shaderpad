var _=21,X=1,x=_+X,B=[0,0,5,9,13,17];function Y(b){let{textureName:p,options:m}=b,F="https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";return function(r,P){let{injectGLSL:z,gl:k,emitHook:N}=P,o=null,M=null,I=-1,L="VIDEO",C=new Map,S=m?.maxHands??2,d=512,A=0,t=null;async function U(){try{let{FilesetResolver:n,HandLandmarker:e}=await import("@mediapipe/tasks-vision");M=await n.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"),o=await e.createFromOptions(M,{baseOptions:{modelAssetPath:m?.modelPath||F,delegate:"GPU"},canvas:new OffscreenCanvas(1,1),runningMode:L,numHands:m?.maxHands??2,minHandDetectionConfidence:m?.minHandDetectionConfidence??.5,minHandPresenceConfidence:m?.minHandPresenceConfidence??.5,minTrackingConfidence:m?.minTrackingConfidence??.5})}catch(n){throw console.error("[Hands Plugin] Failed to initialize MediaPipe:",n),n}}let w=U();function V(n,e,s){let i=1/0,h=-1/0,a=1/0,g=-1/0,H=0,c=0;for(let K of s){let y=(e*x+K)*4,D=n[y],O=n[y+1];i=Math.min(i,D),h=Math.max(h,D),a=Math.min(a,O),g=Math.max(g,O),H+=n[y+2],c+=n[y+3]}let l=(i+h)/2,u=(a+g)/2,T=H/s.length,f=c/s.length;return[l,u,T,f]}function G(n,e){if(!t)return;let s=n.length,i=s*x;for(let a=0;a<s;++a){let g=n[a],H=e[a]?.[0]?.categoryName==="Right";for(let u=0;u<_;++u){let T=g[u],f=(a*x+u)*4;t[f]=T.x,t[f+1]=1-T.y,t[f+2]=T.z??0,t[f+3]=H?1:0}let c=V(t,a,B),l=(a*x+_)*4;t[l]=c[0],t[l+1]=c[1],t[l+2]=c[2],t[l+3]=H?1:0}let h=Math.ceil(i/d);r.updateTextures({u_handLandmarksTex:{data:t,width:d,height:h,isPartial:!0}})}function R(n){if(!n.landmarks||!t)return;let e=n.landmarks.length;G(n.landmarks,n.handedness),r.updateUniforms({u_nHands:e}),N("hands:result",n)}r.on("init",async()=>{r.initializeUniform("u_maxHands","int",S),r.initializeUniform("u_nHands","int",0);let n=S*x;A=Math.ceil(n/d);let e=d*A*4;t=new Float32Array(e),r.initializeTexture("u_handLandmarksTex",{data:t,width:d,height:A},{internalFormat:k.RGBA32F,type:k.FLOAT,minFilter:k.NEAREST,magFilter:k.NEAREST}),await w,N("hands:ready")}),r.on("initializeTexture",(n,e)=>{n===p&&v(e)}),r.on("updateTextures",n=>{let e=n[p];e&&v(e)});let E=0;async function v(n){let e=++E;if(await w,e!==E||!o)return;C.get(p)!==n&&(I=-1),C.set(p,n);try{let i=n instanceof HTMLVideoElement?"VIDEO":"IMAGE";if(L!==i&&(L=i,await o.setOptions({runningMode:L})),n instanceof HTMLVideoElement){if(n.videoWidth===0||n.videoHeight===0||n.readyState<2)return;n.currentTime!==I&&(I=n.currentTime,R(o.detectForVideo(n,performance.now())))}else if(n instanceof HTMLImageElement||n instanceof HTMLCanvasElement){if(n.width===0||n.height===0)return;R(o.detect(n))}}catch(i){console.error("[Hands Plugin] Detection error:",i)}}r.on("destroy",()=>{o&&(o.close(),o=null),M=null,C.clear(),t=null}),z(`
uniform int u_maxHands;
uniform int u_nHands;
uniform sampler2D u_handLandmarksTex;

vec4 handLandmark(int handIndex, int landmarkIndex) {
	int i = handIndex * ${x} + landmarkIndex;
	int x = i % ${d};
	int y = i / ${d};
	return texelFetch(u_handLandmarksTex, ivec2(x, y), 0);
}

float isRightHand(int handIndex) {
	return handLandmark(handIndex, 0).w;
}

float isLeftHand(int handIndex) {
	return 1.0 - handLandmark(handIndex, 0).w;
}`)}}var $=Y;export{$ as default};
//# sourceMappingURL=hands.mjs.map