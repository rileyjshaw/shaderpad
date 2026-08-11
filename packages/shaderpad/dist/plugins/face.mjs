import{n as e}from"../util-Di5oyR2s.mjs";import{DEFAULT_WASM_BASE_URL as t,calculateBoundingBoxCenter as n,generateGLSLFn as r,getOrCreateSharedResource as i,getSharedFileset as a,hashOptions as o,isMediaPipeSource as s,reportMediaPipeError as c}from"./mediapipe-common.mjs";const l=`#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
	v_uv = a_pos;
	gl_Position = vec4(a_pos * 2.0 - 1.0, 0.0, 1.0);
}`,u=new Float32Array([0,0,1,0,0,1,0,1,1,0,1,1]),d=Array.from({length:478},(e,t)=>t);let f=null;const p=[`OVAL`,`LEFT_EYEBROW`,`RIGHT_EYEBROW`,`LEFT_EYE`,`RIGHT_EYE`,`MOUTH`,`INNER_MOUTH`],m=[`FACE_0`,`FACE_1`,`FACE_2`,`FACE_3`,`FACE_4`,`FACE_5`,`FACE_6`,`FACE_7`],h=[`FACE_8`,`FACE_9`,`FACE_10`,`FACE_11`,`FACE_12`,`FACE_13`,`FACE_14`,`FACE_15`],g=m.length+h.length;function _(e){return Object.fromEntries(e.map((e,t)=>[e,1<<t]))}function v(e){return Object.fromEntries(Object.entries(e).map(([e,t])=>[e,t/255]))}const y=_(p),b=_(m),x=_(h),S=v(y),C=v(b),w=v(x),T={modelPath:`https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task`,delegate:`GPU`,maxFaces:1,minFaceDetectionConfidence:.5,minFacePresenceConfidence:.5,minTrackingConfidence:.5,outputFaceBlendshapes:!1,outputFacialTransformationMatrixes:!1};function E(e){let t=[];for(let n=1;n<e.length-1;++n)t.push(e[0],e[n],e[n+1]);return t}function D(e){let t=Array(e.length+1);t[0]=e[0].start;for(let n=0;n<e.length;++n)t[n+1]=e[n].end;return t}function O(e,t){let n=[],r=Math.min(e.length,t.length);for(let i=0;i<r-1;++i)n.push(e[i],t[i],t[i+1],e[i],t[i+1],e[i+1]);return n}let k=null;function A(e){if(!k){let t=e.FACE_LANDMARKS_TESSELATION,n=e.FACE_LANDMARKS_LEFT_EYEBROW,r=D(n.slice(0,4)),i=D(n.slice(4,8)),a=e.FACE_LANDMARKS_RIGHT_EYEBROW,o=D(a.slice(0,4)),s=D(a.slice(4,8)),c=e.FACE_LANDMARKS_LEFT_EYE,l=D(c.slice(0,8)),u=D(c.slice(8,16)),d=e.FACE_LANDMARKS_RIGHT_EYE,p=D(d.slice(0,8)),m=D(d.slice(8,16)),h=e.FACE_LANDMARKS_LIPS,g=D(h.slice(0,10)),_=D(h.slice(10,20)),v=D(h.slice(20,30)),y=D(h.slice(30,40)),b=[...l,...u.slice(1,-1)],x=[...p,...m.slice(1,-1)];f=[...v,...y.slice(1,-1)];let S=new Int16Array(480).fill(-1);for(let e of b)S[e]=473;for(let e of x)S[e]=468;for(let e of f)S[e]=479;let C=e=>{let t=S[e];return t>=0?t:e},w=[];for(let e=0;e<t.length-2;e+=3){let n=C(t[e].start),r=C(t[e+1].start),i=C(t[e+2].start);n!==r&&n!==i&&r!==i&&w.push(n,r,i)}let T=O(r,i),A=O(o,s),j=O(l,u),M=O(p,m),N=[...O(g,v),...O(_,y)],P=O(v,y),F=D(e.FACE_LANDMARKS_FACE_OVAL).slice(0,-1);k=Object.fromEntries(Object.entries({LEFT_EYEBROW:T,RIGHT_EYEBROW:A,LEFT_EYE:j,RIGHT_EYE:M,MOUTH:N,INNER_MOUTH:P,TESSELATION:w,OVAL:E(F)}).map(([e,t])=>[e,{indices:t,vertices:new Float32Array(t.length*2)}]))}}const j=new Map,M=new Map;function N(t,n,r,i){let a=null,o=null,s=null;try{if(a=t.createShader(t.VERTEX_SHADER),o=t.createShader(t.FRAGMENT_SHADER),s=t.createProgram(),!a||!o||!s||(t.shaderSource(a,n),t.compileShader(a),!t.getShaderParameter(a,t.COMPILE_STATUS))||(t.shaderSource(o,r),t.compileShader(o),!t.getShaderParameter(o,t.COMPILE_STATUS))||(t.attachShader(s,a),t.attachShader(s,o),t.linkProgram(s),!t.getProgramParameter(s,t.LINK_STATUS)))throw Error();return s}catch{throw s&&t.deleteProgram(s),e(61,!1)}finally{a&&t.deleteShader(a),o&&t.deleteShader(o)}}function P(t){let n=t.getContext(`webgl2`,{antialias:!1,preserveDrawingBuffer:!0});if(!n)throw e(60,!1);let r=N(n,l,`#version 300 es
precision mediump float;
uniform vec4 u_color;
out vec4 outColor;
void main() { outColor = u_color; }`,`face-mask-region`),i=N(n,l,`#version 300 es
precision mediump float;
in vec2 v_uv;
uniform sampler2D u_texture;
out vec4 outColor;
void main() { outColor = texture(u_texture, v_uv); }`,`face-mask-blit`),a;try{let e=n.createBuffer(),o=n.getAttribLocation(r,`a_pos`),s=n.createBuffer();n.bindBuffer(n.ARRAY_BUFFER,s),n.bufferData(n.ARRAY_BUFFER,u,n.STATIC_DRAW);let c=n.getAttribLocation(i,`a_pos`),l=n.getUniformLocation(r,`u_color`),d=n.getUniformLocation(i,`u_texture`),f=n.createTexture();n.bindTexture(n.TEXTURE_2D,f),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MAG_FILTER,n.NEAREST),n.texImage2D(n.TEXTURE_2D,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,null);let p=n.createFramebuffer();if(n.bindFramebuffer(n.FRAMEBUFFER,p),n.framebufferTexture2D(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,f,0),a=n.checkFramebufferStatus(n.FRAMEBUFFER),n.bindFramebuffer(n.FRAMEBUFFER,null),!e||o<0||!s||c<0||!l||!d||!f||!p||a!==n.FRAMEBUFFER_COMPLETE)throw Error();return n.useProgram(i),n.uniform1i(d,0),n.colorMask(!0,!0,!0,!1),{canvas:t,gl:n,regionProgram:r,blitProgram:i,regionPositionBuffer:e,quadBuffer:s,regionPositionLocation:o,blitPositionLocation:c,colorLocation:l,textureLocation:d,scratchTexture:f,scratchFramebuffer:p}}catch{throw e(62,!1)}}function F(e,t,n){let{gl:r,canvas:i,scratchTexture:a}=e;(i.width!==t||i.height!==n)&&(i.width=t,i.height=n,r.bindTexture(r.TEXTURE_2D,a),r.texImage2D(r.TEXTURE_2D,0,r.RGBA,t,n,0,r.RGBA,r.UNSIGNED_BYTE,null))}function I(e,t,n,r,i,a,o){let{gl:s,regionProgram:c,regionPositionBuffer:l,regionPositionLocation:u,colorLocation:d,scratchFramebuffer:f}=e,p=1+r*480,{indices:m,vertices:h}=n;s.bindFramebuffer(s.FRAMEBUFFER,f),s.viewport(0,0,e.canvas.width,e.canvas.height),s.clearColor(0,0,0,0),s.clear(s.COLOR_BUFFER_BIT),s.useProgram(c),s.bindBuffer(s.ARRAY_BUFFER,l),s.enableVertexAttribArray(u),s.vertexAttribPointer(u,2,s.FLOAT,!1,0,0),s.enable(s.BLEND),s.blendEquation(s.MAX),s.blendFunc(s.ONE,s.ONE);for(let e=0;e<m.length;++e){let n=(p+m[e])*4;h[e*2]=t[n],h[e*2+1]=t[n+1]}s.bufferData(s.ARRAY_BUFFER,h,s.DYNAMIC_DRAW),s.uniform4f(d,i,a,o,1),s.drawArrays(s.TRIANGLES,0,m.length)}function L(e){let{gl:t,blitProgram:n,quadBuffer:r,blitPositionLocation:i,scratchTexture:a}=e;t.bindFramebuffer(t.FRAMEBUFFER,null),t.viewport(0,0,e.canvas.width,e.canvas.height),t.useProgram(n),t.bindBuffer(t.ARRAY_BUFFER,r),t.enableVertexAttribArray(i),t.vertexAttribPointer(i,2,t.FLOAT,!1,0,0),t.activeTexture(t.TEXTURE0),t.bindTexture(t.TEXTURE_2D,a),t.enable(t.BLEND),t.blendEquation(t.FUNC_ADD),t.blendFunc(t.ONE,t.ONE),t.drawArrays(t.TRIANGLES,0,6)}function R(e,t){let r=e.landmarks,i=t.length;r[0]=i;for(let e=0;e<i;++e){let i=t[e];for(let t=0;t<478;++t){let n=i[t],a=(1+e*480+t)*4;r[a]=n.x,r[a+1]=1-n.y,r[a+2]=n.z??0,r[a+3]=n.visibility??1}let a=n(r,e,d,480,1);r.set(a,(1+e*480+478)*4);let o=n(r,e,f,480,1);r.set(o,(1+e*480+479)*4)}e.state.nFaces=i}function z(e,t,n){let{mask:r,maxFaces:i,landmarks:a,state:{nFaces:o}}=e,{gl:s,canvas:c}=r,l=a;if(F(r,t,n),s.bindFramebuffer(s.FRAMEBUFFER,null),s.viewport(0,0,c.width,c.height),s.clearColor(0,0,0,0),s.clear(s.COLOR_BUFFER_BIT),!k)return;let u=i<=g;for(let e=0;e<o;++e){let t=u&&e<m.length?C[m[e]]:0,n=u?e<m.length?0:w[h[e-m.length]]:(e+1)/255;I(r,l,k.TESSELATION,e,0,t,n),L(r),I(r,l,k.OVAL,e,S.OVAL,0,0),L(r),I(r,l,k.LEFT_EYEBROW,e,S.LEFT_EYEBROW,0,0),L(r),I(r,l,k.RIGHT_EYEBROW,e,S.RIGHT_EYEBROW,0,0),L(r),I(r,l,k.LEFT_EYE,e,S.LEFT_EYE,0,0),L(r),I(r,l,k.RIGHT_EYE,e,S.RIGHT_EYE,0,0),L(r),I(r,l,k.MOUTH,e,S.MOUTH,0,0),L(r),I(r,l,k.INNER_MOUTH,e,S.INNER_MOUTH,0,0),L(r)}}function B(e){let{textureName:n,wasmBaseUrl:l=t,options:{history:u,...d}={}}=e,f={...T,...d},p=o({...f,textureName:n,wasmBaseUrl:l}),m=f.maxFaces*480+1,h=Math.ceil(m/512);return function(e,t){let{injectGLSL:o,emit:d,updateTexture:m}=t,_=j.get(p),v=_?.landmarks??new Float32Array(512*h*4),b=_?.mask.canvas??new OffscreenCanvas(1,1),x,S=!1,C=-1,w=[];function T(t){if(S||!x)return;let n=x.state.nFaces,r=n*480+1,i=Math.ceil(r/512),a=u?t:void 0;m(`u_faceLandmarksTex`,{data:x.landmarks,width:512,height:i,isPartial:!0},a),m(`u_faceMask`,x.mask.canvas,a),e.updateUniforms({u_nFaces:n},{allowMissing:!0})}function E(){S||!x||(u?(T(w.length>0?w:C),w=[]):T(C),d(`face:result`,x.state.result))}function D(){if(S||!x)return;let e=x.subscribers;for(let[t,n]of e)if(n){if(t(),S)return;e.has(t)&&e.set(t,!1)}}async function O(){x=await i(p,j,M,async()=>{let[e,{FaceLandmarker:t}]=await Promise.all([a(l),import(`@mediapipe/tasks-vision`)]);if(S)return;let n=await t.createFromOptions(e,{baseOptions:{modelAssetPath:f.modelPath,delegate:f.delegate},canvas:new OffscreenCanvas(1,1),runningMode:`VIDEO`,numFaces:f.maxFaces,minFaceDetectionConfidence:f.minFaceDetectionConfidence,minFacePresenceConfidence:f.minFacePresenceConfidence,minTrackingConfidence:f.minTrackingConfidence,outputFaceBlendshapes:f.outputFaceBlendshapes,outputFacialTransformationMatrixes:f.outputFacialTransformationMatrixes});if(S){n.close();return}let r={landmarker:n,mask:P(b),subscribers:new Map,maxFaces:f.maxFaces,state:{nCalls:0,runningMode:`VIDEO`,source:null,videoTime:-1,resultTimestamp:0,result:null,pending:Promise.resolve(),nFaces:0},landmarks:v};return A(t),r}),!(!x||S)&&x.subscribers.set(E,!1)}let k=O().catch(e=>{S||c(e,`face`)});async function N(e){let t=performance.now();if(await k,S||!x)return;let n=++x.state.nCalls;x.state.pending=x.state.pending.then(async()=>{if(S||!x||n!==x.state.nCalls)return;let r=e instanceof HTMLVideoElement?`VIDEO`:`IMAGE`;if(x.state.runningMode!==r&&(x.state.runningMode=r,await x.landmarker.setOptions({runningMode:r}),S||!x||n!==x.state.nCalls))return;let i=!1;if(e===x.state.source?e instanceof HTMLVideoElement?e.currentTime!==x.state.videoTime&&(x.state.videoTime=e.currentTime,i=!0):e instanceof HTMLImageElement||t-x.state.resultTimestamp>2&&(i=!0):(x.state.source=e,x.state.videoTime=e instanceof HTMLVideoElement?e.currentTime:-1,i=!0),i){let n,r,i;if(e instanceof HTMLVideoElement){if(e.videoWidth===0||e.videoHeight===0||e.readyState<2)return;r=e.videoWidth,i=e.videoHeight,n=x.landmarker.detectForVideo(e,t)}else{if(e.width===0||e.height===0)return;r=e.width,i=e.height,n=x.landmarker.detect(e)}n&&(x.state.resultTimestamp=t,x.state.result=n,R(x,n.faceLandmarks),z(x,r,i),D())}else x.state.result&&D()}),await x.state.pending}e.on(`_init`,()=>{e.initializeUniform(`u_maxFaces`,`int`,f.maxFaces,{allowMissing:!0}),e.initializeUniform(`u_nFaces`,`int`,0,{allowMissing:!0}),e.initializeTexture(`u_faceLandmarksTex`,{data:v,width:512,height:h},{internalFormat:`RGBA32F`,type:`FLOAT`,minFilter:`NEAREST`,magFilter:`NEAREST`,history:u}),e.initializeTexture(`u_faceMask`,b,{minFilter:`NEAREST`,magFilter:`NEAREST`,history:u}),k.then(()=>{S||!x||d(`face:ready`)})});function F(e){S||!x||(u&&(C=(C+1)%(u+1),T(C),w.push(C)),x.subscribers.set(E,!0),N(e))}e.on(`initializeTexture`,(e,t)=>{e===n&&s(t)&&F(t)}),e.on(`updateTextures`,e=>{let t=e[n];s(t)&&F(t)}),e.on(`destroy`,()=>{S=!0,x&&(x.subscribers.delete(E),x.subscribers.size===0&&(x.landmarker.close(),x.mask.gl.deleteProgram(x.mask.regionProgram),x.mask.gl.deleteProgram(x.mask.blitProgram),x.mask.gl.deleteBuffer(x.mask.regionPositionBuffer),x.mask.gl.deleteBuffer(x.mask.quadBuffer),x.mask.gl.deleteTexture(x.mask.scratchTexture),x.mask.gl.deleteFramebuffer(x.mask.scratchFramebuffer),j.delete(p))),x=void 0});let{fn:I,historyParams:L}=r(u),B=u?`_sampleFaceMask(pos, framesAgo)`:`texture(u_faceMask, pos)`,V=Array.from({length:g-1},(e,t)=>`step(${2**(t+1)}.0, faceBitF)`).join(` + `),H=f.maxFaces<=g?`uint faceBits = (uint(mask.b * 255.0 + 0.5) << 8) | uint(mask.g * 255.0 + 0.5);
	uint faceBit = faceBits & (~faceBits + 1u);
	float faceBitF = float(faceBit);
	float hasFace = sign(faceBitF);
	float faceIndex = ${V} - (1.0 - hasFace);`:`float faceIndex = float(int(uint(mask.b * 255.0 + 0.5)) - 1);`,U=(e,...t)=>I(`vec2`,`${e}At`,`vec2 pos`,`vec4 mask = ${B};
	${H}
	uint bits = uint(mask.r * 255.0 + 0.5);
	float hit = sign(float(bits & ${t.reduce((e,t)=>e|y[t],0)}u));
	return vec2(hit, mix(-1.0, faceIndex, hit));`),W=(e,t,n)=>I(`vec2`,`${e}At`,`vec2 pos`,`vec2 left = ${t}(pos${L});
	vec2 right = ${n}(pos${L});
	return mix(right, left, left.x);`);o(`
uniform int u_maxFaces;
uniform int u_nFaces;
uniform highp sampler2D${u?`Array`:``} u_faceLandmarksTex;${u?`
uniform int u_faceLandmarksTexFrameOffset;`:``}
uniform mediump sampler2D${u?`Array`:``} u_faceMask;${u?`
uniform int u_faceMaskFrameOffset;`:``}

#define FACE_LANDMARK_L_EYE_CENTER 473
#define FACE_LANDMARK_R_EYE_CENTER 468
#define FACE_LANDMARK_NOSE_TIP 4
#define FACE_LANDMARK_FACE_CENTER 478
#define FACE_LANDMARK_MOUTH_CENTER 479

${I(`int`,`nFacesAt`,``,u?`
	int layer = (u_faceLandmarksTexFrameOffset - framesAgo + ${u+1}) % ${u+1};
	return int(texelFetch(u_faceLandmarksTex, ivec3(0, 0, layer), 0).r + 0.5);`:`
	return int(texelFetch(u_faceLandmarksTex, ivec2(0, 0), 0).r + 0.5);`)}
${I(`vec4`,`faceLandmark`,`int faceIndex, int landmarkIndex`,`int i = 1 + faceIndex * 480 + landmarkIndex;
	int x = i % 512;
	int y = i / 512;${u?`
	int layer = (u_faceLandmarksTexFrameOffset - framesAgo + ${u+1}) % ${u+1};
	return texelFetch(u_faceLandmarksTex, ivec3(x, y, layer), 0);`:`
	return texelFetch(u_faceLandmarksTex, ivec2(x, y), 0);`}`)}
${u?`
vec4 _sampleFaceMask(vec2 pos, int framesAgo) {
	int layer = (u_faceMaskFrameOffset - framesAgo + ${u+1}) % ${u+1};
	return texture(u_faceMask, vec3(pos, float(layer)));
}
`:``}
${U(`leftEyebrow`,`LEFT_EYEBROW`)}
${U(`rightEyebrow`,`RIGHT_EYEBROW`)}
${U(`leftEye`,`LEFT_EYE`)}
${U(`rightEye`,`RIGHT_EYE`)}
${U(`lips`,`MOUTH`)}
${U(`mouth`,`MOUTH`,`INNER_MOUTH`)}
${U(`innerMouth`,`INNER_MOUTH`)}
${U(`faceOval`,`OVAL`)}
${I(`vec2`,`faceAt`,`vec2 pos`,`vec4 mask = ${B};
	${H}
	return vec2(step(0.0, faceIndex), faceIndex);`)}
${W(`eye`,`leftEyeAt`,`rightEyeAt`)}
${W(`eyebrow`,`leftEyebrowAt`,`rightEyebrowAt`)}
${(e=>e.map(e=>I(`float`,`in${e[0].toUpperCase()+e.slice(1)}`,`vec2 pos`,`vec2 a = ${e}At(pos${L}); return step(0.0, a.y) * a.x;`)).join(`
`))([`eyebrow`,`eye`,`mouth`,`innerMouth`,`lips`,`face`])}`)}}export{B as default};
//# sourceMappingURL=face.mjs.map