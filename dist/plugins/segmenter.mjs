import{a as M}from"../chunk-CRUQQQ46.mjs";var k={data:new Uint8Array(4),width:1,height:1};function _(a){let l=Array.from({length:a},(m,t)=>`uniform sampler2D u_confidenceMask${t};`).join(`
`),u=Array.from({length:a},(m,t)=>`		${t>0?"else ":""}if (i == ${t}) c = texelFetch(u_confidenceMask${t}, texCoord, 0).r;`).join(`
`);return`#version 300 es
precision mediump float;
in vec2 v_uv;
out vec4 outColor;
${l}

void main() {
	ivec2 texCoord = ivec2(v_uv * vec2(textureSize(u_confidenceMask0, 0)));
	float maxConfidence = 0.0;
	int maxIndex = 0;

	for (int i = 0; i < ${a}; i++) {
		float c = 0.0;
${u}
		if (c > maxConfidence) {
			maxConfidence = c;
			maxIndex = i;
		}
	}

	// Normalize index: 0 = background, 1/(n-1) to 1 for foreground categories.
	float normalizedIndex = float(maxIndex) / float(max(1, ${a-1}));
	outColor = vec4(normalizedIndex, maxConfidence, 0.0, 1.0);
}`}function w(a){let{textureName:l,options:u}=a,m="https://storage.googleapis.com/mediapipe-models/image_segmenter/hair_segmenter/float32/latest/hair_segmenter.tflite";return function(t,T){let{injectGLSL:C,gl:S}=T,r=null,g=null,f=-1,c="VIDEO",d=new Map,p=1,x=new OffscreenCanvas(1,1),i=null;async function y(){try{let{FilesetResolver:n,ImageSegmenter:e}=await import("@mediapipe/tasks-vision");g=await n.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"),r=await e.createFromOptions(g,{baseOptions:{modelAssetPath:u?.modelPath||m,delegate:"GPU"},canvas:x,runningMode:c,outputCategoryMask:u?.outputCategoryMask??!1,outputConfidenceMasks:!0});let o=r.getLabels();o.length&&(p=o.length),t.updateUniforms({u_numCategories:p})}catch(n){throw console.error("[Segmenter Plugin] Failed to initialize:",n),n}}function I(n){if(!i)return;let e={};for(let o=0;o<n.length;o++)e[`u_confidenceMask${o}`]=n[o].getAsWebGLTexture();i.updateTextures(e),i.draw(),t.updateTextures({u_segmentMask:x}),n.forEach(o=>o.close())}function h(n){let{confidenceMasks:e}=n;if(!(!e||e.length===0)){if(!i){let o=_(e.length);i=new M(o,{canvas:x});for(let s=0;s<e.length;s++)i.initializeTexture(`u_confidenceMask${s}`,k)}I(e),u?.onResults?.(n)}}t.registerHook("init",async()=>{t.initializeTexture("u_segmentMask",k,{preserveY:!0,minFilter:S.NEAREST,magFilter:S.NEAREST}),t.initializeUniform("u_numCategories","int",p),await y(),u?.onReady?.()}),t.registerHook("updateTextures",async n=>{let e=n[l];if(!(!e||(d.get(l)!==e&&(f=-1),d.set(l,e),!r)))try{let s=e instanceof HTMLVideoElement?"VIDEO":"IMAGE";if(c!==s&&(c=s,await r.setOptions({runningMode:c})),e instanceof HTMLVideoElement){if(e.videoWidth===0||e.videoHeight===0||e.readyState<2)return;if(e.currentTime!==f){f=e.currentTime;let v=r.segmentForVideo(e,performance.now());h(v)}}else if(e instanceof HTMLImageElement||e instanceof HTMLCanvasElement){if(e.width===0||e.height===0)return;let v=r.segment(e);h(v)}}catch(s){console.error("[Segmenter Plugin] Segmentation error:",s)}}),t.registerHook("destroy",()=>{r&&(r.close(),r=null),i&&(i.destroy(),i=null),g=null,d.clear()}),C(`
uniform sampler2D u_segmentMask;
uniform int u_numCategories;

vec2 segmentAt(vec2 pos) {
	vec4 mask = texture(u_segmentMask, pos);
	return vec2(mask.r, mask.g);
}`)}}var P=w;export{P as default};
//# sourceMappingURL=segmenter.mjs.map