import{a as Q}from"../chunk-QROQ7JVO.mjs";import{b as ne,c as Ee,d as me,e as re,f as de,g as _e}from"../chunk-RWGXFWIP.mjs";var Ae=`#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
	v_uv = a_pos;
	gl_Position = vec4(a_pos * 2.0 - 1.0, 0.0, 1.0);
}`,Le=`#version 300 es
precision mediump float;
uniform vec4 u_color;
out vec4 outColor;
void main() { outColor = u_color; }`,pe=`#version 300 es
precision mediump float;
in vec2 v_uv;
uniform sampler2D u_texture;
out vec4 outColor;
void main() { outColor = texture(u_texture, v_uv); }`,Me=new Float32Array([0,0,1,0,0,1,0,1,1,0,1,1]),X=478,xe=2,p=X+xe,U=512,I=1,Ce=Array.from({length:X},(t,e)=>e),Fe=473,Re=468,Se=4,ge=X,se=X+1,ie=null,Ne=["OVAL","LEFT_EYEBROW","RIGHT_EYEBROW","LEFT_EYE","RIGHT_EYE","MOUTH","INNER_MOUTH"],H=["FACE_0","FACE_1","FACE_2","FACE_3","FACE_4","FACE_5","FACE_6","FACE_7"],ce=["FACE_8","FACE_9","FACE_10","FACE_11","FACE_12","FACE_13","FACE_14","FACE_15"],Y=255,oe=H.length+ce.length;function ue(t){return Object.fromEntries(t.map((e,n)=>[e,1<<n]))}function le(t){return Object.fromEntries(Object.entries(t).map(([e,n])=>[e,n/Y]))}var he=ue(Ne),De=ue(H),Oe=ue(ce),P=le(he),ke=le(De),ve=le(Oe),Ie={modelPath:"https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",maxFaces:1,minFaceDetectionConfidence:.5,minFacePresenceConfidence:.5,minTrackingConfidence:.5,outputFaceBlendshapes:!1,outputFacialTransformationMatrixes:!1};function ye(t){let e=[];for(let n=1;n<t.length-1;++n)e.push(t[0],t[n],t[n+1]);return e}function F(t){let e=new Array(t.length+1);e[0]=t[0].start;for(let n=0;n<t.length;++n)e[n+1]=t[n].end;return e}function w(t,e){let n=[],i=Math.min(t.length,e.length);for(let a=0;a<i-1;++a)n.push(t[a],e[a],e[a+1],t[a],e[a+1],t[a+1]);return n}var g=null;function Be(t){if(!g){let e=t.FACE_LANDMARKS_TESSELATION,n=t.FACE_LANDMARKS_LEFT_EYEBROW,i=F(n.slice(0,4)),a=F(n.slice(4,8)),c=t.FACE_LANDMARKS_RIGHT_EYEBROW,m=F(c.slice(0,4)),o=F(c.slice(4,8)),l=t.FACE_LANDMARKS_LEFT_EYE,E=F(l.slice(0,8)),d=F(l.slice(8,16)),u=t.FACE_LANDMARKS_RIGHT_EYE,T=F(u.slice(0,8)),h=F(u.slice(8,16)),R=t.FACE_LANDMARKS_LIPS,C=F(R.slice(0,10)),b=F(R.slice(10,20)),r=F(R.slice(20,30)),M=F(R.slice(30,40)),S=[...E,...d.slice(1,-1)],G=[...T,...h.slice(1,-1)];ie=[...r,...M.slice(1,-1)];let N=new Int16Array(p).fill(-1);for(let _ of S)N[_]=Fe;for(let _ of G)N[_]=Re;for(let _ of ie)N[_]=se;let y=_=>{let A=N[_];return A>=0?A:_},z=[];for(let _=0;_<e.length-2;_+=3){let A=y(e[_].start),$=y(e[_+1].start),V=y(e[_+2].start);A!==$&&A!==V&&$!==V&&z.push(A,$,V)}let q=w(i,a),Z=w(m,o),j=w(E,d),D=w(T,h),W=[...w(C,r),...w(b,M)],J=w(r,M),ee=F(t.FACE_LANDMARKS_FACE_OVAL).slice(0,-1);g=Object.fromEntries(Object.entries({LEFT_EYEBROW:q,RIGHT_EYEBROW:Z,LEFT_EYE:j,RIGHT_EYE:D,MOUTH:W,INNER_MOUTH:J,TESSELATION:z,OVAL:ye(ee)}).map(([_,A])=>[_,{indices:A,vertices:new Float32Array(A.length*2)}]))}}var ae=new Map,Ue=new Map;function Te(t,e,n,i){let a=null,c=null,m=null;try{if(a=t.createShader(t.VERTEX_SHADER),c=t.createShader(t.FRAGMENT_SHADER),m=t.createProgram(),!a||!c||!m)throw new Error;if(t.shaderSource(a,e),t.compileShader(a),!t.getShaderParameter(a,t.COMPILE_STATUS))throw new Error;if(t.shaderSource(c,n),t.compileShader(c),!t.getShaderParameter(c,t.COMPILE_STATUS))throw new Error;if(t.attachShader(m,a),t.attachShader(m,c),t.linkProgram(m),!t.getProgramParameter(m,t.LINK_STATUS))throw new Error;return m}catch{throw m&&t.deleteProgram(m),Q(61,!1)}finally{a&&t.deleteShader(a),c&&t.deleteShader(c)}}function Pe(t){let e=t.getContext("webgl2",{antialias:!1,preserveDrawingBuffer:!0});if(!e)throw Q(60,!1);let n=Te(e,Ae,Le,"face-mask-region"),i=Te(e,Ae,pe,"face-mask-blit"),a;try{let c=e.createBuffer(),m=e.getAttribLocation(n,"a_pos"),o=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,o),e.bufferData(e.ARRAY_BUFFER,Me,e.STATIC_DRAW);let l=e.getAttribLocation(i,"a_pos"),E=e.getUniformLocation(n,"u_color"),d=e.getUniformLocation(i,"u_texture"),u=e.createTexture();e.bindTexture(e.TEXTURE_2D,u),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,null);let T=e.createFramebuffer();if(e.bindFramebuffer(e.FRAMEBUFFER,T),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,u,0),a=e.checkFramebufferStatus(e.FRAMEBUFFER),e.bindFramebuffer(e.FRAMEBUFFER,null),!c||m<0||!o||l<0||!E||!d||!u||!T||a!==e.FRAMEBUFFER_COMPLETE)throw new Error;return e.useProgram(i),e.uniform1i(d,0),e.colorMask(!0,!0,!0,!1),{canvas:t,gl:e,regionProgram:n,blitProgram:i,regionPositionBuffer:c,quadBuffer:o,regionPositionLocation:m,blitPositionLocation:l,colorLocation:E,textureLocation:d,scratchTexture:u,scratchFramebuffer:T}}catch{throw Q(62,!1)}}function we(t,e,n){let{gl:i,canvas:a,scratchTexture:c}=t;a.width===e&&a.height===n||(a.width=e,a.height=n,i.bindTexture(i.TEXTURE_2D,c),i.texImage2D(i.TEXTURE_2D,0,i.RGBA,e,n,0,i.RGBA,i.UNSIGNED_BYTE,null))}function k(t,e,n,i,a,c,m){let{gl:o,regionProgram:l,regionPositionBuffer:E,regionPositionLocation:d,colorLocation:u,scratchFramebuffer:T}=t,h=I+i*p,{indices:R,vertices:C}=n;o.bindFramebuffer(o.FRAMEBUFFER,T),o.viewport(0,0,t.canvas.width,t.canvas.height),o.clearColor(0,0,0,0),o.clear(o.COLOR_BUFFER_BIT),o.useProgram(l),o.bindBuffer(o.ARRAY_BUFFER,E),o.enableVertexAttribArray(d),o.vertexAttribPointer(d,2,o.FLOAT,!1,0,0),o.enable(o.BLEND),o.blendEquation(o.MAX),o.blendFunc(o.ONE,o.ONE);for(let b=0;b<R.length;++b){let r=(h+R[b])*4;C[b*2]=e[r],C[b*2+1]=e[r+1]}o.bufferData(o.ARRAY_BUFFER,C,o.DYNAMIC_DRAW),o.uniform4f(u,a,c,m,1),o.drawArrays(o.TRIANGLES,0,R.length)}function v(t){let{gl:e,blitProgram:n,quadBuffer:i,blitPositionLocation:a,scratchTexture:c}=t;e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,t.canvas.width,t.canvas.height),e.useProgram(n),e.bindBuffer(e.ARRAY_BUFFER,i),e.enableVertexAttribArray(a),e.vertexAttribPointer(a,2,e.FLOAT,!1,0,0),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,c),e.enable(e.BLEND),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ONE),e.drawArrays(e.TRIANGLES,0,6)}function Ge(t,e){let n=t.landmarks.data,i=e.length;n[0]=i;for(let a=0;a<i;++a){let c=e[a];for(let l=0;l<X;++l){let E=c[l],d=(I+a*p+l)*4;n[d]=E.x,n[d+1]=1-E.y,n[d+2]=E.z??0,n[d+3]=E.visibility??1}let m=re(n,a,Ce,p,I);n.set(m,(I+a*p+ge)*4);let o=re(n,a,ie,p,1);n.set(o,(I+a*p+se)*4)}t.state.nFaces=i}function $e(t,e,n){let{mask:i,maxFaces:a,landmarks:c,state:{nFaces:m}}=t,{gl:o,canvas:l}=i,{data:E}=c;if(we(i,e,n),o.bindFramebuffer(o.FRAMEBUFFER,null),o.viewport(0,0,l.width,l.height),o.clearColor(0,0,0,0),o.clear(o.COLOR_BUFFER_BIT),!g)return;let d=a<=oe;for(let u=0;u<m;++u){let T=d&&u<H.length?ke[H[u]]:0,h=d?u<H.length?0:ve[ce[u-H.length]]:(u+1)/Y;k(i,E,g.TESSELATION,u,0,T,h),v(i),k(i,E,g.OVAL,u,P.OVAL,0,0),v(i),k(i,E,g.LEFT_EYEBROW,u,P.LEFT_EYEBROW,0,0),v(i),k(i,E,g.RIGHT_EYEBROW,u,P.RIGHT_EYEBROW,0,0),v(i),k(i,E,g.LEFT_EYE,u,P.LEFT_EYE,0,0),v(i),k(i,E,g.RIGHT_EYE,u,P.RIGHT_EYE,0,0),v(i),k(i,E,g.MOUTH,u,P.MOUTH,0,0),v(i),k(i,E,g.INNER_MOUTH,u,P.INNER_MOUTH,0,0),v(i)}}function He(t){let{textureName:e,options:{history:n,...i}={}}=t,a={...Ie,...i},c=Ee({...a,textureName:e}),m=a.maxFaces*p+I,o=Math.ceil(m/U);return function(l,E){let{injectGLSL:d,emit:u,updateTexture:T}=E,h=ae.get(c),R=h?.landmarks.data??new Float32Array(U*o*4),C=h?.mediapipeCanvas??new OffscreenCanvas(1,1),b=h?.mask.canvas??new OffscreenCanvas(1,1),r,M=!1,S=-1,G=[];function N(s){if(!r)return;let f=r.state.nFaces,L=f*p+I,x=Math.ceil(L/U),B=n?s:void 0;T("u_faceLandmarksTex",{data:r.landmarks.data,width:U,height:x,isPartial:!0},B),T("u_faceMask",r.mask.canvas,B),l.updateUniforms({u_nFaces:f},{allowMissing:!0})}function y(){n?(N(G.length>0?G:S),G=[]):N(S),u("face:result",r.state.result)}async function z(){r=await me(c,ae,Ue,async()=>{let[s,{FaceLandmarker:f}]=await Promise.all([de(),import("@mediapipe/tasks-vision")]);if(M)return;let L=await f.createFromOptions(s,{baseOptions:{modelAssetPath:a.modelPath,delegate:"GPU"},canvas:C,runningMode:"VIDEO",numFaces:a.maxFaces,minFaceDetectionConfidence:a.minFaceDetectionConfidence,minFacePresenceConfidence:a.minFacePresenceConfidence,minTrackingConfidence:a.minTrackingConfidence,outputFaceBlendshapes:a.outputFaceBlendshapes,outputFacialTransformationMatrixes:a.outputFacialTransformationMatrixes});if(M){L.close();return}let x={landmarker:L,mediapipeCanvas:C,mask:Pe(b),subscribers:new Map,maxFaces:a.maxFaces,state:{nCalls:0,runningMode:"VIDEO",source:null,videoTime:-1,resultTimestamp:0,result:null,pending:Promise.resolve(),nFaces:0},landmarks:{data:R,textureHeight:o}};return Be(f),x}),!(!r||M)&&r.subscribers.set(y,!1)}let q=z();async function Z(s){let f=performance.now();if(await q,!r)return;let L=++r.state.nCalls;r.state.pending=r.state.pending.then(async()=>{if(!r||L!==r.state.nCalls)return;let x=s instanceof HTMLVideoElement?"VIDEO":"IMAGE";r.state.runningMode!==x&&(r.state.runningMode=x,await r.landmarker.setOptions({runningMode:x}));let B=!1;if(s!==r.state.source?(r.state.source=s,r.state.videoTime=s instanceof HTMLVideoElement?s.currentTime:-1,B=!0):s instanceof HTMLVideoElement?s.currentTime!==r.state.videoTime&&(r.state.videoTime=s.currentTime,B=!0):s instanceof HTMLImageElement||f-r.state.resultTimestamp>2&&(B=!0),B){let O,K,te;if(s instanceof HTMLVideoElement){if(s.videoWidth===0||s.videoHeight===0||s.readyState<2)return;K=s.videoWidth,te=s.videoHeight,O=r.landmarker.detectForVideo(s,f)}else{if(s.width===0||s.height===0)return;K=s.width,te=s.height,O=r.landmarker.detect(s)}if(O){r.state.resultTimestamp=f,r.state.result=O,Ge(r,O.faceLandmarks),$e(r,K,te);for(let[fe,be]of r.subscribers.entries())be&&(fe(),r.subscribers.set(fe,!1))}}else if(r.state.result)for(let[O,K]of r.subscribers.entries())K&&(O(),r.subscribers.set(O,!1))}),await r.state.pending}l.on("_init",()=>{l.initializeUniform("u_maxFaces","int",a.maxFaces,{allowMissing:!0}),l.initializeUniform("u_nFaces","int",0,{allowMissing:!0}),l.initializeTexture("u_faceLandmarksTex",{data:R,width:U,height:o},{internalFormat:"RGBA32F",type:"FLOAT",minFilter:"NEAREST",magFilter:"NEAREST",history:n}),l.initializeTexture("u_faceMask",b,{minFilter:"NEAREST",magFilter:"NEAREST",history:n}),q.then(()=>{M||!r||u("face:ready")})});function j(s){r&&(n&&(S=(S+1)%(n+1),N(S),G.push(S)),r.subscribers.set(y,!0),Z(s))}l.on("initializeTexture",(s,f)=>{s===e&&ne(f)&&j(f)}),l.on("updateTextures",s=>{let f=s[e];ne(f)&&j(f)}),l.on("destroy",()=>{M=!0,r&&(r.subscribers.delete(y),r.subscribers.size===0&&(r.landmarker.close(),r.mask.gl.deleteProgram(r.mask.regionProgram),r.mask.gl.deleteProgram(r.mask.blitProgram),r.mask.gl.deleteBuffer(r.mask.regionPositionBuffer),r.mask.gl.deleteBuffer(r.mask.quadBuffer),r.mask.gl.deleteTexture(r.mask.scratchTexture),r.mask.gl.deleteFramebuffer(r.mask.scratchFramebuffer),ae.delete(c))),r=void 0});let{fn:D,historyParams:W}=_e(n),J=n?"_sampleFaceMask(pos, framesAgo)":"texture(u_faceMask, pos)",ee=Array.from({length:oe-1},(s,f)=>`step(${2**(f+1)}.0, faceBitF)`).join(" + "),_=a.maxFaces<=oe?`uint faceBits = (uint(mask.b * ${Y}.0 + 0.5) << 8) | uint(mask.g * ${Y}.0 + 0.5);
	uint faceBit = faceBits & (~faceBits + 1u);
	float faceBitF = float(faceBit);
	float hasFace = sign(faceBitF);
	float faceIndex = ${ee} - (1.0 - hasFace);`:`float faceIndex = float(int(uint(mask.b * ${Y}.0 + 0.5)) - 1);`,A=(s,...f)=>D("vec2",`${s}At`,"vec2 pos",`vec4 mask = ${J};
	${_}
	uint bits = uint(mask.r * ${Y}.0 + 0.5);
	float hit = sign(float(bits & ${f.reduce((L,x)=>L|he[x],0)}u));
	return vec2(hit, mix(-1.0, faceIndex, hit));`),$=(s,f,L)=>D("vec2",`${s}At`,"vec2 pos",`vec2 left = ${f}(pos${W});
	vec2 right = ${L}(pos${W});
	return mix(right, left, left.x);`),V=s=>s.map(f=>D("float",`in${f[0].toUpperCase()+f.slice(1)}`,"vec2 pos",`vec2 a = ${f}At(pos${W}); return step(0.0, a.y) * a.x;`)).join(`
`);d(`
uniform int u_maxFaces;
uniform int u_nFaces;
uniform highp sampler2D${n?"Array":""} u_faceLandmarksTex;${n?`
uniform int u_faceLandmarksTexFrameOffset;`:""}
uniform mediump sampler2D${n?"Array":""} u_faceMask;${n?`
uniform int u_faceMaskFrameOffset;`:""}

#define FACE_LANDMARK_L_EYE_CENTER ${Fe}
#define FACE_LANDMARK_R_EYE_CENTER ${Re}
#define FACE_LANDMARK_NOSE_TIP ${Se}
#define FACE_LANDMARK_FACE_CENTER ${ge}
#define FACE_LANDMARK_MOUTH_CENTER ${se}

${D("int","nFacesAt","",n?`
	int layer = (u_faceLandmarksTexFrameOffset - framesAgo + ${n+1}) % ${n+1};
	return int(texelFetch(u_faceLandmarksTex, ivec3(0, 0, layer), 0).r + 0.5);`:`
	return int(texelFetch(u_faceLandmarksTex, ivec2(0, 0), 0).r + 0.5);`)}
${D("vec4","faceLandmark","int faceIndex, int landmarkIndex",`int i = ${I} + faceIndex * ${p} + landmarkIndex;
	int x = i % ${U};
	int y = i / ${U};${n?`
	int layer = (u_faceLandmarksTexFrameOffset - framesAgo + ${n+1}) % ${n+1};
	return texelFetch(u_faceLandmarksTex, ivec3(x, y, layer), 0);`:`
	return texelFetch(u_faceLandmarksTex, ivec2(x, y), 0);`}`)}
${n?`
vec4 _sampleFaceMask(vec2 pos, int framesAgo) {
	int layer = (u_faceMaskFrameOffset - framesAgo + ${n+1}) % ${n+1};
	return texture(u_faceMask, vec3(pos, float(layer)));
}
`:""}
${A("leftEyebrow","LEFT_EYEBROW")}
${A("rightEyebrow","RIGHT_EYEBROW")}
${A("leftEye","LEFT_EYE")}
${A("rightEye","RIGHT_EYE")}
${A("lips","MOUTH")}
${A("mouth","MOUTH","INNER_MOUTH")}
${A("innerMouth","INNER_MOUTH")}
${A("faceOval","OVAL")}
${D("vec2","faceAt","vec2 pos",`vec4 mask = ${J};
	${_}
	return vec2(step(0.0, faceIndex), faceIndex);`)}
${$("eye","leftEyeAt","rightEyeAt")}
${$("eyebrow","leftEyebrowAt","rightEyebrowAt")}
${V(["eyebrow","eye","mouth","innerMouth","lips","face"])}`)}}var Ke=He;export{Ke as default};
//# sourceMappingURL=face.mjs.map