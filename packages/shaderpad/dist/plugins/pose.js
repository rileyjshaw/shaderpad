Object.defineProperties(exports,{__esModule:{value:!0},[Symbol.toStringTag]:{value:`Module`}});const e=require("../index.js"),t=require("./mediapipe-common.js"),n={LEFT_EYE:2,RIGHT_EYE:5,LEFT_SHOULDER:11,RIGHT_SHOULDER:12,LEFT_ELBOW:13,RIGHT_ELBOW:14,LEFT_HIP:23,RIGHT_HIP:24,LEFT_KNEE:25,RIGHT_KNEE:26,LEFT_WRIST:15,RIGHT_WRIST:16,LEFT_PINKY:17,RIGHT_PINKY:18,LEFT_INDEX:19,RIGHT_INDEX:20,LEFT_THUMB:21,RIGHT_THUMB:22,LEFT_ANKLE:27,RIGHT_ANKLE:28,LEFT_HEEL:29,RIGHT_HEEL:30,LEFT_FOOT_INDEX:31,RIGHT_FOOT_INDEX:32,BODY_CENTER:33,LEFT_HAND_CENTER:34,RIGHT_HAND_CENTER:35,LEFT_FOOT_CENTER:36,RIGHT_FOOT_CENTER:37,TORSO_CENTER:38},r=Array.from({length:33},(e,t)=>t),i=[n.LEFT_WRIST,n.LEFT_PINKY,n.LEFT_THUMB,n.LEFT_INDEX],a=[n.RIGHT_WRIST,n.RIGHT_PINKY,n.RIGHT_THUMB,n.RIGHT_INDEX],o=[n.LEFT_ANKLE,n.LEFT_HEEL,n.LEFT_FOOT_INDEX],s=[n.RIGHT_ANKLE,n.RIGHT_HEEL,n.RIGHT_FOOT_INDEX],c=[n.LEFT_SHOULDER,n.RIGHT_SHOULDER,n.LEFT_HIP,n.RIGHT_HIP],l={modelPath:`https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,maxPoses:1,minPoseDetectionConfidence:.5,minPosePresenceConfidence:.5,minTrackingConfidence:.5},u=new Map,d=new Map;function f(e,l){let u=e.landmarks,d=l.length;u[0]=d;for(let e=0;e<d;++e){let d=l[e];for(let t=0;t<33;++t){let n=d[t],r=(1+e*39+t)*4;u[r]=n.x,u[r+1]=1-n.y,u[r+2]=n.z??0,u[r+3]=n.visibility??1}let f=t.calculateBoundingBoxCenter(u,e,r,39,1),p=(1+e*39+n.BODY_CENTER)*4;u[p]=f[0],u[p+1]=f[1],u[p+2]=f[2],u[p+3]=f[3];let m=t.calculateBoundingBoxCenter(u,e,i,39,1),h=(1+e*39+n.LEFT_HAND_CENTER)*4;u[h]=m[0],u[h+1]=m[1],u[h+2]=m[2],u[h+3]=m[3];let g=t.calculateBoundingBoxCenter(u,e,a,39,1),_=(1+e*39+n.RIGHT_HAND_CENTER)*4;u[_]=g[0],u[_+1]=g[1],u[_+2]=g[2],u[_+3]=g[3];let v=t.calculateBoundingBoxCenter(u,e,o,39,1),y=(1+e*39+n.LEFT_FOOT_CENTER)*4;u[y]=v[0],u[y+1]=v[1],u[y+2]=v[2],u[y+3]=v[3];let b=t.calculateBoundingBoxCenter(u,e,s,39,1),x=(1+e*39+n.RIGHT_FOOT_CENTER)*4;u[x]=b[0],u[x+1]=b[1],u[x+2]=b[2],u[x+3]=b[3];let S=t.calculateBoundingBoxCenter(u,e,c,39,1),C=(1+e*39+n.TORSO_CENTER)*4;u[C]=S[0],u[C+1]=S[1],u[C+2]=S[2],u[C+3]=S[3]}e.state.nPoses=d}function p(e,t){let{maskShader:n,maxPoses:r}=e;if(!t||t.length===0)return n.clear();for(let e=0;e<t.length;++e){let i=t[e];n.updateTextures({u_mask:i.getAsWebGLTexture()}),n.updateUniforms({u_poseIndex:(e+1)/r}),n.step({skipClear:e>0}),i.close()}}function m(r){let{textureName:i,wasmBaseUrl:a=t.DEFAULT_WASM_BASE_URL,options:{history:o,...s}={}}=r,c={...l,...s},m=t.hashOptions({...c,textureName:i,wasmBaseUrl:a}),h=c.maxPoses*39+1,g=Math.ceil(h/512);return function(r,s){let{injectGLSL:l,emit:h,updateTexture:_}=s,v=u.get(m),y=v?.landmarks??new Float32Array(512*g*4),b=v?.maskShader??(()=>{let n=new e.default(`#version 300 es
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
}`,{canvas:new OffscreenCanvas(1,1)});return n.initializeTexture(`u_mask`,t.dummyTexture),n.initializeUniform(`u_poseIndex`,`float`,0),n})(),x,S=!1,C=-1,w=[];function T(e){if(S||!x)return;let{nPoses:t}=x.state,n=t*39+1,i=Math.ceil(n/512),a=o?e:void 0;_(`u_poseLandmarksTex`,{data:x.landmarks,width:512,height:i,isPartial:!0},a),_(`u_poseMask`,x.maskShader,a),r.updateUniforms({u_nPoses:t},{allowMissing:!0})}function E(){S||!x||(o?(T(w.length>0?w:C),w=[]):T(C),h(`pose:result`,x.state.result))}function D(){if(S||!x)return;let e=x.subscribers;for(let[t,n]of e)if(n){if(t(),S)return;e.has(t)&&e.set(t,!1)}}async function O(){x=await t.getOrCreateSharedResource(m,u,d,async()=>{let[e,{PoseLandmarker:n}]=await Promise.all([t.getSharedFileset(a),import(`@mediapipe/tasks-vision`)]);if(S)return;let r=await n.createFromOptions(e,{baseOptions:{modelAssetPath:c.modelPath,delegate:`GPU`},canvas:b.canvas,runningMode:`VIDEO`,numPoses:c.maxPoses,minPoseDetectionConfidence:c.minPoseDetectionConfidence,minPosePresenceConfidence:c.minPosePresenceConfidence,minTrackingConfidence:c.minTrackingConfidence,outputSegmentationMasks:!0});if(S){r.close(),b.destroy();return}return{landmarker:r,maskShader:b,subscribers:new Map,maxPoses:c.maxPoses,state:{nCalls:0,runningMode:`VIDEO`,source:null,videoTime:-1,resultTimestamp:0,result:null,pending:Promise.resolve(),nPoses:0},landmarks:y}}),!(!x||S)&&(b!==x.maskShader&&b.destroy(),x.subscribers.set(E,!1))}let k=O();r.on(`_init`,()=>{r.initializeUniform(`u_maxPoses`,`int`,c.maxPoses,{allowMissing:!0}),r.initializeUniform(`u_nPoses`,`int`,0,{allowMissing:!0}),r.initializeTexture(`u_poseLandmarksTex`,{data:y,width:512,height:g},{internalFormat:`RGBA32F`,type:`FLOAT`,minFilter:`NEAREST`,magFilter:`NEAREST`,history:o}),r.initializeTexture(`u_poseMask`,b,{minFilter:`NEAREST`,magFilter:`NEAREST`,history:o}),k.then(()=>{S||!x||h(`pose:ready`)})});function A(e){S||!x||(o&&(C=(C+1)%(o+1),T(C),w.push(C)),x.subscribers.set(E,!0),j(e))}r.on(`initializeTexture`,(e,n)=>{e===i&&t.isMediaPipeSource(n)&&A(n)}),r.on(`updateTextures`,e=>{let n=e[i];t.isMediaPipeSource(n)&&A(n)});async function j(e){let t=performance.now();if(await k,S||!x)return;let n=++x.state.nCalls;x.state.pending=x.state.pending.then(async()=>{if(S||!x||n!==x.state.nCalls)return;let r=e instanceof HTMLVideoElement?`VIDEO`:`IMAGE`;if(x.state.runningMode!==r&&(x.state.runningMode=r,await x.landmarker.setOptions({runningMode:r}),S||!x||n!==x.state.nCalls))return;let i=!1;if(e===x.state.source?e instanceof HTMLVideoElement?e.currentTime!==x.state.videoTime&&(x.state.videoTime=e.currentTime,i=!0):e instanceof HTMLImageElement||t-x.state.resultTimestamp>2&&(i=!0):(x.state.source=e,x.state.videoTime=e instanceof HTMLVideoElement?e.currentTime:-1,i=!0),i){let n;if(e instanceof HTMLVideoElement){if(e.videoWidth===0||e.videoHeight===0||e.readyState<2)return;n=x.landmarker.detectForVideo(e,t)}else{if(e.width===0||e.height===0)return;n=x.landmarker.detect(e)}n&&(x.state.resultTimestamp=t,x.state.result=n,f(x,n.landmarks),p(x,n.segmentationMasks),D())}else x.state.result&&D()}),await x.state.pending}r.on(`destroy`,()=>{S=!0,x&&(x.subscribers.delete(E),x.subscribers.size===0&&(x.landmarker.close(),x.maskShader.destroy(),u.delete(m))),x=void 0});let{fn:M,historyParams:N}=t.generateGLSLFn(o),P=o?`int layer = (u_poseMaskFrameOffset - framesAgo + ${o+1}) % ${o+1};
	vec4 mask = texture(u_poseMask, vec3(pos, float(layer)));`:`vec4 mask = texture(u_poseMask, pos);`;l(`
