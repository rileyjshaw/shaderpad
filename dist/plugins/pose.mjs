import{a as b}from"../chunk-SBS4G6RV.mjs";import{a as U,b as G,c as w,d as P,e as B,f as W}from"../chunk-JRSBIGBN.mjs";var l=33,X=6,i=l+X,n={LEFT_EYE:2,RIGHT_EYE:5,LEFT_SHOULDER:11,RIGHT_SHOULDER:12,LEFT_ELBOW:13,RIGHT_ELBOW:14,LEFT_HIP:23,RIGHT_HIP:24,LEFT_KNEE:25,RIGHT_KNEE:26,LEFT_WRIST:15,RIGHT_WRIST:16,LEFT_PINKY:17,RIGHT_PINKY:18,LEFT_INDEX:19,RIGHT_INDEX:20,LEFT_THUMB:21,RIGHT_THUMB:22,LEFT_ANKLE:27,RIGHT_ANKLE:28,LEFT_HEEL:29,RIGHT_HEEL:30,LEFT_FOOT_INDEX:31,RIGHT_FOOT_INDEX:32,BODY_CENTER:l,LEFT_HAND_CENTER:l+1,RIGHT_HAND_CENTER:l+2,LEFT_FOOT_CENTER:l+3,RIGHT_FOOT_CENTER:l+4,TORSO_CENTER:l+5},V=Array.from({length:l},(p,_)=>_),q=[n.LEFT_WRIST,n.LEFT_PINKY,n.LEFT_THUMB,n.LEFT_INDEX],j=[n.RIGHT_WRIST,n.RIGHT_PINKY,n.RIGHT_THUMB,n.RIGHT_INDEX],J=[n.LEFT_ANKLE,n.LEFT_HEEL,n.LEFT_FOOT_INDEX],Q=[n.RIGHT_ANKLE,n.RIGHT_HEEL,n.RIGHT_FOOT_INDEX],Z=[n.LEFT_SHOULDER,n.RIGHT_SHOULDER,n.LEFT_HIP,n.RIGHT_HIP],A=512,r=1,ee={modelPath:"https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",maxPoses:1,minPoseDetectionConfidence:.5,minPosePresenceConfidence:.5,minTrackingConfidence:.5},te=`#version 300 es
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
}`,C=new Map;function ne(p,_){let e=p.landmarks.data,I=_.length;e[0]=I;for(let s=0;s<I;++s){let T=_[s];for(let H=0;H<l;++H){let d=T[H],k=(r+s*i+H)*4;e[k]=d.x,e[k+1]=1-d.y,e[k+2]=d.z??0,e[k+3]=d.visibility??1}let D=P(e,s,V,i,r),f=(r+s*i+n.BODY_CENTER)*4;e[f]=D[0],e[f+1]=D[1],e[f+2]=D[2],e[f+3]=D[3];let a=P(e,s,q,i,r),F=(r+s*i+n.LEFT_HAND_CENTER)*4;e[F]=a[0],e[F+1]=a[1],e[F+2]=a[2],e[F+3]=a[3];let x=P(e,s,j,i,r),O=(r+s*i+n.RIGHT_HAND_CENTER)*4;e[O]=x[0],e[O+1]=x[1],e[O+2]=x[2],e[O+3]=x[3];let L=P(e,s,J,i,r),N=(r+s*i+n.LEFT_FOOT_CENTER)*4;e[N]=L[0],e[N+1]=L[1],e[N+2]=L[2],e[N+3]=L[3];let R=P(e,s,Q,i,r),m=(r+s*i+n.RIGHT_FOOT_CENTER)*4;e[m]=R[0],e[m+1]=R[1],e[m+2]=R[2],e[m+3]=R[3];let t=P(e,s,Z,i,r),c=(r+s*i+n.TORSO_CENTER)*4;e[c]=t[0],e[c+1]=t[1],e[c+2]=t[2],e[c+3]=t[3]}p.state.nPoses=I}function se(p,_){let{maskShader:e,maxPoses:I}=p;if(!_||_.length===0)return e.clear();for(let s=0;s<_.length;++s){let T=_[s];e.updateTextures({u_mask:T.getAsWebGLTexture()}),e.updateUniforms({u_poseIndex:(s+1)/I}),e.draw({skipClear:s>0}),T.close()}}function oe(p){let{textureName:_,options:{history:e,...I}={}}=p,s={...ee,...I},T=w({...s,textureName:_}),D=s.maxPoses*i+r,f=Math.ceil(D/A);return function(a,F){let{injectGLSL:x,emitHook:O}=F,L=C.get(T),N=L?.landmarks.data??new Float32Array(A*f*4),R=L?.mediapipeCanvas??new OffscreenCanvas(1,1),m=L?.maskShader??(()=>{let o=new b(te,{canvas:R});return o.initializeTexture("u_mask",U),o.initializeUniform("u_poseIndex","float",0),o})(),t=null,c=!1,H=!1;function d(){if(!t)return;let{nPoses:o}=t.state,E=o*i+r,u=Math.ceil(E/A);a.updateTextures({u_poseLandmarksTex:{data:t.landmarks.data,width:A,height:u,isPartial:!0},u_poseMask:m},{skipHistoryWrite:H}),a.updateUniforms({u_nPoses:o}),O("pose:result",t.state.result)}async function k(){if(C.has(T))t=C.get(T);else{let[o,{PoseLandmarker:E}]=await Promise.all([B(),import("@mediapipe/tasks-vision")]);if(c)return;let u=await E.createFromOptions(o,{baseOptions:{modelAssetPath:s.modelPath,delegate:"GPU"},canvas:R,runningMode:"VIDEO",numPoses:s.maxPoses,minPoseDetectionConfidence:s.minPoseDetectionConfidence,minPosePresenceConfidence:s.minPosePresenceConfidence,minTrackingConfidence:s.minTrackingConfidence,outputSegmentationMasks:!0});if(c){u.close(),m.destroy();return}t={landmarker:u,mediapipeCanvas:R,maskShader:m,subscribers:new Map,maxPoses:s.maxPoses,state:{runningMode:"VIDEO",source:null,videoTime:-1,resultTimestamp:0,result:null,pending:Promise.resolve(),nPoses:0},landmarks:{data:N,textureHeight:f}},C.set(T,t)}t.subscribers.set(d,!1)}let v=k();a.on("init",()=>{a.initializeUniform("u_maxPoses","int",s.maxPoses),a.initializeUniform("u_nPoses","int",0),a.initializeTexture("u_poseLandmarksTex",{data:N,width:A,height:f},{internalFormat:"RGBA32F",type:"FLOAT",minFilter:"NEAREST",magFilter:"NEAREST",history:e}),a.initializeTexture("u_poseMask",m,{minFilter:"NEAREST",magFilter:"NEAREST",history:e}),v.then(()=>{c||!t||O("pose:ready")})}),a.on("initializeTexture",(o,E)=>{o===_&&G(E)&&K(E)}),a.on("updateTextures",(o,E)=>{let u=o[_];G(u)&&(H=E?.skipHistoryWrite??!1,K(u))});let y=0;async function K(o){let E=performance.now(),u=++y;await v,t&&(t.state.pending=t.state.pending.then(async()=>{if(u!==y||!t)return;let h=o instanceof HTMLVideoElement?"VIDEO":"IMAGE";t.state.runningMode!==h&&(t.state.runningMode=h,await t.landmarker.setOptions({runningMode:h}));let g=!1;if(o!==t.state.source?(t.state.source=o,t.state.videoTime=-1,g=!0):o instanceof HTMLVideoElement?o.currentTime!==t.state.videoTime&&(t.state.videoTime=o.currentTime,g=!0):o instanceof HTMLImageElement||E-t.state.resultTimestamp>2&&(g=!0),g){let S;if(o instanceof HTMLVideoElement){if(o.videoWidth===0||o.videoHeight===0||o.readyState<2)return;S=t.landmarker.detectForVideo(o,E)}else{if(o.width===0||o.height===0)return;S=t.landmarker.detect(o)}if(S){t.state.resultTimestamp=E,t.state.result=S,ne(t,S.landmarks),se(t,S.segmentationMasks);for(let $ of t.subscribers.keys())$(),t.subscribers.set($,!0)}}else t.state.result&&!t.subscribers.get(d)&&(d(),t.subscribers.set(d,!0))}),await t.state.pending)}a.on("destroy",()=>{c=!0,t&&(t.subscribers.delete(d),t.subscribers.size===0&&(t.landmarker.close(),t.maskShader.destroy(),C.delete(T))),t=null});let{fn:M,historyParams:Y}=W(e),z=e?`int layer = (u_poseMaskFrameOffset - framesAgo + ${e}) % ${e};
	vec4 mask = texture(u_poseMask, vec3(pos, float(layer)));`:"vec4 mask = texture(u_poseMask, pos);";x(`
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
${M("vec4","poseLandmark","int poseIndex, int landmarkIndex",`int i = ${r} + poseIndex * ${i} + landmarkIndex;
	int x = i % ${A};
	int y = i / ${A};${e?`
	int layer = (u_poseLandmarksTexFrameOffset - framesAgo + ${e}) % ${e};
	return texelFetch(u_poseLandmarksTex, ivec3(x, y, layer), 0);`:`
	return texelFetch(u_poseLandmarksTex, ivec2(x, y), 0);`}`)}
${M("vec2","poseAt","vec2 pos",`${z}
	float poseIndex = floor(mask.b * float(u_maxPoses) + 0.5) - 1.0;
	return vec2(mask.g, poseIndex);`)}
${M("float","inPose","vec2 pos",`vec2 pose = poseAt(pos${Y}); return step(0.0, pose.y) * pose.x;`)}`)}}var Te=oe;export{Te as default};
//# sourceMappingURL=pose.mjs.map