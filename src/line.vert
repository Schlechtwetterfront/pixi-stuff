precision highp float;

attribute vec2 aVertexPosition;

attribute vec2 aBeforeStart;
attribute vec2 aStart;
attribute vec2 aEnd;
attribute vec2 aAfterEnd;

attribute float aThickness;
attribute float aAlignment;

attribute vec4 aColor;

uniform mat3 projectionMatrix;

varying vec4 vColor;

void main() {
    vColor = aColor;

    // Use the fact that aVertexPosition.x is either 0 or 1 to calculate relevant points for miter
    vec2 pointA = aBeforeStart * (1.0 - aVertexPosition.x) + aStart * aVertexPosition.x;
    vec2 pointB = aStart * (1.0 - aVertexPosition.x) + aEnd * aVertexPosition.x;
    vec2 pointC = aEnd * (1.0 - aVertexPosition.x) + aAfterEnd * aVertexPosition.x;

    // Tangent of first line segment
    vec2 ba = normalize(pointB - pointA);
    vec2 baNormal = normalize(vec2(-ba.y, ba.x));

    // Tangent/miter normal for the center point
    vec2 tangent = normalize(normalize(pointC - pointB) + ba);
    vec2 miterNormal = vec2(-tangent.y, tangent.x);

    // Ratio for thickness based on alignment (0 is inside, .5 center, 1 outside)
    float alignmentRatio = aVertexPosition.y < 0.0 ? (1.0 - aAlignment) * 2.0 : aAlignment * 2.0;

    // Point adjusted for miter join
    vec2 miter = miterNormal * aThickness * alignmentRatio / dot(miterNormal, baNormal);

    vec2 pos = pointB + miter * aVertexPosition.y;

    gl_Position = vec4((projectionMatrix * vec3(pos, 1)).xy, 0, 1);
}