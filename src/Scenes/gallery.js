const canvasW = 600;
const canvasH = 800;
const healthUpInterval = 500;
const yellow = {
    r: 255, g: 213, b: 0
};
const green = {
    r: 5, g: 179, b: 20
};
const states = Object.freeze({
    WAVE_ACTIVE: 0,
    WAVE_TRANSITION: 1,
    GAME_OVER: 2,
    GAME_INITIAL: 3
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
        this.load.atlasXML("hearts", "spritesheet-tiles-default.png", "spritesheet-tiles-default.xml");
        //Load player data
        this.load.setPath("./config");
        this.load.json("playerData", "player.json");
        this.load.json("duckData", "ducks.json");
        this.load.json("waveData", "waves.json");
        //Load shader
        this.load.setPath("./src/Shaders/");
        this.load.glsl("background", "backgroundEffect.glsl");
        //Load font
        this.load.setPath("./assets/daydream_3");
        this.load.bitmapFont("daydream_3", "daydream_3_0.png", "daydream_3.fnt");
        //Load sounds
        this.load.setPath("./assets/Audio");
        this.load.audio("duckHit", "footstep_wood_001.ogg");
        this.load.audio("bulletRing", "phaserUp6.ogg");
        this.load.audio("duckBullet", "tone1.ogg");
        this.load.audio("duckDeath", "highUp.ogg");
        this.load.audio("healthUp", "jingles_HIT03.ogg");
        this.load.audio("nextWave", "jingles_HIT04.ogg");
        this.load.audio("gameOver", "jingles_HIT11.ogg");
        this.load.audio("breadGot", "jingles_HIT15.ogg");
        this.load.audio("playerHit", "footstep_snow_000.ogg");
        //Load images
        this.load.setPath("./assets/Images");
        this.load.image("bread", "bread.png");
        this.load.image("breadHit", "breadHit.png");
    }
    create() {
        //Shader wants to be half-size for some reason. Hope that isn't platform specific
        this.bgShader = this.add.shader("background", 0, 0, canvasW * 2, canvasH * 2);
        this.bgShader.uniforms.baseColor = {
            type: '3f',
            value: colorToVector(yellow)
        };
        this.heart = this.add.sprite(canvasW - canvasW / 8 - 32, canvasH / 16 + 38, "hearts", "hud_heart");
        this.heart.setScale(0.85);
        this.bgShader.initUniforms();
        this.player = new Player(this, this.cache.json.get("playerData"));
        this.score = 0;
        this.ui = {};
        this.ui.score = this.add.bitmapText(canvasW - canvasW / 8, canvasH / 16, "daydream_3", "Score: 0", 18)
            .setOrigin(0.5)
            .setBlendMode(Phaser.BlendModes.ADD);
        this.ui.waveComplete = this.add.bitmapText(canvasW / 2, canvasH / 2, "daydream_3", "Wave Complete!", 18)
            .setOrigin(0.5)
            .setBlendMode(Phaser.BlendModes.ADD);
        this.ui.waveNumber = this.add.bitmapText(canvasW / 2, canvasH / 2, "daydream_3", "Wave 0", 18)
            .setOrigin(0.5)
            .setBlendMode(Phaser.BlendModes.ADD);
        this.ui.hp = this.add.bitmapText(canvasW - canvasW / 8 + 12, canvasH / 16 + 40, "daydream_3", "x0", 18)
            .setOrigin(0.5)
            .setBlendMode(Phaser.BlendModes.ADD);
        
        this.ui.waveComplete.visible = false;
        this.ui.waveNumber.visible = false;
        this.waves = [];
        this.bullets = this.add.group({
            classType: Phaser.GameObjects.Sprite,
            active: true,
            maxSize: -1
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
        this.keys.enter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        this.currentState = states.WAVE_TRANSITION;
        this.transitionTime = 0;
        this.entranceTime = 0;
        this.waveNumber = 0;
        this.lastHpMilestone = 0;
        this.bulletRemoveQueue = [];
        this.duckRemoveQueue = [];
        this.duckBulletRings = [];
        this.duckBullets = this.add.group({
            classType: Phaser.GameObjects.Sprite,
            active: true,
            maxSize: -1
        });
        this.duckBulletRemoveQueue = [];

        this.duckHitSfx = this.sound.add("duckHit", {
            volume: 0.5
        });
        this.duckDeathSfx = this.sound.add("duckDeath", {
            volume: 0.5
        });
        this.healthUpSfx = this.sound.add("healthUp", {
            volume: 0.5
        });
        this.nextWaveSfx = this.sound.add("nextWave", {
            volume: 0.5
        });
        this.gameOverSfx = this.sound.add("gameOver", {
            volume: 0.5
        });
        this.breadSfx = this.sound.add("breadGot", {
            volume: 0.5
        });
        this.playerHitSfx = this.sound.add("playerHit", {
            volume : 0.15
        });
        this.nextWave();
    }
    nextWave() {
        this.time.addEvent({
            delay: waveTransitionTime / 2,
            callback: (self) => {
                self.doWaveEntrance();
            },
            args: [this]
        });
        let nextWave = this.waves.shift();
        //If we have a new wave to start, start it
        if(nextWave !== undefined) {
            this.currentWave = nextWave;
        }
        //Otherwise, restart the last wave
        else if(this.currentWave !== undefined) {
            this.currentWave.isOver = false;
        }
        else {
            throw "Error: no waves were defined on disk";
        }
        this.ui.waveComplete.visible = false;
        this.waveNumber += 1;
        this.ui.waveNumber.visible = true;
        this.ui.waveNumber.setText(`Wave ${this.waveNumber}`);
        this.nextWaveSfx.play();
    }
    flushRemoveQueues() {
        for(let bullet of this.bulletRemoveQueue) {
            this.bullets.remove(bullet);
            bullet.destroy();
        }
        this.bulletRemoveQueue = [];

        for(let duck of this.duckRemoveQueue) {
            duck.wave = this.currentWave;
            duck.destroy();
        }
        this.duckRemoveQueue = [];

        for(let bullet of this.duckBulletRemoveQueue) {
            this.duckBullets.remove(bullet);
            bullet.destroy();
        }
        this.duckBulletRemoveQueue = [];
    }
    update(time, delta) {
        this.player.update(delta);
        this.ui.score.setText(`Score ${this.score}`);
        this.ui.hp.setText(`x${this.player.hp}`);
        let bullets = this.bullets.getChildren();
        let ducks = this.currentWave.activeDucks.getChildren();
        for(let bullet of bullets) {
            if(!bullet.update(delta)) {
                this.bullets.remove(bullet);
                bullet.destroy();
            }
        }
        for(let bulletRing of this.duckBulletRings) {
            bulletRing.update(delta);
        }
        for(let bullet of this.duckBullets.getChildren()) {
            bullet.update(delta);
        }
        switch(this.currentState) {
            case states.WAVE_ACTIVE:
                this.updateActive(delta);
                break;
            case states.GAME_OVER:
                this.updateActive(delta);
                this.updateGameOver(delta);
                break;
            case states.WAVE_TRANSITION:
                this.updateTransition();
                break;
        }
        this.flushRemoveQueues();
    }
    addScore(score) {
        this.score += score;
        if(this.score - this.lastHpMilestone >= healthUpInterval) {
            this.player.hp += 1;
            this.lastHpMilestone = this.score - (this.score - this.lastHpMilestone - healthUpInterval);
            this.healthUpSfx.play();
        }
    }
    doWaveTransition() {
        this.currentState = states.WAVE_TRANSITION;
        this.ui.waveComplete.visible = true;
        this.addScore(100);
        this.time.addEvent({
            delay: waveTransitionTime / 2,
            callback: (self) => {
                self.ui.waveComplete.visible = false;
                self.ui.waveNumber.visible = true;
                this.nextWave();
            },
            args: [this]
        });
    }
    doWaveEntrance() {
        this.currentWave.start();
        this.currentState = states.WAVE_ACTIVE;
        this.ui.waveComplete.visible = false;
        this.ui.waveNumber.visible = false;
    }
    updateTransition() {
    }
    updateActive(delta) {
        this.currentWave.update(delta);
        if(this.currentWave.isOver) {
            this.doWaveTransition();
            return;
        }
        //Update bullets
        let bullets = this.bullets.getChildren();
        let ducks = this.currentWave.activeDucks.getChildren();
        for(let bullet of bullets) {
            ducks.forEach((duck) => {
                if(bullet.collisionCheck(duck)) {
                    this.duckHitSfx.play();
                    this.bulletRemoveQueue.push(bullet);
                    duck.hp -= 1;
                    duck.visible = false;
                    duck.spriteOnHit.visible = true;
                    if(duck.type == "bread") {
                        duck.breadSprite.visible = false;
                    }
                    duck.onHitFlashTimer = this.time.delayedCall(onHitFlashTime,
                        (duck) => {
                            duck.spriteOnHit.visible = false;
                            if(duck.type == "bread") {
                                duck.breadSprite.visible = true;
                            }
                            else {
                                duck.visible = true;
                            }
                        },
                        [duck]
                    );
                    if(duck.hp == 0) {
                        this.addScore(duck.points);
                        this.duckRemoveQueue.push(duck);
                        if(duck.type == "bread") {
                            this.breadSfx.play();
                        }
                        else {
                            this.duckDeathSfx.play();
                        }
                    }
                }
            });
        }
        //Check collisions of enemy bullets with player
        for(let ring of this.duckBulletRings) {
            for(let bullet of ring.bullets.getChildren()) {
                this.doPlayerCollision(bullet);
            }
        }
        for(let bullet of this.duckBullets.getChildren()) {
            this.doPlayerCollision(bullet);
            if(bullet.x + bullet.width * bullet.scaleX / 2 <= 0) {
                this.duckBulletRemoveQueue.push(bullet);
            };
            if(bullet.x - bullet.width * bullet.scaleX / 2 >= canvasW) {
                this.duckBulletRemoveQueue.push(bullet);
            }
            if(bullet.y + bullet.height * bullet.scaleY / 2 <= 0) {
                this.duckBulletRemoveQueue.push(bullet);
            }
            if(bullet.y - bullet.height * bullet.scaleY / 2 >= canvasH) {
                this.duckBulletRemoveQueue.push(bullet);
            }
        }
    }
    doPlayerCollision(bullet) {
        if(bullet.collisionCheck(this.player) && !this.player.wasHitThisFrame) {
            this.player.hp -= 1;
            this.playerHitSfx.play();
            this.player.wasHitThisFrame = true;
            this.duckBulletRemoveQueue.push(bullet);        
            this.player.hitSprite.visible = true;
            this.player.visible = false;
            this.player.hitTimer = this.time.delayedCall(
                playerHitFameTime,
                (player) => {
                    player.visible = true;
                    player.hitSprite.visible = false;
                },
                [this.player]
            );
            if(this.player.hp == 0) {
                this.gameOver();
            }
        }
    }
    updateGameOver(delta) {
    }
    gameOver() {
        this.player.hitTimer.remove();
        this.gameOverSfx.play();
        this.currentState = states.GAME_OVER;
        this.ui.gameOver = this.add.bitmapText(canvasW / 2, canvasH / 2, "daydream_3", "Game Over!\n", 18)
            .setOrigin(0.5)
            .setBlendMode(Phaser.BlendModes.ADD);
        this.ui.returnToTile = this.add.bitmapText(canvasW / 2, canvasH / 2 + 20, "daydream_3", "Press Enter to go back to the Title Screen", 12)
            .setOrigin(0.5)
            .setBlendMode(Phaser.BlendModes.ADD);
        this.player.stop("swim");
        this.player.deadSprite.visible = true;
        this.player.deadSprite.x = this.player.x;
        this.player.deadSprite.y = this.player.y;
        this.player.visible = false;
        this.player.hitSprite.visible = false;
        this.keys.enter.on("down", (event) => {
            this.scene.start("title");
        });

    }
}