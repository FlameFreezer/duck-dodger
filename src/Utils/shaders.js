function initBackgroundShader(scene) {
    //Shader wants to be half-size for some reason. Hope that isn't platform specific
    scene.bgShader = scene.add.shader("background", 0, 0, CANVAS_WIDTH * 2, CANVAS_HEIGHT * 2);
    scene.bgShader.uniforms.baseColor = {
        type: '3f',
        value: colorToVector(GetRGBFromColor(Colors.YELLOW))
    };
    scene.bgShader.uniforms.canvasDim = {
        type: '2f',
        value: {
            x: CANVAS_WIDTH,
            y: CANVAS_HEIGHT
        }
    };
    scene.bgShader.initUniforms();
}