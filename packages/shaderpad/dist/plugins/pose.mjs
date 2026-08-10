import e from"../index.mjs";import{DEFAULT_WASM_BASE_URL as t,calculateBoundingBoxCenter as n,dummyTexture as r,generateGLSLFn as i,getOrCreateSharedResource as a,getSharedFileset as o,hashOptions as s,isMediaPipeSource as c}from"./mediapipe-common.mjs";const l={LEFT_EYE:2,RIGHT_EYE:5,LEFT_SHOULDER:11,RIGHT_SHOULDER:12,LEFT_ELBOW:13,RIGHT_ELBOW:14,LEFT_HIP:23,RIGHT_HIP:24,LEFT_KNEE:25,RIGHT_KNEE:26,LEFT_WRIST:15,RIGHT_WRIST:16,LEFT_PINKY:17,RIGHT_PINKY:18,LEFT_INDEX:19,RIGHT_INDEX:20,LEFT_THUMB:21,RIGHT_THUMB:22,LEFT_ANKLE:27,RIGHT_ANKLE:28,LEFT_HEEL:29,RIGHT_HEEL:30,LEFT_FOOT_INDEX:31,RIGHT_FOOT_INDEX:32,BODY_CENTER:33,LEFT_HAND_CENTER:34,RIGHT_HAND_CENTER:35,LEFT_FOOT_CENTER:36,RIGHT_FOOT_CENTER:37,TORSO_CENTER:38},u=Array.from({length:33},(e,t)=>t),d=[l.LEFT_WRIST,l.LEFT_PINKY,l.LEFT_THUMB,l.LEFT_INDEX],f=[l.RIGHT_WRIST,l.RIGHT_PINKY,l.RIGHT_THUMB,l.RIGHT_INDEX],p=[l.LEFT_ANKLE,l.LEFT_HEEL,l.LEFT_FOOT_INDEX],m=[l.RIGHT_ANKLE,l.RIGHT_HEEL,l.RIGHT_FOOT_INDEX],h=[l.LEFT_SHOULDER,l.RIGHT_SHOULDER,l.LEFT_HIP,l.RIGHT_HIP],g={modelPath:`https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,maxPoses:1,minPoseDetectionConfidence:.5,minPosePresenceConfidence:.5,minTrackingConfidence:.5},_=new Map,v=new Map;function y(e,t){let r=e.landmarks,i=t.length;r[0]=i;for(let e=0;e<i;++e){let i=t[e];for(let t=0;t<33;++t){let n=i[t],a=(1+e*39+t)*4;r[a]=n.x,r[a+1]=1-n.y,r[a+2]=n.z??0,r[a+3]=n.visibility??1}let a=n(r,e,u,39,1),o=(1+e*39+l.BODY_CENTER)*4;r[o]=a[0],r[o+1]=a[1],r[o+2]=a[2],r[o+3]=a[3];let s=n(r,e,d,39,1),c=(1+e*39+l.LEFT_HAND_CENTER)*4;r[c]=s[0],r[c+1]=s[1],r[c+2]=s[2],r[c+3]=s[3];let g=n(r,e,f,39,1),_=(1+e*39+l.RIGHT_HAND_CENTER)*4;r[_]=g[0],r[_+1]=g[1],r[_+2]=g[2],r[_+3]=g[3];let v=n(r,e,p,39,1),y=(1+e*39+l.LEFT_FOOT_CENTER)*4;r[y]=v[0],r[y+1]=v[1],r[y+2]=v[2],r[y+3]=v[3];let b=n(r,e,m,39,1),x=(1+e*39+l.RIGHT_FOOT_CENTER)*4;r[x]=b[0],r[x+1]=b[1],r[x+2]=b[2],r[x+3]=b[3];let S=n(r,e,h,39,1),C=(1+e*39+l.TORSO_CENTER)*4;r[C]=S[0],r[C+1]=S[1],r[C+2]=S[2],r[C+3]=S[3]}e.state.nPoses=i}function b(e,t){let{maskShader:n,maxPoses:r}=e;if(!t||t.length===0)return n.clear();for(let e=0;e<t.length;++e){let i=t[e];n.updateTextures({u_mask:i.getAsWebGLTexture()}),n.updateUniforms({u_poseIndex:(e+1)/r}),n.step({skipClear:e>0}),i.close()}}function x(n){let{textureName:u,wasmBaseUrl:d=t,options:{history:f,...p}={}}=n,m={...g,...p},h=s({...m,textureName:u,wasmBaseUrl:d}),x=m.maxPoses*39+1,S=Math.ceil(x/512);return function(t,n){let{injectGLSL:s,emit:p,updateTexture:g}=n,x=_.get(h),C=x?.landmarks??new Float32Array(512*S*4),w=x?.maskShader??(()=>{let t=new e(`#version 300 es
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
}`,{canvas:new OffscreenCanvas(1,1)});return t.initializeTexture(`u_mask`,r),t.initializeUniform(`u_poseIndex`,`float`,0),t})(),T,E=!1,D=-1,O=[];function k(e){if(E||!T)return;let{nPoses:n}=T.state,r=n*39+1,i=Math.ceil(r/512),a=f?e:void 0;g(`u_poseLandmarksTex`,{data:T.landmarks,width:512,height:i,isPartial:!0},a),g(`u_poseMask`,T.maskShader,a),t.updateUniforms({u_nPoses:n},{allowMissing:!0})}function A(){E||!T||(f?(k(O.length>0?O:D),O=[]):k(D),p(`pose:result`,T.state.result))}function j(){if(E||!T)return;let e=T.subscribers;for(let[t,n]of e)if(n){if(t(),E)return;e.has(t)&&e.set(t,!1)}}async function M(){T=await a(h,_,v,async()=>{let[e,{PoseLandmarker:t}]=await Promise.all([o(d),import(`@mediapipe/tasks-vision`)]);if(E)return;let n=await t.createFromOptions(e,{baseOptions:{modelAssetPath:m.modelPath,delegate:`GPU`},canvas:w.canvas,runningMode:`VIDEO`,numPoses:m.maxPoses,minPoseDetectionConfidence:m.minPoseDetectionConfidence,minPosePresenceConfidence:m.minPosePresenceConfidence,minTrackingConfidence:m.minTrackingConfidence,outputSegmentationMasks:!0});if(E){n.close(),w.destroy();return}return{landmarker:n,maskShader:w,subscribers:new Map,maxPoses:m.maxPoses,state:{nCalls:0,runningMode:`VIDEO`,source:null,videoTime:-1,resultTimestamp:0,result:null,pending:Promise.resolve(),nPoses:0},landmarks:C}}),!(!T||E)&&(w!==T.maskShader&&w.destroy(),T.subscribers.set(A,!1))}let N=M();t.on(`_init`,()=>{t.initializeUniform(`u_maxPoses`,`int`,m.maxPoses,{allowMissing:!0}),t.initializeUniform(`u_nPoses`,`int`,0,{allowMissing:!0}),t.initializeTexture(`u_poseLandmarksTex`,{data:C,width:512,height:S},{internalFormat:`RGBA32F`,type:`FLOAT`,minFilter:`NEAREST`,magFilter:`NEAREST`,history:f}),t.initializeTexture(`u_poseMask`,w,{minFilter:`NEAREST`,magFilter:`NEAREST`,history:f}),N.then(()=>{E||!T||p(`pose:ready`)})});function P(e){E||!T||(f&&(D=(D+1)%(f+1),k(D),O.push(D)),T.subscribers.set(A,!0),F(e))}t.on(`initializeTexture`,(e,t)=>{e===u&&c(t)&&P(t)}),t.on(`updateTextures`,e=>{let t=e[u];c(t)&&P(t)});async function F(e){let t=performance.now();if(await N,E||!T)return;let n=++T.state.nCalls;T.state.pending=T.state.pending.then(async()=>{if(E||!T||n!==T.state.nCalls)return;let r=e instanceof HTMLVideoElement?`VIDEO`:`IMAGE`;if(T.state.runningMode!==r&&(T.state.runningMode=r,await T.landmarker.setOptions({runningMode:r}),E||!T||n!==T.state.nCalls))return;let i=!1;if(e===T.state.source?e instanceof HTMLVideoElement?e.currentTime!==T.state.videoTime&&(T.state.videoTime=e.currentTime,i=!0):e instanceof HTMLImageElement||t-T.state.resultTimestamp>2&&(i=!0):(T.state.source=e,T.state.videoTime=e instanceof HTMLVideoElement?e.currentTime:-1,i=!0),i){let n;if(e instanceof HTMLVideoElement){if(e.videoWidth===0||e.videoHeight===0||e.readyState<2)return;n=T.landmarker.detectForVideo(e,t)}else{if(e.width===0||e.height===0)return;n=T.landmarker.detect(e)}n&&(T.state.resultTimestamp=t,T.state.result=n,y(T,n.landmarks),b(T,n.segmentationMasks),j())}else T.state.result&&j()}),await T.state.pending}t.on(`destroy`,()=>{E=!0,T&&(T.subscribers.delete(A),T.subscribers.size===0&&(T.landmarker.close(),T.maskShader.destroy(),_.delete(h))),T=void 0});let{fn:I,historyParams:L}=i(f),R=f?`int layer = (u_poseMaskFrameOffset - framesAgo + ${f+1}) % ${f+1};
	vec4 mask = texture(u_poseMask, vec3(pos, float(layer)));`:`vec4 mask = texture(u_poseMask, pos);`;s(`
