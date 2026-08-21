import{t as e}from"../src-BADKSjxK.mjs";import{DEFAULT_WASM_BASE_URL as t,calculateBoundingBoxCenter as n,dummyTexture as r,generateGLSLFn as i,getOrCreateSharedResource as a,getSharedFileset as o,hashOptions as s,isMediaPipeSource as c,reportMediaPipeError as l}from"./mediapipe-common.mjs";const u={LEFT_EYE:2,RIGHT_EYE:5,LEFT_SHOULDER:11,RIGHT_SHOULDER:12,LEFT_ELBOW:13,RIGHT_ELBOW:14,LEFT_HIP:23,RIGHT_HIP:24,LEFT_KNEE:25,RIGHT_KNEE:26,LEFT_WRIST:15,RIGHT_WRIST:16,LEFT_PINKY:17,RIGHT_PINKY:18,LEFT_INDEX:19,RIGHT_INDEX:20,LEFT_THUMB:21,RIGHT_THUMB:22,LEFT_ANKLE:27,RIGHT_ANKLE:28,LEFT_HEEL:29,RIGHT_HEEL:30,LEFT_FOOT_INDEX:31,RIGHT_FOOT_INDEX:32,BODY_CENTER:33,LEFT_HAND_CENTER:34,RIGHT_HAND_CENTER:35,LEFT_FOOT_CENTER:36,RIGHT_FOOT_CENTER:37,TORSO_CENTER:38},d=Array.from({length:33},(e,t)=>t),f=[u.LEFT_WRIST,u.LEFT_PINKY,u.LEFT_THUMB,u.LEFT_INDEX],p=[u.RIGHT_WRIST,u.RIGHT_PINKY,u.RIGHT_THUMB,u.RIGHT_INDEX],m=[u.LEFT_ANKLE,u.LEFT_HEEL,u.LEFT_FOOT_INDEX],h=[u.RIGHT_ANKLE,u.RIGHT_HEEL,u.RIGHT_FOOT_INDEX],g=[u.LEFT_SHOULDER,u.RIGHT_SHOULDER,u.LEFT_HIP,u.RIGHT_HIP],_={modelPath:`https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,delegate:`GPU`,maxPoses:1,minPoseDetectionConfidence:.5,minPosePresenceConfidence:.5,minTrackingConfidence:.5},v=new Map,y=new Map;function b(e,t){let r=e.landmarks,i=t.length;r[0]=i;for(let e=0;e<i;++e){let i=t[e];for(let t=0;t<33;++t){let n=i[t],a=(1+e*39+t)*4;r[a]=n.x,r[a+1]=1-n.y,r[a+2]=n.z??0,r[a+3]=n.visibility??1}let a=n(r,e,d,39,1),o=(1+e*39+u.BODY_CENTER)*4;r[o]=a[0],r[o+1]=a[1],r[o+2]=a[2],r[o+3]=a[3];let s=n(r,e,f,39,1),c=(1+e*39+u.LEFT_HAND_CENTER)*4;r[c]=s[0],r[c+1]=s[1],r[c+2]=s[2],r[c+3]=s[3];let l=n(r,e,p,39,1),_=(1+e*39+u.RIGHT_HAND_CENTER)*4;r[_]=l[0],r[_+1]=l[1],r[_+2]=l[2],r[_+3]=l[3];let v=n(r,e,m,39,1),y=(1+e*39+u.LEFT_FOOT_CENTER)*4;r[y]=v[0],r[y+1]=v[1],r[y+2]=v[2],r[y+3]=v[3];let b=n(r,e,h,39,1),x=(1+e*39+u.RIGHT_FOOT_CENTER)*4;r[x]=b[0],r[x+1]=b[1],r[x+2]=b[2],r[x+3]=b[3];let S=n(r,e,g,39,1),C=(1+e*39+u.TORSO_CENTER)*4;r[C]=S[0],r[C+1]=S[1],r[C+2]=S[2],r[C+3]=S[3]}e.state.nPoses=i}function x(e,t){let{maskShader:n,maxPoses:r}=e;if(!t||t.length===0)return n.clear();for(let e=0;e<t.length;++e){let i=t[e];n.updateTextures({u_mask:i.getAsWebGLTexture()}),n.updateUniforms({u_poseIndex:(e+1)/r}),n.step({skipClear:e>0}),i.close()}}function S(n){let{textureName:d,wasmBaseUrl:f=t,options:{history:p,...m}={}}=n,h={..._,...m},g=s({...h,textureName:d,wasmBaseUrl:f}),S=h.maxPoses*39+1,C=Math.ceil(S/512);return function(t,n){let{injectGLSL:s,emit:m,updateTexture:_}=n,S=v.get(g),w=S?.landmarks??new Float32Array(512*C*4),T=S?.maskShader??(()=>{let t=new e(`#version 300 es
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
}`,{canvas:new OffscreenCanvas(1,1)});return t.initializeTexture(`u_mask`,r),t.initializeUniform(`u_poseIndex`,`float`,0),t})(),E,D=!1,O=-1,k=[];function A(e){if(D||!E)return;let{nPoses:n}=E.state,r=n*39+1,i=Math.ceil(r/512),a=p?e:void 0;_(`u_poseLandmarksTex`,{data:E.landmarks,width:512,height:i,isPartial:!0},a),_(`u_poseMask`,E.maskShader,a),t.updateUniforms({u_nPoses:n},{allowMissing:!0})}function j(){D||!E||(p?(A(k.length>0?k:O),k=[]):A(O),m(`pose:result`,E.state.result))}function M(){if(D||!E)return;let e=E.subscribers;for(let[t,n]of e)if(n){if(t(),D)return;e.has(t)&&e.set(t,!1)}}async function N(){E=await a(g,v,y,async()=>{let[e,{PoseLandmarker:t}]=await Promise.all([o(f),import(`@mediapipe/tasks-vision`)]);if(D)return;let n=await t.createFromOptions(e,{baseOptions:{modelAssetPath:h.modelPath,delegate:h.delegate},canvas:T.canvas,runningMode:`VIDEO`,numPoses:h.maxPoses,minPoseDetectionConfidence:h.minPoseDetectionConfidence,minPosePresenceConfidence:h.minPosePresenceConfidence,minTrackingConfidence:h.minTrackingConfidence,outputSegmentationMasks:!0});if(D){n.close(),T.destroy();return}return{landmarker:n,maskShader:T,subscribers:new Map,maxPoses:h.maxPoses,state:{nCalls:0,runningMode:`VIDEO`,source:null,videoTime:-1,resultTimestamp:0,result:null,pending:Promise.resolve(),nPoses:0},landmarks:w}}),!(!E||D)&&(T!==E.maskShader&&T.destroy(),E.subscribers.set(j,!1))}let P=N().catch(e=>{D||l(e,`pose`)});t.on(`_init`,()=>{t.initializeUniform(`u_maxPoses`,`int`,h.maxPoses,{allowMissing:!0}),t.initializeUniform(`u_nPoses`,`int`,0,{allowMissing:!0}),t.initializeTexture(`u_poseLandmarksTex`,{data:w,width:512,height:C},{format:`RGBA32F`,minFilter:`NEAREST`,magFilter:`NEAREST`,history:p}),t.initializeTexture(`u_poseMask`,T,{minFilter:`NEAREST`,magFilter:`NEAREST`,history:p}),P.then(()=>{D||!E||m(`pose:ready`)})});function F(e){D||!E||(p&&(O=(O+1)%(p+1),A(O),k.push(O)),E.subscribers.set(j,!0),I(e))}t.on(`initializeTexture`,(e,t)=>{e===d&&c(t)&&F(t)}),t.on(`updateTextures`,e=>{let t=e[d];c(t)&&F(t)});async function I(e){let t=performance.now();if(await P,D||!E)return;let n=++E.state.nCalls;E.state.pending=E.state.pending.then(async()=>{if(D||!E||n!==E.state.nCalls)return;let r=e instanceof HTMLVideoElement?`VIDEO`:`IMAGE`;if(E.state.runningMode!==r&&(E.state.runningMode=r,await E.landmarker.setOptions({runningMode:r}),D||!E||n!==E.state.nCalls))return;let i=!1;if(e===E.state.source?e instanceof HTMLVideoElement?e.currentTime!==E.state.videoTime&&(E.state.videoTime=e.currentTime,i=!0):e instanceof HTMLImageElement||t-E.state.resultTimestamp>2&&(i=!0):(E.state.source=e,E.state.videoTime=e instanceof HTMLVideoElement?e.currentTime:-1,i=!0),i){let n;if(e instanceof HTMLVideoElement){if(e.videoWidth===0||e.videoHeight===0||e.readyState<2)return;n=E.landmarker.detectForVideo(e,t)}else{if(e.width===0||e.height===0)return;n=E.landmarker.detect(e)}n&&(E.state.resultTimestamp=t,E.state.result=n,b(E,n.landmarks),x(E,n.segmentationMasks),M())}else E.state.result&&M()}),await E.state.pending}t.on(`destroy`,()=>{D=!0,E&&(E.subscribers.delete(j),E.subscribers.size===0&&(E.landmarker.close(),E.maskShader.destroy(),v.delete(g))),E=void 0});let{fn:L,historyParams:R}=i(p),z=p?`int layer = (u_poseMaskFrameOffset - framesAgo + ${p+1}) % ${p+1};
	vec4 mask = texture(u_poseMask, vec3(pos, float(layer)));`:`vec4 mask = texture(u_poseMask, pos);`;s(`
