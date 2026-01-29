import{b as $,c as q,d as U,e as J,f as Q}from"../chunk-JRSBIGBN.mjs";var le=`#version 300 es
in vec2 a_pos;
void main() { gl_Position = vec4(a_pos * 2.0 - 1.0, 0.0, 1.0); }`,me=`#version 300 es
precision mediump float;
uniform vec4 u_color;
out vec4 outColor;
void main() { outColor = u_color; }`,I=478,Ee=2,F=I+Ee,k=512,A=1,ee=[336,296,334,293,300,276,283,282,295,285],te=[362,398,384,385,386,387,388,466,263,249,390,373,374,380,381,382],ae=[70,63,105,66,107,55,65,52,53,46],ne=[33,246,161,160,159,158,157,173,133,155,154,153,145,144,163,7],re=[61,185,40,39,37,0,267,269,270,409,291,375,321,405,314,17,84,181,91,146],Y=[78,191,80,81,82,13,312,311,310,415,308,324,318,402,317,14,87,178,88,95],fe=Array.from({length:I},(c,e)=>e),O={LEFT_EYEBROW:ee,LEFT_EYE:te,LEFT_EYE_CENTER:473,RIGHT_EYEBROW:ae,RIGHT_EYE:ne,RIGHT_EYE_CENTER:468,NOSE_TIP:4,OUTER_MOUTH:re,INNER_MOUTH:Y,FACE_CENTER:I,MOUTH_CENTER:I+1},se=["BACKGROUND","LEFT_EYEBROW","RIGHT_EYEBROW","LEFT_EYE","RIGHT_EYE","OUTER_MOUTH","INNER_MOUTH"],ie=se.length-1,p=Object.fromEntries(se.map((c,e)=>[c,e/ie])),Z=.5/ie,ue={modelPath:"https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",maxFaces:1,minFaceDetectionConfidence:.5,minFacePresenceConfidence:.5,minTrackingConfidence:.5,outputFaceBlendshapes:!1,outputFacialTransformationMatrixes:!1};function L(c){let e=[];for(let t=1;t<c.length-1;++t)e.push(c[0],c[t],c[t+1]);return e}var _=null;function de(c){if(!_){let e=c.FACE_LANDMARKS_TESSELATION,t=[];for(let n=0;n<e.length-2;n+=3)t.push(e[n].start,e[n+1].start,e[n+2].start);let i=c.FACE_LANDMARKS_FACE_OVAL.map(({start:n})=>n);_=Object.fromEntries(Object.entries({LEFT_EYEBROW:L(ee),RIGHT_EYEBROW:L(ae),LEFT_EYE:L(te),RIGHT_EYE:L(ne),OUTER_MOUTH:L(re),INNER_MOUTH:L(Y),TESSELATION:t,OVAL:L(i)}).map(([n,E])=>[n,{triangles:E,vertices:new Float32Array(E.length*2)}]))}}var b=new Map;function _e(c){let e=c.getContext("webgl2",{antialias:!1,preserveDrawingBuffer:!0}),t=e.createShader(e.VERTEX_SHADER);e.shaderSource(t,le),e.compileShader(t);let i=e.createShader(e.FRAGMENT_SHADER);e.shaderSource(i,me),e.compileShader(i);let n=e.createProgram();e.attachShader(n,t),e.attachShader(n,i),e.linkProgram(n),e.deleteShader(t),e.deleteShader(i);let E=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,E);let T=e.getAttribLocation(n,"a_pos");e.enableVertexAttribArray(T),e.vertexAttribPointer(T,2,e.FLOAT,!1,0,0);let u=e.getUniformLocation(n,"u_color");return e.useProgram(n),e.enable(e.BLEND),e.blendEquation(e.MAX),{canvas:c,gl:e,program:n,positionBuffer:E,colorLocation:u}}function R(c,e,t,i,n,E,T){let{triangles:u,vertices:s}=t,{gl:l,colorLocation:m}=c;for(let f=0;f<u.length;++f){let N=(A+i*F+u[f])*4;s[f*2]=e[N],s[f*2+1]=e[N+1]}l.bufferData(l.ARRAY_BUFFER,s,l.DYNAMIC_DRAW),l.uniform4f(m,n,E,T,1),l.drawArrays(l.TRIANGLES,0,u.length)}function Te(c,e){let t=c.landmarks.data,i=e.length;t[0]=i;for(let n=0;n<i;++n){let E=e[n];for(let s=0;s<I;++s){let l=E[s],m=(A+n*F+s)*4;t[m]=l.x,t[m+1]=1-l.y,t[m+2]=l.z??0,t[m+3]=l.visibility??1}let T=U(t,n,fe,F,A);t.set(T,(A+n*F+O.FACE_CENTER)*4);let u=U(t,n,Y,F,1);t.set(u,(A+n*F+O.MOUTH_CENTER)*4)}c.state.nFaces=i}function Fe(c,e,t){let{mask:i,maxFaces:n,landmarks:E,state:{nFaces:T}}=c,{gl:u,canvas:s}=i,{data:l}=E;if((s.width!==e||s.height!==t)&&(s.width=e,s.height=t),u.viewport(0,0,s.width,s.height),u.clearColor(0,0,0,0),u.clear(u.COLOR_BUFFER_BIT),!!_)for(let m=0;m<T;++m){let f=(m+1)/n;R(i,l,_.TESSELATION,m,0,.5,f),R(i,l,_.OVAL,m,0,1,f),R(i,l,_.LEFT_EYEBROW,m,p.LEFT_EYEBROW,0,f),R(i,l,_.RIGHT_EYEBROW,m,p.RIGHT_EYEBROW,0,f),R(i,l,_.LEFT_EYE,m,p.LEFT_EYE,0,f),R(i,l,_.RIGHT_EYE,m,p.RIGHT_EYE,0,f),R(i,l,_.OUTER_MOUTH,m,p.OUTER_MOUTH,0,f),R(i,l,_.INNER_MOUTH,m,p.INNER_MOUTH,0,f)}}function Re(c){let{textureName:e,options:{history:t,...i}={}}=c,n={...ue,...i},E=q({...n,textureName:e}),T=n.maxFaces*F+A,u=Math.ceil(T/k);return function(s,l){let{injectGLSL:m,emitHook:f}=l,N=b.get(E),B=N?.landmarks.data??new Float32Array(k*u*4),G=N?.mask.canvas??new OffscreenCanvas(1,1),a=null,v=!1,w=!1;function x(){if(!a)return;let r=a.state.nFaces,o=r*F+A,d=Math.ceil(o/k);s.updateTextures({u_faceLandmarksTex:{data:a.landmarks.data,width:k,height:d,isPartial:!0},u_faceMask:a.mask.canvas},{skipHistoryWrite:w}),s.updateUniforms({u_nFaces:r}),f("face:result",a.state.result)}async function oe(){if(b.has(E))a=b.get(E);else{let[r,{FaceLandmarker:o}]=await Promise.all([J(),import("@mediapipe/tasks-vision")]);if(v)return;let d=new OffscreenCanvas(1,1),h=await o.createFromOptions(r,{baseOptions:{modelAssetPath:n.modelPath,delegate:"GPU"},canvas:d,runningMode:"VIDEO",numFaces:n.maxFaces,minFaceDetectionConfidence:n.minFaceDetectionConfidence,minFacePresenceConfidence:n.minFacePresenceConfidence,minTrackingConfidence:n.minTrackingConfidence,outputFaceBlendshapes:n.outputFaceBlendshapes,outputFacialTransformationMatrixes:n.outputFacialTransformationMatrixes});if(v){h.close();return}a={landmarker:h,mediapipeCanvas:d,mask:_e(G),subscribers:new Map,maxFaces:n.maxFaces,state:{runningMode:"VIDEO",source:null,videoTime:-1,resultTimestamp:0,result:null,pending:Promise.resolve(),nFaces:0},landmarks:{data:B,textureHeight:u}},de(o),b.set(E,a)}a.subscribers.set(x,!1)}let P=oe(),W=0;async function K(r){let o=performance.now(),d=++W;await P,a&&(a.state.pending=a.state.pending.then(async()=>{if(d!==W||!a)return;let h=r instanceof HTMLVideoElement?"VIDEO":"IMAGE";a.state.runningMode!==h&&(a.state.runningMode=h,await a.landmarker.setOptions({runningMode:h}));let S=!1;if(r!==a.state.source?(a.state.source=r,a.state.videoTime=-1,S=!0):r instanceof HTMLVideoElement?r.currentTime!==a.state.videoTime&&(a.state.videoTime=r.currentTime,S=!0):r instanceof HTMLImageElement||o-a.state.resultTimestamp>2&&(S=!0),S){let C,y,H;if(r instanceof HTMLVideoElement){if(r.videoWidth===0||r.videoHeight===0||r.readyState<2)return;y=r.videoWidth,H=r.videoHeight,C=a.landmarker.detectForVideo(r,o)}else{if(r.width===0||r.height===0)return;y=r.width,H=r.height,C=a.landmarker.detect(r)}if(C){a.state.resultTimestamp=o,a.state.result=C,Te(a,C.faceLandmarks),Fe(a,y,H);for(let X of a.subscribers.keys())X(),a.subscribers.set(X,!0)}}else a.state.result&&!a.subscribers.get(x)&&(x(),a.subscribers.set(x,!0))}),await a.state.pending)}s.on("init",()=>{s.initializeUniform("u_maxFaces","int",n.maxFaces),s.initializeUniform("u_nFaces","int",0),s.initializeTexture("u_faceLandmarksTex",{data:B,width:k,height:u},{internalFormat:"RGBA32F",type:"FLOAT",minFilter:"NEAREST",magFilter:"NEAREST",history:t}),s.initializeTexture("u_faceMask",G,{minFilter:"NEAREST",magFilter:"NEAREST",history:t}),P.then(()=>{v||!a||f("face:ready")})}),s.on("initializeTexture",(r,o)=>{r===e&&$(o)&&K(o)}),s.on("updateTextures",(r,o)=>{let d=r[e];$(d)&&(w=o?.skipHistoryWrite??!1,K(d))}),s.on("destroy",()=>{v=!0,a&&(a.subscribers.delete(x),a.subscribers.size===0&&(a.landmarker.close(),a.mask.gl.deleteProgram(a.mask.program),a.mask.gl.deleteBuffer(a.mask.positionBuffer),b.delete(E))),a=null});let{fn:M,historyParams:D}=Q(t),V=t?"_sampleFaceMask(pos, framesAgo)":"texture(u_faceMask, pos)",g=(r,o,d=o)=>M("vec2",`${r}At`,"vec2 pos",`vec4 mask = ${V};
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return (mask.r > ${(p[o]-Z).toFixed(4)} && mask.r < ${(p[d]+Z).toFixed(4)}) ? vec2(1.0, faceIndex) : vec2(0.0, -1.0);`),z=(r,o)=>M("vec2",`${r}At`,"vec2 pos",`vec4 mask = ${V};
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return mask.g > ${o.toFixed(2)} ? vec2(1.0, faceIndex) : vec2(0.0, -1.0);`),j=(r,o,d)=>M("vec2",`${r}At`,"vec2 pos",`vec2 left = ${o}(pos${D});
	return left.x > 0.0 ? left : ${d}(pos${D});`),ce=r=>r.map(o=>M("float",`in${o[0].toUpperCase()+o.slice(1)}`,"vec2 pos",`vec2 a = ${o}At(pos${D}); return step(0.0, a.y) * a.x;`)).join(`
`);m(`
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
${z("faceOval",.75)}
${z("face",.25)}
${j("eye","leftEyeAt","rightEyeAt")}
${j("eyebrow","leftEyebrowAt","rightEyebrowAt")}
${ce(["eyebrow","eye","outerMouth","innerMouth","lips","face"])}`)}}var ge=Re;export{ge as default};
//# sourceMappingURL=face.mjs.map