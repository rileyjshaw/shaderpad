import{a as w}from"../chunk-PZ4UVAHU.mjs";import"../chunk-QROQ7JVO.mjs";import{a as B,b as y,c as W,d as Y,e as H,f as z,g as V,h as X}from"../chunk-BUZPU5IY.mjs";var f=33,ee=6,r=f+ee,n={LEFT_EYE:2,RIGHT_EYE:5,LEFT_SHOULDER:11,RIGHT_SHOULDER:12,LEFT_ELBOW:13,RIGHT_ELBOW:14,LEFT_HIP:23,RIGHT_HIP:24,LEFT_KNEE:25,RIGHT_KNEE:26,LEFT_WRIST:15,RIGHT_WRIST:16,LEFT_PINKY:17,RIGHT_PINKY:18,LEFT_INDEX:19,RIGHT_INDEX:20,LEFT_THUMB:21,RIGHT_THUMB:22,LEFT_ANKLE:27,RIGHT_ANKLE:28,LEFT_HEEL:29,RIGHT_HEEL:30,LEFT_FOOT_INDEX:31,RIGHT_FOOT_INDEX:32,BODY_CENTER:f,LEFT_HAND_CENTER:f+1,RIGHT_HAND_CENTER:f+2,LEFT_FOOT_CENTER:f+3,RIGHT_FOOT_CENTER:f+4,TORSO_CENTER:f+5},te=Array.from({length:f},(O,E)=>E),ne=[n.LEFT_WRIST,n.LEFT_PINKY,n.LEFT_THUMB,n.LEFT_INDEX],se=[n.RIGHT_WRIST,n.RIGHT_PINKY,n.RIGHT_THUMB,n.RIGHT_INDEX],ie=[n.LEFT_ANKLE,n.LEFT_HEEL,n.LEFT_FOOT_INDEX],oe=[n.RIGHT_ANKLE,n.RIGHT_HEEL,n.RIGHT_FOOT_INDEX],re=[n.LEFT_SHOULDER,n.RIGHT_SHOULDER,n.LEFT_HIP,n.RIGHT_HIP],S=512,a=1,ae={modelPath:"https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",maxPoses:1,minPoseDetectionConfidence:.5,minPosePresenceConfidence:.5,minTrackingConfidence:.5},de=`#version 300 es
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
}`,K=new Map,_e=new Map;function Te(O,E){let t=O.landmarks.data,i=E.length;t[0]=i;for(let o=0;o<i;++o){let d=E[o];for(let e=0;e<f;++e){let c=d[e],m=(a+o*r+e)*4;t[m]=c.x,t[m+1]=1-c.y,t[m+2]=c.z??0,t[m+3]=c.visibility??1}let L=H(t,o,te,r,a),F=(a+o*r+n.BODY_CENTER)*4;t[F]=L[0],t[F+1]=L[1],t[F+2]=L[2],t[F+3]=L[3];let R=H(t,o,ne,r,a),_=(a+o*r+n.LEFT_HAND_CENTER)*4;t[_]=R[0],t[_+1]=R[1],t[_+2]=R[2],t[_+3]=R[3];let x=H(t,o,se,r,a),C=(a+o*r+n.RIGHT_HAND_CENTER)*4;t[C]=x[0],t[C+1]=x[1],t[C+2]=x[2],t[C+3]=x[3];let P=H(t,o,ie,r,a),N=(a+o*r+n.LEFT_FOOT_CENTER)*4;t[N]=P[0],t[N+1]=P[1],t[N+2]=P[2],t[N+3]=P[3];let p=H(t,o,oe,r,a),A=(a+o*r+n.RIGHT_FOOT_CENTER)*4;t[A]=p[0],t[A+1]=p[1],t[A+2]=p[2],t[A+3]=p[3];let I=H(t,o,re,r,a),u=(a+o*r+n.TORSO_CENTER)*4;t[u]=I[0],t[u+1]=I[1],t[u+2]=I[2],t[u+3]=I[3]}O.state.nPoses=i}function Ee(O,E){let{maskShader:t,maxPoses:i}=O;if(!E||E.length===0)return t.clear();for(let o=0;o<E.length;++o){let d=E[o];t.updateTextures({u_mask:d.getAsWebGLTexture()}),t.updateUniforms({u_poseIndex:(o+1)/i}),t.step({skipClear:o>0}),d.close()}}function me(O){let{textureName:E,wasmBaseUrl:t=z,options:{history:i,...o}={}}=O,d={...ae,...o},L=W({...d,textureName:E,wasmBaseUrl:t}),F=d.maxPoses*r+a,R=Math.ceil(F/S);return function(_,x){let{injectGLSL:C,emit:P,updateTexture:N}=x,p=K.get(L),A=p?.landmarks.data??new Float32Array(S*R*4),I=p?.mediapipeCanvas??new OffscreenCanvas(1,1),u=p?.maskShader??(()=>{let s=new w(de,{canvas:I});return s.initializeTexture("u_mask",B),s.initializeUniform("u_poseIndex","float",0),s})(),e,c=!1,m=-1,g=[];function v(s){if(!e)return;let{nPoses:T}=e.state,k=T*r+a,M=Math.ceil(k/S),D=i?s:void 0;N("u_poseLandmarksTex",{data:e.landmarks.data,width:S,height:M,isPartial:!0},D),N("u_poseMask",e.maskShader,D),_.updateUniforms({u_nPoses:T},{allowMissing:!0})}function b(){i?(v(g.length>0?g:m),g=[]):v(m),P("pose:result",e.state.result)}async function q(){e=await Y(L,K,_e,async()=>{let[s,{PoseLandmarker:T}]=await Promise.all([V(t),import("@mediapipe/tasks-vision")]);if(c)return;let k=await T.createFromOptions(s,{baseOptions:{modelAssetPath:d.modelPath,delegate:"GPU"},canvas:I,runningMode:"VIDEO",numPoses:d.maxPoses,minPoseDetectionConfidence:d.minPoseDetectionConfidence,minPosePresenceConfidence:d.minPosePresenceConfidence,minTrackingConfidence:d.minTrackingConfidence,outputSegmentationMasks:!0});if(c){k.close(),u.destroy();return}return{landmarker:k,mediapipeCanvas:I,maskShader:u,subscribers:new Map,maxPoses:d.maxPoses,state:{nCalls:0,runningMode:"VIDEO",source:null,videoTime:-1,resultTimestamp:0,result:null,pending:Promise.resolve(),nPoses:0},landmarks:{data:A,textureHeight:R}}}),!(!e||c)&&(u!==e.maskShader&&u.destroy(),e.subscribers.set(b,!1))}let $=q();_.on("_init",()=>{_.initializeUniform("u_maxPoses","int",d.maxPoses,{allowMissing:!0}),_.initializeUniform("u_nPoses","int",0,{allowMissing:!0}),_.initializeTexture("u_poseLandmarksTex",{data:A,width:S,height:R},{internalFormat:"RGBA32F",type:"FLOAT",minFilter:"NEAREST",magFilter:"NEAREST",history:i}),_.initializeTexture("u_poseMask",u,{minFilter:"NEAREST",magFilter:"NEAREST",history:i}),$.then(()=>{c||!e||P("pose:ready")})});function U(s){e&&(i&&(m=(m+1)%(i+1),v(m),g.push(m)),e.subscribers.set(b,!0),j(s))}_.on("initializeTexture",(s,T)=>{s===E&&y(T)&&U(T)}),_.on("updateTextures",s=>{let T=s[E];y(T)&&U(T)});async function j(s){let T=performance.now();if(await $,!e)return;let k=++e.state.nCalls;e.state.pending=e.state.pending.then(async()=>{if(!e||k!==e.state.nCalls)return;let M=s instanceof HTMLVideoElement?"VIDEO":"IMAGE";e.state.runningMode!==M&&(e.state.runningMode=M,await e.landmarker.setOptions({runningMode:M}));let D=!1;if(s!==e.state.source?(e.state.source=s,e.state.videoTime=s instanceof HTMLVideoElement?s.currentTime:-1,D=!0):s instanceof HTMLVideoElement?s.currentTime!==e.state.videoTime&&(e.state.videoTime=s.currentTime,D=!0):s instanceof HTMLImageElement||T-e.state.resultTimestamp>2&&(D=!0),D){let l;if(s instanceof HTMLVideoElement){if(s.videoWidth===0||s.videoHeight===0||s.readyState<2)return;l=e.landmarker.detectForVideo(s,T)}else{if(s.width===0||s.height===0)return;l=e.landmarker.detect(s)}if(l){e.state.resultTimestamp=T,e.state.result=l,Te(e,l.landmarks),Ee(e,l.segmentationMasks);for(let[G,Z]of e.subscribers.entries())Z&&(G(),e.subscribers.set(G,!1))}}else if(e.state.result)for(let[l,G]of e.subscribers.entries())G&&(l(),e.subscribers.set(l,!1))}),await e.state.pending}_.on("destroy",()=>{c=!0,e&&(e.subscribers.delete(b),e.subscribers.size===0&&(e.landmarker.close(),e.maskShader.destroy(),K.delete(L))),e=void 0});let{fn:h,historyParams:J}=X(i),Q=i?`int layer = (u_poseMaskFrameOffset - framesAgo + ${i+1}) % ${i+1};
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
${h("vec4","poseLandmark","int poseIndex, int landmarkIndex",`int i = ${a} + poseIndex * ${r} + landmarkIndex;
	int x = i % ${S};
	int y = i / ${S};${i?`
	int layer = (u_poseLandmarksTexFrameOffset - framesAgo + ${i+1}) % ${i+1};
	return texelFetch(u_poseLandmarksTex, ivec3(x, y, layer), 0);`:`
	return texelFetch(u_poseLandmarksTex, ivec2(x, y), 0);`}`)}
${h("vec2","poseAt","vec2 pos",`${Q}
	float poseIndex = floor(mask.b * float(u_maxPoses) + 0.5) - 1.0;
	return vec2(mask.g, poseIndex);`)}
${h("float","inPose","vec2 pos",`vec2 pose = poseAt(pos${J}); return step(0.0, pose.y) * pose.x;`)}`)}}var Re=me;export{Re as default};
//# sourceMappingURL=pose.mjs.map