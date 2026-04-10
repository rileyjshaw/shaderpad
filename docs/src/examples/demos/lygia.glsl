#version 300 es
precision highp float;

in vec2 v_uv;
uniform float u_time;
uniform vec2 u_resolution;
out vec4 outColor;

#include "lygia/space/ratio.glsl"
#include "lygia/generative/worley.glsl"

void main() {
  vec2 uv = ratio(v_uv, u_resolution);
  vec2 flow = uv * 5.0;
  flow += 0.08 * vec2(
    sin(u_time * 0.45 + uv.y * 12.0),
    cos(u_time * 0.35 + uv.x * 9.0)
  );

  float cells = worley(vec3(flow, u_time * 0.12));
  float detail = worley(vec3(flow * 1.8 + vec2(3.0, -2.0), -u_time * 0.08));

  float bands = smoothstep(0.06, 0.2, abs(cells - 0.5));
  float sparks = smoothstep(0.55, 0.92, 1.0 - abs(detail - 0.5) * 2.0);
  float vignette = smoothstep(1.35, 0.15, length(uv - 0.5));

  vec3 deep = vec3(0.04, 0.06, 0.1);
  vec3 mid = vec3(0.07, 0.42, 0.78);
  vec3 bright = vec3(0.99, 0.9, 0.58);

  vec3 color = mix(deep, mid, bands);
  color = mix(color, bright, sparks);
  color *= 0.9 + 0.1 * sin(vec3(0.0, 1.5, 3.0) + u_time + cells * 6.28318);
  color *= vignette;

  outColor = vec4(color, 1.0);
}
