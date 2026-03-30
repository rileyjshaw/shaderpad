import{a as Q}from"../chunk-6H4PVLUY.mjs";import{b as ne,c as fe,d as re,e as Ee,f as me}from"../chunk-VMNWRREI.mjs";var de=`#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
	v_uv = a_pos;
	gl_Position = vec4(a_pos * 2.0 - 1.0, 0.0, 1.0);
}`,ge=`#version 300 es
precision mediump float;
uniform vec4 u_color;
out vec4 outColor;
void main() { outColor = u_color; }`,he=`#version 300 es
precision mediump float;
in vec2 v_uv;
uniform sampler2D u_texture;
out vec4 outColor;
void main() { outColor = texture(u_texture, v_uv); }`,be=new Float32Array([0,0,1,0,0,1,0,1,1,0,1,1]),z=478,Le=2,L=z+Le,B=512,D=1,pe=Array.from({length:z},(t,e)=>e),Ae=473,Te=468,Me=4,Fe=z,ie=z+1,ae=null,xe=["OVAL","LEFT_EYEBROW","RIGHT_EYEBROW","LEFT_EYE","RIGHT_EYE","MOUTH","INNER_MOUTH"],H=["FACE_0","FACE_1","FACE_2","FACE_3","FACE_4","FACE_5","FACE_6","FACE_7"],se=["FACE_8","FACE_9","FACE_10","FACE_11","FACE_12","FACE_13","FACE_14","FACE_15"],$=255,oe=H.length+se.length;function ce(t){return Object.fromEntries(t.map((e,n)=>[e,1<<n]))}function ue(t){return Object.fromEntries(Object.entries(t).map(([e,n])=>[e,n/$]))}var Re=ce(xe),Se=ce(H),Ce=ce(se),U=ue(Re),Ne=ue(Se),ke=ue(Ce),De={modelPath:"https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",maxFaces:1,minFaceDetectionConfidence:.5,minFacePresenceConfidence:.5,minTrackingConfidence:.5,outputFaceBlendshapes:!1,outputFacialTransformationMatrixes:!1};function Ie(t){let e=[];for(let n=1;n<t.length-1;++n)e.push(t[0],t[n],t[n+1]);return e}function T(t){let e=new Array(t.length+1);e[0]=t[0].start;for(let n=0;n<t.length;++n)e[n+1]=t[n].end;return e}function P(t,e){let n=[],o=Math.min(t.length,e.length);for(let a=0;a<o-1;++a)n.push(t[a],e[a],e[a+1],t[a],e[a+1],t[a+1]);return n}var b=null;function Oe(t){if(!b){let e=t.FACE_LANDMARKS_TESSELATION,n=t.FACE_LANDMARKS_LEFT_EYEBROW,o=T(n.slice(0,4)),a=T(n.slice(4,8)),c=t.FACE_LANDMARKS_RIGHT_EYEBROW,d=T(c.slice(0,4)),i=T(c.slice(4,8)),l=t.FACE_LANDMARKS_LEFT_EYE,m=T(l.slice(0,8)),_=T(l.slice(8,16)),u=t.FACE_LANDMARKS_RIGHT_EYE,F=T(u.slice(0,8)),p=T(u.slice(8,16)),g=t.FACE_LANDMARKS_LIPS,M=T(g.slice(0,10)),r=T(g.slice(10,20)),h=T(g.slice(20,30)),I=T(g.slice(30,40)),W=[...m,..._.slice(1,-1)],Z=[...F,...p.slice(1,-1)];ae=[...h,...I.slice(1,-1)];let O=new Int16Array(L).fill(-1);for(let f of W)O[f]=Ae;for(let f of Z)O[f]=Te;for(let f of ae)O[f]=ie;let w=f=>{let R=O[f];return R>=0?R:f},y=[];for(let f=0;f<e.length-2;f+=3){let R=w(e[f].start),V=w(e[f+1].start),s=w(e[f+2].start);R!==V&&R!==s&&V!==s&&y.push(R,V,s)}let G=P(o,a),j=P(d,i),x=P(m,_),Y=P(F,p),q=[...P(M,h),...P(r,I)],ee=P(h,I),J=T(t.FACE_LANDMARKS_FACE_OVAL).slice(0,-1);b=Object.fromEntries(Object.entries({LEFT_EYEBROW:G,RIGHT_EYEBROW:j,LEFT_EYE:x,RIGHT_EYE:Y,MOUTH:q,INNER_MOUTH:ee,TESSELATION:y,OVAL:Ie(J)}).map(([f,R])=>[f,{indices:R,vertices:new Float32Array(R.length*2)}]))}}var X=new Map;function _e(t,e,n,o){let a=null,c=null,d=null;try{if(a=t.createShader(t.VERTEX_SHADER),c=t.createShader(t.FRAGMENT_SHADER),d=t.createProgram(),!a||!c||!d)throw new Error;if(t.shaderSource(a,e),t.compileShader(a),!t.getShaderParameter(a,t.COMPILE_STATUS))throw new Error;if(t.shaderSource(c,n),t.compileShader(c),!t.getShaderParameter(c,t.COMPILE_STATUS))throw new Error;if(t.attachShader(d,a),t.attachShader(d,c),t.linkProgram(d),!t.getProgramParameter(d,t.LINK_STATUS))throw new Error;return d}catch{throw d&&t.deleteProgram(d),Q(61,!1)}finally{a&&t.deleteShader(a),c&&t.deleteShader(c)}}function ye(t){let e=t.getContext("webgl2",{antialias:!1,preserveDrawingBuffer:!0});if(!e)throw Q(60,!1);let n=_e(e,de,ge,"face-mask-region"),o=_e(e,de,he,"face-mask-blit"),a;try{let c=e.createBuffer(),d=e.getAttribLocation(n,"a_pos"),i=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,i),e.bufferData(e.ARRAY_BUFFER,be,e.STATIC_DRAW);let l=e.getAttribLocation(o,"a_pos"),m=e.getUniformLocation(n,"u_color"),_=e.getUniformLocation(o,"u_texture"),u=e.createTexture();e.bindTexture(e.TEXTURE_2D,u),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,null);let F=e.createFramebuffer();if(e.bindFramebuffer(e.FRAMEBUFFER,F),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,u,0),a=e.checkFramebufferStatus(e.FRAMEBUFFER),e.bindFramebuffer(e.FRAMEBUFFER,null),!c||d<0||!i||l<0||!m||!_||!u||!F||a!==e.FRAMEBUFFER_COMPLETE)throw new Error;return e.useProgram(o),e.uniform1i(_,0),e.colorMask(!0,!0,!0,!1),{canvas:t,gl:e,regionProgram:n,blitProgram:o,regionPositionBuffer:c,quadBuffer:i,regionPositionLocation:d,blitPositionLocation:l,colorLocation:m,textureLocation:_,scratchTexture:u,scratchFramebuffer:F}}catch{throw Q(62,!1)}}function ve(t,e,n){let{gl:o,canvas:a,scratchTexture:c}=t;a.width===e&&a.height===n||(a.width=e,a.height=n,o.bindTexture(o.TEXTURE_2D,c),o.texImage2D(o.TEXTURE_2D,0,o.RGBA,e,n,0,o.RGBA,o.UNSIGNED_BYTE,null))}function N(t,e,n,o,a,c,d){let{gl:i,regionProgram:l,regionPositionBuffer:m,regionPositionLocation:_,colorLocation:u,scratchFramebuffer:F}=t,p=D+o*L,{indices:g,vertices:M}=n;i.bindFramebuffer(i.FRAMEBUFFER,F),i.viewport(0,0,t.canvas.width,t.canvas.height),i.clearColor(0,0,0,0),i.clear(i.COLOR_BUFFER_BIT),i.useProgram(l),i.bindBuffer(i.ARRAY_BUFFER,m),i.enableVertexAttribArray(_),i.vertexAttribPointer(_,2,i.FLOAT,!1,0,0),i.enable(i.BLEND),i.blendEquation(i.MAX),i.blendFunc(i.ONE,i.ONE);for(let r=0;r<g.length;++r){let h=(p+g[r])*4;M[r*2]=e[h],M[r*2+1]=e[h+1]}i.bufferData(i.ARRAY_BUFFER,M,i.DYNAMIC_DRAW),i.uniform4f(u,a,c,d,1),i.drawArrays(i.TRIANGLES,0,g.length)}function k(t){let{gl:e,blitProgram:n,quadBuffer:o,blitPositionLocation:a,scratchTexture:c}=t;e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,t.canvas.width,t.canvas.height),e.useProgram(n),e.bindBuffer(e.ARRAY_BUFFER,o),e.enableVertexAttribArray(a),e.vertexAttribPointer(a,2,e.FLOAT,!1,0,0),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,c),e.enable(e.BLEND),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ONE),e.drawArrays(e.TRIANGLES,0,6)}function Be(t,e){let n=t.landmarks.data,o=e.length;n[0]=o;for(let a=0;a<o;++a){let c=e[a];for(let l=0;l<z;++l){let m=c[l],_=(D+a*L+l)*4;n[_]=m.x,n[_+1]=1-m.y,n[_+2]=m.z??0,n[_+3]=m.visibility??1}let d=re(n,a,pe,L,D);n.set(d,(D+a*L+Fe)*4);let i=re(n,a,ae,L,1);n.set(i,(D+a*L+ie)*4)}t.state.nFaces=o}function Ue(t,e,n){let{mask:o,maxFaces:a,landmarks:c,state:{nFaces:d}}=t,{gl:i,canvas:l}=o,{data:m}=c;if(ve(o,e,n),i.bindFramebuffer(i.FRAMEBUFFER,null),i.viewport(0,0,l.width,l.height),i.clearColor(0,0,0,0),i.clear(i.COLOR_BUFFER_BIT),!b)return;let _=a<=oe;for(let u=0;u<d;++u){let F=_&&u<H.length?Ne[H[u]]:0,p=_?u<H.length?0:ke[se[u-H.length]]:(u+1)/$;N(o,m,b.TESSELATION,u,0,F,p),k(o),N(o,m,b.OVAL,u,U.OVAL,0,0),k(o),N(o,m,b.LEFT_EYEBROW,u,U.LEFT_EYEBROW,0,0),k(o),N(o,m,b.RIGHT_EYEBROW,u,U.RIGHT_EYEBROW,0,0),k(o),N(o,m,b.LEFT_EYE,u,U.LEFT_EYE,0,0),k(o),N(o,m,b.RIGHT_EYE,u,U.RIGHT_EYE,0,0),k(o),N(o,m,b.MOUTH,u,U.MOUTH,0,0),k(o),N(o,m,b.INNER_MOUTH,u,U.INNER_MOUTH,0,0),k(o)}}function Pe(t){let{textureName:e,options:{history:n,...o}={}}=t,a={...De,...o},c=fe({...a,textureName:e}),d=a.maxFaces*L+D,i=Math.ceil(d/B);return function(l,m){let{injectGLSL:_,emitHook:u,updateTexturesInternal:F}=m,p=X.get(c),g=p?.landmarks.data??new Float32Array(B*i*4),M=p?.mask.canvas??new OffscreenCanvas(1,1),r=null,h=!1,I=!1;function W(s){if(!r)return;let E=r.state.nFaces,A=E*L+D,v=Math.ceil(A/B),S=s;typeof S>"u"&&G.length>0&&(S=G,G=[]),F({u_faceLandmarksTex:{data:r.landmarks.data,width:B,height:v,isPartial:!0},u_faceMask:r.mask.canvas},n?{skipHistoryWrite:I,historyWriteIndex:S}:void 0),l.updateUniforms({u_nFaces:E},{allowMissing:!0}),u("face:result",r.state.result)}async function Z(){if(X.has(c))r=X.get(c);else{let[s,{FaceLandmarker:E}]=await Promise.all([Ee(),import("@mediapipe/tasks-vision")]);if(h)return;let A=await E.createFromOptions(s,{baseOptions:{modelAssetPath:a.modelPath,delegate:"GPU"},runningMode:"VIDEO",numFaces:a.maxFaces,minFaceDetectionConfidence:a.minFaceDetectionConfidence,minFacePresenceConfidence:a.minFacePresenceConfidence,minTrackingConfidence:a.minTrackingConfidence,outputFaceBlendshapes:a.outputFaceBlendshapes,outputFacialTransformationMatrixes:a.outputFacialTransformationMatrixes});if(h){A.close();return}r={landmarker:A,mask:ye(M),subscribers:new Map,maxFaces:a.maxFaces,state:{nCalls:0,runningMode:"VIDEO",source:null,videoTime:-1,resultTimestamp:0,result:null,pending:Promise.resolve(),nFaces:0},landmarks:{data:g,textureHeight:i}},Oe(E),X.set(c,r)}r.subscribers.set(W,!1)}let O=Z();async function w(s){let E=performance.now();if(await O,!r)return;let A=++r.state.nCalls;r.state.pending=r.state.pending.then(async()=>{if(!r||A!==r.state.nCalls)return;let v=s instanceof HTMLVideoElement?"VIDEO":"IMAGE";r.state.runningMode!==v&&(r.state.runningMode=v,await r.landmarker.setOptions({runningMode:v}));let S=!1;if(s!==r.state.source?(r.state.source=s,r.state.videoTime=-1,S=!0):s instanceof HTMLVideoElement?s.currentTime!==r.state.videoTime&&(r.state.videoTime=s.currentTime,S=!0):s instanceof HTMLImageElement||E-r.state.resultTimestamp>2&&(S=!0),S){let C,K,te;if(s instanceof HTMLVideoElement){if(s.videoWidth===0||s.videoHeight===0||s.readyState<2)return;K=s.videoWidth,te=s.videoHeight,C=r.landmarker.detectForVideo(s,E)}else{if(s.width===0||s.height===0)return;K=s.width,te=s.height,C=r.landmarker.detect(s)}if(C){r.state.resultTimestamp=E,r.state.result=C,Be(r,C.faceLandmarks),Ue(r,K,te);for(let le of r.subscribers.keys())le(),r.subscribers.set(le,!0)}}else if(r.state.result)for(let[C,K]of r.subscribers.entries())K||(C(),r.subscribers.set(C,!0))}),await r.state.pending}l.on("_init",()=>{l.initializeUniform("u_maxFaces","int",a.maxFaces,{allowMissing:!0}),l.initializeUniform("u_nFaces","int",0,{allowMissing:!0}),l.initializeTexture("u_faceLandmarksTex",{data:g,width:B,height:i},{internalFormat:"RGBA32F",type:"FLOAT",minFilter:"NEAREST",magFilter:"NEAREST",history:n}),l.initializeTexture("u_faceMask",M,{minFilter:"NEAREST",magFilter:"NEAREST",history:n}),O.then(()=>{h||!r||u("face:ready")})});let y=0,G=[],j=()=>{n&&(W(y),G.push(y),y=(y+1)%(n+1))};l.on("initializeTexture",(s,E)=>{s===e&&ne(E)&&(j(),w(E))}),l.on("updateTextures",(s,E)=>{let A=s[e];ne(A)&&(I=E?.skipHistoryWrite??!1,I||j(),w(A))}),l.on("destroy",()=>{h=!0,r&&(r.subscribers.delete(W),r.subscribers.size===0&&(r.landmarker.close(),r.mask.gl.deleteProgram(r.mask.regionProgram),r.mask.gl.deleteProgram(r.mask.blitProgram),r.mask.gl.deleteBuffer(r.mask.regionPositionBuffer),r.mask.gl.deleteBuffer(r.mask.quadBuffer),r.mask.gl.deleteTexture(r.mask.scratchTexture),r.mask.gl.deleteFramebuffer(r.mask.scratchFramebuffer),X.delete(c))),r=null});let{fn:x,historyParams:Y}=me(n),q=n?"_sampleFaceMask(pos, framesAgo)":"texture(u_faceMask, pos)",ee=Array.from({length:oe-1},(s,E)=>`step(${2**(E+1)}.0, faceBitF)`).join(" + "),J=a.maxFaces<=oe?`uint faceBits = (uint(mask.b * ${$}.0 + 0.5) << 8) | uint(mask.g * ${$}.0 + 0.5);
	uint faceBit = faceBits & (~faceBits + 1u);
	float faceBitF = float(faceBit);
	float hasFace = sign(faceBitF);
	float faceIndex = ${ee} - (1.0 - hasFace);`:`float faceIndex = float(int(uint(mask.b * ${$}.0 + 0.5)) - 1);`,f=(s,...E)=>x("vec2",`${s}At`,"vec2 pos",`vec4 mask = ${q};
	${J}
	uint bits = uint(mask.r * ${$}.0 + 0.5);
	float hit = sign(float(bits & ${E.reduce((A,v)=>A|Re[v],0)}u));
	return vec2(hit, mix(-1.0, faceIndex, hit));`),R=(s,E,A)=>x("vec2",`${s}At`,"vec2 pos",`vec2 left = ${E}(pos${Y});
	vec2 right = ${A}(pos${Y});
	return mix(right, left, left.x);`),V=s=>s.map(E=>x("float",`in${E[0].toUpperCase()+E.slice(1)}`,"vec2 pos",`vec2 a = ${E}At(pos${Y}); return step(0.0, a.y) * a.x;`)).join(`
`);_(`
uniform int u_maxFaces;
uniform int u_nFaces;
uniform highp sampler2D${n?"Array":""} u_faceLandmarksTex;${n?`
uniform int u_faceLandmarksTexFrameOffset;`:""}
uniform mediump sampler2D${n?"Array":""} u_faceMask;${n?`
uniform int u_faceMaskFrameOffset;`:""}

#define FACE_LANDMARK_L_EYE_CENTER ${Ae}
#define FACE_LANDMARK_R_EYE_CENTER ${Te}
#define FACE_LANDMARK_NOSE_TIP ${Me}
#define FACE_LANDMARK_FACE_CENTER ${Fe}
#define FACE_LANDMARK_MOUTH_CENTER ${ie}

${x("int","nFacesAt","",n?`
	int layer = (u_faceLandmarksTexFrameOffset - framesAgo + ${n+1}) % ${n+1};
	return int(texelFetch(u_faceLandmarksTex, ivec3(0, 0, layer), 0).r + 0.5);`:`
	return int(texelFetch(u_faceLandmarksTex, ivec2(0, 0), 0).r + 0.5);`)}
${x("vec4","faceLandmark","int faceIndex, int landmarkIndex",`int i = ${D} + faceIndex * ${L} + landmarkIndex;
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
${f("leftEyebrow","LEFT_EYEBROW")}
${f("rightEyebrow","RIGHT_EYEBROW")}
${f("leftEye","LEFT_EYE")}
${f("rightEye","RIGHT_EYE")}
${f("lips","MOUTH")}
${f("mouth","MOUTH","INNER_MOUTH")}
${f("innerMouth","INNER_MOUTH")}
${f("faceOval","OVAL")}
${x("vec2","faceAt","vec2 pos",`vec4 mask = ${q};
	${J}
	return vec2(step(0.0, faceIndex), faceIndex);`)}
${R("eye","leftEyeAt","rightEyeAt")}
${R("eyebrow","leftEyebrowAt","rightEyebrowAt")}
${V(["eyebrow","eye","mouth","innerMouth","lips","face"])}`)}}var $e=Pe;export{$e as default};
//# sourceMappingURL=face.mjs.map