uniform int u_maxPoses;
uniform int u_nPoses;
uniform highp sampler2D${p?`Array`:``} u_poseLandmarksTex;${p?`
uniform int u_poseLandmarksTexFrameOffset;`:``}
uniform mediump sampler2D${p?`Array`:``} u_poseMask;${p?`
uniform int u_poseMaskFrameOffset;`:``}

#define POSE_LANDMARK_LEFT_EYE ${u.LEFT_EYE}
#define POSE_LANDMARK_RIGHT_EYE ${u.RIGHT_EYE}
#define POSE_LANDMARK_LEFT_SHOULDER ${u.LEFT_SHOULDER}
#define POSE_LANDMARK_RIGHT_SHOULDER ${u.RIGHT_SHOULDER}
#define POSE_LANDMARK_LEFT_ELBOW ${u.LEFT_ELBOW}
#define POSE_LANDMARK_RIGHT_ELBOW ${u.RIGHT_ELBOW}
#define POSE_LANDMARK_LEFT_HIP ${u.LEFT_HIP}
#define POSE_LANDMARK_RIGHT_HIP ${u.RIGHT_HIP}
#define POSE_LANDMARK_LEFT_KNEE ${u.LEFT_KNEE}
#define POSE_LANDMARK_RIGHT_KNEE ${u.RIGHT_KNEE}
#define POSE_LANDMARK_BODY_CENTER ${u.BODY_CENTER}
#define POSE_LANDMARK_LEFT_HAND_CENTER ${u.LEFT_HAND_CENTER}
#define POSE_LANDMARK_RIGHT_HAND_CENTER ${u.RIGHT_HAND_CENTER}
#define POSE_LANDMARK_LEFT_FOOT_CENTER ${u.LEFT_FOOT_CENTER}
#define POSE_LANDMARK_RIGHT_FOOT_CENTER ${u.RIGHT_FOOT_CENTER}
#define POSE_LANDMARK_TORSO_CENTER ${u.TORSO_CENTER}

