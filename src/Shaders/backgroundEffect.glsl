precision highp float;

uniform vec2 resolution;
uniform vec3 baseColor;

void main() {
    // gl_FragCoord is in range of canvasW x canvasH, but resolution is double this
    vec4 fragCoord = gl_FragCoord * 2.0;
    float amplitude = sin(3.14159 * (1.0 - fragCoord.y / resolution.y)) * 0.75;
    gl_FragColor = vec4(amplitude * baseColor.x / 255.0, amplitude * baseColor.y / 255.0, amplitude * baseColor.z / 255.0, 1.0);
}