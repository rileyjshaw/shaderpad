import{a as w}from"../chunk-J6JNFFXG.mjs";import"../chunk-QROQ7JVO.mjs";import{a as B,b as y,c as W,d as Y,e as H,f as z,g as V,h as X}from"../chunk-BUZPU5IY.mjs";var f=33,Z=6,d=f+Z,n={LEFT_EYE:2,RIGHT_EYE:5,LEFT_SHOULDER:11,RIGHT_SHOULDER:12,LEFT_ELBOW:13,RIGHT_ELBOW:14,LEFT_HIP:23,RIGHT_HIP:24,LEFT_KNEE:25,RIGHT_KNEE:26,LEFT_WRIST:15,RIGHT_WRIST:16,LEFT_PINKY:17,RIGHT_PINKY:18,LEFT_INDEX:19,RIGHT_INDEX:20,LEFT_THUMB:21,RIGHT_THUMB:22,LEFT_ANKLE:27,RIGHT_ANKLE:28,LEFT_HEEL:29,RIGHT_HEEL:30,LEFT_FOOT_INDEX:31,RIGHT_FOOT_INDEX:32,BODY_CENTER:f,LEFT_HAND_CENTER:f+1,RIGHT_HAND_CENTER:f+2,LEFT_FOOT_CENTER:f+3,RIGHT_FOOT_CENTER:f+4,TORSO_CENTER:f+5},ee=Array.from({length:f},(O,m)=>m),te=[n.LEFT_WRIST,n.LEFT_PINKY,n.LEFT_THUMB,n.LEFT_INDEX],ne=[n.RIGHT_WRIST,n.RIGHT_PINKY,n.RIGHT_THUMB,n.RIGHT_INDEX],se=[n.LEFT_ANKLE,n.LEFT_HEEL,n.LEFT_FOOT_INDEX],ie=[n.RIGHT_ANKLE,n.RIGHT_HEEL,n.RIGHT_FOOT_INDEX],oe=[n.LEFT_SHOULDER,n.RIGHT_SHOULDER,n.LEFT_HIP,n.RIGHT_HIP],S=512,_=1,re={modelPath:"https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",maxPoses:1,minPoseDetectionConfidence:.5,minPosePresenceConfidence:.5,minTrackingConfidence:.5},ae=`#version 300 es
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
}`,b=new Map,de=new Map;function _e(O,m){let t=O.landmarks.data,i=m.length;t[0]=i;for(let o=0;o<i;++o){let T=m[o];for(let e=0;e<f;++e){let r=T[e],u=(_+o*d+e)*4;t[u]=r.x,t[u+1]=1-r.y,t[u+2]=r.z??0,t[u+3]=r.visibility??1}let L=H(t,o,ee,d,_),F=(_+o*d+n.BODY_CENTER)*4;t[F]=L[0],t[F+1]=L[1],t[F+2]=L[2],t[F+3]=L[3];let R=H(t,o,te,d,_),E=(_+o*d+n.LEFT_HAND_CENTER)*4;t[E]=R[0],t[E+1]=R[1],t[E+2]=R[2],t[E+3]=R[3];let x=H(t,o,ne,d,_),C=(_+o*d+n.RIGHT_HAND_CENTER)*4;t[C]=x[0],t[C+1]=x[1],t[C+2]=x[2],t[C+3]=x[3];let P=H(t,o,se,d,_),N=(_+o*d+n.LEFT_FOOT_CENTER)*4;t[N]=P[0],t[N+1]=P[1],t[N+2]=P[2],t[N+3]=P[3];let p=H(t,o,ie,d,_),A=(_+o*d+n.RIGHT_FOOT_CENTER)*4;t[A]=p[0],t[A+1]=p[1],t[A+2]=p[2],t[A+3]=p[3];let I=H(t,o,oe,d,_),c=(_+o*d+n.TORSO_CENTER)*4;t[c]=I[0],t[c+1]=I[1],t[c+2]=I[2],t[c+3]=I[3]}O.state.nPoses=i}function Te(O,m){let{maskShader:t,maxPoses:i}=O;if(!m||m.length===0)return t.clear();for(let o=0;o<m.length;++o){let T=m[o];t.updateTextures({u_mask:T.getAsWebGLTexture()}),t.updateUniforms({u_poseIndex:(o+1)/i}),t.step({skipClear:o>0}),T.close()}}function Ee(O){let{textureName:m,wasmBaseUrl:t=z,options:{history:i,...o}={}}=O,T={...re,...o},L=W({...T,textureName:m,wasmBaseUrl:t}),F=T.maxPoses*d+_,R=Math.ceil(F/S);return function(E,x){let{injectGLSL:C,emit:P,updateTexture:N}=x,p=b.get(L),A=p?.landmarks.data??new Float32Array(S*R*4),I=p?.mediapipeCanvas??new OffscreenCanvas(1,1),c=p?.maskShader??(()=>{let s=new w(ae,{canvas:I});return s.initializeTexture("u_mask",B),s.initializeUniform("u_poseIndex","float",0),s})(),e,r=!1,u=-1,g=[];function G(s){if(r||!e)return;let{nPoses:a}=e.state,l=a*d+_,k=Math.ceil(l/S),D=i?s:void 0;N("u_poseLandmarksTex",{data:e.landmarks.data,width:S,height:k,isPartial:!0},D),N("u_poseMask",e.maskShader,D),E.updateUniforms({u_nPoses:a},{allowMissing:!0})}function v(){r||!e||(i?(G(g.length>0?g:u),g=[]):G(u),P("pose:result",e.state.result))}function K(){if(r||!e)return;let s=e.subscribers;for(let[a,l]of s)if(l){if(a(),r)return;s.has(a)&&s.set(a,!1)}}async function q(){e=await Y(L,b,de,async()=>{let[s,{PoseLandmarker:a}]=await Promise.all([V(t),import("@mediapipe/tasks-vision")]);if(r)return;let l=await a.createFromOptions(s,{baseOptions:{modelAssetPath:T.modelPath,delegate:"GPU"},canvas:I,runningMode:"VIDEO",numPoses:T.maxPoses,minPoseDetectionConfidence:T.minPoseDetectionConfidence,minPosePresenceConfidence:T.minPosePresenceConfidence,minTrackingConfidence:T.minTrackingConfidence,outputSegmentationMasks:!0});if(r){l.close(),c.destroy();return}return{landmarker:l,mediapipeCanvas:I,maskShader:c,subscribers:new Map,maxPoses:T.maxPoses,state:{nCalls:0,runningMode:"VIDEO",source:null,videoTime:-1,resultTimestamp:0,result:null,pending:Promise.resolve(),nPoses:0},landmarks:{data:A,textureHeight:R}}}),!(!e||r)&&(c!==e.maskShader&&c.destroy(),e.subscribers.set(v,!1))}let $=q();E.on("_init",()=>{E.initializeUniform("u_maxPoses","int",T.maxPoses,{allowMissing:!0}),E.initializeUniform("u_nPoses","int",0,{allowMissing:!0}),E.initializeTexture("u_poseLandmarksTex",{data:A,width:S,height:R},{internalFormat:"RGBA32F",type:"FLOAT",minFilter:"NEAREST",magFilter:"NEAREST",history:i}),E.initializeTexture("u_poseMask",c,{minFilter:"NEAREST",magFilter:"NEAREST",history:i}),$.then(()=>{r||!e||P("pose:ready")})});function U(s){r||!e||(i&&(u=(u+1)%(i+1),G(u),g.push(u)),e.subscribers.set(v,!0),j(s))}E.on("initializeTexture",(s,a)=>{s===m&&y(a)&&U(a)}),E.on("updateTextures",s=>{let a=s[m];y(a)&&U(a)});async function j(s){let a=performance.now();if(await $,r||!e)return;let l=++e.state.nCalls;e.state.pending=e.state.pending.then(async()=>{if(r||!e||l!==e.state.nCalls)return;let k=s instanceof HTMLVideoElement?"VIDEO":"IMAGE";if(e.state.runningMode!==k&&(e.state.runningMode=k,await e.landmarker.setOptions({runningMode:k}),r||!e||l!==e.state.nCalls))return;let D=!1;if(s!==e.state.source?(e.state.source=s,e.state.videoTime=s instanceof HTMLVideoElement?s.currentTime:-1,D=!0):s instanceof HTMLVideoElement?s.currentTime!==e.state.videoTime&&(e.state.videoTime=s.currentTime,D=!0):s instanceof HTMLImageElement||a-e.state.resultTimestamp>2&&(D=!0),D){let M;if(s instanceof HTMLVideoElement){if(s.videoWidth===0||s.videoHeight===0||s.readyState<2)return;M=e.landmarker.detectForVideo(s,a)}else{if(s.width===0||s.height===0)return;M=e.landmarker.detect(s)}M&&(e.state.resultTimestamp=a,e.state.result=M,_e(e,M.landmarks),Te(e,M.segmentationMasks),K())}else e.state.result&&K()}),await e.state.pending}E.on("destroy",()=>{r=!0,e&&(e.subscribers.delete(v),e.subscribers.size===0&&(e.landmarker.close(),e.maskShader.destroy(),b.delete(L))),e=void 0});let{fn:h,historyParams:J}=X(i),Q=i?`int layer = (u_poseMaskFrameOffset - framesAgo + ${i+1}) % ${i+1};
	vec4 mask = texture(u_poseMask, vec3(pos, float(layer)));`:"vec4 mask = texture(u_poseMask, pos);";C(`
uniform int u_maxPoses;
uniform int u_nPoses;
uniform highp sampler2D${i?"Array":""} u_poseLandmarksTex;${i?`
uniform int u_poseLandmarksTexFrameOffset;`:""}
uniform mediump sampler2D${i?"Array":""} u_poseMask;${i?`
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

${h("int","nPosesAt","",i?`
	int layer = (u_poseLandmarksTexFrameOffset - framesAgo + ${i+1}) % ${i+1};
	return int(texelFetch(u_poseLandmarksTex, ivec3(0, 0, layer), 0).r + 0.5);`:`
	return int(texelFetch(u_poseLandmarksTex, ivec2(0, 0), 0).r + 0.5);`)}
${h("vec4","poseLandmark","int poseIndex, int landmarkIndex",`int i = ${_} + poseIndex * ${d} + landmarkIndex;
	int x = i % ${S};
	int y = i / ${S};${i?`
	int layer = (u_poseLandmarksTexFrameOffset - framesAgo + ${i+1}) % ${i+1};
	return texelFetch(u_poseLandmarksTex, ivec3(x, y, layer), 0);`:`
	return texelFetch(u_poseLandmarksTex, ivec2(x, y), 0);`}`)}
${h("vec2","poseAt","vec2 pos",`${Q}
	float poseIndex = floor(mask.b * float(u_maxPoses) + 0.5) - 1.0;
	return vec2(mask.g, poseIndex);`)}
${h("float","inPose","vec2 pos",`vec2 pose = poseAt(pos${J}); return step(0.0, pose.y) * pose.x;`)}`)}}var Le=Ee;export{Le as default};
//# sourceMappingURL=pose.mjs.map