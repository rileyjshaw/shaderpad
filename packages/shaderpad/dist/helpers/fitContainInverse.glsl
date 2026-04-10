// Map source UVs back into viewport UVs using object-fit: contain.
vec2 fitContainInverse(vec2 uv, vec2 textureSize) {
	vec2 scale = u_resolution.xy * textureSize.yx / (u_resolution.yx * textureSize.xy);
	return (uv - 0.5) / max(scale, vec2(1.0)) + 0.5;
}
