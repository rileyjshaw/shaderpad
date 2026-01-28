"use strict";var fe=Object.create;var $=Object.defineProperty;var Ee=Object.getOwnPropertyDescriptor;var de=Object.getOwnPropertyNames;var _e=Object.getPrototypeOf,Te=Object.prototype.hasOwnProperty;var pe=(a,e)=>{for(var t in e)$(a,t,{get:e[t],enumerable:!0})},J=(a,e,t,s)=>{if(e&&typeof e=="object"||typeof e=="function")for(let n of de(e))!Te.call(a,n)&&n!==t&&$(a,n,{get:()=>e[n],enumerable:!(s=Ee(e,n))||s.enumerable});return a};var Z=(a,e,t)=>(t=a!=null?fe(_e(a)):{},J(e||!a||!a.__esModule?$(t,"default",{value:a,enumerable:!0}):t,a)),ge=a=>J($({},"__esModule",{value:!0}),a);var Ie={};pe(Ie,{default:()=>Ne});module.exports=ge(Ie);var Se={data:new Uint8Array(4),width:1,height:1};function Y(a){return a instanceof HTMLVideoElement||a instanceof HTMLImageElement||a instanceof HTMLCanvasElement||a instanceof OffscreenCanvas}function Q(a){return JSON.stringify(a,Object.keys(a).sort())}function B(a,e,t,s,n=0){let c=1/0,d=-1/0,u=1/0,o=-1/0,m=0,f=0;for(let E of t){let p=(n+e*s+E)*4,x=a[p],b=a[p+1];c=Math.min(c,x),d=Math.max(d,x),u=Math.min(u,b),o=Math.max(o,b),m+=a[p+2],f+=a[p+3]}return[(c+d)/2,(u+o)/2,m/t.length,f/t.length]}var P=null;function ee(){return P||(P=import("@mediapipe/tasks-vision").then(({FilesetResolver:a})=>a.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm"))),P}function te(a){return{historyParams:a?", framesAgo":"",fn:a?(s,n,c,d)=>{let u=c.replace(/\w+ /g,""),o=c?`${c}, int framesAgo`:"int framesAgo",m=u?`${u}, 0`:"0";return`${s} ${n}(${o}) {
${d}
}
${s} ${n}(${c}) { return ${n}(${m}); }`}:(s,n,c,d)=>`${s} ${n}(${c}) {
${d}
}`}}var Fe=`#version 300 es
in vec2 a_pos;
void main() { gl_Position = vec4(a_pos * 2.0 - 1.0, 0.0, 1.0); }`,Ae=`#version 300 es
precision mediump float;
uniform vec4 u_color;
out vec4 outColor;
void main() { outColor = u_color; }`,S=478,Re=2,g=S+Re,L=512,R=1,ae=[336,296,334,293,300,276,283,282,295,285],re=[362,398,384,385,386,387,388,466,263,249,390,373,374,380,381,382],ie=[70,63,105,66,107,55,65,52,53,46],se=[33,246,161,160,159,158,157,173,133,155,154,153,145,144,163,7],oe=[61,185,40,39,37,0,267,269,270,409,291,375,321,405,314,17,84,181,91,146],w=[78,191,80,81,82,13,312,311,310,415,308,324,318,402,317,14,87,178,88,95],he=Array.from({length:S},(a,e)=>e),O={LEFT_EYEBROW:ae,LEFT_EYE:re,LEFT_EYE_CENTER:473,RIGHT_EYEBROW:ie,RIGHT_EYE:se,RIGHT_EYE_CENTER:468,NOSE_TIP:4,OUTER_MOUTH:oe,INNER_MOUTH:w,FACE_CENTER:S,MOUTH_CENTER:S+1},ce=["BACKGROUND","LEFT_EYEBROW","RIGHT_EYEBROW","LEFT_EYE","RIGHT_EYE","OUTER_MOUTH","INNER_MOUTH"],me=ce.length-1,A=Object.fromEntries(ce.map((a,e)=>[a,e/me])),ne=.5/me,Le={modelPath:"https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",maxFaces:1,minFaceDetectionConfidence:.5,minFacePresenceConfidence:.5,minTrackingConfidence:.5,outputFaceBlendshapes:!1,outputFacialTransformationMatrixes:!1};function M(a){let e=[];for(let t=1;t<a.length-1;++t)e.push(a[0],a[t],a[t+1]);return e}var T=null;function Me(a){if(!T){let e=a.FACE_LANDMARKS_TESSELATION,t=[];for(let n=0;n<e.length-2;n+=3)t.push(e[n].start,e[n+1].start,e[n+2].start);let s=a.FACE_LANDMARKS_FACE_OVAL.map(({start:n})=>n);T=Object.fromEntries(Object.entries({LEFT_EYEBROW:M(ae),RIGHT_EYEBROW:M(ie),LEFT_EYE:M(re),RIGHT_EYE:M(se),OUTER_MOUTH:M(oe),INNER_MOUTH:M(w),TESSELATION:t,OVAL:M(s)}).map(([n,c])=>[n,{triangles:c,vertices:new Float32Array(c.length*2)}]))}}var C=new Map;function Oe(a){let e=a.getContext("webgl2",{antialias:!1,preserveDrawingBuffer:!0}),t=e.createShader(e.VERTEX_SHADER);e.shaderSource(t,Fe),e.compileShader(t);let s=e.createShader(e.FRAGMENT_SHADER);e.shaderSource(s,Ae),e.compileShader(s);let n=e.createProgram();e.attachShader(n,t),e.attachShader(n,s),e.linkProgram(n),e.deleteShader(t),e.deleteShader(s);let c=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,c);let d=e.getAttribLocation(n,"a_pos");e.enableVertexAttribArray(d),e.vertexAttribPointer(d,2,e.FLOAT,!1,0,0);let u=e.getUniformLocation(n,"u_color");return e.useProgram(n),e.enable(e.BLEND),e.blendEquation(e.MAX),{canvas:a,gl:e,program:n,positionBuffer:c,colorLocation:u}}function F(a,e,t,s,n,c,d){let{triangles:u,vertices:o}=t,{gl:m,colorLocation:f}=a;for(let E=0;E<u.length;++E){let p=(R+s*g+u[E])*4;o[E*2]=e[p],o[E*2+1]=e[p+1]}m.bufferData(m.ARRAY_BUFFER,o,m.DYNAMIC_DRAW),m.uniform4f(f,n,c,d,1),m.drawArrays(m.TRIANGLES,0,u.length)}function ke(a,e){let t=a.landmarks.data,s=e.length;t[0]=s;for(let n=0;n<s;++n){let c=e[n];for(let o=0;o<S;++o){let m=c[o],f=(R+n*g+o)*4;t[f]=m.x,t[f+1]=1-m.y,t[f+2]=m.z??0,t[f+3]=m.visibility??1}let d=B(t,n,he,g,R);t.set(d,(R+n*g+O.FACE_CENTER)*4);let u=B(t,n,w,g,1);t.set(u,(R+n*g+O.MOUTH_CENTER)*4)}a.state.nFaces=s}function xe(a,e,t){let{mask:s,maxFaces:n,landmarks:c,state:{nFaces:d}}=a,{gl:u,canvas:o}=s,{data:m}=c;if((o.width!==e||o.height!==t)&&(o.width=e,o.height=t),u.viewport(0,0,o.width,o.height),u.clearColor(0,0,0,0),u.clear(u.COLOR_BUFFER_BIT),!!T)for(let f=0;f<d;++f){let E=(f+1)/n;F(s,m,T.TESSELATION,f,0,.5,E),F(s,m,T.OVAL,f,0,1,E),F(s,m,T.LEFT_EYEBROW,f,A.LEFT_EYEBROW,0,E),F(s,m,T.RIGHT_EYEBROW,f,A.RIGHT_EYEBROW,0,E),F(s,m,T.LEFT_EYE,f,A.LEFT_EYE,0,E),F(s,m,T.RIGHT_EYE,f,A.RIGHT_EYE,0,E),F(s,m,T.OUTER_MOUTH,f,A.OUTER_MOUTH,0,E),F(s,m,T.INNER_MOUTH,f,A.INNER_MOUTH,0,E)}}function be(a){let{textureName:e,options:{history:t,...s}={}}=a,n={...Le,...s},c=Q({...n,textureName:e}),d=n.maxFaces*g+R,u=Math.ceil(d/L);return function(o,m){let{injectGLSL:f,emitHook:E}=m,p=C.get(c),x=p?.landmarks.data??new Float32Array(L*u*4),b=p?.mask.canvas??new OffscreenCanvas(1,1),r=null,G=!1;function N(){if(!r)return;let i=r.state.nFaces,l=i*g+R,_=Math.ceil(l/L);o.updateTextures({u_faceLandmarksTex:{data:r.landmarks.data,width:L,height:_,isPartial:!0},u_faceMask:r.mask.canvas},{skipHistoryWrite:G}),o.updateUniforms({u_nFaces:i}),E("face:result",r.state.result)}async function le(){if(C.has(c))r=C.get(c);else{let[i,{FaceLandmarker:l}]=await Promise.all([ee(),import("@mediapipe/tasks-vision")]),_=new OffscreenCanvas(1,1);r={landmarker:await l.createFromOptions(i,{baseOptions:{modelAssetPath:n.modelPath,delegate:"GPU"},canvas:_,runningMode:"VIDEO",numFaces:n.maxFaces,minFaceDetectionConfidence:n.minFaceDetectionConfidence,minFacePresenceConfidence:n.minFacePresenceConfidence,minTrackingConfidence:n.minTrackingConfidence,outputFaceBlendshapes:n.outputFaceBlendshapes,outputFacialTransformationMatrixes:n.outputFacialTransformationMatrixes}),mediapipeCanvas:_,mask:Oe(b),subscribers:new Map,maxFaces:n.maxFaces,state:{runningMode:"VIDEO",source:null,videoTime:-1,resultTimestamp:0,result:null,pending:Promise.resolve(),nFaces:0},landmarks:{data:x,textureHeight:u}},Me(l),C.set(c,r)}r.subscribers.set(N,!1)}let W=le(),V=0;async function K(i){let l=performance.now(),_=++V;await W,r&&(r.state.pending=r.state.pending.then(async()=>{if(_!==V||!r)return;let v=i instanceof HTMLVideoElement?"VIDEO":"IMAGE";r.state.runningMode!==v&&(r.state.runningMode=v,await r.landmarker.setOptions({runningMode:v}));let y=!1;if(i!==r.state.source?(r.state.source=i,r.state.videoTime=-1,y=!0):i instanceof HTMLVideoElement?i.currentTime!==r.state.videoTime&&(r.state.videoTime=i.currentTime,y=!0):i instanceof HTMLImageElement||l-r.state.resultTimestamp>2&&(y=!0),y){let I,H,U;if(i instanceof HTMLVideoElement){if(i.videoWidth===0||i.videoHeight===0||i.readyState<2)return;H=i.videoWidth,U=i.videoHeight,I=r.landmarker.detectForVideo(i,l)}else{if(i.width===0||i.height===0)return;H=i.width,U=i.height,I=r.landmarker.detect(i)}if(I){r.state.resultTimestamp=l,r.state.result=I,ke(r,I.faceLandmarks),xe(r,H,U);for(let q of r.subscribers.keys())q(),r.subscribers.set(q,!0)}}else r.state.result&&!r.subscribers.get(N)&&(N(),r.subscribers.set(N,!0))}),await r.state.pending)}o.on("init",()=>{o.initializeUniform("u_maxFaces","int",n.maxFaces),o.initializeUniform("u_nFaces","int",0),o.initializeTexture("u_faceLandmarksTex",{data:x,width:L,height:u},{internalFormat:"RGBA32F",type:"FLOAT",minFilter:"NEAREST",magFilter:"NEAREST",history:t}),o.initializeTexture("u_faceMask",b,{minFilter:"NEAREST",magFilter:"NEAREST",history:t}),W.then(()=>E("face:ready"))}),o.on("initializeTexture",(i,l)=>{i===e&&Y(l)&&K(l)}),o.on("updateTextures",(i,l)=>{let _=i[e];Y(_)&&(G=l?.skipHistoryWrite??!1,K(_))}),o.on("destroy",()=>{r&&(r.subscribers.delete(N),r.subscribers.size===0&&(r.landmarker.close(),r.mask.gl.deleteProgram(r.mask.program),r.mask.gl.deleteBuffer(r.mask.positionBuffer),C.delete(c))),r=null});let{fn:k,historyParams:D}=te(t),z=t?"_sampleFaceMask(pos, framesAgo)":"texture(u_faceMask, pos)",h=(i,l,_=l)=>k("vec2",`${i}At`,"vec2 pos",`vec4 mask = ${z};
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return (mask.r > ${(A[l]-ne).toFixed(4)} && mask.r < ${(A[_]+ne).toFixed(4)}) ? vec2(1.0, faceIndex) : vec2(0.0, -1.0);`),j=(i,l)=>k("vec2",`${i}At`,"vec2 pos",`vec4 mask = ${z};
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return mask.g > ${l.toFixed(2)} ? vec2(1.0, faceIndex) : vec2(0.0, -1.0);`),X=(i,l,_)=>k("vec2",`${i}At`,"vec2 pos",`vec2 left = ${l}(pos${D});
	return left.x > 0.0 ? left : ${_}(pos${D});`),ue=i=>i.map(l=>k("float",`in${l[0].toUpperCase()+l.slice(1)}`,"vec2 pos",`vec2 a = ${l}At(pos${D}); return step(0.0, a.y) * a.x;`)).join(`
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
	int x = i % ${L};
	int y = i / ${L};${t?`
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
${j("faceOval",.75)}
${j("face",.25)}
${X("eye","leftEyeAt","rightEyeAt")}
${X("eyebrow","leftEyebrowAt","rightEyebrowAt")}
${ue(["eyebrow","eye","outerMouth","innerMouth","lips","face"])}`)}}var Ne=be;
//# sourceMappingURL=face.js.map