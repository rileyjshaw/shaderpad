import{a as Q}from"../chunk-QROQ7JVO.mjs";import{b as ne,c as Ee,d as me,e as re,f as de,g as _e,h as Ae}from"../chunk-BUZPU5IY.mjs";var Te=`#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
	v_uv = a_pos;
	gl_Position = vec4(a_pos * 2.0 - 1.0, 0.0, 1.0);
}`,Me=`#version 300 es
precision mediump float;
uniform vec4 u_color;
out vec4 outColor;
void main() { outColor = u_color; }`,xe=`#version 300 es
precision mediump float;
in vec2 v_uv;
uniform sampler2D u_texture;
out vec4 outColor;
void main() { outColor = texture(u_texture, v_uv); }`,Se=new Float32Array([0,0,1,0,0,1,0,1,1,0,1,1]),z=478,Ce=2,p=z+Ce,w=512,B=1,Ne=Array.from({length:z},(t,e)=>e),Re=473,ge=468,De=4,he=z,se=z+1,ie=null,Oe=["OVAL","LEFT_EYEBROW","RIGHT_EYEBROW","LEFT_EYE","RIGHT_EYE","MOUTH","INNER_MOUTH"],W=["FACE_0","FACE_1","FACE_2","FACE_3","FACE_4","FACE_5","FACE_6","FACE_7"],ce=["FACE_8","FACE_9","FACE_10","FACE_11","FACE_12","FACE_13","FACE_14","FACE_15"],V=255,oe=W.length+ce.length;function ue(t){return Object.fromEntries(t.map((e,a)=>[e,1<<a]))}function le(t){return Object.fromEntries(Object.entries(t).map(([e,a])=>[e,a/V]))}var be=ue(Oe),ke=ue(W),ve=ue(ce),G=le(be),Ie=le(ke),Be=le(ve),ye={modelPath:"https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",maxFaces:1,minFaceDetectionConfidence:.5,minFacePresenceConfidence:.5,minTrackingConfidence:.5,outputFaceBlendshapes:!1,outputFacialTransformationMatrixes:!1};function Ue(t){let e=[];for(let a=1;a<t.length-1;++a)e.push(t[0],t[a],t[a+1]);return e}function T(t){let e=new Array(t.length+1);e[0]=t[0].start;for(let a=0;a<t.length;++a)e[a+1]=t[a].end;return e}function $(t,e){let a=[],n=Math.min(t.length,e.length);for(let i=0;i<n-1;++i)a.push(t[i],e[i],e[i+1],t[i],e[i+1],t[i+1]);return a}var h=null;function Pe(t){if(!h){let e=t.FACE_LANDMARKS_TESSELATION,a=t.FACE_LANDMARKS_LEFT_EYEBROW,n=T(a.slice(0,4)),i=T(a.slice(4,8)),c=t.FACE_LANDMARKS_RIGHT_EYEBROW,E=T(c.slice(0,4)),o=T(c.slice(4,8)),m=t.FACE_LANDMARKS_LEFT_EYE,u=T(m.slice(0,8)),d=T(m.slice(8,16)),l=t.FACE_LANDMARKS_RIGHT_EYE,A=T(l.slice(0,8)),M=T(l.slice(8,16)),F=t.FACE_LANDMARKS_LIPS,N=T(F.slice(0,10)),b=T(F.slice(10,20)),x=T(F.slice(20,30)),r=T(F.slice(30,40)),y=[...u,...d.slice(1,-1)],D=[...A,...M.slice(1,-1)];ie=[...x,...r.slice(1,-1)];let S=new Int16Array(p).fill(-1);for(let _ of y)S[_]=Re;for(let _ of D)S[_]=ge;for(let _ of ie)S[_]=se;let U=_=>{let R=S[_];return R>=0?R:_},H=[];for(let _=0;_<e.length-2;_+=3){let R=U(e[_].start),g=U(e[_+1].start),Y=U(e[_+2].start);R!==g&&R!==Y&&g!==Y&&H.push(R,g,Y)}let Z=$(n,i),q=$(E,o),ee=$(u,d),j=$(A,M),O=[...$(N,x),...$(b,r)],K=$(x,r),J=T(t.FACE_LANDMARKS_FACE_OVAL).slice(0,-1);h=Object.fromEntries(Object.entries({LEFT_EYEBROW:Z,RIGHT_EYEBROW:q,LEFT_EYE:ee,RIGHT_EYE:j,MOUTH:O,INNER_MOUTH:K,TESSELATION:H,OVAL:Ue(J)}).map(([_,R])=>[_,{indices:R,vertices:new Float32Array(R.length*2)}]))}}var ae=new Map,we=new Map;function Fe(t,e,a,n){let i=null,c=null,E=null;try{if(i=t.createShader(t.VERTEX_SHADER),c=t.createShader(t.FRAGMENT_SHADER),E=t.createProgram(),!i||!c||!E)throw new Error;if(t.shaderSource(i,e),t.compileShader(i),!t.getShaderParameter(i,t.COMPILE_STATUS))throw new Error;if(t.shaderSource(c,a),t.compileShader(c),!t.getShaderParameter(c,t.COMPILE_STATUS))throw new Error;if(t.attachShader(E,i),t.attachShader(E,c),t.linkProgram(E),!t.getProgramParameter(E,t.LINK_STATUS))throw new Error;return E}catch{throw E&&t.deleteProgram(E),Q(61,!1)}finally{i&&t.deleteShader(i),c&&t.deleteShader(c)}}function Ge(t){let e=t.getContext("webgl2",{antialias:!1,preserveDrawingBuffer:!0});if(!e)throw Q(60,!1);let a=Fe(e,Te,Me,"face-mask-region"),n=Fe(e,Te,xe,"face-mask-blit"),i;try{let c=e.createBuffer(),E=e.getAttribLocation(a,"a_pos"),o=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,o),e.bufferData(e.ARRAY_BUFFER,Se,e.STATIC_DRAW);let m=e.getAttribLocation(n,"a_pos"),u=e.getUniformLocation(a,"u_color"),d=e.getUniformLocation(n,"u_texture"),l=e.createTexture();e.bindTexture(e.TEXTURE_2D,l),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,null);let A=e.createFramebuffer();if(e.bindFramebuffer(e.FRAMEBUFFER,A),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,l,0),i=e.checkFramebufferStatus(e.FRAMEBUFFER),e.bindFramebuffer(e.FRAMEBUFFER,null),!c||E<0||!o||m<0||!u||!d||!l||!A||i!==e.FRAMEBUFFER_COMPLETE)throw new Error;return e.useProgram(n),e.uniform1i(d,0),e.colorMask(!0,!0,!0,!1),{canvas:t,gl:e,regionProgram:a,blitProgram:n,regionPositionBuffer:c,quadBuffer:o,regionPositionLocation:E,blitPositionLocation:m,colorLocation:u,textureLocation:d,scratchTexture:l,scratchFramebuffer:A}}catch{throw Q(62,!1)}}function $e(t,e,a){let{gl:n,canvas:i,scratchTexture:c}=t;i.width===e&&i.height===a||(i.width=e,i.height=a,n.bindTexture(n.TEXTURE_2D,c),n.texImage2D(n.TEXTURE_2D,0,n.RGBA,e,a,0,n.RGBA,n.UNSIGNED_BYTE,null))}function v(t,e,a,n,i,c,E){let{gl:o,regionProgram:m,regionPositionBuffer:u,regionPositionLocation:d,colorLocation:l,scratchFramebuffer:A}=t,M=B+n*p,{indices:F,vertices:N}=a;o.bindFramebuffer(o.FRAMEBUFFER,A),o.viewport(0,0,t.canvas.width,t.canvas.height),o.clearColor(0,0,0,0),o.clear(o.COLOR_BUFFER_BIT),o.useProgram(m),o.bindBuffer(o.ARRAY_BUFFER,u),o.enableVertexAttribArray(d),o.vertexAttribPointer(d,2,o.FLOAT,!1,0,0),o.enable(o.BLEND),o.blendEquation(o.MAX),o.blendFunc(o.ONE,o.ONE);for(let b=0;b<F.length;++b){let x=(M+F[b])*4;N[b*2]=e[x],N[b*2+1]=e[x+1]}o.bufferData(o.ARRAY_BUFFER,N,o.DYNAMIC_DRAW),o.uniform4f(l,i,c,E,1),o.drawArrays(o.TRIANGLES,0,F.length)}function I(t){let{gl:e,blitProgram:a,quadBuffer:n,blitPositionLocation:i,scratchTexture:c}=t;e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,t.canvas.width,t.canvas.height),e.useProgram(a),e.bindBuffer(e.ARRAY_BUFFER,n),e.enableVertexAttribArray(i),e.vertexAttribPointer(i,2,e.FLOAT,!1,0,0),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,c),e.enable(e.BLEND),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ONE),e.drawArrays(e.TRIANGLES,0,6)}function He(t,e){let a=t.landmarks.data,n=e.length;a[0]=n;for(let i=0;i<n;++i){let c=e[i];for(let m=0;m<z;++m){let u=c[m],d=(B+i*p+m)*4;a[d]=u.x,a[d+1]=1-u.y,a[d+2]=u.z??0,a[d+3]=u.visibility??1}let E=re(a,i,Ne,p,B);a.set(E,(B+i*p+he)*4);let o=re(a,i,ie,p,1);a.set(o,(B+i*p+se)*4)}t.state.nFaces=n}function Ye(t,e,a){let{mask:n,maxFaces:i,landmarks:c,state:{nFaces:E}}=t,{gl:o,canvas:m}=n,{data:u}=c;if($e(n,e,a),o.bindFramebuffer(o.FRAMEBUFFER,null),o.viewport(0,0,m.width,m.height),o.clearColor(0,0,0,0),o.clear(o.COLOR_BUFFER_BIT),!h)return;let d=i<=oe;for(let l=0;l<E;++l){let A=d&&l<W.length?Ie[W[l]]:0,M=d?l<W.length?0:Be[ce[l-W.length]]:(l+1)/V;v(n,u,h.TESSELATION,l,0,A,M),I(n),v(n,u,h.OVAL,l,G.OVAL,0,0),I(n),v(n,u,h.LEFT_EYEBROW,l,G.LEFT_EYEBROW,0,0),I(n),v(n,u,h.RIGHT_EYEBROW,l,G.RIGHT_EYEBROW,0,0),I(n),v(n,u,h.LEFT_EYE,l,G.LEFT_EYE,0,0),I(n),v(n,u,h.RIGHT_EYE,l,G.RIGHT_EYE,0,0),I(n),v(n,u,h.MOUTH,l,G.MOUTH,0,0),I(n),v(n,u,h.INNER_MOUTH,l,G.INNER_MOUTH,0,0),I(n)}}function We(t){let{textureName:e,wasmBaseUrl:a=de,options:{history:n,...i}={}}=t,c={...ye,...i},E=Ee({...c,textureName:e,wasmBaseUrl:a}),o=c.maxFaces*p+B,m=Math.ceil(o/w);return function(u,d){let{injectGLSL:l,emit:A,updateTexture:M}=d,F=ae.get(E),N=F?.landmarks.data??new Float32Array(w*m*4),b=F?.mediapipeCanvas??new OffscreenCanvas(1,1),x=F?.mask.canvas??new OffscreenCanvas(1,1),r,y=!1,D=-1,S=[];function U(s){if(!r)return;let f=r.state.nFaces,L=f*p+B,C=Math.ceil(L/w),P=n?s:void 0;M("u_faceLandmarksTex",{data:r.landmarks.data,width:w,height:C,isPartial:!0},P),M("u_faceMask",r.mask.canvas,P),u.updateUniforms({u_nFaces:f},{allowMissing:!0})}function H(){n?(U(S.length>0?S:D),S=[]):U(D),A("face:result",r.state.result)}async function Z(){r=await me(E,ae,we,async()=>{let[s,{FaceLandmarker:f}]=await Promise.all([_e(a),import("@mediapipe/tasks-vision")]);if(y)return;let L=await f.createFromOptions(s,{baseOptions:{modelAssetPath:c.modelPath,delegate:"GPU"},canvas:b,runningMode:"VIDEO",numFaces:c.maxFaces,minFaceDetectionConfidence:c.minFaceDetectionConfidence,minFacePresenceConfidence:c.minFacePresenceConfidence,minTrackingConfidence:c.minTrackingConfidence,outputFaceBlendshapes:c.outputFaceBlendshapes,outputFacialTransformationMatrixes:c.outputFacialTransformationMatrixes});if(y){L.close();return}let C={landmarker:L,mediapipeCanvas:b,mask:Ge(x),subscribers:new Map,maxFaces:c.maxFaces,state:{nCalls:0,runningMode:"VIDEO",source:null,videoTime:-1,resultTimestamp:0,result:null,pending:Promise.resolve(),nFaces:0},landmarks:{data:N,textureHeight:m}};return Pe(f),C}),!(!r||y)&&r.subscribers.set(H,!1)}let q=Z();async function ee(s){let f=performance.now();if(await q,!r)return;let L=++r.state.nCalls;r.state.pending=r.state.pending.then(async()=>{if(!r||L!==r.state.nCalls)return;let C=s instanceof HTMLVideoElement?"VIDEO":"IMAGE";r.state.runningMode!==C&&(r.state.runningMode=C,await r.landmarker.setOptions({runningMode:C}));let P=!1;if(s!==r.state.source?(r.state.source=s,r.state.videoTime=s instanceof HTMLVideoElement?s.currentTime:-1,P=!0):s instanceof HTMLVideoElement?s.currentTime!==r.state.videoTime&&(r.state.videoTime=s.currentTime,P=!0):s instanceof HTMLImageElement||f-r.state.resultTimestamp>2&&(P=!0),P){let k,X,te;if(s instanceof HTMLVideoElement){if(s.videoWidth===0||s.videoHeight===0||s.readyState<2)return;X=s.videoWidth,te=s.videoHeight,k=r.landmarker.detectForVideo(s,f)}else{if(s.width===0||s.height===0)return;X=s.width,te=s.height,k=r.landmarker.detect(s)}if(k){r.state.resultTimestamp=f,r.state.result=k,He(r,k.faceLandmarks),Ye(r,X,te);for(let[fe,pe]of r.subscribers.entries())pe&&(fe(),r.subscribers.set(fe,!1))}}else if(r.state.result)for(let[k,X]of r.subscribers.entries())X&&(k(),r.subscribers.set(k,!1))}),await r.state.pending}u.on("_init",()=>{u.initializeUniform("u_maxFaces","int",c.maxFaces,{allowMissing:!0}),u.initializeUniform("u_nFaces","int",0,{allowMissing:!0}),u.initializeTexture("u_faceLandmarksTex",{data:N,width:w,height:m},{internalFormat:"RGBA32F",type:"FLOAT",minFilter:"NEAREST",magFilter:"NEAREST",history:n}),u.initializeTexture("u_faceMask",x,{minFilter:"NEAREST",magFilter:"NEAREST",history:n}),q.then(()=>{y||!r||A("face:ready")})});function j(s){r&&(n&&(D=(D+1)%(n+1),U(D),S.push(D)),r.subscribers.set(H,!0),ee(s))}u.on("initializeTexture",(s,f)=>{s===e&&ne(f)&&j(f)}),u.on("updateTextures",s=>{let f=s[e];ne(f)&&j(f)}),u.on("destroy",()=>{y=!0,r&&(r.subscribers.delete(H),r.subscribers.size===0&&(r.landmarker.close(),r.mask.gl.deleteProgram(r.mask.regionProgram),r.mask.gl.deleteProgram(r.mask.blitProgram),r.mask.gl.deleteBuffer(r.mask.regionPositionBuffer),r.mask.gl.deleteBuffer(r.mask.quadBuffer),r.mask.gl.deleteTexture(r.mask.scratchTexture),r.mask.gl.deleteFramebuffer(r.mask.scratchFramebuffer),ae.delete(E))),r=void 0});let{fn:O,historyParams:K}=Ae(n),J=n?"_sampleFaceMask(pos, framesAgo)":"texture(u_faceMask, pos)",_=Array.from({length:oe-1},(s,f)=>`step(${2**(f+1)}.0, faceBitF)`).join(" + "),R=c.maxFaces<=oe?`uint faceBits = (uint(mask.b * ${V}.0 + 0.5) << 8) | uint(mask.g * ${V}.0 + 0.5);
	uint faceBit = faceBits & (~faceBits + 1u);
	float faceBitF = float(faceBit);
	float hasFace = sign(faceBitF);
	float faceIndex = ${_} - (1.0 - hasFace);`:`float faceIndex = float(int(uint(mask.b * ${V}.0 + 0.5)) - 1);`,g=(s,...f)=>O("vec2",`${s}At`,"vec2 pos",`vec4 mask = ${J};
	${R}
	uint bits = uint(mask.r * ${V}.0 + 0.5);
	float hit = sign(float(bits & ${f.reduce((L,C)=>L|be[C],0)}u));
	return vec2(hit, mix(-1.0, faceIndex, hit));`),Y=(s,f,L)=>O("vec2",`${s}At`,"vec2 pos",`vec2 left = ${f}(pos${K});
	vec2 right = ${L}(pos${K});
	return mix(right, left, left.x);`),Le=s=>s.map(f=>O("float",`in${f[0].toUpperCase()+f.slice(1)}`,"vec2 pos",`vec2 a = ${f}At(pos${K}); return step(0.0, a.y) * a.x;`)).join(`
`);l(`
uniform int u_maxFaces;
uniform int u_nFaces;
uniform highp sampler2D${n?"Array":""} u_faceLandmarksTex;${n?`
uniform int u_faceLandmarksTexFrameOffset;`:""}
uniform mediump sampler2D${n?"Array":""} u_faceMask;${n?`
uniform int u_faceMaskFrameOffset;`:""}

#define FACE_LANDMARK_L_EYE_CENTER ${Re}
#define FACE_LANDMARK_R_EYE_CENTER ${ge}
#define FACE_LANDMARK_NOSE_TIP ${De}
#define FACE_LANDMARK_FACE_CENTER ${he}
#define FACE_LANDMARK_MOUTH_CENTER ${se}

${O("int","nFacesAt","",n?`
	int layer = (u_faceLandmarksTexFrameOffset - framesAgo + ${n+1}) % ${n+1};
	return int(texelFetch(u_faceLandmarksTex, ivec3(0, 0, layer), 0).r + 0.5);`:`
	return int(texelFetch(u_faceLandmarksTex, ivec2(0, 0), 0).r + 0.5);`)}
${O("vec4","faceLandmark","int faceIndex, int landmarkIndex",`int i = ${B} + faceIndex * ${p} + landmarkIndex;
	int x = i % ${w};
	int y = i / ${w};${n?`
	int layer = (u_faceLandmarksTexFrameOffset - framesAgo + ${n+1}) % ${n+1};
	return texelFetch(u_faceLandmarksTex, ivec3(x, y, layer), 0);`:`
	return texelFetch(u_faceLandmarksTex, ivec2(x, y), 0);`}`)}
${n?`
vec4 _sampleFaceMask(vec2 pos, int framesAgo) {
	int layer = (u_faceMaskFrameOffset - framesAgo + ${n+1}) % ${n+1};
	return texture(u_faceMask, vec3(pos, float(layer)));
}
`:""}
${g("leftEyebrow","LEFT_EYEBROW")}
${g("rightEyebrow","RIGHT_EYEBROW")}
${g("leftEye","LEFT_EYE")}
${g("rightEye","RIGHT_EYE")}
${g("lips","MOUTH")}
${g("mouth","MOUTH","INNER_MOUTH")}
${g("innerMouth","INNER_MOUTH")}
${g("faceOval","OVAL")}
${O("vec2","faceAt","vec2 pos",`vec4 mask = ${J};
	${R}
	return vec2(step(0.0, faceIndex), faceIndex);`)}
${Y("eye","leftEyeAt","rightEyeAt")}
${Y("eyebrow","leftEyebrowAt","rightEyebrowAt")}
${Le(["eyebrow","eye","mouth","innerMouth","lips","face"])}`)}}var ze=We;export{ze as default};
//# sourceMappingURL=face.mjs.map