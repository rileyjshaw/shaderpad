import{a as J}from"../chunk-QROQ7JVO.mjs";import{b as te,c as fe,d as Ee,e as ne,f as me,g as de}from"../chunk-RWGXFWIP.mjs";var _e=`#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
	v_uv = a_pos;
	gl_Position = vec4(a_pos * 2.0 - 1.0, 0.0, 1.0);
}`,be=`#version 300 es
precision mediump float;
uniform vec4 u_color;
out vec4 outColor;
void main() { outColor = u_color; }`,Le=`#version 300 es
precision mediump float;
in vec2 v_uv;
uniform sampler2D u_texture;
out vec4 outColor;
void main() { outColor = texture(u_texture, v_uv); }`,pe=new Float32Array([0,0,1,0,0,1,0,1,1,0,1,1]),X=478,Me=2,p=X+Me,y=512,I=1,xe=Array.from({length:X},(t,e)=>e),Te=473,Fe=468,Se=4,Re=X,oe=X+1,ae=null,Ce=["OVAL","LEFT_EYEBROW","RIGHT_EYEBROW","LEFT_EYE","RIGHT_EYE","MOUTH","INNER_MOUTH"],w=["FACE_0","FACE_1","FACE_2","FACE_3","FACE_4","FACE_5","FACE_6","FACE_7"],se=["FACE_8","FACE_9","FACE_10","FACE_11","FACE_12","FACE_13","FACE_14","FACE_15"],G=255,ie=w.length+se.length;function ce(t){return Object.fromEntries(t.map((e,n)=>[e,1<<n]))}function ue(t){return Object.fromEntries(Object.entries(t).map(([e,n])=>[e,n/G]))}var ge=ce(Ce),Ne=ce(w),De=ce(se),B=ue(ge),Oe=ue(Ne),ke=ue(De),Ie={modelPath:"https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",maxFaces:1,minFaceDetectionConfidence:.5,minFacePresenceConfidence:.5,minTrackingConfidence:.5,outputFaceBlendshapes:!1,outputFacialTransformationMatrixes:!1};function ve(t){let e=[];for(let n=1;n<t.length-1;++n)e.push(t[0],t[n],t[n+1]);return e}function T(t){let e=new Array(t.length+1);e[0]=t[0].start;for(let n=0;n<t.length;++n)e[n+1]=t[n].end;return e}function U(t,e){let n=[],i=Math.min(t.length,e.length);for(let a=0;a<i-1;++a)n.push(t[a],e[a],e[a+1],t[a],e[a+1],t[a+1]);return n}var h=null;function ye(t){if(!h){let e=t.FACE_LANDMARKS_TESSELATION,n=t.FACE_LANDMARKS_LEFT_EYEBROW,i=T(n.slice(0,4)),a=T(n.slice(4,8)),c=t.FACE_LANDMARKS_RIGHT_EYEBROW,d=T(c.slice(0,4)),o=T(c.slice(4,8)),l=t.FACE_LANDMARKS_LEFT_EYE,m=T(l.slice(0,8)),_=T(l.slice(8,16)),u=t.FACE_LANDMARKS_RIGHT_EYE,A=T(u.slice(0,8)),M=T(u.slice(8,16)),g=t.FACE_LANDMARKS_LIPS,S=T(g.slice(0,10)),r=T(g.slice(10,20)),F=T(g.slice(20,30)),b=T(g.slice(30,40)),P=[...m,..._.slice(1,-1)],$=[...A,...M.slice(1,-1)];ae=[...F,...b.slice(1,-1)];let C=new Int16Array(p).fill(-1);for(let f of P)C[f]=Te;for(let f of $)C[f]=Fe;for(let f of ae)C[f]=oe;let H=f=>{let R=C[f];return R>=0?R:f},Y=[];for(let f=0;f<e.length-2;f+=3){let R=H(e[f].start),V=H(e[f+1].start),s=H(e[f+2].start);R!==V&&R!==s&&V!==s&&Y.push(R,V,s)}let Q=U(i,a),z=U(d,o),N=U(m,_),W=U(A,M),q=[...U(S,F),...U(r,b)],Z=U(F,b),j=T(t.FACE_LANDMARKS_FACE_OVAL).slice(0,-1);h=Object.fromEntries(Object.entries({LEFT_EYEBROW:Q,RIGHT_EYEBROW:z,LEFT_EYE:N,RIGHT_EYE:W,MOUTH:q,INNER_MOUTH:Z,TESSELATION:Y,OVAL:ve(j)}).map(([f,R])=>[f,{indices:R,vertices:new Float32Array(R.length*2)}]))}}var re=new Map,Be=new Map;function Ae(t,e,n,i){let a=null,c=null,d=null;try{if(a=t.createShader(t.VERTEX_SHADER),c=t.createShader(t.FRAGMENT_SHADER),d=t.createProgram(),!a||!c||!d)throw new Error;if(t.shaderSource(a,e),t.compileShader(a),!t.getShaderParameter(a,t.COMPILE_STATUS))throw new Error;if(t.shaderSource(c,n),t.compileShader(c),!t.getShaderParameter(c,t.COMPILE_STATUS))throw new Error;if(t.attachShader(d,a),t.attachShader(d,c),t.linkProgram(d),!t.getProgramParameter(d,t.LINK_STATUS))throw new Error;return d}catch{throw d&&t.deleteProgram(d),J(61,!1)}finally{a&&t.deleteShader(a),c&&t.deleteShader(c)}}function Ue(t){let e=t.getContext("webgl2",{antialias:!1,preserveDrawingBuffer:!0});if(!e)throw J(60,!1);let n=Ae(e,_e,be,"face-mask-region"),i=Ae(e,_e,Le,"face-mask-blit"),a;try{let c=e.createBuffer(),d=e.getAttribLocation(n,"a_pos"),o=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,o),e.bufferData(e.ARRAY_BUFFER,pe,e.STATIC_DRAW);let l=e.getAttribLocation(i,"a_pos"),m=e.getUniformLocation(n,"u_color"),_=e.getUniformLocation(i,"u_texture"),u=e.createTexture();e.bindTexture(e.TEXTURE_2D,u),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,null);let A=e.createFramebuffer();if(e.bindFramebuffer(e.FRAMEBUFFER,A),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,u,0),a=e.checkFramebufferStatus(e.FRAMEBUFFER),e.bindFramebuffer(e.FRAMEBUFFER,null),!c||d<0||!o||l<0||!m||!_||!u||!A||a!==e.FRAMEBUFFER_COMPLETE)throw new Error;return e.useProgram(i),e.uniform1i(_,0),e.colorMask(!0,!0,!0,!1),{canvas:t,gl:e,regionProgram:n,blitProgram:i,regionPositionBuffer:c,quadBuffer:o,regionPositionLocation:d,blitPositionLocation:l,colorLocation:m,textureLocation:_,scratchTexture:u,scratchFramebuffer:A}}catch{throw J(62,!1)}}function Pe(t,e,n){let{gl:i,canvas:a,scratchTexture:c}=t;a.width===e&&a.height===n||(a.width=e,a.height=n,i.bindTexture(i.TEXTURE_2D,c),i.texImage2D(i.TEXTURE_2D,0,i.RGBA,e,n,0,i.RGBA,i.UNSIGNED_BYTE,null))}function O(t,e,n,i,a,c,d){let{gl:o,regionProgram:l,regionPositionBuffer:m,regionPositionLocation:_,colorLocation:u,scratchFramebuffer:A}=t,M=I+i*p,{indices:g,vertices:S}=n;o.bindFramebuffer(o.FRAMEBUFFER,A),o.viewport(0,0,t.canvas.width,t.canvas.height),o.clearColor(0,0,0,0),o.clear(o.COLOR_BUFFER_BIT),o.useProgram(l),o.bindBuffer(o.ARRAY_BUFFER,m),o.enableVertexAttribArray(_),o.vertexAttribPointer(_,2,o.FLOAT,!1,0,0),o.enable(o.BLEND),o.blendEquation(o.MAX),o.blendFunc(o.ONE,o.ONE);for(let r=0;r<g.length;++r){let F=(M+g[r])*4;S[r*2]=e[F],S[r*2+1]=e[F+1]}o.bufferData(o.ARRAY_BUFFER,S,o.DYNAMIC_DRAW),o.uniform4f(u,a,c,d,1),o.drawArrays(o.TRIANGLES,0,g.length)}function k(t){let{gl:e,blitProgram:n,quadBuffer:i,blitPositionLocation:a,scratchTexture:c}=t;e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,t.canvas.width,t.canvas.height),e.useProgram(n),e.bindBuffer(e.ARRAY_BUFFER,i),e.enableVertexAttribArray(a),e.vertexAttribPointer(a,2,e.FLOAT,!1,0,0),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,c),e.enable(e.BLEND),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ONE),e.drawArrays(e.TRIANGLES,0,6)}function we(t,e){let n=t.landmarks.data,i=e.length;n[0]=i;for(let a=0;a<i;++a){let c=e[a];for(let l=0;l<X;++l){let m=c[l],_=(I+a*p+l)*4;n[_]=m.x,n[_+1]=1-m.y,n[_+2]=m.z??0,n[_+3]=m.visibility??1}let d=ne(n,a,xe,p,I);n.set(d,(I+a*p+Re)*4);let o=ne(n,a,ae,p,1);n.set(o,(I+a*p+oe)*4)}t.state.nFaces=i}function Ge(t,e,n){let{mask:i,maxFaces:a,landmarks:c,state:{nFaces:d}}=t,{gl:o,canvas:l}=i,{data:m}=c;if(Pe(i,e,n),o.bindFramebuffer(o.FRAMEBUFFER,null),o.viewport(0,0,l.width,l.height),o.clearColor(0,0,0,0),o.clear(o.COLOR_BUFFER_BIT),!h)return;let _=a<=ie;for(let u=0;u<d;++u){let A=_&&u<w.length?Oe[w[u]]:0,M=_?u<w.length?0:ke[se[u-w.length]]:(u+1)/G;O(i,m,h.TESSELATION,u,0,A,M),k(i),O(i,m,h.OVAL,u,B.OVAL,0,0),k(i),O(i,m,h.LEFT_EYEBROW,u,B.LEFT_EYEBROW,0,0),k(i),O(i,m,h.RIGHT_EYEBROW,u,B.RIGHT_EYEBROW,0,0),k(i),O(i,m,h.LEFT_EYE,u,B.LEFT_EYE,0,0),k(i),O(i,m,h.RIGHT_EYE,u,B.RIGHT_EYE,0,0),k(i),O(i,m,h.MOUTH,u,B.MOUTH,0,0),k(i),O(i,m,h.INNER_MOUTH,u,B.INNER_MOUTH,0,0),k(i)}}function $e(t){let{textureName:e,options:{history:n,...i}={}}=t,a={...Ie,...i},c=fe({...a,textureName:e}),d=a.maxFaces*p+I,o=Math.ceil(d/y);return function(l,m){let{injectGLSL:_,emit:u,updateTexture:A}=m,M=re.get(c),g=M?.landmarks.data??new Float32Array(y*o*4),S=M?.mask.canvas??new OffscreenCanvas(1,1),r,F=!1,b=-1,P=[];function $(s){if(!r)return;let E=r.state.nFaces,L=E*p+I,x=Math.ceil(L/y),v=n?s:void 0;A("u_faceLandmarksTex",{data:r.landmarks.data,width:y,height:x,isPartial:!0},v),A("u_faceMask",r.mask.canvas,v),l.updateUniforms({u_nFaces:E},{allowMissing:!0})}function C(){n?($(P.length>0?P:b),P=[]):$(b),u("face:result",r.state.result)}async function H(){r=await Ee(c,re,Be,async()=>{let[s,{FaceLandmarker:E}]=await Promise.all([me(),import("@mediapipe/tasks-vision")]);if(F)return;let L=await E.createFromOptions(s,{baseOptions:{modelAssetPath:a.modelPath,delegate:"GPU"},runningMode:"VIDEO",numFaces:a.maxFaces,minFaceDetectionConfidence:a.minFaceDetectionConfidence,minFacePresenceConfidence:a.minFacePresenceConfidence,minTrackingConfidence:a.minTrackingConfidence,outputFaceBlendshapes:a.outputFaceBlendshapes,outputFacialTransformationMatrixes:a.outputFacialTransformationMatrixes});if(F){L.close();return}let x={landmarker:L,mask:Ue(S),subscribers:new Map,maxFaces:a.maxFaces,state:{nCalls:0,runningMode:"VIDEO",source:null,videoTime:-1,resultTimestamp:0,result:null,pending:Promise.resolve(),nFaces:0},landmarks:{data:g,textureHeight:o}};return ye(E),x}),!(!r||F)&&r.subscribers.set(C,!1)}let Y=H();async function Q(s){let E=performance.now();if(await Y,!r)return;let L=++r.state.nCalls;r.state.pending=r.state.pending.then(async()=>{if(!r||L!==r.state.nCalls)return;let x=s instanceof HTMLVideoElement?"VIDEO":"IMAGE";r.state.runningMode!==x&&(r.state.runningMode=x,await r.landmarker.setOptions({runningMode:x}));let v=!1;if(s!==r.state.source?(r.state.source=s,r.state.videoTime=s instanceof HTMLVideoElement?s.currentTime:-1,v=!0):s instanceof HTMLVideoElement?s.currentTime!==r.state.videoTime&&(r.state.videoTime=s.currentTime,v=!0):s instanceof HTMLImageElement||E-r.state.resultTimestamp>2&&(v=!0),v){let D,K,ee;if(s instanceof HTMLVideoElement){if(s.videoWidth===0||s.videoHeight===0||s.readyState<2)return;K=s.videoWidth,ee=s.videoHeight,D=r.landmarker.detectForVideo(s,E)}else{if(s.width===0||s.height===0)return;K=s.width,ee=s.height,D=r.landmarker.detect(s)}if(D){r.state.resultTimestamp=E,r.state.result=D,we(r,D.faceLandmarks),Ge(r,K,ee);for(let[le,he]of r.subscribers.entries())he&&(le(),r.subscribers.set(le,!1))}}else if(r.state.result)for(let[D,K]of r.subscribers.entries())K&&(D(),r.subscribers.set(D,!1))}),await r.state.pending}l.on("_init",()=>{l.initializeUniform("u_maxFaces","int",a.maxFaces,{allowMissing:!0}),l.initializeUniform("u_nFaces","int",0,{allowMissing:!0}),l.initializeTexture("u_faceLandmarksTex",{data:g,width:y,height:o},{internalFormat:"RGBA32F",type:"FLOAT",minFilter:"NEAREST",magFilter:"NEAREST",history:n}),l.initializeTexture("u_faceMask",S,{minFilter:"NEAREST",magFilter:"NEAREST",history:n}),Y.then(()=>{F||!r||u("face:ready")})});function z(s){r&&(n&&(b=(b+1)%(n+1),$(b),P.push(b)),r.subscribers.set(C,!0),Q(s))}l.on("initializeTexture",(s,E)=>{s===e&&te(E)&&z(E)}),l.on("updateTextures",s=>{let E=s[e];te(E)&&z(E)}),l.on("destroy",()=>{F=!0,r&&(r.subscribers.delete(C),r.subscribers.size===0&&(r.landmarker.close(),r.mask.gl.deleteProgram(r.mask.regionProgram),r.mask.gl.deleteProgram(r.mask.blitProgram),r.mask.gl.deleteBuffer(r.mask.regionPositionBuffer),r.mask.gl.deleteBuffer(r.mask.quadBuffer),r.mask.gl.deleteTexture(r.mask.scratchTexture),r.mask.gl.deleteFramebuffer(r.mask.scratchFramebuffer),re.delete(c))),r=void 0});let{fn:N,historyParams:W}=de(n),q=n?"_sampleFaceMask(pos, framesAgo)":"texture(u_faceMask, pos)",Z=Array.from({length:ie-1},(s,E)=>`step(${2**(E+1)}.0, faceBitF)`).join(" + "),j=a.maxFaces<=ie?`uint faceBits = (uint(mask.b * ${G}.0 + 0.5) << 8) | uint(mask.g * ${G}.0 + 0.5);
	uint faceBit = faceBits & (~faceBits + 1u);
	float faceBitF = float(faceBit);
	float hasFace = sign(faceBitF);
	float faceIndex = ${Z} - (1.0 - hasFace);`:`float faceIndex = float(int(uint(mask.b * ${G}.0 + 0.5)) - 1);`,f=(s,...E)=>N("vec2",`${s}At`,"vec2 pos",`vec4 mask = ${q};
	${j}
	uint bits = uint(mask.r * ${G}.0 + 0.5);
	float hit = sign(float(bits & ${E.reduce((L,x)=>L|ge[x],0)}u));
	return vec2(hit, mix(-1.0, faceIndex, hit));`),R=(s,E,L)=>N("vec2",`${s}At`,"vec2 pos",`vec2 left = ${E}(pos${W});
	vec2 right = ${L}(pos${W});
	return mix(right, left, left.x);`),V=s=>s.map(E=>N("float",`in${E[0].toUpperCase()+E.slice(1)}`,"vec2 pos",`vec2 a = ${E}At(pos${W}); return step(0.0, a.y) * a.x;`)).join(`
`);_(`
uniform int u_maxFaces;
uniform int u_nFaces;
uniform highp sampler2D${n?"Array":""} u_faceLandmarksTex;${n?`
uniform int u_faceLandmarksTexFrameOffset;`:""}
uniform mediump sampler2D${n?"Array":""} u_faceMask;${n?`
uniform int u_faceMaskFrameOffset;`:""}

#define FACE_LANDMARK_L_EYE_CENTER ${Te}
#define FACE_LANDMARK_R_EYE_CENTER ${Fe}
#define FACE_LANDMARK_NOSE_TIP ${Se}
#define FACE_LANDMARK_FACE_CENTER ${Re}
#define FACE_LANDMARK_MOUTH_CENTER ${oe}

${N("int","nFacesAt","",n?`
	int layer = (u_faceLandmarksTexFrameOffset - framesAgo + ${n+1}) % ${n+1};
	return int(texelFetch(u_faceLandmarksTex, ivec3(0, 0, layer), 0).r + 0.5);`:`
	return int(texelFetch(u_faceLandmarksTex, ivec2(0, 0), 0).r + 0.5);`)}
${N("vec4","faceLandmark","int faceIndex, int landmarkIndex",`int i = ${I} + faceIndex * ${p} + landmarkIndex;
	int x = i % ${y};
	int y = i / ${y};${n?`
	int layer = (u_faceLandmarksTexFrameOffset - framesAgo + ${n+1}) % ${n+1};
	return texelFetch(u_faceLandmarksTex, ivec3(x, y, layer), 0);`:`
	return texelFetch(u_faceLandmarksTex, ivec2(x, y), 0);`}`)}
${n?`
vec4 _sampleFaceMask(vec2 pos, int framesAgo) {
	int layer = (u_faceMaskFrameOffset - framesAgo + ${n+1}) % ${n+1};
	return texture(u_faceMask, vec3(pos, float(layer)));
}
`:""}
${f("leftEyebrow","LEFT_EYEBROW")}
${f("rightEyebrow","RIGHT_EYEBROW")}
${f("leftEye","LEFT_EYE")}
${f("rightEye","RIGHT_EYE")}
${f("lips","MOUTH")}
${f("mouth","MOUTH","INNER_MOUTH")}
${f("innerMouth","INNER_MOUTH")}
${f("faceOval","OVAL")}
${N("vec2","faceAt","vec2 pos",`vec4 mask = ${q};
	${j}
	return vec2(step(0.0, faceIndex), faceIndex);`)}
${R("eye","leftEyeAt","rightEyeAt")}
${R("eyebrow","leftEyebrowAt","rightEyebrowAt")}
${V(["eyebrow","eye","mouth","innerMouth","lips","face"])}`)}}var Ve=$e;export{Ve as default};
//# sourceMappingURL=face.mjs.map