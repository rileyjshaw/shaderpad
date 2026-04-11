#version 300 es
precision highp float;

in vec2 v_uv;
uniform sampler2D u_webcam;
out vec4 outColor;

#define THUMB_TIP 4
#define INDEX_TIP 8
#define MIDDLE_TIP 12
#define RING_TIP 16
#define PINKY_TIP 20
#define HAND_CENTER 21

float marker(vec2 uv, vec2 pos, float radius, float feather) {
	return 1.0 - smoothstep(radius, radius + feather, distance(uv, pos));
}

void main() {
	vec2 webcamUV = fitCover(vec2(1.0 - v_uv.x, v_uv.y), vec2(textureSize(u_webcam, 0)));
	vec3 color = texture(u_webcam, webcamUV).rgb;

	for (int i = 0; i < u_nHands; ++i) {
		vec2 center = vec2(handLandmark(i, HAND_CENTER));
		vec3 handednessColor = mix(vec3(0.08, 0.92, 1.0), vec3(1.0, 0.58, 0.14), isRightHand(i));
		color = mix(color, handednessColor, marker(webcamUV, center, 0.03, 0.015) * 0.75);
		color = mix(color, vec3(1.0), marker(webcamUV, center, 0.012, 0.008));

		color = mix(color, vec3(1.0, 0.92, 0.15), marker(webcamUV, vec2(handLandmark(i, THUMB_TIP)), 0.015, 0.008));
		color = mix(color, vec3(1.0, 0.2, 0.25), marker(webcamUV, vec2(handLandmark(i, INDEX_TIP)), 0.015, 0.008));
		color = mix(color, vec3(0.2, 1.0, 0.45), marker(webcamUV, vec2(handLandmark(i, MIDDLE_TIP)), 0.015, 0.008));
		color = mix(color, vec3(0.2, 0.55, 1.0), marker(webcamUV, vec2(handLandmark(i, RING_TIP)), 0.015, 0.008));
		color = mix(color, vec3(0.95, 0.28, 1.0), marker(webcamUV, vec2(handLandmark(i, PINKY_TIP)), 0.015, 0.008));
	}

	outColor = vec4(color, 1.0);
}
