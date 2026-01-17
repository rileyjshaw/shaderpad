import{a as W}from"../chunk-A3XQBYSC.mjs";var c=33,Q=6,r=c+Q,t={LEFT_EYE:2,RIGHT_EYE:5,LEFT_SHOULDER:11,RIGHT_SHOULDER:12,LEFT_ELBOW:13,RIGHT_ELBOW:14,LEFT_HIP:23,RIGHT_HIP:24,LEFT_KNEE:25,RIGHT_KNEE:26,LEFT_WRIST:15,RIGHT_WRIST:16,LEFT_PINKY:17,RIGHT_PINKY:18,LEFT_INDEX:19,RIGHT_INDEX:20,LEFT_THUMB:21,RIGHT_THUMB:22,LEFT_ANKLE:27,RIGHT_ANKLE:28,LEFT_HEEL:29,RIGHT_HEEL:30,LEFT_FOOT_INDEX:31,RIGHT_FOOT_INDEX:32,BODY_CENTER:c,LEFT_HAND_CENTER:c+1,RIGHT_HAND_CENTER:c+2,LEFT_FOOT_CENTER:c+3,RIGHT_FOOT_CENTER:c+4,TORSO_CENTER:c+5},ee=Array.from({length:c},(w,f)=>f),ne=[t.LEFT_WRIST,t.LEFT_PINKY,t.LEFT_THUMB,t.LEFT_INDEX],te=[t.RIGHT_WRIST,t.RIGHT_PINKY,t.RIGHT_THUMB,t.RIGHT_INDEX],oe=[t.LEFT_ANKLE,t.LEFT_HEEL,t.LEFT_FOOT_INDEX],ie=[t.RIGHT_ANKLE,t.RIGHT_HEEL,t.RIGHT_FOOT_INDEX],se=[t.LEFT_SHOULDER,t.RIGHT_SHOULDER,t.LEFT_HIP,t.RIGHT_HIP],re={data:new Uint8Array(4),width:1,height:1};function ae(w){let{textureName:f,options:N}=w,X="https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";return function(s,V){let{injectGLSL:j,gl:H,emitHook:$}=V,l=null,h=null,v=-1,C="VIDEO",K=new Map,y=N?.maxPoses??1,m=512,U=0,n=null,S=new OffscreenCanvas(1,1),a=null;async function Z(){try{let{FilesetResolver:e,PoseLandmarker:o}=await import("@mediapipe/tasks-vision");h=await e.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"),l=await o.createFromOptions(h,{baseOptions:{modelAssetPath:N?.modelPath||X,delegate:"GPU"},canvas:S,runningMode:C,numPoses:N?.maxPoses??1,minPoseDetectionConfidence:N?.minPoseDetectionConfidence??.5,minPosePresenceConfidence:N?.minPosePresenceConfidence??.5,minTrackingConfidence:N?.minTrackingConfidence??.5,outputSegmentationMasks:!0})}catch(e){throw console.error("[Pose Plugin] Failed to initialize MediaPipe:",e),e}}let b=Z();function O(e,o,_){let E=1/0,i=-1/0,P=1/0,d=-1/0,u=0,R=0;for(let D of _){let T=(o*r+D)*4,L=e[T],I=e[T+1];E=Math.min(E,L),i=Math.max(i,L),P=Math.min(P,I),d=Math.max(d,I),u+=e[T+2],R+=e[T+3]}let p=(E+i)/2,A=(P+d)/2,F=u/_.length,x=R/_.length;return[p,A,F,x]}function q(e){if(!(!e||e.length===0||!a)){for(let o=0;o<e.length;++o){let _=e[o];a.updateTextures({u_mask:_.getAsWebGLTexture()}),a.updateUniforms({u_poseIndex:(o+1)/y}),a.draw({skipClear:o>0}),_.close()}s.updateTextures({u_poseMask:S})}}function J(e){if(!n)return;let o=e.length,_=o*r;for(let i=0;i<o;++i){let P=e[i];for(let k=0;k<c;++k){let G=P[k],g=(i*r+k)*4;n[g]=G.x,n[g+1]=1-G.y,n[g+2]=G.z??0,n[g+3]=G.visibility??1}let d=O(n,i,ee),u=(i*r+t.BODY_CENTER)*4;n[u]=d[0],n[u+1]=d[1],n[u+2]=d[2],n[u+3]=d[3];let R=O(n,i,ne),p=(i*r+t.LEFT_HAND_CENTER)*4;n[p]=R[0],n[p+1]=R[1],n[p+2]=R[2],n[p+3]=R[3];let A=O(n,i,te),F=(i*r+t.RIGHT_HAND_CENTER)*4;n[F]=A[0],n[F+1]=A[1],n[F+2]=A[2],n[F+3]=A[3];let x=O(n,i,oe),D=(i*r+t.LEFT_FOOT_CENTER)*4;n[D]=x[0],n[D+1]=x[1],n[D+2]=x[2],n[D+3]=x[3];let T=O(n,i,ie),L=(i*r+t.RIGHT_FOOT_CENTER)*4;n[L]=T[0],n[L+1]=T[1],n[L+2]=T[2],n[L+3]=T[3];let I=O(n,i,se),M=(i*r+t.TORSO_CENTER)*4;n[M]=I[0],n[M+1]=I[1],n[M+2]=I[2],n[M+3]=I[3]}let E=Math.ceil(_/m);s.updateTextures({u_poseLandmarksTex:{data:n,width:m,height:E,isPartial:!0}})}function Y(e){!e?.landmarks||!n||(J(e.landmarks),q(e.segmentationMasks),s.updateUniforms({u_nPoses:e.landmarks.length}),$("pose:result",e))}s.on("init",async()=>{s.initializeUniform("u_maxPoses","int",y),s.initializeUniform("u_nPoses","int",0);let e=y*r;U=Math.ceil(e/m);let o=m*U*4;n=new Float32Array(o),s.initializeTexture("u_poseLandmarksTex",{data:n,width:m,height:U},{internalFormat:H.RGBA32F,type:H.FLOAT,minFilter:H.NEAREST,magFilter:H.NEAREST}),s.initializeTexture("u_poseMask",S,{preserveY:!0,minFilter:H.NEAREST,magFilter:H.NEAREST}),await b,a=new W(`#version 300 es
precision mediump float;
in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_mask;
uniform float u_poseIndex;
void main() {
	ivec2 texCoord = ivec2(v_uv * vec2(textureSize(u_mask, 0)));
	float confidence = texelFetch(u_mask, texCoord, 0).r;
	if (confidence < 0.01) discard;
	outColor = vec4(1.0, confidence, u_poseIndex, 1.0);
}`,{canvas:S}),a.initializeTexture("u_mask",re),a.initializeUniform("u_poseIndex","float",0),$("pose:ready")}),s.on("initializeTexture",(e,o)=>{e===f&&z(o)}),s.on("updateTextures",e=>{let o=e[f];o&&z(o)});let B=0;async function z(e){let o=++B;if(await b,o!==B||!l)return;K.get(f)!==e&&(v=-1),K.set(f,e);try{let E=e instanceof HTMLVideoElement?"VIDEO":"IMAGE";if(C!==E&&(C=E,await l.setOptions({runningMode:C})),e instanceof HTMLVideoElement){if(e.videoWidth===0||e.videoHeight===0||e.readyState<2)return;e.currentTime!==v&&(v=e.currentTime,Y(l.detectForVideo(e,performance.now())))}else if(e instanceof HTMLImageElement||e instanceof HTMLCanvasElement){if(e.width===0||e.height===0)return;Y(l.detect(e))}}catch(E){console.error("[Pose Plugin] Detection error:",E)}}s.on("destroy",()=>{l&&(l.close(),l=null),a&&(a.destroy(),a=null),h=null,K.clear(),n=null}),j(`
uniform int u_maxPoses;
uniform int u_nPoses;
uniform sampler2D u_poseLandmarksTex;
uniform sampler2D u_poseMask;

#define POSE_LANDMARK_LEFT_EYE ${t.LEFT_EYE}
#define POSE_LANDMARK_RIGHT_EYE ${t.RIGHT_EYE}
#define POSE_LANDMARK_LEFT_SHOULDER ${t.LEFT_SHOULDER}
#define POSE_LANDMARK_RIGHT_SHOULDER ${t.RIGHT_SHOULDER}
#define POSE_LANDMARK_LEFT_ELBOW ${t.LEFT_ELBOW}
#define POSE_LANDMARK_RIGHT_ELBOW ${t.RIGHT_ELBOW}
#define POSE_LANDMARK_LEFT_HIP ${t.LEFT_HIP}
#define POSE_LANDMARK_RIGHT_HIP ${t.RIGHT_HIP}
#define POSE_LANDMARK_LEFT_KNEE ${t.LEFT_KNEE}
#define POSE_LANDMARK_RIGHT_KNEE ${t.RIGHT_KNEE}
#define POSE_LANDMARK_BODY_CENTER ${t.BODY_CENTER}
#define POSE_LANDMARK_LEFT_HAND_CENTER ${t.LEFT_HAND_CENTER}
#define POSE_LANDMARK_RIGHT_HAND_CENTER ${t.RIGHT_HAND_CENTER}
#define POSE_LANDMARK_LEFT_FOOT_CENTER ${t.LEFT_FOOT_CENTER}
#define POSE_LANDMARK_RIGHT_FOOT_CENTER ${t.RIGHT_FOOT_CENTER}
#define POSE_LANDMARK_TORSO_CENTER ${t.TORSO_CENTER}

vec4 poseLandmark(int poseIndex, int landmarkIndex) {
	int i = poseIndex * ${r} + landmarkIndex;
	int x = i % ${m};
	int y = i / ${m};
	return texelFetch(u_poseLandmarksTex, ivec2(x, y), 0);
}

vec2 poseAt(vec2 pos) {
	vec4 mask = texture(u_poseMask, pos);
	float poseIndex = floor(mask.b * float(u_maxPoses) + 0.5) - 1.0;
	return vec2(mask.g, poseIndex);
}
	
float inPose(vec2 pos) {
	float pose = poseAt(pos).x;
	return step(0.0, pose);
}`)}}var ce=ae;export{ce as default};
//# sourceMappingURL=pose.mjs.map