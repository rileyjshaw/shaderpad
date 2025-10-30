import ShaderPad, { save, WithSave } from 'shaderpad';

const fragmentShaderSrc = `#version 300 es
precision highp float;

// Built-in variables.
in vec2 v_uv;
uniform float u_time;
uniform vec2 u_resolution;

// Custom uniforms.
uniform float u_maxAngle;
uniform float u_speed;
uniform float u_phaseStep;
uniform float u_stepSize;
uniform float u_squareSize;
uniform float u_border;
uniform float u_isColorful;

// Corner colors:
vec3 color_tl = vec3(0.0, 1.0, 0.0); // Top left: Green.
vec3 color_bl = vec3(0.0, 0.0, 1.0); // Bottom left: Blue.
vec3 color_tr = vec3(1.0, 0.5, 0.0); // Top right: Orange.
vec3 color_br = vec3(1.0, 0.0, 0.0); // Bottom right: Red.

out vec4 outColor;

void main() {
    vec2 uv = (gl_FragCoord.xy / u_resolution.xy) * 2.0 - 1.0;
    uv.x *= u_resolution.x / u_resolution.y;
    vec2 center = u_resolution * 0.5;
    vec2 pos = gl_FragCoord.xy - center;
    float dist = length(pos);

    // Compute which ring we're in.
    float iRing = floor(dist / u_stepSize);
    float phase = -iRing * u_phaseStep;
    float angle = sin(u_time * u_speed + phase) * u_maxAngle;

    // Rotate position by angle.
    float s = sin(angle);
    float c = cos(angle);
    vec2 rotated = vec2(
        c * pos.x - s * pos.y,
        s * pos.x + c * pos.y
    );

    // Move back to pixel coordinates after rotation.
    vec2 gridUv = (rotated + center);

    // Compute uv01 from rotated coordinates.
    vec2 uv01_rotated = gridUv / u_resolution.xy;

    // Bilinear interpolation.
    vec3 color_left = mix(color_bl, color_tl, uv01_rotated.y);
    vec3 color_right = mix(color_br, color_tr, uv01_rotated.y);
    vec3 gradientColor = mix(color_left, color_right, uv01_rotated.x);
    vec3 bwColor = vec3(1.0);
    vec3 baseColor = (u_isColorful > 0.5) ? gradientColor : bwColor;

    // Grid: use pixel units so each cell is square.
    float gridPixelSize = u_squareSize;
    vec2 offset = mod(u_resolution, gridPixelSize) * 0.5;
    vec2 grid = fract((gridUv - offset) / gridPixelSize);

    // Draw squares: inside each cell, color if inside u_border of cell.
    float mask = step(u_border, grid.x) * step(u_border, grid.y) *
                 step(grid.x, 1.0 - u_border) * step(grid.y, 1.0 - u_border);

    // Blend the grid mask with the gradient color or grayscale.
    vec3 color = mix(vec3(0.0), baseColor, mask);
    outColor = vec4(color, 1.0);
}`;

const variants = [
	// Original.
	{
		u_maxAngle: (6 * Math.PI) / 180, // 6 degrees.
		u_speed: 2,
		u_phaseStep: Math.PI / 8,
		u_stepSize: 142,
		u_squareSize: 100,
		u_border: 0.25,
		u_isColorful: 0,
	},
	// Rainbow.
	{
		u_maxAngle: Math.PI, // 180 degrees.
		u_speed: 2,
		u_phaseStep: Math.PI / 16,
		u_stepSize: 160,
		u_squareSize: 1,
		u_border: 0,
		u_isColorful: 1,
	},
	// Wavy squares at the edges.
	{
		u_maxAngle: Math.PI / 180, // 1 degree.
		u_speed: 4,
		u_phaseStep: 0.3,
		u_stepSize: 1,
		u_squareSize: 120,
		u_border: 0.3,
		u_isColorful: 0,
	},
	// Interlaced stripes (2 sections).
	{
		u_maxAngle: 2 * Math.PI, // 360 degrees.
		u_speed: 0.025,
		u_phaseStep: Math.PI,
		u_stepSize: 10,
		u_squareSize: 160,
		u_border: 0.2,
		u_isColorful: 0,
	},
	// Interlaced stripes (3 sections).
	{
		u_maxAngle: 2 * Math.PI, // 360 degrees.
		u_speed: 0.025,
		u_phaseStep: (Math.PI * 3) / 2,
		u_stepSize: 18,
		u_squareSize: 160,
		u_border: 0.3,
		u_isColorful: 0,
	},
	// Graph paper.
	{
		u_maxAngle: 2 * Math.PI, // 360 degrees.
		u_speed: 0.025,
		u_phaseStep: Math.PI,
		u_stepSize: 100,
		u_squareSize: 20,
		u_border: 0.05,
		u_isColorful: 0,
	},
	// Twisting rug.
	{
		u_maxAngle: 200 * Math.PI, // 100 turns.
		u_speed: 0.001,
		u_phaseStep: Math.PI / 120,
		u_stepSize: 4,
		u_squareSize: 20,
		u_border: 0.15,
		u_isColorful: 1,
	},
	// Dot ripple.
	{
		u_maxAngle: Math.PI / 100,
		u_speed: 4,
		u_phaseStep: Math.PI / 42,
		u_stepSize: 10,
		u_squareSize: 42,
		u_border: 0.42,
		u_isColorful: 0,
	},
];

let shader: WithSave<ShaderPad> | null = null;
let isPlaying = true;
let variantIdx = 0;
let keydownHandler: ((e: KeyboardEvent) => void) | null = null;

export async function init() {
	shader = new ShaderPad(fragmentShaderSrc, { plugins: [save()] }) as WithSave<ShaderPad>;

	Object.entries(variants[0]).forEach(([key, value]) => {
		shader!.initializeUniform(key, 'float', value);
	});

	shader.play();

	keydownHandler = (e: KeyboardEvent) => {
		switch (e.key) {
			case ' ':
				isPlaying = !isPlaying;
				isPlaying ? shader!.play() : shader!.pause();
				break;
			// @ts-expect-error
			case 'ArrowRight':
				variantIdx += 2;
			// Falls through.
			case 'ArrowLeft':
				variantIdx = (variantIdx - 1 + variants.length) % variants.length;
				shader!.updateUniforms(variants[variantIdx]);
				break;
			case 's':
				shader!.save('sway');
				break;
		}
	};
	
	document.addEventListener('keydown', keydownHandler);
}

export function destroy() {
	if (shader) {
		shader.destroy();
		shader = null;
	}
	
	if (keydownHandler) {
		document.removeEventListener('keydown', keydownHandler);
		keydownHandler = null;
	}
	
	isPlaying = true;
	variantIdx = 0;
}
