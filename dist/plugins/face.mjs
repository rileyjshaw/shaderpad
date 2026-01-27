import{b as H,c as X,d as $,e as q,f as J}from"../chunk-JRSBIGBN.mjs";var ie=`#version 300 es
in vec2 a_pos;
void main() { gl_Position = vec4(a_pos * 2.0 - 1.0, 0.0, 1.0); }`,ce=`#version 300 es
precision mediump float;
uniform vec4 u_color;
out vec4 outColor;
void main() { outColor = u_color; }`,C=478,le=2,A=C+le,O=512,k=1,Z=[336,296,334,293,300,276,283,282,295,285],ee=[362,398,384,385,386,387,388,466,263,249,390,373,374,380,381,382],te=[70,63,105,66,107,55,65,52,53,46],ae=[33,246,161,160,159,158,157,173,133,155,154,153,145,144,163,7],ne=[61,185,40,39,37,0,267,269,270,409,291,375,321,405,314,17,84,181,91,146],U=[78,191,80,81,82,13,312,311,310,415,308,324,318,402,317,14,87,178,88,95],me=Array.from({length:C},(i,e)=>e),v={LEFT_EYEBROW:Z,LEFT_EYE:ee,LEFT_EYE_CENTER:473,RIGHT_EYEBROW:te,RIGHT_EYE:ae,RIGHT_EYE_CENTER:468,NOSE_TIP:4,OUTER_MOUTH:ne,INNER_MOUTH:U,FACE_CENTER:C,MOUTH_CENTER:C+1},re=["BACKGROUND","LEFT_EYEBROW","RIGHT_EYEBROW","LEFT_EYE","RIGHT_EYE","OUTER_MOUTH","INNER_MOUTH"],se=re.length-1,g=Object.fromEntries(re.map((i,e)=>[i,e/se])),Q=.5/se,Ee={modelPath:"https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",maxFaces:1,minFaceDetectionConfidence:.5,minFacePresenceConfidence:.5,minTrackingConfidence:.5,outputFaceBlendshapes:!1,outputFacialTransformationMatrixes:!1};function M(i){let e=[];for(let t=1;t<i.length-1;++t)e.push(i[0],i[t],i[t+1]);return e}var _=null;function fe(i){if(!_){let e=i.FACE_LANDMARKS_TESSELATION,t=[];for(let n=0;n<e.length-2;n+=3)t.push(e[n].start,e[n+1].start,e[n+2].start);let o=i.FACE_LANDMARKS_FACE_OVAL.map(({start:n})=>n);_=Object.fromEntries(Object.entries({LEFT_EYEBROW:M(Z),RIGHT_EYEBROW:M(te),LEFT_EYE:M(ee),RIGHT_EYE:M(ae),OUTER_MOUTH:M(ne),INNER_MOUTH:M(U),TESSELATION:t,OVAL:M(o)}).map(([n,E])=>[n,{triangles:E,vertices:new Float32Array(E.length*2)}]))}}var b=new Map;function ue(i){let e=i.getContext("webgl2",{antialias:!1,preserveDrawingBuffer:!0}),t=e.createShader(e.VERTEX_SHADER);e.shaderSource(t,ie),e.compileShader(t);let o=e.createShader(e.FRAGMENT_SHADER);e.shaderSource(o,ce),e.compileShader(o);let n=e.createProgram();e.attachShader(n,t),e.attachShader(n,o),e.linkProgram(n),e.deleteShader(t),e.deleteShader(o);let E=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,E);let T=e.getAttribLocation(n,"a_pos");e.enableVertexAttribArray(T),e.vertexAttribPointer(T,2,e.FLOAT,!1,0,0);let d=e.getUniformLocation(n,"u_color");return e.useProgram(n),e.enable(e.BLEND),e.blendEquation(e.MAX),{canvas:i,gl:e,program:n,positionBuffer:E,colorLocation:d}}function R(i,e,t,o,n,E,T){let{triangles:d,vertices:s}=t,{gl:c,colorLocation:l}=i;for(let f=0;f<d.length;++f){let N=(k+o*A+d[f])*4;s[f*2]=e[N],s[f*2+1]=e[N+1]}c.bufferData(c.ARRAY_BUFFER,s,c.DYNAMIC_DRAW),c.uniform4f(l,n,E,T,1),c.drawArrays(c.TRIANGLES,0,d.length)}function de(i,e){let t=i.landmarks.data,o=e.length;t[0]=o;for(let n=0;n<o;++n){let E=e[n];for(let s=0;s<C;++s){let c=E[s],l=(k+n*A+s)*4;t[l]=c.x,t[l+1]=1-c.y,t[l+2]=c.z??0,t[l+3]=c.visibility??1}let T=$(t,n,me,A,k);t.set(T,(k+n*A+v.FACE_CENTER)*4);let d=$(t,n,U,A,1);t.set(d,(k+n*A+v.MOUTH_CENTER)*4)}i.state.nFaces=o}function _e(i,e,t){if(!_)return;let{mask:o,maxFaces:n,landmarks:E,state:{nFaces:T}}=i,{gl:d,canvas:s}=o,{data:c}=E;(s.width!==e||s.height!==t)&&(s.width=e,s.height=t),d.viewport(0,0,s.width,s.height),d.clearColor(0,0,0,0),d.clear(d.COLOR_BUFFER_BIT);for(let l=0;l<T;++l){let f=(l+1)/n;R(o,c,_.TESSELATION,l,0,.5,f),R(o,c,_.OVAL,l,0,1,f),R(o,c,_.LEFT_EYEBROW,l,g.LEFT_EYEBROW,0,f),R(o,c,_.RIGHT_EYEBROW,l,g.RIGHT_EYEBROW,0,f),R(o,c,_.LEFT_EYE,l,g.LEFT_EYE,0,f),R(o,c,_.RIGHT_EYE,l,g.RIGHT_EYE,0,f),R(o,c,_.OUTER_MOUTH,l,g.OUTER_MOUTH,0,f),R(o,c,_.INNER_MOUTH,l,g.INNER_MOUTH,0,f)}}function Te(i){let{textureName:e,options:{history:t,...o}={}}=i,n={...Ee,...o},E=X({...n,textureName:e}),T=n.maxFaces*A+k,d=Math.ceil(T/O);return function(s,c){let{injectGLSL:l,emitHook:f}=c,N=b.get(E),Y=N?.landmarks.data??new Float32Array(O*d*4),B=N?.mask.canvas??new OffscreenCanvas(1,1),a=null,G=!1;function h(){if(!a)return;let r=a.state.nFaces,u=r*A+k,p=Math.ceil(u/O);s.updateTextures({u_faceLandmarksTex:{data:a.landmarks.data,width:O,height:p,isPartial:!0},u_faceMask:a.mask.canvas},{skipHistoryWrite:G}),s.updateUniforms({u_nFaces:r}),f("face:result",a.state.result)}async function oe(){if(b.has(E))a=b.get(E);else{let[r,{FaceLandmarker:u}]=await Promise.all([q(),import("@mediapipe/tasks-vision")]),p=new OffscreenCanvas(1,1);a={landmarker:await u.createFromOptions(r,{baseOptions:{modelAssetPath:n.modelPath,delegate:"GPU"},canvas:p,runningMode:"VIDEO",numFaces:n.maxFaces,minFaceDetectionConfidence:n.minFaceDetectionConfidence,minFacePresenceConfidence:n.minFacePresenceConfidence,minTrackingConfidence:n.minTrackingConfidence,outputFaceBlendshapes:n.outputFaceBlendshapes,outputFacialTransformationMatrixes:n.outputFacialTransformationMatrixes}),mediapipeCanvas:p,mask:ue(B),subscribers:new Map,maxFaces:n.maxFaces,state:{runningMode:"VIDEO",source:null,videoTime:-1,resultTimestamp:0,result:null,pending:Promise.resolve(),nFaces:0},landmarks:{data:Y,textureHeight:d}},fe(u),b.set(E,a)}a.subscribers.set(h,!1)}let w=oe(),P=0;async function W(r){let u=performance.now(),p=++P;await w,a&&(a.state.pending=a.state.pending.then(async()=>{if(p!==P||!a)return;let I=r instanceof HTMLVideoElement?"VIDEO":"IMAGE";a.state.runningMode!==I&&(a.state.runningMode=I,await a.landmarker.setOptions({runningMode:I}));let S=!1;if(r!==a.state.source?(a.state.source=r,a.state.videoTime=-1,S=!0):r instanceof HTMLVideoElement?r.currentTime!==a.state.videoTime&&(a.state.videoTime=r.currentTime,S=!0):r instanceof HTMLImageElement||u-a.state.resultTimestamp>2&&(S=!0),S){let x,D,y;if(r instanceof HTMLVideoElement){if(r.videoWidth===0||r.videoHeight===0||r.readyState<2)return;D=r.videoWidth,y=r.videoHeight,x=a.landmarker.detectForVideo(r,u)}else{if(r.width===0||r.height===0)return;D=r.width,y=r.height,x=a.landmarker.detect(r)}if(x){a.state.resultTimestamp=u,a.state.result=x,de(a,x.faceLandmarks),_e(a,D,y);for(let j of a.subscribers.keys())j(),a.subscribers.set(j,!0)}}else a.state.result&&!a.subscribers.get(h)&&(h(),a.subscribers.set(h,!0))}),await a.state.pending)}s.on("init",()=>{s.initializeUniform("u_maxFaces","int",n.maxFaces),s.initializeUniform("u_nFaces","int",0),s.initializeTexture("u_faceLandmarksTex",{data:Y,width:O,height:d},{internalFormat:"RGBA32F",type:"FLOAT",minFilter:"NEAREST",magFilter:"NEAREST",history:t}),s.initializeTexture("u_faceMask",B,{minFilter:"NEAREST",magFilter:"NEAREST",history:t}),w.then(()=>f("face:ready"))}),s.on("initializeTexture",(r,u)=>{r===e&&H(u)&&W(u)}),s.on("updateTextures",(r,u)=>{let p=r[e];H(p)&&(G=u?.skipHistoryWrite??!1,W(p))}),s.on("destroy",()=>{a&&(a.subscribers.delete(h),a.subscribers.size===0&&(a.landmarker.close(),a.mask.gl.deleteProgram(a.mask.program),a.mask.gl.deleteBuffer(a.mask.positionBuffer),b.delete(E))),a=null});let{fn:m,historyParams:F}=J(t),K=t?"_sampleFaceMask(pos, framesAgo)":"texture(u_faceMask, pos)",L=(r,u=r)=>`vec4 mask = ${K};
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return (mask.r > ${(g[r]-Q).toFixed(4)} && mask.r < ${(g[u]+Q).toFixed(4)}) ? vec2(1.0, faceIndex) : vec2(0.0, -1.0);`,V=r=>`vec4 mask = ${K};
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return mask.g > ${r.toFixed(2)} ? vec2(1.0, faceIndex) : vec2(0.0, -1.0);`,z=(r,u)=>`vec2 left = ${r}(pos${F});
	return left.x > 0.0 ? left : ${u}(pos${F});`;l(`
uniform int u_maxFaces;
uniform int u_nFaces;
uniform highp sampler2D${t?"Array":""} u_faceLandmarksTex;${t?`
uniform int u_faceLandmarksTexFrameOffset;`:""}
uniform sampler2D${t?"Array":""} u_faceMask;${t?`
uniform int u_faceMaskFrameOffset;`:""}

#define FACE_LANDMARK_L_EYE_CENTER ${v.LEFT_EYE_CENTER}
#define FACE_LANDMARK_R_EYE_CENTER ${v.RIGHT_EYE_CENTER}
#define FACE_LANDMARK_NOSE_TIP ${v.NOSE_TIP}
#define FACE_LANDMARK_FACE_CENTER ${v.FACE_CENTER}
#define FACE_LANDMARK_MOUTH_CENTER ${v.MOUTH_CENTER}

${m("int","nFacesAt","",t?`
	int layer = (u_faceLandmarksTexFrameOffset - framesAgo + ${t}) % ${t};
	return int(texelFetch(u_faceLandmarksTex, ivec3(0, 0, layer), 0).r + 0.5);`:`
	return int(texelFetch(u_faceLandmarksTex, ivec2(0, 0), 0).r + 0.5);`)}
${m("vec4","faceLandmark","int faceIndex, int landmarkIndex",`int i = ${k} + faceIndex * ${A} + landmarkIndex;
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
${m("vec2","leftEyebrowAt","vec2 pos",L("LEFT_EYEBROW"))}
${m("vec2","rightEyebrowAt","vec2 pos",L("RIGHT_EYEBROW"))}
${m("vec2","leftEyeAt","vec2 pos",L("LEFT_EYE"))}
${m("vec2","rightEyeAt","vec2 pos",L("RIGHT_EYE"))}
${m("vec2","lipsAt","vec2 pos",L("OUTER_MOUTH"))}
${m("vec2","outerMouthAt","vec2 pos",L("OUTER_MOUTH","INNER_MOUTH"))}
${m("vec2","innerMouthAt","vec2 pos",L("INNER_MOUTH"))}
${m("vec2","faceOvalAt","vec2 pos",V(.75))}
${m("vec2","faceAt","vec2 pos",V(.25))}
${m("vec2","eyeAt","vec2 pos",z("leftEyeAt","rightEyeAt"))}
${m("vec2","eyebrowAt","vec2 pos",z("leftEyebrowAt","rightEyebrowAt"))}
${m("float","inEyebrow","vec2 pos",`return eyebrowAt(pos${F}).x;`)}
${m("float","inEye","vec2 pos",`return eyeAt(pos${F}).x;`)}
${m("float","inOuterMouth","vec2 pos",`return outerMouthAt(pos${F}).x;`)}
${m("float","inInnerMouth","vec2 pos",`return innerMouthAt(pos${F}).x;`)}
${m("float","inLips","vec2 pos",`return lipsAt(pos${F}).x;`)}
${m("float","inFace","vec2 pos",`return faceAt(pos${F}).x;`)}`)}}var Fe=Te;export{Fe as default};
//# sourceMappingURL=face.mjs.map