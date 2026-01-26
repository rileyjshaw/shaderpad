import{a as C}from"../chunk-5CBGNOA3.mjs";import{a as _,b as v,c as I,e as O,f as E}from"../chunk-JRSBIGBN.mjs";var L={modelPath:"https://storage.googleapis.com/mediapipe-models/image_segmenter/hair_segmenter/float32/latest/hair_segmenter.tflite",outputCategoryMask:!1};function z(a){let r=Array.from({length:a},(c,n)=>`uniform sampler2D u_confidenceMask${n};`).join(`
`),s=Array.from({length:a},(c,n)=>`		${n>0?"else ":""}if (i == ${n}) c = texelFetch(u_confidenceMask${n}, texCoord, 0).r;`).join(`
`);return`#version 300 es
precision mediump float;
in vec2 v_uv;
out vec4 outColor;
${r}

void main() {
	ivec2 texCoord = ivec2(v_uv * vec2(textureSize(u_confidenceMask0, 0)));
	float maxConfidence = 0.0;
	int maxIndex = 0;

	for (int i = 0; i < ${a}; ++i) {
		float c = 0.0;
${s}
		if (c > maxConfidence) {
			maxConfidence = c;
			maxIndex = i;
		}
	}

	// Normalize index: 0 = background, 1/(n-1) to 1 for foreground categories.
	float normalizedIndex = float(maxIndex) / float(max(1, ${a-1}));
	outColor = vec4(normalizedIndex, maxConfidence, 0.0, 1.0);
}`}var M=new Map;function F(a,r){let{mask:{shader:s}}=a,c={};for(let n=0;n<r.length;++n)c[`u_confidenceMask${n}`]=r[n].getAsWebGLTexture();s.updateTextures(c),s.draw(),r.forEach(n=>n.close())}function R(a){let{textureName:r,options:{history:s,...c}={}}=a,n={...L,...c},f=I({...n,textureName:r});return function(m,P){let{injectGLSL:D,gl:h,emitHook:S}=P,x=M.get(f)?.canvas??new OffscreenCanvas(1,1),e=null,k=!1;function p(){e&&(m.updateTextures({u_segmentMask:e.canvas},{skipHistoryWrite:k}),S("segmenter:result",e.state.result))}async function $(){if(M.has(f))e=M.get(f);else{let[t,{ImageSegmenter:i}]=await Promise.all([O(),import("@mediapipe/tasks-vision")]),l=await i.createFromOptions(t,{baseOptions:{modelAssetPath:n.modelPath,delegate:"GPU"},canvas:x,runningMode:"VIDEO",outputCategoryMask:n.outputCategoryMask,outputConfidenceMasks:!0}),g=l.getLabels(),u=g.length||1,o=new C(z(u),{canvas:x});for(let d=0;d<u;++d)o.initializeTexture(`u_confidenceMask${d}`,_);e={segmenter:l,canvas:x,subscribers:new Map,state:{runningMode:"VIDEO",source:null,videoTime:-1,resultTimestamp:0,result:null,pending:Promise.resolve()},labels:g,numCategories:u,mask:{shader:o}},M.set(f,e)}e.subscribers.set(p,!1)}let b=$();m.on("init",()=>{m.initializeUniform("u_numCategories","int",1),m.initializeTexture("u_segmentMask",x,{preserveY:!0,minFilter:h.NEAREST,magFilter:h.NEAREST,history:s}),b.then(()=>{m.updateUniforms({u_numCategories:e.numCategories}),S("segmenter:ready")})}),m.on("initializeTexture",(t,i)=>{t===r&&v(i)&&y(i)}),m.on("updateTextures",(t,i)=>{let l=t[r];v(l)&&(k=i?.skipHistoryWrite??!1,y(l))});let T=0;async function y(t){let i=performance.now(),l=++T;await b,e&&(e.state.pending=e.state.pending.then(async()=>{if(l!==T||!e)return;let g=t instanceof HTMLVideoElement?"VIDEO":"IMAGE";e.state.runningMode!==g&&(e.state.runningMode=g,await e.segmenter.setOptions({runningMode:g}));let u=!1;if(t!==e.state.source?(e.state.source=t,e.state.videoTime=-1,u=!0):t instanceof HTMLVideoElement?t.currentTime!==e.state.videoTime&&(e.state.videoTime=t.currentTime,u=!0):t instanceof HTMLImageElement||i-e.state.resultTimestamp>2&&(u=!0),u){let o;if(t instanceof HTMLVideoElement){if(t.videoWidth===0||t.videoHeight===0||t.readyState<2)return;o=e.segmenter.segmentForVideo(t,i)}else{if(t.width===0||t.height===0)return;o=e.segmenter.segment(t)}if(o?.confidenceMasks&&o.confidenceMasks.length>0){e.state.resultTimestamp=i,e.state.result=o,F(e,o.confidenceMasks);for(let d of e.subscribers.keys())d(),e.subscribers.set(d,!0)}}else e.state.result&&!e.subscribers.get(p)&&(p(),e.subscribers.set(p,!0))}),await e.state.pending)}m.on("destroy",()=>{e&&(e.subscribers.delete(p),e.subscribers.size===0&&(e.segmenter.close(),e.mask.shader?.destroy(),M.delete(f))),e=null});let{fn:w}=E(s),A=s?`int layer = (u_segmentMaskFrameOffset - framesAgo + ${s}) % ${s};
	vec4 mask = texture(u_segmentMask, vec3(pos, float(layer)));`:"vec4 mask = texture(u_segmentMask, pos);";D(`
uniform sampler2D${s?"Array":""} u_segmentMask;${s?`
uniform int u_segmentMaskFrameOffset;`:""}
uniform int u_numCategories;

${w("vec2","segmentAt","vec2 pos",`${A}
	return vec2(mask.r, mask.g);`)}`)}}var j=R;export{j as default};
//# sourceMappingURL=segmenter.mjs.map