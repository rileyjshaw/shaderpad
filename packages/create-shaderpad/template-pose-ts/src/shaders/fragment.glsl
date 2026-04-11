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
		vec3 poseColor = vec3(float(poseIndex % 3 == 0), float(poseIndex % 3 == 1), float(poseIndex % 3 == 2));
		color = mix(color, poseColor, pose.x * 0.3);
	}

	for (int i = 0; i < u_nPoses; ++i) {
		for (int j = 0; j < 39; ++j) {
			vec2 landmarkPos = vec2(poseLandmark(i, j));
			float landmarkDot = 1.0 - smoothstep(0.0, 0.005, distance(webcamUV, landmarkPos));
			color = mix(color, vec3(1.0, 0.0, 0.0), landmarkDot);
		}
	}

	outColor = vec4(color, 1.0);
}