uniform int u_maxPoses;
uniform int u_nPoses;
uniform highp sampler2D${o?`Array`:``} u_poseLandmarksTex;${o?`
uniform int u_poseLandmarksTexFrameOffset;`:``}
uniform mediump sampler2D${o?`Array`:``} u_poseMask;${o?`
uniform int u_poseMaskFrameOffset;`:``}

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

${M(`int`,`nPosesAt`,``,o?`
	int layer = (u_poseLandmarksTexFrameOffset - framesAgo + ${o+1}) % ${o+1};
	return int(texelFetch(u_poseLandmarksTex, ivec3(0, 0, layer), 0).r + 0.5);`:`
	return int(texelFetch(u_poseLandmarksTex, ivec2(0, 0), 0).r + 0.5);`)}
${M(`vec4`,`poseLandmark`,`int poseIndex, int landmarkIndex`,`int i = 1 + poseIndex * 39 + landmarkIndex;
	int x = i % 512;
	int y = i / 512;${o?`
	int layer = (u_poseLandmarksTexFrameOffset - framesAgo + ${o+1}) % ${o+1};
	return texelFetch(u_poseLandmarksTex, ivec3(x, y, layer), 0);`:`
	return texelFetch(u_poseLandmarksTex, ivec2(x, y), 0);`}`)}
${M(`vec2`,`poseAt`,`vec2 pos`,`${P}
	float poseIndex = floor(mask.b * float(u_maxPoses) + 0.5) - 1.0;
	return vec2(mask.g, poseIndex);`)}
${M(`float`,`inPose`,`vec2 pos`,`vec2 pose = poseAt(pos${N}); return step(0.0, pose.y) * pose.x;`)}`)}}exports.default=m;
//# sourceMappingURL=pose.js.map