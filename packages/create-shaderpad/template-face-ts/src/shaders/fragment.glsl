#version 300 es
precision highp float;

in vec2 v_uv;
uniform sampler2D u_webcam;
out vec4 outColor;

void main() {
	vec2 webcamUV = fitCover(vec2(1.0 - v_uv.x, v_uv.y), vec2(textureSize(u_webcam, 0)));
	vec3 color = texture(u_webcam, webcamUV).rgb;
	color = mix(color, vec3(0.0, 1.0, 0.0), inFace(webcamUV));
	color = mix(color, vec3(1.0, 0.0, 0.0), inMouth(webcamUV));
	color = mix(color, vec3(0.0), inInnerMouth(webcamUV));
	color = mix(color, vec3(1.0), inEye(webcamUV));
	color = mix(color, vec3(0.0, 0.0, 1.0), inEyebrow(webcamUV));
	outColor = vec4(color, 1.0);
}
