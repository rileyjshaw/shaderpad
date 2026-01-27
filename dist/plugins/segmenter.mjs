import{a as y}from"../chunk-OIM5PVRI.mjs";import{a as C,b as S,c as _,e as I,f as O}from"../chunk-JRSBIGBN.mjs";var A={modelPath:"https://storage.googleapis.com/mediapipe-models/image_segmenter/hair_segmenter/float32/latest/hair_segmenter.tflite",outputCategoryMask:!1};function L(a){let r=Array.from({length:a},(c,n)=>`uniform sampler2D u_confidenceMask${n};`).join(`
`),i=Array.from({length:a},(c,n)=>`		${n>0?"else ":""}if (i == ${n}) c = texelFetch(u_confidenceMask${n}, texCoord, 0).r;`).join(`
`);return`#version 300 es
precision mediump float;
in vec2 v_uv;
out vec4 outColor;
${r}

void main() {
	ivec2 texCoord = ivec2(vec2(v_uv.x, 1.0 - v_uv.y) * vec2(textureSize(u_confidenceMask0, 0)));
	float maxConfidence = 0.0;
	int maxIndex = 0;

	for (int i = 0; i < ${a}; ++i) {
		float c = 0.0;
${i}
		if (c > maxConfidence) {
			maxConfidence = c;
			maxIndex = i;
		}
	}

	// Normalize index: 0 = background, 1/(n-1) to 1 for foreground categories.
	float normalizedIndex = float(maxIndex) / float(max(1, ${a-1}));
	outColor = vec4(normalizedIndex, maxConfidence, 0.0, 1.0);
}`}var x=new Map;function z(a,r){let{maskShader:i}=a,c={};for(let n=0;n<r.length;++n)c[`u_confidenceMask${n}`]=r[n].getAsWebGLTexture();i.updateTextures(c),i.draw(),r.forEach(n=>n.close())}function F(a){let{textureName:r,options:{history:i,...c}={}}=a,n={...A,...c},f=_({...n,textureName:r});return function(m,E){let{injectGLSL:P,emitHook:v}=E,M=x.get(f)?.mediapipeCanvas??new OffscreenCanvas(1,1),e=null,h=!1;function p(){e&&(m.updateTextures({u_segmentMask:e.maskShader},{skipHistoryWrite:h}),v("segmenter:result",e.state.result))}async function D(){if(x.has(f))e=x.get(f);else{let[t,{ImageSegmenter:s}]=await Promise.all([I(),import("@mediapipe/tasks-vision")]),l=await s.createFromOptions(t,{baseOptions:{modelAssetPath:n.modelPath,delegate:"GPU"},canvas:M,runningMode:"VIDEO",outputCategoryMask:n.outputCategoryMask,outputConfidenceMasks:!0}),g=l.getLabels(),u=g.length||1,o=new y(L(u),{canvas:M});for(let d=0;d<u;++d)o.initializeTexture(`u_confidenceMask${d}`,C);e={segmenter:l,mediapipeCanvas:M,maskShader:o,subscribers:new Map,state:{runningMode:"VIDEO",source:null,videoTime:-1,resultTimestamp:0,result:null,pending:Promise.resolve()},labels:g,numCategories:u},x.set(f,e)}e.subscribers.set(p,!1)}let k=D();m.on("init",()=>{m.initializeUniform("u_numCategories","int",1),m.initializeTexture("u_segmentMask",M,{minFilter:"NEAREST",magFilter:"NEAREST",history:i}),k.then(()=>{m.updateUniforms({u_numCategories:e.numCategories}),v("segmenter:ready")})}),m.on("initializeTexture",(t,s)=>{t===r&&S(s)&&T(s)}),m.on("updateTextures",(t,s)=>{let l=t[r];S(l)&&(h=s?.skipHistoryWrite??!1,T(l))});let b=0;async function T(t){let s=performance.now(),l=++b;await k,e&&(e.state.pending=e.state.pending.then(async()=>{if(l!==b||!e)return;let g=t instanceof HTMLVideoElement?"VIDEO":"IMAGE";e.state.runningMode!==g&&(e.state.runningMode=g,await e.segmenter.setOptions({runningMode:g}));let u=!1;if(t!==e.state.source?(e.state.source=t,e.state.videoTime=-1,u=!0):t instanceof HTMLVideoElement?t.currentTime!==e.state.videoTime&&(e.state.videoTime=t.currentTime,u=!0):t instanceof HTMLImageElement||s-e.state.resultTimestamp>2&&(u=!0),u){let o;if(t instanceof HTMLVideoElement){if(t.videoWidth===0||t.videoHeight===0||t.readyState<2)return;o=e.segmenter.segmentForVideo(t,s)}else{if(t.width===0||t.height===0)return;o=e.segmenter.segment(t)}if(o?.confidenceMasks&&o.confidenceMasks.length>0){e.state.resultTimestamp=s,e.state.result=o,z(e,o.confidenceMasks);for(let d of e.subscribers.keys())d(),e.subscribers.set(d,!0)}}else e.state.result&&!e.subscribers.get(p)&&(p(),e.subscribers.set(p,!0))}),await e.state.pending)}m.on("destroy",()=>{e&&(e.subscribers.delete(p),e.subscribers.size===0&&(e.segmenter.close(),e.maskShader.destroy(),x.delete(f))),e=null});let{fn:$}=O(i),w=i?`int layer = (u_segmentMaskFrameOffset - framesAgo + ${i}) % ${i};
	vec4 mask = texture(u_segmentMask, vec3(pos, float(layer)));`:"vec4 mask = texture(u_segmentMask, pos);";P(`
uniform sampler2D${i?"Array":""} u_segmentMask;${i?`
uniform int u_segmentMaskFrameOffset;`:""}
uniform int u_numCategories;

${$("vec2","segmentAt","vec2 pos",`${w}
	return vec2(mask.r, mask.g);`)}`)}}var U=F;export{U as default};
//# sourceMappingURL=segmenter.mjs.map