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
void main() { outColor = texture(u_texture, v_uv); }`,Le=new Float32Array([0,0,1,0,0,1,0,1,1,0,1,1]),H=478,pe=2,R=H+pe,M=512,N=1,fe=[336,296,334,293,300,276,283,282,295,285],le=[362,398,384,385,386,387,388,466,263,249,390,373,374,380,381,382],me=[70,63,105,66,107,55,65,52,53,46],de=[33,246,161,160,159,158,157,173,133,155,154,153,145,144,163,7],_e=[61,185,40,39,37,0,267,269,270,409,291,375,321,405,314,17,84,181,91,146],j=[78,191,80,81,82,13,312,311,310,415,308,324,318,402,317,14,87,178,88,95],he=Array.from({length:H},(i,e)=>e),O={LEFT_EYEBROW:fe,LEFT_EYE:le,LEFT_EYE_CENTER:473,RIGHT_EYEBROW:me,RIGHT_EYE:de,RIGHT_EYE_CENTER:468,NOSE_TIP:4,MOUTH:_e,INNER_MOUTH:j,FACE_CENTER:H,MOUTH_CENTER:H+1},Ne=["OVAL","LEFT_EYEBROW","RIGHT_EYEBROW","LEFT_EYE","RIGHT_EYE","MOUTH","INNER_MOUTH"],v=["FACE_0","FACE_1","FACE_2","FACE_3","FACE_4","FACE_5","FACE_6","FACE_7"],q=["FACE_8","FACE_9","FACE_10","FACE_11","FACE_12","FACE_13","FACE_14","FACE_15"],U=255,z=v.length+q.length;function J(i){return Object.fromEntries(i.map((e,n)=>[e,1<<n]))}function Q(i){return Object.fromEntries(Object.entries(i).map(([e,n])=>[e,n/U]))}var Te=J(Ne),xe=J(v),Ce=J(q),I=Q(Te),Me=Q(xe),Ie=Q(Ce),ke={modelPath:"https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",maxFaces:1,minFaceDetectionConfidence:.5,minFacePresenceConfidence:.5,minTrackingConfidence:.5,outputFaceBlendshapes:!1,outputFacialTransformationMatrixes:!1};function k(i){let e=[];for(let n=1;n<i.length-1;++n)e.push(i[0],i[n],i[n+1]);return e}var _=null;function Oe(i){if(!_){let e=i.FACE_LANDMARKS_TESSELATION,n=[];for(let a=0;a<e.length-2;a+=3)n.push(e[a].start,e[a+1].start,e[a+2].start);let r=i.FACE_LANDMARKS_FACE_OVAL.map(({start:a})=>a);_=Object.fromEntries(Object.entries({LEFT_EYEBROW:k(fe),RIGHT_EYEBROW:k(me),LEFT_EYE:k(le),RIGHT_EYE:k(de),MOUTH:k(_e),INNER_MOUTH:k(j),TESSELATION:n,OVAL:k(r)}).map(([a,c])=>[a,{indices:c,vertices:new Float32Array(c.length*2)}]))}}var P=new Map;function ue(i,e,n){let r=i.createShader(i.VERTEX_SHADER);i.shaderSource(r,e),i.compileShader(r);let a=i.createShader(i.FRAGMENT_SHADER);i.shaderSource(a,n),i.compileShader(a);let c=i.createProgram();return i.attachShader(c,r),i.attachShader(c,a),i.linkProgram(c),i.deleteShader(r),i.deleteShader(a),c}function Se(i){let e=i.getContext("webgl2",{antialias:!1,preserveDrawingBuffer:!0}),n=ue(e,Ee,ge),r=ue(e,Ee,be),a=e.createBuffer(),c=e.getAttribLocation(n,"a_pos"),T=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,T),e.bufferData(e.ARRAY_BUFFER,Le,e.STATIC_DRAW);let o=e.getAttribLocation(r,"a_pos"),f=e.getUniformLocation(n,"u_color"),l=e.getUniformLocation(r,"u_texture"),m=e.createTexture();e.bindTexture(e.TEXTURE_2D,m),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,null);let u=e.createFramebuffer();return e.bindFramebuffer(e.FRAMEBUFFER,u),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,m,0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.useProgram(r),e.uniform1i(l,0),e.colorMask(!0,!0,!0,!1),{canvas:i,gl:e,regionProgram:n,blitProgram:r,regionPositionBuffer:a,quadBuffer:T,regionPositionLocation:c,blitPositionLocation:o,colorLocation:f,textureLocation:l,scratchTexture:m,scratchFramebuffer:u}}function Be(i,e,n){let{gl:r,canvas:a,scratchTexture:c}=i;a.width===e&&a.height===n||(a.width=e,a.height=n,r.bindTexture(r.TEXTURE_2D,c),r.texImage2D(r.TEXTURE_2D,0,r.RGBA,e,n,0,r.RGBA,r.UNSIGNED_BYTE,null))}function p(i,e,n,r,a,c,T){let{gl:o,regionProgram:f,regionPositionBuffer:l,regionPositionLocation:m,colorLocation:u,scratchFramebuffer:A}=i,F=N+r*R,{indices:S,vertices:B}=n;o.bindFramebuffer(o.FRAMEBUFFER,A),o.viewport(0,0,i.canvas.width,i.canvas.height),o.clearColor(0,0,0,0),o.clear(o.COLOR_BUFFER_BIT),o.useProgram(f),o.bindBuffer(o.ARRAY_BUFFER,l),o.enableVertexAttribArray(m),o.vertexAttribPointer(m,2,o.FLOAT,!1,0,0),o.enable(o.BLEND),o.blendEquation(o.MAX),o.blendFunc(o.ONE,o.ONE);for(let t=0;t<S.length;++t){let x=(F+S[t])*4;B[t*2]=e[x],B[t*2+1]=e[x+1]}o.bufferData(o.ARRAY_BUFFER,B,o.DYNAMIC_DRAW),o.uniform4f(u,a,c,T,1),o.drawArrays(o.TRIANGLES,0,S.length)}function h(i){let{gl:e,blitProgram:n,quadBuffer:r,blitPositionLocation:a,scratchTexture:c}=i;e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,i.canvas.width,i.canvas.height),e.useProgram(n),e.bindBuffer(e.ARRAY_BUFFER,r),e.enableVertexAttribArray(a),e.vertexAttribPointer(a,2,e.FLOAT,!1,0,0),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,c),e.enable(e.BLEND),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ONE),e.drawArrays(e.TRIANGLES,0,6)}function De(i,e){let n=i.landmarks.data,r=e.length;n[0]=r;for(let a=0;a<r;++a){let c=e[a];for(let f=0;f<H;++f){let l=c[f],m=(N+a*R+f)*4;n[m]=l.x,n[m+1]=1-l.y,n[m+2]=l.z??0,n[m+3]=l.visibility??1}let T=K(n,a,he,R,N);n.set(T,(N+a*R+O.FACE_CENTER)*4);let o=K(n,a,j,R,1);n.set(o,(N+a*R+O.MOUTH_CENTER)*4)}i.state.nFaces=r}function ve(i,e,n){let{mask:r,maxFaces:a,landmarks:c,state:{nFaces:T}}=i,{gl:o,canvas:f}=r,{data:l}=c;if(Be(r,e,n),o.bindFramebuffer(o.FRAMEBUFFER,null),o.viewport(0,0,f.width,f.height),o.clearColor(0,0,0,0),o.clear(o.COLOR_BUFFER_BIT),!_)return;let m=a<=z;for(let u=0;u<T;++u){let A=m&&u<v.length?Me[v[u]]:0,F=m?u<v.length?0:Ie[q[u-v.length]]:(u+1)/U;p(r,l,_.TESSELATION,u,0,A,F),h(r),p(r,l,_.OVAL,u,I.OVAL,0,0),h(r),p(r,l,_.LEFT_EYEBROW,u,I.LEFT_EYEBROW,0,0),h(r),p(r,l,_.RIGHT_EYEBROW,u,I.RIGHT_EYEBROW,0,0),h(r),p(r,l,_.LEFT_EYE,u,I.LEFT_EYE,A,F),h(r),p(r,l,_.RIGHT_EYE,u,I.RIGHT_EYE,A,F),h(r),p(r,l,_.MOUTH,u,I.MOUTH,0,0),h(r),p(r,l,_.INNER_MOUTH,u,I.INNER_MOUTH,A,F),h(r)}}function Ue(i){let{textureName:e,options:{history:n,...r}={}}=i,a={...ke,...r},c=oe({...a,textureName:e}),T=a.maxFaces*R+N,o=Math.ceil(T/M);return function(f,l){let{injectGLSL:m,emitHook:u,updateTexturesInternal:A}=l,F=P.get(c),S=F?.landmarks.data??new Float32Array(M*o*4),B=F?.mask.canvas??new OffscreenCanvas(1,1),t=null,x=!1,Y=!1;function w(s){if(!t)return;let E=t.state.nFaces,d=E*R+N,C=Math.ceil(d/M),b=s;typeof b>"u"&&$.length>0&&(b=$,$=[]),A({u_faceLandmarksTex:{data:t.landmarks.data,width:M,height:C,isPartial:!0},u_faceMask:t.mask.canvas},n?{skipHistoryWrite:Y,historyWriteIndex:b}:void 0),f.updateUniforms({u_nFaces:E}),u("face:result",t.state.result)}async function Fe(){if(P.has(c))t=P.get(c);else{let[s,{FaceLandmarker:E}]=await Promise.all([se(),import("@mediapipe/tasks-vision")]);if(x)return;let d=await E.createFromOptions(s,{baseOptions:{modelAssetPath:a.modelPath,delegate:"GPU"},runningMode:"VIDEO",numFaces:a.maxFaces,minFaceDetectionConfidence:a.minFaceDetectionConfidence,minFacePresenceConfidence:a.minFacePresenceConfidence,minTrackingConfidence:a.minTrackingConfidence,outputFaceBlendshapes:a.outputFaceBlendshapes,outputFacialTransformationMatrixes:a.outputFacialTransformationMatrixes});if(x){d.close();return}t={landmarker:d,mask:Se(B),subscribers:new Map,maxFaces:a.maxFaces,state:{nCalls:0,runningMode:"VIDEO",source:null,videoTime:-1,resultTimestamp:0,result:null,pending:Promise.resolve(),nFaces:0},landmarks:{data:S,textureHeight:o}},Oe(E),P.set(c,t)}t.subscribers.set(w,!1)}let Z=Fe();async function ee(s){let E=performance.now();if(await Z,!t)return;let d=++t.state.nCalls;t.state.pending=t.state.pending.then(async()=>{if(!t||d!==t.state.nCalls)return;let C=s instanceof HTMLVideoElement?"VIDEO":"IMAGE";t.state.runningMode!==C&&(t.state.runningMode=C,await t.landmarker.setOptions({runningMode:C}));let b=!1;if(s!==t.state.source?(t.state.source=s,t.state.videoTime=-1,b=!0):s instanceof HTMLVideoElement?s.currentTime!==t.state.videoTime&&(t.state.videoTime=s.currentTime,b=!0):s instanceof HTMLImageElement||E-t.state.resultTimestamp>2&&(b=!0),b){let L,y,V;if(s instanceof HTMLVideoElement){if(s.videoWidth===0||s.videoHeight===0||s.readyState<2)return;y=s.videoWidth,V=s.videoHeight,L=t.landmarker.detectForVideo(s,E)}else{if(s.width===0||s.height===0)return;y=s.width,V=s.height,L=t.landmarker.detect(s)}if(L){t.state.resultTimestamp=E,t.state.result=L,De(t,L.faceLandmarks),ve(t,y,V);for(let ie of t.subscribers.keys())ie(),t.subscribers.set(ie,!0)}}else if(t.state.result)for(let[L,y]of t.subscribers.entries())y||(L(),t.subscribers.set(L,!0))}),await t.state.pending}f.on("_init",()=>{f.initializeUniform("u_maxFaces","int",a.maxFaces),f.initializeUniform("u_nFaces","int",0),f.initializeTexture("u_faceLandmarksTex",{data:S,width:M,height:o},{internalFormat:"RGBA32F",type:"FLOAT",minFilter:"NEAREST",magFilter:"NEAREST",history:n}),f.initializeTexture("u_faceMask",B,{minFilter:"NEAREST",magFilter:"NEAREST",history:n}),Z.then(()=>{x||!t||u("face:ready")})});let G=0,$=[],te=()=>{n&&(w(G),$.push(G),G=(G+1)%(n+1))};f.on("initializeTexture",(s,E)=>{s===e&&X(E)&&(te(),ee(E))}),f.on("updateTextures",(s,E)=>{let d=s[e];X(d)&&(Y=E?.skipHistoryWrite??!1,Y||te(),ee(d))}),f.on("destroy",()=>{x=!0,t&&(t.subscribers.delete(w),t.subscribers.size===0&&(t.landmarker.close(),t.mask.gl.deleteProgram(t.mask.regionProgram),t.mask.gl.deleteProgram(t.mask.blitProgram),t.mask.gl.deleteBuffer(t.mask.regionPositionBuffer),t.mask.gl.deleteBuffer(t.mask.quadBuffer),t.mask.gl.deleteTexture(t.mask.scratchTexture),t.mask.gl.deleteFramebuffer(t.mask.scratchFramebuffer),P.delete(c))),t=null});let{fn:D,historyParams:W}=ce(n),ne=n?"_sampleFaceMask(pos, framesAgo)":"texture(u_faceMask, pos)",Re=Array.from({length:z-1},(s,E)=>`step(${2**(E+1)}.0, faceBitF)`).join(" + "),ae=a.maxFaces<=z?`uint faceBits = (uint(mask.b * ${U}.0 + 0.5) << 8) | uint(mask.g * ${U}.0 + 0.5);
	uint faceBit = faceBits & (~faceBits + 1u);
	float faceBitF = float(faceBit);
	float hasFace = sign(faceBitF);
	float faceIndex = ${Re} - (1.0 - hasFace);`:`float faceIndex = float(int(uint(mask.b * ${U}.0 + 0.5)) - 1);`,g=(s,...E)=>D("vec2",`${s}At`,"vec2 pos",`vec4 mask = ${ne};
	${ae}
	uint bits = uint(mask.r * ${U}.0 + 0.5);
	float hit = sign(float(bits & ${E.reduce((d,C)=>d|Te[C],0)}u));
	return vec2(hit, mix(-1.0, faceIndex, hit));`),re=(s,E,d)=>D("vec2",`${s}At`,"vec2 pos",`vec2 left = ${E}(pos${W});
	vec2 right = ${d}(pos${W});
	return mix(right, left, left.x);`),Ae=s=>s.map(E=>D("float",`in${E[0].toUpperCase()+E.slice(1)}`,"vec2 pos",`vec2 a = ${E}At(pos${W}); return step(0.0, a.y) * a.x;`)).join(`
