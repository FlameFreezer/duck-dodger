#version 450

uniform vec2 resolution;
uniform float time;
uniform vec4 date;

layout(location = 0) out vec4 outColor;

void main() {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}