import{b as B,c as Q,d as G,e as Z,f as ee}from"../chunk-JRSBIGBN.mjs";var ue=`#version 300 es
in vec2 a_pos;
void main() { gl_Position = vec4(a_pos * 2.0 - 1.0, 0.0, 1.0); }`,Ee=`#version 300 es
precision mediump float;
uniform vec4 u_color;
out vec4 outColor;
void main() { outColor = u_color; }`,S=478,fe=2,F=S+fe,h=512,k=1,ne=[336,296,334,293,300,276,283,282,295,285],ae=[362,398,384,385,386,387,388,466,263,249,390,373,374,380,381,382],re=[70,63,105,66,107,55,65,52,53,46],se=[33,246,161,160,159,158,157,173,133,155,154,153,145,144,163,7],ie=[61,185,40,39,37,0,267,269,270,409,291,375,321,405,314,17,84,181,91,146],w=[78,191,80,81,82,13,312,311,310,415,308,324,318,402,317,14,87,178,88,95],de=Array.from({length:S},(c,e)=>e),M={LEFT_EYEBROW:ne,LEFT_EYE:ae,LEFT_EYE_CENTER:473,RIGHT_EYEBROW:re,RIGHT_EYE:se,RIGHT_EYE_CENTER:468,NOSE_TIP:4,OUTER_MOUTH:ie,INNER_MOUTH:w,FACE_CENTER:S,MOUTH_CENTER:S+1},oe=["BACKGROUND","LEFT_EYEBROW","RIGHT_EYEBROW","LEFT_EYE","RIGHT_EYE","OUTER_MOUTH","INNER_MOUTH"],ce=oe.length-1,g=Object.fromEntries(oe.map((c,e)=>[c,e/ce])),te=.5/ce,_e={modelPath:"https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",maxFaces:1,minFaceDetectionConfidence:.5,minFacePresenceConfidence:.5,minTrackingConfidence:.5,outputFaceBlendshapes:!1,outputFacialTransformationMatrixes:!1};function O(c){let e=[];for(let t=1;t<c.length-1;++t)e.push(c[0],c[t],c[t+1]);return e}var _=null;function Te(c){if(!_){let e=c.FACE_LANDMARKS_TESSELATION,t=[];for(let a=0;a<e.length-2;a+=3)t.push(e[a].start,e[a+1].start,e[a+2].start);let o=c.FACE_LANDMARKS_FACE_OVAL.map(({start:a})=>a);_=Object.fromEntries(Object.entries({LEFT_EYEBROW:O(ne),RIGHT_EYEBROW:O(re),LEFT_EYE:O(ae),RIGHT_EYE:O(se),OUTER_MOUTH:O(ie),INNER_MOUTH:O(w),TESSELATION:t,OVAL:O(o)}).map(([a,u])=>[a,{triangles:u,vertices:new Float32Array(u.length*2)}]))}}var I=new Map;function Fe(c){let e=c.getContext("webgl2",{antialias:!1,preserveDrawingBuffer:!0}),t=e.createShader(e.VERTEX_SHADER);e.shaderSource(t,ue),e.compileShader(t);let o=e.createShader(e.FRAGMENT_SHADER);e.shaderSource(o,Ee),e.compileShader(o);let a=e.createProgram();e.attachShader(a,t),e.attachShader(a,o),e.linkProgram(a),e.deleteShader(t),e.deleteShader(o);let u=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,u);let T=e.getAttribLocation(a,"a_pos");e.enableVertexAttribArray(T),e.vertexAttribPointer(T,2,e.FLOAT,!1,0,0);let f=e.getUniformLocation(a,"u_color");return e.useProgram(a),e.enable(e.BLEND),e.blendEquation(e.MAX),{canvas:c,gl:e,program:a,positionBuffer:u,colorLocation:f}}function A(c,e,t,o,a,u,T){let{triangles:f,vertices:s}=t,{gl:l,colorLocation:m}=c;for(let E=0;E<f.length;++E){let b=(k+o*F+f[E])*4;s[E*2]=e[b],s[E*2+1]=e[b+1]}l.bufferData(l.ARRAY_BUFFER,s,l.DYNAMIC_DRAW),l.uniform4f(m,a,u,T,1),l.drawArrays(l.TRIANGLES,0,f.length)}function Re(c,e){let t=c.landmarks.data,o=e.length;t[0]=o;for(let a=0;a<o;++a){let u=e[a];for(let s=0;s<S;++s){let l=u[s],m=(k+a*F+s)*4;t[m]=l.x,t[m+1]=1-l.y,t[m+2]=l.z??0,t[m+3]=l.visibility??1}let T=G(t,a,de,F,k);t.set(T,(k+a*F+M.FACE_CENTER)*4);let f=G(t,a,w,F,1);t.set(f,(k+a*F+M.MOUTH_CENTER)*4)}c.state.nFaces=o}function pe(c,e,t){let{mask:o,maxFaces:a,landmarks:u,state:{nFaces:T}}=c,{gl:f,canvas:s}=o,{data:l}=u;if((s.width!==e||s.height!==t)&&(s.width=e,s.height=t),f.viewport(0,0,s.width,s.height),f.clearColor(0,0,0,0),f.clear(f.COLOR_BUFFER_BIT),!!_)for(let m=0;m<T;++m){let E=(m+1)/a;A(o,l,_.TESSELATION,m,0,.5,E),A(o,l,_.OVAL,m,0,1,E),A(o,l,_.LEFT_EYEBROW,m,g.LEFT_EYEBROW,0,E),A(o,l,_.RIGHT_EYEBROW,m,g.RIGHT_EYEBROW,0,E),A(o,l,_.LEFT_EYE,m,g.LEFT_EYE,0,E),A(o,l,_.RIGHT_EYE,m,g.RIGHT_EYE,0,E),A(o,l,_.OUTER_MOUTH,m,g.OUTER_MOUTH,0,E),A(o,l,_.INNER_MOUTH,m,g.INNER_MOUTH,0,E)}}function Ae(c){let{textureName:e,options:{history:t,...o}={}}=c,a={..._e,...o},u=Q({...a,textureName:e}),T=a.maxFaces*F+k,f=Math.ceil(T/h);return function(s,l){let{injectGLSL:m,emitHook:E}=l,b=I.get(u),P=b?.landmarks.data??new Float32Array(h*f*4),W=b?.mask.canvas??new OffscreenCanvas(1,1),n=null,y=!1,H=!1;function $(r){if(!n)return;let i=n.state.nFaces,d=i*F+k,x=Math.ceil(d/h),R=r;typeof R>"u"&&D.length>0&&(R=D,D=[]),s.updateTextures({u_faceLandmarksTex:{data:n.landmarks.data,width:h,height:x,isPartial:!0},u_faceMask:n.mask.canvas},t?{skipHistoryWrite:H,historyWriteIndex:R}:void 0),s.updateUniforms({u_nFaces:i}),E("face:result",n.state.result)}async function le(){if(I.has(u))n=I.get(u);else{let[r,{FaceLandmarker:i}]=await Promise.all([Z(),import("@mediapipe/tasks-vision")]);if(y)return;let d=await i.createFromOptions(r,{baseOptions:{modelAssetPath:a.modelPath,delegate:"GPU"},runningMode:"VIDEO",numFaces:a.maxFaces,minFaceDetectionConfidence:a.minFaceDetectionConfidence,minFacePresenceConfidence:a.minFacePresenceConfidence,minTrackingConfidence:a.minTrackingConfidence,outputFaceBlendshapes:a.outputFaceBlendshapes,outputFacialTransformationMatrixes:a.outputFacialTransformationMatrixes});if(y){d.close();return}n={landmarker:d,mask:Fe(W),subscribers:new Map,maxFaces:a.maxFaces,state:{nCalls:0,runningMode:"VIDEO",source:null,videoTime:-1,resultTimestamp:0,result:null,pending:Promise.resolve(),nFaces:0},landmarks:{data:P,textureHeight:f}},Te(i),I.set(u,n)}n.subscribers.set($,!1)}let K=le();async function V(r){let i=performance.now();if(await K,!n)return;let d=++n.state.nCalls;n.state.pending=n.state.pending.then(async()=>{if(!n||d!==n.state.nCalls)return;let x=r instanceof HTMLVideoElement?"VIDEO":"IMAGE";n.state.runningMode!==x&&(n.state.runningMode=x,await n.landmarker.setOptions({runningMode:x}));let R=!1;if(r!==n.state.source?(n.state.source=r,n.state.videoTime=-1,R=!0):r instanceof HTMLVideoElement?r.currentTime!==n.state.videoTime&&(n.state.videoTime=r.currentTime,R=!0):r instanceof HTMLImageElement||i-n.state.resultTimestamp>2&&(R=!0),R){let p,C,Y;if(r instanceof HTMLVideoElement){if(r.videoWidth===0||r.videoHeight===0||r.readyState<2)return;C=r.videoWidth,Y=r.videoHeight,p=n.landmarker.detectForVideo(r,i)}else{if(r.width===0||r.height===0)return;C=r.width,Y=r.height,p=n.landmarker.detect(r)}if(p){n.state.resultTimestamp=i,n.state.result=p,Re(n,p.faceLandmarks),pe(n,C,Y);for(let J of n.subscribers.keys())J(),n.subscribers.set(J,!0)}}else if(n.state.result)for(let[p,C]of n.subscribers.entries())C||(p(),n.subscribers.set(p,!0))}),await n.state.pending}s.on("init",()=>{s.initializeUniform("u_maxFaces","int",a.maxFaces),s.initializeUniform("u_nFaces","int",0),s.initializeTexture("u_faceLandmarksTex",{data:P,width:h,height:f},{internalFormat:"RGBA32F",type:"FLOAT",minFilter:"NEAREST",magFilter:"NEAREST",history:t}),s.initializeTexture("u_faceMask",W,{minFilter:"NEAREST",magFilter:"NEAREST",history:t}),K.then(()=>{y||!n||E("face:ready")})});let v=0,D=[],z=()=>{t&&($(v),D.push(v),v=(v+1)%(t+1))};s.on("initializeTexture",(r,i)=>{r===e&&B(i)&&(z(),V(i))}),s.on("updateTextures",(r,i)=>{let d=r[e];B(d)&&(H=i?.skipHistoryWrite??!1,H||z(),V(d))}),s.on("destroy",()=>{y=!0,n&&(n.subscribers.delete($),n.subscribers.size===0&&(n.landmarker.close(),n.mask.gl.deleteProgram(n.mask.program),n.mask.gl.deleteBuffer(n.mask.positionBuffer),I.delete(u))),n=null});let{fn:N,historyParams:U}=ee(t),j=t?"_sampleFaceMask(pos, framesAgo)":"texture(u_faceMask, pos)",L=(r,i,d=i)=>N("vec2",`${r}At`,"vec2 pos",`vec4 mask = ${j};
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return (mask.r > ${(g[i]-te).toFixed(4)} && mask.r < ${(g[d]+te).toFixed(4)}) ? vec2(1.0, faceIndex) : vec2(0.0, -1.0);`),X=(r,i)=>N("vec2",`${r}At`,"vec2 pos",`vec4 mask = ${j};
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return mask.g > ${i.toFixed(2)} ? vec2(1.0, faceIndex) : vec2(0.0, -1.0);`),q=(r,i,d)=>N("vec2",`${r}At`,"vec2 pos",`vec2 left = ${i}(pos${U});
	return left.x > 0.0 ? left : ${d}(pos${U});`),me=r=>r.map(i=>N("float",`in${i[0].toUpperCase()+i.slice(1)}`,"vec2 pos",`vec2 a = ${i}At(pos${U}); return step(0.0, a.y) * a.x;`)).join(`
`);m(`
uniform int u_maxFaces;
uniform int u_nFaces;
uniform highp sampler2D${t?"Array":""} u_faceLandmarksTex;${t?`
uniform int u_faceLandmarksTexFrameOffset;`:""}
uniform ${t?"highp":"mediump"} sampler2D${t?"Array":""} u_faceMask;${t?`
uniform int u_faceMaskFrameOffset;`:""}

#define FACE_LANDMARK_L_EYE_CENTER ${M.LEFT_EYE_CENTER}
#define FACE_LANDMARK_R_EYE_CENTER ${M.RIGHT_EYE_CENTER}
#define FACE_LANDMARK_NOSE_TIP ${M.NOSE_TIP}
#define FACE_LANDMARK_FACE_CENTER ${M.FACE_CENTER}
#define FACE_LANDMARK_MOUTH_CENTER ${M.MOUTH_CENTER}

${N("int","nFacesAt","",t?`
	int layer = (u_faceLandmarksTexFrameOffset - framesAgo + ${t+1}) % ${t+1};
	return int(texelFetch(u_faceLandmarksTex, ivec3(0, 0, layer), 0).r + 0.5);`:`
	return int(texelFetch(u_faceLandmarksTex, ivec2(0, 0), 0).r + 0.5);`)}
${N("vec4","faceLandmark","int faceIndex, int landmarkIndex",`int i = ${k} + faceIndex * ${F} + landmarkIndex;
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
${L("lips","OUTER_MOUTH")}
${L("outerMouth","OUTER_MOUTH","INNER_MOUTH")}
${L("innerMouth","INNER_MOUTH")}
${X("faceOval",.75)}
${X("face",.25)}
${q("eye","leftEyeAt","rightEyeAt")}
${q("eyebrow","leftEyebrowAt","rightEyebrowAt")}
${me(["eyebrow","eye","outerMouth","innerMouth","lips","face"])}`)}}var Le=Ae;export{Le as default};
//# sourceMappingURL=face.mjs.map