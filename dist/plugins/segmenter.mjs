import{a as M}from"../chunk-RKULNJXI.mjs";var k={data:new Uint8Array(4),width:1,height:1};function I(s){let u=Array.from({length:s},(m,t)=>`uniform sampler2D u_confidenceMask${t};`).join(`
`),l=Array.from({length:s},(m,t)=>`		${t>0?"else ":""}if (i == ${t}) c = texelFetch(u_confidenceMask${t}, texCoord, 0).r;`).join(`
`);return`#version 300 es
precision mediump float;
in vec2 v_uv;
out vec4 outColor;
${u}

void main() {
	ivec2 texCoord = ivec2(v_uv * vec2(textureSize(u_confidenceMask0, 0)));
	float maxConfidence = 0.0;
	int maxIndex = 0;

	for (int i = 0; i < ${s}; i++) {
		float c = 0.0;
${l}
		if (c > maxConfidence) {
			maxConfidence = c;
			maxIndex = i;
		}
	}

	// Normalize index: 0 = background, 1/(n-1) to 1 for foreground categories.
	float normalizedIndex = float(maxIndex) / float(max(1, ${s-1}));
	outColor = vec4(normalizedIndex, maxConfidence, 0.0, 1.0);
}`}function w(s){let{textureName:u,options:l}=s,m="https://storage.googleapis.com/mediapipe-models/image_segmenter/hair_segmenter/float32/latest/hair_segmenter.tflite";return function(t,T){let{injectGLSL:C,gl:S}=T,o=null,g=null,f=-1,c="VIDEO",d=new Map,p=1,x=new OffscreenCanvas(1,1),i=null;async function _(){try{let{FilesetResolver:n,ImageSegmenter:e}=await import("@mediapipe/tasks-vision");g=await n.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"),o=await e.createFromOptions(g,{baseOptions:{modelAssetPath:l?.modelPath||m,delegate:"GPU"},canvas:x,runningMode:c,outputCategoryMask:l?.outputCategoryMask??!1,outputConfidenceMasks:!0});let r=o.getLabels();r.length&&(p=r.length),t.updateUniforms({u_numCategories:p})}catch(n){throw console.error("[Segmenter Plugin] Failed to initialize:",n),n}}function y(n){if(!i)return;let e={};for(let r=0;r<n.length;r++)e[`u_confidenceMask${r}`]=n[r].getAsWebGLTexture();i.updateTextures(e),i.draw(),t.updateTextures({u_segmentMask:x})}function h(n){let{confidenceMasks:e}=n;if(!(!e||e.length===0)){if(!i){let r=I(e.length);i=new M(r,{canvas:x});for(let a=0;a<e.length;a++)i.initializeTexture(`u_confidenceMask${a}`,k)}y(e)}}t.registerHook("init",async()=>{t.initializeTexture("u_segmentMask",k,{preserveY:!0,minFilter:S.NEAREST,magFilter:S.NEAREST}),t.initializeUniform("u_numCategories","int",p),await _()}),t.registerHook("updateTextures",async n=>{let e=n[u];if(!(!e||(d.get(u)!==e&&(f=-1),d.set(u,e),!o)))try{let a=e instanceof HTMLVideoElement?"VIDEO":"IMAGE";if(c!==a&&(c=a,await o.setOptions({runningMode:c})),e instanceof HTMLVideoElement){if(e.videoWidth===0||e.videoHeight===0||e.readyState<2)return;if(e.currentTime!==f){f=e.currentTime;let v=o.segmentForVideo(e,performance.now());h(v)}}else if(e instanceof HTMLImageElement||e instanceof HTMLCanvasElement){if(e.width===0||e.height===0)return;let v=o.segment(e);h(v)}}catch(a){console.error("[Segmenter Plugin] Segmentation error:",a)}}),t.registerHook("destroy",()=>{o&&(o.close(),o=null),i&&(i.destroy(),i=null),g=null,d.clear()}),C(`
uniform sampler2D u_segmentMask;
uniform int u_numCategories;

vec2 segmentAt(vec2 pos) {
	vec4 mask = texture(u_segmentMask, pos);
	return vec2(mask.r, mask.g);
}`)}}var $=w;export{$ as default};
//# sourceMappingURL=segmenter.mjs.map