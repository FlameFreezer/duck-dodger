precision highp float;

uniform vec2 resolution;
uniform vec3 baseColor;
uniform float time;
uniform vec2 canvasDim;

#define PI 3.14159
#define MAX_AMPLITUDE 0.55
#define MIN_AMPLITUDE 0.15

float pow4(float x) {
    return x * x * x * x;
}

float pow2(float x) {
    return x * x;
}

void main() {
    //Normalize the color values
    vec3 colorNorm = baseColor / 255.0;
    // gl_FragCoord is in range of canvasW x canvasH, but resolution is double this
    vec2 ratio = vec2(resolution.x / canvasDim.x, resolution.y / canvasDim.y);
    vec4 fragCoord = vec4(gl_FragCoord.x * ratio.x, gl_FragCoord.y * ratio.y, gl_FragCoord.zw);

    //at t=0, peak at middle of screen, valleys at end
    float sign = 2.0 * sin(0.5 * time);
    float xFactor = PI * fragCoord.x / resolution.x + sign;
    float maxAmplitude = pow4(sin(0.75 * time)) * (MAX_AMPLITUDE - MIN_AMPLITUDE) + MIN_AMPLITUDE;
    float minAmplitude = pow4(cos(0.75 * time)) * (MAX_AMPLITUDE - MIN_AMPLITUDE) + MIN_AMPLITUDE;
    float amplitudeX = pow2(sin(xFactor)) * (maxAmplitude - minAmplitude) + minAmplitude;

    float slope = -0.75 / amplitudeX;
    float alpha = slope * (fragCoord.y / resolution.y) + 0.75;
    gl_FragColor = vec4(colorNorm * alpha, alpha);
}