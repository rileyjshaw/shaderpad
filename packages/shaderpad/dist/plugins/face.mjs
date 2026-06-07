import{a as J}from"../chunk-QROQ7JVO.mjs";import{b as ne,c as Ee,d as me,e as re,f as de,g as _e,h as Ae}from"../chunk-BUZPU5IY.mjs";var Te=`#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
	v_uv = a_pos;
	gl_Position = vec4(a_pos * 2.0 - 1.0, 0.0, 1.0);
}`,pe=`#version 300 es
precision mediump float;
uniform vec4 u_color;
out vec4 outColor;
void main() { outColor = u_color; }`,Me=`#version 300 es
precision mediump float;
in vec2 v_uv;
uniform sampler2D u_texture;
out vec4 outColor;
void main() { outColor = texture(u_texture, v_uv); }`,xe=new Float32Array([0,0,1,0,0,1,0,1,1,0,1,1]),X=478,Se=2,M=X+Se,P=512,B=1,Ce=Array.from({length:X},(t,e)=>e),Re=473,ge=468,Ne=4,he=X,se=X+1,ie=null,De=["OVAL","LEFT_EYEBROW","RIGHT_EYEBROW","LEFT_EYE","RIGHT_EYE","MOUTH","INNER_MOUTH"],Y=["FACE_0","FACE_1","FACE_2","FACE_3","FACE_4","FACE_5","FACE_6","FACE_7"],ce=["FACE_8","FACE_9","FACE_10","FACE_11","FACE_12","FACE_13","FACE_14","FACE_15"],W=255,oe=Y.length+ce.length;function ue(t){return Object.fromEntries(t.map((e,a)=>[e,1<<a]))}function le(t){return Object.fromEntries(Object.entries(t).map(([e,a])=>[e,a/W]))}var Le=ue(De),Oe=ue(Y),ke=ue(ce),w=le(Le),ve=le(Oe),Ie=le(ke),Be={modelPath:"https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",maxFaces:1,minFaceDetectionConfidence:.5,minFacePresenceConfidence:.5,minTrackingConfidence:.5,outputFaceBlendshapes:!1,outputFacialTransformationMatrixes:!1};function ye(t){let e=[];for(let a=1;a<t.length-1;++a)e.push(t[0],t[a],t[a+1]);return e}function R(t){let e=new Array(t.length+1);e[0]=t[0].start;for(let a=0;a<t.length;++a)e[a+1]=t[a].end;return e}function G(t,e){let a=[],n=Math.min(t.length,e.length);for(let i=0;i<n-1;++i)a.push(t[i],e[i],e[i+1],t[i],e[i+1],t[i+1]);return a}var b=null;function Ue(t){if(!b){let e=t.FACE_LANDMARKS_TESSELATION,a=t.FACE_LANDMARKS_LEFT_EYEBROW,n=R(a.slice(0,4)),i=R(a.slice(4,8)),c=t.FACE_LANDMARKS_RIGHT_EYEBROW,E=R(c.slice(0,4)),o=R(c.slice(4,8)),m=t.FACE_LANDMARKS_LEFT_EYE,u=R(m.slice(0,8)),d=R(m.slice(8,16)),f=t.FACE_LANDMARKS_RIGHT_EYE,T=R(f.slice(0,8)),x=R(f.slice(8,16)),g=t.FACE_LANDMARKS_LIPS,D=R(g.slice(0,10)),p=R(g.slice(10,20)),S=R(g.slice(20,30)),r=R(g.slice(30,40)),A=[...u,...d.slice(1,-1)],O=[...T,...x.slice(1,-1)];ie=[...S,...r.slice(1,-1)];let C=new Int16Array(M).fill(-1);for(let _ of A)C[_]=Re;for(let _ of O)C[_]=ge;for(let _ of ie)C[_]=se;let y=_=>{let L=C[_];return L>=0?L:_},$=[];for(let _=0;_<e.length-2;_+=3){let L=y(e[_].start),H=y(e[_+1].start),h=y(e[_+2].start);L!==H&&L!==h&&H!==h&&$.push(L,H,h)}let z=G(n,i),Q=G(E,o),q=G(u,d),Z=G(T,x),j=[...G(D,S),...G(p,r)],k=G(S,r),V=R(t.FACE_LANDMARKS_FACE_OVAL).slice(0,-1);b=Object.fromEntries(Object.entries({LEFT_EYEBROW:z,RIGHT_EYEBROW:Q,LEFT_EYE:q,RIGHT_EYE:Z,MOUTH:j,INNER_MOUTH:k,TESSELATION:$,OVAL:ye(V)}).map(([_,L])=>[_,{indices:L,vertices:new Float32Array(L.length*2)}]))}}var ae=new Map,Pe=new Map;function Fe(t,e,a,n){let i=null,c=null,E=null;try{if(i=t.createShader(t.VERTEX_SHADER),c=t.createShader(t.FRAGMENT_SHADER),E=t.createProgram(),!i||!c||!E)throw new Error;if(t.shaderSource(i,e),t.compileShader(i),!t.getShaderParameter(i,t.COMPILE_STATUS))throw new Error;if(t.shaderSource(c,a),t.compileShader(c),!t.getShaderParameter(c,t.COMPILE_STATUS))throw new Error;if(t.attachShader(E,i),t.attachShader(E,c),t.linkProgram(E),!t.getProgramParameter(E,t.LINK_STATUS))throw new Error;return E}catch{throw E&&t.deleteProgram(E),J(61,!1)}finally{i&&t.deleteShader(i),c&&t.deleteShader(c)}}function we(t){let e=t.getContext("webgl2",{antialias:!1,preserveDrawingBuffer:!0});if(!e)throw J(60,!1);let a=Fe(e,Te,pe,"face-mask-region"),n=Fe(e,Te,Me,"face-mask-blit"),i;try{let c=e.createBuffer(),E=e.getAttribLocation(a,"a_pos"),o=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,o),e.bufferData(e.ARRAY_BUFFER,xe,e.STATIC_DRAW);let m=e.getAttribLocation(n,"a_pos"),u=e.getUniformLocation(a,"u_color"),d=e.getUniformLocation(n,"u_texture"),f=e.createTexture();e.bindTexture(e.TEXTURE_2D,f),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,null);let T=e.createFramebuffer();if(e.bindFramebuffer(e.FRAMEBUFFER,T),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,f,0),i=e.checkFramebufferStatus(e.FRAMEBUFFER),e.bindFramebuffer(e.FRAMEBUFFER,null),!c||E<0||!o||m<0||!u||!d||!f||!T||i!==e.FRAMEBUFFER_COMPLETE)throw new Error;return e.useProgram(n),e.uniform1i(d,0),e.colorMask(!0,!0,!0,!1),{canvas:t,gl:e,regionProgram:a,blitProgram:n,regionPositionBuffer:c,quadBuffer:o,regionPositionLocation:E,blitPositionLocation:m,colorLocation:u,textureLocation:d,scratchTexture:f,scratchFramebuffer:T}}catch{throw J(62,!1)}}function Ge(t,e,a){let{gl:n,canvas:i,scratchTexture:c}=t;i.width===e&&i.height===a||(i.width=e,i.height=a,n.bindTexture(n.TEXTURE_2D,c),n.texImage2D(n.TEXTURE_2D,0,n.RGBA,e,a,0,n.RGBA,n.UNSIGNED_BYTE,null))}function v(t,e,a,n,i,c,E){let{gl:o,regionProgram:m,regionPositionBuffer:u,regionPositionLocation:d,colorLocation:f,scratchFramebuffer:T}=t,x=B+n*M,{indices:g,vertices:D}=a;o.bindFramebuffer(o.FRAMEBUFFER,T),o.viewport(0,0,t.canvas.width,t.canvas.height),o.clearColor(0,0,0,0),o.clear(o.COLOR_BUFFER_BIT),o.useProgram(m),o.bindBuffer(o.ARRAY_BUFFER,u),o.enableVertexAttribArray(d),o.vertexAttribPointer(d,2,o.FLOAT,!1,0,0),o.enable(o.BLEND),o.blendEquation(o.MAX),o.blendFunc(o.ONE,o.ONE);for(let p=0;p<g.length;++p){let S=(x+g[p])*4;D[p*2]=e[S],D[p*2+1]=e[S+1]}o.bufferData(o.ARRAY_BUFFER,D,o.DYNAMIC_DRAW),o.uniform4f(f,i,c,E,1),o.drawArrays(o.TRIANGLES,0,g.length)}function I(t){let{gl:e,blitProgram:a,quadBuffer:n,blitPositionLocation:i,scratchTexture:c}=t;e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,t.canvas.width,t.canvas.height),e.useProgram(a),e.bindBuffer(e.ARRAY_BUFFER,n),e.enableVertexAttribArray(i),e.vertexAttribPointer(i,2,e.FLOAT,!1,0,0),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,c),e.enable(e.BLEND),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ONE),e.drawArrays(e.TRIANGLES,0,6)}function $e(t,e){let a=t.landmarks.data,n=e.length;a[0]=n;for(let i=0;i<n;++i){let c=e[i];for(let m=0;m<X;++m){let u=c[m],d=(B+i*M+m)*4;a[d]=u.x,a[d+1]=1-u.y,a[d+2]=u.z??0,a[d+3]=u.visibility??1}let E=re(a,i,Ce,M,B);a.set(E,(B+i*M+he)*4);let o=re(a,i,ie,M,1);a.set(o,(B+i*M+se)*4)}t.state.nFaces=n}function He(t,e,a){let{mask:n,maxFaces:i,landmarks:c,state:{nFaces:E}}=t,{gl:o,canvas:m}=n,{data:u}=c;if(Ge(n,e,a),o.bindFramebuffer(o.FRAMEBUFFER,null),o.viewport(0,0,m.width,m.height),o.clearColor(0,0,0,0),o.clear(o.COLOR_BUFFER_BIT),!b)return;let d=i<=oe;for(let f=0;f<E;++f){let T=d&&f<Y.length?ve[Y[f]]:0,x=d?f<Y.length?0:Ie[ce[f-Y.length]]:(f+1)/W;v(n,u,b.TESSELATION,f,0,T,x),I(n),v(n,u,b.OVAL,f,w.OVAL,0,0),I(n),v(n,u,b.LEFT_EYEBROW,f,w.LEFT_EYEBROW,0,0),I(n),v(n,u,b.RIGHT_EYEBROW,f,w.RIGHT_EYEBROW,0,0),I(n),v(n,u,b.LEFT_EYE,f,w.LEFT_EYE,0,0),I(n),v(n,u,b.RIGHT_EYE,f,w.RIGHT_EYE,0,0),I(n),v(n,u,b.MOUTH,f,w.MOUTH,0,0),I(n),v(n,u,b.INNER_MOUTH,f,w.INNER_MOUTH,0,0),I(n)}}function Ye(t){let{textureName:e,wasmBaseUrl:a=de,options:{history:n,...i}={}}=t,c={...Be,...i},E=Ee({...c,textureName:e,wasmBaseUrl:a}),o=c.maxFaces*M+B,m=Math.ceil(o/P);return function(u,d){let{injectGLSL:f,emit:T,updateTexture:x}=d,g=ae.get(E),D=g?.landmarks.data??new Float32Array(P*m*4),p=g?.mediapipeCanvas??new OffscreenCanvas(1,1),S=g?.mask.canvas??new OffscreenCanvas(1,1),r,A=!1,O=-1,C=[];function y(s){if(A||!r)return;let l=r.state.nFaces,F=l*M+B,N=Math.ceil(F/P),U=n?s:void 0;x("u_faceLandmarksTex",{data:r.landmarks.data,width:P,height:N,isPartial:!0},U),x("u_faceMask",r.mask.canvas,U),u.updateUniforms({u_nFaces:l},{allowMissing:!0})}function $(){A||!r||(n?(y(C.length>0?C:O),C=[]):y(O),T("face:result",r.state.result))}function z(){if(A||!r)return;let s=r.subscribers;for(let[l,F]of s)if(F){if(l(),A)return;s.has(l)&&s.set(l,!1)}}async function Q(){r=await me(E,ae,Pe,async()=>{let[s,{FaceLandmarker:l}]=await Promise.all([_e(a),import("@mediapipe/tasks-vision")]);if(A)return;let F=await l.createFromOptions(s,{baseOptions:{modelAssetPath:c.modelPath,delegate:"GPU"},canvas:p,runningMode:"VIDEO",numFaces:c.maxFaces,minFaceDetectionConfidence:c.minFaceDetectionConfidence,minFacePresenceConfidence:c.minFacePresenceConfidence,minTrackingConfidence:c.minTrackingConfidence,outputFaceBlendshapes:c.outputFaceBlendshapes,outputFacialTransformationMatrixes:c.outputFacialTransformationMatrixes});if(A){F.close();return}let N={landmarker:F,mediapipeCanvas:p,mask:we(S),subscribers:new Map,maxFaces:c.maxFaces,state:{nCalls:0,runningMode:"VIDEO",source:null,videoTime:-1,resultTimestamp:0,result:null,pending:Promise.resolve(),nFaces:0},landmarks:{data:D,textureHeight:m}};return Ue(l),N}),!(!r||A)&&r.subscribers.set($,!1)}let q=Q();async function Z(s){let l=performance.now();if(await q,A||!r)return;let F=++r.state.nCalls;r.state.pending=r.state.pending.then(async()=>{if(A||!r||F!==r.state.nCalls)return;let N=s instanceof HTMLVideoElement?"VIDEO":"IMAGE";if(r.state.runningMode!==N&&(r.state.runningMode=N,await r.landmarker.setOptions({runningMode:N}),A||!r||F!==r.state.nCalls))return;let U=!1;if(s!==r.state.source?(r.state.source=s,r.state.videoTime=s instanceof HTMLVideoElement?s.currentTime:-1,U=!0):s instanceof HTMLVideoElement?s.currentTime!==r.state.videoTime&&(r.state.videoTime=s.currentTime,U=!0):s instanceof HTMLImageElement||l-r.state.resultTimestamp>2&&(U=!0),U){let K,ee,te;if(s instanceof HTMLVideoElement){if(s.videoWidth===0||s.videoHeight===0||s.readyState<2)return;ee=s.videoWidth,te=s.videoHeight,K=r.landmarker.detectForVideo(s,l)}else{if(s.width===0||s.height===0)return;ee=s.width,te=s.height,K=r.landmarker.detect(s)}K&&(r.state.resultTimestamp=l,r.state.result=K,$e(r,K.faceLandmarks),He(r,ee,te),z())}else r.state.result&&z()}),await r.state.pending}u.on("_init",()=>{u.initializeUniform("u_maxFaces","int",c.maxFaces,{allowMissing:!0}),u.initializeUniform("u_nFaces","int",0,{allowMissing:!0}),u.initializeTexture("u_faceLandmarksTex",{data:D,width:P,height:m},{internalFormat:"RGBA32F",type:"FLOAT",minFilter:"NEAREST",magFilter:"NEAREST",history:n}),u.initializeTexture("u_faceMask",S,{minFilter:"NEAREST",magFilter:"NEAREST",history:n}),q.then(()=>{A||!r||T("face:ready")})});function j(s){A||!r||(n&&(O=(O+1)%(n+1),y(O),C.push(O)),r.subscribers.set($,!0),Z(s))}u.on("initializeTexture",(s,l)=>{s===e&&ne(l)&&j(l)}),u.on("updateTextures",s=>{let l=s[e];ne(l)&&j(l)}),u.on("destroy",()=>{A=!0,r&&(r.subscribers.delete($),r.subscribers.size===0&&(r.landmarker.close(),r.mask.gl.deleteProgram(r.mask.regionProgram),r.mask.gl.deleteProgram(r.mask.blitProgram),r.mask.gl.deleteBuffer(r.mask.regionPositionBuffer),r.mask.gl.deleteBuffer(r.mask.quadBuffer),r.mask.gl.deleteTexture(r.mask.scratchTexture),r.mask.gl.deleteFramebuffer(r.mask.scratchFramebuffer),ae.delete(E))),r=void 0});let{fn:k,historyParams:V}=Ae(n),_=n?"_sampleFaceMask(pos, framesAgo)":"texture(u_faceMask, pos)",L=Array.from({length:oe-1},(s,l)=>`step(${2**(l+1)}.0, faceBitF)`).join(" + "),H=c.maxFaces<=oe?`uint faceBits = (uint(mask.b * ${W}.0 + 0.5) << 8) | uint(mask.g * ${W}.0 + 0.5);
	uint faceBit = faceBits & (~faceBits + 1u);
	float faceBitF = float(faceBit);
	float hasFace = sign(faceBitF);
	float faceIndex = ${L} - (1.0 - hasFace);`:`float faceIndex = float(int(uint(mask.b * ${W}.0 + 0.5)) - 1);`,h=(s,...l)=>k("vec2",`${s}At`,"vec2 pos",`vec4 mask = ${_};
	${H}
	uint bits = uint(mask.r * ${W}.0 + 0.5);
	float hit = sign(float(bits & ${l.reduce((F,N)=>F|Le[N],0)}u));
	return vec2(hit, mix(-1.0, faceIndex, hit));`),fe=(s,l,F)=>k("vec2",`${s}At`,"vec2 pos",`vec2 left = ${l}(pos${V});
	vec2 right = ${F}(pos${V});
	return mix(right, left, left.x);`),be=s=>s.map(l=>k("float",`in${l[0].toUpperCase()+l.slice(1)}`,"vec2 pos",`vec2 a = ${l}At(pos${V}); return step(0.0, a.y) * a.x;`)).join(`
`);f(`
uniform int u_maxFaces;
uniform int u_nFaces;
uniform highp sampler2D${n?"Array":""} u_faceLandmarksTex;${n?`
uniform int u_faceLandmarksTexFrameOffset;`:""}
uniform mediump sampler2D${n?"Array":""} u_faceMask;${n?`
uniform int u_faceMaskFrameOffset;`:""}

#define FACE_LANDMARK_L_EYE_CENTER ${Re}
#define FACE_LANDMARK_R_EYE_CENTER ${ge}
#define FACE_LANDMARK_NOSE_TIP ${Ne}
#define FACE_LANDMARK_FACE_CENTER ${he}
#define FACE_LANDMARK_MOUTH_CENTER ${se}

${k("int","nFacesAt","",n?`
	int layer = (u_faceLandmarksTexFrameOffset - framesAgo + ${n+1}) % ${n+1};
	return int(texelFetch(u_faceLandmarksTex, ivec3(0, 0, layer), 0).r + 0.5);`:`
	return int(texelFetch(u_faceLandmarksTex, ivec2(0, 0), 0).r + 0.5);`)}
${k("vec4","faceLandmark","int faceIndex, int landmarkIndex",`int i = ${B} + faceIndex * ${M} + landmarkIndex;
	int x = i % ${P};
	int y = i / ${P};${n?`
	int layer = (u_faceLandmarksTexFrameOffset - framesAgo + ${n+1}) % ${n+1};
	return texelFetch(u_faceLandmarksTex, ivec3(x, y, layer), 0);`:`
	return texelFetch(u_faceLandmarksTex, ivec2(x, y), 0);`}`)}
${n?`
vec4 _sampleFaceMask(vec2 pos, int framesAgo) {
	int layer = (u_faceMaskFrameOffset - framesAgo + ${n+1}) % ${n+1};
	return texture(u_faceMask, vec3(pos, float(layer)));
}
`:""}
${h("leftEyebrow","LEFT_EYEBROW")}
${h("rightEyebrow","RIGHT_EYEBROW")}
${h("leftEye","LEFT_EYE")}
${h("rightEye","RIGHT_EYE")}
${h("lips","MOUTH")}
${h("mouth","MOUTH","INNER_MOUTH")}
${h("innerMouth","INNER_MOUTH")}
${h("faceOval","OVAL")}
${k("vec2","faceAt","vec2 pos",`vec4 mask = ${_};
	${H}
	return vec2(step(0.0, faceIndex), faceIndex);`)}
${fe("eye","leftEyeAt","rightEyeAt")}
${fe("eyebrow","leftEyebrowAt","rightEyebrowAt")}
${be(["eyebrow","eye","mouth","innerMouth","lips","face"])}`)}}var Xe=Ye;export{Xe as default};
//# sourceMappingURL=face.mjs.map