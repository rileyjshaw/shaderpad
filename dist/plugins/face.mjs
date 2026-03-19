import{b as X,c as oe,d as K,e as se,f as ce}from"../chunk-VMNWRREI.mjs";var Ee=`#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
	v_uv = a_pos;
	gl_Position = vec4(a_pos * 2.0 - 1.0, 0.0, 1.0);
}`,ge=`#version 300 es
precision mediump float;
uniform vec4 u_color;
out vec4 outColor;
void main() { outColor = u_color; }`,be=`#version 300 es
precision mediump float;
in vec2 v_uv;
uniform sampler2D u_texture;
out vec4 outColor;
void main() { outColor = texture(u_texture, v_uv); }`,Le=new Float32Array([0,0,1,0,0,1,0,1,1,0,1,1]),H=478,pe=2,F=H+pe,x=512,p=1,fe=[336,296,334,293,300,276,283,282,295,285],le=[362,398,384,385,386,387,388,466,263,249,390,373,374,380,381,382],me=[70,63,105,66,107,55,65,52,53,46],de=[33,246,161,160,159,158,157,173,133,155,154,153,145,144,163,7],_e=[61,185,40,39,37,0,267,269,270,409,291,375,321,405,314,17,84,181,91,146],j=[78,191,80,81,82,13,312,311,310,415,308,324,318,402,317,14,87,178,88,95],he=Array.from({length:H},(i,e)=>e),I={LEFT_EYEBROW:fe,LEFT_EYE:le,LEFT_EYE_CENTER:473,RIGHT_EYEBROW:me,RIGHT_EYE:de,RIGHT_EYE_CENTER:468,NOSE_TIP:4,MOUTH:_e,INNER_MOUTH:j,FACE_CENTER:H,MOUTH_CENTER:H+1},Ne=["OVAL","LEFT_EYEBROW","RIGHT_EYEBROW","LEFT_EYE","RIGHT_EYE","MOUTH","INNER_MOUTH"],D=["FACE_0","FACE_1","FACE_2","FACE_3","FACE_4","FACE_5","FACE_6","FACE_7"],q=["FACE_8","FACE_9","FACE_10","FACE_11","FACE_12","FACE_13","FACE_14","FACE_15"],v=255,z=D.length+q.length;function J(i){return Object.fromEntries(i.map((e,n)=>[e,1<<n]))}function Q(i){return Object.fromEntries(Object.entries(i).map(([e,n])=>[e,n/v]))}var Te=J(Ne),xe=J(D),Ce=J(q),C=Q(Te),Me=Q(xe),Ie=Q(Ce),ke={modelPath:"https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",maxFaces:1,minFaceDetectionConfidence:.5,minFacePresenceConfidence:.5,minTrackingConfidence:.5,outputFaceBlendshapes:!1,outputFacialTransformationMatrixes:!1};function M(i){let e=[];for(let n=1;n<i.length-1;++n)e.push(i[0],i[n],i[n+1]);return e}var _=null;function Oe(i){if(!_){let e=i.FACE_LANDMARKS_TESSELATION,n=[];for(let a=0;a<e.length-2;a+=3)n.push(e[a].start,e[a+1].start,e[a+2].start);let r=i.FACE_LANDMARKS_FACE_OVAL.map(({start:a})=>a);_=Object.fromEntries(Object.entries({LEFT_EYEBROW:M(fe),RIGHT_EYEBROW:M(me),LEFT_EYE:M(le),RIGHT_EYE:M(de),MOUTH:M(_e),INNER_MOUTH:M(j),TESSELATION:n,OVAL:M(r)}).map(([a,c])=>[a,{indices:c,vertices:new Float32Array(c.length*2)}]))}}var P=new Map;function ue(i,e,n){let r=i.createShader(i.VERTEX_SHADER);i.shaderSource(r,e),i.compileShader(r);let a=i.createShader(i.FRAGMENT_SHADER);i.shaderSource(a,n),i.compileShader(a);let c=i.createProgram();return i.attachShader(c,r),i.attachShader(c,a),i.linkProgram(c),i.deleteShader(r),i.deleteShader(a),c}function Se(i){let e=i.getContext("webgl2",{antialias:!1,preserveDrawingBuffer:!0}),n=ue(e,Ee,ge),r=ue(e,Ee,be),a=e.createBuffer(),c=e.getAttribLocation(n,"a_pos"),T=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,T),e.bufferData(e.ARRAY_BUFFER,Le,e.STATIC_DRAW);let o=e.getAttribLocation(r,"a_pos"),f=e.getUniformLocation(n,"u_color"),l=e.getUniformLocation(r,"u_texture"),m=e.createTexture();e.bindTexture(e.TEXTURE_2D,m),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,null);let u=e.createFramebuffer();return e.bindFramebuffer(e.FRAMEBUFFER,u),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,m,0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.useProgram(r),e.uniform1i(l,0),e.colorMask(!0,!0,!0,!1),{canvas:i,gl:e,regionProgram:n,blitProgram:r,regionPositionBuffer:a,quadBuffer:T,regionPositionLocation:c,blitPositionLocation:o,colorLocation:f,textureLocation:l,scratchTexture:m,scratchFramebuffer:u}}function Be(i,e,n){let{gl:r,canvas:a,scratchTexture:c}=i;a.width===e&&a.height===n||(a.width=e,a.height=n,r.bindTexture(r.TEXTURE_2D,c),r.texImage2D(r.TEXTURE_2D,0,r.RGBA,e,n,0,r.RGBA,r.UNSIGNED_BYTE,null))}function b(i,e,n,r,a,c,T){let{gl:o,regionProgram:f,regionPositionBuffer:l,regionPositionLocation:m,colorLocation:u,scratchFramebuffer:U}=i,k=p+r*F,{indices:O,vertices:S}=n;o.bindFramebuffer(o.FRAMEBUFFER,U),o.viewport(0,0,i.canvas.width,i.canvas.height),o.clearColor(0,0,0,0),o.clear(o.COLOR_BUFFER_BIT),o.useProgram(f),o.bindBuffer(o.ARRAY_BUFFER,l),o.enableVertexAttribArray(m),o.vertexAttribPointer(m,2,o.FLOAT,!1,0,0),o.enable(o.BLEND),o.blendEquation(o.MAX),o.blendFunc(o.ONE,o.ONE);for(let t=0;t<O.length;++t){let h=(k+O[t])*4;S[t*2]=e[h],S[t*2+1]=e[h+1]}o.bufferData(o.ARRAY_BUFFER,S,o.DYNAMIC_DRAW),o.uniform4f(u,a,c,T,1),o.drawArrays(o.TRIANGLES,0,O.length)}function L(i){let{gl:e,blitProgram:n,quadBuffer:r,blitPositionLocation:a,scratchTexture:c}=i;e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,i.canvas.width,i.canvas.height),e.useProgram(n),e.bindBuffer(e.ARRAY_BUFFER,r),e.enableVertexAttribArray(a),e.vertexAttribPointer(a,2,e.FLOAT,!1,0,0),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,c),e.enable(e.BLEND),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ONE),e.drawArrays(e.TRIANGLES,0,6)}function De(i,e){let n=i.landmarks.data,r=e.length;n[0]=r;for(let a=0;a<r;++a){let c=e[a];for(let f=0;f<H;++f){let l=c[f],m=(p+a*F+f)*4;n[m]=l.x,n[m+1]=1-l.y,n[m+2]=l.z??0,n[m+3]=l.visibility??1}let T=K(n,a,he,F,p);n.set(T,(p+a*F+I.FACE_CENTER)*4);let o=K(n,a,j,F,1);n.set(o,(p+a*F+I.MOUTH_CENTER)*4)}i.state.nFaces=r}function ve(i,e,n){let{mask:r,maxFaces:a,landmarks:c,state:{nFaces:T}}=i,{gl:o,canvas:f}=r,{data:l}=c;if(Be(r,e,n),o.bindFramebuffer(o.FRAMEBUFFER,null),o.viewport(0,0,f.width,f.height),o.clearColor(0,0,0,0),o.clear(o.COLOR_BUFFER_BIT),!_)return;let m=a<=z;for(let u=0;u<T;++u){let U=m&&u<D.length?Me[D[u]]:0,k=m?u<D.length?0:Ie[q[u-D.length]]:(u+1)/v;b(r,l,_.TESSELATION,u,0,U,k),L(r),b(r,l,_.OVAL,u,C.OVAL,0,0),L(r),b(r,l,_.LEFT_EYEBROW,u,C.LEFT_EYEBROW,0,0),L(r),b(r,l,_.RIGHT_EYEBROW,u,C.RIGHT_EYEBROW,0,0),L(r),b(r,l,_.LEFT_EYE,u,C.LEFT_EYE,0,0),L(r),b(r,l,_.RIGHT_EYE,u,C.RIGHT_EYE,0,0),L(r),b(r,l,_.MOUTH,u,C.MOUTH,0,0),L(r),b(r,l,_.INNER_MOUTH,u,C.INNER_MOUTH,0,0),L(r)}}function Ue(i){let{textureName:e,options:{history:n,...r}={}}=i,a={...ke,...r},c=oe({...a,textureName:e}),T=a.maxFaces*F+p,o=Math.ceil(T/x);return function(f,l){let{injectGLSL:m,emitHook:u,updateTexturesInternal:U}=l,k=P.get(c),O=k?.landmarks.data??new Float32Array(x*o*4),S=k?.mask.canvas??new OffscreenCanvas(1,1),t=null,h=!1,Y=!1;function w(s){if(!t)return;let E=t.state.nFaces,d=E*F+p,N=Math.ceil(d/x),A=s;typeof A>"u"&&$.length>0&&(A=$,$=[]),U({u_faceLandmarksTex:{data:t.landmarks.data,width:x,height:N,isPartial:!0},u_faceMask:t.mask.canvas},n?{skipHistoryWrite:Y,historyWriteIndex:A}:void 0),f.updateUniforms({u_nFaces:E}),u("face:result",t.state.result)}async function Fe(){if(P.has(c))t=P.get(c);else{let[s,{FaceLandmarker:E}]=await Promise.all([se(),import("@mediapipe/tasks-vision")]);if(h)return;let d=await E.createFromOptions(s,{baseOptions:{modelAssetPath:a.modelPath,delegate:"GPU"},runningMode:"VIDEO",numFaces:a.maxFaces,minFaceDetectionConfidence:a.minFaceDetectionConfidence,minFacePresenceConfidence:a.minFacePresenceConfidence,minTrackingConfidence:a.minTrackingConfidence,outputFaceBlendshapes:a.outputFaceBlendshapes,outputFacialTransformationMatrixes:a.outputFacialTransformationMatrixes});if(h){d.close();return}t={landmarker:d,mask:Se(S),subscribers:new Map,maxFaces:a.maxFaces,state:{nCalls:0,runningMode:"VIDEO",source:null,videoTime:-1,resultTimestamp:0,result:null,pending:Promise.resolve(),nFaces:0},landmarks:{data:O,textureHeight:o}},Oe(E),P.set(c,t)}t.subscribers.set(w,!1)}let Z=Fe();async function ee(s){let E=performance.now();if(await Z,!t)return;let d=++t.state.nCalls;t.state.pending=t.state.pending.then(async()=>{if(!t||d!==t.state.nCalls)return;let N=s instanceof HTMLVideoElement?"VIDEO":"IMAGE";t.state.runningMode!==N&&(t.state.runningMode=N,await t.landmarker.setOptions({runningMode:N}));let A=!1;if(s!==t.state.source?(t.state.source=s,t.state.videoTime=-1,A=!0):s instanceof HTMLVideoElement?s.currentTime!==t.state.videoTime&&(t.state.videoTime=s.currentTime,A=!0):s instanceof HTMLImageElement||E-t.state.resultTimestamp>2&&(A=!0),A){let g,y,V;if(s instanceof HTMLVideoElement){if(s.videoWidth===0||s.videoHeight===0||s.readyState<2)return;y=s.videoWidth,V=s.videoHeight,g=t.landmarker.detectForVideo(s,E)}else{if(s.width===0||s.height===0)return;y=s.width,V=s.height,g=t.landmarker.detect(s)}if(g){t.state.resultTimestamp=E,t.state.result=g,De(t,g.faceLandmarks),ve(t,y,V);for(let ie of t.subscribers.keys())ie(),t.subscribers.set(ie,!0)}}else if(t.state.result)for(let[g,y]of t.subscribers.entries())y||(g(),t.subscribers.set(g,!0))}),await t.state.pending}f.on("_init",()=>{f.initializeUniform("u_maxFaces","int",a.maxFaces),f.initializeUniform("u_nFaces","int",0),f.initializeTexture("u_faceLandmarksTex",{data:O,width:x,height:o},{internalFormat:"RGBA32F",type:"FLOAT",minFilter:"NEAREST",magFilter:"NEAREST",history:n}),f.initializeTexture("u_faceMask",S,{minFilter:"NEAREST",magFilter:"NEAREST",history:n}),Z.then(()=>{h||!t||u("face:ready")})});let G=0,$=[],te=()=>{n&&(w(G),$.push(G),G=(G+1)%(n+1))};f.on("initializeTexture",(s,E)=>{s===e&&X(E)&&(te(),ee(E))}),f.on("updateTextures",(s,E)=>{let d=s[e];X(d)&&(Y=E?.skipHistoryWrite??!1,Y||te(),ee(d))}),f.on("destroy",()=>{h=!0,t&&(t.subscribers.delete(w),t.subscribers.size===0&&(t.landmarker.close(),t.mask.gl.deleteProgram(t.mask.regionProgram),t.mask.gl.deleteProgram(t.mask.blitProgram),t.mask.gl.deleteBuffer(t.mask.regionPositionBuffer),t.mask.gl.deleteBuffer(t.mask.quadBuffer),t.mask.gl.deleteTexture(t.mask.scratchTexture),t.mask.gl.deleteFramebuffer(t.mask.scratchFramebuffer),P.delete(c))),t=null});let{fn:B,historyParams:W}=ce(n),ne=n?"_sampleFaceMask(pos, framesAgo)":"texture(u_faceMask, pos)",Re=Array.from({length:z-1},(s,E)=>`step(${2**(E+1)}.0, faceBitF)`).join(" + "),ae=a.maxFaces<=z?`uint faceBits = (uint(mask.b * ${v}.0 + 0.5) << 8) | uint(mask.g * ${v}.0 + 0.5);
	uint faceBit = faceBits & (~faceBits + 1u);
	float faceBitF = float(faceBit);
	float hasFace = sign(faceBitF);
	float faceIndex = ${Re} - (1.0 - hasFace);`:`float faceIndex = float(int(uint(mask.b * ${v}.0 + 0.5)) - 1);`,R=(s,...E)=>B("vec2",`${s}At`,"vec2 pos",`vec4 mask = ${ne};
	${ae}
	uint bits = uint(mask.r * ${v}.0 + 0.5);
	float hit = sign(float(bits & ${E.reduce((d,N)=>d|Te[N],0)}u));
	return vec2(hit, mix(-1.0, faceIndex, hit));`),re=(s,E,d)=>B("vec2",`${s}At`,"vec2 pos",`vec2 left = ${E}(pos${W});
	vec2 right = ${d}(pos${W});
	return mix(right, left, left.x);`),Ae=s=>s.map(E=>B("float",`in${E[0].toUpperCase()+E.slice(1)}`,"vec2 pos",`vec2 a = ${E}At(pos${W}); return step(0.0, a.y) * a.x;`)).join(`
`);m(`
uniform int u_maxFaces;
uniform int u_nFaces;
uniform highp sampler2D${n?"Array":""} u_faceLandmarksTex;${n?`
uniform int u_faceLandmarksTexFrameOffset;`:""}
uniform mediump sampler2D${n?"Array":""} u_faceMask;${n?`
uniform int u_faceMaskFrameOffset;`:""}

#define FACE_LANDMARK_L_EYE_CENTER ${I.LEFT_EYE_CENTER}
#define FACE_LANDMARK_R_EYE_CENTER ${I.RIGHT_EYE_CENTER}
#define FACE_LANDMARK_NOSE_TIP ${I.NOSE_TIP}
#define FACE_LANDMARK_FACE_CENTER ${I.FACE_CENTER}
#define FACE_LANDMARK_MOUTH_CENTER ${I.MOUTH_CENTER}

${B("int","nFacesAt","",n?`
	int layer = (u_faceLandmarksTexFrameOffset - framesAgo + ${n+1}) % ${n+1};
	return int(texelFetch(u_faceLandmarksTex, ivec3(0, 0, layer), 0).r + 0.5);`:`
	return int(texelFetch(u_faceLandmarksTex, ivec2(0, 0), 0).r + 0.5);`)}
${B("vec4","faceLandmark","int faceIndex, int landmarkIndex",`int i = ${p} + faceIndex * ${F} + landmarkIndex;
	int x = i % ${x};
	int y = i / ${x};${n?`
	int layer = (u_faceLandmarksTexFrameOffset - framesAgo + ${n+1}) % ${n+1};
	return texelFetch(u_faceLandmarksTex, ivec3(x, y, layer), 0);`:`
	return texelFetch(u_faceLandmarksTex, ivec2(x, y), 0);`}`)}
${n?`
vec4 _sampleFaceMask(vec2 pos, int framesAgo) {
	int layer = (u_faceMaskFrameOffset - framesAgo + ${n+1}) % ${n+1};
	return texture(u_faceMask, vec3(pos, float(layer)));
}
`:""}
${R("leftEyebrow","LEFT_EYEBROW")}
${R("rightEyebrow","RIGHT_EYEBROW")}
${R("leftEye","LEFT_EYE")}
${R("rightEye","RIGHT_EYE")}
${R("lips","MOUTH")}
${R("mouth","MOUTH","INNER_MOUTH")}
${R("innerMouth","INNER_MOUTH")}
${R("faceOval","OVAL")}
${B("vec2","faceAt","vec2 pos",`vec4 mask = ${ne};
	${ae}
	return vec2(step(0.0, faceIndex), faceIndex);`)}
${re("eye","leftEyeAt","rightEyeAt")}
${re("eyebrow","leftEyebrowAt","rightEyebrowAt")}
${Ae(["eyebrow","eye","mouth","innerMouth","lips","face"])}`)}}var He=Ue;export{He as default};
//# sourceMappingURL=face.mjs.map