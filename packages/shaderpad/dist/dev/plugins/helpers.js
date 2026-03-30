"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/plugins/helpers.ts
var helpers_exports = {};
__export(helpers_exports, {
  default: () => helpers_default2
});
module.exports = __toCommonJS(helpers_exports);

// src/plugins/helpers.glsl
var helpers_default = "uniform vec2 u_resolution;\n\n// Apply aspect ratio correction (object-fit: contain)\nvec2 fitContain(vec2 uv, vec2 textureSize) {\n	vec2 scale = u_resolution.xy * textureSize.yx / (u_resolution.yx * textureSize.xy);\n	return (uv - 0.5) * max(scale, vec2(1.0)) + 0.5;\n}\n\n// Apply aspect ratio correction (object-fit: cover)\nvec2 fitCover(vec2 uv, vec2 textureSize) {\n	vec2 scale = u_resolution.xy * textureSize.yx / (u_resolution.yx * textureSize.xy);\n	return (uv - 0.5) * min(scale, vec2(1.0)) + 0.5;\n}\n\nfloat _historyZ(int historyDepth, int frameOffset, int framesAgo) {\n	return float((historyDepth + frameOffset - framesAgo) % historyDepth);\n}\nfloat historyZ(highp sampler2DArray tex, int frameOffset, int framesAgo) {\n	return _historyZ(textureSize(tex, 0).z, frameOffset, framesAgo);\n}\nfloat historyZ(highp usampler2DArray tex, int frameOffset, int framesAgo) {\n	return _historyZ(textureSize(tex, 0).z, frameOffset, framesAgo);\n}\nfloat historyZ(highp isampler2DArray tex, int frameOffset, int framesAgo) {\n	return _historyZ(textureSize(tex, 0).z, frameOffset, framesAgo);\n}\n";

// src/plugins/helpers.ts
function helpers() {
  return function(_shader, context) {
    context.injectGLSL(helpers_default);
  };
}
var helpers_default2 = helpers;
//# sourceMappingURL=helpers.js.map