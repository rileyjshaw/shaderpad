"use strict";var Ee=Object.create;var D=Object.defineProperty;var de=Object.getOwnPropertyDescriptor;var _e=Object.getOwnPropertyNames;var Te=Object.getPrototypeOf,pe=Object.prototype.hasOwnProperty;var ge=(a,e)=>{for(var t in e)D(a,t,{get:e[t],enumerable:!0})},Z=(a,e,t,s)=>{if(e&&typeof e=="object"||typeof e=="function")for(let n of _e(e))!pe.call(a,n)&&n!==t&&D(a,n,{get:()=>e[n],enumerable:!(s=de(e,n))||s.enumerable});return a};var Q=(a,e,t)=>(t=a!=null?Ee(Te(a)):{},Z(e||!a||!a.__esModule?D(t,"default",{value:a,enumerable:!0}):t,a)),Fe=a=>Z(D({},"__esModule",{value:!0}),a);var Ce={};ge(Ce,{default:()=>Ie});module.exports=Fe(Ce);var ye={data:new Uint8Array(4),width:1,height:1};function B(a){return a instanceof HTMLVideoElement||a instanceof HTMLImageElement||a instanceof HTMLCanvasElement||a instanceof OffscreenCanvas}function ee(a){return JSON.stringify(a,Object.keys(a).sort())}function w(a,e,t,s,n=0){let c=1/0,d=-1/0,u=1/0,o=-1/0,m=0,f=0;for(let E of t){let p=(n+e*s+E)*4,b=a[p],N=a[p+1];c=Math.min(c,b),d=Math.max(d,b),u=Math.min(u,N),o=Math.max(o,N),m+=a[p+2],f+=a[p+3]}return[(c+d)/2,(u+o)/2,m/t.length,f/t.length]}var Y=null;function te(){return Y||(Y=import("@mediapipe/tasks-vision").then(({FilesetResolver:a})=>a.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm"))),Y}function ne(a){return{historyParams:a?", framesAgo":"",fn:a?(s,n,c,d)=>{let u=c.replace(/\w+ /g,""),o=c?`${c}, int framesAgo`:"int framesAgo",m=u?`${u}, 0`:"0";return`${s} ${n}(${o}) {
${d}
}
${s} ${n}(${c}) { return ${n}(${m}); }`}:(s,n,c,d)=>`${s} ${n}(${c}) {
${d}
}`}}var Ae=`#version 300 es
in vec2 a_pos;
void main() { gl_Position = vec4(a_pos * 2.0 - 1.0, 0.0, 1.0); }`,Re=`#version 300 es
precision mediump float;
uniform vec4 u_color;
out vec4 outColor;
void main() { outColor = u_color; }`,y=478,he=2,g=y+he,M=512,R=1,re=[336,296,334,293,300,276,283,282,295,285],ie=[362,398,384,385,386,387,388,466,263,249,390,373,374,380,381,382],se=[70,63,105,66,107,55,65,52,53,46],oe=[33,246,161,160,159,158,157,173,133,155,154,153,145,144,163,7],ce=[61,185,40,39,37,0,267,269,270,409,291,375,321,405,314,17,84,181,91,146],G=[78,191,80,81,82,13,312,311,310,415,308,324,318,402,317,14,87,178,88,95],Me=Array.from({length:y},(a,e)=>e),O={LEFT_EYEBROW:re,LEFT_EYE:ie,LEFT_EYE_CENTER:473,RIGHT_EYEBROW:se,RIGHT_EYE:oe,RIGHT_EYE_CENTER:468,NOSE_TIP:4,OUTER_MOUTH:ce,INNER_MOUTH:G,FACE_CENTER:y,MOUTH_CENTER:y+1},me=["BACKGROUND","LEFT_EYEBROW","RIGHT_EYEBROW","LEFT_EYE","RIGHT_EYE","OUTER_MOUTH","INNER_MOUTH"],le=me.length-1,A=Object.fromEntries(me.map((a,e)=>[a,e/le])),ae=.5/le,Le={modelPath:"https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",maxFaces:1,minFaceDetectionConfidence:.5,minFacePresenceConfidence:.5,minTrackingConfidence:.5,outputFaceBlendshapes:!1,outputFacialTransformationMatrixes:!1};function L(a){let e=[];for(let t=1;t<a.length-1;++t)e.push(a[0],a[t],a[t+1]);return e}var T=null;function Oe(a){if(!T){let e=a.FACE_LANDMARKS_TESSELATION,t=[];for(let n=0;n<e.length-2;n+=3)t.push(e[n].start,e[n+1].start,e[n+2].start);let s=a.FACE_LANDMARKS_FACE_OVAL.map(({start:n})=>n);T=Object.fromEntries(Object.entries({LEFT_EYEBROW:L(re),RIGHT_EYEBROW:L(se),LEFT_EYE:L(ie),RIGHT_EYE:L(oe),OUTER_MOUTH:L(ce),INNER_MOUTH:L(G),TESSELATION:t,OVAL:L(s)}).map(([n,c])=>[n,{triangles:c,vertices:new Float32Array(c.length*2)}]))}}var S=new Map;function ke(a){let e=a.getContext("webgl2",{antialias:!1,preserveDrawingBuffer:!0}),t=e.createShader(e.VERTEX_SHADER);e.shaderSource(t,Ae),e.compileShader(t);let s=e.createShader(e.FRAGMENT_SHADER);e.shaderSource(s,Re),e.compileShader(s);let n=e.createProgram();e.attachShader(n,t),e.attachShader(n,s),e.linkProgram(n),e.deleteShader(t),e.deleteShader(s);let c=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,c);let d=e.getAttribLocation(n,"a_pos");e.enableVertexAttribArray(d),e.vertexAttribPointer(d,2,e.FLOAT,!1,0,0);let u=e.getUniformLocation(n,"u_color");return e.useProgram(n),e.enable(e.BLEND),e.blendEquation(e.MAX),{canvas:a,gl:e,program:n,positionBuffer:c,colorLocation:u}}function F(a,e,t,s,n,c,d){let{triangles:u,vertices:o}=t,{gl:m,colorLocation:f}=a;for(let E=0;E<u.length;++E){let p=(R+s*g+u[E])*4;o[E*2]=e[p],o[E*2+1]=e[p+1]}m.bufferData(m.ARRAY_BUFFER,o,m.DYNAMIC_DRAW),m.uniform4f(f,n,c,d,1),m.drawArrays(m.TRIANGLES,0,u.length)}function xe(a,e){let t=a.landmarks.data,s=e.length;t[0]=s;for(let n=0;n<s;++n){let c=e[n];for(let o=0;o<y;++o){let m=c[o],f=(R+n*g+o)*4;t[f]=m.x,t[f+1]=1-m.y,t[f+2]=m.z??0,t[f+3]=m.visibility??1}let d=w(t,n,Me,g,R);t.set(d,(R+n*g+O.FACE_CENTER)*4);let u=w(t,n,G,g,1);t.set(u,(R+n*g+O.MOUTH_CENTER)*4)}a.state.nFaces=s}function be(a,e,t){let{mask:s,maxFaces:n,landmarks:c,state:{nFaces:d}}=a,{gl:u,canvas:o}=s,{data:m}=c;if((o.width!==e||o.height!==t)&&(o.width=e,o.height=t),u.viewport(0,0,o.width,o.height),u.clearColor(0,0,0,0),u.clear(u.COLOR_BUFFER_BIT),!!T)for(let f=0;f<d;++f){let E=(f+1)/n;F(s,m,T.TESSELATION,f,0,.5,E),F(s,m,T.OVAL,f,0,1,E),F(s,m,T.LEFT_EYEBROW,f,A.LEFT_EYEBROW,0,E),F(s,m,T.RIGHT_EYEBROW,f,A.RIGHT_EYEBROW,0,E),F(s,m,T.LEFT_EYE,f,A.LEFT_EYE,0,E),F(s,m,T.RIGHT_EYE,f,A.RIGHT_EYE,0,E),F(s,m,T.OUTER_MOUTH,f,A.OUTER_MOUTH,0,E),F(s,m,T.INNER_MOUTH,f,A.INNER_MOUTH,0,E)}}function Ne(a){let{textureName:e,options:{history:t,...s}={}}=a,n={...Le,...s},c=ee({...n,textureName:e}),d=n.maxFaces*g+R,u=Math.ceil(d/M);return function(o,m){let{injectGLSL:f,emitHook:E}=m,p=S.get(c),b=p?.landmarks.data??new Float32Array(M*u*4),N=p?.mask.canvas??new OffscreenCanvas(1,1),r=null,v=!1,W=!1;function I(){if(!r)return;let i=r.state.nFaces,l=i*g+R,_=Math.ceil(l/M);o.updateTextures({u_faceLandmarksTex:{data:r.landmarks.data,width:M,height:_,isPartial:!0},u_faceMask:r.mask.canvas},{skipHistoryWrite:W}),o.updateUniforms({u_nFaces:i}),E("face:result",r.state.result)}async function ue(){if(S.has(c))r=S.get(c);else{let[i,{FaceLandmarker:l}]=await Promise.all([te(),import("@mediapipe/tasks-vision")]);if(v)return;let _=new OffscreenCanvas(1,1),x=await l.createFromOptions(i,{baseOptions:{modelAssetPath:n.modelPath,delegate:"GPU"},canvas:_,runningMode:"VIDEO",numFaces:n.maxFaces,minFaceDetectionConfidence:n.minFaceDetectionConfidence,minFacePresenceConfidence:n.minFacePresenceConfidence,minTrackingConfidence:n.minTrackingConfidence,outputFaceBlendshapes:n.outputFaceBlendshapes,outputFacialTransformationMatrixes:n.outputFacialTransformationMatrixes});if(v){x.close();return}r={landmarker:x,mediapipeCanvas:_,mask:ke(N),subscribers:new Map,maxFaces:n.maxFaces,state:{runningMode:"VIDEO",source:null,videoTime:-1,resultTimestamp:0,result:null,pending:Promise.resolve(),nFaces:0},landmarks:{data:b,textureHeight:u}},Oe(l),S.set(c,r)}r.subscribers.set(I,!1)}let V=ue(),K=0;async function z(i){let l=performance.now(),_=++K;await V,r&&(r.state.pending=r.state.pending.then(async()=>{if(_!==K||!r)return;let x=i instanceof HTMLVideoElement?"VIDEO":"IMAGE";r.state.runningMode!==x&&(r.state.runningMode=x,await r.landmarker.setOptions({runningMode:x}));let $=!1;if(i!==r.state.source?(r.state.source=i,r.state.videoTime=-1,$=!0):i instanceof HTMLVideoElement?i.currentTime!==r.state.videoTime&&(r.state.videoTime=i.currentTime,$=!0):i instanceof HTMLImageElement||l-r.state.resultTimestamp>2&&($=!0),$){let C,U,P;if(i instanceof HTMLVideoElement){if(i.videoWidth===0||i.videoHeight===0||i.readyState<2)return;U=i.videoWidth,P=i.videoHeight,C=r.landmarker.detectForVideo(i,l)}else{if(i.width===0||i.height===0)return;U=i.width,P=i.height,C=r.landmarker.detect(i)}if(C){r.state.resultTimestamp=l,r.state.result=C,xe(r,C.faceLandmarks),be(r,U,P);for(let J of r.subscribers.keys())J(),r.subscribers.set(J,!0)}}else r.state.result&&!r.subscribers.get(I)&&(I(),r.subscribers.set(I,!0))}),await r.state.pending)}o.on("init",()=>{o.initializeUniform("u_maxFaces","int",n.maxFaces),o.initializeUniform("u_nFaces","int",0),o.initializeTexture("u_faceLandmarksTex",{data:b,width:M,height:u},{internalFormat:"RGBA32F",type:"FLOAT",minFilter:"NEAREST",magFilter:"NEAREST",history:t}),o.initializeTexture("u_faceMask",N,{minFilter:"NEAREST",magFilter:"NEAREST",history:t}),V.then(()=>{v||!r||E("face:ready")})}),o.on("initializeTexture",(i,l)=>{i===e&&B(l)&&z(l)}),o.on("updateTextures",(i,l)=>{let _=i[e];B(_)&&(W=l?.skipHistoryWrite??!1,z(_))}),o.on("destroy",()=>{v=!0,r&&(r.subscribers.delete(I),r.subscribers.size===0&&(r.landmarker.close(),r.mask.gl.deleteProgram(r.mask.program),r.mask.gl.deleteBuffer(r.mask.positionBuffer),S.delete(c))),r=null});let{fn:k,historyParams:H}=ne(t),j=t?"_sampleFaceMask(pos, framesAgo)":"texture(u_faceMask, pos)",h=(i,l,_=l)=>k("vec2",`${i}At`,"vec2 pos",`vec4 mask = ${j};
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return (mask.r > ${(A[l]-ae).toFixed(4)} && mask.r < ${(A[_]+ae).toFixed(4)}) ? vec2(1.0, faceIndex) : vec2(0.0, -1.0);`),X=(i,l)=>k("vec2",`${i}At`,"vec2 pos",`vec4 mask = ${j};
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return mask.g > ${l.toFixed(2)} ? vec2(1.0, faceIndex) : vec2(0.0, -1.0);`),q=(i,l,_)=>k("vec2",`${i}At`,"vec2 pos",`vec2 left = ${l}(pos${H});
	return left.x > 0.0 ? left : ${_}(pos${H});`),fe=i=>i.map(l=>k("float",`in${l[0].toUpperCase()+l.slice(1)}`,"vec2 pos",`vec2 a = ${l}At(pos${H}); return step(0.0, a.y) * a.x;`)).join(`
`);f(`
uniform int u_maxFaces;
uniform int u_nFaces;
uniform highp sampler2D${t?"Array":""} u_faceLandmarksTex;${t?`
uniform int u_faceLandmarksTexFrameOffset;`:""}
uniform ${t?"highp":"mediump"} sampler2D${t?"Array":""} u_faceMask;${t?`
uniform int u_faceMaskFrameOffset;`:""}

#define FACE_LANDMARK_L_EYE_CENTER ${O.LEFT_EYE_CENTER}
#define FACE_LANDMARK_R_EYE_CENTER ${O.RIGHT_EYE_CENTER}
#define FACE_LANDMARK_NOSE_TIP ${O.NOSE_TIP}
#define FACE_LANDMARK_FACE_CENTER ${O.FACE_CENTER}
#define FACE_LANDMARK_MOUTH_CENTER ${O.MOUTH_CENTER}

${k("int","nFacesAt","",t?`
	int layer = (u_faceLandmarksTexFrameOffset - framesAgo + ${t}) % ${t};
	return int(texelFetch(u_faceLandmarksTex, ivec3(0, 0, layer), 0).r + 0.5);`:`
	return int(texelFetch(u_faceLandmarksTex, ivec2(0, 0), 0).r + 0.5);`)}
${k("vec4","faceLandmark","int faceIndex, int landmarkIndex",`int i = ${R} + faceIndex * ${g} + landmarkIndex;
	int x = i % ${M};
	int y = i / ${M};${t?`
	int layer = (u_faceLandmarksTexFrameOffset - framesAgo + ${t}) % ${t};
	return texelFetch(u_faceLandmarksTex, ivec3(x, y, layer), 0);`:`
	return texelFetch(u_faceLandmarksTex, ivec2(x, y), 0);`}`)}
${t?`
vec4 _sampleFaceMask(vec2 pos, int framesAgo) {
	int layer = (u_faceMaskFrameOffset - framesAgo + ${t}) % ${t};
	return texture(u_faceMask, vec3(pos, float(layer)));
}
`:""}
${h("leftEyebrow","LEFT_EYEBROW")}
${h("rightEyebrow","RIGHT_EYEBROW")}
${h("leftEye","LEFT_EYE")}
${h("rightEye","RIGHT_EYE")}
${h("lips","OUTER_MOUTH")}
${h("outerMouth","OUTER_MOUTH","INNER_MOUTH")}
${h("innerMouth","INNER_MOUTH")}
${X("faceOval",.75)}
${X("face",.25)}
${q("eye","leftEyeAt","rightEyeAt")}
${q("eyebrow","leftEyebrowAt","rightEyebrowAt")}
${fe(["eyebrow","eye","outerMouth","innerMouth","lips","face"])}`)}}var Ie=Ne;
//# sourceMappingURL=face.js.map