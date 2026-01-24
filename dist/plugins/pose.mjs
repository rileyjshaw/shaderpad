import{a as v}from"../chunk-5CBGNOA3.mjs";import{a as g,b as h,c as P,d as K}from"../chunk-IW3Y5DYQ.mjs";var m=33,b=6,i=m+b,n={LEFT_EYE:2,RIGHT_EYE:5,LEFT_SHOULDER:11,RIGHT_SHOULDER:12,LEFT_ELBOW:13,RIGHT_ELBOW:14,LEFT_HIP:23,RIGHT_HIP:24,LEFT_KNEE:25,RIGHT_KNEE:26,LEFT_WRIST:15,RIGHT_WRIST:16,LEFT_PINKY:17,RIGHT_PINKY:18,LEFT_INDEX:19,RIGHT_INDEX:20,LEFT_THUMB:21,RIGHT_THUMB:22,LEFT_ANKLE:27,RIGHT_ANKLE:28,LEFT_HEEL:29,RIGHT_HEEL:30,LEFT_FOOT_INDEX:31,RIGHT_FOOT_INDEX:32,BODY_CENTER:m,LEFT_HAND_CENTER:m+1,RIGHT_HAND_CENTER:m+2,LEFT_FOOT_CENTER:m+3,RIGHT_FOOT_CENTER:m+4,TORSO_CENTER:m+5},U=Array.from({length:m},(u,E)=>E),y=[n.LEFT_WRIST,n.LEFT_PINKY,n.LEFT_THUMB,n.LEFT_INDEX],w=[n.RIGHT_WRIST,n.RIGHT_PINKY,n.RIGHT_THUMB,n.RIGHT_INDEX],$=[n.LEFT_ANKLE,n.LEFT_HEEL,n.LEFT_FOOT_INDEX],B=[n.RIGHT_ANKLE,n.RIGHT_HEEL,n.RIGHT_FOOT_INDEX],Y=[n.LEFT_SHOULDER,n.RIGHT_SHOULDER,n.LEFT_HIP,n.RIGHT_HIP],H=512,z={data:new Uint8Array(4),width:1,height:1},W={modelPath:"https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",maxPoses:1,minPoseDetectionConfidence:.5,minPosePresenceConfidence:.5,minTrackingConfidence:.5},S=new Map;function X(u,E){let t=u.landmarks.data,r=E.length;for(let s=0;s<r;++s){let D=E[s];for(let I=0;I<m;++I){let N=D[I],O=(s*i+I)*4;t[O]=N.x,t[O+1]=1-N.y,t[O+2]=N.z??0,t[O+3]=N.visibility??1}let l=P(t,s,U,i),a=(s*i+n.BODY_CENTER)*4;t[a]=l[0],t[a+1]=l[1],t[a+2]=l[2],t[a+3]=l[3];let A=P(t,s,y,i),F=(s*i+n.LEFT_HAND_CENTER)*4;t[F]=A[0],t[F+1]=A[1],t[F+2]=A[2],t[F+3]=A[3];let T=P(t,s,w,i),R=(s*i+n.RIGHT_HAND_CENTER)*4;t[R]=T[0],t[R+1]=T[1],t[R+2]=T[2],t[R+3]=T[3];let L=P(t,s,$,i),f=(s*i+n.LEFT_FOOT_CENTER)*4;t[f]=L[0],t[f+1]=L[1],t[f+2]=L[2],t[f+3]=L[3];let c=P(t,s,B,i),e=(s*i+n.RIGHT_FOOT_CENTER)*4;t[e]=c[0],t[e+1]=c[1],t[e+2]=c[2],t[e+3]=c[3];let d=P(t,s,Y,i),C=(s*i+n.TORSO_CENTER)*4;t[C]=d[0],t[C+1]=d[1],t[C+2]=d[2],t[C+3]=d[3]}u.state.nPoses=r}function V(u,E){if(!E||E.length===0)return;let{mask:{shader:t},maxPoses:r}=u;for(let s=0;s<E.length;++s){let D=E[s];t.updateTextures({u_mask:D.getAsWebGLTexture()}),t.updateUniforms({u_poseIndex:(s+1)/r}),t.draw({skipClear:s>0}),D.close()}}function q(u){let{textureName:E,options:t={}}=u,r={...W,...t},s=h({...r,textureName:E}),D=r.maxPoses*i,l=Math.ceil(D/H);return function(a,A){let{injectGLSL:F,gl:T,emitHook:R}=A,L=S.get(s),f=L?.landmarks.data??new Float32Array(H*l*4),c=L?.canvas??new OffscreenCanvas(1,1),e=null;function d(){if(!e)return;let{nPoses:o}=e.state,_=o*i,k=Math.ceil(_/H);a.updateTextures({u_poseLandmarksTex:{data:e.landmarks.data,width:H,height:k,isPartial:!0},u_poseMask:e.canvas}),a.updateUniforms({u_nPoses:o}),R("pose:result",e.state.result)}async function C(){if(S.has(s))e=S.get(s);else{let[o,{PoseLandmarker:_}]=await Promise.all([K(),import("@mediapipe/tasks-vision")]),k=await _.createFromOptions(o,{baseOptions:{modelAssetPath:r.modelPath,delegate:"GPU"},canvas:c,runningMode:"VIDEO",numPoses:r.maxPoses,minPoseDetectionConfidence:r.minPoseDetectionConfidence,minPosePresenceConfidence:r.minPosePresenceConfidence,minTrackingConfidence:r.minTrackingConfidence,outputSegmentationMasks:!0}),p=new v(`#version 300 es
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
	}`,{canvas:c});p.initializeTexture("u_mask",z),p.initializeUniform("u_poseIndex","float",0),e={landmarker:k,canvas:c,subscribers:new Map,maxPoses:r.maxPoses,state:{runningMode:"VIDEO",source:null,videoTime:-1,resultTimestamp:0,result:null,pending:Promise.resolve(),nPoses:0},landmarks:{data:f,textureHeight:l},mask:{shader:p}},S.set(s,e)}e.subscribers.set(d,!1)}let I=C();a.on("init",()=>{a.initializeUniform("u_maxPoses","int",r.maxPoses),a.initializeUniform("u_nPoses","int",0),a.initializeTexture("u_poseLandmarksTex",{data:f,width:H,height:l},{internalFormat:T.RGBA32F,type:T.FLOAT,minFilter:T.NEAREST,magFilter:T.NEAREST}),a.initializeTexture("u_poseMask",c,{preserveY:!0,minFilter:T.NEAREST,magFilter:T.NEAREST}),I.then(()=>R("pose:ready"))}),a.on("initializeTexture",(o,_)=>{o===E&&g(_)&&O(_)}),a.on("updateTextures",o=>{let _=o[E];g(_)&&O(_)});let N=0;async function O(o){let _=performance.now(),k=++N;await I,e&&(e.state.pending=e.state.pending.then(async()=>{if(k!==N||!e)return;let p=o instanceof HTMLVideoElement?"VIDEO":"IMAGE";e.state.runningMode!==p&&(e.state.runningMode=p,await e.landmarker.setOptions({runningMode:p}));let M=!1;if(o!==e.state.source?(e.state.source=o,e.state.videoTime=-1,M=!0):o instanceof HTMLVideoElement?o.currentTime!==e.state.videoTime&&(e.state.videoTime=o.currentTime,M=!0):o instanceof HTMLImageElement||_-e.state.resultTimestamp>2&&(M=!0),M){let x;if(o instanceof HTMLVideoElement){if(o.videoWidth===0||o.videoHeight===0||o.readyState<2)return;x=e.landmarker.detectForVideo(o,_)}else{if(o.width===0||o.height===0)return;x=e.landmarker.detect(o)}if(x){e.state.resultTimestamp=_,e.state.result=x,X(e,x.landmarks),V(e,x.segmentationMasks);for(let G of e.subscribers.keys())G(),e.subscribers.set(G,!0)}}else e.state.result&&!e.subscribers.get(d)&&(d(),e.subscribers.set(d,!0))}),await e.state.pending)}a.on("destroy",()=>{e&&(e.subscribers.delete(d),e.subscribers.size===0&&(e.landmarker.close(),e.mask.shader?.destroy(),S.delete(s))),e=null}),F(`
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
	int i = poseIndex * ${i} + landmarkIndex;
	int x = i % ${H};
	int y = i / ${H};
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
}`)}}var te=q;export{te as default};
//# sourceMappingURL=pose.mjs.map