import{b as H,c as X,d as $,e as q,f as J}from"../chunk-JRSBIGBN.mjs";var ce=`#version 300 es
in vec2 a_pos;
void main() { gl_Position = vec4(a_pos * 2.0 - 1.0, 0.0, 1.0); }`,me=`#version 300 es
precision mediump float;
uniform vec4 u_color;
out vec4 outColor;
void main() { outColor = u_color; }`,b=478,le=2,F=b+le,k=512,A=1,Z=[336,296,334,293,300,276,283,282,295,285],ee=[362,398,384,385,386,387,388,466,263,249,390,373,374,380,381,382],te=[70,63,105,66,107,55,65,52,53,46],ae=[33,246,161,160,159,158,157,173,133,155,154,153,145,144,163,7],ne=[61,185,40,39,37,0,267,269,270,409,291,375,321,405,314,17,84,181,91,146],U=[78,191,80,81,82,13,312,311,310,415,308,324,318,402,317,14,87,178,88,95],Ee=Array.from({length:b},(c,e)=>e),O={LEFT_EYEBROW:Z,LEFT_EYE:ee,LEFT_EYE_CENTER:473,RIGHT_EYEBROW:te,RIGHT_EYE:ae,RIGHT_EYE_CENTER:468,NOSE_TIP:4,OUTER_MOUTH:ne,INNER_MOUTH:U,FACE_CENTER:b,MOUTH_CENTER:b+1},re=["BACKGROUND","LEFT_EYEBROW","RIGHT_EYEBROW","LEFT_EYE","RIGHT_EYE","OUTER_MOUTH","INNER_MOUTH"],se=re.length-1,p=Object.fromEntries(re.map((c,e)=>[c,e/se])),Q=.5/se,fe={modelPath:"https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",maxFaces:1,minFaceDetectionConfidence:.5,minFacePresenceConfidence:.5,minTrackingConfidence:.5,outputFaceBlendshapes:!1,outputFacialTransformationMatrixes:!1};function L(c){let e=[];for(let t=1;t<c.length-1;++t)e.push(c[0],c[t],c[t+1]);return e}var _=null;function ue(c){if(!_){let e=c.FACE_LANDMARKS_TESSELATION,t=[];for(let n=0;n<e.length-2;n+=3)t.push(e[n].start,e[n+1].start,e[n+2].start);let i=c.FACE_LANDMARKS_FACE_OVAL.map(({start:n})=>n);_=Object.fromEntries(Object.entries({LEFT_EYEBROW:L(Z),RIGHT_EYEBROW:L(te),LEFT_EYE:L(ee),RIGHT_EYE:L(ae),OUTER_MOUTH:L(ne),INNER_MOUTH:L(U),TESSELATION:t,OVAL:L(i)}).map(([n,E])=>[n,{triangles:E,vertices:new Float32Array(E.length*2)}]))}}var C=new Map;function de(c){let e=c.getContext("webgl2",{antialias:!1,preserveDrawingBuffer:!0}),t=e.createShader(e.VERTEX_SHADER);e.shaderSource(t,ce),e.compileShader(t);let i=e.createShader(e.FRAGMENT_SHADER);e.shaderSource(i,me),e.compileShader(i);let n=e.createProgram();e.attachShader(n,t),e.attachShader(n,i),e.linkProgram(n),e.deleteShader(t),e.deleteShader(i);let E=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,E);let T=e.getAttribLocation(n,"a_pos");e.enableVertexAttribArray(T),e.vertexAttribPointer(T,2,e.FLOAT,!1,0,0);let u=e.getUniformLocation(n,"u_color");return e.useProgram(n),e.enable(e.BLEND),e.blendEquation(e.MAX),{canvas:c,gl:e,program:n,positionBuffer:E,colorLocation:u}}function R(c,e,t,i,n,E,T){let{triangles:u,vertices:s}=t,{gl:m,colorLocation:l}=c;for(let f=0;f<u.length;++f){let h=(A+i*F+u[f])*4;s[f*2]=e[h],s[f*2+1]=e[h+1]}m.bufferData(m.ARRAY_BUFFER,s,m.DYNAMIC_DRAW),m.uniform4f(l,n,E,T,1),m.drawArrays(m.TRIANGLES,0,u.length)}function _e(c,e){let t=c.landmarks.data,i=e.length;t[0]=i;for(let n=0;n<i;++n){let E=e[n];for(let s=0;s<b;++s){let m=E[s],l=(A+n*F+s)*4;t[l]=m.x,t[l+1]=1-m.y,t[l+2]=m.z??0,t[l+3]=m.visibility??1}let T=$(t,n,Ee,F,A);t.set(T,(A+n*F+O.FACE_CENTER)*4);let u=$(t,n,U,F,1);t.set(u,(A+n*F+O.MOUTH_CENTER)*4)}c.state.nFaces=i}function Te(c,e,t){if(!_)return;let{mask:i,maxFaces:n,landmarks:E,state:{nFaces:T}}=c,{gl:u,canvas:s}=i,{data:m}=E;(s.width!==e||s.height!==t)&&(s.width=e,s.height=t),u.viewport(0,0,s.width,s.height),u.clearColor(0,0,0,0),u.clear(u.COLOR_BUFFER_BIT);for(let l=0;l<T;++l){let f=(l+1)/n;R(i,m,_.TESSELATION,l,0,.5,f),R(i,m,_.OVAL,l,0,1,f),R(i,m,_.LEFT_EYEBROW,l,p.LEFT_EYEBROW,0,f),R(i,m,_.RIGHT_EYEBROW,l,p.RIGHT_EYEBROW,0,f),R(i,m,_.LEFT_EYE,l,p.LEFT_EYE,0,f),R(i,m,_.RIGHT_EYE,l,p.RIGHT_EYE,0,f),R(i,m,_.OUTER_MOUTH,l,p.OUTER_MOUTH,0,f),R(i,m,_.INNER_MOUTH,l,p.INNER_MOUTH,0,f)}}function Fe(c){let{textureName:e,options:{history:t,...i}={}}=c,n={...fe,...i},E=X({...n,textureName:e}),T=n.maxFaces*F+A,u=Math.ceil(T/k);return function(s,m){let{injectGLSL:l,emitHook:f}=m,h=C.get(E),Y=h?.landmarks.data??new Float32Array(k*u*4),B=h?.mask.canvas??new OffscreenCanvas(1,1),a=null,G=!1;function N(){if(!a)return;let r=a.state.nFaces,o=r*F+A,d=Math.ceil(o/k);s.updateTextures({u_faceLandmarksTex:{data:a.landmarks.data,width:k,height:d,isPartial:!0},u_faceMask:a.mask.canvas},{skipHistoryWrite:G}),s.updateUniforms({u_nFaces:r}),f("face:result",a.state.result)}async function ie(){if(C.has(E))a=C.get(E);else{let[r,{FaceLandmarker:o}]=await Promise.all([q(),import("@mediapipe/tasks-vision")]),d=new OffscreenCanvas(1,1);a={landmarker:await o.createFromOptions(r,{baseOptions:{modelAssetPath:n.modelPath,delegate:"GPU"},canvas:d,runningMode:"VIDEO",numFaces:n.maxFaces,minFaceDetectionConfidence:n.minFaceDetectionConfidence,minFacePresenceConfidence:n.minFacePresenceConfidence,minTrackingConfidence:n.minTrackingConfidence,outputFaceBlendshapes:n.outputFaceBlendshapes,outputFacialTransformationMatrixes:n.outputFacialTransformationMatrixes}),mediapipeCanvas:d,mask:de(B),subscribers:new Map,maxFaces:n.maxFaces,state:{runningMode:"VIDEO",source:null,videoTime:-1,resultTimestamp:0,result:null,pending:Promise.resolve(),nFaces:0},landmarks:{data:Y,textureHeight:u}},ue(o),C.set(E,a)}a.subscribers.set(N,!1)}let w=ie(),P=0;async function W(r){let o=performance.now(),d=++P;await w,a&&(a.state.pending=a.state.pending.then(async()=>{if(d!==P||!a)return;let I=r instanceof HTMLVideoElement?"VIDEO":"IMAGE";a.state.runningMode!==I&&(a.state.runningMode=I,await a.landmarker.setOptions({runningMode:I}));let v=!1;if(r!==a.state.source?(a.state.source=r,a.state.videoTime=-1,v=!0):r instanceof HTMLVideoElement?r.currentTime!==a.state.videoTime&&(a.state.videoTime=r.currentTime,v=!0):r instanceof HTMLImageElement||o-a.state.resultTimestamp>2&&(v=!0),v){let x,D,y;if(r instanceof HTMLVideoElement){if(r.videoWidth===0||r.videoHeight===0||r.readyState<2)return;D=r.videoWidth,y=r.videoHeight,x=a.landmarker.detectForVideo(r,o)}else{if(r.width===0||r.height===0)return;D=r.width,y=r.height,x=a.landmarker.detect(r)}if(x){a.state.resultTimestamp=o,a.state.result=x,_e(a,x.faceLandmarks),Te(a,D,y);for(let j of a.subscribers.keys())j(),a.subscribers.set(j,!0)}}else a.state.result&&!a.subscribers.get(N)&&(N(),a.subscribers.set(N,!0))}),await a.state.pending)}s.on("init",()=>{s.initializeUniform("u_maxFaces","int",n.maxFaces),s.initializeUniform("u_nFaces","int",0),s.initializeTexture("u_faceLandmarksTex",{data:Y,width:k,height:u},{internalFormat:"RGBA32F",type:"FLOAT",minFilter:"NEAREST",magFilter:"NEAREST",history:t}),s.initializeTexture("u_faceMask",B,{minFilter:"NEAREST",magFilter:"NEAREST",history:t}),w.then(()=>f("face:ready"))}),s.on("initializeTexture",(r,o)=>{r===e&&H(o)&&W(o)}),s.on("updateTextures",(r,o)=>{let d=r[e];H(d)&&(G=o?.skipHistoryWrite??!1,W(d))}),s.on("destroy",()=>{a&&(a.subscribers.delete(N),a.subscribers.size===0&&(a.landmarker.close(),a.mask.gl.deleteProgram(a.mask.program),a.mask.gl.deleteBuffer(a.mask.positionBuffer),C.delete(E))),a=null});let{fn:M,historyParams:S}=J(t),K=t?"_sampleFaceMask(pos, framesAgo)":"texture(u_faceMask, pos)",g=(r,o,d=o)=>M("vec2",`${r}At`,"vec2 pos",`vec4 mask = ${K};
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return (mask.r > ${(p[o]-Q).toFixed(4)} && mask.r < ${(p[d]+Q).toFixed(4)}) ? vec2(1.0, faceIndex) : vec2(0.0, -1.0);`),V=(r,o)=>M("vec2",`${r}At`,"vec2 pos",`vec4 mask = ${K};
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return mask.g > ${o.toFixed(2)} ? vec2(1.0, faceIndex) : vec2(0.0, -1.0);`),z=(r,o,d)=>M("vec2",`${r}At`,"vec2 pos",`vec2 left = ${o}(pos${S});
	return left.x > 0.0 ? left : ${d}(pos${S});`),oe=r=>r.map(o=>M("float",`in${o[0].toUpperCase()+o.slice(1)}`,"vec2 pos",`vec2 a = ${o}At(pos${S}); return step(0.0, a.y) * a.x;`)).join(`
`);l(`
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

${M("int","nFacesAt","",t?`
	int layer = (u_faceLandmarksTexFrameOffset - framesAgo + ${t}) % ${t};
	return int(texelFetch(u_faceLandmarksTex, ivec3(0, 0, layer), 0).r + 0.5);`:`
	return int(texelFetch(u_faceLandmarksTex, ivec2(0, 0), 0).r + 0.5);`)}
${M("vec4","faceLandmark","int faceIndex, int landmarkIndex",`int i = ${A} + faceIndex * ${F} + landmarkIndex;
	int x = i % ${k};
	int y = i / ${k};${t?`
	int layer = (u_faceLandmarksTexFrameOffset - framesAgo + ${t}) % ${t};
	return texelFetch(u_faceLandmarksTex, ivec3(x, y, layer), 0);`:`
	return texelFetch(u_faceLandmarksTex, ivec2(x, y), 0);`}`)}
${t?`
vec4 _sampleFaceMask(vec2 pos, int framesAgo) {
	int layer = (u_faceMaskFrameOffset - framesAgo + ${t}) % ${t};
	return texture(u_faceMask, vec3(pos, float(layer)));
}
`:""}
${g("leftEyebrow","LEFT_EYEBROW")}
${g("rightEyebrow","RIGHT_EYEBROW")}
${g("leftEye","LEFT_EYE")}
${g("rightEye","RIGHT_EYE")}
${g("lips","OUTER_MOUTH")}
${g("outerMouth","OUTER_MOUTH","INNER_MOUTH")}
${g("innerMouth","INNER_MOUTH")}
${V("faceOval",.75)}
${V("face",.25)}
${z("eye","leftEyeAt","rightEyeAt")}
${z("eyebrow","leftEyebrowAt","rightEyebrowAt")}
${oe(["eyebrow","eye","outerMouth","innerMouth","lips","face"])}`)}}var Ae=Fe;export{Ae as default};
//# sourceMappingURL=face.mjs.map