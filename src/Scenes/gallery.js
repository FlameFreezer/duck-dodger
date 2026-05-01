const canvasW = 600;
const canvasH = 800;
const yellow = {
    r: 255, g: 213, b: 0
};
const green = {
    r: 5, g: 179, b: 20
};
const states = Object.freeze({
    WAVE_ENTRANCE: 0,
    WAVE_ACTIVE: 1,
    WAVE_TRANSITION: 2
});
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
        this.currentState = states.WAVE_ENTRANCE;
        this.currentWave = this.waves.shift();
        this.transitionTime = 0;
        this.entranceTime = 0;
        this.currentWave.start();
    }
    update(time, delta) {
        let bullets = this.bullets.getChildren();
        let ducks = this.currentWave.activeDucks.getChildren();
        for(let bullet of bullets) {
            if(!bullet.update(delta)) {
                bullet.queueDestroy = true;
            }
        }
        switch(this.currentState) {
            case states.WAVE_ACTIVE:
                this.updateActive(delta);
                break;
            case states.WAVE_ENTRANCE:
                this.updateEntrance(delta);
                break;
            case states.WAVE_TRANSITION:
                this.updateTransition(delta);
                break;
        }
        ducks.forEach((duck) => {
            if(duck.queueDestroy) {
                this.currentWave.destroyDuck(duck);
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
    updateTransition(delta) {
        this.transitionTime += delta;
        if(this.transitionTime > 2000) {
            let nextWave = this.waves.shift();
            //If we have a new wave to start, start it
            if(nextWave !== undefined) {
                this.currentWave = nextWave;
            }
            //Otherwise, restart the last wave
            else {
                this.currentWave.isOver = false;
            }
            this.currentWave.start();
            this.transitionTime = 0;
            this.currentState = states.WAVE_ENTRANCE;
        }
    }
    updateEntrance(delta) {
        this.currentWave.update(delta);
        this.entranceTime += delta;
        if(this.entranceTime > 1000) {
            this.entranceTime = 0;
            this.currentState = states.WAVE_ACTIVE;
        }
    }
    updateActive(delta) {
        this.currentWave.update(delta);
        if(this.currentWave.isOver) {
            console.log("wave complete!");
            this.currentState = states.WAVE_TRANSITION;
        }
        //Update bullets
        let bullets = this.bullets.getChildren();
        let ducks = this.currentWave.activeDucks.getChildren();
        for(let bullet of bullets) {
            if(!bullet.queueDestroy) {
                ducks.forEach((duck) => {
                    if(bullet.collisionCheck(duck)) {
                        bullet.queueDestroy = true;
                        duck.hp -= 1;
                        if(duck.onHitFlashTimer == 0) {
                            duck.onHitFlashTimer += delta;
                        }
                        if(duck.hp == 0) {
                            duck.queueDestroy = true;
                        }
                    }
                });
            }
        }
    }
}