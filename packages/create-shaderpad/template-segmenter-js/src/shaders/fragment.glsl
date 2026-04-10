#version 300 es
precision highp float;

in vec2 v_uv;
uniform sampler2D u_webcam;
out vec4 outColor;

vec3 palette(float t) {
	return 0.55 + 0.45 * cos(6.28318 * (vec3(0.08, 0.36, 0.67) + t));
}

void main() {
	vec2 webcamUV = fitCover(vec2(1.0 - v_uv.x, v_uv.y), vec2(textureSize(u_webcam, 0)));
	vec3 color = texture(u_webcam, webcamUV).rgb;

	vec2 segment = segmentAt(webcamUV);
	float confidence = segment.x;
	int category = int(floor(segment.y * float(max(u_numCategories - 1, 1)) + 0.5));
	float isForeground = float(category != 0) * confidence;
	color = mix(color, palette(segment.y), isForeground * 0.45);

	vec2 pixel = vec2(1.0) / vec2(textureSize(u_webcam, 0));
	float edge = 0.0;
	edge += abs(confidence - segmentAt(webcamUV + vec2(pixel.x, 0.0)).x);
	edge += abs(confidence - segmentAt(webcamUV + vec2(0.0, pixel.y)).x);
	color = mix(color, vec3(1.0), smoothstep(0.08, 0.24, edge) * 0.5);

	outColor = vec4(color, 1.0);
}
