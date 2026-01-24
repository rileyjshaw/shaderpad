import{a as k}from"../chunk-5CBGNOA3.mjs";import{a as M,b as C,d as _}from"../chunk-IW3Y5DYQ.mjs";var P={data:new Uint8Array(4),width:1,height:1},D={modelPath:"https://storage.googleapis.com/mediapipe-models/image_segmenter/hair_segmenter/float32/latest/hair_segmenter.tflite",outputCategoryMask:!1};function O(o){let s=Array.from({length:o},(a,n)=>`uniform sampler2D u_confidenceMask${n};`).join(`
`),c=Array.from({length:o},(a,n)=>`		${n>0?"else ":""}if (i == ${n}) c = texelFetch(u_confidenceMask${n}, texCoord, 0).r;`).join(`
`);return`#version 300 es
precision mediump float;
in vec2 v_uv;
out vec4 outColor;
${s}

void main() {
	ivec2 texCoord = ivec2(v_uv * vec2(textureSize(u_confidenceMask0, 0)));
	float maxConfidence = 0.0;
	int maxIndex = 0;

	for (int i = 0; i < ${o}; ++i) {
		float c = 0.0;
${c}
		if (c > maxConfidence) {
			maxConfidence = c;
			maxIndex = i;
		}
	}

	// Normalize index: 0 = background, 1/(n-1) to 1 for foreground categories.
	float normalizedIndex = float(maxIndex) / float(max(1, ${o-1}));
	outColor = vec4(normalizedIndex, maxConfidence, 0.0, 1.0);
}`}var f=new Map;function w(o,s){let{mask:{shader:c}}=o,a={};for(let n=0;n<s.length;++n)a[`u_confidenceMask${n}`]=s[n].getAsWebGLTexture();c.updateTextures(a),c.draw(),s.forEach(n=>n.close())}function A(o){let{textureName:s,options:c={}}=o,a={...D,...c},n=C({...a,textureName:s});return function(u,I){let{injectGLSL:y,gl:v,emitHook:h}=I,p=f.get(n)?.canvas??new OffscreenCanvas(1,1),e=null;function d(){e&&(u.updateTextures({u_segmentMask:e.canvas}),h("segmenter:result",e.state.result))}async function E(){if(f.has(n))e=f.get(n);else{let[t,{ImageSegmenter:i}]=await Promise.all([_(),import("@mediapipe/tasks-vision")]),x=await i.createFromOptions(t,{baseOptions:{modelAssetPath:a.modelPath,delegate:"GPU"},canvas:p,runningMode:"VIDEO",outputCategoryMask:a.outputCategoryMask,outputConfidenceMasks:!0}),l=x.getLabels(),m=l.length||1,r=new k(O(m),{canvas:p});for(let g=0;g<m;++g)r.initializeTexture(`u_confidenceMask${g}`,P);e={segmenter:x,canvas:p,subscribers:new Map,state:{runningMode:"VIDEO",source:null,videoTime:-1,resultTimestamp:0,result:null,pending:Promise.resolve()},labels:l,numCategories:m,mask:{shader:r}},f.set(n,e)}e.subscribers.set(d,!1)}let S=E();u.on("init",()=>{u.initializeUniform("u_numCategories","int",1),u.initializeTexture("u_segmentMask",p,{preserveY:!0,minFilter:v.NEAREST,magFilter:v.NEAREST}),S.then(()=>{u.updateUniforms({u_numCategories:e.numCategories}),h("segmenter:ready")})}),u.on("initializeTexture",(t,i)=>{t===s&&M(i)&&T(i)}),u.on("updateTextures",t=>{let i=t[s];M(i)&&T(i)});let b=0;async function T(t){let i=performance.now(),x=++b;await S,e&&(e.state.pending=e.state.pending.then(async()=>{if(x!==b||!e)return;let l=t instanceof HTMLVideoElement?"VIDEO":"IMAGE";e.state.runningMode!==l&&(e.state.runningMode=l,await e.segmenter.setOptions({runningMode:l}));let m=!1;if(t!==e.state.source?(e.state.source=t,e.state.videoTime=-1,m=!0):t instanceof HTMLVideoElement?t.currentTime!==e.state.videoTime&&(e.state.videoTime=t.currentTime,m=!0):t instanceof HTMLImageElement||i-e.state.resultTimestamp>2&&(m=!0),m){let r;if(t instanceof HTMLVideoElement){if(t.videoWidth===0||t.videoHeight===0||t.readyState<2)return;r=e.segmenter.segmentForVideo(t,i)}else{if(t.width===0||t.height===0)return;r=e.segmenter.segment(t)}if(r?.confidenceMasks&&r.confidenceMasks.length>0){e.state.resultTimestamp=i,e.state.result=r,w(e,r.confidenceMasks);for(let g of e.subscribers.keys())g(),e.subscribers.set(g,!0)}}else e.state.result&&!e.subscribers.get(d)&&(d(),e.subscribers.set(d,!0))}),await e.state.pending)}u.on("destroy",()=>{e&&(e.subscribers.delete(d),e.subscribers.size===0&&(e.segmenter.close(),e.mask.shader?.destroy(),f.delete(n))),e=null}),y(`
uniform sampler2D u_segmentMask;
uniform int u_numCategories;

vec2 segmentAt(vec2 pos) {
	vec4 mask = texture(u_segmentMask, pos);
	return vec2(mask.r, mask.g);
}`)}}var G=A;export{G as default};
//# sourceMappingURL=segmenter.mjs.map