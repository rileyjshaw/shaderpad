"use strict";var he=Object.create;var j=Object.defineProperty;var xe=Object.getOwnPropertyDescriptor;var Me=Object.getOwnPropertyNames;var Ce=Object.getPrototypeOf,Ne=Object.prototype.hasOwnProperty;var Oe=(t,e)=>{for(var n in e)j(t,n,{get:e[n],enumerable:!0})},fe=(t,e,n,i)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of Me(e))!Ne.call(t,r)&&r!==n&&j(t,r,{get:()=>e[r],enumerable:!(i=xe(e,r))||i.enumerable});return t};var me=(t,e,n)=>(n=t!=null?he(Ce(t)):{},fe(e||!t||!t.__esModule?j(n,"default",{value:t,enumerable:!0}):n,t)),ye=t=>fe(j({},"__esModule",{value:!0}),t);var qe={};Oe(qe,{default:()=>je});module.exports=ye(qe);var Ze={data:new Uint8Array(4),width:1,height:1};function Q(t){return t instanceof HTMLVideoElement||t instanceof HTMLImageElement||t instanceof HTMLCanvasElement||t instanceof OffscreenCanvas}function Ee(t){return JSON.stringify(t,Object.keys(t).sort())}function ee(t,e,n,i,r=0){let s=1/0,E=-1/0,o=1/0,u=-1/0,l=0,d=0;for(let f of n){let g=(r+e*i+f)*4,T=t[g],F=t[g+1];s=Math.min(s,T),E=Math.max(E,T),o=Math.min(o,F),u=Math.max(u,F),l+=t[g+2],d+=t[g+3]}return[(s+E)/2,(o+u)/2,l/n.length,d/n.length]}var Z=null;function de(){return Z||(Z=import("@mediapipe/tasks-vision").then(({FilesetResolver:t})=>t.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm"))),Z}function _e(t){return{historyParams:t?", framesAgo":"",fn:t?(i,r,s,E)=>{let o=s.replace(/\w+ /g,""),u=s?`${s}, int framesAgo`:"int framesAgo",l=o?`${o}, 0`:"0";return`${i} ${r}(${u}) {
${E}
}
${i} ${r}(${s}) { return ${r}(${l}); }`}:(i,r,s,E)=>`${i} ${r}(${s}) {
${E}
}`}}var Ae=`#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
	v_uv = a_pos;
	gl_Position = vec4(a_pos * 2.0 - 1.0, 0.0, 1.0);
}`,Ie=`#version 300 es
precision mediump float;
uniform vec4 u_color;
out vec4 outColor;
void main() { outColor = u_color; }`,ke=`#version 300 es
precision mediump float;
in vec2 v_uv;
uniform sampler2D u_texture;
out vec4 outColor;
void main() { outColor = texture(u_texture, v_uv); }`,Se=new Float32Array([0,0,1,0,0,1,0,1,1,0,1,1]),K=478,ve=2,h=K+ve,D=512,I=1,De=Array.from({length:K},(t,e)=>e),Fe=473,Re=468,Be=4,ge=K,ae=K+1,ne=null,Ue=["OVAL","LEFT_EYEBROW","RIGHT_EYEBROW","LEFT_EYE","RIGHT_EYE","MOUTH","INNER_MOUTH"],G=["FACE_0","FACE_1","FACE_2","FACE_3","FACE_4","FACE_5","FACE_6","FACE_7"],ie=["FACE_8","FACE_9","FACE_10","FACE_11","FACE_12","FACE_13","FACE_14","FACE_15"],w=255,re=G.length+ie.length;function oe(t){return Object.fromEntries(t.map((e,n)=>[e,1<<n]))}function se(t){return Object.fromEntries(Object.entries(t).map(([e,n])=>[e,n/w]))}var be=oe(Ue),Pe=oe(G),$e=oe(ie),B=se(be),He=se(Pe),Ge=se($e),we={modelPath:"https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",maxFaces:1,minFaceDetectionConfidence:.5,minFacePresenceConfidence:.5,minTrackingConfidence:.5,outputFaceBlendshapes:!1,outputFacialTransformationMatrixes:!1};function te(t){let e=[];for(let n=1;n<t.length-1;++n)e.push(t[0],t[n],t[n+1]);return e}function p(t){let e=new Array(t.length+1);e[0]=t[0].start;for(let n=0;n<t.length;++n)e[n+1]=t[n].end;return e}function W(t,e){let n=[],i=Math.min(t.length,e.length);for(let r=0;r<i-1;++r)n.push(t[r],e[r],e[r+1],t[r],e[r+1],t[r+1]);return n}var L=null;function Ye(t){if(!L){let e=t.FACE_LANDMARKS_TESSELATION,n=p(t.FACE_LANDMARKS_LEFT_EYEBROW),i=p(t.FACE_LANDMARKS_RIGHT_EYEBROW),r=t.FACE_LANDMARKS_LEFT_EYE,s=t.FACE_LANDMARKS_RIGHT_EYE,E=t.FACE_LANDMARKS_LIPS,o=p(r.slice(0,8)),u=p(r.slice(8,16)),l=p(s.slice(0,8)),d=p(s.slice(8,16)),f=p(E.slice(0,10)),g=p(E.slice(10,20)),T=p(E.slice(20,30)),F=p(E.slice(30,40)),x=[...o,...u.slice(1,-1)],a=[...l,...d.slice(1,-1)];ne=[...T,...F.slice(1,-1)];let b=new Int16Array(h).fill(-1);for(let _ of x)b[_]=Fe;for(let _ of a)b[_]=Re;for(let _ of ne)b[_]=ae;let k=_=>{let A=b[_];return A>=0?A:_},U=[];for(let _=0;_<e.length-2;_+=3){let A=k(e[_].start),S=k(e[_+1].start),H=k(e[_+2].start);A!==S&&A!==H&&S!==H&&U.push(A,S,H)}let q=W(o,u),X=W(l,d),z=[...W(f,T),...W(g,F)],P=W(T,F),$=p(t.FACE_LANDMARKS_FACE_OVAL).slice(0,-1);L=Object.fromEntries(Object.entries({LEFT_EYEBROW:te(n),RIGHT_EYEBROW:te(i),LEFT_EYE:q,RIGHT_EYE:X,MOUTH:z,INNER_MOUTH:P,TESSELATION:U,OVAL:te($)}).map(([_,A])=>[_,{indices:A,vertices:new Float32Array(A.length*2)}]))}}var V=new Map;function Te(t,e,n){let i=t.createShader(t.VERTEX_SHADER);t.shaderSource(i,e),t.compileShader(i);let r=t.createShader(t.FRAGMENT_SHADER);t.shaderSource(r,n),t.compileShader(r);let s=t.createProgram();return t.attachShader(s,i),t.attachShader(s,r),t.linkProgram(s),t.deleteShader(i),t.deleteShader(r),s}function We(t){let e=t.getContext("webgl2",{antialias:!1,preserveDrawingBuffer:!0}),n=Te(e,Ae,Ie),i=Te(e,Ae,ke),r=e.createBuffer(),s=e.getAttribLocation(n,"a_pos"),E=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,E),e.bufferData(e.ARRAY_BUFFER,Se,e.STATIC_DRAW);let o=e.getAttribLocation(i,"a_pos"),u=e.getUniformLocation(n,"u_color"),l=e.getUniformLocation(i,"u_texture"),d=e.createTexture();e.bindTexture(e.TEXTURE_2D,d),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,null);let f=e.createFramebuffer();return e.bindFramebuffer(e.FRAMEBUFFER,f),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,d,0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.useProgram(i),e.uniform1i(l,0),e.colorMask(!0,!0,!0,!1),{canvas:t,gl:e,regionProgram:n,blitProgram:i,regionPositionBuffer:r,quadBuffer:E,regionPositionLocation:s,blitPositionLocation:o,colorLocation:u,textureLocation:l,scratchTexture:d,scratchFramebuffer:f}}function Ve(t,e,n){let{gl:i,canvas:r,scratchTexture:s}=t;r.width===e&&r.height===n||(r.width=e,r.height=n,i.bindTexture(i.TEXTURE_2D,s),i.texImage2D(i.TEXTURE_2D,0,i.RGBA,e,n,0,i.RGBA,i.UNSIGNED_BYTE,null))}function O(t,e,n,i,r,s,E){let{gl:o,regionProgram:u,regionPositionBuffer:l,regionPositionLocation:d,colorLocation:f,scratchFramebuffer:g}=t,T=I+i*h,{indices:F,vertices:x}=n;o.bindFramebuffer(o.FRAMEBUFFER,g),o.viewport(0,0,t.canvas.width,t.canvas.height),o.clearColor(0,0,0,0),o.clear(o.COLOR_BUFFER_BIT),o.useProgram(u),o.bindBuffer(o.ARRAY_BUFFER,l),o.enableVertexAttribArray(d),o.vertexAttribPointer(d,2,o.FLOAT,!1,0,0),o.enable(o.BLEND),o.blendEquation(o.MAX),o.blendFunc(o.ONE,o.ONE);for(let a=0;a<F.length;++a){let b=(T+F[a])*4;x[a*2]=e[b],x[a*2+1]=e[b+1]}o.bufferData(o.ARRAY_BUFFER,x,o.DYNAMIC_DRAW),o.uniform4f(f,r,s,E,1),o.drawArrays(o.TRIANGLES,0,F.length)}function y(t){let{gl:e,blitProgram:n,quadBuffer:i,blitPositionLocation:r,scratchTexture:s}=t;e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,t.canvas.width,t.canvas.height),e.useProgram(n),e.bindBuffer(e.ARRAY_BUFFER,i),e.enableVertexAttribArray(r),e.vertexAttribPointer(r,2,e.FLOAT,!1,0,0),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,s),e.enable(e.BLEND),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ONE),e.drawArrays(e.TRIANGLES,0,6)}function Ke(t,e){let n=t.landmarks.data,i=e.length;n[0]=i;for(let r=0;r<i;++r){let s=e[r];for(let u=0;u<K;++u){let l=s[u],d=(I+r*h+u)*4;n[d]=l.x,n[d+1]=1-l.y,n[d+2]=l.z??0,n[d+3]=l.visibility??1}let E=ee(n,r,De,h,I);n.set(E,(I+r*h+ge)*4);let o=ee(n,r,ne,h,1);n.set(o,(I+r*h+ae)*4)}t.state.nFaces=i}function Xe(t,e,n){let{mask:i,maxFaces:r,landmarks:s,state:{nFaces:E}}=t,{gl:o,canvas:u}=i,{data:l}=s;if(Ve(i,e,n),o.bindFramebuffer(o.FRAMEBUFFER,null),o.viewport(0,0,u.width,u.height),o.clearColor(0,0,0,0),o.clear(o.COLOR_BUFFER_BIT),!L)return;let d=r<=re;for(let f=0;f<E;++f){let g=d&&f<G.length?He[G[f]]:0,T=d?f<G.length?0:Ge[ie[f-G.length]]:(f+1)/w;O(i,l,L.TESSELATION,f,0,g,T),y(i),O(i,l,L.OVAL,f,B.OVAL,0,0),y(i),O(i,l,L.LEFT_EYEBROW,f,B.LEFT_EYEBROW,0,0),y(i),O(i,l,L.RIGHT_EYEBROW,f,B.RIGHT_EYEBROW,0,0),y(i),O(i,l,L.LEFT_EYE,f,B.LEFT_EYE,0,0),y(i),O(i,l,L.RIGHT_EYE,f,B.RIGHT_EYE,0,0),y(i),O(i,l,L.MOUTH,f,B.MOUTH,0,0),y(i),O(i,l,L.INNER_MOUTH,f,B.INNER_MOUTH,0,0),y(i)}}function ze(t){let{textureName:e,options:{history:n,...i}={}}=t,r={...we,...i},s=Ee({...r,textureName:e}),E=r.maxFaces*h+I,o=Math.ceil(E/D);return function(u,l){let{injectGLSL:d,emitHook:f,updateTexturesInternal:g}=l,T=V.get(s),F=T?.landmarks.data??new Float32Array(D*o*4),x=T?.mask.canvas??new OffscreenCanvas(1,1),a=null,b=!1,k=!1;function U(c){if(!a)return;let m=a.state.nFaces,R=m*h+I,v=Math.ceil(R/D),C=c;typeof C>"u"&&$.length>0&&(C=$,$=[]),g({u_faceLandmarksTex:{data:a.landmarks.data,width:D,height:v,isPartial:!0},u_faceMask:a.mask.canvas},n?{skipHistoryWrite:k,historyWriteIndex:C}:void 0),u.updateUniforms({u_nFaces:m}),f("face:result",a.state.result)}async function q(){if(V.has(s))a=V.get(s);else{let[c,{FaceLandmarker:m}]=await Promise.all([de(),import("@mediapipe/tasks-vision")]);if(b)return;let R=await m.createFromOptions(c,{baseOptions:{modelAssetPath:r.modelPath,delegate:"GPU"},runningMode:"VIDEO",numFaces:r.maxFaces,minFaceDetectionConfidence:r.minFaceDetectionConfidence,minFacePresenceConfidence:r.minFacePresenceConfidence,minTrackingConfidence:r.minTrackingConfidence,outputFaceBlendshapes:r.outputFaceBlendshapes,outputFacialTransformationMatrixes:r.outputFacialTransformationMatrixes});if(b){R.close();return}a={landmarker:R,mask:We(x),subscribers:new Map,maxFaces:r.maxFaces,state:{nCalls:0,runningMode:"VIDEO",source:null,videoTime:-1,resultTimestamp:0,result:null,pending:Promise.resolve(),nFaces:0},landmarks:{data:F,textureHeight:o}},Ye(m),V.set(s,a)}a.subscribers.set(U,!1)}let X=q();async function z(c){let m=performance.now();if(await X,!a)return;let R=++a.state.nCalls;a.state.pending=a.state.pending.then(async()=>{if(!a||R!==a.state.nCalls)return;let v=c instanceof HTMLVideoElement?"VIDEO":"IMAGE";a.state.runningMode!==v&&(a.state.runningMode=v,await a.landmarker.setOptions({runningMode:v}));let C=!1;if(c!==a.state.source?(a.state.source=c,a.state.videoTime=-1,C=!0):c instanceof HTMLVideoElement?c.currentTime!==a.state.videoTime&&(a.state.videoTime=c.currentTime,C=!0):c instanceof HTMLImageElement||m-a.state.resultTimestamp>2&&(C=!0),C){let N,Y,J;if(c instanceof HTMLVideoElement){if(c.videoWidth===0||c.videoHeight===0||c.readyState<2)return;Y=c.videoWidth,J=c.videoHeight,N=a.landmarker.detectForVideo(c,m)}else{if(c.width===0||c.height===0)return;Y=c.width,J=c.height,N=a.landmarker.detect(c)}if(N){a.state.resultTimestamp=m,a.state.result=N,Ke(a,N.faceLandmarks),Xe(a,Y,J);for(let le of a.subscribers.keys())le(),a.subscribers.set(le,!0)}}else if(a.state.result)for(let[N,Y]of a.subscribers.entries())Y||(N(),a.subscribers.set(N,!0))}),await a.state.pending}u.on("_init",()=>{u.initializeUniform("u_maxFaces","int",r.maxFaces),u.initializeUniform("u_nFaces","int",0),u.initializeTexture("u_faceLandmarksTex",{data:F,width:D,height:o},{internalFormat:"RGBA32F",type:"FLOAT",minFilter:"NEAREST",magFilter:"NEAREST",history:n}),u.initializeTexture("u_faceMask",x,{minFilter:"NEAREST",magFilter:"NEAREST",history:n}),X.then(()=>{b||!a||f("face:ready")})});let P=0,$=[],_=()=>{n&&(U(P),$.push(P),P=(P+1)%(n+1))};u.on("initializeTexture",(c,m)=>{c===e&&Q(m)&&(_(),z(m))}),u.on("updateTextures",(c,m)=>{let R=c[e];Q(R)&&(k=m?.skipHistoryWrite??!1,k||_(),z(R))}),u.on("destroy",()=>{b=!0,a&&(a.subscribers.delete(U),a.subscribers.size===0&&(a.landmarker.close(),a.mask.gl.deleteProgram(a.mask.regionProgram),a.mask.gl.deleteProgram(a.mask.blitProgram),a.mask.gl.deleteBuffer(a.mask.regionPositionBuffer),a.mask.gl.deleteBuffer(a.mask.quadBuffer),a.mask.gl.deleteTexture(a.mask.scratchTexture),a.mask.gl.deleteFramebuffer(a.mask.scratchFramebuffer),V.delete(s))),a=null});let{fn:A,historyParams:S}=_e(n),H=n?"_sampleFaceMask(pos, framesAgo)":"texture(u_faceMask, pos)",pe=Array.from({length:re-1},(c,m)=>`step(${2**(m+1)}.0, faceBitF)`).join(" + "),ce=r.maxFaces<=re?`uint faceBits = (uint(mask.b * ${w}.0 + 0.5) << 8) | uint(mask.g * ${w}.0 + 0.5);
	uint faceBit = faceBits & (~faceBits + 1u);
	float faceBitF = float(faceBit);
	float hasFace = sign(faceBitF);
	float faceIndex = ${pe} - (1.0 - hasFace);`:`float faceIndex = float(int(uint(mask.b * ${w}.0 + 0.5)) - 1);`,M=(c,...m)=>A("vec2",`${c}At`,"vec2 pos",`vec4 mask = ${H};
	${ce}
	uint bits = uint(mask.r * ${w}.0 + 0.5);
	float hit = sign(float(bits & ${m.reduce((R,v)=>R|be[v],0)}u));
	return vec2(hit, mix(-1.0, faceIndex, hit));`),ue=(c,m,R)=>A("vec2",`${c}At`,"vec2 pos",`vec2 left = ${m}(pos${S});
	vec2 right = ${R}(pos${S});
	return mix(right, left, left.x);`),Le=c=>c.map(m=>A("float",`in${m[0].toUpperCase()+m.slice(1)}`,"vec2 pos",`vec2 a = ${m}At(pos${S}); return step(0.0, a.y) * a.x;`)).join(`
`);d(`
uniform int u_maxFaces;
uniform int u_nFaces;
uniform highp sampler2D${n?"Array":""} u_faceLandmarksTex;${n?`
uniform int u_faceLandmarksTexFrameOffset;`:""}
uniform mediump sampler2D${n?"Array":""} u_faceMask;${n?`
uniform int u_faceMaskFrameOffset;`:""}

#define FACE_LANDMARK_L_EYE_CENTER ${Fe}
#define FACE_LANDMARK_R_EYE_CENTER ${Re}
#define FACE_LANDMARK_NOSE_TIP ${Be}
#define FACE_LANDMARK_FACE_CENTER ${ge}
#define FACE_LANDMARK_MOUTH_CENTER ${ae}

${A("int","nFacesAt","",n?`
	int layer = (u_faceLandmarksTexFrameOffset - framesAgo + ${n+1}) % ${n+1};
	return int(texelFetch(u_faceLandmarksTex, ivec3(0, 0, layer), 0).r + 0.5);`:`
	return int(texelFetch(u_faceLandmarksTex, ivec2(0, 0), 0).r + 0.5);`)}
${A("vec4","faceLandmark","int faceIndex, int landmarkIndex",`int i = ${I} + faceIndex * ${h} + landmarkIndex;
	int x = i % ${D};
	int y = i / ${D};${n?`
	int layer = (u_faceLandmarksTexFrameOffset - framesAgo + ${n+1}) % ${n+1};
	return texelFetch(u_faceLandmarksTex, ivec3(x, y, layer), 0);`:`
	return texelFetch(u_faceLandmarksTex, ivec2(x, y), 0);`}`)}
${n?`
vec4 _sampleFaceMask(vec2 pos, int framesAgo) {
	int layer = (u_faceMaskFrameOffset - framesAgo + ${n+1}) % ${n+1};
	return texture(u_faceMask, vec3(pos, float(layer)));
}
`:""}
${M("leftEyebrow","LEFT_EYEBROW")}
${M("rightEyebrow","RIGHT_EYEBROW")}
${M("leftEye","LEFT_EYE")}
${M("rightEye","RIGHT_EYE")}
${M("lips","MOUTH")}
${M("mouth","MOUTH","INNER_MOUTH")}
${M("innerMouth","INNER_MOUTH")}
${M("faceOval","OVAL")}
${A("vec2","faceAt","vec2 pos",`vec4 mask = ${H};
	${ce}
	return vec2(step(0.0, faceIndex), faceIndex);`)}
${ue("eye","leftEyeAt","rightEyeAt")}
${ue("eyebrow","leftEyebrowAt","rightEyebrowAt")}
${Le(["eyebrow","eye","mouth","innerMouth","lips","face"])}`)}}var je=ze;
//# sourceMappingURL=face.js.map