var C=21,V=1,x=C+V,z=[0,0,5,9,13,17];function G(E){let{textureName:y,options:d}=E,S="https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";return function(o,D){let{injectGLSL:O,gl:T}=D,s=null,M=null,I=-1,p="VIDEO",R=new Map,_=d?.maxHands??2,c=512,A=0,t=null;async function b(){try{let{FilesetResolver:e,HandLandmarker:n}=await import("@mediapipe/tasks-vision");M=await e.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"),s=await n.createFromOptions(M,{baseOptions:{modelAssetPath:d?.modelPath||S,delegate:"GPU"},canvas:new OffscreenCanvas(1,1),runningMode:p,numHands:d?.maxHands??2,minHandDetectionConfidence:d?.minHandDetectionConfidence??.5,minHandPresenceConfidence:d?.minHandPresenceConfidence??.5,minTrackingConfidence:d?.minTrackingConfidence??.5})}catch(e){throw console.error("[Hands Plugin] Failed to initialize:",e),e}}function F(e,n,m){let i=1/0,r=-1/0,a=1/0,g=-1/0,H=0,l=0;for(let U of m){let L=(n*x+U)*4,v=e[L],w=e[L+1];i=Math.min(i,v),r=Math.max(r,v),a=Math.min(a,w),g=Math.max(g,w),H+=e[L+2],l+=e[L+3]}let u=(i+r)/2,f=(a+g)/2,k=H/m.length,h=l/m.length;return[u,f,k,h]}function P(e,n){if(!t)return;let m=e.length,i=m*x;for(let a=0;a<m;++a){let g=e[a],H=n[a]?.[0]?.categoryName==="Right";for(let f=0;f<C;++f){let k=g[f],h=(a*x+f)*4;t[h]=k.x,t[h+1]=1-k.y,t[h+2]=k.z??0,t[h+3]=H?1:0}let l=F(t,a,z),u=(a*x+C)*4;t[u]=l[0],t[u+1]=l[1],t[u+2]=l[2],t[u+3]=H?1:0}let r=Math.ceil(i/c);o.updateTextures({u_handLandmarksTex:{data:t,width:c,height:r,isPartial:!0}})}function N(e){if(!e.landmarks||!t)return;let n=e.landmarks.length;P(e.landmarks,e.handedness),o.updateUniforms({u_nHands:n}),d?.onResults?.(e)}o.registerHook("init",async()=>{o.initializeUniform("u_maxHands","int",_),o.initializeUniform("u_nHands","int",0);let e=_*x;A=Math.ceil(e/c);let n=c*A*4;t=new Float32Array(n),o.initializeTexture("u_handLandmarksTex",{data:t,width:c,height:A},{internalFormat:T.RGBA32F,type:T.FLOAT,minFilter:T.NEAREST,magFilter:T.NEAREST}),await b()}),o.registerHook("updateTextures",async e=>{let n=e[y];if(!(!n||(R.get(y)!==n&&(I=-1),R.set(y,n),!s)))try{let i=n instanceof HTMLVideoElement?"VIDEO":"IMAGE";if(p!==i&&(p=i,await s.setOptions({runningMode:p})),n instanceof HTMLVideoElement){if(n.videoWidth===0||n.videoHeight===0||n.readyState<2)return;if(n.currentTime!==I){I=n.currentTime;let r=s.detectForVideo(n,performance.now());N(r)}}else if(n instanceof HTMLImageElement||n instanceof HTMLCanvasElement){if(n.width===0||n.height===0)return;let r=s.detect(n);N(r)}}catch(i){console.error("[Hands Plugin] Detection error:",i)}}),o.registerHook("destroy",()=>{s&&(s.close(),s=null),M=null,R.clear(),t=null}),O(`
uniform int u_maxHands;
uniform int u_nHands;
uniform sampler2D u_handLandmarksTex;

vec4 handLandmark(int handIndex, int landmarkIndex) {
	int i = handIndex * ${x} + landmarkIndex;
	int x = i % ${c};
	int y = i / ${c};
	return texelFetch(u_handLandmarksTex, ivec2(x, y), 0);
}

float isRightHand(int handIndex) {
	return handLandmark(handIndex, 0).w;
}

float isLeftHand(int handIndex) {
	return 1.0 - handLandmark(handIndex, 0).w;
}`)}}var K=G;export{K as default};
//# sourceMappingURL=hands.mjs.map