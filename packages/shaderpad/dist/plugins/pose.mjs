import{a as U}from"../chunk-3NP6CI7D.mjs";import"../chunk-QROQ7JVO.mjs";import{a as w,b,c as B,d as Y,e as D,f as z,g as W}from"../chunk-SFJM5TUM.mjs";var l=33,Q=6,o=l+Q,n={LEFT_EYE:2,RIGHT_EYE:5,LEFT_SHOULDER:11,RIGHT_SHOULDER:12,LEFT_ELBOW:13,RIGHT_ELBOW:14,LEFT_HIP:23,RIGHT_HIP:24,LEFT_KNEE:25,RIGHT_KNEE:26,LEFT_WRIST:15,RIGHT_WRIST:16,LEFT_PINKY:17,RIGHT_PINKY:18,LEFT_INDEX:19,RIGHT_INDEX:20,LEFT_THUMB:21,RIGHT_THUMB:22,LEFT_ANKLE:27,RIGHT_ANKLE:28,LEFT_HEEL:29,RIGHT_HEEL:30,LEFT_FOOT_INDEX:31,RIGHT_FOOT_INDEX:32,BODY_CENTER:l,LEFT_HAND_CENTER:l+1,RIGHT_HAND_CENTER:l+2,LEFT_FOOT_CENTER:l+3,RIGHT_FOOT_CENTER:l+4,TORSO_CENTER:l+5},Z=Array.from({length:l},(I,_)=>_),ee=[n.LEFT_WRIST,n.LEFT_PINKY,n.LEFT_THUMB,n.LEFT_INDEX],te=[n.RIGHT_WRIST,n.RIGHT_PINKY,n.RIGHT_THUMB,n.RIGHT_INDEX],ne=[n.LEFT_ANKLE,n.LEFT_HEEL,n.LEFT_FOOT_INDEX],se=[n.RIGHT_ANKLE,n.RIGHT_HEEL,n.RIGHT_FOOT_INDEX],ie=[n.LEFT_SHOULDER,n.RIGHT_SHOULDER,n.LEFT_HIP,n.RIGHT_HIP],A=512,r=1,oe={modelPath:"https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",maxPoses:1,minPoseDetectionConfidence:.5,minPosePresenceConfidence:.5,minTrackingConfidence:.5},re=`#version 300 es
precision mediump float;
in vec2 v_uv;
out vec4 outColor;
uniform mediump sampler2D u_mask;
uniform float u_poseIndex;
void main() {
	ivec2 texCoord = ivec2(vec2(v_uv.x, 1.0 - v_uv.y) * vec2(textureSize(u_mask, 0)));
	float confidence = texelFetch(u_mask, texCoord, 0).r;
	if (confidence < 0.01) discard;
	outColor = vec4(1.0, confidence, u_poseIndex, 1.0);
}`,y=new Map,ae=new Map;function de(I,_){let e=I.landmarks.data,O=_.length;e[0]=O;for(let s=0;s<O;++s){let f=_[s];for(let m=0;m<l;++m){let T=f[m],u=(r+s*o+m)*4;e[u]=T.x,e[u+1]=1-T.y,e[u+2]=T.z??0,e[u+3]=T.visibility??1}let H=D(e,s,Z,o,r),R=(r+s*o+n.BODY_CENTER)*4;e[R]=H[0],e[R+1]=H[1],e[R+2]=H[2],e[R+3]=H[3];let a=D(e,s,ee,o,r),F=(r+s*o+n.LEFT_HAND_CENTER)*4;e[F]=a[0],e[F+1]=a[1],e[F+2]=a[2],e[F+3]=a[3];let S=D(e,s,te,o,r),P=(r+s*o+n.RIGHT_HAND_CENTER)*4;e[P]=S[0],e[P+1]=S[1],e[P+2]=S[2],e[P+3]=S[3];let x=D(e,s,ne,o,r),L=(r+s*o+n.LEFT_FOOT_CENTER)*4;e[L]=x[0],e[L+1]=x[1],e[L+2]=x[2],e[L+3]=x[3];let N=D(e,s,se,o,r),p=(r+s*o+n.RIGHT_FOOT_CENTER)*4;e[p]=N[0],e[p+1]=N[1],e[p+2]=N[2],e[p+3]=N[3];let E=D(e,s,ie,o,r),t=(r+s*o+n.TORSO_CENTER)*4;e[t]=E[0],e[t+1]=E[1],e[t+2]=E[2],e[t+3]=E[3]}I.state.nPoses=O}function _e(I,_){let{maskShader:e,maxPoses:O}=I;if(!_||_.length===0)return e.clear();for(let s=0;s<_.length;++s){let f=_[s];e.updateTextures({u_mask:f.getAsWebGLTexture()}),e.updateUniforms({u_poseIndex:(s+1)/O}),e.step({skipClear:s>0}),f.close()}}function Te(I){let{textureName:_,options:{history:e,...O}={}}=I,s={...oe,...O},f=B({...s,textureName:_}),H=s.maxPoses*o+r,R=Math.ceil(H/A);return function(a,F){let{injectGLSL:S,emitHook:P,updateTexturesInternal:x}=F,L=y.get(f),N=L?.landmarks.data??new Float32Array(A*R*4),p=L?.mediapipeCanvas??new OffscreenCanvas(1,1),E=L?.maskShader??(()=>{let i=new U(re,{canvas:p});return i.initializeTexture("u_mask",w),i.initializeUniform("u_poseIndex","float",0),i})(),t,m=!1,T=-1,u=[];function G(i){if(!t)return;let{nPoses:d}=t.state,C=d*o+r,k=Math.ceil(C/A);x({u_poseLandmarksTex:{data:t.landmarks.data,width:A,height:k,isPartial:!0},u_poseMask:t.maskShader},e?i:void 0),a.updateUniforms({u_nPoses:d},{allowMissing:!0})}function v(){e?(G(u.length>0?u:T),u=[]):G(T),P("pose:result",t.state.result)}async function V(){t=await Y(f,y,ae,async()=>{let[i,{PoseLandmarker:d}]=await Promise.all([z(),import("@mediapipe/tasks-vision")]);if(m)return;let C=await d.createFromOptions(i,{baseOptions:{modelAssetPath:s.modelPath,delegate:"GPU"},canvas:p,runningMode:"VIDEO",numPoses:s.maxPoses,minPoseDetectionConfidence:s.minPoseDetectionConfidence,minPosePresenceConfidence:s.minPosePresenceConfidence,minTrackingConfidence:s.minTrackingConfidence,outputSegmentationMasks:!0});if(m){C.close(),E.destroy();return}return{landmarker:C,mediapipeCanvas:p,maskShader:E,subscribers:new Map,maxPoses:s.maxPoses,state:{nCalls:0,runningMode:"VIDEO",source:null,videoTime:-1,resultTimestamp:0,result:null,pending:Promise.resolve(),nPoses:0},landmarks:{data:N,textureHeight:R}}}),!(!t||m)&&(E!==t.maskShader&&E.destroy(),t.subscribers.set(v,!1))}let K=V();a.on("_init",()=>{a.initializeUniform("u_maxPoses","int",s.maxPoses,{allowMissing:!0}),a.initializeUniform("u_nPoses","int",0,{allowMissing:!0}),a.initializeTexture("u_poseLandmarksTex",{data:N,width:A,height:R},{internalFormat:"RGBA32F",type:"FLOAT",minFilter:"NEAREST",magFilter:"NEAREST",history:e}),a.initializeTexture("u_poseMask",E,{minFilter:"NEAREST",magFilter:"NEAREST",history:e}),K.then(()=>{m||!t||P("pose:ready")})});function $(i){t&&(e&&(T=(T+1)%(e+1),G(T),u.push(T)),t.subscribers.set(v,!0),X(i))}a.on("initializeTexture",(i,d)=>{i===_&&b(d)&&$(d)}),a.on("updateTextures",i=>{let d=i[_];b(d)&&$(d)});async function X(i){let d=performance.now();if(await K,!t)return;let C=++t.state.nCalls;t.state.pending=t.state.pending.then(async()=>{if(!t||C!==t.state.nCalls)return;let k=i instanceof HTMLVideoElement?"VIDEO":"IMAGE";t.state.runningMode!==k&&(t.state.runningMode=k,await t.landmarker.setOptions({runningMode:k}));let g=!1;if(i!==t.state.source?(t.state.source=i,t.state.videoTime=i instanceof HTMLVideoElement?i.currentTime:-1,g=!0):i instanceof HTMLVideoElement?i.currentTime!==t.state.videoTime&&(t.state.videoTime=i.currentTime,g=!0):i instanceof HTMLImageElement||d-t.state.resultTimestamp>2&&(g=!0),g){let c;if(i instanceof HTMLVideoElement){if(i.videoWidth===0||i.videoHeight===0||i.readyState<2)return;c=t.landmarker.detectForVideo(i,d)}else{if(i.width===0||i.height===0)return;c=t.landmarker.detect(i)}if(c){t.state.resultTimestamp=d,t.state.result=c,de(t,c.landmarks),_e(t,c.segmentationMasks);for(let[h,J]of t.subscribers.entries())J&&(h(),t.subscribers.set(h,!1))}}else if(t.state.result)for(let[c,h]of t.subscribers.entries())h&&(c(),t.subscribers.set(c,!1))}),await t.state.pending}a.on("destroy",()=>{m=!0,t&&(t.subscribers.delete(v),t.subscribers.size===0&&(t.landmarker.close(),t.maskShader.destroy(),y.delete(f))),t=void 0});let{fn:M,historyParams:q}=W(e),j=e?`int layer = (u_poseMaskFrameOffset - framesAgo + ${e+1}) % ${e+1};
	vec4 mask = texture(u_poseMask, vec3(pos, float(layer)));`:"vec4 mask = texture(u_poseMask, pos);";S(`
uniform int u_maxPoses;
uniform int u_nPoses;
uniform highp sampler2D${e?"Array":""} u_poseLandmarksTex;${e?`
uniform int u_poseLandmarksTexFrameOffset;`:""}
uniform mediump sampler2D${e?"Array":""} u_poseMask;${e?`
uniform int u_poseMaskFrameOffset;`:""}

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

${M("int","nPosesAt","",e?`
	int layer = (u_poseLandmarksTexFrameOffset - framesAgo + ${e+1}) % ${e+1};
	return int(texelFetch(u_poseLandmarksTex, ivec3(0, 0, layer), 0).r + 0.5);`:`
	return int(texelFetch(u_poseLandmarksTex, ivec2(0, 0), 0).r + 0.5);`)}
${M("vec4","poseLandmark","int poseIndex, int landmarkIndex",`int i = ${r} + poseIndex * ${o} + landmarkIndex;
	int x = i % ${A};
	int y = i / ${A};${e?`
	int layer = (u_poseLandmarksTexFrameOffset - framesAgo + ${e+1}) % ${e+1};
	return texelFetch(u_poseLandmarksTex, ivec3(x, y, layer), 0);`:`
	return texelFetch(u_poseLandmarksTex, ivec2(x, y), 0);`}`)}
${M("vec2","poseAt","vec2 pos",`${j}
	float poseIndex = floor(mask.b * float(u_maxPoses) + 0.5) - 1.0;
	return vec2(mask.g, poseIndex);`)}
${M("float","inPose","vec2 pos",`vec2 pose = poseAt(pos${q}); return step(0.0, pose.y) * pose.x;`)}`)}}var fe=Te;export{fe as default};
//# sourceMappingURL=pose.mjs.map