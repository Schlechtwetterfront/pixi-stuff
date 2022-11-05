export const VERTEX_SOURCE = `
precision highp float;

attribute vec2 aVertexPosition;
attribute vec2 aStart;
attribute vec2 aEnd;
attribute float aThickness;
attribute float aAlignment;
attribute vec4 aColor;

uniform mat3 projectionMatrix;

varying vec4 vColor;

void main() {
    vColor = aColor;

    // Tangent
    vec2 diff = aEnd - aStart;
    // Perpendicular to tangent
    vec2 lineNormal = normalize(vec2(-diff.y, diff.x));

    // Ratio for thickness based on alignment (0 is inside, .5 center, 1 outside)
    float alignmentRatio = aVertexPosition.y < 0.0 ? (1.0 - aAlignment) * 2.0 : aAlignment * 2.0;

    vec2 pos = aStart + diff * aVertexPosition.x + lineNormal * aThickness * alignmentRatio * aVertexPosition.y;

    gl_Position = vec4((projectionMatrix * vec3(pos, 1)).xy, 0, 1);
}
`;

export const FRAGMENT_SOURCE = `
precision highp float;

varying vec4 vColor;

void main() {
    gl_FragColor = vColor;
}
`;
