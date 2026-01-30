import{b as B,c as Z,d as G,e as ee,f as te}from"../chunk-JRSBIGBN.mjs";var ue=`#version 300 es
in vec2 a_pos;
void main() { gl_Position = vec4(a_pos * 2.0 - 1.0, 0.0, 1.0); }`,Ee=`#version 300 es
precision mediump float;
uniform vec4 u_color;
out vec4 outColor;
void main() { outColor = u_color; }`,S=478,de=2,F=S+de,O=512,L=1,ae=[336,296,334,293,300,276,283,282,295,285],re=[362,398,384,385,386,387,388,466,263,249,390,373,374,380,381,382],ie=[70,63,105,66,107,55,65,52,53,46],se=[33,246,161,160,159,158,157,173,133,155,154,153,145,144,163,7],oe=[61,185,40,39,37,0,267,269,270,409,291,375,321,405,314,17,84,181,91,146],w=[78,191,80,81,82,13,312,311,310,415,308,324,318,402,317,14,87,178,88,95],_e=Array.from({length:S},(c,e)=>e),N={LEFT_EYEBROW:ae,LEFT_EYE:re,LEFT_EYE_CENTER:473,RIGHT_EYEBROW:ie,RIGHT_EYE:se,RIGHT_EYE_CENTER:468,NOSE_TIP:4,OUTER_MOUTH:oe,INNER_MOUTH:w,FACE_CENTER:S,MOUTH_CENTER:S+1},ce=["BACKGROUND","LEFT_EYEBROW","RIGHT_EYEBROW","LEFT_EYE","RIGHT_EYE","OUTER_MOUTH","INNER_MOUTH"],le=ce.length-1,k=Object.fromEntries(ce.map((c,e)=>[c,e/le])),ne=.5/le,Te={modelPath:"https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",maxFaces:1,minFaceDetectionConfidence:.5,minFacePresenceConfidence:.5,minTrackingConfidence:.5,outputFaceBlendshapes:!1,outputFacialTransformationMatrixes:!1};function M(c){let e=[];for(let t=1;t<c.length-1;++t)e.push(c[0],c[t],c[t+1]);return e}var _=null;function Fe(c){if(!_){let e=c.FACE_LANDMARKS_TESSELATION,t=[];for(let a=0;a<e.length-2;a+=3)t.push(e[a].start,e[a+1].start,e[a+2].start);let o=c.FACE_LANDMARKS_FACE_OVAL.map(({start:a})=>a);_=Object.fromEntries(Object.entries({LEFT_EYEBROW:M(ae),RIGHT_EYEBROW:M(ie),LEFT_EYE:M(re),RIGHT_EYE:M(se),OUTER_MOUTH:M(oe),INNER_MOUTH:M(w),TESSELATION:t,OVAL:M(o)}).map(([a,f])=>[a,{triangles:f,vertices:new Float32Array(f.length*2)}]))}}var I=new Map;function Re(c){let e=c.getContext("webgl2",{antialias:!1,preserveDrawingBuffer:!0}),t=e.createShader(e.VERTEX_SHADER);e.shaderSource(t,ue),e.compileShader(t);let o=e.createShader(e.FRAGMENT_SHADER);e.shaderSource(o,Ee),e.compileShader(o);let a=e.createProgram();e.attachShader(a,t),e.attachShader(a,o),e.linkProgram(a),e.deleteShader(t),e.deleteShader(o);let f=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,f);let T=e.getAttribLocation(a,"a_pos");e.enableVertexAttribArray(T),e.vertexAttribPointer(T,2,e.FLOAT,!1,0,0);let E=e.getUniformLocation(a,"u_color");return e.useProgram(a),e.enable(e.BLEND),e.blendEquation(e.MAX),{canvas:c,gl:e,program:a,positionBuffer:f,colorLocation:E}}function g(c,e,t,o,a,f,T){let{triangles:E,vertices:i}=t,{gl:l,colorLocation:m}=c;for(let u=0;u<E.length;++u){let x=(L+o*F+E[u])*4;i[u*2]=e[x],i[u*2+1]=e[x+1]}l.bufferData(l.ARRAY_BUFFER,i,l.DYNAMIC_DRAW),l.uniform4f(m,a,f,T,1),l.drawArrays(l.TRIANGLES,0,E.length)}function pe(c,e){let t=c.landmarks.data,o=e.length;t[0]=o;for(let a=0;a<o;++a){let f=e[a];for(let i=0;i<S;++i){let l=f[i],m=(L+a*F+i)*4;t[m]=l.x,t[m+1]=1-l.y,t[m+2]=l.z??0,t[m+3]=l.visibility??1}let T=G(t,a,_e,F,L);t.set(T,(L+a*F+N.FACE_CENTER)*4);let E=G(t,a,w,F,1);t.set(E,(L+a*F+N.MOUTH_CENTER)*4)}c.state.nFaces=o}function Ae(c,e,t){let{mask:o,maxFaces:a,landmarks:f,state:{nFaces:T}}=c,{gl:E,canvas:i}=o,{data:l}=f;if((i.width!==e||i.height!==t)&&(i.width=e,i.height=t),E.viewport(0,0,i.width,i.height),E.clearColor(0,0,0,0),E.clear(E.COLOR_BUFFER_BIT),!!_)for(let m=0;m<T;++m){let u=(m+1)/a;g(o,l,_.TESSELATION,m,0,.5,u),g(o,l,_.OVAL,m,0,1,u),g(o,l,_.LEFT_EYEBROW,m,k.LEFT_EYEBROW,0,u),g(o,l,_.RIGHT_EYEBROW,m,k.RIGHT_EYEBROW,0,u),g(o,l,_.LEFT_EYE,m,k.LEFT_EYE,0,u),g(o,l,_.RIGHT_EYE,m,k.RIGHT_EYE,0,u),g(o,l,_.OUTER_MOUTH,m,k.OUTER_MOUTH,0,u),g(o,l,_.INNER_MOUTH,m,k.INNER_MOUTH,0,u)}}function ge(c){let{textureName:e,options:{history:t,...o}={}}=c,a={...Te,...o},f=Z({...a,textureName:e}),T=a.maxFaces*F+L,E=Math.ceil(T/O);return function(i,l){let{injectGLSL:m,emitHook:u}=l,x=I.get(f),P=x?.landmarks.data??new Float32Array(O*E*4),W=x?.mask.canvas??new OffscreenCanvas(1,1),n=null,v=!1,H=!1;function $(r){if(!n)return;let s=n.state.nFaces,d=s*F+L,R=Math.ceil(d/O),p=r;typeof p>"u"&&D.length>0&&(p=D,D=[]),i.updateTextures({u_faceLandmarksTex:{data:n.landmarks.data,width:O,height:R,isPartial:!0},u_faceMask:n.mask.canvas},t?{skipHistoryWrite:H,historyWriteIndex:p}:void 0),i.updateUniforms({u_nFaces:s}),u("face:result",n.state.result)}async function me(){if(I.has(f))n=I.get(f);else{let[r,{FaceLandmarker:s}]=await Promise.all([ee(),import("@mediapipe/tasks-vision")]);if(v)return;let d=new OffscreenCanvas(1,1),R=await s.createFromOptions(r,{baseOptions:{modelAssetPath:a.modelPath,delegate:"GPU"},canvas:d,runningMode:"VIDEO",numFaces:a.maxFaces,minFaceDetectionConfidence:a.minFaceDetectionConfidence,minFacePresenceConfidence:a.minFacePresenceConfidence,minTrackingConfidence:a.minTrackingConfidence,outputFaceBlendshapes:a.outputFaceBlendshapes,outputFacialTransformationMatrixes:a.outputFacialTransformationMatrixes});if(v){R.close();return}n={landmarker:R,mediapipeCanvas:d,mask:Re(W),subscribers:new Map,maxFaces:a.maxFaces,state:{runningMode:"VIDEO",source:null,videoTime:-1,resultTimestamp:0,result:null,pending:Promise.resolve(),nFaces:0},landmarks:{data:P,textureHeight:E}},Fe(s),I.set(f,n)}n.subscribers.set($,!1)}let K=me(),V=0;async function z(r){let s=performance.now(),d=++V;await K,n&&(n.state.pending=n.state.pending.then(async()=>{if(d!==V||!n)return;let R=r instanceof HTMLVideoElement?"VIDEO":"IMAGE";n.state.runningMode!==R&&(n.state.runningMode=R,await n.landmarker.setOptions({runningMode:R}));let p=!1;if(r!==n.state.source?(n.state.source=r,n.state.videoTime=-1,p=!0):r instanceof HTMLVideoElement?r.currentTime!==n.state.videoTime&&(n.state.videoTime=r.currentTime,p=!0):r instanceof HTMLImageElement||s-n.state.resultTimestamp>2&&(p=!0),p){let A,C,Y;if(r instanceof HTMLVideoElement){if(r.videoWidth===0||r.videoHeight===0||r.readyState<2)return;C=r.videoWidth,Y=r.videoHeight,A=n.landmarker.detectForVideo(r,s)}else{if(r.width===0||r.height===0)return;C=r.width,Y=r.height,A=n.landmarker.detect(r)}if(A){n.state.resultTimestamp=s,n.state.result=A,pe(n,A.faceLandmarks),Ae(n,C,Y);for(let Q of n.subscribers.keys())Q(),n.subscribers.set(Q,!0)}}else if(n.state.result)for(let[A,C]of n.subscribers.entries())C||(A(),n.subscribers.set(A,!0))}),await n.state.pending)}i.on("init",()=>{i.initializeUniform("u_maxFaces","int",a.maxFaces),i.initializeUniform("u_nFaces","int",0),i.initializeTexture("u_faceLandmarksTex",{data:P,width:O,height:E},{internalFormat:"RGBA32F",type:"FLOAT",minFilter:"NEAREST",magFilter:"NEAREST",history:t}),i.initializeTexture("u_faceMask",W,{minFilter:"NEAREST",magFilter:"NEAREST",history:t}),K.then(()=>{v||!n||u("face:ready")})});let y=0,D=[],j=()=>{t&&($(y),D.push(y),y=(y+1)%(t+1))};i.on("initializeTexture",(r,s)=>{r===e&&B(s)&&(j(),z(s))}),i.on("updateTextures",(r,s)=>{let d=r[e];B(d)&&(H=s?.skipHistoryWrite??!1,H||j(),z(d))}),i.on("destroy",()=>{v=!0,n&&(n.subscribers.delete($),n.subscribers.size===0&&(n.landmarker.close(),n.mask.gl.deleteProgram(n.mask.program),n.mask.gl.deleteBuffer(n.mask.positionBuffer),I.delete(f))),n=null});let{fn:b,historyParams:U}=te(t),X=t?"_sampleFaceMask(pos, framesAgo)":"texture(u_faceMask, pos)",h=(r,s,d=s)=>b("vec2",`${r}At`,"vec2 pos",`vec4 mask = ${X};
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return (mask.r > ${(k[s]-ne).toFixed(4)} && mask.r < ${(k[d]+ne).toFixed(4)}) ? vec2(1.0, faceIndex) : vec2(0.0, -1.0);`),q=(r,s)=>b("vec2",`${r}At`,"vec2 pos",`vec4 mask = ${X};
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return mask.g > ${s.toFixed(2)} ? vec2(1.0, faceIndex) : vec2(0.0, -1.0);`),J=(r,s,d)=>b("vec2",`${r}At`,"vec2 pos",`vec2 left = ${s}(pos${U});
	return left.x > 0.0 ? left : ${d}(pos${U});`),fe=r=>r.map(s=>b("float",`in${s[0].toUpperCase()+s.slice(1)}`,"vec2 pos",`vec2 a = ${s}At(pos${U}); return step(0.0, a.y) * a.x;`)).join(`
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
${b("vec4","faceLandmark","int faceIndex, int landmarkIndex",`int i = ${L} + faceIndex * ${F} + landmarkIndex;
	int x = i % ${O};
	int y = i / ${O};${t?`
	int layer = (u_faceLandmarksTexFrameOffset - framesAgo + ${t+1}) % ${t+1};
	return texelFetch(u_faceLandmarksTex, ivec3(x, y, layer), 0);`:`
	return texelFetch(u_faceLandmarksTex, ivec2(x, y), 0);`}`)}
${t?`
vec4 _sampleFaceMask(vec2 pos, int framesAgo) {
	int layer = (u_faceMaskFrameOffset - framesAgo + ${t+1}) % ${t+1};
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
${q("faceOval",.75)}
${q("face",.25)}
${J("eye","leftEyeAt","rightEyeAt")}
${J("eyebrow","leftEyebrowAt","rightEyebrowAt")}
${fe(["eyebrow","eye","outerMouth","innerMouth","lips","face"])}`)}}var he=ge;export{he as default};
//# sourceMappingURL=face.mjs.map