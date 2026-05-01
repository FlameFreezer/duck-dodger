const canvasW = 600;
const canvasH = 800;
const yellow = {
    r: 255, g: 213, b: 0
};
const green = {
    r: 5, g: 179, b: 20
};
function colorToVector(color) {
    return {
        x: color.r,
        y: color.g,
        z: color.b
    };
}
class Gallery extends Phaser.Scene {
    constructor() {
        super("gallery");
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
        //Load player data
        this.load.setPath("./config");
        this.load.json("playerData", "player.json");
        this.load.json("duckData", "ducks.json");
        this.load.json("waveData", "waves.json");
        //Load shader
        this.load.setPath("./src/Shaders/");
        this.load.glsl("background", "backgroundEffect.glsl");
    }
    create() {
        //Shader wants to be half-size for some reason. Hope that isn't platform specific
        this.bgShader = this.add.shader("background", 0, 0, canvasW * 2, canvasH * 2);
        this.bgShader.uniforms.baseColor = {
            type: '3f',
            value: colorToVector(yellow)
        };
        this.bgShader.initUniforms();
        this.player = new Player(this, this.cache.json.get("playerData"));
        this.waves = [];
        this.bullets = this.add.group({
            classType: Phaser.Physics.Arcade.Sprite,
            active: true,
            maxSize: -1,
            runChildUpdate: false,
            createCallback: null,
            removeCallback: null,
            createMultipleCallback: null
        });
        for(let waveData of this.cache.json.get("waveData")) {
            waveData.duckData = this.cache.json.get("duckData");
            this.waves.push(new Wave(this, waveData));
        }
        this.keys.a = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keys.d = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keys.w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keys.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.keys.shift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.currentWave = this.waves.shift();
        this.currentWave.start();
    }
    update(time, delta) {
        this.currentWave.update(delta);
        //Update bullets
        let bullets = this.bullets.getChildren();
        let ducks = this.currentWave.activeDucks.getChildren();
        for(let bullet of bullets) {
            if(!bullet.update(delta)) {
                bullet.queueDestroy = true;
            }
            else {
                ducks.forEach((duck) => {
                    if(bullet.collisionCheck(duck)) {
                        bullet.queueDestroy = true;
                        duck.queueDestroy = true;
                    }
                });
            }
        }
        ducks.forEach((duck) => {
            if(duck.queueDestroy) {
                duck.destroy(true);
                this.currentWave.activeDucks.remove(duck);
            }
        });
        bullets.forEach((bullet) => {
            if(bullet.queueDestroy) {
                bullet.destroy(true);
                this.bullets.remove(bullet);
            }
        })
        this.player.update(delta);
    }
}