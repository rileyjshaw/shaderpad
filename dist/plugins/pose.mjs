import{a as $}from"../chunk-OIM5PVRI.mjs";import{a as b,b as G,c as U,d as P,e as w,f as B}from"../chunk-JRSBIGBN.mjs";var m=33,z=6,o=m+z,n={LEFT_EYE:2,RIGHT_EYE:5,LEFT_SHOULDER:11,RIGHT_SHOULDER:12,LEFT_ELBOW:13,RIGHT_ELBOW:14,LEFT_HIP:23,RIGHT_HIP:24,LEFT_KNEE:25,RIGHT_KNEE:26,LEFT_WRIST:15,RIGHT_WRIST:16,LEFT_PINKY:17,RIGHT_PINKY:18,LEFT_INDEX:19,RIGHT_INDEX:20,LEFT_THUMB:21,RIGHT_THUMB:22,LEFT_ANKLE:27,RIGHT_ANKLE:28,LEFT_HEEL:29,RIGHT_HEEL:30,LEFT_FOOT_INDEX:31,RIGHT_FOOT_INDEX:32,BODY_CENTER:m,LEFT_HAND_CENTER:m+1,RIGHT_HAND_CENTER:m+2,LEFT_FOOT_CENTER:m+3,RIGHT_FOOT_CENTER:m+4,TORSO_CENTER:m+5},X=Array.from({length:m},(L,_)=>_),V=[n.LEFT_WRIST,n.LEFT_PINKY,n.LEFT_THUMB,n.LEFT_INDEX],q=[n.RIGHT_WRIST,n.RIGHT_PINKY,n.RIGHT_THUMB,n.RIGHT_INDEX],j=[n.LEFT_ANKLE,n.LEFT_HEEL,n.LEFT_FOOT_INDEX],J=[n.RIGHT_ANKLE,n.RIGHT_HEEL,n.RIGHT_FOOT_INDEX],Q=[n.LEFT_SHOULDER,n.RIGHT_SHOULDER,n.LEFT_HIP,n.RIGHT_HIP],A=512,a=1,Z={modelPath:"https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",maxPoses:1,minPoseDetectionConfidence:.5,minPosePresenceConfidence:.5,minTrackingConfidence:.5},ee=`#version 300 es
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
}`,C=new Map;function te(L,_){let e=L.landmarks.data,R=_.length;e[0]=R;for(let s=0;s<R;++s){let T=_[s];for(let d=0;d<m;++d){let x=T[d],N=(a+s*o+d)*4;e[N]=x.x,e[N+1]=1-x.y,e[N+2]=x.z??0,e[N+3]=x.visibility??1}let D=P(e,s,X,o,a),c=(a+s*o+n.BODY_CENTER)*4;e[c]=D[0],e[c+1]=D[1],e[c+2]=D[2],e[c+3]=D[3];let r=P(e,s,V,o,a),F=(a+s*o+n.LEFT_HAND_CENTER)*4;e[F]=r[0],e[F+1]=r[1],e[F+2]=r[2],e[F+3]=r[3];let k=P(e,s,q,o,a),p=(a+s*o+n.RIGHT_HAND_CENTER)*4;e[p]=k[0],e[p+1]=k[1],e[p+2]=k[2],e[p+3]=k[3];let u=P(e,s,j,o,a),I=(a+s*o+n.LEFT_FOOT_CENTER)*4;e[I]=u[0],e[I+1]=u[1],e[I+2]=u[2],e[I+3]=u[3];let l=P(e,s,J,o,a),f=(a+s*o+n.RIGHT_FOOT_CENTER)*4;e[f]=l[0],e[f+1]=l[1],e[f+2]=l[2],e[f+3]=l[3];let t=P(e,s,Q,o,a),O=(a+s*o+n.TORSO_CENTER)*4;e[O]=t[0],e[O+1]=t[1],e[O+2]=t[2],e[O+3]=t[3]}L.state.nPoses=R}function ne(L,_){if(!_||_.length===0)return;let{maskShader:e,maxPoses:R}=L;for(let s=0;s<_.length;++s){let T=_[s];e.updateTextures({u_mask:T.getAsWebGLTexture()}),e.updateUniforms({u_poseIndex:(s+1)/R}),e.draw({skipClear:s>0}),T.close()}}function se(L){let{textureName:_,options:{history:e,...R}={}}=L,s={...Z,...R},T=U({...s,textureName:_}),D=s.maxPoses*o+a,c=Math.ceil(D/A);return function(r,F){let{injectGLSL:k,emitHook:p}=F,u=C.get(T),I=u?.landmarks.data??new Float32Array(A*c*4),l=u?.mediapipeCanvas??new OffscreenCanvas(1,1),f=u?.maskShader??(()=>{let i=new $(ee,{canvas:l});return i.initializeTexture("u_mask",b),i.initializeUniform("u_poseIndex","float",0),i})(),t=null,O=!1;function d(){if(!t)return;let{nPoses:i}=t.state,E=i*o+a,H=Math.ceil(E/A);r.updateTextures({u_poseLandmarksTex:{data:t.landmarks.data,width:A,height:H,isPartial:!0},u_poseMask:f},{skipHistoryWrite:O}),r.updateUniforms({u_nPoses:i}),p("pose:result",t.state.result)}async function x(){if(C.has(T))t=C.get(T);else{let[i,{PoseLandmarker:E}]=await Promise.all([w(),import("@mediapipe/tasks-vision")]);t={landmarker:await E.createFromOptions(i,{baseOptions:{modelAssetPath:s.modelPath,delegate:"GPU"},canvas:l,runningMode:"VIDEO",numPoses:s.maxPoses,minPoseDetectionConfidence:s.minPoseDetectionConfidence,minPosePresenceConfidence:s.minPosePresenceConfidence,minTrackingConfidence:s.minTrackingConfidence,outputSegmentationMasks:!0}),mediapipeCanvas:l,maskShader:f,subscribers:new Map,maxPoses:s.maxPoses,state:{runningMode:"VIDEO",source:null,videoTime:-1,resultTimestamp:0,result:null,pending:Promise.resolve(),nPoses:0},landmarks:{data:I,textureHeight:c}},C.set(T,t)}t.subscribers.set(d,!1)}let N=x();r.on("init",()=>{r.initializeUniform("u_maxPoses","int",s.maxPoses),r.initializeUniform("u_nPoses","int",0),r.initializeTexture("u_poseLandmarksTex",{data:I,width:A,height:c},{internalFormat:"RGBA32F",type:"FLOAT",minFilter:"NEAREST",magFilter:"NEAREST",history:e}),r.initializeTexture("u_poseMask",f,{minFilter:"NEAREST",magFilter:"NEAREST",history:e}),N.then(()=>p("pose:ready"))}),r.on("initializeTexture",(i,E)=>{i===_&&G(E)&&y(E)}),r.on("updateTextures",(i,E)=>{let H=i[_];G(H)&&(O=E?.skipHistoryWrite??!1,y(H))});let v=0;async function y(i){let E=performance.now(),H=++v;await N,t&&(t.state.pending=t.state.pending.then(async()=>{if(H!==v||!t)return;let h=i instanceof HTMLVideoElement?"VIDEO":"IMAGE";t.state.runningMode!==h&&(t.state.runningMode=h,await t.landmarker.setOptions({runningMode:h}));let g=!1;if(i!==t.state.source?(t.state.source=i,t.state.videoTime=-1,g=!0):i instanceof HTMLVideoElement?i.currentTime!==t.state.videoTime&&(t.state.videoTime=i.currentTime,g=!0):i instanceof HTMLImageElement||E-t.state.resultTimestamp>2&&(g=!0),g){let S;if(i instanceof HTMLVideoElement){if(i.videoWidth===0||i.videoHeight===0||i.readyState<2)return;S=t.landmarker.detectForVideo(i,E)}else{if(i.width===0||i.height===0)return;S=t.landmarker.detect(i)}if(S){t.state.resultTimestamp=E,t.state.result=S,te(t,S.landmarks),ne(t,S.segmentationMasks);for(let K of t.subscribers.keys())K(),t.subscribers.set(K,!0)}}else t.state.result&&!t.subscribers.get(d)&&(d(),t.subscribers.set(d,!0))}),await t.state.pending)}r.on("destroy",()=>{t&&(t.subscribers.delete(d),t.subscribers.size===0&&(t.landmarker.close(),t.maskShader.destroy(),C.delete(T))),t=null});let{fn:M,historyParams:W}=B(e),Y=e?`int layer = (u_poseMaskFrameOffset - framesAgo + ${e}) % ${e};
	vec4 mask = texture(u_poseMask, vec3(pos, float(layer)));`:"vec4 mask = texture(u_poseMask, pos);";k(`
uniform int u_maxPoses;
uniform int u_nPoses;
uniform highp sampler2D${e?"Array":""} u_poseLandmarksTex;${e?`
uniform int u_poseLandmarksTexFrameOffset;`:""}
uniform ${e?"highp":"mediump"} sampler2D${e?"Array":""} u_poseMask;${e?`
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
	int layer = (u_poseLandmarksTexFrameOffset - framesAgo + ${e}) % ${e};
	return int(texelFetch(u_poseLandmarksTex, ivec3(0, 0, layer), 0).r + 0.5);`:`
	return int(texelFetch(u_poseLandmarksTex, ivec2(0, 0), 0).r + 0.5);`)}
${M("vec4","poseLandmark","int poseIndex, int landmarkIndex",`int i = ${a} + poseIndex * ${o} + landmarkIndex;
	int x = i % ${A};
	int y = i / ${A};${e?`
	int layer = (u_poseLandmarksTexFrameOffset - framesAgo + ${e}) % ${e};
	return texelFetch(u_poseLandmarksTex, ivec3(x, y, layer), 0);`:`
	return texelFetch(u_poseLandmarksTex, ivec2(x, y), 0);`}`)}
${M("vec2","poseAt","vec2 pos",`${Y}
	float poseIndex = floor(mask.b * float(u_maxPoses) + 0.5) - 1.0;
	return vec2(mask.g, poseIndex);`)}
${M("float","inPose","vec2 pos",`return step(0.0, poseAt(pos${W}).x);`)}`)}}var Ee=se;export{Ee as default};
//# sourceMappingURL=pose.mjs.map