uniform int u_maxPoses;
uniform int u_nPoses;
uniform highp sampler2D${f?`Array`:``} u_poseLandmarksTex;${f?`
uniform int u_poseLandmarksTexFrameOffset;`:``}
uniform mediump sampler2D${f?`Array`:``} u_poseMask;${f?`
uniform int u_poseMaskFrameOffset;`:``}

#define POSE_LANDMARK_LEFT_EYE ${l.LEFT_EYE}
#define POSE_LANDMARK_RIGHT_EYE ${l.RIGHT_EYE}
#define POSE_LANDMARK_LEFT_SHOULDER ${l.LEFT_SHOULDER}
#define POSE_LANDMARK_RIGHT_SHOULDER ${l.RIGHT_SHOULDER}
#define POSE_LANDMARK_LEFT_ELBOW ${l.LEFT_ELBOW}
#define POSE_LANDMARK_RIGHT_ELBOW ${l.RIGHT_ELBOW}
#define POSE_LANDMARK_LEFT_HIP ${l.LEFT_HIP}
#define POSE_LANDMARK_RIGHT_HIP ${l.RIGHT_HIP}
#define POSE_LANDMARK_LEFT_KNEE ${l.LEFT_KNEE}
#define POSE_LANDMARK_RIGHT_KNEE ${l.RIGHT_KNEE}
#define POSE_LANDMARK_BODY_CENTER ${l.BODY_CENTER}
#define POSE_LANDMARK_LEFT_HAND_CENTER ${l.LEFT_HAND_CENTER}
#define POSE_LANDMARK_RIGHT_HAND_CENTER ${l.RIGHT_HAND_CENTER}
#define POSE_LANDMARK_LEFT_FOOT_CENTER ${l.LEFT_FOOT_CENTER}
#define POSE_LANDMARK_RIGHT_FOOT_CENTER ${l.RIGHT_FOOT_CENTER}
#define POSE_LANDMARK_TORSO_CENTER ${l.TORSO_CENTER}

