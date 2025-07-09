import ShaderPad from 'shaderpad';

const gridLength = 5;
const gridSize = gridLength * gridLength;

const trailShader = `#version 300 es
precision highp float;

in vec2 v_uv;
uniform int u_frame;
uniform vec4 u_cursor;

uniform highp sampler2DArray u_history;

out vec4 fragColor;

void main() {
    vec2 uv = v_uv;

    vec2 gridUV = fract(uv * ${gridLength}.0);
    vec2 gridPos = floor(uv * ${gridLength}.0);

    // Calculate which history frame to show based on grid position
    int historyLength = textureSize(u_history, 0).z;
    int outputFrameIndex = u_frame % historyLength; // Index of the frame this full render will write to.
    int age = int(${gridLength}.0 - gridPos.x + gridPos.y * ${gridLength}.0); // 25 is top left, 1 is bottom right.
    int historyIndex = (outputFrameIndex + historyLength - age) % historyLength; // Newest frame is at the bottom right.

    // Sample from history texture
    vec3 historyColor = texture(u_history, vec3(gridUV, float(historyIndex))).rgb;

    // Dim old frames: the further back in history, the dimmer
    float dim = 1.0 - float(age) / float(historyLength);
    historyColor *= dim;

    // Add cursor overlay
    vec2 cursorPos = u_cursor.xy;
    float cursorDist = distance(uv, cursorPos);
    float cursor = smoothstep(0.05, 0.02, cursorDist);
    vec3 cursorColor = vec3(cursor, 0.0, 0.0);

    // Combine history and cursor
    vec3 finalColor = historyColor + cursorColor;

    fragColor = vec4(finalColor, 1.0);
}
`;

const shader = new ShaderPad(trailShader, { history: gridSize });
shader.play();