${L(`int`,`nPosesAt`,``,p?`
	int layer = (u_poseLandmarksTexFrameOffset - framesAgo + ${p+1}) % ${p+1};
	return int(texelFetch(u_poseLandmarksTex, ivec3(0, 0, layer), 0).r + 0.5);`:`
	return int(texelFetch(u_poseLandmarksTex, ivec2(0, 0), 0).r + 0.5);`)}
${L(`vec4`,`poseLandmark`,`int poseIndex, int landmarkIndex`,`int i = 1 + poseIndex * 39 + landmarkIndex;
	int x = i % 512;
	int y = i / 512;${p?`
	int layer = (u_poseLandmarksTexFrameOffset - framesAgo + ${p+1}) % ${p+1};
	return texelFetch(u_poseLandmarksTex, ivec3(x, y, layer), 0);`:`
	return texelFetch(u_poseLandmarksTex, ivec2(x, y), 0);`}`)}
${L(`vec2`,`poseAt`,`vec2 pos`,`${z}
	float poseIndex = floor(mask.b * float(u_maxPoses) + 0.5) - 1.0;
	return vec2(mask.g, poseIndex);`)}
${L(`float`,`inPose`,`vec2 pos`,`vec2 pose = poseAt(pos${R}); return step(0.0, pose.y) * pose.x;`)}`)}}export{S as default};
//# sourceMappingURL=pose.mjs.map