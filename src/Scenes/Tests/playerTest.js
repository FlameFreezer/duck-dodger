class PlayerTest extends Phaser.Scene {
    constructor() {
        super("playerTest");
        this.keys = {
            a: null,
            d: null,
            space: null,
            shift: null,
            w: null
        };
    }

    preload() {
        //Load sprites
        this.load.setPath("./assets/spritesheets/");
        //Load in player sprite
        this.load.atlasXML("player", "enemies.png", "enemies.xml");
        //Load in duck sprites
        this.load.atlasXML("ducks", "spritesheet_objects.png", "spritesheet_objects.xml");

        //Load in player JSON
        this.load.setPath("./config/");
        this.load.json("playerData", "player.json");

        //Load shader
        this.load.setPath("./src/Shaders/");
        this.load.glsl("background", "backgroundEffect.frag");
    }

    create() {
        //Shader wants to be half-size for some reason. Hope that isn't platform specific
        this.bgShader = this.add.shader("background", 0, 0, canvasW * 2, canvasH * 2);
        this.bgShader.uniforms.baseColor = {
            type: '3f',
            value: colorToVector(yellow)
        };
        this.bgShader.uniforms.canvasDim = {
            type: '2f',
            value: {
                x: canvasW,
                y: canvasH
            }
        };
        this.bgShader.initUniforms();

        this.player = new Player(this, this.cache.json.get("playerData"));

        this.keys.a = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keys.d = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keys.w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keys.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.keys.shift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.keys.enter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    }

    update(time, delta) {
        this.player.update(delta);
    }
}