// Apply aspect ratio correction (object-fit: cover)
vec2 fitCover(vec2 uv, vec2 textureSize) {
	vec2 scale = u_resolution.xy * textureSize.yx / (u_resolution.yx * textureSize.xy);
	return (uv - 0.5) * min(scale, vec2(1.0)) + 0.5;
}
