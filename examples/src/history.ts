import ShaderPad from 'shaderpad';

const gridLength = 5;
const gridSize = gridLength * gridLength;

const fragmentShaderSrc = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 outColor;
uniform int u_frame;
uniform vec2 u_cursor;

uniform highp sampler2DArray u_history;

void main() {
    vec2 gridUV = fract(v_uv * ${gridLength}.0);
    vec2 gridPos = floor(v_uv * ${gridLength}.0);

    // Calculate which history frame to show based on grid position.
    int historyLength = textureSize(u_history, 0).z;
    int outputFrameIndex = u_frame % historyLength; // Index of the frame this full render will write to.
    int age = int(${gridLength}.0 - gridPos.x + gridPos.y * ${gridLength}.0); // 25 is top left, 1 is bottom right.
    int historyIndex = (outputFrameIndex + historyLength - age) % historyLength; // Newest frame is at the bottom right.

    // Sample from history texture; dim old frames.
    vec3 historyColor = texture(u_history, vec3(gridUV, float(historyIndex))).rgb;
    float dim = 1.0 - float(age) / float(historyLength);
    historyColor *= dim;

    // Add cursor overlay.
    float cursorDist = distance(v_uv, u_cursor);
    float cursor = smoothstep(0.05, 0.02, cursorDist);
    vec3 cursorColor = vec3(cursor, 0.0, 0.0);

    vec3 finalColor = historyColor + cursorColor;
    outColor = vec4(finalColor, 1.0);
}`;

const shader = new ShaderPad(fragmentShaderSrc, { history: gridSize });
shader.play();
