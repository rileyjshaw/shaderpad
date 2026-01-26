import{a as K}from"../chunk-5CBGNOA3.mjs";import{a as $,b as h,c as U,d as D,e as w,f as B}from"../chunk-JRSBIGBN.mjs";var l=33,z=6,i=l+z,n={LEFT_EYE:2,RIGHT_EYE:5,LEFT_SHOULDER:11,RIGHT_SHOULDER:12,LEFT_ELBOW:13,RIGHT_ELBOW:14,LEFT_HIP:23,RIGHT_HIP:24,LEFT_KNEE:25,RIGHT_KNEE:26,LEFT_WRIST:15,RIGHT_WRIST:16,LEFT_PINKY:17,RIGHT_PINKY:18,LEFT_INDEX:19,RIGHT_INDEX:20,LEFT_THUMB:21,RIGHT_THUMB:22,LEFT_ANKLE:27,RIGHT_ANKLE:28,LEFT_HEEL:29,RIGHT_HEEL:30,LEFT_FOOT_INDEX:31,RIGHT_FOOT_INDEX:32,BODY_CENTER:l,LEFT_HAND_CENTER:l+1,RIGHT_HAND_CENTER:l+2,LEFT_FOOT_CENTER:l+3,RIGHT_FOOT_CENTER:l+4,TORSO_CENTER:l+5},X=Array.from({length:l},(L,_)=>_),V=[n.LEFT_WRIST,n.LEFT_PINKY,n.LEFT_THUMB,n.LEFT_INDEX],q=[n.RIGHT_WRIST,n.RIGHT_PINKY,n.RIGHT_THUMB,n.RIGHT_INDEX],j=[n.LEFT_ANKLE,n.LEFT_HEEL,n.LEFT_FOOT_INDEX],J=[n.RIGHT_ANKLE,n.RIGHT_HEEL,n.RIGHT_FOOT_INDEX],Q=[n.LEFT_SHOULDER,n.RIGHT_SHOULDER,n.LEFT_HIP,n.RIGHT_HIP],A=512,a=1,Z={modelPath:"https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",maxPoses:1,minPoseDetectionConfidence:.5,minPosePresenceConfidence:.5,minTrackingConfidence:.5},M=new Map;function ee(L,_){let e=L.landmarks.data,R=_.length;e[0]=R;for(let s=0;s<R;++s){let d=_[s];for(let m=0;m<l;++m){let C=d[m],P=(a+s*i+m)*4;e[P]=C.x,e[P+1]=1-C.y,e[P+2]=C.z??0,e[P+3]=C.visibility??1}let F=D(e,s,X,i,a),u=(a+s*i+n.BODY_CENTER)*4;e[u]=F[0],e[u+1]=F[1],e[u+2]=F[2],e[u+3]=F[3];let r=D(e,s,V,i,a),k=(a+s*i+n.LEFT_HAND_CENTER)*4;e[k]=r[0],e[k+1]=r[1],e[k+2]=r[2],e[k+3]=r[3];let x=D(e,s,q,i,a),E=(a+s*i+n.RIGHT_HAND_CENTER)*4;e[E]=x[0],e[E+1]=x[1],e[E+2]=x[2],e[E+3]=x[3];let p=D(e,s,j,i,a),I=(a+s*i+n.LEFT_FOOT_CENTER)*4;e[I]=p[0],e[I+1]=p[1],e[I+2]=p[2],e[I+3]=p[3];let O=D(e,s,J,i,a),c=(a+s*i+n.RIGHT_FOOT_CENTER)*4;e[c]=O[0],e[c+1]=O[1],e[c+2]=O[2],e[c+3]=O[3];let t=D(e,s,Q,i,a),N=(a+s*i+n.TORSO_CENTER)*4;e[N]=t[0],e[N+1]=t[1],e[N+2]=t[2],e[N+3]=t[3]}L.state.nPoses=R}function te(L,_){if(!_||_.length===0)return;let{mask:{shader:e},maxPoses:R}=L;for(let s=0;s<_.length;++s){let d=_[s];e.updateTextures({u_mask:d.getAsWebGLTexture()}),e.updateUniforms({u_poseIndex:(s+1)/R}),e.draw({skipClear:s>0}),d.close()}}function ne(L){let{textureName:_,options:{history:e,...R}={}}=L,s={...Z,...R},d=U({...s,textureName:_}),F=s.maxPoses*i+a,u=Math.ceil(F/A);return function(r,k){let{injectGLSL:x,gl:E,emitHook:p}=k,I=M.get(d),O=I?.landmarks.data??new Float32Array(A*u*4),c=I?.canvas??new OffscreenCanvas(1,1),t=null,N=!1;function m(){if(!t)return;let{nPoses:o}=t.state,T=o*i+a,f=Math.ceil(T/A);r.updateTextures({u_poseLandmarksTex:{data:t.landmarks.data,width:A,height:f,isPartial:!0},u_poseMask:t.canvas},{skipHistoryWrite:N}),r.updateUniforms({u_nPoses:o}),p("pose:result",t.state.result)}async function C(){if(M.has(d))t=M.get(d);else{let[o,{PoseLandmarker:T}]=await Promise.all([w(),import("@mediapipe/tasks-vision")]),f=await T.createFromOptions(o,{baseOptions:{modelAssetPath:s.modelPath,delegate:"GPU"},canvas:c,runningMode:"VIDEO",numPoses:s.maxPoses,minPoseDetectionConfidence:s.minPoseDetectionConfidence,minPosePresenceConfidence:s.minPosePresenceConfidence,minTrackingConfidence:s.minTrackingConfidence,outputSegmentationMasks:!0}),H=new K(`#version 300 es
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
	}`,{canvas:c});H.initializeTexture("u_mask",$),H.initializeUniform("u_poseIndex","float",0),t={landmarker:f,canvas:c,subscribers:new Map,maxPoses:s.maxPoses,state:{runningMode:"VIDEO",source:null,videoTime:-1,resultTimestamp:0,result:null,pending:Promise.resolve(),nPoses:0},landmarks:{data:O,textureHeight:u},mask:{shader:H}},M.set(d,t)}t.subscribers.set(m,!1)}let P=C();r.on("init",()=>{r.initializeUniform("u_maxPoses","int",s.maxPoses),r.initializeUniform("u_nPoses","int",0),r.initializeTexture("u_poseLandmarksTex",{data:O,width:A,height:u},{internalFormat:E.RGBA32F,type:E.FLOAT,minFilter:E.NEAREST,magFilter:E.NEAREST,history:e}),r.initializeTexture("u_poseMask",c,{preserveY:!0,minFilter:E.NEAREST,magFilter:E.NEAREST,history:e}),P.then(()=>p("pose:ready"))}),r.on("initializeTexture",(o,T)=>{o===_&&h(T)&&b(T)}),r.on("updateTextures",(o,T)=>{let f=o[_];h(f)&&(N=T?.skipHistoryWrite??!1,b(f))});let v=0;async function b(o){let T=performance.now(),f=++v;await P,t&&(t.state.pending=t.state.pending.then(async()=>{if(f!==v||!t)return;let H=o instanceof HTMLVideoElement?"VIDEO":"IMAGE";t.state.runningMode!==H&&(t.state.runningMode=H,await t.landmarker.setOptions({runningMode:H}));let G=!1;if(o!==t.state.source?(t.state.source=o,t.state.videoTime=-1,G=!0):o instanceof HTMLVideoElement?o.currentTime!==t.state.videoTime&&(t.state.videoTime=o.currentTime,G=!0):o instanceof HTMLImageElement||T-t.state.resultTimestamp>2&&(G=!0),G){let S;if(o instanceof HTMLVideoElement){if(o.videoWidth===0||o.videoHeight===0||o.readyState<2)return;S=t.landmarker.detectForVideo(o,T)}else{if(o.width===0||o.height===0)return;S=t.landmarker.detect(o)}if(S){t.state.resultTimestamp=T,t.state.result=S,ee(t,S.landmarks),te(t,S.segmentationMasks);for(let y of t.subscribers.keys())y(),t.subscribers.set(y,!0)}}else t.state.result&&!t.subscribers.get(m)&&(m(),t.subscribers.set(m,!0))}),await t.state.pending)}r.on("destroy",()=>{t&&(t.subscribers.delete(m),t.subscribers.size===0&&(t.landmarker.close(),t.mask.shader?.destroy(),M.delete(d))),t=null});let{fn:g,historyParams:W}=B(e),Y=e?`int layer = (u_poseMaskFrameOffset - framesAgo + ${e}) % ${e};
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
${g("vec2","poseAt","vec2 pos",`${Y}
	float poseIndex = floor(mask.b * float(u_maxPoses) + 0.5) - 1.0;
	return vec2(mask.g, poseIndex);`)}
${g("float","inPose","vec2 pos",`return step(0.0, poseAt(pos${W}).x);`)}`)}}var _e=ne;export{_e as default};
//# sourceMappingURL=pose.mjs.map