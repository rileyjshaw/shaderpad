import{a as W}from"../chunk-I2PAVCLP.mjs";import"../chunk-LXQJ4NRK.mjs";import{a as w,b,c as Y,d as D,e as z,f as X}from"../chunk-JRSBIGBN.mjs";var l=33,j=6,o=l+j,n={LEFT_EYE:2,RIGHT_EYE:5,LEFT_SHOULDER:11,RIGHT_SHOULDER:12,LEFT_ELBOW:13,RIGHT_ELBOW:14,LEFT_HIP:23,RIGHT_HIP:24,LEFT_KNEE:25,RIGHT_KNEE:26,LEFT_WRIST:15,RIGHT_WRIST:16,LEFT_PINKY:17,RIGHT_PINKY:18,LEFT_INDEX:19,RIGHT_INDEX:20,LEFT_THUMB:21,RIGHT_THUMB:22,LEFT_ANKLE:27,RIGHT_ANKLE:28,LEFT_HEEL:29,RIGHT_HEEL:30,LEFT_FOOT_INDEX:31,RIGHT_FOOT_INDEX:32,BODY_CENTER:l,LEFT_HAND_CENTER:l+1,RIGHT_HAND_CENTER:l+2,LEFT_FOOT_CENTER:l+3,RIGHT_FOOT_CENTER:l+4,TORSO_CENTER:l+5},J=Array.from({length:l},(N,_)=>_),Q=[n.LEFT_WRIST,n.LEFT_PINKY,n.LEFT_THUMB,n.LEFT_INDEX],Z=[n.RIGHT_WRIST,n.RIGHT_PINKY,n.RIGHT_THUMB,n.RIGHT_INDEX],ee=[n.LEFT_ANKLE,n.LEFT_HEEL,n.LEFT_FOOT_INDEX],te=[n.RIGHT_ANKLE,n.RIGHT_HEEL,n.RIGHT_FOOT_INDEX],ne=[n.LEFT_SHOULDER,n.RIGHT_SHOULDER,n.LEFT_HIP,n.RIGHT_HIP],F=512,r=1,se={modelPath:"https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",maxPoses:1,minPoseDetectionConfidence:.5,minPosePresenceConfidence:.5,minTrackingConfidence:.5},ie=`#version 300 es
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
}`,g=new Map;function oe(N,_){let e=N.landmarks.data,H=_.length;e[0]=H;for(let s=0;s<H;++s){let T=_[s];for(let R=0;R<l;++R){let I=T[R],C=(r+s*o+R)*4;e[C]=I.x,e[C+1]=1-I.y,e[C+2]=I.z??0,e[C+3]=I.visibility??1}let x=D(e,s,J,o,r),f=(r+s*o+n.BODY_CENTER)*4;e[f]=x[0],e[f+1]=x[1],e[f+2]=x[2],e[f+3]=x[3];let a=D(e,s,Q,o,r),k=(r+s*o+n.LEFT_HAND_CENTER)*4;e[k]=a[0],e[k+1]=a[1],e[k+2]=a[2],e[k+3]=a[3];let S=D(e,s,Z,o,r),P=(r+s*o+n.RIGHT_HAND_CENTER)*4;e[P]=S[0],e[P+1]=S[1],e[P+2]=S[2],e[P+3]=S[3];let p=D(e,s,ee,o,r),A=(r+s*o+n.LEFT_FOOT_CENTER)*4;e[A]=p[0],e[A+1]=p[1],e[A+2]=p[2],e[A+3]=p[3];let L=D(e,s,te,o,r),E=(r+s*o+n.RIGHT_FOOT_CENTER)*4;e[E]=L[0],e[E+1]=L[1],e[E+2]=L[2],e[E+3]=L[3];let t=D(e,s,ne,o,r),m=(r+s*o+n.TORSO_CENTER)*4;e[m]=t[0],e[m+1]=t[1],e[m+2]=t[2],e[m+3]=t[3]}N.state.nPoses=H}function re(N,_){let{maskShader:e,maxPoses:H}=N;if(!_||_.length===0)return e.clear();for(let s=0;s<_.length;++s){let T=_[s];e.updateTextures({u_mask:T.getAsWebGLTexture()}),e.updateUniforms({u_poseIndex:(s+1)/H}),e.step({skipClear:s>0}),T.close()}}function ae(N){let{textureName:_,options:{history:e,...H}={}}=N,s={...se,...H},T=Y({...s,textureName:_}),x=s.maxPoses*o+r,f=Math.ceil(x/F);return function(a,k){let{injectGLSL:S,emitHook:P}=k,p=g.get(T),A=p?.landmarks.data??new Float32Array(F*f*4),L=p?.mediapipeCanvas??new OffscreenCanvas(1,1),E=p?.maskShader??(()=>{let i=new W(ie,{canvas:L});return i.initializeTexture("u_mask",w),i.initializeUniform("u_poseIndex","float",0),i})(),t=null,m=!1,R=!1;function I(i){if(!t)return;let{nPoses:d}=t.state,u=d*o+r,M=Math.ceil(u/F),O=i;typeof O>"u"&&G.length>0&&(O=G,G=[]),a.updateTextures({u_poseLandmarksTex:{data:t.landmarks.data,width:F,height:M,isPartial:!0},u_poseMask:E},e?{skipHistoryWrite:R,historyWriteIndex:O}:void 0),a.updateUniforms({u_nPoses:d}),P("pose:result",t.state.result)}async function C(){if(g.has(T))t=g.get(T);else{let[i,{PoseLandmarker:d}]=await Promise.all([z(),import("@mediapipe/tasks-vision")]);if(m)return;let u=await d.createFromOptions(i,{baseOptions:{modelAssetPath:s.modelPath,delegate:"GPU"},canvas:L,runningMode:"VIDEO",numPoses:s.maxPoses,minPoseDetectionConfidence:s.minPoseDetectionConfidence,minPosePresenceConfidence:s.minPosePresenceConfidence,minTrackingConfidence:s.minTrackingConfidence,outputSegmentationMasks:!0});if(m){u.close(),E.destroy();return}t={landmarker:u,mediapipeCanvas:L,maskShader:E,subscribers:new Map,maxPoses:s.maxPoses,state:{runningMode:"VIDEO",source:null,videoTime:-1,resultTimestamp:0,result:null,pending:Promise.resolve(),nPoses:0},landmarks:{data:A,textureHeight:f}},g.set(T,t)}t.subscribers.set(I,!1)}let K=C();a.on("init",()=>{a.initializeUniform("u_maxPoses","int",s.maxPoses),a.initializeUniform("u_nPoses","int",0),a.initializeTexture("u_poseLandmarksTex",{data:A,width:F,height:f},{internalFormat:"RGBA32F",type:"FLOAT",minFilter:"NEAREST",magFilter:"NEAREST",history:e}),a.initializeTexture("u_poseMask",E,{minFilter:"NEAREST",magFilter:"NEAREST",history:e}),K.then(()=>{m||!t||P("pose:ready")})});let h=0,G=[],$=()=>{e&&(I(h),G.push(h),h=(h+1)%(e+1))};a.on("initializeTexture",(i,d)=>{i===_&&b(d)&&($(),B(d))}),a.on("updateTextures",(i,d)=>{let u=i[_];b(u)&&(R=d?.skipHistoryWrite??!1,R||$(),B(u))});let U=0;async function B(i){let d=performance.now(),u=++U;await K,t&&(t.state.pending=t.state.pending.then(async()=>{if(u!==U||!t)return;let M=i instanceof HTMLVideoElement?"VIDEO":"IMAGE";t.state.runningMode!==M&&(t.state.runningMode=M,await t.landmarker.setOptions({runningMode:M}));let O=!1;if(i!==t.state.source?(t.state.source=i,t.state.videoTime=-1,O=!0):i instanceof HTMLVideoElement?i.currentTime!==t.state.videoTime&&(t.state.videoTime=i.currentTime,O=!0):i instanceof HTMLImageElement||d-t.state.resultTimestamp>2&&(O=!0),O){let c;if(i instanceof HTMLVideoElement){if(i.videoWidth===0||i.videoHeight===0||i.readyState<2)return;c=t.landmarker.detectForVideo(i,d)}else{if(i.width===0||i.height===0)return;c=t.landmarker.detect(i)}if(c){t.state.resultTimestamp=d,t.state.result=c,oe(t,c.landmarks),re(t,c.segmentationMasks);for(let y of t.subscribers.keys())y(),t.subscribers.set(y,!0)}}else if(t.state.result)for(let[c,y]of t.subscribers.entries())y||(c(),t.subscribers.set(c,!0))}),await t.state.pending)}a.on("destroy",()=>{m=!0,t&&(t.subscribers.delete(I),t.subscribers.size===0&&(t.landmarker.close(),t.maskShader.destroy(),g.delete(T))),t=null});let{fn:v,historyParams:V}=X(e),q=e?`int layer = (u_poseMaskFrameOffset - framesAgo + ${e+1}) % ${e+1};
	vec4 mask = texture(u_poseMask, vec3(pos, float(layer)));`:"vec4 mask = texture(u_poseMask, pos);";S(`
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

${v("int","nPosesAt","",e?`
	int layer = (u_poseLandmarksTexFrameOffset - framesAgo + ${e+1}) % ${e+1};
	return int(texelFetch(u_poseLandmarksTex, ivec3(0, 0, layer), 0).r + 0.5);`:`
	return int(texelFetch(u_poseLandmarksTex, ivec2(0, 0), 0).r + 0.5);`)}
${v("vec4","poseLandmark","int poseIndex, int landmarkIndex",`int i = ${r} + poseIndex * ${o} + landmarkIndex;
	int x = i % ${F};
	int y = i / ${F};${e?`
	int layer = (u_poseLandmarksTexFrameOffset - framesAgo + ${e+1}) % ${e+1};
	return texelFetch(u_poseLandmarksTex, ivec3(x, y, layer), 0);`:`
	return texelFetch(u_poseLandmarksTex, ivec2(x, y), 0);`}`)}
${v("vec2","poseAt","vec2 pos",`${q}
	float poseIndex = floor(mask.b * float(u_maxPoses) + 0.5) - 1.0;
	return vec2(mask.g, poseIndex);`)}
${v("float","inPose","vec2 pos",`vec2 pose = poseAt(pos${V}); return step(0.0, pose.y) * pose.x;`)}`)}}var ue=ae;export{ue as default};
//# sourceMappingURL=pose.mjs.map