`);m(`
uniform int u_maxFaces;
uniform int u_nFaces;
uniform highp sampler2D${n?"Array":""} u_faceLandmarksTex;${n?`
uniform int u_faceLandmarksTexFrameOffset;`:""}
uniform mediump sampler2D${n?"Array":""} u_faceMask;${n?`
uniform int u_faceMaskFrameOffset;`:""}

#define FACE_LANDMARK_L_EYE_CENTER ${O.LEFT_EYE_CENTER}
#define FACE_LANDMARK_R_EYE_CENTER ${O.RIGHT_EYE_CENTER}
#define FACE_LANDMARK_NOSE_TIP ${O.NOSE_TIP}
#define FACE_LANDMARK_FACE_CENTER ${O.FACE_CENTER}
#define FACE_LANDMARK_MOUTH_CENTER ${O.MOUTH_CENTER}

${D("int","nFacesAt","",n?`
	int layer = (u_faceLandmarksTexFrameOffset - framesAgo + ${n+1}) % ${n+1};
	return int(texelFetch(u_faceLandmarksTex, ivec3(0, 0, layer), 0).r + 0.5);`:`
	return int(texelFetch(u_faceLandmarksTex, ivec2(0, 0), 0).r + 0.5);`)}
${D("vec4","faceLandmark","int faceIndex, int landmarkIndex",`int i = ${N} + faceIndex * ${R} + landmarkIndex;
	int x = i % ${M};
	int y = i / ${M};${n?`
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
${D("vec2","faceAt","vec2 pos",`vec4 mask = ${ne};
	${ae}
	return vec2(step(0.0, faceIndex), faceIndex);`)}
${re("eye","leftEyeAt","rightEyeAt")}
${re("eyebrow","leftEyebrowAt","rightEyebrowAt")}
${Ae(["eyebrow","eye","mouth","innerMouth","lips","face"])}`)}}var He=Ue;export{He as default};
//# sourceMappingURL=face.mjs.map