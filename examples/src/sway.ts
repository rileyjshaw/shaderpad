import ShaderPad from 'shaderpad';

const fragmentShaderSrc = `
precision highp float;

// Built-in variables.
varying vec2 v_uv;
uniform float u_time;
uniform vec2 u_resolution;

// Custom uniforms.
uniform float uMaxAngle;
uniform float uSpeed;
uniform float uPhaseStep;
uniform float uStepSize;
uniform float uSquareSize;
uniform float uBorder;
uniform float uIsColorful;

// Corner colors:
vec3 color_tl = vec3(0.0, 1.0, 0.0); // Top left: Green.
vec3 color_bl = vec3(0.0, 0.0, 1.0); // Bottom left: Blue.
vec3 color_tr = vec3(1.0, 0.5, 0.0); // Top right: Orange.
vec3 color_br = vec3(1.0, 0.0, 0.0); // Bottom right: Red.

void main() {
    vec2 uv = (gl_FragCoord.xy / u_resolution.xy) * 2.0 - 1.0;
    uv.x *= u_resolution.x / u_resolution.y;
    vec2 center = u_resolution * 0.5;
    vec2 pos = gl_FragCoord.xy - center;
    float dist = length(pos);

    // Compute which ring we're in.
    float iRing = floor(dist / uStepSize);
    float phase = -iRing * uPhaseStep;
    float angle = sin(u_time * uSpeed + phase) * uMaxAngle;

    // Rotate position by angle.
    float s = sin(angle);
    float c = cos(angle);
    vec2 rotated = vec2(
        c * pos.x - s * pos.y,
        s * pos.x + c * pos.y
    );

    // Move back to pixel coordinates after rotation
    vec2 gridUv = (rotated + center);

    // --- Gradient color after rotation ---
    // Compute uv01 from rotated coordinates
    vec2 uv01_rotated = gridUv / u_resolution.xy;

    // Bilinear interpolation
    vec3 color_left = mix(color_bl, color_tl, uv01_rotated.y);
    vec3 color_right = mix(color_br, color_tr, uv01_rotated.y);
    vec3 gradientColor = mix(color_left, color_right, uv01_rotated.x);
    vec3 bwColor = vec3(1.0);
    vec3 baseColor = (uIsColorful > 0.5) ? gradientColor : bwColor;

    // Grid: use pixel units so each cell is square.
    float gridPixelSize = uSquareSize;
    vec2 offset = mod(u_resolution, gridPixelSize) * 0.5;
    vec2 grid = fract((gridUv - offset) / gridPixelSize);

    // Draw squares: inside each cell, color if inside uBorder of cell
    float mask = step(uBorder, grid.x) * step(uBorder, grid.y) *
                 step(grid.x, 1.0 - uBorder) * step(grid.y, 1.0 - uBorder);

    // Blend the grid mask with the gradient color or grayscale
    vec3 color = mix(vec3(0.0), baseColor, mask);
    gl_FragColor = vec4(color, 1.0);
}
`;

const shader = new ShaderPad(fragmentShaderSrc);

const variants = [
	// Original.
	{
		uMaxAngle: (6 * Math.PI) / 180, // 6 degrees.
		uSpeed: 2,
		uPhaseStep: Math.PI / 8,
		uStepSize: 142,
		uSquareSize: 100,
		uBorder: 0.25,
		uIsColorful: 0,
	},
	// Rainbow.
	{
		uMaxAngle: Math.PI, // 180 degrees.
		uSpeed: 2,
		uPhaseStep: Math.PI / 16,
		uStepSize: 160,
		uSquareSize: 1,
		uBorder: 0,
		uIsColorful: 1,
	},
	// Wavy squares at the edges.
	{
		uMaxAngle: Math.PI / 180, // 1 degree.
		uSpeed: 4,
		uPhaseStep: 0.3,
		uStepSize: 1,
		uSquareSize: 120,
		uBorder: 0.3,
		uIsColorful: 0,
	},
	// Interlaced stripes (2 sections).
	{
		uMaxAngle: 2 * Math.PI, // 360 degrees.
		uSpeed: 0.025,
		uPhaseStep: Math.PI,
		uStepSize: 10,
		uSquareSize: 160,
		uBorder: 0.2,
		uIsColorful: 0,
	},
	// Interlaced stripes (3 sections).
	{
		uMaxAngle: 2 * Math.PI, // 360 degrees.
		uSpeed: 0.025,
		uPhaseStep: (Math.PI * 3) / 2,
		uStepSize: 18,
		uSquareSize: 160,
		uBorder: 0.3,
		uIsColorful: 0,
	},
	// Graph paper.
	{
		uMaxAngle: 2 * Math.PI, // 360 degrees.
		uSpeed: 0.025,
		uPhaseStep: Math.PI,
		uStepSize: 100,
		uSquareSize: 20,
		uBorder: 0.05,
		uIsColorful: 0,
	},
	// Twisting rug.
	{
		uMaxAngle: 200 * Math.PI, // 100 turns.
		uSpeed: 0.001,
		uPhaseStep: Math.PI / 120,
		uStepSize: 4,
		uSquareSize: 20,
		uBorder: 0.15,
		uIsColorful: 1,
	},
	// Dot ripple.
	{
		uMaxAngle: Math.PI / 100,
		uSpeed: 4,
		uPhaseStep: Math.PI / 42,
		uStepSize: 10,
		uSquareSize: 42,
		uBorder: 0.42,
		uIsColorful: 0,
	},
];

Object.entries(variants[0]).forEach(([key, value]) => {
	shader.initializeUniform(key, 'float', value);
});

shader.play();

let isPlaying = true;
let variantIdx = 0;
document.addEventListener('keydown', e => {
	switch (e.key) {
		case ' ':
			isPlaying = !isPlaying;
			isPlaying ? shader.play() : shader.pause();
			break;
		// @ts-expect-error
		case 'ArrowRight':
			variantIdx += 2;
		// Falls through.
		case 'ArrowLeft':
			variantIdx = (variantIdx - 1 + variants.length) % variants.length;
			shader.updateUniforms(variants[variantIdx]);
			break;
		case 's':
			shader.save('sway');
			break;
	}
});
