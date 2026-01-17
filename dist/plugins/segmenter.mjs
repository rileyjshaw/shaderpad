import{a as y}from"../chunk-A3XQBYSC.mjs";var P={data:new Uint8Array(4),width:1,height:1};function z(a){let s=Array.from({length:a},(f,n)=>`uniform sampler2D u_confidenceMask${n};`).join(`
`),u=Array.from({length:a},(f,n)=>`		${n>0?"else ":""}if (i == ${n}) c = texelFetch(u_confidenceMask${n}, texCoord, 0).r;`).join(`
`);return`#version 300 es
precision mediump float;
in vec2 v_uv;
out vec4 outColor;
${s}

void main() {
	ivec2 texCoord = ivec2(v_uv * vec2(textureSize(u_confidenceMask0, 0)));
	float maxConfidence = 0.0;
	int maxIndex = 0;

	for (int i = 0; i < ${a}; ++i) {
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
}`}function A(a){let{textureName:s,options:u}=a,f="https://storage.googleapis.com/mediapipe-models/image_segmenter/hair_segmenter/float32/latest/hair_segmenter.tflite";return function(n,_){let{injectGLSL:I,gl:v,emitHook:M}=_,i=null,d=null,p=-1,m="VIDEO",x=new Map,l=1,c=new OffscreenCanvas(1,1),o=null;async function w(){try{let{FilesetResolver:e,ImageSegmenter:t}=await import("@mediapipe/tasks-vision");d=await e.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"),i=await t.createFromOptions(d,{baseOptions:{modelAssetPath:u?.modelPath||f,delegate:"GPU"},canvas:c,runningMode:m,outputCategoryMask:u?.outputCategoryMask??!1,outputConfidenceMasks:!0})}catch(e){throw console.error("[Segmenter Plugin] Failed to initialize MediaPipe:",e),e}}let h=w();n.on("init",async()=>{n.initializeUniform("u_numCategories","int",l),n.initializeTexture("u_segmentMask",c,{preserveY:!0,minFilter:v.NEAREST,magFilter:v.NEAREST}),await h;let e=i.getLabels();e.length&&(l=e.length),o=new y(z(l),{canvas:c});for(let t=0;t<l;++t)o.initializeTexture(`u_confidenceMask${t}`,P);n.updateUniforms({u_numCategories:l}),M("segmenter:ready")}),n.on("initializeTexture",(e,t)=>{e===s&&C(t)}),n.on("updateTextures",e=>{let t=e[s];t&&C(t)});function E(e){if(!o)return;let t={};for(let r=0;r<e.length;++r)t[`u_confidenceMask${r}`]=e[r].getAsWebGLTexture();o.updateTextures(t),o.draw(),n.updateTextures({u_segmentMask:c}),e.forEach(r=>r.close())}function T(e){let{confidenceMasks:t}=e;!t||t.length===0||(E(t),M("segmenter:result",e))}let k=0;async function C(e){let t=++k;if(await h,t!==k||!i)return;x.get(s)!==e&&(p=-1),x.set(s,e);try{let g=e instanceof HTMLVideoElement?"VIDEO":"IMAGE";if(m!==g&&(m=g,await i.setOptions({runningMode:m})),e instanceof HTMLVideoElement){if(e.videoWidth===0||e.videoHeight===0||e.readyState<2)return;if(e.currentTime!==p){p=e.currentTime;let S=i.segmentForVideo(e,performance.now());T(S)}}else if(e instanceof HTMLImageElement||e instanceof HTMLCanvasElement){if(e.width===0||e.height===0)return;let S=i.segment(e);T(S)}}catch(g){console.error("[Segmenter Plugin] Segmentation error:",g)}}n.on("destroy",()=>{i&&(i.close(),i=null),o&&(o.destroy(),o=null),d=null,x.clear()}),I(`
uniform sampler2D u_segmentMask;
uniform int u_numCategories;

vec2 segmentAt(vec2 pos) {
	vec4 mask = texture(u_segmentMask, pos);
	return vec2(mask.r, mask.g);
}`)}}var b=A;export{b as default};
//# sourceMappingURL=segmenter.mjs.map