// src/plugins/helpers.glsl
var helpers_default = "uniform vec2 u_resolution;\n\n// Apply aspect ratio correction (object-fit: contain)\nvec2 fitContain(vec2 uv, vec2 textureSize) {\n	vec2 scale = u_resolution.xy * textureSize.yx / (u_resolution.yx * textureSize.xy);\n	return (uv - 0.5) * max(scale, vec2(1.0)) + 0.5;\n}\n\n// Map source UVs back into viewport UVs using object-fit: contain.\nvec2 fitContainInverse(vec2 uv, vec2 textureSize) {\n	vec2 scale = u_resolution.xy * textureSize.yx / (u_resolution.yx * textureSize.xy);\n	return (uv - 0.5) / max(scale, vec2(1.0)) + 0.5;\n}\n\n// Apply aspect ratio correction (object-fit: cover)\nvec2 fitCover(vec2 uv, vec2 textureSize) {\n	vec2 scale = u_resolution.xy * textureSize.yx / (u_resolution.yx * textureSize.xy);\n	return (uv - 0.5) * min(scale, vec2(1.0)) + 0.5;\n}\n\n// Map source UVs back into viewport UVs using object-fit: cover.\nvec2 fitCoverInverse(vec2 uv, vec2 textureSize) {\n	vec2 scale = u_resolution.xy * textureSize.yx / (u_resolution.yx * textureSize.xy);\n	return (uv - 0.5) / min(scale, vec2(1.0)) + 0.5;\n}\n\nfloat _historyZ(int historyDepth, int frameOffset, int framesAgo) {\n	return float((historyDepth + frameOffset - framesAgo) % historyDepth);\n}\nfloat historyZ(highp sampler2DArray tex, int frameOffset, int framesAgo) {\n	return _historyZ(textureSize(tex, 0).z, frameOffset, framesAgo);\n}\nfloat historyZ(highp usampler2DArray tex, int frameOffset, int framesAgo) {\n	return _historyZ(textureSize(tex, 0).z, frameOffset, framesAgo);\n}\nfloat historyZ(highp isampler2DArray tex, int frameOffset, int framesAgo) {\n	return _historyZ(textureSize(tex, 0).z, frameOffset, framesAgo);\n}\n";

// src/plugins/helpers.ts
function helpers() {
  return function(_shader, context) {
    context.injectGLSL(helpers_default);
  };
}
var helpers_default2 = helpers;
export {
  helpers_default2 as default
};
//# sourceMappingURL=helpers.mjs.map