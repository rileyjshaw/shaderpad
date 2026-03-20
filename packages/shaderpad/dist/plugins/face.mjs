import{b as te,c as le,d as ne,e as Ee,f as fe}from"../chunk-VMNWRREI.mjs";var me=`#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
	v_uv = a_pos;
	gl_Position = vec4(a_pos * 2.0 - 1.0, 0.0, 1.0);
}`,Re=`#version 300 es
precision mediump float;
uniform vec4 u_color;
out vec4 outColor;
void main() { outColor = u_color; }`,be=`#version 300 es
precision mediump float;
in vec2 v_uv;
uniform sampler2D u_texture;
out vec4 outColor;
void main() { outColor = texture(u_texture, v_uv); }`,ge=new Float32Array([0,0,1,0,0,1,0,1,1,0,1,1]),z=478,Le=2,L=z+Le,v=512,y=1,pe=Array.from({length:z},(n,e)=>e),_e=473,Ae=468,he=4,Te=z,ie=z+1,re=null,xe=["OVAL","LEFT_EYEBROW","RIGHT_EYEBROW","LEFT_EYE","RIGHT_EYE","MOUTH","INNER_MOUTH"],w=["FACE_0","FACE_1","FACE_2","FACE_3","FACE_4","FACE_5","FACE_6","FACE_7"],oe=["FACE_8","FACE_9","FACE_10","FACE_11","FACE_12","FACE_13","FACE_14","FACE_15"],H=255,ae=w.length+oe.length;function se(n){return Object.fromEntries(n.map((e,t)=>[e,1<<t]))}function ce(n){return Object.fromEntries(Object.entries(n).map(([e,t])=>[e,t/H]))}var Fe=se(xe),Me=se(w),Ce=se(oe),U=ce(Fe),Ne=ce(Me),ke=ce(Ce),Oe={modelPath:"https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",maxFaces:1,minFaceDetectionConfidence:.5,minFacePresenceConfidence:.5,minTrackingConfidence:.5,outputFaceBlendshapes:!1,outputFacialTransformationMatrixes:!1};function ye(n){let e=[];for(let t=1;t<n.length-1;++t)e.push(n[0],n[t],n[t+1]);return e}function A(n){let e=new Array(n.length+1);e[0]=n[0].start;for(let t=0;t<n.length;++t)e[t+1]=n[t].end;return e}function P(n,e){let t=[],i=Math.min(n.length,e.length);for(let a=0;a<i-1;++a)t.push(n[a],e[a],e[a+1],n[a],e[a+1],n[a+1]);return t}var g=null;function De(n){if(!g){let e=n.FACE_LANDMARKS_TESSELATION,t=n.FACE_LANDMARKS_LEFT_EYEBROW,i=A(t.slice(0,4)),a=A(t.slice(4,8)),u=n.FACE_LANDMARKS_RIGHT_EYEBROW,T=A(u.slice(0,4)),o=A(u.slice(4,8)),E=n.FACE_LANDMARKS_LEFT_EYE,m=A(E.slice(0,8)),d=A(E.slice(8,16)),c=n.FACE_LANDMARKS_RIGHT_EYE,h=A(c.slice(0,8)),p=A(c.slice(8,16)),R=n.FACE_LANDMARKS_LIPS,x=A(R.slice(0,10)),r=A(R.slice(10,20)),b=A(R.slice(20,30)),D=A(R.slice(30,40)),Y=[...m,...d.slice(1,-1)],Q=[...h,...p.slice(1,-1)];re=[...b,...D.slice(1,-1)];let I=new Int16Array(L).fill(-1);for(let l of Y)I[l]=_e;for(let l of Q)I[l]=Ae;for(let l of re)I[l]=ie;let G=l=>{let F=I[l];return F>=0?F:l},S=[];for(let l=0;l<e.length-2;l+=3){let F=G(e[l].start),V=G(e[l+1].start),s=G(e[l+2].start);F!==V&&F!==s&&V!==s&&S.push(F,V,s)}let $=P(i,a),j=P(T,o),M=P(m,d),W=P(h,p),q=[...P(x,b),...P(r,D)],Z=P(b,D),J=A(n.FACE_LANDMARKS_FACE_OVAL).slice(0,-1);g=Object.fromEntries(Object.entries({LEFT_EYEBROW:$,RIGHT_EYEBROW:j,LEFT_EYE:M,RIGHT_EYE:W,MOUTH:q,INNER_MOUTH:Z,TESSELATION:S,OVAL:ye(J)}).map(([l,F])=>[l,{indices:F,vertices:new Float32Array(F.length*2)}]))}}var X=new Map;function de(n,e,t){let i=n.createShader(n.VERTEX_SHADER);n.shaderSource(i,e),n.compileShader(i);let a=n.createShader(n.FRAGMENT_SHADER);n.shaderSource(a,t),n.compileShader(a);let u=n.createProgram();return n.attachShader(u,i),n.attachShader(u,a),n.linkProgram(u),n.deleteShader(i),n.deleteShader(a),u}function Ie(n){let e=n.getContext("webgl2",{antialias:!1,preserveDrawingBuffer:!0}),t=de(e,me,Re),i=de(e,me,be),a=e.createBuffer(),u=e.getAttribLocation(t,"a_pos"),T=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,T),e.bufferData(e.ARRAY_BUFFER,ge,e.STATIC_DRAW);let o=e.getAttribLocation(i,"a_pos"),E=e.getUniformLocation(t,"u_color"),m=e.getUniformLocation(i,"u_texture"),d=e.createTexture();e.bindTexture(e.TEXTURE_2D,d),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,null);let c=e.createFramebuffer();return e.bindFramebuffer(e.FRAMEBUFFER,c),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,d,0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.useProgram(i),e.uniform1i(m,0),e.colorMask(!0,!0,!0,!1),{canvas:n,gl:e,regionProgram:t,blitProgram:i,regionPositionBuffer:a,quadBuffer:T,regionPositionLocation:u,blitPositionLocation:o,colorLocation:E,textureLocation:m,scratchTexture:d,scratchFramebuffer:c}}function Se(n,e,t){let{gl:i,canvas:a,scratchTexture:u}=n;a.width===e&&a.height===t||(a.width=e,a.height=t,i.bindTexture(i.TEXTURE_2D,u),i.texImage2D(i.TEXTURE_2D,0,i.RGBA,e,t,0,i.RGBA,i.UNSIGNED_BYTE,null))}function k(n,e,t,i,a,u,T){let{gl:o,regionProgram:E,regionPositionBuffer:m,regionPositionLocation:d,colorLocation:c,scratchFramebuffer:h}=n,p=y+i*L,{indices:R,vertices:x}=t;o.bindFramebuffer(o.FRAMEBUFFER,h),o.viewport(0,0,n.canvas.width,n.canvas.height),o.clearColor(0,0,0,0),o.clear(o.COLOR_BUFFER_BIT),o.useProgram(E),o.bindBuffer(o.ARRAY_BUFFER,m),o.enableVertexAttribArray(d),o.vertexAttribPointer(d,2,o.FLOAT,!1,0,0),o.enable(o.BLEND),o.blendEquation(o.MAX),o.blendFunc(o.ONE,o.ONE);for(let r=0;r<R.length;++r){let b=(p+R[r])*4;x[r*2]=e[b],x[r*2+1]=e[b+1]}o.bufferData(o.ARRAY_BUFFER,x,o.DYNAMIC_DRAW),o.uniform4f(c,a,u,T,1),o.drawArrays(o.TRIANGLES,0,R.length)}function O(n){let{gl:e,blitProgram:t,quadBuffer:i,blitPositionLocation:a,scratchTexture:u}=n;e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,n.canvas.width,n.canvas.height),e.useProgram(t),e.bindBuffer(e.ARRAY_BUFFER,i),e.enableVertexAttribArray(a),e.vertexAttribPointer(a,2,e.FLOAT,!1,0,0),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,u),e.enable(e.BLEND),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ONE),e.drawArrays(e.TRIANGLES,0,6)}function Be(n,e){let t=n.landmarks.data,i=e.length;t[0]=i;for(let a=0;a<i;++a){let u=e[a];for(let E=0;E<z;++E){let m=u[E],d=(y+a*L+E)*4;t[d]=m.x,t[d+1]=1-m.y,t[d+2]=m.z??0,t[d+3]=m.visibility??1}let T=ne(t,a,pe,L,y);t.set(T,(y+a*L+Te)*4);let o=ne(t,a,re,L,1);t.set(o,(y+a*L+ie)*4)}n.state.nFaces=i}function ve(n,e,t){let{mask:i,maxFaces:a,landmarks:u,state:{nFaces:T}}=n,{gl:o,canvas:E}=i,{data:m}=u;if(Se(i,e,t),o.bindFramebuffer(o.FRAMEBUFFER,null),o.viewport(0,0,E.width,E.height),o.clearColor(0,0,0,0),o.clear(o.COLOR_BUFFER_BIT),!g)return;let d=a<=ae;for(let c=0;c<T;++c){let h=d&&c<w.length?Ne[w[c]]:0,p=d?c<w.length?0:ke[oe[c-w.length]]:(c+1)/H;k(i,m,g.TESSELATION,c,0,h,p),O(i),k(i,m,g.OVAL,c,U.OVAL,0,0),O(i),k(i,m,g.LEFT_EYEBROW,c,U.LEFT_EYEBROW,0,0),O(i),k(i,m,g.RIGHT_EYEBROW,c,U.RIGHT_EYEBROW,0,0),O(i),k(i,m,g.LEFT_EYE,c,U.LEFT_EYE,0,0),O(i),k(i,m,g.RIGHT_EYE,c,U.RIGHT_EYE,0,0),O(i),k(i,m,g.MOUTH,c,U.MOUTH,0,0),O(i),k(i,m,g.INNER_MOUTH,c,U.INNER_MOUTH,0,0),O(i)}}function Ue(n){let{textureName:e,options:{history:t,...i}={}}=n,a={...Oe,...i},u=le({...a,textureName:e}),T=a.maxFaces*L+y,o=Math.ceil(T/v);return function(E,m){let{injectGLSL:d,emitHook:c,updateTexturesInternal:h}=m,p=X.get(u),R=p?.landmarks.data??new Float32Array(v*o*4),x=p?.mask.canvas??new OffscreenCanvas(1,1),r=null,b=!1,D=!1;function Y(s){if(!r)return;let f=r.state.nFaces,_=f*L+y,B=Math.ceil(_/v),C=s;typeof C>"u"&&$.length>0&&(C=$,$=[]),h({u_faceLandmarksTex:{data:r.landmarks.data,width:v,height:B,isPartial:!0},u_faceMask:r.mask.canvas},t?{skipHistoryWrite:D,historyWriteIndex:C}:void 0),E.updateUniforms({u_nFaces:f}),c("face:result",r.state.result)}async function Q(){if(X.has(u))r=X.get(u);else{let[s,{FaceLandmarker:f}]=await Promise.all([Ee(),import("@mediapipe/tasks-vision")]);if(b)return;let _=await f.createFromOptions(s,{baseOptions:{modelAssetPath:a.modelPath,delegate:"GPU"},runningMode:"VIDEO",numFaces:a.maxFaces,minFaceDetectionConfidence:a.minFaceDetectionConfidence,minFacePresenceConfidence:a.minFacePresenceConfidence,minTrackingConfidence:a.minTrackingConfidence,outputFaceBlendshapes:a.outputFaceBlendshapes,outputFacialTransformationMatrixes:a.outputFacialTransformationMatrixes});if(b){_.close();return}r={landmarker:_,mask:Ie(x),subscribers:new Map,maxFaces:a.maxFaces,state:{nCalls:0,runningMode:"VIDEO",source:null,videoTime:-1,resultTimestamp:0,result:null,pending:Promise.resolve(),nFaces:0},landmarks:{data:R,textureHeight:o}},De(f),X.set(u,r)}r.subscribers.set(Y,!1)}let I=Q();async function G(s){let f=performance.now();if(await I,!r)return;let _=++r.state.nCalls;r.state.pending=r.state.pending.then(async()=>{if(!r||_!==r.state.nCalls)return;let B=s instanceof HTMLVideoElement?"VIDEO":"IMAGE";r.state.runningMode!==B&&(r.state.runningMode=B,await r.landmarker.setOptions({runningMode:B}));let C=!1;if(s!==r.state.source?(r.state.source=s,r.state.videoTime=-1,C=!0):s instanceof HTMLVideoElement?s.currentTime!==r.state.videoTime&&(r.state.videoTime=s.currentTime,C=!0):s instanceof HTMLImageElement||f-r.state.resultTimestamp>2&&(C=!0),C){let N,K,ee;if(s instanceof HTMLVideoElement){if(s.videoWidth===0||s.videoHeight===0||s.readyState<2)return;K=s.videoWidth,ee=s.videoHeight,N=r.landmarker.detectForVideo(s,f)}else{if(s.width===0||s.height===0)return;K=s.width,ee=s.height,N=r.landmarker.detect(s)}if(N){r.state.resultTimestamp=f,r.state.result=N,Be(r,N.faceLandmarks),ve(r,K,ee);for(let ue of r.subscribers.keys())ue(),r.subscribers.set(ue,!0)}}else if(r.state.result)for(let[N,K]of r.subscribers.entries())K||(N(),r.subscribers.set(N,!0))}),await r.state.pending}E.on("_init",()=>{E.initializeUniform("u_maxFaces","int",a.maxFaces),E.initializeUniform("u_nFaces","int",0),E.initializeTexture("u_faceLandmarksTex",{data:R,width:v,height:o},{internalFormat:"RGBA32F",type:"FLOAT",minFilter:"NEAREST",magFilter:"NEAREST",history:t}),E.initializeTexture("u_faceMask",x,{minFilter:"NEAREST",magFilter:"NEAREST",history:t}),I.then(()=>{b||!r||c("face:ready")})});let S=0,$=[],j=()=>{t&&(Y(S),$.push(S),S=(S+1)%(t+1))};E.on("initializeTexture",(s,f)=>{s===e&&te(f)&&(j(),G(f))}),E.on("updateTextures",(s,f)=>{let _=s[e];te(_)&&(D=f?.skipHistoryWrite??!1,D||j(),G(_))}),E.on("destroy",()=>{b=!0,r&&(r.subscribers.delete(Y),r.subscribers.size===0&&(r.landmarker.close(),r.mask.gl.deleteProgram(r.mask.regionProgram),r.mask.gl.deleteProgram(r.mask.blitProgram),r.mask.gl.deleteBuffer(r.mask.regionPositionBuffer),r.mask.gl.deleteBuffer(r.mask.quadBuffer),r.mask.gl.deleteTexture(r.mask.scratchTexture),r.mask.gl.deleteFramebuffer(r.mask.scratchFramebuffer),X.delete(u))),r=null});let{fn:M,historyParams:W}=fe(t),q=t?"_sampleFaceMask(pos, framesAgo)":"texture(u_faceMask, pos)",Z=Array.from({length:ae-1},(s,f)=>`step(${2**(f+1)}.0, faceBitF)`).join(" + "),J=a.maxFaces<=ae?`uint faceBits = (uint(mask.b * ${H}.0 + 0.5) << 8) | uint(mask.g * ${H}.0 + 0.5);
	uint faceBit = faceBits & (~faceBits + 1u);
	float faceBitF = float(faceBit);
	float hasFace = sign(faceBitF);
	float faceIndex = ${Z} - (1.0 - hasFace);`:`float faceIndex = float(int(uint(mask.b * ${H}.0 + 0.5)) - 1);`,l=(s,...f)=>M("vec2",`${s}At`,"vec2 pos",`vec4 mask = ${q};
	${J}
	uint bits = uint(mask.r * ${H}.0 + 0.5);
	float hit = sign(float(bits & ${f.reduce((_,B)=>_|Fe[B],0)}u));
	return vec2(hit, mix(-1.0, faceIndex, hit));`),F=(s,f,_)=>M("vec2",`${s}At`,"vec2 pos",`vec2 left = ${f}(pos${W});
	vec2 right = ${_}(pos${W});
	return mix(right, left, left.x);`),V=s=>s.map(f=>M("float",`in${f[0].toUpperCase()+f.slice(1)}`,"vec2 pos",`vec2 a = ${f}At(pos${W}); return step(0.0, a.y) * a.x;`)).join(`
`);d(`
uniform int u_maxFaces;
uniform int u_nFaces;
uniform highp sampler2D${t?"Array":""} u_faceLandmarksTex;${t?`
uniform int u_faceLandmarksTexFrameOffset;`:""}
uniform mediump sampler2D${t?"Array":""} u_faceMask;${t?`
uniform int u_faceMaskFrameOffset;`:""}

#define FACE_LANDMARK_L_EYE_CENTER ${_e}
#define FACE_LANDMARK_R_EYE_CENTER ${Ae}
#define FACE_LANDMARK_NOSE_TIP ${he}
#define FACE_LANDMARK_FACE_CENTER ${Te}
#define FACE_LANDMARK_MOUTH_CENTER ${ie}

${M("int","nFacesAt","",t?`
	int layer = (u_faceLandmarksTexFrameOffset - framesAgo + ${t+1}) % ${t+1};
	return int(texelFetch(u_faceLandmarksTex, ivec3(0, 0, layer), 0).r + 0.5);`:`
	return int(texelFetch(u_faceLandmarksTex, ivec2(0, 0), 0).r + 0.5);`)}
${M("vec4","faceLandmark","int faceIndex, int landmarkIndex",`int i = ${y} + faceIndex * ${L} + landmarkIndex;
	int x = i % ${v};
	int y = i / ${v};${t?`
	int layer = (u_faceLandmarksTexFrameOffset - framesAgo + ${t+1}) % ${t+1};
	return texelFetch(u_faceLandmarksTex, ivec3(x, y, layer), 0);`:`
	return texelFetch(u_faceLandmarksTex, ivec2(x, y), 0);`}`)}
${t?`
vec4 _sampleFaceMask(vec2 pos, int framesAgo) {
	int layer = (u_faceMaskFrameOffset - framesAgo + ${t+1}) % ${t+1};
	return texture(u_faceMask, vec3(pos, float(layer)));
}
`:""}
${l("leftEyebrow","LEFT_EYEBROW")}
${l("rightEyebrow","RIGHT_EYEBROW")}
${l("leftEye","LEFT_EYE")}
${l("rightEye","RIGHT_EYE")}
${l("lips","MOUTH")}
${l("mouth","MOUTH","INNER_MOUTH")}
${l("innerMouth","INNER_MOUTH")}
${l("faceOval","OVAL")}
${M("vec2","faceAt","vec2 pos",`vec4 mask = ${q};
	${J}
	return vec2(step(0.0, faceIndex), faceIndex);`)}
${F("eye","leftEyeAt","rightEyeAt")}
${F("eyebrow","leftEyebrowAt","rightEyebrowAt")}
${V(["eyebrow","eye","mouth","innerMouth","lips","face"])}`)}}var $e=Ue;export{$e as default};
//# sourceMappingURL=face.mjs.map