${I(`int`,`nPosesAt`,``,f?`
	int layer = (u_poseLandmarksTexFrameOffset - framesAgo + ${f+1}) % ${f+1};
	return int(texelFetch(u_poseLandmarksTex, ivec3(0, 0, layer), 0).r + 0.5);`:`
	return int(texelFetch(u_poseLandmarksTex, ivec2(0, 0), 0).r + 0.5);`)}
${I(`vec4`,`poseLandmark`,`int poseIndex, int landmarkIndex`,`int i = 1 + poseIndex * 39 + landmarkIndex;
	int x = i % 512;
	int y = i / 512;${f?`
	int layer = (u_poseLandmarksTexFrameOffset - framesAgo + ${f+1}) % ${f+1};
	return texelFetch(u_poseLandmarksTex, ivec3(x, y, layer), 0);`:`
	return texelFetch(u_poseLandmarksTex, ivec2(x, y), 0);`}`)}
${I(`vec2`,`poseAt`,`vec2 pos`,`${R}
	float poseIndex = floor(mask.b * float(u_maxPoses) + 0.5) - 1.0;
	return vec2(mask.g, poseIndex);`)}
${I(`float`,`inPose`,`vec2 pos`,`vec2 pose = poseAt(pos${L}); return step(0.0, pose.y) * pose.x;`)}`)}}export{x as default};
//# sourceMappingURL=pose.mjs.map