"use strict";var he=Object.create;var Y=Object.defineProperty;var xe=Object.getOwnPropertyDescriptor;var Me=Object.getOwnPropertyNames;var Ne=Object.getPrototypeOf,Ce=Object.prototype.hasOwnProperty;var Ie=(t,e)=>{for(var n in e)Y(t,n,{get:e[n],enumerable:!0})},ce=(t,e,n,i)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of Me(e))!Ce.call(t,r)&&r!==n&&Y(t,r,{get:()=>e[r],enumerable:!(i=xe(e,r))||i.enumerable});return t};var ue=(t,e,n)=>(n=t!=null?he(Ne(t)):{},ce(e||!t||!t.__esModule?Y(n,"default",{value:t,enumerable:!0}):n,t)),Oe=t=>ce(Y({},"__esModule",{value:!0}),t);var je={};Ie(je,{default:()=>ze});module.exports=Oe(je);var Je={data:new Uint8Array(4),width:1,height:1};function z(t){return t instanceof HTMLVideoElement||t instanceof HTMLImageElement||t instanceof HTMLCanvasElement||t instanceof OffscreenCanvas}function Ee(t){return JSON.stringify(t,Object.keys(t).sort())}function j(t,e,n,i,r=0){let s=1/0,d=-1/0,o=1/0,u=-1/0,E=0,l=0;for(let m of n){let _=(r+e*i+m)*4,F=t[_],R=t[_+1];s=Math.min(s,F),d=Math.max(d,F),o=Math.min(o,R),u=Math.max(u,R),E+=t[_+2],l+=t[_+3]}return[(s+d)/2,(o+u)/2,E/n.length,l/n.length]}var K=null;function me(){return K||(K=import("@mediapipe/tasks-vision").then(({FilesetResolver:t})=>t.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm"))),K}function fe(t){return{historyParams:t?", framesAgo":"",fn:t?(i,r,s,d)=>{let o=s.replace(/\w+ /g,""),u=s?`${s}, int framesAgo`:"int framesAgo",E=o?`${o}, 0`:"0";return`${i} ${r}(${u}) {
${d}
}
${i} ${r}(${s}) { return ${r}(${E}); }`}:(i,r,s,d)=>`${i} ${r}(${s}) {
${d}
}`}}var le=`#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
	v_uv = a_pos;
	gl_Position = vec4(a_pos * 2.0 - 1.0, 0.0, 1.0);
}`,ke=`#version 300 es
precision mediump float;
uniform vec4 u_color;
out vec4 outColor;
void main() { outColor = u_color; }`,Se=`#version 300 es
precision mediump float;
in vec2 v_uv;
uniform sampler2D u_texture;
out vec4 outColor;
void main() { outColor = texture(u_texture, v_uv); }`,ve=new Float32Array([0,0,1,0,0,1,0,1,1,0,1,1]),$=478,Be=2,g=$+Be,I=512,M=1,_e=[336,296,334,293,300,276,283,282,295,285],Te=[362,398,384,385,386,387,388,466,263,249,390,373,374,380,381,382],Fe=[70,63,105,66,107,55,65,52,53,46],Ae=[33,246,161,160,159,158,157,173,133,155,154,153,145,144,163,7],Re=[61,185,40,39,37,0,267,269,270,409,291,375,321,405,314,17,84,181,91,146],J=[78,191,80,81,82,13,312,311,310,415,308,324,318,402,317,14,87,178,88,95],De=Array.from({length:$},(t,e)=>e),S={LEFT_EYEBROW:_e,LEFT_EYE:Te,LEFT_EYE_CENTER:473,RIGHT_EYEBROW:Fe,RIGHT_EYE:Ae,RIGHT_EYE_CENTER:468,NOSE_TIP:4,MOUTH:Re,INNER_MOUTH:J,FACE_CENTER:$,MOUTH_CENTER:$+1},ye=["OVAL","LEFT_EYEBROW","RIGHT_EYEBROW","LEFT_EYE","RIGHT_EYE","MOUTH","INNER_MOUTH"],D=["FACE_0","FACE_1","FACE_2","FACE_3","FACE_4","FACE_5","FACE_6","FACE_7"],Z=["FACE_8","FACE_9","FACE_10","FACE_11","FACE_12","FACE_13","FACE_14","FACE_15"],y=255,q=D.length+Z.length;function Q(t){return Object.fromEntries(t.map((e,n)=>[e,1<<n]))}function ee(t){return Object.fromEntries(Object.entries(t).map(([e,n])=>[e,n/y]))}var ge=Q(ye),Ue=Q(D),Pe=Q(Z),O=ee(ge),$e=ee(Ue),He=ee(Pe),Ge={modelPath:"https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",maxFaces:1,minFaceDetectionConfidence:.5,minFacePresenceConfidence:.5,minTrackingConfidence:.5,outputFaceBlendshapes:!1,outputFacialTransformationMatrixes:!1};function k(t){let e=[];for(let n=1;n<t.length-1;++n)e.push(t[0],t[n],t[n+1]);return e}var A=null;function Ye(t){if(!A){let e=t.FACE_LANDMARKS_TESSELATION,n=[];for(let r=0;r<e.length-2;r+=3)n.push(e[r].start,e[r+1].start,e[r+2].start);let i=t.FACE_LANDMARKS_FACE_OVAL.map(({start:r})=>r);A=Object.fromEntries(Object.entries({LEFT_EYEBROW:k(_e),RIGHT_EYEBROW:k(Fe),LEFT_EYE:k(Te),RIGHT_EYE:k(Ae),MOUTH:k(Re),INNER_MOUTH:k(J),TESSELATION:n,OVAL:k(i)}).map(([r,s])=>[r,{indices:s,vertices:new Float32Array(s.length*2)}]))}}var P=new Map;function de(t,e,n){let i=t.createShader(t.VERTEX_SHADER);t.shaderSource(i,e),t.compileShader(i);let r=t.createShader(t.FRAGMENT_SHADER);t.shaderSource(r,n),t.compileShader(r);let s=t.createProgram();return t.attachShader(s,i),t.attachShader(s,r),t.linkProgram(s),t.deleteShader(i),t.deleteShader(r),s}function we(t){let e=t.getContext("webgl2",{antialias:!1,preserveDrawingBuffer:!0}),n=de(e,le,ke),i=de(e,le,Se),r=e.createBuffer(),s=e.getAttribLocation(n,"a_pos"),d=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,d),e.bufferData(e.ARRAY_BUFFER,ve,e.STATIC_DRAW);let o=e.getAttribLocation(i,"a_pos"),u=e.getUniformLocation(n,"u_color"),E=e.getUniformLocation(i,"u_texture"),l=e.createTexture();e.bindTexture(e.TEXTURE_2D,l),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,null);let m=e.createFramebuffer();return e.bindFramebuffer(e.FRAMEBUFFER,m),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,l,0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.useProgram(i),e.uniform1i(E,0),e.colorMask(!0,!0,!0,!1),{canvas:t,gl:e,regionProgram:n,blitProgram:i,regionPositionBuffer:r,quadBuffer:d,regionPositionLocation:s,blitPositionLocation:o,colorLocation:u,textureLocation:E,scratchTexture:l,scratchFramebuffer:m}}function We(t,e,n){let{gl:i,canvas:r,scratchTexture:s}=t;r.width===e&&r.height===n||(r.width=e,r.height=n,i.bindTexture(i.TEXTURE_2D,s),i.texImage2D(i.TEXTURE_2D,0,i.RGBA,e,n,0,i.RGBA,i.UNSIGNED_BYTE,null))}function h(t,e,n,i,r,s,d){let{gl:o,regionProgram:u,regionPositionBuffer:E,regionPositionLocation:l,colorLocation:m,scratchFramebuffer:_}=t,F=M+i*g,{indices:R,vertices:v}=n;o.bindFramebuffer(o.FRAMEBUFFER,_),o.viewport(0,0,t.canvas.width,t.canvas.height),o.clearColor(0,0,0,0),o.clear(o.COLOR_BUFFER_BIT),o.useProgram(u),o.bindBuffer(o.ARRAY_BUFFER,E),o.enableVertexAttribArray(l),o.vertexAttribPointer(l,2,o.FLOAT,!1,0,0),o.enable(o.BLEND),o.blendEquation(o.MAX),o.blendFunc(o.ONE,o.ONE);for(let a=0;a<R.length;++a){let N=(F+R[a])*4;v[a*2]=e[N],v[a*2+1]=e[N+1]}o.bufferData(o.ARRAY_BUFFER,v,o.DYNAMIC_DRAW),o.uniform4f(m,r,s,d,1),o.drawArrays(o.TRIANGLES,0,R.length)}function x(t){let{gl:e,blitProgram:n,quadBuffer:i,blitPositionLocation:r,scratchTexture:s}=t;e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,t.canvas.width,t.canvas.height),e.useProgram(n),e.bindBuffer(e.ARRAY_BUFFER,i),e.enableVertexAttribArray(r),e.vertexAttribPointer(r,2,e.FLOAT,!1,0,0),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,s),e.enable(e.BLEND),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ONE),e.drawArrays(e.TRIANGLES,0,6)}function Ve(t,e){let n=t.landmarks.data,i=e.length;n[0]=i;for(let r=0;r<i;++r){let s=e[r];for(let u=0;u<$;++u){let E=s[u],l=(M+r*g+u)*4;n[l]=E.x,n[l+1]=1-E.y,n[l+2]=E.z??0,n[l+3]=E.visibility??1}let d=j(n,r,De,g,M);n.set(d,(M+r*g+S.FACE_CENTER)*4);let o=j(n,r,J,g,1);n.set(o,(M+r*g+S.MOUTH_CENTER)*4)}t.state.nFaces=i}function Xe(t,e,n){let{mask:i,maxFaces:r,landmarks:s,state:{nFaces:d}}=t,{gl:o,canvas:u}=i,{data:E}=s;if(We(i,e,n),o.bindFramebuffer(o.FRAMEBUFFER,null),o.viewport(0,0,u.width,u.height),o.clearColor(0,0,0,0),o.clear(o.COLOR_BUFFER_BIT),!A)return;let l=r<=q;for(let m=0;m<d;++m){let _=l&&m<D.length?$e[D[m]]:0,F=l?m<D.length?0:He[Z[m-D.length]]:(m+1)/y;h(i,E,A.TESSELATION,m,0,_,F),x(i),h(i,E,A.OVAL,m,O.OVAL,0,0),x(i),h(i,E,A.LEFT_EYEBROW,m,O.LEFT_EYEBROW,0,0),x(i),h(i,E,A.RIGHT_EYEBROW,m,O.RIGHT_EYEBROW,0,0),x(i),h(i,E,A.LEFT_EYE,m,O.LEFT_EYE,_,F),x(i),h(i,E,A.RIGHT_EYE,m,O.RIGHT_EYE,_,F),x(i),h(i,E,A.MOUTH,m,O.MOUTH,0,0),x(i),h(i,E,A.INNER_MOUTH,m,O.INNER_MOUTH,_,F),x(i)}}function Ke(t){let{textureName:e,options:{history:n,...i}={}}=t,r={...Ge,...i},s=Ee({...r,textureName:e}),d=r.maxFaces*g+M,o=Math.ceil(d/I);return function(u,E){let{injectGLSL:l,emitHook:m,updateTexturesInternal:_}=E,F=P.get(s),R=F?.landmarks.data??new Float32Array(I*o*4),v=F?.mask.canvas??new OffscreenCanvas(1,1),a=null,N=!1,w=!1;function W(c){if(!a)return;let f=a.state.nFaces,T=f*g+M,C=Math.ceil(T/I),L=c;typeof L>"u"&&G.length>0&&(L=G,G=[]),_({u_faceLandmarksTex:{data:a.landmarks.data,width:I,height:C,isPartial:!0},u_faceMask:a.mask.canvas},n?{skipHistoryWrite:w,historyWriteIndex:L}:void 0),u.updateUniforms({u_nFaces:f}),m("face:result",a.state.result)}async function be(){if(P.has(s))a=P.get(s);else{let[c,{FaceLandmarker:f}]=await Promise.all([me(),import("@mediapipe/tasks-vision")]);if(N)return;let T=await f.createFromOptions(c,{baseOptions:{modelAssetPath:r.modelPath,delegate:"GPU"},runningMode:"VIDEO",numFaces:r.maxFaces,minFaceDetectionConfidence:r.minFaceDetectionConfidence,minFacePresenceConfidence:r.minFacePresenceConfidence,minTrackingConfidence:r.minTrackingConfidence,outputFaceBlendshapes:r.outputFaceBlendshapes,outputFacialTransformationMatrixes:r.outputFacialTransformationMatrixes});if(N){T.close();return}a={landmarker:T,mask:we(v),subscribers:new Map,maxFaces:r.maxFaces,state:{nCalls:0,runningMode:"VIDEO",source:null,videoTime:-1,resultTimestamp:0,result:null,pending:Promise.resolve(),nFaces:0},landmarks:{data:R,textureHeight:o}},Ye(f),P.set(s,a)}a.subscribers.set(W,!1)}let te=be();async function ne(c){let f=performance.now();if(await te,!a)return;let T=++a.state.nCalls;a.state.pending=a.state.pending.then(async()=>{if(!a||T!==a.state.nCalls)return;let C=c instanceof HTMLVideoElement?"VIDEO":"IMAGE";a.state.runningMode!==C&&(a.state.runningMode=C,await a.landmarker.setOptions({runningMode:C}));let L=!1;if(c!==a.state.source?(a.state.source=c,a.state.videoTime=-1,L=!0):c instanceof HTMLVideoElement?c.currentTime!==a.state.videoTime&&(a.state.videoTime=c.currentTime,L=!0):c instanceof HTMLImageElement||f-a.state.resultTimestamp>2&&(L=!0),L){let p,U,X;if(c instanceof HTMLVideoElement){if(c.videoWidth===0||c.videoHeight===0||c.readyState<2)return;U=c.videoWidth,X=c.videoHeight,p=a.landmarker.detectForVideo(c,f)}else{if(c.width===0||c.height===0)return;U=c.width,X=c.height,p=a.landmarker.detect(c)}if(p){a.state.resultTimestamp=f,a.state.result=p,Ve(a,p.faceLandmarks),Xe(a,U,X);for(let se of a.subscribers.keys())se(),a.subscribers.set(se,!0)}}else if(a.state.result)for(let[p,U]of a.subscribers.entries())U||(p(),a.subscribers.set(p,!0))}),await a.state.pending}u.on("_init",()=>{u.initializeUniform("u_maxFaces","int",r.maxFaces),u.initializeUniform("u_nFaces","int",0),u.initializeTexture("u_faceLandmarksTex",{data:R,width:I,height:o},{internalFormat:"RGBA32F",type:"FLOAT",minFilter:"NEAREST",magFilter:"NEAREST",history:n}),u.initializeTexture("u_faceMask",v,{minFilter:"NEAREST",magFilter:"NEAREST",history:n}),te.then(()=>{N||!a||m("face:ready")})});let H=0,G=[],re=()=>{n&&(W(H),G.push(H),H=(H+1)%(n+1))};u.on("initializeTexture",(c,f)=>{c===e&&z(f)&&(re(),ne(f))}),u.on("updateTextures",(c,f)=>{let T=c[e];z(T)&&(w=f?.skipHistoryWrite??!1,w||re(),ne(T))}),u.on("destroy",()=>{N=!0,a&&(a.subscribers.delete(W),a.subscribers.size===0&&(a.landmarker.close(),a.mask.gl.deleteProgram(a.mask.regionProgram),a.mask.gl.deleteProgram(a.mask.blitProgram),a.mask.gl.deleteBuffer(a.mask.regionPositionBuffer),a.mask.gl.deleteBuffer(a.mask.quadBuffer),a.mask.gl.deleteTexture(a.mask.scratchTexture),a.mask.gl.deleteFramebuffer(a.mask.scratchFramebuffer),P.delete(s))),a=null});let{fn:B,historyParams:V}=fe(n),ae=n?"_sampleFaceMask(pos, framesAgo)":"texture(u_faceMask, pos)",Le=Array.from({length:q-1},(c,f)=>`step(${2**(f+1)}.0, faceBitF)`).join(" + "),ie=r.maxFaces<=q?`uint faceBits = (uint(mask.b * ${y}.0 + 0.5) << 8) | uint(mask.g * ${y}.0 + 0.5);
	uint faceBit = faceBits & (~faceBits + 1u);
	float faceBitF = float(faceBit);
	float hasFace = sign(faceBitF);
	float faceIndex = ${Le} - (1.0 - hasFace);`:`float faceIndex = float(int(uint(mask.b * ${y}.0 + 0.5)) - 1);`,b=(c,...f)=>B("vec2",`${c}At`,"vec2 pos",`vec4 mask = ${ae};
	${ie}
	uint bits = uint(mask.r * ${y}.0 + 0.5);
	float hit = sign(float(bits & ${f.reduce((T,C)=>T|ge[C],0)}u));
	return vec2(hit, mix(-1.0, faceIndex, hit));`),oe=(c,f,T)=>B("vec2",`${c}At`,"vec2 pos",`vec2 left = ${f}(pos${V});
	vec2 right = ${T}(pos${V});
	return mix(right, left, left.x);`),pe=c=>c.map(f=>B("float",`in${f[0].toUpperCase()+f.slice(1)}`,"vec2 pos",`vec2 a = ${f}At(pos${V}); return step(0.0, a.y) * a.x;`)).join(`
`);l(`
uniform int u_maxFaces;
uniform int u_nFaces;
uniform highp sampler2D${n?"Array":""} u_faceLandmarksTex;${n?`
uniform int u_faceLandmarksTexFrameOffset;`:""}
uniform mediump sampler2D${n?"Array":""} u_faceMask;${n?`
uniform int u_faceMaskFrameOffset;`:""}

#define FACE_LANDMARK_L_EYE_CENTER ${S.LEFT_EYE_CENTER}
#define FACE_LANDMARK_R_EYE_CENTER ${S.RIGHT_EYE_CENTER}
#define FACE_LANDMARK_NOSE_TIP ${S.NOSE_TIP}
#define FACE_LANDMARK_FACE_CENTER ${S.FACE_CENTER}
#define FACE_LANDMARK_MOUTH_CENTER ${S.MOUTH_CENTER}

${B("int","nFacesAt","",n?`
	int layer = (u_faceLandmarksTexFrameOffset - framesAgo + ${n+1}) % ${n+1};
	return int(texelFetch(u_faceLandmarksTex, ivec3(0, 0, layer), 0).r + 0.5);`:`
	return int(texelFetch(u_faceLandmarksTex, ivec2(0, 0), 0).r + 0.5);`)}
${B("vec4","faceLandmark","int faceIndex, int landmarkIndex",`int i = ${M} + faceIndex * ${g} + landmarkIndex;
	int x = i % ${I};
	int y = i / ${I};${n?`
	int layer = (u_faceLandmarksTexFrameOffset - framesAgo + ${n+1}) % ${n+1};
	return texelFetch(u_faceLandmarksTex, ivec3(x, y, layer), 0);`:`
	return texelFetch(u_faceLandmarksTex, ivec2(x, y), 0);`}`)}
${n?`
vec4 _sampleFaceMask(vec2 pos, int framesAgo) {
	int layer = (u_faceMaskFrameOffset - framesAgo + ${n+1}) % ${n+1};
	return texture(u_faceMask, vec3(pos, float(layer)));
}
`:""}
${b("leftEyebrow","LEFT_EYEBROW")}
${b("rightEyebrow","RIGHT_EYEBROW")}
${b("leftEye","LEFT_EYE")}
${b("rightEye","RIGHT_EYE")}
${b("lips","MOUTH")}
${b("mouth","MOUTH","INNER_MOUTH")}
${b("innerMouth","INNER_MOUTH")}
${b("faceOval","OVAL")}
${B("vec2","faceAt","vec2 pos",`vec4 mask = ${ae};
	${ie}
	return vec2(step(0.0, faceIndex), faceIndex);`)}
${oe("eye","leftEyeAt","rightEyeAt")}
${oe("eyebrow","leftEyebrowAt","rightEyebrowAt")}
${pe(["eyebrow","eye","mouth","innerMouth","lips","face"])}`)}}var ze=Ke;
//# sourceMappingURL=face.js.map