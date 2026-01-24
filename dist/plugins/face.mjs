import{a as b,b as G,c as D,d as w}from"../chunk-IW3Y5DYQ.mjs";var J=`#version 300 es
in vec2 a_pos;
void main() { gl_Position = vec4(a_pos * 2.0 - 1.0, 0.0, 1.0); }`,Q=`#version 300 es
precision mediump float;
uniform vec4 u_color;
out vec4 outColor;
void main() { outColor = u_color; }`,I=478,Z=2,d=I+Z,F=512,W=[336,296,334,293,300,276,283,282,295,285],V=[362,398,384,385,386,387,388,466,263,249,390,373,374,380,381,382],$=[70,63,105,66,107,55,65,52,53,46],K=[33,246,161,160,159,158,157,173,133,155,154,153,145,144,163,7],z=[61,185,40,39,37,0,267,269,270,409,291,375,321,405,314,17,84,181,91,146],S=[78,191,80,81,82,13,312,311,310,415,308,324,318,402,317,14,87,178,88,95],ee=Array.from({length:I},(n,e)=>e),v={LEFT_EYEBROW:W,LEFT_EYE:V,LEFT_EYE_CENTER:473,RIGHT_EYEBROW:$,RIGHT_EYE:K,RIGHT_EYE_CENTER:468,NOSE_TIP:4,OUTER_MOUTH:z,INNER_MOUTH:S,FACE_CENTER:I,MOUTH_CENTER:I+1},j=["BACKGROUND","LEFT_EYEBROW","RIGHT_EYEBROW","LEFT_EYE","RIGHT_EYE","OUTER_MOUTH","INNER_MOUTH"],X=j.length-1,R=Object.fromEntries(j.map((n,e)=>[n,e/X])),P=.5/X,te={modelPath:"https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",maxFaces:1,minFaceDetectionConfidence:.5,minFacePresenceConfidence:.5,minTrackingConfidence:.5,outputFaceBlendshapes:!1,outputFacialTransformationMatrixes:!1};function g(n){let e=[];for(let o=1;o<n.length-1;++o)e.push(n[0],n[o],n[o+1]);return e}var f=null;function ae(n){if(!f){let e=n.FACE_LANDMARKS_TESSELATION,o=[];for(let a=0;a<e.length-2;a+=3)o.push(e[a].start,e[a+1].start,e[a+2].start);let i=n.FACE_LANDMARKS_FACE_OVAL.map(({start:a})=>a);f=Object.fromEntries(Object.entries({LEFT_EYEBROW:g(W),RIGHT_EYEBROW:g($),LEFT_EYE:g(V),RIGHT_EYE:g(K),OUTER_MOUTH:g(z),INNER_MOUTH:g(S),TESSELATION:o,OVAL:g(i)}).map(([a,E])=>[a,{triangles:E,vertices:new Float32Array(E.length*2)}]))}}var x=new Map;function ne(n){let e=n.mask.canvas.getContext("webgl2",{antialias:!1,preserveDrawingBuffer:!0}),o=e.createShader(e.VERTEX_SHADER);e.shaderSource(o,J),e.compileShader(o);let i=e.createShader(e.FRAGMENT_SHADER);e.shaderSource(i,Q),e.compileShader(i);let a=e.createProgram();e.attachShader(a,o),e.attachShader(a,i),e.linkProgram(a),e.deleteShader(o),e.deleteShader(i);let E=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,E);let l=e.getAttribLocation(a,"a_pos");e.enableVertexAttribArray(l),e.vertexAttribPointer(l,2,e.FLOAT,!1,0,0);let s=e.getUniformLocation(a,"u_color");e.useProgram(a),e.enable(e.BLEND),e.blendEquation(e.MAX),n.mask={...n.mask,gl:e,program:a,positionBuffer:E,colorLocation:s}}function p(n,e,o,i,a,E){let{triangles:l,vertices:s}=e,{mask:{gl:c,colorLocation:_},landmarks:u}=n,{data:L}=u;for(let T=0;T<l.length;++T){let N=(o*d+l[T])*4;s[T*2]=L[N],s[T*2+1]=L[N+1]}c.bufferData(c.ARRAY_BUFFER,s,c.DYNAMIC_DRAW),c.uniform4f(_,i,a,E,1),c.drawArrays(c.TRIANGLES,0,l.length)}function se(n,e){let o=n.landmarks.data,i=e.length;for(let a=0;a<i;++a){let E=e[a];for(let c=0;c<I;++c){let _=E[c],u=(a*d+c)*4;o[u]=_.x,o[u+1]=1-_.y,o[u+2]=_.z??0,o[u+3]=_.visibility??1}let l=D(o,a,ee,d);o.set(l,(a*d+v.FACE_CENTER)*4);let s=D(o,a,S,d);o.set(s,(a*d+v.MOUTH_CENTER)*4)}n.state.nFaces=i}function oe(n){if(!f)return;let{mask:e,canvas:o,maxFaces:i,state:{nFaces:a}}=n,{gl:E,canvas:l}=e;l.width=o.width,l.height=o.height,E.viewport(0,0,l.width,l.height),E.clearColor(0,0,0,0),E.clear(E.COLOR_BUFFER_BIT);for(let s=0;s<a;++s){let c=(s+1)/i;p(n,f.TESSELATION,s,0,.5,c),p(n,f.OVAL,s,0,1,c),p(n,f.LEFT_EYEBROW,s,R.LEFT_EYEBROW,0,c),p(n,f.RIGHT_EYEBROW,s,R.RIGHT_EYEBROW,0,c),p(n,f.LEFT_EYE,s,R.LEFT_EYE,0,c),p(n,f.RIGHT_EYE,s,R.RIGHT_EYE,0,c),p(n,f.OUTER_MOUTH,s,R.OUTER_MOUTH,0,c),p(n,f.INNER_MOUTH,s,R.INNER_MOUTH,0,c)}}function re(n){let{textureName:e,options:o={}}=n,i={...te,...o},a=G({...i,textureName:e}),E=i.maxFaces*d,l=Math.ceil(E/F);return function(s,c){let{injectGLSL:_,gl:u,emitHook:L}=c,T=x.get(a),N=T?.landmarks.data??new Float32Array(F*l*4),H=T?.mask.canvas??new OffscreenCanvas(1,1),t=null;function O(){if(!t)return;let r=t.state.nFaces,m=r*d,k=Math.ceil(m/F);s.updateTextures({u_faceLandmarksTex:{data:t.landmarks.data,width:F,height:k,isPartial:r<i.maxFaces},u_faceMask:t.mask.canvas}),s.updateUniforms({u_nFaces:r}),L("face:result",t.state.result)}async function q(){if(x.has(a))t=x.get(a);else{let[r,{FaceLandmarker:m}]=await Promise.all([w(),import("@mediapipe/tasks-vision")]),k=new OffscreenCanvas(1,1);t={landmarker:await m.createFromOptions(r,{baseOptions:{modelAssetPath:i.modelPath,delegate:"GPU"},canvas:k,runningMode:"VIDEO",numFaces:i.maxFaces,minFaceDetectionConfidence:i.minFaceDetectionConfidence,minFacePresenceConfidence:i.minFacePresenceConfidence,minTrackingConfidence:i.minTrackingConfidence,outputFaceBlendshapes:i.outputFaceBlendshapes,outputFacialTransformationMatrixes:i.outputFacialTransformationMatrixes}),canvas:k,subscribers:new Map,maxFaces:i.maxFaces,state:{runningMode:"VIDEO",source:null,videoTime:-1,resultTimestamp:0,result:null,pending:Promise.resolve(),nFaces:0},landmarks:{data:N,textureHeight:l},mask:{canvas:H}},ae(m),ne(t),x.set(a,t)}t.subscribers.set(O,!1)}let U=q(),y=0;async function Y(r){let m=performance.now(),k=++y;await U,t&&(t.state.pending=t.state.pending.then(async()=>{if(k!==y||!t)return;let C=r instanceof HTMLVideoElement?"VIDEO":"IMAGE";t.state.runningMode!==C&&(t.state.runningMode=C,await t.landmarker.setOptions({runningMode:C}));let h=!1;if(r!==t.state.source?(t.state.source=r,t.state.videoTime=-1,h=!0):r instanceof HTMLVideoElement?r.currentTime!==t.state.videoTime&&(t.state.videoTime=r.currentTime,h=!0):r instanceof HTMLImageElement||m-t.state.resultTimestamp>2&&(h=!0),h){let M;if(r instanceof HTMLVideoElement){if(r.videoWidth===0||r.videoHeight===0||r.readyState<2)return;M=t.landmarker.detectForVideo(r,m)}else{if(r.width===0||r.height===0)return;M=t.landmarker.detect(r)}if(M){t.state.resultTimestamp=m,t.state.result=M,se(t,M.faceLandmarks),oe(t);for(let B of t.subscribers.keys())B(),t.subscribers.set(B,!0)}}else t.state.result&&!t.subscribers.get(O)&&(O(),t.subscribers.set(O,!0))}),await t.state.pending)}s.on("init",()=>{s.initializeUniform("u_maxFaces","int",i.maxFaces),s.initializeUniform("u_nFaces","int",0),s.initializeTexture("u_faceLandmarksTex",{data:N,width:F,height:l},{internalFormat:u.RGBA32F,type:u.FLOAT,minFilter:u.NEAREST,magFilter:u.NEAREST}),s.initializeTexture("u_faceMask",H,{minFilter:u.NEAREST,magFilter:u.NEAREST}),U.then(()=>L("face:ready"))}),s.on("initializeTexture",(r,m)=>{r===e&&b(m)&&Y(m)}),s.on("updateTextures",r=>{let m=r[e];b(m)&&Y(m)}),s.on("destroy",()=>{t&&(t.subscribers.delete(O),t.subscribers.size===0&&(t.landmarker.close(),t.mask.gl.deleteProgram(t.mask.program),t.mask.gl.deleteBuffer(t.mask.positionBuffer),x.delete(a))),t=null});let A=(r,m=r)=>`vec4 mask = texture(u_faceMask, pos);
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return (mask.r > ${(R[r]-P).toFixed(4)} && mask.r < ${(R[m]+P).toFixed(4)}) ? vec2(1.0, faceIndex) : vec2(0.0, -1.0);`;_(`
uniform int u_maxFaces;
uniform int u_nFaces;
uniform sampler2D u_faceLandmarksTex;
uniform sampler2D u_faceMask;

#define FACE_LANDMARK_L_EYE_CENTER ${v.LEFT_EYE_CENTER}
#define FACE_LANDMARK_R_EYE_CENTER ${v.RIGHT_EYE_CENTER}
#define FACE_LANDMARK_NOSE_TIP ${v.NOSE_TIP}
#define FACE_LANDMARK_FACE_CENTER ${v.FACE_CENTER}
#define FACE_LANDMARK_MOUTH_CENTER ${v.MOUTH_CENTER}

vec4 faceLandmark(int faceIndex, int landmarkIndex) {
	int i = faceIndex * ${d} + landmarkIndex;
	int x = i % ${F};
	int y = i / ${F};
	return texelFetch(u_faceLandmarksTex, ivec2(x, y), 0);
}

vec2 leftEyebrowAt(vec2 pos) {
	${A("LEFT_EYEBROW")}
}

vec2 rightEyebrowAt(vec2 pos) {
	${A("RIGHT_EYEBROW")}
}

vec2 leftEyeAt(vec2 pos) {
	${A("LEFT_EYE")}
}

vec2 rightEyeAt(vec2 pos) {
	${A("RIGHT_EYE")}
}

vec2 lipsAt(vec2 pos) {
	${A("OUTER_MOUTH")}
}

vec2 outerMouthAt(vec2 pos) {
	${A("OUTER_MOUTH","INNER_MOUTH")}
}

vec2 innerMouthAt(vec2 pos) {
	${A("INNER_MOUTH")}
}

vec2 faceOvalAt(vec2 pos) {
	vec4 mask = texture(u_faceMask, pos);
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return mask.g > 0.75 ? vec2(1.0, faceIndex) : vec2(0.0, -1.0);
}

// Includes face mesh and oval.
vec2 faceAt(vec2 pos) {
	vec4 mask = texture(u_faceMask, pos);
	float faceIndex = floor(mask.b * float(u_maxFaces) + 0.5) - 1.0;
	return mask.g > 0.25 ? vec2(1.0, faceIndex) : vec2(0.0, -1.0);
}

vec2 eyeAt(vec2 pos) {
	vec2 left = leftEyeAt(pos);
	return left.x > 0.0 ? left : rightEyeAt(pos);
}

vec2 eyebrowAt(vec2 pos) {
	vec2 left = leftEyebrowAt(pos);
	return left.x > 0.0 ? left : rightEyebrowAt(pos);
}

float inEyebrow(vec2 pos) { return eyebrowAt(pos).x; }
float inEye(vec2 pos) { return eyeAt(pos).x; }
float inOuterMouth(vec2 pos) { return outerMouthAt(pos).x; }
float inInnerMouth(vec2 pos) { return innerMouthAt(pos).x; }
float inLips(vec2 pos) { return lipsAt(pos).x; }
float inFace(vec2 pos) { return faceAt(pos).x; }`)}}var le=re;export{le as default};
//# sourceMappingURL=face.mjs.map