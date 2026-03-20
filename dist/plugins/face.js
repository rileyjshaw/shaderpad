"use strict";var Le=Object.create;var Z=Object.defineProperty;var he=Object.getOwnPropertyDescriptor;var xe=Object.getOwnPropertyNames;var Me=Object.getPrototypeOf,Ce=Object.prototype.hasOwnProperty;var Ne=(t,e)=>{for(var n in e)Z(t,n,{get:e[n],enumerable:!0})},me=(t,e,n,i)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of xe(e))!Ce.call(t,r)&&r!==n&&Z(t,r,{get:()=>e[r],enumerable:!(i=he(e,r))||i.enumerable});return t};var Ee=(t,e,n)=>(n=t!=null?Le(Me(t)):{},me(e||!t||!t.__esModule?Z(n,"default",{value:t,enumerable:!0}):n,t)),ye=t=>me(Z({},"__esModule",{value:!0}),t);var qe={};Ne(qe,{default:()=>je});module.exports=ye(qe);var Ze={data:new Uint8Array(4),width:1,height:1};function re(t){return t instanceof HTMLVideoElement||t instanceof HTMLImageElement||t instanceof HTMLCanvasElement||t instanceof OffscreenCanvas}function de(t){return JSON.stringify(t,Object.keys(t).sort())}function ae(t,e,n,i,r=0){let c=1/0,_=-1/0,o=1/0,u=-1/0,l=0,d=0;for(let f of n){let T=(r+e*i+f)*4,g=t[T],A=t[T+1];c=Math.min(c,g),_=Math.max(_,g),o=Math.min(o,A),u=Math.max(u,A),l+=t[T+2],d+=t[T+3]}return[(c+_)/2,(o+u)/2,l/n.length,d/n.length]}var ne=null;function _e(){return ne||(ne=import("@mediapipe/tasks-vision").then(({FilesetResolver:t})=>t.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm"))),ne}function Ae(t){return{historyParams:t?", framesAgo":"",fn:t?(i,r,c,_)=>{let o=c.replace(/\w+ /g,""),u=c?`${c}, int framesAgo`:"int framesAgo",l=o?`${o}, 0`:"0";return`${i} ${r}(${u}) {
${_}
}
${i} ${r}(${c}) { return ${r}(${l}); }`}:(i,r,c,_)=>`${i} ${r}(${c}) {
${_}
}`}}var Te=`#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
	v_uv = a_pos;
	gl_Position = vec4(a_pos * 2.0 - 1.0, 0.0, 1.0);
}`,Oe=`#version 300 es
precision mediump float;
uniform vec4 u_color;
out vec4 outColor;
void main() { outColor = u_color; }`,ke=`#version 300 es
precision mediump float;
in vec2 v_uv;
uniform sampler2D u_texture;
out vec4 outColor;
void main() { outColor = texture(u_texture, v_uv); }`,Se=new Float32Array([0,0,1,0,0,1,0,1,1,0,1,1]),z=478,Ie=2,h=z+Ie,B=512,k=1,ve=Array.from({length:z},(t,e)=>e),Re=473,ge=468,De=4,be=z,se=z+1,ie=null,Be=["OVAL","LEFT_EYEBROW","RIGHT_EYEBROW","LEFT_EYE","RIGHT_EYE","MOUTH","INNER_MOUTH"],w=["FACE_0","FACE_1","FACE_2","FACE_3","FACE_4","FACE_5","FACE_6","FACE_7"],ce=["FACE_8","FACE_9","FACE_10","FACE_11","FACE_12","FACE_13","FACE_14","FACE_15"],G=255,oe=w.length+ce.length;function ue(t){return Object.fromEntries(t.map((e,n)=>[e,1<<n]))}function le(t){return Object.fromEntries(Object.entries(t).map(([e,n])=>[e,n/G]))}var pe=ue(Be),Ue=ue(w),Pe=ue(ce),U=le(pe),$e=le(Ue),He=le(Pe),we={modelPath:"https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",maxFaces:1,minFaceDetectionConfidence:.5,minFacePresenceConfidence:.5,minTrackingConfidence:.5,outputFaceBlendshapes:!1,outputFacialTransformationMatrixes:!1};function Ge(t){let e=[];for(let n=1;n<t.length-1;++n)e.push(t[0],t[n],t[n+1]);return e}function R(t){let e=new Array(t.length+1);e[0]=t[0].start;for(let n=0;n<t.length;++n)e[n+1]=t[n].end;return e}function P(t,e){let n=[],i=Math.min(t.length,e.length);for(let r=0;r<i-1;++r)n.push(t[r],e[r],e[r+1],t[r],e[r+1],t[r+1]);return n}var L=null;function Ye(t){if(!L){let e=t.FACE_LANDMARKS_TESSELATION,n=t.FACE_LANDMARKS_LEFT_EYEBROW,i=R(n.slice(0,4)),r=R(n.slice(4,8)),c=t.FACE_LANDMARKS_RIGHT_EYEBROW,_=R(c.slice(0,4)),o=R(c.slice(4,8)),u=t.FACE_LANDMARKS_LEFT_EYE,l=R(u.slice(0,8)),d=R(u.slice(8,16)),f=t.FACE_LANDMARKS_RIGHT_EYE,T=R(f.slice(0,8)),g=R(f.slice(8,16)),A=t.FACE_LANDMARKS_LIPS,x=R(A.slice(0,10)),a=R(A.slice(10,20)),p=R(A.slice(20,30)),S=R(A.slice(30,40)),Y=[...l,...d.slice(1,-1)],Q=[...T,...g.slice(1,-1)];ie=[...p,...S.slice(1,-1)];let I=new Int16Array(h).fill(-1);for(let m of Y)I[m]=Re;for(let m of Q)I[m]=ge;for(let m of ie)I[m]=se;let $=m=>{let b=I[m];return b>=0?b:m},v=[];for(let m=0;m<e.length-2;m+=3){let b=$(e[m].start),V=$(e[m+1].start),s=$(e[m+2].start);b!==V&&b!==s&&V!==s&&v.push(b,V,s)}let H=P(i,r),j=P(_,o),M=P(l,d),W=P(T,g),q=[...P(x,p),...P(a,S)],ee=P(p,S),J=R(t.FACE_LANDMARKS_FACE_OVAL).slice(0,-1);L=Object.fromEntries(Object.entries({LEFT_EYEBROW:H,RIGHT_EYEBROW:j,LEFT_EYE:M,RIGHT_EYE:W,MOUTH:q,INNER_MOUTH:ee,TESSELATION:v,OVAL:Ge(J)}).map(([m,b])=>[m,{indices:b,vertices:new Float32Array(b.length*2)}]))}}var X=new Map;function Fe(t,e,n){let i=t.createShader(t.VERTEX_SHADER);t.shaderSource(i,e),t.compileShader(i);let r=t.createShader(t.FRAGMENT_SHADER);t.shaderSource(r,n),t.compileShader(r);let c=t.createProgram();return t.attachShader(c,i),t.attachShader(c,r),t.linkProgram(c),t.deleteShader(i),t.deleteShader(r),c}function We(t){let e=t.getContext("webgl2",{antialias:!1,preserveDrawingBuffer:!0}),n=Fe(e,Te,Oe),i=Fe(e,Te,ke),r=e.createBuffer(),c=e.getAttribLocation(n,"a_pos"),_=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,_),e.bufferData(e.ARRAY_BUFFER,Se,e.STATIC_DRAW);let o=e.getAttribLocation(i,"a_pos"),u=e.getUniformLocation(n,"u_color"),l=e.getUniformLocation(i,"u_texture"),d=e.createTexture();e.bindTexture(e.TEXTURE_2D,d),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,null);let f=e.createFramebuffer();return e.bindFramebuffer(e.FRAMEBUFFER,f),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,d,0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.useProgram(i),e.uniform1i(l,0),e.colorMask(!0,!0,!0,!1),{canvas:t,gl:e,regionProgram:n,blitProgram:i,regionPositionBuffer:r,quadBuffer:_,regionPositionLocation:c,blitPositionLocation:o,colorLocation:u,textureLocation:l,scratchTexture:d,scratchFramebuffer:f}}function Ve(t,e,n){let{gl:i,canvas:r,scratchTexture:c}=t;r.width===e&&r.height===n||(r.width=e,r.height=n,i.bindTexture(i.TEXTURE_2D,c),i.texImage2D(i.TEXTURE_2D,0,i.RGBA,e,n,0,i.RGBA,i.UNSIGNED_BYTE,null))}function y(t,e,n,i,r,c,_){let{gl:o,regionProgram:u,regionPositionBuffer:l,regionPositionLocation:d,colorLocation:f,scratchFramebuffer:T}=t,g=k+i*h,{indices:A,vertices:x}=n;o.bindFramebuffer(o.FRAMEBUFFER,T),o.viewport(0,0,t.canvas.width,t.canvas.height),o.clearColor(0,0,0,0),o.clear(o.COLOR_BUFFER_BIT),o.useProgram(u),o.bindBuffer(o.ARRAY_BUFFER,l),o.enableVertexAttribArray(d),o.vertexAttribPointer(d,2,o.FLOAT,!1,0,0),o.enable(o.BLEND),o.blendEquation(o.MAX),o.blendFunc(o.ONE,o.ONE);for(let a=0;a<A.length;++a){let p=(g+A[a])*4;x[a*2]=e[p],x[a*2+1]=e[p+1]}o.bufferData(o.ARRAY_BUFFER,x,o.DYNAMIC_DRAW),o.uniform4f(f,r,c,_,1),o.drawArrays(o.TRIANGLES,0,A.length)}function O(t){let{gl:e,blitProgram:n,quadBuffer:i,blitPositionLocation:r,scratchTexture:c}=t;e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,t.canvas.width,t.canvas.height),e.useProgram(n),e.bindBuffer(e.ARRAY_BUFFER,i),e.enableVertexAttribArray(r),e.vertexAttribPointer(r,2,e.FLOAT,!1,0,0),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,c),e.enable(e.BLEND),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ONE),e.drawArrays(e.TRIANGLES,0,6)}function Ke(t,e){let n=t.landmarks.data,i=e.length;n[0]=i;for(let r=0;r<i;++r){let c=e[r];for(let u=0;u<z;++u){let l=c[u],d=(k+r*h+u)*4;n[d]=l.x,n[d+1]=1-l.y,n[d+2]=l.z??0,n[d+3]=l.visibility??1}let _=ae(n,r,ve,h,k);n.set(_,(k+r*h+be)*4);let o=ae(n,r,ie,h,1);n.set(o,(k+r*h+se)*4)}t.state.nFaces=i}function Xe(t,e,n){let{mask:i,maxFaces:r,landmarks:c,state:{nFaces:_}}=t,{gl:o,canvas:u}=i,{data:l}=c;if(Ve(i,e,n),o.bindFramebuffer(o.FRAMEBUFFER,null),o.viewport(0,0,u.width,u.height),o.clearColor(0,0,0,0),o.clear(o.COLOR_BUFFER_BIT),!L)return;let d=r<=oe;for(let f=0;f<_;++f){let T=d&&f<w.length?$e[w[f]]:0,g=d?f<w.length?0:He[ce[f-w.length]]:(f+1)/G;y(i,l,L.TESSELATION,f,0,T,g),O(i),y(i,l,L.OVAL,f,U.OVAL,0,0),O(i),y(i,l,L.LEFT_EYEBROW,f,U.LEFT_EYEBROW,0,0),O(i),y(i,l,L.RIGHT_EYEBROW,f,U.RIGHT_EYEBROW,0,0),O(i),y(i,l,L.LEFT_EYE,f,U.LEFT_EYE,0,0),O(i),y(i,l,L.RIGHT_EYE,f,U.RIGHT_EYE,0,0),O(i),y(i,l,L.MOUTH,f,U.MOUTH,0,0),O(i),y(i,l,L.INNER_MOUTH,f,U.INNER_MOUTH,0,0),O(i)}}function ze(t){let{textureName:e,options:{history:n,...i}={}}=t,r={...we,...i},c=de({...r,textureName:e}),_=r.maxFaces*h+k,o=Math.ceil(_/B);return function(u,l){let{injectGLSL:d,emitHook:f,updateTexturesInternal:T}=l,g=X.get(c),A=g?.landmarks.data??new Float32Array(B*o*4),x=g?.mask.canvas??new OffscreenCanvas(1,1),a=null,p=!1,S=!1;function Y(s){if(!a)return;let E=a.state.nFaces,F=E*h+k,D=Math.ceil(F/B),C=s;typeof C>"u"&&H.length>0&&(C=H,H=[]),T({u_faceLandmarksTex:{data:a.landmarks.data,width:B,height:D,isPartial:!0},u_faceMask:a.mask.canvas},n?{skipHistoryWrite:S,historyWriteIndex:C}:void 0),u.updateUniforms({u_nFaces:E}),f("face:result",a.state.result)}async function Q(){if(X.has(c))a=X.get(c);else{let[s,{FaceLandmarker:E}]=await Promise.all([_e(),import("@mediapipe/tasks-vision")]);if(p)return;let F=await E.createFromOptions(s,{baseOptions:{modelAssetPath:r.modelPath,delegate:"GPU"},runningMode:"VIDEO",numFaces:r.maxFaces,minFaceDetectionConfidence:r.minFaceDetectionConfidence,minFacePresenceConfidence:r.minFacePresenceConfidence,minTrackingConfidence:r.minTrackingConfidence,outputFaceBlendshapes:r.outputFaceBlendshapes,outputFacialTransformationMatrixes:r.outputFacialTransformationMatrixes});if(p){F.close();return}a={landmarker:F,mask:We(x),subscribers:new Map,maxFaces:r.maxFaces,state:{nCalls:0,runningMode:"VIDEO",source:null,videoTime:-1,resultTimestamp:0,result:null,pending:Promise.resolve(),nFaces:0},landmarks:{data:A,textureHeight:o}},Ye(E),X.set(c,a)}a.subscribers.set(Y,!1)}let I=Q();async function $(s){let E=performance.now();if(await I,!a)return;let F=++a.state.nCalls;a.state.pending=a.state.pending.then(async()=>{if(!a||F!==a.state.nCalls)return;let D=s instanceof HTMLVideoElement?"VIDEO":"IMAGE";a.state.runningMode!==D&&(a.state.runningMode=D,await a.landmarker.setOptions({runningMode:D}));let C=!1;if(s!==a.state.source?(a.state.source=s,a.state.videoTime=-1,C=!0):s instanceof HTMLVideoElement?s.currentTime!==a.state.videoTime&&(a.state.videoTime=s.currentTime,C=!0):s instanceof HTMLImageElement||E-a.state.resultTimestamp>2&&(C=!0),C){let N,K,te;if(s instanceof HTMLVideoElement){if(s.videoWidth===0||s.videoHeight===0||s.readyState<2)return;K=s.videoWidth,te=s.videoHeight,N=a.landmarker.detectForVideo(s,E)}else{if(s.width===0||s.height===0)return;K=s.width,te=s.height,N=a.landmarker.detect(s)}if(N){a.state.resultTimestamp=E,a.state.result=N,Ke(a,N.faceLandmarks),Xe(a,K,te);for(let fe of a.subscribers.keys())fe(),a.subscribers.set(fe,!0)}}else if(a.state.result)for(let[N,K]of a.subscribers.entries())K||(N(),a.subscribers.set(N,!0))}),await a.state.pending}u.on("_init",()=>{u.initializeUniform("u_maxFaces","int",r.maxFaces),u.initializeUniform("u_nFaces","int",0),u.initializeTexture("u_faceLandmarksTex",{data:A,width:B,height:o},{internalFormat:"RGBA32F",type:"FLOAT",minFilter:"NEAREST",magFilter:"NEAREST",history:n}),u.initializeTexture("u_faceMask",x,{minFilter:"NEAREST",magFilter:"NEAREST",history:n}),I.then(()=>{p||!a||f("face:ready")})});let v=0,H=[],j=()=>{n&&(Y(v),H.push(v),v=(v+1)%(n+1))};u.on("initializeTexture",(s,E)=>{s===e&&re(E)&&(j(),$(E))}),u.on("updateTextures",(s,E)=>{let F=s[e];re(F)&&(S=E?.skipHistoryWrite??!1,S||j(),$(F))}),u.on("destroy",()=>{p=!0,a&&(a.subscribers.delete(Y),a.subscribers.size===0&&(a.landmarker.close(),a.mask.gl.deleteProgram(a.mask.regionProgram),a.mask.gl.deleteProgram(a.mask.blitProgram),a.mask.gl.deleteBuffer(a.mask.regionPositionBuffer),a.mask.gl.deleteBuffer(a.mask.quadBuffer),a.mask.gl.deleteTexture(a.mask.scratchTexture),a.mask.gl.deleteFramebuffer(a.mask.scratchFramebuffer),X.delete(c))),a=null});let{fn:M,historyParams:W}=Ae(n),q=n?"_sampleFaceMask(pos, framesAgo)":"texture(u_faceMask, pos)",ee=Array.from({length:oe-1},(s,E)=>`step(${2**(E+1)}.0, faceBitF)`).join(" + "),J=r.maxFaces<=oe?`uint faceBits = (uint(mask.b * ${G}.0 + 0.5) << 8) | uint(mask.g * ${G}.0 + 0.5);
	uint faceBit = faceBits & (~faceBits + 1u);
	float faceBitF = float(faceBit);
	float hasFace = sign(faceBitF);
	float faceIndex = ${ee} - (1.0 - hasFace);`:`float faceIndex = float(int(uint(mask.b * ${G}.0 + 0.5)) - 1);`,m=(s,...E)=>M("vec2",`${s}At`,"vec2 pos",`vec4 mask = ${q};
	${J}
	uint bits = uint(mask.r * ${G}.0 + 0.5);
	float hit = sign(float(bits & ${E.reduce((F,D)=>F|pe[D],0)}u));
	return vec2(hit, mix(-1.0, faceIndex, hit));`),b=(s,E,F)=>M("vec2",`${s}At`,"vec2 pos",`vec2 left = ${E}(pos${W});
	vec2 right = ${F}(pos${W});
	return mix(right, left, left.x);`),V=s=>s.map(E=>M("float",`in${E[0].toUpperCase()+E.slice(1)}`,"vec2 pos",`vec2 a = ${E}At(pos${W}); return step(0.0, a.y) * a.x;`)).join(`
`);d(`
uniform int u_maxFaces;
uniform int u_nFaces;
uniform highp sampler2D${n?"Array":""} u_faceLandmarksTex;${n?`
uniform int u_faceLandmarksTexFrameOffset;`:""}
uniform mediump sampler2D${n?"Array":""} u_faceMask;${n?`
uniform int u_faceMaskFrameOffset;`:""}

#define FACE_LANDMARK_L_EYE_CENTER ${Re}
#define FACE_LANDMARK_R_EYE_CENTER ${ge}
#define FACE_LANDMARK_NOSE_TIP ${De}
#define FACE_LANDMARK_FACE_CENTER ${be}
#define FACE_LANDMARK_MOUTH_CENTER ${se}

${M("int","nFacesAt","",n?`
	int layer = (u_faceLandmarksTexFrameOffset - framesAgo + ${n+1}) % ${n+1};
	return int(texelFetch(u_faceLandmarksTex, ivec3(0, 0, layer), 0).r + 0.5);`:`
	return int(texelFetch(u_faceLandmarksTex, ivec2(0, 0), 0).r + 0.5);`)}
${M("vec4","faceLandmark","int faceIndex, int landmarkIndex",`int i = ${k} + faceIndex * ${h} + landmarkIndex;
	int x = i % ${B};
	int y = i / ${B};${n?`
	int layer = (u_faceLandmarksTexFrameOffset - framesAgo + ${n+1}) % ${n+1};
	return texelFetch(u_faceLandmarksTex, ivec3(x, y, layer), 0);`:`
	return texelFetch(u_faceLandmarksTex, ivec2(x, y), 0);`}`)}
${n?`
vec4 _sampleFaceMask(vec2 pos, int framesAgo) {
	int layer = (u_faceMaskFrameOffset - framesAgo + ${n+1}) % ${n+1};
	return texture(u_faceMask, vec3(pos, float(layer)));
}
`:""}
${m("leftEyebrow","LEFT_EYEBROW")}
${m("rightEyebrow","RIGHT_EYEBROW")}
${m("leftEye","LEFT_EYE")}
${m("rightEye","RIGHT_EYE")}
${m("lips","MOUTH")}
${m("mouth","MOUTH","INNER_MOUTH")}
${m("innerMouth","INNER_MOUTH")}
${m("faceOval","OVAL")}
${M("vec2","faceAt","vec2 pos",`vec4 mask = ${q};
	${J}
	return vec2(step(0.0, faceIndex), faceIndex);`)}
${b("eye","leftEyeAt","rightEyeAt")}
${b("eyebrow","leftEyebrowAt","rightEyebrowAt")}
${V(["eyebrow","eye","mouth","innerMouth","lips","face"])}`)}}var je=ze;
//# sourceMappingURL=face.js.map