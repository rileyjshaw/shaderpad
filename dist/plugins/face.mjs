import{b as y,c as j,d as H,e as X,f as q}from"../chunk-JRSBIGBN.mjs";var oe=`#version 300 es
in vec2 a_pos;
void main() { gl_Position = vec4(a_pos * 2.0 - 1.0, 0.0, 1.0); }`,ie=`#version 300 es
precision mediump float;
uniform vec4 u_color;
out vec4 outColor;
void main() { outColor = u_color; }`,b=478,ce=2,T=b+ce,v=512,L=1,Q=[336,296,334,293,300,276,283,282,295,285],Z=[362,398,384,385,386,387,388,466,263,249,390,373,374,380,381,382],ee=[70,63,105,66,107,55,65,52,53,46],te=[33,246,161,160,159,158,157,173,133,155,154,153,145,144,163,7],ae=[61,185,40,39,37,0,267,269,270,409,291,375,321,405,314,17,84,181,91,146],$=[78,191,80,81,82,13,312,311,310,415,308,324,318,402,317,14,87,178,88,95],le=Array.from({length:b},(r,e)=>e),N={LEFT_EYEBROW:Q,LEFT_EYE:Z,LEFT_EYE_CENTER:473,RIGHT_EYEBROW:ee,RIGHT_EYE:te,RIGHT_EYE_CENTER:468,NOSE_TIP:4,OUTER_MOUTH:ae,INNER_MOUTH:$,FACE_CENTER:b,MOUTH_CENTER:b+1},ne=["BACKGROUND","LEFT_EYEBROW","RIGHT_EYEBROW","LEFT_EYE","RIGHT_EYE","OUTER_MOUTH","INNER_MOUTH"],re=ne.length-1,k=Object.fromEntries(ne.map((r,e)=>[r,e/re])),J=.5/re,me={modelPath:"https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",maxFaces:1,minFaceDetectionConfidence:.5,minFacePresenceConfidence:.5,minTrackingConfidence:.5,outputFaceBlendshapes:!1,outputFacialTransformationMatrixes:!1};function M(r){let e=[];for(let t=1;t<r.length-1;++t)e.push(r[0],r[t],r[t+1]);return e}var f=null;function Ee(r){if(!f){let e=r.FACE_LANDMARKS_TESSELATION,t=[];for(let n=0;n<e.length-2;n+=3)t.push(e[n].start,e[n+1].start,e[n+2].start);let E=r.FACE_LANDMARKS_FACE_OVAL.map(({start:n})=>n);f=Object.fromEntries(Object.entries({LEFT_EYEBROW:M(Q),RIGHT_EYEBROW:M(ee),LEFT_EYE:M(Z),RIGHT_EYE:M(te),OUTER_MOUTH:M(ae),INNER_MOUTH:M($),TESSELATION:t,OVAL:M(E)}).map(([n,c])=>[n,{triangles:c,vertices:new Float32Array(c.length*2)}]))}}var I=new Map;function ue(r){let e=r.mask.canvas.getContext("webgl2",{antialias:!1,preserveDrawingBuffer:!0}),t=e.createShader(e.VERTEX_SHADER);e.shaderSource(t,oe),e.compileShader(t);let E=e.createShader(e.FRAGMENT_SHADER);e.shaderSource(E,ie),e.compileShader(E);let n=e.createProgram();e.attachShader(n,t),e.attachShader(n,E),e.linkProgram(n),e.deleteShader(t),e.deleteShader(E);let c=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,c);let u=e.getAttribLocation(n,"a_pos");e.enableVertexAttribArray(u),e.vertexAttribPointer(u,2,e.FLOAT,!1,0,0);let i=e.getUniformLocation(n,"u_color");e.useProgram(n),e.enable(e.BLEND),e.blendEquation(e.MAX),r.mask={...r.mask,gl:e,program:n,positionBuffer:c,colorLocation:i}}function g(r,e,t,E,n,c){let{triangles:u,vertices:i}=e,{mask:{gl:s,colorLocation:p},landmarks:A}=r,{data:d}=A;for(let F=0;F<u.length;++F){let x=(L+t*T+u[F])*4;i[F*2]=d[x],i[F*2+1]=d[x+1]}s.bufferData(s.ARRAY_BUFFER,i,s.DYNAMIC_DRAW),s.uniform4f(p,E,n,c,1),s.drawArrays(s.TRIANGLES,0,u.length)}function fe(r,e){let t=r.landmarks.data,E=e.length;t[0]=E;for(let n=0;n<E;++n){let c=e[n];for(let s=0;s<b;++s){let p=c[s],A=(L+n*T+s)*4;t[A]=p.x,t[A+1]=1-p.y,t[A+2]=p.z??0,t[A+3]=p.visibility??1}let u=H(t,n,le,T,L);t.set(u,(L+n*T+N.FACE_CENTER)*4);let i=H(t,n,$,T,1);t.set(i,(L+n*T+N.MOUTH_CENTER)*4)}r.state.nFaces=E}function de(r){if(!f)return;let{mask:e,canvas:t,maxFaces:E,state:{nFaces:n}}=r,{gl:c,canvas:u}=e;u.width=t.width,u.height=t.height,c.viewport(0,0,u.width,u.height),c.clearColor(0,0,0,0),c.clear(c.COLOR_BUFFER_BIT);for(let i=0;i<n;++i){let s=(i+1)/E;g(r,f.TESSELATION,i,0,.5,s),g(r,f.OVAL,i,0,1,s),g(r,f.LEFT_EYEBROW,i,k.LEFT_EYEBROW,0,s),g(r,f.RIGHT_EYEBROW,i,k.RIGHT_EYEBROW,0,s),g(r,f.LEFT_EYE,i,k.LEFT_EYE,0,s),g(r,f.RIGHT_EYE,i,k.RIGHT_EYE,0,s),g(r,f.OUTER_MOUTH,i,k.OUTER_MOUTH,0,s),g(r,f.INNER_MOUTH,i,k.INNER_MOUTH,0,s)}}function _e(r){let{textureName:e,options:{history:t,...E}={}}=r,n={...me,...E},c=j({...n,textureName:e}),u=n.maxFaces*T+L,i=Math.ceil(u/v);return function(s,p){let{injectGLSL:A,gl:d,emitHook:F}=p,x=I.get(c),U=x?.landmarks.data??new Float32Array(v*i*4),Y=x?.mask.canvas??new OffscreenCanvas(1,1),a=null,B=!1;function h(){if(!a)return;let o=a.state.nFaces,m=o*T+L,_=Math.ceil(m/v);s.updateTextures({u_faceLandmarksTex:{data:a.landmarks.data,width:v,height:_,isPartial:!0},u_faceMask:a.mask.canvas},{skipHistoryWrite:B}),s.updateUniforms({u_nFaces:o}),F("face:result",a.state.result)}async function se(){if(I.has(c))a=I.get(c);else{let[o,{FaceLandmarker:m}]=await Promise.all([X(),import("@mediapipe/tasks-vision")]),_=new OffscreenCanvas(1,1);a={landmarker:await m.createFromOptions(o,{baseOptions:{modelAssetPath:n.modelPath,delegate:"GPU"},canvas:_,runningMode:"VIDEO",numFaces:n.maxFaces,minFaceDetectionConfidence:n.minFaceDetectionConfidence,minFacePresenceConfidence:n.minFacePresenceConfidence,minTrackingConfidence:n.minTrackingConfidence,outputFaceBlendshapes:n.outputFaceBlendshapes,outputFacialTransformationMatrixes:n.outputFacialTransformationMatrixes}),canvas:_,subscribers:new Map,maxFaces:n.maxFaces,state:{runningMode:"VIDEO",source:null,videoTime:-1,resultTimestamp:0,result:null,pending:Promise.resolve(),nFaces:0},landmarks:{data:U,textureHeight:i},mask:{canvas:Y}},Ee(m),ue(a),I.set(c,a)}a.subscribers.set(h,!1)}let G=se(),w=0;async function P(o){let m=performance.now(),_=++w;await G,a&&(a.state.pending=a.state.pending.then(async()=>{if(_!==w||!a)return;let S=o instanceof HTMLVideoElement?"VIDEO":"IMAGE";a.state.runningMode!==S&&(a.state.runningMode=S,await a.landmarker.setOptions({runningMode:S}));let D=!1;if(o!==a.state.source?(a.state.source=o,a.state.videoTime=-1,D=!0):o instanceof HTMLVideoElement?o.currentTime!==a.state.videoTime&&(a.state.videoTime=o.currentTime,D=!0):o instanceof HTMLImageElement||m-a.state.resultTimestamp>2&&(D=!0),D){let C;if(o instanceof HTMLVideoElement){if(o.videoWidth===0||o.videoHeight===0||o.readyState<2)return;C=a.landmarker.detectForVideo(o,m)}else{if(o.width===0||o.height===0)return;C=a.landmarker.detect(o)}if(C){a.state.resultTimestamp=m,a.state.result=C,fe(a,C.faceLandmarks),de(a);for(let z of a.subscribers.keys())z(),a.subscribers.set(z,!0)}}else a.state.result&&!a.subscribers.get(h)&&(h(),a.subscribers.set(h,!0))}),await a.state.pending)}s.on("init",()=>{s.initializeUniform("u_maxFaces","int",n.maxFaces),s.initializeUniform("u_nFaces","int",0),s.initializeTexture("u_faceLandmarksTex",{data:U,width:v,height:i},{internalFormat:d.RGBA32F,type:d.FLOAT,minFilter:d.NEAREST,magFilter:d.NEAREST,history:t}),s.initializeTexture("u_faceMask",Y,{minFilter:d.NEAREST,magFilter:d.NEAREST,history:t}),G.then(()=>F("face:ready"))}),s.on("initializeTexture",(o,m)=>{o===e&&y(m)&&P(m)}),s.on("updateTextures",(o,m)=>{let _=o[e];y(_)&&(B=m?.skipHistoryWrite??!1,P(_))}),s.on("destroy",()=>{a&&(a.subscribers.delete(h),a.subscribers.size===0&&(a.landmarker.close(),a.mask.gl.deleteProgram(a.mask.program),a.mask.gl.deleteBuffer(a.mask.positionBuffer),I.delete(c))),a=null});let{fn:l,historyParams:R}=q(t),W=t?"_sampleFaceMask(pos, framesAgo)":"texture(u_faceMask, pos)",O=(o,m=o)=>`vec4 mask = ${W};
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return (mask.r > ${(k[o]-J).toFixed(4)} && mask.r < ${(k[m]+J).toFixed(4)}) ? vec2(1.0, faceIndex) : vec2(0.0, -1.0);`,K=o=>`vec4 mask = ${W};
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return mask.g > ${o.toFixed(2)} ? vec2(1.0, faceIndex) : vec2(0.0, -1.0);`,V=(o,m)=>`vec2 left = ${o}(pos${R});
	return left.x > 0.0 ? left : ${m}(pos${R});`;A(`
uniform int u_maxFaces;
uniform int u_nFaces;
uniform highp sampler2D${t?"Array":""} u_faceLandmarksTex;${t?`
uniform int u_faceLandmarksTexFrameOffset;`:""}
uniform sampler2D${t?"Array":""} u_faceMask;${t?`
uniform int u_faceMaskFrameOffset;`:""}

#define FACE_LANDMARK_L_EYE_CENTER ${N.LEFT_EYE_CENTER}
#define FACE_LANDMARK_R_EYE_CENTER ${N.RIGHT_EYE_CENTER}
#define FACE_LANDMARK_NOSE_TIP ${N.NOSE_TIP}
#define FACE_LANDMARK_FACE_CENTER ${N.FACE_CENTER}
#define FACE_LANDMARK_MOUTH_CENTER ${N.MOUTH_CENTER}

${l("int","nFacesAt","",t?`
	int layer = (u_faceLandmarksTexFrameOffset - framesAgo + ${t}) % ${t};
	return int(texelFetch(u_faceLandmarksTex, ivec3(0, 0, layer), 0).r + 0.5);`:`
	return int(texelFetch(u_faceLandmarksTex, ivec2(0, 0), 0).r + 0.5);`)}
${l("vec4","faceLandmark","int faceIndex, int landmarkIndex",`int i = ${L} + faceIndex * ${T} + landmarkIndex;
	int x = i % ${v};
	int y = i / ${v};${t?`
	int layer = (u_faceLandmarksTexFrameOffset - framesAgo + ${t}) % ${t};
	return texelFetch(u_faceLandmarksTex, ivec3(x, y, layer), 0);`:`
	return texelFetch(u_faceLandmarksTex, ivec2(x, y), 0);`}`)}
${t?`
vec4 _sampleFaceMask(vec2 pos, int framesAgo) {
	int layer = (u_faceMaskFrameOffset - framesAgo + ${t}) % ${t};
	return texture(u_faceMask, vec3(pos, float(layer)));
}
`:""}
${l("vec2","leftEyebrowAt","vec2 pos",O("LEFT_EYEBROW"))}
${l("vec2","rightEyebrowAt","vec2 pos",O("RIGHT_EYEBROW"))}
${l("vec2","leftEyeAt","vec2 pos",O("LEFT_EYE"))}
${l("vec2","rightEyeAt","vec2 pos",O("RIGHT_EYE"))}
${l("vec2","lipsAt","vec2 pos",O("OUTER_MOUTH"))}
${l("vec2","outerMouthAt","vec2 pos",O("OUTER_MOUTH","INNER_MOUTH"))}
${l("vec2","innerMouthAt","vec2 pos",O("INNER_MOUTH"))}
${l("vec2","faceOvalAt","vec2 pos",K(.75))}
${l("vec2","faceAt","vec2 pos",K(.25))}
${l("vec2","eyeAt","vec2 pos",V("leftEyeAt","rightEyeAt"))}
${l("vec2","eyebrowAt","vec2 pos",V("leftEyebrowAt","rightEyebrowAt"))}
${l("float","inEyebrow","vec2 pos",`return eyebrowAt(pos${R}).x;`)}
${l("float","inEye","vec2 pos",`return eyeAt(pos${R}).x;`)}
${l("float","inOuterMouth","vec2 pos",`return outerMouthAt(pos${R}).x;`)}
${l("float","inInnerMouth","vec2 pos",`return innerMouthAt(pos${R}).x;`)}
${l("float","inLips","vec2 pos",`return lipsAt(pos${R}).x;`)}
${l("float","inFace","vec2 pos",`return faceAt(pos${R}).x;`)}`)}}var Fe=_e;export{Fe as default};
//# sourceMappingURL=face.mjs.map