import{a as I}from"../chunk-Q4CJO6XA.mjs";import"../chunk-LXQJ4NRK.mjs";import{a as O,b as v,c as E,e as P,f as $}from"../chunk-JRSBIGBN.mjs";var z={modelPath:"https://storage.googleapis.com/mediapipe-models/image_segmenter/hair_segmenter/float32/latest/hair_segmenter.tflite",outputCategoryMask:!1};function H(a){let o=Array.from({length:a},(d,i)=>`uniform mediump sampler2D u_confidenceMask${i};`).join(`
`),n=Array.from({length:a},(d,i)=>`		${i>0?"else ":""}if (i == ${i}) c = texelFetch(u_confidenceMask${i}, texCoord, 0).r;`).join(`
`);return`#version 300 es
precision mediump float;
in vec2 v_uv;
out vec4 outColor;
${o}

void main() {
	ivec2 texCoord = ivec2(vec2(v_uv.x, 1.0 - v_uv.y) * vec2(textureSize(u_confidenceMask0, 0)));
	float maxConfidence = 0.0;
	int maxIndex = 0;

	for (int i = 0; i < ${a}; ++i) {
		float c = 0.0;
${n}
		if (c > maxConfidence) {
			maxConfidence = c;
			maxIndex = i;
		}
	}

	// Normalize index: 0 = background, 1/(n-1) to 1 for foreground categories.
	float normalizedIndex = float(maxIndex) / float(max(1, ${a-1}));
	outColor = vec4(normalizedIndex, maxConfidence, 0.0, 1.0);
}`}var p=new Map;function R(a,o){let{maskShader:n}=a,d={};for(let i=0;i<o.length;++i)d[`u_confidenceMask${i}`]=o[i].getAsWebGLTexture();n.updateTextures(d),n.step(),o.forEach(i=>i.close())}function G(a){let{textureName:o,options:{history:n,...d}={}}=a,i={...z,...d},g=E({...i,textureName:o});return function(u,D){let{injectGLSL:w,emitHook:y}=D,h=p.get(g)?.mediapipeCanvas??new OffscreenCanvas(1,1),e=null,x=!1,k=!1;function M(t){if(!e)return;let s=t;typeof s>"u"&&b.length>0&&(s=b,b=[]),u.updateTextures({u_segmentMask:e.maskShader},n?{skipHistoryWrite:k,historyWriteIndex:s}:void 0),y("segmenter:result",e.state.result)}async function A(){if(p.has(g))e=p.get(g);else{let[t,{ImageSegmenter:s}]=await Promise.all([P(),import("@mediapipe/tasks-vision")]);if(x)return;let m=await s.createFromOptions(t,{baseOptions:{modelAssetPath:i.modelPath,delegate:"GPU"},canvas:h,runningMode:"VIDEO",outputCategoryMask:i.outputCategoryMask,outputConfidenceMasks:!0});if(x){m.close();return}let f=m.getLabels(),l=f.length||1,r=new I(H(l),{canvas:h});for(let c=0;c<l;++c)r.initializeTexture(`u_confidenceMask${c}`,O);e={segmenter:m,mediapipeCanvas:h,maskShader:r,subscribers:new Map,state:{nCalls:0,runningMode:"VIDEO",source:null,videoTime:-1,resultTimestamp:0,result:null,pending:Promise.resolve()},labels:f,numCategories:l},p.set(g,e)}e.subscribers.set(M,!1)}let T=A();u.on("init",()=>{u.initializeUniform("u_numCategories","int",1),u.initializeTexture("u_segmentMask",h,{minFilter:"NEAREST",magFilter:"NEAREST",history:n}),T.then(()=>{x||!e||(u.updateUniforms({u_numCategories:e.numCategories}),y("segmenter:ready"))})});let S=0,b=[],C=()=>{n&&(M(S),b.push(S),S=(S+1)%(n+1))};u.on("initializeTexture",(t,s)=>{t===o&&v(s)&&(C(),_(s))}),u.on("updateTextures",(t,s)=>{let m=t[o];v(m)&&(k=s?.skipHistoryWrite??!1,k||C(),_(m))});async function _(t){let s=performance.now();if(await T,!e)return;let m=++e.state.nCalls;e.state.pending=e.state.pending.then(async()=>{if(!e||m!==e.state.nCalls)return;let f=t instanceof HTMLVideoElement?"VIDEO":"IMAGE";e.state.runningMode!==f&&(e.state.runningMode=f,await e.segmenter.setOptions({runningMode:f}));let l=!1;if(t!==e.state.source?(e.state.source=t,e.state.videoTime=-1,l=!0):t instanceof HTMLVideoElement?t.currentTime!==e.state.videoTime&&(e.state.videoTime=t.currentTime,l=!0):t instanceof HTMLImageElement||s-e.state.resultTimestamp>2&&(l=!0),l){let r;if(t instanceof HTMLVideoElement){if(t.videoWidth===0||t.videoHeight===0||t.readyState<2)return;r=e.segmenter.segmentForVideo(t,s)}else{if(t.width===0||t.height===0)return;r=e.segmenter.segment(t)}if(r){e.state.resultTimestamp=s,e.state.result=r,r.confidenceMasks&&r.confidenceMasks.length>0?R(e,r.confidenceMasks):e.maskShader.clear();for(let c of e.subscribers.keys())c(),e.subscribers.set(c,!0)}}else if(e.state.result){for(let[r,c]of e.subscribers.entries())c||(r(),e.subscribers.set(r,!0));e.subscribers.set(M,!0)}}),await e.state.pending}u.on("destroy",()=>{x=!0,e&&(e.subscribers.delete(M),e.subscribers.size===0&&(e.segmenter.close(),e.maskShader.destroy(),p.delete(g))),e=null});let{fn:L}=$(n),F=n?`int layer = (u_segmentMaskFrameOffset - framesAgo + ${n+1}) % ${n+1};
	vec4 mask = texture(u_segmentMask, vec3(pos, float(layer)));`:"vec4 mask = texture(u_segmentMask, pos);";w(`
uniform ${n?"highp":"mediump"} sampler2D${n?"Array":""} u_segmentMask;${n?`
uniform int u_segmentMaskFrameOffset;`:""}
uniform int u_numCategories;

${L("vec2","segmentAt","vec2 pos",`${F}
	return vec2(mask.r, mask.g);`)}`)}}var B=G;export{B as default};
//# sourceMappingURL=segmenter.mjs.map