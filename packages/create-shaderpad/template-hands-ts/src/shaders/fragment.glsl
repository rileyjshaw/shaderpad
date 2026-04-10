#version 300 es
precision highp float;

in vec2 v_uv;
uniform sampler2D u_webcam;
out vec4 outColor;

#define THUMB_TIP 4
#define INDEX_TIP 8
#define HAND_CENTER 21

void main() {
	vec2 webcamUV = fitCover(vec2(1.0 - v_uv.x, v_uv.y), vec2(textureSize(u_webcam, 0)));
	vec3 color = texture(u_webcam, webcamUV).rgb;

	for (int i = 0; i < u_nHands; ++i) {
		vec2 center = vec2(handLandmark(i, HAND_CENTER));
		vec2 pinch = 0.5 * (vec2(handLandmark(i, THUMB_TIP)) + vec2(handLandmark(i, INDEX_TIP)));
		vec3 handColor = mix(vec3(0.08, 0.92, 1.0), vec3(1.0, 0.58, 0.14), isRightHand(i));
		color = mix(color, handColor, 1.0 - smoothstep(0.035, 0.06, distance(webcamUV, center)));
		color = mix(color, vec3(1.0), 1.0 - smoothstep(0.015, 0.03, distance(webcamUV, pinch)));
	}

	outColor = vec4(color, 1.0);
}
