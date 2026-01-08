import{a as b}from"../chunk-RKULNJXI.mjs";var T=33,Z=6,r=T+Z,n={LEFT_EYE:2,RIGHT_EYE:5,LEFT_SHOULDER:11,RIGHT_SHOULDER:12,LEFT_ELBOW:13,RIGHT_ELBOW:14,LEFT_HIP:23,RIGHT_HIP:24,LEFT_KNEE:25,RIGHT_KNEE:26,LEFT_WRIST:15,RIGHT_WRIST:16,LEFT_PINKY:17,RIGHT_PINKY:18,LEFT_INDEX:19,RIGHT_INDEX:20,LEFT_THUMB:21,RIGHT_THUMB:22,LEFT_ANKLE:27,RIGHT_ANKLE:28,LEFT_HEEL:29,RIGHT_HEEL:30,LEFT_FOOT_INDEX:31,RIGHT_FOOT_INDEX:32,BODY_CENTER:T,LEFT_HAND_CENTER:T+1,RIGHT_HAND_CENTER:T+2,LEFT_FOOT_CENTER:T+3,RIGHT_FOOT_CENTER:T+4,TORSO_CENTER:T+5},q=Array.from({length:T},(w,D)=>D),J=[n.LEFT_WRIST,n.LEFT_PINKY,n.LEFT_THUMB,n.LEFT_INDEX],Q=[n.RIGHT_WRIST,n.RIGHT_PINKY,n.RIGHT_THUMB,n.RIGHT_INDEX],ee=[n.LEFT_ANKLE,n.LEFT_HEEL,n.LEFT_FOOT_INDEX],ne=[n.RIGHT_ANKLE,n.RIGHT_HEEL,n.RIGHT_FOOT_INDEX],te=[n.LEFT_SHOULDER,n.RIGHT_SHOULDER,n.LEFT_HIP,n.RIGHT_HIP],Y={data:new Uint8Array(4),width:1,height:1};function oe(w){let{textureName:D,options:d}=w,B="https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";return function(a,z){let{injectGLSL:W,gl:N}=z,c=null,G=null,h=-1,C="VIDEO",v=new Map,K=d?.maxPoses??1,m=512,y=0,e=null,U=new OffscreenCanvas(1,1),s=null;async function X(){try{let{FilesetResolver:o,PoseLandmarker:t}=await import("@mediapipe/tasks-vision");G=await o.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"),c=await t.createFromOptions(G,{baseOptions:{modelAssetPath:d?.modelPath||B,delegate:"GPU"},canvas:U,runningMode:C,numPoses:d?.maxPoses??1,minPoseDetectionConfidence:d?.minPoseDetectionConfidence??.5,minPosePresenceConfidence:d?.minPosePresenceConfidence??.5,minTrackingConfidence:d?.minTrackingConfidence??.5,outputSegmentationMasks:!0})}catch(o){throw console.error("[Pose Plugin] Failed to initialize:",o),o}}function H(o,t,u){let E=1/0,i=-1/0,P=1/0,l=-1/0,R=0,L=0;for(let x of u){let _=(t*r+x)*4,I=o[_],f=o[_+1];E=Math.min(E,I),i=Math.max(i,I),P=Math.min(P,f),l=Math.max(l,f),R+=o[_+2],L+=o[_+3]}let O=(E+i)/2,p=(P+l)/2,A=R/u.length,F=L/u.length;return[O,p,A,F]}function V(o){if(!(!o||o.length===0||!s)){for(let t=0;t<o.length;++t){let u=o[t];s.updateTextures({u_mask:u.getAsWebGLTexture()}),s.updateUniforms({u_poseIndex:(t+1)/K}),s.draw(t===0)}a.updateTextures({u_poseMask:U})}}function j(o){if(!e)return;let t=o.length,u=t*r;for(let i=0;i<t;++i){let P=o[i];for(let k=0;k<T;++k){let M=P[k],g=(i*r+k)*4;e[g]=M.x,e[g+1]=1-M.y,e[g+2]=M.z??0,e[g+3]=M.visibility??1}let l=H(e,i,q),R=(i*r+n.BODY_CENTER)*4;e[R]=l[0],e[R+1]=l[1],e[R+2]=l[2],e[R+3]=l[3];let L=H(e,i,J),O=(i*r+n.LEFT_HAND_CENTER)*4;e[O]=L[0],e[O+1]=L[1],e[O+2]=L[2],e[O+3]=L[3];let p=H(e,i,Q),A=(i*r+n.RIGHT_HAND_CENTER)*4;e[A]=p[0],e[A+1]=p[1],e[A+2]=p[2],e[A+3]=p[3];let F=H(e,i,ee),x=(i*r+n.LEFT_FOOT_CENTER)*4;e[x]=F[0],e[x+1]=F[1],e[x+2]=F[2],e[x+3]=F[3];let _=H(e,i,ne),I=(i*r+n.RIGHT_FOOT_CENTER)*4;e[I]=_[0],e[I+1]=_[1],e[I+2]=_[2],e[I+3]=_[3];let f=H(e,i,te),S=(i*r+n.TORSO_CENTER)*4;e[S]=f[0],e[S+1]=f[1],e[S+2]=f[2],e[S+3]=f[3]}let E=Math.ceil(u/m);a.updateTextures({u_poseLandmarksTex:{data:e,width:m,height:E,isPartial:!0}})}function $(o){if(!o.landmarks||!e)return;s||(s=new b(`#version 300 es
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
					}`,{canvas:U}),s.initializeTexture("u_mask",Y),s.initializeUniform("u_poseIndex","float",0));let t=o.landmarks.length;j(o.landmarks),V(o.segmentationMasks),a.updateUniforms({u_nPoses:t}),d?.onResults?.(o)}a.registerHook("init",async()=>{a.initializeTexture("u_poseMask",Y,{preserveY:!0,minFilter:N.NEAREST,magFilter:N.NEAREST}),a.initializeUniform("u_maxPoses","int",K),a.initializeUniform("u_nPoses","int",0);let o=K*r;y=Math.ceil(o/m);let t=m*y*4;e=new Float32Array(t),a.initializeTexture("u_poseLandmarksTex",{data:e,width:m,height:y},{internalFormat:N.RGBA32F,type:N.FLOAT,minFilter:N.NEAREST,magFilter:N.NEAREST}),await X()}),a.registerHook("updateTextures",async o=>{let t=o[D];if(!(!t||(v.get(D)!==t&&(h=-1),v.set(D,t),!c)))try{let E=t instanceof HTMLVideoElement?"VIDEO":"IMAGE";if(C!==E&&(C=E,await c.setOptions({runningMode:C})),t instanceof HTMLVideoElement){if(t.videoWidth===0||t.videoHeight===0||t.readyState<2)return;if(t.currentTime!==h){h=t.currentTime;let i=c.detectForVideo(t,performance.now());$(i)}}else if(t instanceof HTMLImageElement||t instanceof HTMLCanvasElement){if(t.width===0||t.height===0)return;let i=c.detect(t);$(i)}}catch(E){console.error("[Pose Plugin] Detection error:",E)}}),a.registerHook("destroy",()=>{c&&(c.close(),c=null),s&&(s.destroy(),s=null),G=null,v.clear(),e=null}),W(`
uniform int u_maxPoses;
uniform int u_nPoses;
uniform sampler2D u_poseLandmarksTex;
uniform sampler2D u_poseMask;

#define POSE_LANDMARK_LEFT_EYE ${n.LEFT_EYE}
#define POSE_LANDMARK_RIGHT_EYE ${n.RIGHT_EYE}
#define POSE_LANDMARK_LEFT_SHOULDER ${n.LEFT_SHOULDER}
#define POSE_LANDMARK_RIGHT_SHOULDER ${n.RIGHT_SHOULDER}
#define POSE_LANDMARK_LEFT_ELBOW ${n.LEFT_ELBOW}
#define POSE_LANDMARK_RIGHT_ELBOW ${n.RIGHT_ELBOW}
#define POSE_LANDMARK_LEFT_HIP ${n.LEFT_HIP}
#define POSE_LANDMARK_RIGHT_HIP ${n.RIGHT_HIP}
#define POSE_LANDMARK_LEFT_KNEE ${n.LEFT_KNEE}
#define POSE_LANDMARK_RIGHT_KNEE ${n.RIGHT_KNEE}
#define POSE_LANDMARK_BODY_CENTER ${n.BODY_CENTER}
#define POSE_LANDMARK_LEFT_HAND_CENTER ${n.LEFT_HAND_CENTER}
#define POSE_LANDMARK_RIGHT_HAND_CENTER ${n.RIGHT_HAND_CENTER}
#define POSE_LANDMARK_LEFT_FOOT_CENTER ${n.LEFT_FOOT_CENTER}
#define POSE_LANDMARK_RIGHT_FOOT_CENTER ${n.RIGHT_FOOT_CENTER}
#define POSE_LANDMARK_TORSO_CENTER ${n.TORSO_CENTER}

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
}`)}}var ae=oe;export{ae as default};
//# sourceMappingURL=pose.mjs.map