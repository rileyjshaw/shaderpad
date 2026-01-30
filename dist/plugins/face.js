"use strict";var Te=Object.create;var U=Object.defineProperty;var pe=Object.getOwnPropertyDescriptor;var ge=Object.getOwnPropertyNames;var Fe=Object.getPrototypeOf,Ae=Object.prototype.hasOwnProperty;var Re=(a,e)=>{for(var t in e)U(a,t,{get:e[t],enumerable:!0})},te=(a,e,t,s)=>{if(e&&typeof e=="object"||typeof e=="function")for(let n of ge(e))!Ae.call(a,n)&&n!==t&&U(a,n,{get:()=>e[n],enumerable:!(s=pe(e,n))||s.enumerable});return a};var ne=(a,e,t)=>(t=a!=null?Te(Fe(a)):{},te(e||!a||!a.__esModule?U(t,"default",{value:a,enumerable:!0}):t,a)),he=a=>te(U({},"__esModule",{value:!0}),a);var ve={};Re(ve,{default:()=>Se});module.exports=he(ve);var De={data:new Uint8Array(4),width:1,height:1};function W(a){return a instanceof HTMLVideoElement||a instanceof HTMLImageElement||a instanceof HTMLCanvasElement||a instanceof OffscreenCanvas}function ae(a){return JSON.stringify(a,Object.keys(a).sort())}function V(a,e,t,s,n=0){let c=1/0,d=-1/0,u=1/0,o=-1/0,m=0,f=0;for(let E of t){let p=(n+e*s+E)*4,I=a[p],C=a[p+1];c=Math.min(c,I),d=Math.max(d,I),u=Math.min(u,C),o=Math.max(o,C),m+=a[p+2],f+=a[p+3]}return[(c+d)/2,(u+o)/2,m/t.length,f/t.length]}var G=null;function re(){return G||(G=import("@mediapipe/tasks-vision").then(({FilesetResolver:a})=>a.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm"))),G}function ie(a){return{historyParams:a?", framesAgo":"",fn:a?(s,n,c,d)=>{let u=c.replace(/\w+ /g,""),o=c?`${c}, int framesAgo`:"int framesAgo",m=u?`${u}, 0`:"0";return`${s} ${n}(${o}) {
${d}
}
${s} ${n}(${c}) { return ${n}(${m}); }`}:(s,n,c,d)=>`${s} ${n}(${c}) {
${d}
}`}}var Me=`#version 300 es
in vec2 a_pos;
void main() { gl_Position = vec4(a_pos * 2.0 - 1.0, 0.0, 1.0); }`,Le=`#version 300 es
precision mediump float;
uniform vec4 u_color;
out vec4 outColor;
void main() { outColor = u_color; }`,v=478,Oe=2,g=v+Oe,k=512,L=1,oe=[336,296,334,293,300,276,283,282,295,285],ce=[362,398,384,385,386,387,388,466,263,249,390,373,374,380,381,382],me=[70,63,105,66,107,55,65,52,53,46],le=[33,246,161,160,159,158,157,173,133,155,154,153,145,144,163,7],ue=[61,185,40,39,37,0,267,269,270,409,291,375,321,405,314,17,84,181,91,146],K=[78,191,80,81,82,13,312,311,310,415,308,324,318,402,317,14,87,178,88,95],ke=Array.from({length:v},(a,e)=>e),b={LEFT_EYEBROW:oe,LEFT_EYE:ce,LEFT_EYE_CENTER:473,RIGHT_EYEBROW:me,RIGHT_EYE:le,RIGHT_EYE_CENTER:468,NOSE_TIP:4,OUTER_MOUTH:ue,INNER_MOUTH:K,FACE_CENTER:v,MOUTH_CENTER:v+1},fe=["BACKGROUND","LEFT_EYEBROW","RIGHT_EYEBROW","LEFT_EYE","RIGHT_EYE","OUTER_MOUTH","INNER_MOUTH"],Ee=fe.length-1,M=Object.fromEntries(fe.map((a,e)=>[a,e/Ee])),se=.5/Ee,xe={modelPath:"https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",maxFaces:1,minFaceDetectionConfidence:.5,minFacePresenceConfidence:.5,minTrackingConfidence:.5,outputFaceBlendshapes:!1,outputFacialTransformationMatrixes:!1};function x(a){let e=[];for(let t=1;t<a.length-1;++t)e.push(a[0],a[t],a[t+1]);return e}var T=null;function be(a){if(!T){let e=a.FACE_LANDMARKS_TESSELATION,t=[];for(let n=0;n<e.length-2;n+=3)t.push(e[n].start,e[n+1].start,e[n+2].start);let s=a.FACE_LANDMARKS_FACE_OVAL.map(({start:n})=>n);T=Object.fromEntries(Object.entries({LEFT_EYEBROW:x(oe),RIGHT_EYEBROW:x(me),LEFT_EYE:x(ce),RIGHT_EYE:x(le),OUTER_MOUTH:x(ue),INNER_MOUTH:x(K),TESSELATION:t,OVAL:x(s)}).map(([n,c])=>[n,{triangles:c,vertices:new Float32Array(c.length*2)}]))}}var S=new Map;function Ne(a){let e=a.getContext("webgl2",{antialias:!1,preserveDrawingBuffer:!0}),t=e.createShader(e.VERTEX_SHADER);e.shaderSource(t,Me),e.compileShader(t);let s=e.createShader(e.FRAGMENT_SHADER);e.shaderSource(s,Le),e.compileShader(s);let n=e.createProgram();e.attachShader(n,t),e.attachShader(n,s),e.linkProgram(n),e.deleteShader(t),e.deleteShader(s);let c=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,c);let d=e.getAttribLocation(n,"a_pos");e.enableVertexAttribArray(d),e.vertexAttribPointer(d,2,e.FLOAT,!1,0,0);let u=e.getUniformLocation(n,"u_color");return e.useProgram(n),e.enable(e.BLEND),e.blendEquation(e.MAX),{canvas:a,gl:e,program:n,positionBuffer:c,colorLocation:u}}function h(a,e,t,s,n,c,d){let{triangles:u,vertices:o}=t,{gl:m,colorLocation:f}=a;for(let E=0;E<u.length;++E){let p=(L+s*g+u[E])*4;o[E*2]=e[p],o[E*2+1]=e[p+1]}m.bufferData(m.ARRAY_BUFFER,o,m.DYNAMIC_DRAW),m.uniform4f(f,n,c,d,1),m.drawArrays(m.TRIANGLES,0,u.length)}function Ie(a,e){let t=a.landmarks.data,s=e.length;t[0]=s;for(let n=0;n<s;++n){let c=e[n];for(let o=0;o<v;++o){let m=c[o],f=(L+n*g+o)*4;t[f]=m.x,t[f+1]=1-m.y,t[f+2]=m.z??0,t[f+3]=m.visibility??1}let d=V(t,n,ke,g,L);t.set(d,(L+n*g+b.FACE_CENTER)*4);let u=V(t,n,K,g,1);t.set(u,(L+n*g+b.MOUTH_CENTER)*4)}a.state.nFaces=s}function Ce(a,e,t){let{mask:s,maxFaces:n,landmarks:c,state:{nFaces:d}}=a,{gl:u,canvas:o}=s,{data:m}=c;if((o.width!==e||o.height!==t)&&(o.width=e,o.height=t),u.viewport(0,0,o.width,o.height),u.clearColor(0,0,0,0),u.clear(u.COLOR_BUFFER_BIT),!!T)for(let f=0;f<d;++f){let E=(f+1)/n;h(s,m,T.TESSELATION,f,0,.5,E),h(s,m,T.OVAL,f,0,1,E),h(s,m,T.LEFT_EYEBROW,f,M.LEFT_EYEBROW,0,E),h(s,m,T.RIGHT_EYEBROW,f,M.RIGHT_EYEBROW,0,E),h(s,m,T.LEFT_EYE,f,M.LEFT_EYE,0,E),h(s,m,T.RIGHT_EYE,f,M.RIGHT_EYE,0,E),h(s,m,T.OUTER_MOUTH,f,M.OUTER_MOUTH,0,E),h(s,m,T.INNER_MOUTH,f,M.INNER_MOUTH,0,E)}}function ye(a){let{textureName:e,options:{history:t,...s}={}}=a,n={...xe,...s},c=ae({...n,textureName:e}),d=n.maxFaces*g+L,u=Math.ceil(d/k);return function(o,m){let{injectGLSL:f,emitHook:E}=m,p=S.get(c),I=p?.landmarks.data??new Float32Array(k*u*4),C=p?.mask.canvas??new OffscreenCanvas(1,1),r=null,$=!1,P=!1;function Y(i){if(!r)return;let l=r.state.nFaces,_=l*g+L,F=Math.ceil(_/k),A=i;typeof A>"u"&&H.length>0&&(A=H,H=[]),o.updateTextures({u_faceLandmarksTex:{data:r.landmarks.data,width:k,height:F,isPartial:!0},u_faceMask:r.mask.canvas},t?{skipHistoryWrite:P,historyWriteIndex:A}:void 0),o.updateUniforms({u_nFaces:l}),E("face:result",r.state.result)}async function de(){if(S.has(c))r=S.get(c);else{let[i,{FaceLandmarker:l}]=await Promise.all([re(),import("@mediapipe/tasks-vision")]);if($)return;let _=new OffscreenCanvas(1,1),F=await l.createFromOptions(i,{baseOptions:{modelAssetPath:n.modelPath,delegate:"GPU"},canvas:_,runningMode:"VIDEO",numFaces:n.maxFaces,minFaceDetectionConfidence:n.minFaceDetectionConfidence,minFacePresenceConfidence:n.minFacePresenceConfidence,minTrackingConfidence:n.minTrackingConfidence,outputFaceBlendshapes:n.outputFaceBlendshapes,outputFacialTransformationMatrixes:n.outputFacialTransformationMatrixes});if($){F.close();return}r={landmarker:F,mediapipeCanvas:_,mask:Ne(C),subscribers:new Map,maxFaces:n.maxFaces,state:{runningMode:"VIDEO",source:null,videoTime:-1,resultTimestamp:0,result:null,pending:Promise.resolve(),nFaces:0},landmarks:{data:I,textureHeight:u}},be(l),S.set(c,r)}r.subscribers.set(Y,!1)}let z=de(),j=0;async function X(i){let l=performance.now(),_=++j;await z,r&&(r.state.pending=r.state.pending.then(async()=>{if(_!==j||!r)return;let F=i instanceof HTMLVideoElement?"VIDEO":"IMAGE";r.state.runningMode!==F&&(r.state.runningMode=F,await r.landmarker.setOptions({runningMode:F}));let A=!1;if(i!==r.state.source?(r.state.source=i,r.state.videoTime=-1,A=!0):i instanceof HTMLVideoElement?i.currentTime!==r.state.videoTime&&(r.state.videoTime=i.currentTime,A=!0):i instanceof HTMLImageElement||l-r.state.resultTimestamp>2&&(A=!0),A){let R,y,w;if(i instanceof HTMLVideoElement){if(i.videoWidth===0||i.videoHeight===0||i.readyState<2)return;y=i.videoWidth,w=i.videoHeight,R=r.landmarker.detectForVideo(i,l)}else{if(i.width===0||i.height===0)return;y=i.width,w=i.height,R=r.landmarker.detect(i)}if(R){r.state.resultTimestamp=l,r.state.result=R,Ie(r,R.faceLandmarks),Ce(r,y,w);for(let ee of r.subscribers.keys())ee(),r.subscribers.set(ee,!0)}}else if(r.state.result)for(let[R,y]of r.subscribers.entries())y||(R(),r.subscribers.set(R,!0))}),await r.state.pending)}o.on("init",()=>{o.initializeUniform("u_maxFaces","int",n.maxFaces),o.initializeUniform("u_nFaces","int",0),o.initializeTexture("u_faceLandmarksTex",{data:I,width:k,height:u},{internalFormat:"RGBA32F",type:"FLOAT",minFilter:"NEAREST",magFilter:"NEAREST",history:t}),o.initializeTexture("u_faceMask",C,{minFilter:"NEAREST",magFilter:"NEAREST",history:t}),z.then(()=>{$||!r||E("face:ready")})});let D=0,H=[],q=()=>{t&&(Y(D),H.push(D),D=(D+1)%(t+1))};o.on("initializeTexture",(i,l)=>{i===e&&W(l)&&(q(),X(l))}),o.on("updateTextures",(i,l)=>{let _=i[e];W(_)&&(P=l?.skipHistoryWrite??!1,P||q(),X(_))}),o.on("destroy",()=>{$=!0,r&&(r.subscribers.delete(Y),r.subscribers.size===0&&(r.landmarker.close(),r.mask.gl.deleteProgram(r.mask.program),r.mask.gl.deleteBuffer(r.mask.positionBuffer),S.delete(c))),r=null});let{fn:N,historyParams:B}=ie(t),J=t?"_sampleFaceMask(pos, framesAgo)":"texture(u_faceMask, pos)",O=(i,l,_=l)=>N("vec2",`${i}At`,"vec2 pos",`vec4 mask = ${J};
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return (mask.r > ${(M[l]-se).toFixed(4)} && mask.r < ${(M[_]+se).toFixed(4)}) ? vec2(1.0, faceIndex) : vec2(0.0, -1.0);`),Z=(i,l)=>N("vec2",`${i}At`,"vec2 pos",`vec4 mask = ${J};
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return mask.g > ${l.toFixed(2)} ? vec2(1.0, faceIndex) : vec2(0.0, -1.0);`),Q=(i,l,_)=>N("vec2",`${i}At`,"vec2 pos",`vec2 left = ${l}(pos${B});
	return left.x > 0.0 ? left : ${_}(pos${B});`),_e=i=>i.map(l=>N("float",`in${l[0].toUpperCase()+l.slice(1)}`,"vec2 pos",`vec2 a = ${l}At(pos${B}); return step(0.0, a.y) * a.x;`)).join(`
`);f(`
uniform int u_maxFaces;
uniform int u_nFaces;
uniform highp sampler2D${t?"Array":""} u_faceLandmarksTex;${t?`
uniform int u_faceLandmarksTexFrameOffset;`:""}
uniform ${t?"highp":"mediump"} sampler2D${t?"Array":""} u_faceMask;${t?`
uniform int u_faceMaskFrameOffset;`:""}

#define FACE_LANDMARK_L_EYE_CENTER ${b.LEFT_EYE_CENTER}
#define FACE_LANDMARK_R_EYE_CENTER ${b.RIGHT_EYE_CENTER}
#define FACE_LANDMARK_NOSE_TIP ${b.NOSE_TIP}
#define FACE_LANDMARK_FACE_CENTER ${b.FACE_CENTER}
#define FACE_LANDMARK_MOUTH_CENTER ${b.MOUTH_CENTER}

${N("int","nFacesAt","",t?`
	int layer = (u_faceLandmarksTexFrameOffset - framesAgo + ${t+1}) % ${t+1};
	return int(texelFetch(u_faceLandmarksTex, ivec3(0, 0, layer), 0).r + 0.5);`:`
	return int(texelFetch(u_faceLandmarksTex, ivec2(0, 0), 0).r + 0.5);`)}
${N("vec4","faceLandmark","int faceIndex, int landmarkIndex",`int i = ${L} + faceIndex * ${g} + landmarkIndex;
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
${O("leftEyebrow","LEFT_EYEBROW")}
${O("rightEyebrow","RIGHT_EYEBROW")}
${O("leftEye","LEFT_EYE")}
${O("rightEye","RIGHT_EYE")}
${O("lips","OUTER_MOUTH")}
${O("outerMouth","OUTER_MOUTH","INNER_MOUTH")}
${O("innerMouth","INNER_MOUTH")}
${Z("faceOval",.75)}
${Z("face",.25)}
${Q("eye","leftEyeAt","rightEyeAt")}
${Q("eyebrow","leftEyebrowAt","rightEyebrowAt")}
${_e(["eyebrow","eye","outerMouth","innerMouth","lips","face"])}`)}}var Se=ye;
//# sourceMappingURL=face.js.map