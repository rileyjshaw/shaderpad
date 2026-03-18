import{b as B,c as Z,d as G,e as ee,f as te}from"../chunk-VMNWRREI.mjs";var fe=`#version 300 es
in vec2 a_pos;
void main() { gl_Position = vec4(a_pos * 2.0 - 1.0, 0.0, 1.0); }`,Ee=`#version 300 es
precision mediump float;
uniform vec4 u_color;
out vec4 outColor;
void main() { outColor = u_color; }`,I=478,de=2,F=I+de,h=512,k=1,ae=[336,296,334,293,300,276,283,282,295,285],re=[362,398,384,385,386,387,388,466,263,249,390,373,374,380,381,382],se=[70,63,105,66,107,55,65,52,53,46],ie=[33,246,161,160,159,158,157,173,133,155,154,153,145,144,163,7],oe=[61,185,40,39,37,0,267,269,270,409,291,375,321,405,314,17,84,181,91,146],w=[78,191,80,81,82,13,312,311,310,415,308,324,318,402,317,14,87,178,88,95],_e=Array.from({length:I},(c,e)=>e),N={LEFT_EYEBROW:ae,LEFT_EYE:re,LEFT_EYE_CENTER:473,RIGHT_EYEBROW:se,RIGHT_EYE:ie,RIGHT_EYE_CENTER:468,NOSE_TIP:4,MOUTH:oe,INNER_MOUTH:w,FACE_CENTER:I,MOUTH_CENTER:I+1},ce=["BACKGROUND","LEFT_EYEBROW","RIGHT_EYEBROW","LEFT_EYE","RIGHT_EYE","MOUTH","INNER_MOUTH"],le=ce.length-1,g=Object.fromEntries(ce.map((c,e)=>[c,e/le])),ne=.5/le,Te={modelPath:"https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",maxFaces:1,minFaceDetectionConfidence:.5,minFacePresenceConfidence:.5,minTrackingConfidence:.5,outputFaceBlendshapes:!1,outputFacialTransformationMatrixes:!1};function M(c){let e=[];for(let t=1;t<c.length-1;++t)e.push(c[0],c[t],c[t+1]);return e}var _=null;function Fe(c){if(!_){let e=c.FACE_LANDMARKS_TESSELATION,t=[];for(let a=0;a<e.length-2;a+=3)t.push(e[a].start,e[a+1].start,e[a+2].start);let o=c.FACE_LANDMARKS_FACE_OVAL.map(({start:a})=>a);_=Object.fromEntries(Object.entries({LEFT_EYEBROW:M(ae),RIGHT_EYEBROW:M(se),LEFT_EYE:M(re),RIGHT_EYE:M(ie),MOUTH:M(oe),INNER_MOUTH:M(w),TESSELATION:t,OVAL:M(o)}).map(([a,u])=>[a,{triangles:u,vertices:new Float32Array(u.length*2)}]))}}var C=new Map;function pe(c){let e=c.getContext("webgl2",{antialias:!1,preserveDrawingBuffer:!0}),t=e.createShader(e.VERTEX_SHADER);e.shaderSource(t,fe),e.compileShader(t);let o=e.createShader(e.FRAGMENT_SHADER);e.shaderSource(o,Ee),e.compileShader(o);let a=e.createProgram();e.attachShader(a,t),e.attachShader(a,o),e.linkProgram(a),e.deleteShader(t),e.deleteShader(o);let u=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,u);let T=e.getAttribLocation(a,"a_pos");e.enableVertexAttribArray(T),e.vertexAttribPointer(T,2,e.FLOAT,!1,0,0);let E=e.getUniformLocation(a,"u_color");return e.useProgram(a),e.enable(e.BLEND),e.blendEquation(e.MAX),{canvas:c,gl:e,program:a,positionBuffer:u,colorLocation:E}}function R(c,e,t,o,a,u,T){let{triangles:E,vertices:s}=t,{gl:l,colorLocation:m}=c;for(let f=0;f<E.length;++f){let S=(k+o*F+E[f])*4;s[f*2]=e[S],s[f*2+1]=e[S+1]}l.bufferData(l.ARRAY_BUFFER,s,l.DYNAMIC_DRAW),l.uniform4f(m,a,u,T,1),l.drawArrays(l.TRIANGLES,0,E.length)}function Ae(c,e){let t=c.landmarks.data,o=e.length;t[0]=o;for(let a=0;a<o;++a){let u=e[a];for(let s=0;s<I;++s){let l=u[s],m=(k+a*F+s)*4;t[m]=l.x,t[m+1]=1-l.y,t[m+2]=l.z??0,t[m+3]=l.visibility??1}let T=G(t,a,_e,F,k);t.set(T,(k+a*F+N.FACE_CENTER)*4);let E=G(t,a,w,F,1);t.set(E,(k+a*F+N.MOUTH_CENTER)*4)}c.state.nFaces=o}function Re(c,e,t){let{mask:o,maxFaces:a,landmarks:u,state:{nFaces:T}}=c,{gl:E,canvas:s}=o,{data:l}=u;if((s.width!==e||s.height!==t)&&(s.width=e,s.height=t),E.viewport(0,0,s.width,s.height),E.clearColor(0,0,0,0),E.clear(E.COLOR_BUFFER_BIT),!!_)for(let m=0;m<T;++m){let f=(m+1)/a;R(o,l,_.TESSELATION,m,0,.5,f),R(o,l,_.OVAL,m,0,1,f),R(o,l,_.LEFT_EYEBROW,m,g.LEFT_EYEBROW,0,f),R(o,l,_.RIGHT_EYEBROW,m,g.RIGHT_EYEBROW,0,f),R(o,l,_.LEFT_EYE,m,g.LEFT_EYE,0,f),R(o,l,_.RIGHT_EYE,m,g.RIGHT_EYE,0,f),R(o,l,_.MOUTH,m,g.MOUTH,0,f),R(o,l,_.INNER_MOUTH,m,g.INNER_MOUTH,0,f)}}function ge(c){let{textureName:e,options:{history:t,...o}={}}=c,a={...Te,...o},u=Z({...a,textureName:e}),T=a.maxFaces*F+k,E=Math.ceil(T/h);return function(s,l){let{injectGLSL:m,emitHook:f,updateTexturesInternal:S}=l,P=C.get(u),W=P?.landmarks.data??new Float32Array(h*E*4),K=P?.mask.canvas??new OffscreenCanvas(1,1),n=null,y=!1,H=!1;function $(r){if(!n)return;let i=n.state.nFaces,d=i*F+k,O=Math.ceil(d/h),p=r;typeof p>"u"&&D.length>0&&(p=D,D=[]),S({u_faceLandmarksTex:{data:n.landmarks.data,width:h,height:O,isPartial:!0},u_faceMask:n.mask.canvas},t?{skipHistoryWrite:H,historyWriteIndex:p}:void 0),s.updateUniforms({u_nFaces:i}),f("face:result",n.state.result)}async function me(){if(C.has(u))n=C.get(u);else{let[r,{FaceLandmarker:i}]=await Promise.all([ee(),import("@mediapipe/tasks-vision")]);if(y)return;let d=await i.createFromOptions(r,{baseOptions:{modelAssetPath:a.modelPath,delegate:"GPU"},runningMode:"VIDEO",numFaces:a.maxFaces,minFaceDetectionConfidence:a.minFaceDetectionConfidence,minFacePresenceConfidence:a.minFacePresenceConfidence,minTrackingConfidence:a.minTrackingConfidence,outputFaceBlendshapes:a.outputFaceBlendshapes,outputFacialTransformationMatrixes:a.outputFacialTransformationMatrixes});if(y){d.close();return}n={landmarker:d,mask:pe(K),subscribers:new Map,maxFaces:a.maxFaces,state:{nCalls:0,runningMode:"VIDEO",source:null,videoTime:-1,resultTimestamp:0,result:null,pending:Promise.resolve(),nFaces:0},landmarks:{data:W,textureHeight:E}},Fe(i),C.set(u,n)}n.subscribers.set($,!1)}let V=me();async function z(r){let i=performance.now();if(await V,!n)return;let d=++n.state.nCalls;n.state.pending=n.state.pending.then(async()=>{if(!n||d!==n.state.nCalls)return;let O=r instanceof HTMLVideoElement?"VIDEO":"IMAGE";n.state.runningMode!==O&&(n.state.runningMode=O,await n.landmarker.setOptions({runningMode:O}));let p=!1;if(r!==n.state.source?(n.state.source=r,n.state.videoTime=-1,p=!0):r instanceof HTMLVideoElement?r.currentTime!==n.state.videoTime&&(n.state.videoTime=r.currentTime,p=!0):r instanceof HTMLImageElement||i-n.state.resultTimestamp>2&&(p=!0),p){let A,x,Y;if(r instanceof HTMLVideoElement){if(r.videoWidth===0||r.videoHeight===0||r.readyState<2)return;x=r.videoWidth,Y=r.videoHeight,A=n.landmarker.detectForVideo(r,i)}else{if(r.width===0||r.height===0)return;x=r.width,Y=r.height,A=n.landmarker.detect(r)}if(A){n.state.resultTimestamp=i,n.state.result=A,Ae(n,A.faceLandmarks),Re(n,x,Y);for(let Q of n.subscribers.keys())Q(),n.subscribers.set(Q,!0)}}else if(n.state.result)for(let[A,x]of n.subscribers.entries())x||(A(),n.subscribers.set(A,!0))}),await n.state.pending}s.on("_init",()=>{s.initializeUniform("u_maxFaces","int",a.maxFaces),s.initializeUniform("u_nFaces","int",0),s.initializeTexture("u_faceLandmarksTex",{data:W,width:h,height:E},{internalFormat:"RGBA32F",type:"FLOAT",minFilter:"NEAREST",magFilter:"NEAREST",history:t}),s.initializeTexture("u_faceMask",K,{minFilter:"NEAREST",magFilter:"NEAREST",history:t}),V.then(()=>{y||!n||f("face:ready")})});let v=0,D=[],j=()=>{t&&($(v),D.push(v),v=(v+1)%(t+1))};s.on("initializeTexture",(r,i)=>{r===e&&B(i)&&(j(),z(i))}),s.on("updateTextures",(r,i)=>{let d=r[e];B(d)&&(H=i?.skipHistoryWrite??!1,H||j(),z(d))}),s.on("destroy",()=>{y=!0,n&&(n.subscribers.delete($),n.subscribers.size===0&&(n.landmarker.close(),n.mask.gl.deleteProgram(n.mask.program),n.mask.gl.deleteBuffer(n.mask.positionBuffer),C.delete(u))),n=null});let{fn:b,historyParams:U}=te(t),X=t?"_sampleFaceMask(pos, framesAgo)":"texture(u_faceMask, pos)",L=(r,i,d=i)=>b("vec2",`${r}At`,"vec2 pos",`vec4 mask = ${X};
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return (mask.r > ${(g[i]-ne).toFixed(4)} && mask.r < ${(g[d]+ne).toFixed(4)}) ? vec2(1.0, faceIndex) : vec2(0.0, -1.0);`),q=(r,i)=>b("vec2",`${r}At`,"vec2 pos",`vec4 mask = ${X};
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return mask.g > ${i.toFixed(2)} ? vec2(1.0, faceIndex) : vec2(0.0, -1.0);`),J=(r,i,d)=>b("vec2",`${r}At`,"vec2 pos",`vec2 left = ${i}(pos${U});
	return left.x > 0.0 ? left : ${d}(pos${U});`),ue=r=>r.map(i=>b("float",`in${i[0].toUpperCase()+i.slice(1)}`,"vec2 pos",`vec2 a = ${i}At(pos${U}); return step(0.0, a.y) * a.x;`)).join(`
`);m(`
uniform int u_maxFaces;
uniform int u_nFaces;
uniform highp sampler2D${t?"Array":""} u_faceLandmarksTex;${t?`
uniform int u_faceLandmarksTexFrameOffset;`:""}
uniform ${t?"highp":"mediump"} sampler2D${t?"Array":""} u_faceMask;${t?`
uniform int u_faceMaskFrameOffset;`:""}

#define FACE_LANDMARK_L_EYE_CENTER ${N.LEFT_EYE_CENTER}
#define FACE_LANDMARK_R_EYE_CENTER ${N.RIGHT_EYE_CENTER}
#define FACE_LANDMARK_NOSE_TIP ${N.NOSE_TIP}
#define FACE_LANDMARK_FACE_CENTER ${N.FACE_CENTER}
#define FACE_LANDMARK_MOUTH_CENTER ${N.MOUTH_CENTER}

${b("int","nFacesAt","",t?`
	int layer = (u_faceLandmarksTexFrameOffset - framesAgo + ${t+1}) % ${t+1};
	return int(texelFetch(u_faceLandmarksTex, ivec3(0, 0, layer), 0).r + 0.5);`:`
	return int(texelFetch(u_faceLandmarksTex, ivec2(0, 0), 0).r + 0.5);`)}
${b("vec4","faceLandmark","int faceIndex, int landmarkIndex",`int i = ${k} + faceIndex * ${F} + landmarkIndex;
	int x = i % ${h};
	int y = i / ${h};${t?`
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
${L("lips","MOUTH")}
${L("mouth","MOUTH","INNER_MOUTH")}
${L("innerMouth","INNER_MOUTH")}
${q("faceOval",.75)}
${q("face",.25)}
${J("eye","leftEyeAt","rightEyeAt")}
${J("eyebrow","leftEyebrowAt","rightEyebrowAt")}
${ue(["eyebrow","eye","mouth","innerMouth","lips","face"])}`)}}var he=ge;export{he as default};
//# sourceMappingURL=face.mjs.map