import{a as y}from"../chunk-OIM5PVRI.mjs";import{a as K,b as h,c as $,d as D,e as U,f as w}from"../chunk-JRSBIGBN.mjs";var c=33,Y=6,i=c+Y,n={LEFT_EYE:2,RIGHT_EYE:5,LEFT_SHOULDER:11,RIGHT_SHOULDER:12,LEFT_ELBOW:13,RIGHT_ELBOW:14,LEFT_HIP:23,RIGHT_HIP:24,LEFT_KNEE:25,RIGHT_KNEE:26,LEFT_WRIST:15,RIGHT_WRIST:16,LEFT_PINKY:17,RIGHT_PINKY:18,LEFT_INDEX:19,RIGHT_INDEX:20,LEFT_THUMB:21,RIGHT_THUMB:22,LEFT_ANKLE:27,RIGHT_ANKLE:28,LEFT_HEEL:29,RIGHT_HEEL:30,LEFT_FOOT_INDEX:31,RIGHT_FOOT_INDEX:32,BODY_CENTER:c,LEFT_HAND_CENTER:c+1,RIGHT_HAND_CENTER:c+2,LEFT_FOOT_CENTER:c+3,RIGHT_FOOT_CENTER:c+4,TORSO_CENTER:c+5},z=Array.from({length:c},(f,_)=>_),X=[n.LEFT_WRIST,n.LEFT_PINKY,n.LEFT_THUMB,n.LEFT_INDEX],V=[n.RIGHT_WRIST,n.RIGHT_PINKY,n.RIGHT_THUMB,n.RIGHT_INDEX],q=[n.LEFT_ANKLE,n.LEFT_HEEL,n.LEFT_FOOT_INDEX],j=[n.RIGHT_ANKLE,n.RIGHT_HEEL,n.RIGHT_FOOT_INDEX],J=[n.LEFT_SHOULDER,n.RIGHT_SHOULDER,n.LEFT_HIP,n.RIGHT_HIP],A=512,a=1,Q={modelPath:"https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",maxPoses:1,minPoseDetectionConfidence:.5,minPosePresenceConfidence:.5,minTrackingConfidence:.5},M=new Map;function Z(f,_){let e=f.landmarks.data,L=_.length;e[0]=L;for(let s=0;s<L;++s){let E=_[s];for(let C=0;C<c;++C){let N=E[C],P=(a+s*i+C)*4;e[P]=N.x,e[P+1]=1-N.y,e[P+2]=N.z??0,e[P+3]=N.visibility??1}let F=D(e,s,z,i,a),u=(a+s*i+n.BODY_CENTER)*4;e[u]=F[0],e[u+1]=F[1],e[u+2]=F[2],e[u+3]=F[3];let r=D(e,s,X,i,a),k=(a+s*i+n.LEFT_HAND_CENTER)*4;e[k]=r[0],e[k+1]=r[1],e[k+2]=r[2],e[k+3]=r[3];let x=D(e,s,V,i,a),R=(a+s*i+n.RIGHT_HAND_CENTER)*4;e[R]=x[0],e[R+1]=x[1],e[R+2]=x[2],e[R+3]=x[3];let p=D(e,s,q,i,a),I=(a+s*i+n.LEFT_FOOT_CENTER)*4;e[I]=p[0],e[I+1]=p[1],e[I+2]=p[2],e[I+3]=p[3];let m=D(e,s,j,i,a),t=(a+s*i+n.RIGHT_FOOT_CENTER)*4;e[t]=m[0],e[t+1]=m[1],e[t+2]=m[2],e[t+3]=m[3];let O=D(e,s,J,i,a),d=(a+s*i+n.TORSO_CENTER)*4;e[d]=O[0],e[d+1]=O[1],e[d+2]=O[2],e[d+3]=O[3]}f.state.nPoses=L}function ee(f,_){if(!_||_.length===0)return;let{mask:{shader:e},maxPoses:L}=f;for(let s=0;s<_.length;++s){let E=_[s];e.updateTextures({u_mask:E.getAsWebGLTexture()}),e.updateUniforms({u_poseIndex:(s+1)/L}),e.draw({skipClear:s>0}),E.close()}}function te(f){let{textureName:_,options:{history:e,...L}={}}=f,s={...Q,...L},E=$({...s,textureName:_}),F=s.maxPoses*i+a,u=Math.ceil(F/A);return function(r,k){let{injectGLSL:x,emitHook:R}=k,p=M.get(E),I=p?.landmarks.data??new Float32Array(A*u*4),m=p?.canvas??new OffscreenCanvas(1,1),t=null,O=!1;function d(){if(!t)return;let{nPoses:o}=t.state,T=o*i+a,l=Math.ceil(T/A);r.updateTextures({u_poseLandmarksTex:{data:t.landmarks.data,width:A,height:l,isPartial:!0},u_poseMask:t.canvas},{skipHistoryWrite:O}),r.updateUniforms({u_nPoses:o}),R("pose:result",t.state.result)}async function C(){if(M.has(E))t=M.get(E);else{let[o,{PoseLandmarker:T}]=await Promise.all([U(),import("@mediapipe/tasks-vision")]),l=await T.createFromOptions(o,{baseOptions:{modelAssetPath:s.modelPath,delegate:"GPU"},canvas:m,runningMode:"VIDEO",numPoses:s.maxPoses,minPoseDetectionConfidence:s.minPoseDetectionConfidence,minPosePresenceConfidence:s.minPosePresenceConfidence,minTrackingConfidence:s.minTrackingConfidence,outputSegmentationMasks:!0}),H=new y(`#version 300 es
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
	}`,{canvas:m});H.initializeTexture("u_mask",K),H.initializeUniform("u_poseIndex","float",0),t={landmarker:l,canvas:m,subscribers:new Map,maxPoses:s.maxPoses,state:{runningMode:"VIDEO",source:null,videoTime:-1,resultTimestamp:0,result:null,pending:Promise.resolve(),nPoses:0},landmarks:{data:I,textureHeight:u},mask:{shader:H}},M.set(E,t)}t.subscribers.set(d,!1)}let N=C();r.on("init",()=>{r.initializeUniform("u_maxPoses","int",s.maxPoses),r.initializeUniform("u_nPoses","int",0),r.initializeTexture("u_poseLandmarksTex",{data:I,width:A,height:u},{internalFormat:"RGBA32F",type:"FLOAT",minFilter:"NEAREST",magFilter:"NEAREST",history:e}),r.initializeTexture("u_poseMask",m,{preserveY:!0,minFilter:"NEAREST",magFilter:"NEAREST",history:e}),N.then(()=>R("pose:ready"))}),r.on("initializeTexture",(o,T)=>{o===_&&h(T)&&v(T)}),r.on("updateTextures",(o,T)=>{let l=o[_];h(l)&&(O=T?.skipHistoryWrite??!1,v(l))});let P=0;async function v(o){let T=performance.now(),l=++P;await N,t&&(t.state.pending=t.state.pending.then(async()=>{if(l!==P||!t)return;let H=o instanceof HTMLVideoElement?"VIDEO":"IMAGE";t.state.runningMode!==H&&(t.state.runningMode=H,await t.landmarker.setOptions({runningMode:H}));let G=!1;if(o!==t.state.source?(t.state.source=o,t.state.videoTime=-1,G=!0):o instanceof HTMLVideoElement?o.currentTime!==t.state.videoTime&&(t.state.videoTime=o.currentTime,G=!0):o instanceof HTMLImageElement||T-t.state.resultTimestamp>2&&(G=!0),G){let S;if(o instanceof HTMLVideoElement){if(o.videoWidth===0||o.videoHeight===0||o.readyState<2)return;S=t.landmarker.detectForVideo(o,T)}else{if(o.width===0||o.height===0)return;S=t.landmarker.detect(o)}if(S){t.state.resultTimestamp=T,t.state.result=S,Z(t,S.landmarks),ee(t,S.segmentationMasks);for(let b of t.subscribers.keys())b(),t.subscribers.set(b,!0)}}else t.state.result&&!t.subscribers.get(d)&&(d(),t.subscribers.set(d,!0))}),await t.state.pending)}r.on("destroy",()=>{t&&(t.subscribers.delete(d),t.subscribers.size===0&&(t.landmarker.close(),t.mask.shader?.destroy(),M.delete(E))),t=null});let{fn:g,historyParams:B}=w(e),W=e?`int layer = (u_poseMaskFrameOffset - framesAgo + ${e}) % ${e};
	vec4 mask = texture(u_poseMask, vec3(pos, float(layer)));`:"vec4 mask = texture(u_poseMask, pos);";x(`
uniform int u_maxPoses;
uniform int u_nPoses;
uniform highp sampler2D${e?"Array":""} u_poseLandmarksTex;${e?`
uniform int u_poseLandmarksTexFrameOffset;`:""}
uniform sampler2D${e?"Array":""} u_poseMask;${e?`
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

${g("int","nPosesAt","",e?`
	int layer = (u_poseLandmarksTexFrameOffset - framesAgo + ${e}) % ${e};
	return int(texelFetch(u_poseLandmarksTex, ivec3(0, 0, layer), 0).r + 0.5);`:`
	return int(texelFetch(u_poseLandmarksTex, ivec2(0, 0), 0).r + 0.5);`)}
${g("vec4","poseLandmark","int poseIndex, int landmarkIndex",`int i = ${a} + poseIndex * ${i} + landmarkIndex;
	int x = i % ${A};
	int y = i / ${A};${e?`
	int layer = (u_poseLandmarksTexFrameOffset - framesAgo + ${e}) % ${e};
	return texelFetch(u_poseLandmarksTex, ivec3(x, y, layer), 0);`:`
	return texelFetch(u_poseLandmarksTex, ivec2(x, y), 0);`}`)}
${g("vec2","poseAt","vec2 pos",`${W}
	float poseIndex = floor(mask.b * float(u_maxPoses) + 0.5) - 1.0;
	return vec2(mask.g, poseIndex);`)}
${g("float","inPose","vec2 pos",`return step(0.0, poseAt(pos${B}).x);`)}`)}}var re=te;export{re as default};
//# sourceMappingURL=pose.mjs.map