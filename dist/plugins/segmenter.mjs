import{a as C}from"../chunk-SBS4G6RV.mjs";import{a as _,b as h,c as I,e as O,f as E}from"../chunk-JRSBIGBN.mjs";var L={modelPath:"https://storage.googleapis.com/mediapipe-models/image_segmenter/hair_segmenter/float32/latest/hair_segmenter.tflite",outputCategoryMask:!1};function z(a){let o=Array.from({length:a},(c,n)=>`uniform mediump sampler2D u_confidenceMask${n};`).join(`
`),i=Array.from({length:a},(c,n)=>`		${n>0?"else ":""}if (i == ${n}) c = texelFetch(u_confidenceMask${n}, texCoord, 0).r;`).join(`
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
${i}
		if (c > maxConfidence) {
			maxConfidence = c;
			maxIndex = i;
		}
	}

	// Normalize index: 0 = background, 1/(n-1) to 1 for foreground categories.
	float normalizedIndex = float(maxIndex) / float(max(1, ${a-1}));
	outColor = vec4(normalizedIndex, maxConfidence, 0.0, 1.0);
}`}var x=new Map;function F(a,o){let{maskShader:i}=a,c={};for(let n=0;n<o.length;++n)c[`u_confidenceMask${n}`]=o[n].getAsWebGLTexture();i.updateTextures(c),i.draw(),o.forEach(n=>n.close())}function R(a){let{textureName:o,options:{history:i,...c}={}}=a,n={...L,...c},f=I({...n,textureName:o});return function(m,P){let{injectGLSL:D,emitHook:v}=P,M=x.get(f)?.mediapipeCanvas??new OffscreenCanvas(1,1),e=null,S=!1,k=!1;function p(){e&&(m.updateTextures({u_segmentMask:e.maskShader},{skipHistoryWrite:k}),v("segmenter:result",e.state.result))}async function $(){if(x.has(f))e=x.get(f);else{let[t,{ImageSegmenter:s}]=await Promise.all([O(),import("@mediapipe/tasks-vision")]);if(S)return;let u=await s.createFromOptions(t,{baseOptions:{modelAssetPath:n.modelPath,delegate:"GPU"},canvas:M,runningMode:"VIDEO",outputCategoryMask:n.outputCategoryMask,outputConfidenceMasks:!0});if(S){u.close();return}let d=u.getLabels(),l=d.length||1,r=new C(z(l),{canvas:M});for(let g=0;g<l;++g)r.initializeTexture(`u_confidenceMask${g}`,_);e={segmenter:u,mediapipeCanvas:M,maskShader:r,subscribers:new Map,state:{runningMode:"VIDEO",source:null,videoTime:-1,resultTimestamp:0,result:null,pending:Promise.resolve()},labels:d,numCategories:l},x.set(f,e)}e.subscribers.set(p,!1)}let b=$();m.on("init",()=>{m.initializeUniform("u_numCategories","int",1),m.initializeTexture("u_segmentMask",M,{minFilter:"NEAREST",magFilter:"NEAREST",history:i}),b.then(()=>{S||!e||(m.updateUniforms({u_numCategories:e.numCategories}),v("segmenter:ready"))})}),m.on("initializeTexture",(t,s)=>{t===o&&h(s)&&y(s)}),m.on("updateTextures",(t,s)=>{let u=t[o];h(u)&&(k=s?.skipHistoryWrite??!1,y(u))});let T=0;async function y(t){let s=performance.now(),u=++T;await b,e&&(e.state.pending=e.state.pending.then(async()=>{if(u!==T||!e)return;let d=t instanceof HTMLVideoElement?"VIDEO":"IMAGE";e.state.runningMode!==d&&(e.state.runningMode=d,await e.segmenter.setOptions({runningMode:d}));let l=!1;if(t!==e.state.source?(e.state.source=t,e.state.videoTime=-1,l=!0):t instanceof HTMLVideoElement?t.currentTime!==e.state.videoTime&&(e.state.videoTime=t.currentTime,l=!0):t instanceof HTMLImageElement||s-e.state.resultTimestamp>2&&(l=!0),l){let r;if(t instanceof HTMLVideoElement){if(t.videoWidth===0||t.videoHeight===0||t.readyState<2)return;r=e.segmenter.segmentForVideo(t,s)}else{if(t.width===0||t.height===0)return;r=e.segmenter.segment(t)}if(r){e.state.resultTimestamp=s,e.state.result=r,r.confidenceMasks&&r.confidenceMasks.length>0?F(e,r.confidenceMasks):e.maskShader.clear();for(let g of e.subscribers.keys())g(),e.subscribers.set(g,!0)}}else e.state.result&&!e.subscribers.get(p)&&(p(),e.subscribers.set(p,!0))}),await e.state.pending)}m.on("destroy",()=>{S=!0,e&&(e.subscribers.delete(p),e.subscribers.size===0&&(e.segmenter.close(),e.maskShader.destroy(),x.delete(f))),e=null});let{fn:w}=E(i),A=i?`int layer = (u_segmentMaskFrameOffset - framesAgo + ${i}) % ${i};
	vec4 mask = texture(u_segmentMask, vec3(pos, float(layer)));`:"vec4 mask = texture(u_segmentMask, pos);";D(`
uniform ${i?"highp":"mediump"} sampler2D${i?"Array":""} u_segmentMask;${i?`
uniform int u_segmentMaskFrameOffset;`:""}
uniform int u_numCategories;

${w("vec2","segmentAt","vec2 pos",`${A}
	return vec2(mask.r, mask.g);`)}`)}}var j=R;export{j as default};
//# sourceMappingURL=segmenter.mjs.map