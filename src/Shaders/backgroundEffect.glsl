precision highp float;

uniform vec2 resolution;
uniform vec3 baseColor;
uniform float time;

#define PI 3.14159

void main() {
    // gl_FragCoord is in range of canvasW x canvasH, but resolution is double this
    vec4 fragCoord = gl_FragCoord * 2.0;
    float shift = 0.5 + 0.15 * sin(2.0 * time);
    float amplitude = sin(PI * (fragCoord.y / resolution.y + shift)) * 0.55;
    vec3 colorNorm = baseColor / 255.0;
    gl_FragColor = vec4(amplitude * colorNorm, amplitude);
}