#version 300 es
precision highp float;

in vec2 v_uv;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_cursor;
out vec4 outColor;

vec2 warpStrength(vec2 delta) {
  float distance = length(delta);
  return delta / max(distance, 1e-4) * (64.0 * smoothstep(420.0, 0.0, distance));
}

void main() {
  vec2 pixel = v_uv * u_resolution;
  vec2 cursor = u_cursor * u_resolution;
  vec2 delta = pixel - cursor;
  float cursorRing = smoothstep(6.0, 2.0, abs(length(delta) - 24.0));
  vec2 warpedPixel = pixel + warpStrength(delta);
  vec2 cell = floor(pixel / 50.0);
  float dotMask = 0.0;
  for (float y = -1.0; y <= 1.0; y++) {
    for (float x = -1.0; x <= 1.0; x++) {
      vec2 dotCenter = (cell + vec2(x, y) + 0.5) * 50.0;
      vec2 dotDelta = dotCenter - cursor;
      vec2 warpedDotCenter = dotCenter + warpStrength(dotDelta);
      dotMask = max(dotMask, step(length(pixel - warpedDotCenter), 4.0));
    }
  }

  vec2 p = (warpedPixel * 2.0 - u_resolution) / min(u_resolution.x, u_resolution.y);
  float t = u_time * 0.125;
  float a = 0.0;
  float b = t;
  for (float i = 0.0; i < 6.0; i++) {
    a += cos(i - a * p.x - b * 1.25);
    b += cos(i * p.y + a * 1.25);
  }
  b -= t;

  vec3 color = vec3(cos(p * vec2(a, b)), 0.5 * cos(a + b));
  color = sin(color * cos(vec3(a, 2.5, b)) * 0.5 + 2.0);
  color = mix(color, vec3(1.0), (dotMask + cursorRing) * 0.9);
  outColor = vec4(color, 1.0);
}
