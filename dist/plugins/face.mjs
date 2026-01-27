import{b as y,c as z,d as H,e as j,f as X}from"../chunk-JRSBIGBN.mjs";var se=`#version 300 es
in vec2 a_pos;
void main() { gl_Position = vec4(a_pos * 2.0 - 1.0, 0.0, 1.0); }`,oe=`#version 300 es
precision mediump float;
uniform vec4 u_color;
out vec4 outColor;
void main() { outColor = u_color; }`,b=478,ie=2,_=b+ie,O=512,k=1,J=[336,296,334,293,300,276,283,282,295,285],Q=[362,398,384,385,386,387,388,466,263,249,390,373,374,380,381,382],Z=[70,63,105,66,107,55,65,52,53,46],ee=[33,246,161,160,159,158,157,173,133,155,154,153,145,144,163,7],te=[61,185,40,39,37,0,267,269,270,409,291,375,321,405,314,17,84,181,91,146],$=[78,191,80,81,82,13,312,311,310,415,308,324,318,402,317,14,87,178,88,95],ce=Array.from({length:b},(r,e)=>e),M={LEFT_EYEBROW:J,LEFT_EYE:Q,LEFT_EYE_CENTER:473,RIGHT_EYEBROW:Z,RIGHT_EYE:ee,RIGHT_EYE_CENTER:468,NOSE_TIP:4,OUTER_MOUTH:te,INNER_MOUTH:$,FACE_CENTER:b,MOUTH_CENTER:b+1},ae=["BACKGROUND","LEFT_EYEBROW","RIGHT_EYEBROW","LEFT_EYE","RIGHT_EYE","OUTER_MOUTH","INNER_MOUTH"],ne=ae.length-1,g=Object.fromEntries(ae.map((r,e)=>[r,e/ne])),q=.5/ne,le={modelPath:"https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",maxFaces:1,minFaceDetectionConfidence:.5,minFacePresenceConfidence:.5,minTrackingConfidence:.5,outputFaceBlendshapes:!1,outputFacialTransformationMatrixes:!1};function v(r){let e=[];for(let t=1;t<r.length-1;++t)e.push(r[0],r[t],r[t+1]);return e}var f=null;function me(r){if(!f){let e=r.FACE_LANDMARKS_TESSELATION,t=[];for(let n=0;n<e.length-2;n+=3)t.push(e[n].start,e[n+1].start,e[n+2].start);let E=r.FACE_LANDMARKS_FACE_OVAL.map(({start:n})=>n);f=Object.fromEntries(Object.entries({LEFT_EYEBROW:v(J),RIGHT_EYEBROW:v(Z),LEFT_EYE:v(Q),RIGHT_EYE:v(ee),OUTER_MOUTH:v(te),INNER_MOUTH:v($),TESSELATION:t,OVAL:v(E)}).map(([n,c])=>[n,{triangles:c,vertices:new Float32Array(c.length*2)}]))}}var I=new Map;function Ee(r){let e=r.mask.canvas.getContext("webgl2",{antialias:!1,preserveDrawingBuffer:!0}),t=e.createShader(e.VERTEX_SHADER);e.shaderSource(t,se),e.compileShader(t);let E=e.createShader(e.FRAGMENT_SHADER);e.shaderSource(E,oe),e.compileShader(E);let n=e.createProgram();e.attachShader(n,t),e.attachShader(n,E),e.linkProgram(n),e.deleteShader(t),e.deleteShader(E);let c=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,c);let u=e.getAttribLocation(n,"a_pos");e.enableVertexAttribArray(u),e.vertexAttribPointer(u,2,e.FLOAT,!1,0,0);let i=e.getUniformLocation(n,"u_color");e.useProgram(n),e.enable(e.BLEND),e.blendEquation(e.MAX),r.mask={...r.mask,gl:e,program:n,positionBuffer:c,colorLocation:i}}function R(r,e,t,E,n,c){let{triangles:u,vertices:i}=e,{mask:{gl:s,colorLocation:T},landmarks:p}=r,{data:N}=p;for(let A=0;A<u.length;++A){let x=(k+t*_+u[A])*4;i[A*2]=N[x],i[A*2+1]=N[x+1]}s.bufferData(s.ARRAY_BUFFER,i,s.DYNAMIC_DRAW),s.uniform4f(T,E,n,c,1),s.drawArrays(s.TRIANGLES,0,u.length)}function ue(r,e){let t=r.landmarks.data,E=e.length;t[0]=E;for(let n=0;n<E;++n){let c=e[n];for(let s=0;s<b;++s){let T=c[s],p=(k+n*_+s)*4;t[p]=T.x,t[p+1]=1-T.y,t[p+2]=T.z??0,t[p+3]=T.visibility??1}let u=H(t,n,ce,_,k);t.set(u,(k+n*_+M.FACE_CENTER)*4);let i=H(t,n,$,_,1);t.set(i,(k+n*_+M.MOUTH_CENTER)*4)}r.state.nFaces=E}function fe(r){if(!f)return;let{mask:e,canvas:t,maxFaces:E,state:{nFaces:n}}=r,{gl:c,canvas:u}=e;u.width=t.width,u.height=t.height,c.viewport(0,0,u.width,u.height),c.clearColor(0,0,0,0),c.clear(c.COLOR_BUFFER_BIT);for(let i=0;i<n;++i){let s=(i+1)/E;R(r,f.TESSELATION,i,0,.5,s),R(r,f.OVAL,i,0,1,s),R(r,f.LEFT_EYEBROW,i,g.LEFT_EYEBROW,0,s),R(r,f.RIGHT_EYEBROW,i,g.RIGHT_EYEBROW,0,s),R(r,f.LEFT_EYE,i,g.LEFT_EYE,0,s),R(r,f.RIGHT_EYE,i,g.RIGHT_EYE,0,s),R(r,f.OUTER_MOUTH,i,g.OUTER_MOUTH,0,s),R(r,f.INNER_MOUTH,i,g.INNER_MOUTH,0,s)}}function de(r){let{textureName:e,options:{history:t,...E}={}}=r,n={...le,...E},c=z({...n,textureName:e}),u=n.maxFaces*_+k,i=Math.ceil(u/O);return function(s,T){let{injectGLSL:p,emitHook:N}=T,A=I.get(c),x=A?.landmarks.data??new Float32Array(O*i*4),U=A?.mask.canvas??new OffscreenCanvas(1,1),a=null,Y=!1;function h(){if(!a)return;let o=a.state.nFaces,m=o*_+k,d=Math.ceil(m/O);s.updateTextures({u_faceLandmarksTex:{data:a.landmarks.data,width:O,height:d,isPartial:!0},u_faceMask:a.mask.canvas},{skipHistoryWrite:Y}),s.updateUniforms({u_nFaces:o}),N("face:result",a.state.result)}async function re(){if(I.has(c))a=I.get(c);else{let[o,{FaceLandmarker:m}]=await Promise.all([j(),import("@mediapipe/tasks-vision")]),d=new OffscreenCanvas(1,1);a={landmarker:await m.createFromOptions(o,{baseOptions:{modelAssetPath:n.modelPath,delegate:"GPU"},canvas:d,runningMode:"VIDEO",numFaces:n.maxFaces,minFaceDetectionConfidence:n.minFaceDetectionConfidence,minFacePresenceConfidence:n.minFacePresenceConfidence,minTrackingConfidence:n.minTrackingConfidence,outputFaceBlendshapes:n.outputFaceBlendshapes,outputFacialTransformationMatrixes:n.outputFacialTransformationMatrixes}),canvas:d,subscribers:new Map,maxFaces:n.maxFaces,state:{runningMode:"VIDEO",source:null,videoTime:-1,resultTimestamp:0,result:null,pending:Promise.resolve(),nFaces:0},landmarks:{data:x,textureHeight:i},mask:{canvas:U}},me(m),Ee(a),I.set(c,a)}a.subscribers.set(h,!1)}let B=re(),G=0;async function w(o){let m=performance.now(),d=++G;await B,a&&(a.state.pending=a.state.pending.then(async()=>{if(d!==G||!a)return;let S=o instanceof HTMLVideoElement?"VIDEO":"IMAGE";a.state.runningMode!==S&&(a.state.runningMode=S,await a.landmarker.setOptions({runningMode:S}));let D=!1;if(o!==a.state.source?(a.state.source=o,a.state.videoTime=-1,D=!0):o instanceof HTMLVideoElement?o.currentTime!==a.state.videoTime&&(a.state.videoTime=o.currentTime,D=!0):o instanceof HTMLImageElement||m-a.state.resultTimestamp>2&&(D=!0),D){let C;if(o instanceof HTMLVideoElement){if(o.videoWidth===0||o.videoHeight===0||o.readyState<2)return;C=a.landmarker.detectForVideo(o,m)}else{if(o.width===0||o.height===0)return;C=a.landmarker.detect(o)}if(C){a.state.resultTimestamp=m,a.state.result=C,ue(a,C.faceLandmarks),fe(a);for(let V of a.subscribers.keys())V(),a.subscribers.set(V,!0)}}else a.state.result&&!a.subscribers.get(h)&&(h(),a.subscribers.set(h,!0))}),await a.state.pending)}s.on("init",()=>{s.initializeUniform("u_maxFaces","int",n.maxFaces),s.initializeUniform("u_nFaces","int",0),s.initializeTexture("u_faceLandmarksTex",{data:x,width:O,height:i},{internalFormat:"RGBA32F",type:"FLOAT",minFilter:"NEAREST",magFilter:"NEAREST",history:t}),s.initializeTexture("u_faceMask",U,{minFilter:"NEAREST",magFilter:"NEAREST",history:t}),B.then(()=>N("face:ready"))}),s.on("initializeTexture",(o,m)=>{o===e&&y(m)&&w(m)}),s.on("updateTextures",(o,m)=>{let d=o[e];y(d)&&(Y=m?.skipHistoryWrite??!1,w(d))}),s.on("destroy",()=>{a&&(a.subscribers.delete(h),a.subscribers.size===0&&(a.landmarker.close(),a.mask.gl.deleteProgram(a.mask.program),a.mask.gl.deleteBuffer(a.mask.positionBuffer),I.delete(c))),a=null});let{fn:l,historyParams:F}=X(t),P=t?"_sampleFaceMask(pos, framesAgo)":"texture(u_faceMask, pos)",L=(o,m=o)=>`vec4 mask = ${P};
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return (mask.r > ${(g[o]-q).toFixed(4)} && mask.r < ${(g[m]+q).toFixed(4)}) ? vec2(1.0, faceIndex) : vec2(0.0, -1.0);`,W=o=>`vec4 mask = ${P};
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return mask.g > ${o.toFixed(2)} ? vec2(1.0, faceIndex) : vec2(0.0, -1.0);`,K=(o,m)=>`vec2 left = ${o}(pos${F});
	return left.x > 0.0 ? left : ${m}(pos${F});`;p(`
uniform int u_maxFaces;
uniform int u_nFaces;
uniform highp sampler2D${t?"Array":""} u_faceLandmarksTex;${t?`
uniform int u_faceLandmarksTexFrameOffset;`:""}
uniform sampler2D${t?"Array":""} u_faceMask;${t?`
uniform int u_faceMaskFrameOffset;`:""}

#define FACE_LANDMARK_L_EYE_CENTER ${M.LEFT_EYE_CENTER}
#define FACE_LANDMARK_R_EYE_CENTER ${M.RIGHT_EYE_CENTER}
#define FACE_LANDMARK_NOSE_TIP ${M.NOSE_TIP}
#define FACE_LANDMARK_FACE_CENTER ${M.FACE_CENTER}
#define FACE_LANDMARK_MOUTH_CENTER ${M.MOUTH_CENTER}

${l("int","nFacesAt","",t?`
	int layer = (u_faceLandmarksTexFrameOffset - framesAgo + ${t}) % ${t};
	return int(texelFetch(u_faceLandmarksTex, ivec3(0, 0, layer), 0).r + 0.5);`:`
	return int(texelFetch(u_faceLandmarksTex, ivec2(0, 0), 0).r + 0.5);`)}
${l("vec4","faceLandmark","int faceIndex, int landmarkIndex",`int i = ${k} + faceIndex * ${_} + landmarkIndex;
	int x = i % ${O};
	int y = i / ${O};${t?`
	int layer = (u_faceLandmarksTexFrameOffset - framesAgo + ${t}) % ${t};
	return texelFetch(u_faceLandmarksTex, ivec3(x, y, layer), 0);`:`
	return texelFetch(u_faceLandmarksTex, ivec2(x, y), 0);`}`)}
${t?`
vec4 _sampleFaceMask(vec2 pos, int framesAgo) {
	int layer = (u_faceMaskFrameOffset - framesAgo + ${t}) % ${t};
	return texture(u_faceMask, vec3(pos, float(layer)));
}
`:""}
${l("vec2","leftEyebrowAt","vec2 pos",L("LEFT_EYEBROW"))}
${l("vec2","rightEyebrowAt","vec2 pos",L("RIGHT_EYEBROW"))}
${l("vec2","leftEyeAt","vec2 pos",L("LEFT_EYE"))}
${l("vec2","rightEyeAt","vec2 pos",L("RIGHT_EYE"))}
${l("vec2","lipsAt","vec2 pos",L("OUTER_MOUTH"))}
${l("vec2","outerMouthAt","vec2 pos",L("OUTER_MOUTH","INNER_MOUTH"))}
${l("vec2","innerMouthAt","vec2 pos",L("INNER_MOUTH"))}
${l("vec2","faceOvalAt","vec2 pos",W(.75))}
${l("vec2","faceAt","vec2 pos",W(.25))}
${l("vec2","eyeAt","vec2 pos",K("leftEyeAt","rightEyeAt"))}
${l("vec2","eyebrowAt","vec2 pos",K("leftEyebrowAt","rightEyebrowAt"))}
${l("float","inEyebrow","vec2 pos",`return eyebrowAt(pos${F}).x;`)}
${l("float","inEye","vec2 pos",`return eyeAt(pos${F}).x;`)}
${l("float","inOuterMouth","vec2 pos",`return outerMouthAt(pos${F}).x;`)}
${l("float","inInnerMouth","vec2 pos",`return innerMouthAt(pos${F}).x;`)}
${l("float","inLips","vec2 pos",`return lipsAt(pos${F}).x;`)}
${l("float","inFace","vec2 pos",`return faceAt(pos${F}).x;`)}`)}}var Ae=de;export{Ae as default};
//# sourceMappingURL=face.mjs.map