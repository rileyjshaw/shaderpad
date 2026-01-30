"use strict";var _e=Object.create;var U=Object.defineProperty;var Te=Object.getOwnPropertyDescriptor;var pe=Object.getOwnPropertyNames;var ge=Object.getPrototypeOf,Fe=Object.prototype.hasOwnProperty;var Ae=(a,e)=>{for(var t in e)U(a,t,{get:e[t],enumerable:!0})},ee=(a,e,t,s)=>{if(e&&typeof e=="object"||typeof e=="function")for(let n of pe(e))!Fe.call(a,n)&&n!==t&&U(a,n,{get:()=>e[n],enumerable:!(s=Te(e,n))||s.enumerable});return a};var te=(a,e,t)=>(t=a!=null?_e(ge(a)):{},ee(e||!a||!a.__esModule?U(t,"default",{value:a,enumerable:!0}):t,a)),Re=a=>ee(U({},"__esModule",{value:!0}),a);var Se={};Ae(Se,{default:()=>ye});module.exports=Re(Se);var $e={data:new Uint8Array(4),width:1,height:1};function W(a){return a instanceof HTMLVideoElement||a instanceof HTMLImageElement||a instanceof HTMLCanvasElement||a instanceof OffscreenCanvas}function ne(a){return JSON.stringify(a,Object.keys(a).sort())}function V(a,e,t,s,n=0){let c=1/0,d=-1/0,u=1/0,o=-1/0,l=0,f=0;for(let E of t){let p=(n+e*s+E)*4,N=a[p],I=a[p+1];c=Math.min(c,N),d=Math.max(d,N),u=Math.min(u,I),o=Math.max(o,I),l+=a[p+2],f+=a[p+3]}return[(c+d)/2,(u+o)/2,l/t.length,f/t.length]}var G=null;function ae(){return G||(G=import("@mediapipe/tasks-vision").then(({FilesetResolver:a})=>a.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm"))),G}function re(a){return{historyParams:a?", framesAgo":"",fn:a?(s,n,c,d)=>{let u=c.replace(/\w+ /g,""),o=c?`${c}, int framesAgo`:"int framesAgo",l=u?`${u}, 0`:"0";return`${s} ${n}(${o}) {
${d}
}
${s} ${n}(${c}) { return ${n}(${l}); }`}:(s,n,c,d)=>`${s} ${n}(${c}) {
${d}
}`}}var he=`#version 300 es
in vec2 a_pos;
void main() { gl_Position = vec4(a_pos * 2.0 - 1.0, 0.0, 1.0); }`,Me=`#version 300 es
precision mediump float;
uniform vec4 u_color;
out vec4 outColor;
void main() { outColor = u_color; }`,v=478,Le=2,g=v+Le,k=512,M=1,se=[336,296,334,293,300,276,283,282,295,285],oe=[362,398,384,385,386,387,388,466,263,249,390,373,374,380,381,382],ce=[70,63,105,66,107,55,65,52,53,46],le=[33,246,161,160,159,158,157,173,133,155,154,153,145,144,163,7],me=[61,185,40,39,37,0,267,269,270,409,291,375,321,405,314,17,84,181,91,146],K=[78,191,80,81,82,13,312,311,310,415,308,324,318,402,317,14,87,178,88,95],ke=Array.from({length:v},(a,e)=>e),x={LEFT_EYEBROW:se,LEFT_EYE:oe,LEFT_EYE_CENTER:473,RIGHT_EYEBROW:ce,RIGHT_EYE:le,RIGHT_EYE_CENTER:468,NOSE_TIP:4,OUTER_MOUTH:me,INNER_MOUTH:K,FACE_CENTER:v,MOUTH_CENTER:v+1},ue=["BACKGROUND","LEFT_EYEBROW","RIGHT_EYEBROW","LEFT_EYE","RIGHT_EYE","OUTER_MOUTH","INNER_MOUTH"],fe=ue.length-1,h=Object.fromEntries(ue.map((a,e)=>[a,e/fe])),ie=.5/fe,Oe={modelPath:"https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",maxFaces:1,minFaceDetectionConfidence:.5,minFacePresenceConfidence:.5,minTrackingConfidence:.5,outputFaceBlendshapes:!1,outputFacialTransformationMatrixes:!1};function O(a){let e=[];for(let t=1;t<a.length-1;++t)e.push(a[0],a[t],a[t+1]);return e}var T=null;function xe(a){if(!T){let e=a.FACE_LANDMARKS_TESSELATION,t=[];for(let n=0;n<e.length-2;n+=3)t.push(e[n].start,e[n+1].start,e[n+2].start);let s=a.FACE_LANDMARKS_FACE_OVAL.map(({start:n})=>n);T=Object.fromEntries(Object.entries({LEFT_EYEBROW:O(se),RIGHT_EYEBROW:O(ce),LEFT_EYE:O(oe),RIGHT_EYE:O(le),OUTER_MOUTH:O(me),INNER_MOUTH:O(K),TESSELATION:t,OVAL:O(s)}).map(([n,c])=>[n,{triangles:c,vertices:new Float32Array(c.length*2)}]))}}var S=new Map;function be(a){let e=a.getContext("webgl2",{antialias:!1,preserveDrawingBuffer:!0}),t=e.createShader(e.VERTEX_SHADER);e.shaderSource(t,he),e.compileShader(t);let s=e.createShader(e.FRAGMENT_SHADER);e.shaderSource(s,Me),e.compileShader(s);let n=e.createProgram();e.attachShader(n,t),e.attachShader(n,s),e.linkProgram(n),e.deleteShader(t),e.deleteShader(s);let c=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,c);let d=e.getAttribLocation(n,"a_pos");e.enableVertexAttribArray(d),e.vertexAttribPointer(d,2,e.FLOAT,!1,0,0);let u=e.getUniformLocation(n,"u_color");return e.useProgram(n),e.enable(e.BLEND),e.blendEquation(e.MAX),{canvas:a,gl:e,program:n,positionBuffer:c,colorLocation:u}}function R(a,e,t,s,n,c,d){let{triangles:u,vertices:o}=t,{gl:l,colorLocation:f}=a;for(let E=0;E<u.length;++E){let p=(M+s*g+u[E])*4;o[E*2]=e[p],o[E*2+1]=e[p+1]}l.bufferData(l.ARRAY_BUFFER,o,l.DYNAMIC_DRAW),l.uniform4f(f,n,c,d,1),l.drawArrays(l.TRIANGLES,0,u.length)}function Ne(a,e){let t=a.landmarks.data,s=e.length;t[0]=s;for(let n=0;n<s;++n){let c=e[n];for(let o=0;o<v;++o){let l=c[o],f=(M+n*g+o)*4;t[f]=l.x,t[f+1]=1-l.y,t[f+2]=l.z??0,t[f+3]=l.visibility??1}let d=V(t,n,ke,g,M);t.set(d,(M+n*g+x.FACE_CENTER)*4);let u=V(t,n,K,g,1);t.set(u,(M+n*g+x.MOUTH_CENTER)*4)}a.state.nFaces=s}function Ie(a,e,t){let{mask:s,maxFaces:n,landmarks:c,state:{nFaces:d}}=a,{gl:u,canvas:o}=s,{data:l}=c;if((o.width!==e||o.height!==t)&&(o.width=e,o.height=t),u.viewport(0,0,o.width,o.height),u.clearColor(0,0,0,0),u.clear(u.COLOR_BUFFER_BIT),!!T)for(let f=0;f<d;++f){let E=(f+1)/n;R(s,l,T.TESSELATION,f,0,.5,E),R(s,l,T.OVAL,f,0,1,E),R(s,l,T.LEFT_EYEBROW,f,h.LEFT_EYEBROW,0,E),R(s,l,T.RIGHT_EYEBROW,f,h.RIGHT_EYEBROW,0,E),R(s,l,T.LEFT_EYE,f,h.LEFT_EYE,0,E),R(s,l,T.RIGHT_EYE,f,h.RIGHT_EYE,0,E),R(s,l,T.OUTER_MOUTH,f,h.OUTER_MOUTH,0,E),R(s,l,T.INNER_MOUTH,f,h.INNER_MOUTH,0,E)}}function Ce(a){let{textureName:e,options:{history:t,...s}={}}=a,n={...Oe,...s},c=ne({...n,textureName:e}),d=n.maxFaces*g+M,u=Math.ceil(d/k);return function(o,l){let{injectGLSL:f,emitHook:E}=l,p=S.get(c),N=p?.landmarks.data??new Float32Array(k*u*4),I=p?.mask.canvas??new OffscreenCanvas(1,1),r=null,$=!1,P=!1;function Y(i){if(!r)return;let m=r.state.nFaces,_=m*g+M,C=Math.ceil(_/k),F=i;typeof F>"u"&&D.length>0&&(F=D,D=[]),o.updateTextures({u_faceLandmarksTex:{data:r.landmarks.data,width:k,height:C,isPartial:!0},u_faceMask:r.mask.canvas},t?{skipHistoryWrite:P,historyWriteIndex:F}:void 0),o.updateUniforms({u_nFaces:m}),E("face:result",r.state.result)}async function Ee(){if(S.has(c))r=S.get(c);else{let[i,{FaceLandmarker:m}]=await Promise.all([ae(),import("@mediapipe/tasks-vision")]);if($)return;let _=await m.createFromOptions(i,{baseOptions:{modelAssetPath:n.modelPath,delegate:"GPU"},runningMode:"VIDEO",numFaces:n.maxFaces,minFaceDetectionConfidence:n.minFaceDetectionConfidence,minFacePresenceConfidence:n.minFacePresenceConfidence,minTrackingConfidence:n.minTrackingConfidence,outputFaceBlendshapes:n.outputFaceBlendshapes,outputFacialTransformationMatrixes:n.outputFacialTransformationMatrixes});if($){_.close();return}r={landmarker:_,mask:be(I),subscribers:new Map,maxFaces:n.maxFaces,state:{nCalls:0,runningMode:"VIDEO",source:null,videoTime:-1,resultTimestamp:0,result:null,pending:Promise.resolve(),nFaces:0},landmarks:{data:N,textureHeight:u}},xe(m),S.set(c,r)}r.subscribers.set(Y,!1)}let z=Ee();async function j(i){let m=performance.now();if(await z,!r)return;let _=++r.state.nCalls;r.state.pending=r.state.pending.then(async()=>{if(!r||_!==r.state.nCalls)return;let C=i instanceof HTMLVideoElement?"VIDEO":"IMAGE";r.state.runningMode!==C&&(r.state.runningMode=C,await r.landmarker.setOptions({runningMode:C}));let F=!1;if(i!==r.state.source?(r.state.source=i,r.state.videoTime=-1,F=!0):i instanceof HTMLVideoElement?i.currentTime!==r.state.videoTime&&(r.state.videoTime=i.currentTime,F=!0):i instanceof HTMLImageElement||m-r.state.resultTimestamp>2&&(F=!0),F){let A,y,w;if(i instanceof HTMLVideoElement){if(i.videoWidth===0||i.videoHeight===0||i.readyState<2)return;y=i.videoWidth,w=i.videoHeight,A=r.landmarker.detectForVideo(i,m)}else{if(i.width===0||i.height===0)return;y=i.width,w=i.height,A=r.landmarker.detect(i)}if(A){r.state.resultTimestamp=m,r.state.result=A,Ne(r,A.faceLandmarks),Ie(r,y,w);for(let Q of r.subscribers.keys())Q(),r.subscribers.set(Q,!0)}}else if(r.state.result)for(let[A,y]of r.subscribers.entries())y||(A(),r.subscribers.set(A,!0))}),await r.state.pending}o.on("init",()=>{o.initializeUniform("u_maxFaces","int",n.maxFaces),o.initializeUniform("u_nFaces","int",0),o.initializeTexture("u_faceLandmarksTex",{data:N,width:k,height:u},{internalFormat:"RGBA32F",type:"FLOAT",minFilter:"NEAREST",magFilter:"NEAREST",history:t}),o.initializeTexture("u_faceMask",I,{minFilter:"NEAREST",magFilter:"NEAREST",history:t}),z.then(()=>{$||!r||E("face:ready")})});let H=0,D=[],X=()=>{t&&(Y(H),D.push(H),H=(H+1)%(t+1))};o.on("initializeTexture",(i,m)=>{i===e&&W(m)&&(X(),j(m))}),o.on("updateTextures",(i,m)=>{let _=i[e];W(_)&&(P=m?.skipHistoryWrite??!1,P||X(),j(_))}),o.on("destroy",()=>{$=!0,r&&(r.subscribers.delete(Y),r.subscribers.size===0&&(r.landmarker.close(),r.mask.gl.deleteProgram(r.mask.program),r.mask.gl.deleteBuffer(r.mask.positionBuffer),S.delete(c))),r=null});let{fn:b,historyParams:B}=re(t),q=t?"_sampleFaceMask(pos, framesAgo)":"texture(u_faceMask, pos)",L=(i,m,_=m)=>b("vec2",`${i}At`,"vec2 pos",`vec4 mask = ${q};
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return (mask.r > ${(h[m]-ie).toFixed(4)} && mask.r < ${(h[_]+ie).toFixed(4)}) ? vec2(1.0, faceIndex) : vec2(0.0, -1.0);`),J=(i,m)=>b("vec2",`${i}At`,"vec2 pos",`vec4 mask = ${q};
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return mask.g > ${m.toFixed(2)} ? vec2(1.0, faceIndex) : vec2(0.0, -1.0);`),Z=(i,m,_)=>b("vec2",`${i}At`,"vec2 pos",`vec2 left = ${m}(pos${B});
	return left.x > 0.0 ? left : ${_}(pos${B});`),de=i=>i.map(m=>b("float",`in${m[0].toUpperCase()+m.slice(1)}`,"vec2 pos",`vec2 a = ${m}At(pos${B}); return step(0.0, a.y) * a.x;`)).join(`
`);f(`
uniform int u_maxFaces;
uniform int u_nFaces;
uniform highp sampler2D${t?"Array":""} u_faceLandmarksTex;${t?`
uniform int u_faceLandmarksTexFrameOffset;`:""}
uniform ${t?"highp":"mediump"} sampler2D${t?"Array":""} u_faceMask;${t?`
uniform int u_faceMaskFrameOffset;`:""}

#define FACE_LANDMARK_L_EYE_CENTER ${x.LEFT_EYE_CENTER}
#define FACE_LANDMARK_R_EYE_CENTER ${x.RIGHT_EYE_CENTER}
#define FACE_LANDMARK_NOSE_TIP ${x.NOSE_TIP}
#define FACE_LANDMARK_FACE_CENTER ${x.FACE_CENTER}
#define FACE_LANDMARK_MOUTH_CENTER ${x.MOUTH_CENTER}

${b("int","nFacesAt","",t?`
	int layer = (u_faceLandmarksTexFrameOffset - framesAgo + ${t+1}) % ${t+1};
	return int(texelFetch(u_faceLandmarksTex, ivec3(0, 0, layer), 0).r + 0.5);`:`
	return int(texelFetch(u_faceLandmarksTex, ivec2(0, 0), 0).r + 0.5);`)}
${b("vec4","faceLandmark","int faceIndex, int landmarkIndex",`int i = ${M} + faceIndex * ${g} + landmarkIndex;
	int x = i % ${k};
	int y = i / ${k};${t?`
	int layer = (u_faceLandmarksTexFrameOffset - framesAgo + ${t+1}) % ${t+1};
	return texelFetch(u_faceLandmarksTex, ivec3(x, y, layer), 0);`:`
	return texelFetch(u_faceLandmarksTex, ivec2(x, y), 0);`}`)}
${t?`
vec4 _sampleFaceMask(vec2 pos, int framesAgo) {
	int layer = (u_faceMaskFrameOffset - framesAgo + ${t+1}) % ${t+1};
	return texture(u_faceMask, vec3(pos, float(layer)));
}
`:""}
${L("leftEyebrow","LEFT_EYEBROW")}
${L("rightEyebrow","RIGHT_EYEBROW")}
${L("leftEye","LEFT_EYE")}
${L("rightEye","RIGHT_EYE")}
${L("lips","OUTER_MOUTH")}
${L("outerMouth","OUTER_MOUTH","INNER_MOUTH")}
${L("innerMouth","INNER_MOUTH")}
${J("faceOval",.75)}
${J("face",.25)}
${Z("eye","leftEyeAt","rightEyeAt")}
${Z("eyebrow","leftEyebrowAt","rightEyebrowAt")}
${de(["eyebrow","eye","outerMouth","innerMouth","lips","face"])}`)}}var ye=Ce;
//# sourceMappingURL=face.js.map