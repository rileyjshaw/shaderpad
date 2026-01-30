import{a as O}from"../chunk-I2PAVCLP.mjs";import"../chunk-LXQJ4NRK.mjs";import{a as E,b as v,c as P,e as D,f as $}from"../chunk-JRSBIGBN.mjs";var H={modelPath:"https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite",outputCategoryMask:!1};function R(a){let o=Array.from({length:a},(f,i)=>`uniform mediump sampler2D u_confidenceMask${i};`).join(`
`),n=Array.from({length:a},(f,i)=>`		${i>0?"else ":""}if (i == ${i}) c = texelFetch(u_confidenceMask${i}, texCoord, 0).r;`).join(`
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
}`}var p=new Map;function G(a,o){let{maskShader:n}=a,f={};for(let i=0;i<o.length;++i)f[`u_confidenceMask${i}`]=o[i].getAsWebGLTexture();n.updateTextures(f),n.step(),o.forEach(i=>i.close())}function V(a){let{textureName:o,options:{history:n,...f}={}}=a,i={...H,...f},g=P({...i,textureName:o});return function(u,w){let{injectGLSL:A,emitHook:y}=w,x=p.get(g)?.mediapipeCanvas??new OffscreenCanvas(1,1),e=null,M=!1,k=!1;function S(t){if(!e)return;let s=t;typeof s>"u"&&b.length>0&&(s=b,b=[]),u.updateTextures({u_segmentMask:e.maskShader},n?{skipHistoryWrite:k,historyWriteIndex:s}:void 0),y("segmenter:result",e.state.result)}async function L(){if(p.has(g))e=p.get(g);else{let[t,{ImageSegmenter:s}]=await Promise.all([D(),import("@mediapipe/tasks-vision")]);if(M)return;let m=await s.createFromOptions(t,{baseOptions:{modelAssetPath:i.modelPath,delegate:"GPU"},canvas:x,runningMode:"VIDEO",outputCategoryMask:i.outputCategoryMask,outputConfidenceMasks:!0});if(M){m.close();return}let d=m.getLabels(),l=d.length||1,r=new O(R(l),{canvas:x});for(let c=0;c<l;++c)r.initializeTexture(`u_confidenceMask${c}`,E);e={segmenter:m,mediapipeCanvas:x,maskShader:r,subscribers:new Map,state:{runningMode:"VIDEO",source:null,videoTime:-1,resultTimestamp:0,result:null,pending:Promise.resolve()},labels:d,numCategories:l},p.set(g,e)}e.subscribers.set(S,!1)}let T=L();u.on("init",()=>{u.initializeUniform("u_numCategories","int",1),u.initializeTexture("u_segmentMask",x,{minFilter:"NEAREST",magFilter:"NEAREST",history:n}),T.then(()=>{M||!e||(u.updateUniforms({u_numCategories:e.numCategories}),y("segmenter:ready"))})});let h=0,b=[],C=()=>{n&&(S(h),b.push(h),h=(h+1)%(n+1))};u.on("initializeTexture",(t,s)=>{t===o&&v(s)&&(C(),I(s))}),u.on("updateTextures",(t,s)=>{let m=t[o];v(m)&&(k=s?.skipHistoryWrite??!1,k||C(),I(m))});let _=0;async function I(t){let s=performance.now(),m=++_;await T,e&&(e.state.pending=e.state.pending.then(async()=>{if(m!==_||!e)return;let d=t instanceof HTMLVideoElement?"VIDEO":"IMAGE";e.state.runningMode!==d&&(e.state.runningMode=d,await e.segmenter.setOptions({runningMode:d}));let l=!1;if(t!==e.state.source?(e.state.source=t,e.state.videoTime=-1,l=!0):t instanceof HTMLVideoElement?t.currentTime!==e.state.videoTime&&(e.state.videoTime=t.currentTime,l=!0):t instanceof HTMLImageElement||s-e.state.resultTimestamp>2&&(l=!0),l){let r;if(t instanceof HTMLVideoElement){if(t.videoWidth===0||t.videoHeight===0||t.readyState<2)return;r=e.segmenter.segmentForVideo(t,s)}else{if(t.width===0||t.height===0)return;r=e.segmenter.segment(t)}if(r){e.state.resultTimestamp=s,e.state.result=r,r.confidenceMasks&&r.confidenceMasks.length>0?G(e,r.confidenceMasks):e.maskShader.clear();for(let c of e.subscribers.keys())c(),e.subscribers.set(c,!0)}}else if(e.state.result){for(let[r,c]of e.subscribers.entries())c||(r(),e.subscribers.set(r,!0));e.subscribers.set(S,!0)}}),await e.state.pending)}u.on("destroy",()=>{M=!0,e&&(e.subscribers.delete(S),e.subscribers.size===0&&(e.segmenter.close(),e.maskShader.destroy(),p.delete(g))),e=null});let{fn:F}=$(n),z=n?`int layer = (u_segmentMaskFrameOffset - framesAgo + ${n+1}) % ${n+1};
	vec4 mask = texture(u_segmentMask, vec3(pos, float(layer)));`:"vec4 mask = texture(u_segmentMask, pos);";A(`
uniform ${n?"highp":"mediump"} sampler2D${n?"Array":""} u_segmentMask;${n?`
uniform int u_segmentMaskFrameOffset;`:""}
uniform int u_numCategories;

${F("vec2","segmentAt","vec2 pos",`${z}
	return vec2(mask.r, mask.g);`)}`)}}var K=V;export{K as default};
//# sourceMappingURL=segmenter.mjs.map