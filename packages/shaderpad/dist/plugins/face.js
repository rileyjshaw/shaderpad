Object.defineProperties(exports,{__esModule:{value:!0},[Symbol.toStringTag]:{value:`Module`}});const e=require("../util-DMwWEdcl.js"),t=require("./mediapipe-common.js"),n=`#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
	v_uv = a_pos;
	gl_Position = vec4(a_pos * 2.0 - 1.0, 0.0, 1.0);
}`,r=new Float32Array([0,0,1,0,0,1,0,1,1,0,1,1]),i=Array.from({length:478},(e,t)=>t);let a=null;const o=[`OVAL`,`LEFT_EYEBROW`,`RIGHT_EYEBROW`,`LEFT_EYE`,`RIGHT_EYE`,`MOUTH`,`INNER_MOUTH`],s=[`FACE_0`,`FACE_1`,`FACE_2`,`FACE_3`,`FACE_4`,`FACE_5`,`FACE_6`,`FACE_7`],c=[`FACE_8`,`FACE_9`,`FACE_10`,`FACE_11`,`FACE_12`,`FACE_13`,`FACE_14`,`FACE_15`],l=s.length+c.length;function u(e){return Object.fromEntries(e.map((e,t)=>[e,1<<t]))}function d(e){return Object.fromEntries(Object.entries(e).map(([e,t])=>[e,t/255]))}const f=u(o),p=u(s),m=u(c),h=d(f),g=d(p),_=d(m),v={modelPath:`https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task`,maxFaces:1,minFaceDetectionConfidence:.5,minFacePresenceConfidence:.5,minTrackingConfidence:.5,outputFaceBlendshapes:!1,outputFacialTransformationMatrixes:!1};function y(e){let t=[];for(let n=1;n<e.length-1;++n)t.push(e[0],e[n],e[n+1]);return t}function b(e){let t=Array(e.length+1);t[0]=e[0].start;for(let n=0;n<e.length;++n)t[n+1]=e[n].end;return t}function x(e,t){let n=[],r=Math.min(e.length,t.length);for(let i=0;i<r-1;++i)n.push(e[i],t[i],t[i+1],e[i],t[i+1],e[i+1]);return n}let S=null;function C(e){if(!S){let t=e.FACE_LANDMARKS_TESSELATION,n=e.FACE_LANDMARKS_LEFT_EYEBROW,r=b(n.slice(0,4)),i=b(n.slice(4,8)),o=e.FACE_LANDMARKS_RIGHT_EYEBROW,s=b(o.slice(0,4)),c=b(o.slice(4,8)),l=e.FACE_LANDMARKS_LEFT_EYE,u=b(l.slice(0,8)),d=b(l.slice(8,16)),f=e.FACE_LANDMARKS_RIGHT_EYE,p=b(f.slice(0,8)),m=b(f.slice(8,16)),h=e.FACE_LANDMARKS_LIPS,g=b(h.slice(0,10)),_=b(h.slice(10,20)),v=b(h.slice(20,30)),C=b(h.slice(30,40)),w=[...u,...d.slice(1,-1)],T=[...p,...m.slice(1,-1)];a=[...v,...C.slice(1,-1)];let E=new Int16Array(480).fill(-1);for(let e of w)E[e]=473;for(let e of T)E[e]=468;for(let e of a)E[e]=479;let D=e=>{let t=E[e];return t>=0?t:e},O=[];for(let e=0;e<t.length-2;e+=3){let n=D(t[e].start),r=D(t[e+1].start),i=D(t[e+2].start);n!==r&&n!==i&&r!==i&&O.push(n,r,i)}let k=x(r,i),A=x(s,c),j=x(u,d),M=x(p,m),N=[...x(g,v),...x(_,C)],P=x(v,C),F=b(e.FACE_LANDMARKS_FACE_OVAL).slice(0,-1);S=Object.fromEntries(Object.entries({LEFT_EYEBROW:k,RIGHT_EYEBROW:A,LEFT_EYE:j,RIGHT_EYE:M,MOUTH:N,INNER_MOUTH:P,TESSELATION:O,OVAL:y(F)}).map(([e,t])=>[e,{indices:t,vertices:new Float32Array(t.length*2)}]))}}const w=new Map,T=new Map;function E(t,n,r,i){let a=null,o=null,s=null;try{if(a=t.createShader(t.VERTEX_SHADER),o=t.createShader(t.FRAGMENT_SHADER),s=t.createProgram(),!a||!o||!s||(t.shaderSource(a,n),t.compileShader(a),!t.getShaderParameter(a,t.COMPILE_STATUS))||(t.shaderSource(o,r),t.compileShader(o),!t.getShaderParameter(o,t.COMPILE_STATUS))||(t.attachShader(s,a),t.attachShader(s,o),t.linkProgram(s),!t.getProgramParameter(s,t.LINK_STATUS)))throw Error();return s}catch{throw s&&t.deleteProgram(s),e.n(61,!1)}finally{a&&t.deleteShader(a),o&&t.deleteShader(o)}}function D(t){let i=t.getContext(`webgl2`,{antialias:!1,preserveDrawingBuffer:!0});if(!i)throw e.n(60,!1);let a=E(i,n,`#version 300 es
precision mediump float;
uniform vec4 u_color;
out vec4 outColor;
void main() { outColor = u_color; }`,`face-mask-region`),o=E(i,n,`#version 300 es
precision mediump float;
in vec2 v_uv;
uniform sampler2D u_texture;
out vec4 outColor;
void main() { outColor = texture(u_texture, v_uv); }`,`face-mask-blit`),s;try{let e=i.createBuffer(),n=i.getAttribLocation(a,`a_pos`),c=i.createBuffer();i.bindBuffer(i.ARRAY_BUFFER,c),i.bufferData(i.ARRAY_BUFFER,r,i.STATIC_DRAW);let l=i.getAttribLocation(o,`a_pos`),u=i.getUniformLocation(a,`u_color`),d=i.getUniformLocation(o,`u_texture`),f=i.createTexture();i.bindTexture(i.TEXTURE_2D,f),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MAG_FILTER,i.NEAREST),i.texImage2D(i.TEXTURE_2D,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,null);let p=i.createFramebuffer();if(i.bindFramebuffer(i.FRAMEBUFFER,p),i.framebufferTexture2D(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,f,0),s=i.checkFramebufferStatus(i.FRAMEBUFFER),i.bindFramebuffer(i.FRAMEBUFFER,null),!e||n<0||!c||l<0||!u||!d||!f||!p||s!==i.FRAMEBUFFER_COMPLETE)throw Error();return i.useProgram(o),i.uniform1i(d,0),i.colorMask(!0,!0,!0,!1),{canvas:t,gl:i,regionProgram:a,blitProgram:o,regionPositionBuffer:e,quadBuffer:c,regionPositionLocation:n,blitPositionLocation:l,colorLocation:u,textureLocation:d,scratchTexture:f,scratchFramebuffer:p}}catch{throw e.n(62,!1)}}function O(e,t,n){let{gl:r,canvas:i,scratchTexture:a}=e;i.width===t&&i.height===n||(i.width=t,i.height=n,r.bindTexture(r.TEXTURE_2D,a),r.texImage2D(r.TEXTURE_2D,0,r.RGBA,t,n,0,r.RGBA,r.UNSIGNED_BYTE,null))}function k(e,t,n,r,i,a,o){let{gl:s,regionProgram:c,regionPositionBuffer:l,regionPositionLocation:u,colorLocation:d,scratchFramebuffer:f}=e,p=1+r*480,{indices:m,vertices:h}=n;s.bindFramebuffer(s.FRAMEBUFFER,f),s.viewport(0,0,e.canvas.width,e.canvas.height),s.clearColor(0,0,0,0),s.clear(s.COLOR_BUFFER_BIT),s.useProgram(c),s.bindBuffer(s.ARRAY_BUFFER,l),s.enableVertexAttribArray(u),s.vertexAttribPointer(u,2,s.FLOAT,!1,0,0),s.enable(s.BLEND),s.blendEquation(s.MAX),s.blendFunc(s.ONE,s.ONE);for(let e=0;e<m.length;++e){let n=(p+m[e])*4;h[e*2]=t[n],h[e*2+1]=t[n+1]}s.bufferData(s.ARRAY_BUFFER,h,s.DYNAMIC_DRAW),s.uniform4f(d,i,a,o,1),s.drawArrays(s.TRIANGLES,0,m.length)}function A(e){let{gl:t,blitProgram:n,quadBuffer:r,blitPositionLocation:i,scratchTexture:a}=e;t.bindFramebuffer(t.FRAMEBUFFER,null),t.viewport(0,0,e.canvas.width,e.canvas.height),t.useProgram(n),t.bindBuffer(t.ARRAY_BUFFER,r),t.enableVertexAttribArray(i),t.vertexAttribPointer(i,2,t.FLOAT,!1,0,0),t.activeTexture(t.TEXTURE0),t.bindTexture(t.TEXTURE_2D,a),t.enable(t.BLEND),t.blendEquation(t.FUNC_ADD),t.blendFunc(t.ONE,t.ONE),t.drawArrays(t.TRIANGLES,0,6)}function j(e,n){let r=e.landmarks.data,o=n.length;r[0]=o;for(let e=0;e<o;++e){let o=n[e];for(let t=0;t<478;++t){let n=o[t],i=(1+e*480+t)*4;r[i]=n.x,r[i+1]=1-n.y,r[i+2]=n.z??0,r[i+3]=n.visibility??1}let s=t.calculateBoundingBoxCenter(r,e,i,480,1);r.set(s,(1+e*480+478)*4);let c=t.calculateBoundingBoxCenter(r,e,a,480,1);r.set(c,(1+e*480+479)*4)}e.state.nFaces=o}function M(e,t,n){let{mask:r,maxFaces:i,landmarks:a,state:{nFaces:o}}=e,{gl:u,canvas:d}=r,{data:f}=a;if(O(r,t,n),u.bindFramebuffer(u.FRAMEBUFFER,null),u.viewport(0,0,d.width,d.height),u.clearColor(0,0,0,0),u.clear(u.COLOR_BUFFER_BIT),!S)return;let p=i<=l;for(let e=0;e<o;++e){let t=p&&e<s.length?g[s[e]]:0,n=p?e<s.length?0:_[c[e-s.length]]:(e+1)/255;k(r,f,S.TESSELATION,e,0,t,n),A(r),k(r,f,S.OVAL,e,h.OVAL,0,0),A(r),k(r,f,S.LEFT_EYEBROW,e,h.LEFT_EYEBROW,0,0),A(r),k(r,f,S.RIGHT_EYEBROW,e,h.RIGHT_EYEBROW,0,0),A(r),k(r,f,S.LEFT_EYE,e,h.LEFT_EYE,0,0),A(r),k(r,f,S.RIGHT_EYE,e,h.RIGHT_EYE,0,0),A(r),k(r,f,S.MOUTH,e,h.MOUTH,0,0),A(r),k(r,f,S.INNER_MOUTH,e,h.INNER_MOUTH,0,0),A(r)}}function N(e){let{textureName:n,wasmBaseUrl:r=t.DEFAULT_WASM_BASE_URL,options:{history:i,...a}={}}=e,o={...v,...a},s=t.hashOptions({...o,textureName:n,wasmBaseUrl:r}),c=o.maxFaces*480+1,u=Math.ceil(c/512);return function(e,a){let{injectGLSL:c,emit:d,updateTexture:p}=a,m=w.get(s),h=m?.landmarks.data??new Float32Array(512*u*4),g=m?.mediapipeCanvas??new OffscreenCanvas(1,1),_=m?.mask.canvas??new OffscreenCanvas(1,1),v,y=!1,b=-1,x=[];function S(t){if(y||!v)return;let n=v.state.nFaces,r=n*480+1,a=Math.ceil(r/512),o=i?t:void 0;p(`u_faceLandmarksTex`,{data:v.landmarks.data,width:512,height:a,isPartial:!0},o),p(`u_faceMask`,v.mask.canvas,o),e.updateUniforms({u_nFaces:n},{allowMissing:!0})}function E(){y||!v||(i?(S(x.length>0?x:b),x=[]):S(b),d(`face:result`,v.state.result))}function O(){if(y||!v)return;let e=v.subscribers;for(let[t,n]of e)if(n){if(t(),y)return;e.has(t)&&e.set(t,!1)}}async function k(){v=await t.getOrCreateSharedResource(s,w,T,async()=>{let[e,{FaceLandmarker:n}]=await Promise.all([t.getSharedFileset(r),import(`@mediapipe/tasks-vision`)]);if(y)return;let i=await n.createFromOptions(e,{baseOptions:{modelAssetPath:o.modelPath,delegate:`GPU`},canvas:g,runningMode:`VIDEO`,numFaces:o.maxFaces,minFaceDetectionConfidence:o.minFaceDetectionConfidence,minFacePresenceConfidence:o.minFacePresenceConfidence,minTrackingConfidence:o.minTrackingConfidence,outputFaceBlendshapes:o.outputFaceBlendshapes,outputFacialTransformationMatrixes:o.outputFacialTransformationMatrixes});if(y){i.close();return}let a={landmarker:i,mediapipeCanvas:g,mask:D(_),subscribers:new Map,maxFaces:o.maxFaces,state:{nCalls:0,runningMode:`VIDEO`,source:null,videoTime:-1,resultTimestamp:0,result:null,pending:Promise.resolve(),nFaces:0},landmarks:{data:h,textureHeight:u}};return C(n),a}),!(!v||y)&&v.subscribers.set(E,!1)}let A=k();async function N(e){let t=performance.now();if(await A,y||!v)return;let n=++v.state.nCalls;v.state.pending=v.state.pending.then(async()=>{if(y||!v||n!==v.state.nCalls)return;let r=e instanceof HTMLVideoElement?`VIDEO`:`IMAGE`;if(v.state.runningMode!==r&&(v.state.runningMode=r,await v.landmarker.setOptions({runningMode:r}),y||!v||n!==v.state.nCalls))return;let i=!1;if(e===v.state.source?e instanceof HTMLVideoElement?e.currentTime!==v.state.videoTime&&(v.state.videoTime=e.currentTime,i=!0):e instanceof HTMLImageElement||t-v.state.resultTimestamp>2&&(i=!0):(v.state.source=e,v.state.videoTime=e instanceof HTMLVideoElement?e.currentTime:-1,i=!0),i){let n,r,i;if(e instanceof HTMLVideoElement){if(e.videoWidth===0||e.videoHeight===0||e.readyState<2)return;r=e.videoWidth,i=e.videoHeight,n=v.landmarker.detectForVideo(e,t)}else{if(e.width===0||e.height===0)return;r=e.width,i=e.height,n=v.landmarker.detect(e)}n&&(v.state.resultTimestamp=t,v.state.result=n,j(v,n.faceLandmarks),M(v,r,i),O())}else v.state.result&&O()}),await v.state.pending}e.on(`_init`,()=>{e.initializeUniform(`u_maxFaces`,`int`,o.maxFaces,{allowMissing:!0}),e.initializeUniform(`u_nFaces`,`int`,0,{allowMissing:!0}),e.initializeTexture(`u_faceLandmarksTex`,{data:h,width:512,height:u},{internalFormat:`RGBA32F`,type:`FLOAT`,minFilter:`NEAREST`,magFilter:`NEAREST`,history:i}),e.initializeTexture(`u_faceMask`,_,{minFilter:`NEAREST`,magFilter:`NEAREST`,history:i}),A.then(()=>{y||!v||d(`face:ready`)})});function P(e){y||!v||(i&&(b=(b+1)%(i+1),S(b),x.push(b)),v.subscribers.set(E,!0),N(e))}e.on(`initializeTexture`,(e,r)=>{e===n&&t.isMediaPipeSource(r)&&P(r)}),e.on(`updateTextures`,e=>{let r=e[n];t.isMediaPipeSource(r)&&P(r)}),e.on(`destroy`,()=>{y=!0,v&&(v.subscribers.delete(E),v.subscribers.size===0&&(v.landmarker.close(),v.mask.gl.deleteProgram(v.mask.regionProgram),v.mask.gl.deleteProgram(v.mask.blitProgram),v.mask.gl.deleteBuffer(v.mask.regionPositionBuffer),v.mask.gl.deleteBuffer(v.mask.quadBuffer),v.mask.gl.deleteTexture(v.mask.scratchTexture),v.mask.gl.deleteFramebuffer(v.mask.scratchFramebuffer),w.delete(s))),v=void 0});let{fn:F,historyParams:I}=t.generateGLSLFn(i),L=i?`_sampleFaceMask(pos, framesAgo)`:`texture(u_faceMask, pos)`,R=Array.from({length:l-1},(e,t)=>`step(${2**(t+1)}.0, faceBitF)`).join(` + `),z=o.maxFaces<=l?`uint faceBits = (uint(mask.b * 255.0 + 0.5) << 8) | uint(mask.g * 255.0 + 0.5);
	uint faceBit = faceBits & (~faceBits + 1u);
	float faceBitF = float(faceBit);
	float hasFace = sign(faceBitF);
	float faceIndex = ${R} - (1.0 - hasFace);`:`float faceIndex = float(int(uint(mask.b * 255.0 + 0.5)) - 1);`,B=(e,...t)=>F(`vec2`,`${e}At`,`vec2 pos`,`vec4 mask = ${L};
	${z}
	uint bits = uint(mask.r * 255.0 + 0.5);
	float hit = sign(float(bits & ${t.reduce((e,t)=>e|f[t],0)}u));
	return vec2(hit, mix(-1.0, faceIndex, hit));`),V=(e,t,n)=>F(`vec2`,`${e}At`,`vec2 pos`,`vec2 left = ${t}(pos${I});
	vec2 right = ${n}(pos${I});
	return mix(right, left, left.x);`);c(`
uniform int u_maxFaces;
uniform int u_nFaces;
uniform highp sampler2D${i?`Array`:``} u_faceLandmarksTex;${i?`
uniform int u_faceLandmarksTexFrameOffset;`:``}
uniform mediump sampler2D${i?`Array`:``} u_faceMask;${i?`
uniform int u_faceMaskFrameOffset;`:``}

#define FACE_LANDMARK_L_EYE_CENTER 473
#define FACE_LANDMARK_R_EYE_CENTER 468
#define FACE_LANDMARK_NOSE_TIP 4
#define FACE_LANDMARK_FACE_CENTER 478
#define FACE_LANDMARK_MOUTH_CENTER 479

${F(`int`,`nFacesAt`,``,i?`
	int layer = (u_faceLandmarksTexFrameOffset - framesAgo + ${i+1}) % ${i+1};
	return int(texelFetch(u_faceLandmarksTex, ivec3(0, 0, layer), 0).r + 0.5);`:`
	return int(texelFetch(u_faceLandmarksTex, ivec2(0, 0), 0).r + 0.5);`)}
${F(`vec4`,`faceLandmark`,`int faceIndex, int landmarkIndex`,`int i = 1 + faceIndex * 480 + landmarkIndex;
	int x = i % 512;
	int y = i / 512;${i?`
	int layer = (u_faceLandmarksTexFrameOffset - framesAgo + ${i+1}) % ${i+1};
	return texelFetch(u_faceLandmarksTex, ivec3(x, y, layer), 0);`:`
	return texelFetch(u_faceLandmarksTex, ivec2(x, y), 0);`}`)}
${i?`
vec4 _sampleFaceMask(vec2 pos, int framesAgo) {
	int layer = (u_faceMaskFrameOffset - framesAgo + ${i+1}) % ${i+1};
	return texture(u_faceMask, vec3(pos, float(layer)));
}
`:``}
${B(`leftEyebrow`,`LEFT_EYEBROW`)}
${B(`rightEyebrow`,`RIGHT_EYEBROW`)}
${B(`leftEye`,`LEFT_EYE`)}
${B(`rightEye`,`RIGHT_EYE`)}
${B(`lips`,`MOUTH`)}
${B(`mouth`,`MOUTH`,`INNER_MOUTH`)}
${B(`innerMouth`,`INNER_MOUTH`)}
${B(`faceOval`,`OVAL`)}
${F(`vec2`,`faceAt`,`vec2 pos`,`vec4 mask = ${L};
	${z}
	return vec2(step(0.0, faceIndex), faceIndex);`)}
${V(`eye`,`leftEyeAt`,`rightEyeAt`)}
${V(`eyebrow`,`leftEyebrowAt`,`rightEyebrowAt`)}
${(e=>e.map(e=>F(`float`,`in${e[0].toUpperCase()+e.slice(1)}`,`vec2 pos`,`vec2 a = ${e}At(pos${I}); return step(0.0, a.y) * a.x;`)).join(`
`))([`eyebrow`,`eye`,`mouth`,`innerMouth`,`lips`,`face`])}`)}}exports.default=N;
//# sourceMappingURL=face.js.map