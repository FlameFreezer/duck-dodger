const canvasW = 600;
const canvasH = 800;
const healthUpInterval = 500;
const heartGrowMaximum = 1.2;
const heartGrowTime = 200;
const bubbleRate = 1500;
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
        //Load heart
        this.load.atlasXML("hearts", "spritesheet-tiles-default.png", "spritesheet-tiles-default.xml");
        //Load player data
        this.load.setPath("./config");
        this.load.json("playerData", "player.json");
        this.load.json("duckData", "ducks.json");
        this.load.json("waveData", "waves.json");
        this.load.json("challengeWaveData", "challengeWaves.json");
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
        this.load.audio("bgMusic", "Dagored - Lifestyle Groove (freetouse.com).mp3");
        //Load images
        this.load.setPath("./assets/Images");
        this.load.image("bread", "bread.png");
        this.load.image("breadHit", "breadHit.png");
        this.load.image("a", "keyboard_a.png");
        this.load.image("d", "keyboard_d.png");
        this.load.image("w", "keyboard_w.png");
        this.load.image("space", "keyboard_space.png");
        this.load.image("bubble", "bubble.png");
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

        this.heart = this.add.sprite(canvasW - canvasW / 8 - 32, canvasH / 16 + 70, "hearts", "hud_heart");
        this.heart.setScale(0.85);
        this.heart.maxSize = this.heart.scaleX * heartGrowMaximum;

        this.player = new Player(this, this.cache.json.get("playerData"));
        this.score = 0;
        this.ui = {};
        this.ui.score = this.add.bitmapText(canvasW - canvasW / 8, canvasH / 16, "daydream_3", "Score: 0", 18)
            .setOrigin(0.5)
            .setBlendMode(Phaser.BlendModes.ADD);
        this.ui.waveCounter = this.add.bitmapText(canvasW - canvasW / 8, canvasH / 16 + 32, "daydream_3", "Wave 0", 18)
            .setOrigin(0.5)
            .setBlendMode(Phaser.BlendModes.ADD);
        this.ui.waveComplete = this.add.bitmapText(canvasW / 2, canvasH / 2, "daydream_3", "Wave Complete!", 24)
            .setOrigin(0.5)
            .setBlendMode(Phaser.BlendModes.ADD);
        this.ui.waveNumber = this.add.bitmapText(canvasW / 2, canvasH / 2, "daydream_3", "Wave 0", 24)
            .setOrigin(0.5)
            .setBlendMode(Phaser.BlendModes.ADD);
        this.ui.hp = this.add.bitmapText(canvasW - canvasW / 8 + 12, canvasH / 16 + 72, "daydream_3", "x0", 18)
            .setOrigin(0.5)
            .setBlendMode(Phaser.BlendModes.ADD);
        this.ui.colorTutorial = this.add.bitmapText(canvasW / 2, canvasH / 2, "daydream_3", "Change color to phase through projectiles", 18)
            .setOrigin(0.5)
            .setBlendMode(Phaser.BlendModes.ADD);
        
        this.ui.waveComplete.visible = false;
        this.ui.waveNumber.visible = false;
        this.ui.colorTutorial.visible = false;
        this.waves = [];
        this.challengeWaves = [];
        this.bullets = this.add.group({
            classType: Phaser.GameObjects.Sprite,
            active: true,
            maxSize: -1
        });
        for(let waveData of this.cache.json.get("waveData")) {
            waveData.duckData = this.cache.json.get("duckData");
            this.waves.push(new Wave(this, waveData));
        }
        for(let challengeWaveData of this.cache.json.get("challengeWaveData")) {
            challengeWaveData.duckData = this.cache.json.get("duckData");
            this.challengeWaves.push(new Wave(this, challengeWaveData));
        }
        this.keys.a = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keys.d = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keys.w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keys.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.keys.shift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.keys.enter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        this.currentState = states.GAME_INITIAL;
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
        this.finishedTutorial = false;
        this.duckBulletRemoveQueue = [];
        this.bubbles = this.add.group({
            classType: Phaser.GameObjects.Image,
            active: true,
            maxSize: -1
        });
        this.bubbleRemoveQueue = [];
        const bubbleSizes = [0.35, 0.45, 0.75];
        this.bubbleTimer = this.time.addEvent({
            delay: bubbleRate,
            loop: true,
            callback: (self) => {
                let bubble = self.add.image(Math.random() * canvasW, -50, "bubble");
                bubble.setScale(bubbleSizes[Math.floor(Math.random() * bubbleSizes.length)]);
                bubble.alpha = 0.55;
                self.children.sendToBack(bubble);
                self.bubbles.add(bubble);
            },
            args: [this]
        });
        for(let i = 0; i < canvasH / 200; i++) {
            let bubble = this.add.image(Math.random() * canvasW, i * 200, "bubble");
            bubble.setScale(bubbleSizes[Math.floor(Math.random() * bubbleSizes.length)]);
            bubble.alpha = 0.55;
            this.children.sendToBack(bubble);
            this.bubbles.add(bubble);
        }

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
            volume : 0.5
        });
        this.bgMusic = this.sound.add("bgMusic", {
            volume: 0.25,
            loop: true
        });
        this.bgMusic.play();
        this.startTutorial();
    }
    startTutorial() {
        this.keys.enter.on("down", (event) => {
            if(this.tutorialTimeline) {
                this.tutorialTimeline.stop();
            }
            for(let input in this.inputPrompts) {
                this.inputPrompts[input].image.destroy();
            }
            this.ui.colorTutorial.visible = false;
            if(!this.finishedTutorial) {
                this.finishedTutorial = true;
                this.nextWave();
            }
        });
        this.inputPrompts = {};
        this.inputPrompts.d = {};
        this.inputPrompts.d.image = this.add.image(this.player.x + 35, this.player.y, "d").setScale(0.5);
        this.inputPrompts.d.offsetX = 35;
        this.inputPrompts.d.offsetY = 0;
        this.inputPrompts.a = {};
        this.inputPrompts.a.image = this.add.sprite(this.player.x - 35, this.player.y, "a").setScale(0.5);
        this.inputPrompts.a.offsetX = -35;
        this.inputPrompts.a.offsetY = 0;
        this.tutorialTimeline = this.add.timeline([
            {
                at: 3000,
                run() {
                    this.inputPrompts.a.image.destroy();
                    this.inputPrompts.d.image.destroy();
                    delete this.inputPrompts.a;
                    delete this.inputPrompts.d;

                    this.inputPrompts.w = {};
                    this.inputPrompts.w.image = this.add.image(this.player.x, this.player.y - 35, "w").setScale(0.5);
                    this.inputPrompts.w.offsetX = 0;
                    this.inputPrompts.w.offsetY = -35;
                    this.ui.colorTutorial.visible = true;
                },
                target: this
            },
            {
                at: 3000 + 1250,
                run() {
                    let bullet = new EnemyBullet(this, 0, this.player.y, "duck_brown.png", {x: 1, y: 0});
                    this.duckBullets.add(bullet);
                },
                target: this
            },
            {
                at: 3000 + 1250 + 2000,
                run() {
                    let bullet = new EnemyBullet(this, 0, this.player.y, "duck_yellow.png", {x: 1, y: 0});
                    this.duckBullets.add(bullet);
                },
                target: this
            },
            {
                at: 3000 + 1250 + 2000 + 2000,
                run() {
                    this.ui.colorTutorial.visible = false;
                    this.inputPrompts.w.image.destroy();
                    delete this.inputPrompts.w;

                    this.inputPrompts.space = {};
                    this.inputPrompts.space.image = this.add.image(this.player.x, this.player.y + 35, "space").setScale(0.75);
                    this.inputPrompts.space.offsetX = 0;
                    this.inputPrompts.space.offsetY = 35;
                },
                target: this
            },
            {
                at: 3000 + 1250 + 2000 + 2000 + 1500,
                run() {
                    this.inputPrompts.space.image.destroy();
                    delete this.inputPrompts.space;

                    this.finishedTutorial = true;
                    this.nextWave();

                },
                target: this
            }
        ]);
        this.tutorialTimeline.play();
    }
    updateTutorial(delta) {
        for(let image in this.inputPrompts) {
            let img = this.inputPrompts[image];
            img.image.x = this.player.x + img.offsetX;
            img.image.y = this.player.y + img.offsetY;
        }
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
        //Otherwise, pick a random wave from the challenge waves
        else {
            this.currentWave = this.challengeWaves[Math.floor(Math.random() * this.challengeWaves.length)];
            this.currentWave.isOver = false;
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

        for(let bubble of this.bubbleRemoveQueue) {
            this.bubbles.remove(bubble);
            bubble.destroy();
        }
    }
    update(time, delta) {
        this.player.update(delta);
        this.ui.score.setText(`Score ${this.score}`);
        this.ui.hp.setText(`x${this.player.hp}`);
        this.ui.waveCounter.setText(`Wave ${this.waveNumber}`);
        let bullets = this.bullets.getChildren();
        for(let bullet of bullets) {
            if(!bullet.update(delta)) {
                this.bullets.remove(bullet);
                bullet.destroy();
            }
        }
        if(this.currentState != states.GAME_OVER) {
            let bubbles = this.bubbles.getChildren();
            for(let bubble of bubbles) {
                bubble.y += 100 * delta / 1000;
                if(bubble.y - bubble.height * bubble.scaleY / 2 >= canvasH) {
                    this.bubbleRemoveQueue.push(bubble);
                }
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
            case states.GAME_INITIAL:
                this.updateTutorial(delta);
                break;
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
        this.updateHeart(delta);

        this.flushRemoveQueues();
    }
    addScore(score) {
        this.score += score;
        if(this.score - this.lastHpMilestone >= healthUpInterval) {
            this.player.hp += 1;
            this.lastHpMilestone = this.score - (this.score - this.lastHpMilestone - healthUpInterval);
            if(!this.breadSfx.isPlaying) {
                this.healthUpSfx.play();
            }
            this.heart.doGrow = true;
            this.time.delayedCall(
                heartGrowTime,
                (self) => {
                    self.heart.doShrink = true;
                    self.heart.doGrow = false;
                    self.time.delayedCall(
                        heartGrowTime,
                        (self) => {
                            self.heart.doShrink = false;
                        },
                        [self]
                    );
                },
                [this]
            );
        }
    }
    updateHeart(delta) {
        if(this.heart.doGrow) {
            this.heart.scaleX += (this.heart.maxSize - 0.85) * delta / heartGrowTime;
            this.heart.scaleY += (this.heart.maxSize - 0.85) * delta / heartGrowTime;
        } 
        else if(this.heart.doShrink) {
            this.heart.scaleX -= (this.heart.maxSize - 0.85) * delta / heartGrowTime;
            this.heart.scaleY -= (this.heart.maxSize - 0.85) * delta / heartGrowTime;
        }
    }
    doWaveTransition() {
        this.currentState = states.WAVE_TRANSITION;
        this.ui.waveComplete.visible = true;
        this.addScore(100);
        this.waveTransitionTimer = this.time.addEvent({
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
        if(this.currentWave.isOver && this.currentState != states.GAME_OVER) {
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
                            if(!this.healthUpSfx.isPlaying) {
                                this.breadSfx.play();
                            }
                        }
                        else {
                            this.duckDeathSfx.play();
                        }
                    }
                }
            });
        }
    }
    doPlayerCollision(bullet) {
        if(bullet.collisionCheck(this.player) && !this.player.isInvulnerable) {
            this.player.hp -= 1;
            this.playerHitSfx.play();
            this.player.isInvulnerable = true;
            this.duckBulletRemoveQueue.push(bullet);        
            this.player.hitSprite.visible = true;
            this.player.visible = false;
            this.player.hitTimer = this.time.delayedCall(
                playerHitFameTime,
                (player) => {
                    player.visible = true;
                    player.hitSprite.visible = false;
                    player.isInvulnerable = false;
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
        if(this.waveTransitionTimer) this.waveTransitionTimer.remove();
        this.gameOverSfx.play();
        this.currentState = states.GAME_OVER;
        this.ui.gameOver = this.add.bitmapText(canvasW / 2, canvasH / 2, "daydream_3", "Game Over!\n", 18)
            .setOrigin(0.5)
            .setBlendMode(Phaser.BlendModes.ADD);
        this.ui.returnToTile = this.add.bitmapText(canvasW / 2, canvasH / 2 + 20, "daydream_3", "Press Enter to go back to the Title Screen", 12)
            .setOrigin(0.5)
            .setBlendMode(Phaser.BlendModes.ADD);
        this.ui.waveComplete.visible = false;
        this.player.stop("swim");
        this.player.deadSprite.visible = true;
        this.player.deadSprite.x = this.player.x;
        this.player.deadSprite.y = this.player.y;
        this.player.visible = false;
        this.player.hitSprite.visible = false;
        this.keys.enter.on("down", (event) => {
            this.scene.start("title");
        });
        this.bgMusic.stop();
    }
}