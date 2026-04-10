#version 300 es
precision highp float;

in vec2 v_uv;
uniform sampler2D u_webcam;
out vec4 outColor;

void main() {
	vec2 webcamUV = fitCover(vec2(1.0 - v_uv.x, v_uv.y), vec2(textureSize(u_webcam, 0)));
	vec3 color = texture(u_webcam, webcamUV).rgb;

	vec2 pose = poseAt(webcamUV);
	if (pose.y >= 0.0) {
		int poseIndex = int(pose.y);
		vec2 torso = vec2(poseLandmark(poseIndex, POSE_LANDMARK_TORSO_CENTER));
		vec2 leftHand = vec2(poseLandmark(poseIndex, POSE_LANDMARK_LEFT_HAND_CENTER));
		vec2 rightHand = vec2(poseLandmark(poseIndex, POSE_LANDMARK_RIGHT_HAND_CENTER));

		color = mix(color, vec3(0.08, 0.92, 0.58), pose.x * 0.35);
		color = mix(color, vec3(1.0, 0.88, 0.2), 1.0 - smoothstep(0.045, 0.075, distance(webcamUV, torso)));
		color = mix(color, vec3(0.24, 0.72, 1.0), 1.0 - smoothstep(0.02, 0.04, distance(webcamUV, leftHand)));
		color = mix(color, vec3(1.0, 0.32, 0.52), 1.0 - smoothstep(0.02, 0.04, distance(webcamUV, rightHand)));
	}

	outColor = vec4(color, 1.0);
}
