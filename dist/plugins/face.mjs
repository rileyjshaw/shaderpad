import{b as J,c as ue,d as Q,e as le,f as fe}from"../chunk-VMNWRREI.mjs";var Ee=`#version 300 es
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
void main() { outColor = texture(u_texture, v_uv); }`,Le=new Float32Array([0,0,1,0,0,1,0,1,1,0,1,1]),K=478,pe=2,p=K+pe,v=512,O=1,he=Array.from({length:K},(n,e)=>e),de=473,_e=468,xe=4,Ae=K,ne=K+1,ee=null,Me=["OVAL","LEFT_EYEBROW","RIGHT_EYEBROW","LEFT_EYE","RIGHT_EYE","MOUTH","INNER_MOUTH"],H=["FACE_0","FACE_1","FACE_2","FACE_3","FACE_4","FACE_5","FACE_6","FACE_7"],re=["FACE_8","FACE_9","FACE_10","FACE_11","FACE_12","FACE_13","FACE_14","FACE_15"],w=255,te=H.length+re.length;function ae(n){return Object.fromEntries(n.map((e,t)=>[e,1<<t]))}function ie(n){return Object.fromEntries(Object.entries(n).map(([e,t])=>[e,t/w]))}var Te=ae(Me),Ne=ae(H),Ce=ae(re),y=ie(Te),ke=ie(Ne),Oe=ie(Ce),Ie={modelPath:"https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",maxFaces:1,minFaceDetectionConfidence:.5,minFacePresenceConfidence:.5,minTrackingConfidence:.5,outputFaceBlendshapes:!1,outputFacialTransformationMatrixes:!1};function Z(n){let e=[];for(let t=1;t<n.length-1;++t)e.push(n[0],n[t],n[t+1]);return e}function R(n){let e=new Array(n.length+1);e[0]=n[0].start;for(let t=0;t<n.length;++t)e[t+1]=n[t].end;return e}function W(n,e){let t=[],i=Math.min(n.length,e.length);for(let a=0;a<i-1;++a)t.push(n[a],e[a],e[a+1],n[a],e[a+1],n[a+1]);return t}var g=null;function De(n){if(!g){let e=n.FACE_LANDMARKS_TESSELATION,t=R(n.FACE_LANDMARKS_LEFT_EYEBROW),i=R(n.FACE_LANDMARKS_RIGHT_EYEBROW),a=n.FACE_LANDMARKS_LEFT_EYE,c=n.FACE_LANDMARKS_RIGHT_EYE,A=n.FACE_LANDMARKS_LIPS,o=R(a.slice(0,8)),l=R(a.slice(8,16)),E=R(c.slice(0,8)),m=R(c.slice(8,16)),u=R(A.slice(0,10)),I=R(A.slice(10,20)),b=R(A.slice(20,30)),L=R(A.slice(30,40)),h=[...o,...l.slice(1,-1)],r=[...E,...m.slice(1,-1)];ee=[...b,...L.slice(1,-1)];let F=new Int16Array(p).fill(-1);for(let d of h)F[d]=de;for(let d of r)F[d]=_e;for(let d of ee)F[d]=ne;let D=d=>{let _=F[d];return _>=0?_:d},U=[];for(let d=0;d<e.length-2;d+=3){let _=D(e[d].start),S=D(e[d+1].start),$=D(e[d+2].start);_!==S&&_!==$&&S!==$&&U.push(_,S,$)}let j=W(o,l),X=W(E,m),z=[...W(u,b),...W(I,L)],P=W(b,L),G=R(n.FACE_LANDMARKS_FACE_OVAL).slice(0,-1);g=Object.fromEntries(Object.entries({LEFT_EYEBROW:Z(t),RIGHT_EYEBROW:Z(i),LEFT_EYE:j,RIGHT_EYE:X,MOUTH:z,INNER_MOUTH:P,TESSELATION:U,OVAL:Z(G)}).map(([d,_])=>[d,{indices:_,vertices:new Float32Array(_.length*2)}]))}}var V=new Map;function me(n,e,t){let i=n.createShader(n.VERTEX_SHADER);n.shaderSource(i,e),n.compileShader(i);let a=n.createShader(n.FRAGMENT_SHADER);n.shaderSource(a,t),n.compileShader(a);let c=n.createProgram();return n.attachShader(c,i),n.attachShader(c,a),n.linkProgram(c),n.deleteShader(i),n.deleteShader(a),c}function Se(n){let e=n.getContext("webgl2",{antialias:!1,preserveDrawingBuffer:!0}),t=me(e,Ee,ge),i=me(e,Ee,be),a=e.createBuffer(),c=e.getAttribLocation(t,"a_pos"),A=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,A),e.bufferData(e.ARRAY_BUFFER,Le,e.STATIC_DRAW);let o=e.getAttribLocation(i,"a_pos"),l=e.getUniformLocation(t,"u_color"),E=e.getUniformLocation(i,"u_texture"),m=e.createTexture();e.bindTexture(e.TEXTURE_2D,m),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,null);let u=e.createFramebuffer();return e.bindFramebuffer(e.FRAMEBUFFER,u),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,m,0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.useProgram(i),e.uniform1i(E,0),e.colorMask(!0,!0,!0,!1),{canvas:n,gl:e,regionProgram:t,blitProgram:i,regionPositionBuffer:a,quadBuffer:A,regionPositionLocation:c,blitPositionLocation:o,colorLocation:l,textureLocation:E,scratchTexture:m,scratchFramebuffer:u}}function Be(n,e,t){let{gl:i,canvas:a,scratchTexture:c}=n;a.width===e&&a.height===t||(a.width=e,a.height=t,i.bindTexture(i.TEXTURE_2D,c),i.texImage2D(i.TEXTURE_2D,0,i.RGBA,e,t,0,i.RGBA,i.UNSIGNED_BYTE,null))}function C(n,e,t,i,a,c,A){let{gl:o,regionProgram:l,regionPositionBuffer:E,regionPositionLocation:m,colorLocation:u,scratchFramebuffer:I}=n,b=O+i*p,{indices:L,vertices:h}=t;o.bindFramebuffer(o.FRAMEBUFFER,I),o.viewport(0,0,n.canvas.width,n.canvas.height),o.clearColor(0,0,0,0),o.clear(o.COLOR_BUFFER_BIT),o.useProgram(l),o.bindBuffer(o.ARRAY_BUFFER,E),o.enableVertexAttribArray(m),o.vertexAttribPointer(m,2,o.FLOAT,!1,0,0),o.enable(o.BLEND),o.blendEquation(o.MAX),o.blendFunc(o.ONE,o.ONE);for(let r=0;r<L.length;++r){let F=(b+L[r])*4;h[r*2]=e[F],h[r*2+1]=e[F+1]}o.bufferData(o.ARRAY_BUFFER,h,o.DYNAMIC_DRAW),o.uniform4f(u,a,c,A,1),o.drawArrays(o.TRIANGLES,0,L.length)}function k(n){let{gl:e,blitProgram:t,quadBuffer:i,blitPositionLocation:a,scratchTexture:c}=n;e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,n.canvas.width,n.canvas.height),e.useProgram(t),e.bindBuffer(e.ARRAY_BUFFER,i),e.enableVertexAttribArray(a),e.vertexAttribPointer(a,2,e.FLOAT,!1,0,0),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,c),e.enable(e.BLEND),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ONE),e.drawArrays(e.TRIANGLES,0,6)}function ve(n,e){let t=n.landmarks.data,i=e.length;t[0]=i;for(let a=0;a<i;++a){let c=e[a];for(let l=0;l<K;++l){let E=c[l],m=(O+a*p+l)*4;t[m]=E.x,t[m+1]=1-E.y,t[m+2]=E.z??0,t[m+3]=E.visibility??1}let A=Q(t,a,he,p,O);t.set(A,(O+a*p+Ae)*4);let o=Q(t,a,ee,p,1);t.set(o,(O+a*p+ne)*4)}n.state.nFaces=i}function ye(n,e,t){let{mask:i,maxFaces:a,landmarks:c,state:{nFaces:A}}=n,{gl:o,canvas:l}=i,{data:E}=c;if(Be(i,e,t),o.bindFramebuffer(o.FRAMEBUFFER,null),o.viewport(0,0,l.width,l.height),o.clearColor(0,0,0,0),o.clear(o.COLOR_BUFFER_BIT),!g)return;let m=a<=te;for(let u=0;u<A;++u){let I=m&&u<H.length?ke[H[u]]:0,b=m?u<H.length?0:Oe[re[u-H.length]]:(u+1)/w;C(i,E,g.TESSELATION,u,0,I,b),k(i),C(i,E,g.OVAL,u,y.OVAL,0,0),k(i),C(i,E,g.LEFT_EYEBROW,u,y.LEFT_EYEBROW,0,0),k(i),C(i,E,g.RIGHT_EYEBROW,u,y.RIGHT_EYEBROW,0,0),k(i),C(i,E,g.LEFT_EYE,u,y.LEFT_EYE,0,0),k(i),C(i,E,g.RIGHT_EYE,u,y.RIGHT_EYE,0,0),k(i),C(i,E,g.MOUTH,u,y.MOUTH,0,0),k(i),C(i,E,g.INNER_MOUTH,u,y.INNER_MOUTH,0,0),k(i)}}function Ue(n){let{textureName:e,options:{history:t,...i}={}}=n,a={...Ie,...i},c=ue({...a,textureName:e}),A=a.maxFaces*p+O,o=Math.ceil(A/v);return function(l,E){let{injectGLSL:m,emitHook:u,updateTexturesInternal:I}=E,b=V.get(c),L=b?.landmarks.data??new Float32Array(v*o*4),h=b?.mask.canvas??new OffscreenCanvas(1,1),r=null,F=!1,D=!1;function U(s){if(!r)return;let f=r.state.nFaces,T=f*p+O,B=Math.ceil(T/v),M=s;typeof M>"u"&&G.length>0&&(M=G,G=[]),I({u_faceLandmarksTex:{data:r.landmarks.data,width:v,height:B,isPartial:!0},u_faceMask:r.mask.canvas},t?{skipHistoryWrite:D,historyWriteIndex:M}:void 0),l.updateUniforms({u_nFaces:f}),u("face:result",r.state.result)}async function j(){if(V.has(c))r=V.get(c);else{let[s,{FaceLandmarker:f}]=await Promise.all([le(),import("@mediapipe/tasks-vision")]);if(F)return;let T=await f.createFromOptions(s,{baseOptions:{modelAssetPath:a.modelPath,delegate:"GPU"},runningMode:"VIDEO",numFaces:a.maxFaces,minFaceDetectionConfidence:a.minFaceDetectionConfidence,minFacePresenceConfidence:a.minFacePresenceConfidence,minTrackingConfidence:a.minTrackingConfidence,outputFaceBlendshapes:a.outputFaceBlendshapes,outputFacialTransformationMatrixes:a.outputFacialTransformationMatrixes});if(F){T.close();return}r={landmarker:T,mask:Se(h),subscribers:new Map,maxFaces:a.maxFaces,state:{nCalls:0,runningMode:"VIDEO",source:null,videoTime:-1,resultTimestamp:0,result:null,pending:Promise.resolve(),nFaces:0},landmarks:{data:L,textureHeight:o}},De(f),V.set(c,r)}r.subscribers.set(U,!1)}let X=j();async function z(s){let f=performance.now();if(await X,!r)return;let T=++r.state.nCalls;r.state.pending=r.state.pending.then(async()=>{if(!r||T!==r.state.nCalls)return;let B=s instanceof HTMLVideoElement?"VIDEO":"IMAGE";r.state.runningMode!==B&&(r.state.runningMode=B,await r.landmarker.setOptions({runningMode:B}));let M=!1;if(s!==r.state.source?(r.state.source=s,r.state.videoTime=-1,M=!0):s instanceof HTMLVideoElement?s.currentTime!==r.state.videoTime&&(r.state.videoTime=s.currentTime,M=!0):s instanceof HTMLImageElement||f-r.state.resultTimestamp>2&&(M=!0),M){let N,Y,q;if(s instanceof HTMLVideoElement){if(s.videoWidth===0||s.videoHeight===0||s.readyState<2)return;Y=s.videoWidth,q=s.videoHeight,N=r.landmarker.detectForVideo(s,f)}else{if(s.width===0||s.height===0)return;Y=s.width,q=s.height,N=r.landmarker.detect(s)}if(N){r.state.resultTimestamp=f,r.state.result=N,ve(r,N.faceLandmarks),ye(r,Y,q);for(let ce of r.subscribers.keys())ce(),r.subscribers.set(ce,!0)}}else if(r.state.result)for(let[N,Y]of r.subscribers.entries())Y||(N(),r.subscribers.set(N,!0))}),await r.state.pending}l.on("_init",()=>{l.initializeUniform("u_maxFaces","int",a.maxFaces),l.initializeUniform("u_nFaces","int",0),l.initializeTexture("u_faceLandmarksTex",{data:L,width:v,height:o},{internalFormat:"RGBA32F",type:"FLOAT",minFilter:"NEAREST",magFilter:"NEAREST",history:t}),l.initializeTexture("u_faceMask",h,{minFilter:"NEAREST",magFilter:"NEAREST",history:t}),X.then(()=>{F||!r||u("face:ready")})});let P=0,G=[],d=()=>{t&&(U(P),G.push(P),P=(P+1)%(t+1))};l.on("initializeTexture",(s,f)=>{s===e&&J(f)&&(d(),z(f))}),l.on("updateTextures",(s,f)=>{let T=s[e];J(T)&&(D=f?.skipHistoryWrite??!1,D||d(),z(T))}),l.on("destroy",()=>{F=!0,r&&(r.subscribers.delete(U),r.subscribers.size===0&&(r.landmarker.close(),r.mask.gl.deleteProgram(r.mask.regionProgram),r.mask.gl.deleteProgram(r.mask.blitProgram),r.mask.gl.deleteBuffer(r.mask.regionPositionBuffer),r.mask.gl.deleteBuffer(r.mask.quadBuffer),r.mask.gl.deleteTexture(r.mask.scratchTexture),r.mask.gl.deleteFramebuffer(r.mask.scratchFramebuffer),V.delete(c))),r=null});let{fn:_,historyParams:S}=fe(t),$=t?"_sampleFaceMask(pos, framesAgo)":"texture(u_faceMask, pos)",Fe=Array.from({length:te-1},(s,f)=>`step(${2**(f+1)}.0, faceBitF)`).join(" + "),oe=a.maxFaces<=te?`uint faceBits = (uint(mask.b * ${w}.0 + 0.5) << 8) | uint(mask.g * ${w}.0 + 0.5);
	uint faceBit = faceBits & (~faceBits + 1u);
	float faceBitF = float(faceBit);
	float hasFace = sign(faceBitF);
	float faceIndex = ${Fe} - (1.0 - hasFace);`:`float faceIndex = float(int(uint(mask.b * ${w}.0 + 0.5)) - 1);`,x=(s,...f)=>_("vec2",`${s}At`,"vec2 pos",`vec4 mask = ${$};
	${oe}
	uint bits = uint(mask.r * ${w}.0 + 0.5);
	float hit = sign(float(bits & ${f.reduce((T,B)=>T|Te[B],0)}u));
	return vec2(hit, mix(-1.0, faceIndex, hit));`),se=(s,f,T)=>_("vec2",`${s}At`,"vec2 pos",`vec2 left = ${f}(pos${S});
	vec2 right = ${T}(pos${S});
	return mix(right, left, left.x);`),Re=s=>s.map(f=>_("float",`in${f[0].toUpperCase()+f.slice(1)}`,"vec2 pos",`vec2 a = ${f}At(pos${S}); return step(0.0, a.y) * a.x;`)).join(`
`);m(`
uniform int u_maxFaces;
uniform int u_nFaces;
uniform highp sampler2D${t?"Array":""} u_faceLandmarksTex;${t?`
uniform int u_faceLandmarksTexFrameOffset;`:""}
uniform mediump sampler2D${t?"Array":""} u_faceMask;${t?`
uniform int u_faceMaskFrameOffset;`:""}

#define FACE_LANDMARK_L_EYE_CENTER ${de}
#define FACE_LANDMARK_R_EYE_CENTER ${_e}
#define FACE_LANDMARK_NOSE_TIP ${xe}
#define FACE_LANDMARK_FACE_CENTER ${Ae}
#define FACE_LANDMARK_MOUTH_CENTER ${ne}

${_("int","nFacesAt","",t?`
	int layer = (u_faceLandmarksTexFrameOffset - framesAgo + ${t+1}) % ${t+1};
	return int(texelFetch(u_faceLandmarksTex, ivec3(0, 0, layer), 0).r + 0.5);`:`
	return int(texelFetch(u_faceLandmarksTex, ivec2(0, 0), 0).r + 0.5);`)}
${_("vec4","faceLandmark","int faceIndex, int landmarkIndex",`int i = ${O} + faceIndex * ${p} + landmarkIndex;
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
${x("leftEyebrow","LEFT_EYEBROW")}
${x("rightEyebrow","RIGHT_EYEBROW")}
${x("leftEye","LEFT_EYE")}
${x("rightEye","RIGHT_EYE")}
${x("lips","MOUTH")}
${x("mouth","MOUTH","INNER_MOUTH")}
${x("innerMouth","INNER_MOUTH")}
${x("faceOval","OVAL")}
${_("vec2","faceAt","vec2 pos",`vec4 mask = ${$};
	${oe}
	return vec2(step(0.0, faceIndex), faceIndex);`)}
${se("eye","leftEyeAt","rightEyeAt")}
${se("eyebrow","leftEyebrowAt","rightEyebrowAt")}
${Re(["eyebrow","eye","mouth","innerMouth","lips","face"])}`)}}var $e=Ue;export{$e as default};
//# sourceMappingURL=face.mjs.map