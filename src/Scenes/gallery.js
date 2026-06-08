function upgradeToString(upgrade) {
    switch(upgrade) {
        case Upgrades.PROJECTILES: return "Projectiles";
        case Upgrades.FIRE_RATE: return "Fire Rate";
        case Upgrades.HOMING: return "Homing";
        default: throw `Invalid upgrade number \"${upgrade}\" passed to \"upgradeToString\"`; //should never happen
    }
}

class Gallery extends Phaser.Scene {
    constructor() {
        super("gallery");
        this.keys = {};
    }
    create() {
        let json = this.cache.json;

        this.scene.bringToTop("ui");

        initBackgroundShader(this);

        //Init inputs
        this.keys.a = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keys.d = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keys.w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keys.s = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keys.z = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        this.keys.x = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
        this.keys.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.keys.shift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.keys.enter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        //Init player
        this.player = new Player(this, json.get("playerData"));

        //Set upgrades for testing
        for(let i = 0; i < 0; i++) {
            this.player.upgradeHoming();
        }
        for(let i = 0; i < 0; i++) {
            this.player.upgradeProjectiles();
        }
        for(let i = 0; i < 0; i++) {
            this.player.upgradeFireRate();
        }

        //Initialize score variables
        this.score = 0;
        this.lastHpMilestone = 0;
        this.registry.set('score', this.score);
        
        //Init bubble background
        this.bubbles = [];
        this.bubbleRemoveQueue = [];
        //bubble spawner
        this.bubbleTimer = this.time.addEvent({
            delay: BUBBLE_RATE,
            loop: true,
            callback: (self) => {
                self.makeBackgroundBubble(Math.random() * CANVAS_WIDTH, -50);
            },
            args: [this]
        });
        //Create initial swarm of bubbles
        let interval = BUBBLE_RATE * BUBBLE_SCROLL_SPEED / 1000;
        for(let i = 0; i < CANVAS_HEIGHT / interval; i++) {
            this.makeBackgroundBubble(Math.random() * CANVAS_WIDTH, i * interval);
        }

        //Init wave controller
        this.waveController = new WaveController(this, json.get("rounds"), json.get("enemies"), json.get("challengeRounds"));

        //Init sounds
        this.duckHitSfx = this.sound.add("duckHit", {
            volume: 0.5
        });
        this.duckDeathSfx = this.sound.add("duckDeath", {
            volume: 0.5
        });
        this.healthUpSfx = this.sound.add("healthUp", {
            volume: 0.5
        });
        this.gameOverSfx = this.sound.add("gameOver", {
            volume: 0.5
        });
        this.breadSfx = this.sound.add("breadGot", {
            volume: 0.5
        });
        this.playerHitSfx = this.sound.add("playerHit", {
            volume : 0.75
        });
        this.bgMusic = this.sound.add("bgMusic", {
            volume: 0.25,
            loop: true
        });
        this.bulletRingSfx = this.sound.add("bulletRing", {
            volume: 0.5
        });
        this.tPatternSfx = this.sound.add("bulletTPattern", {
            volume: 0.5
        });
        this.wallSfx = this.sound.add("wallPattern", {
            volume: 3
        });
        this.bgMusic.play();

        this.nextWaveTimer = null;

        this.upgrade1 = {
            value: 0,
            level: 0
        };
        this.upgrade2 = {
            value: 0,
            level: 0
        };

        this.registry.set("upgrade1", "");
        this.registry.set("upgrade2", "");

        this.onUpgradeScreen = false;
        let waveStartEvent = new Event("waveStart");
        //Pick upgrade 1
        this.keys.z.on("down", (event) => {
            if(this.onUpgradeScreen) {
                this.onUpgradeScreen = false;
                this.player.applyUpgrade(this.upgrade1.value);
                this.time.delayedCall(WAVE_TRANSITION_TIME, (self) => {
                    self.waveController.startNextWave();
                }, [this]);
                document.dispatchEvent(waveStartEvent);
            }
        });
        //Pick upgrade 1
        this.keys.x.on("down", (event) => {
            if(this.onUpgradeScreen) {
                this.onUpgradeScreen = false;
                this.player.applyUpgrade(this.upgrade2.value);
                this.time.delayedCall(WAVE_TRANSITION_TIME, (self) => {
                    self.waveController.startNextWave();
                }, [this]);
                document.dispatchEvent(waveStartEvent);
            }
        });

        //Wave complete: add score and provide upgrades
        document.addEventListener("waveComplete", () => {
            //Do nothing if the game is over
            if(this.gameOver) return;

            //Add score
            this.addScore(POINTS_PER_WAVE);

            //Only get an upgrade every other wave
            let waveNumber = this.registry.get("waveNumber");
            if(waveNumber % 2 != 0) {
                //Timer to dispatch the wave start
                this.time.delayedCall(
                    WAVE_TRANSITION_TIME,
                    (self) => {
                        document.dispatchEvent(waveStartEvent);
                    },
                    [this]
                );
                //Timer to start the next wave
                this.time.delayedCall(
                    WAVE_TRANSITION_TIME * 2,
                    (self) => {
                        self.waveController.startNextWave();;
                    },
                    [this]
                );
            }
            else {
                this.onUpgradeScreen = true;
                //Pick two random upgrades
                this.upgrade1.value = Math.floor(Math.random() * Upgrades.NUM_UPGRADES);
                this.upgrade1.level = this.player.getUpgradeLevel(this.upgrade1.value) + 1;

                this.upgrade2.value = Math.floor(Math.random() * Upgrades.NUM_UPGRADES);
                //Ensure upgrade 2 is not the same as upgrade 1 so player always has a choice
                while(this.upgrade2.value == this.upgrade1.value) {  
                    this.upgrade2.value = Math.floor(Math.random() * Upgrades.NUM_UPGRADES);
                }
                this.upgrade2.level = this.player.getUpgradeLevel(this.upgrade2.value) + 1;
                this.registry.set("upgrade1", `${upgradeToString(this.upgrade1.value)} ${this.upgrade1.level}`);
                this.registry.set("upgrade2", `${upgradeToString(this.upgrade2.value)} ${this.upgrade2.level}`);
            }
        });

        this.gameOver = false;

        this.tutorialStage = 0;
        this.tutorialTime = 0;
        this.finishedTutorial = false;
        this.registry.set("tutorialStage", this.tutorialStage);

        document.addEventListener("gameOver", () => {
            if(this.nextWaveTimer) {
                this.nextWaveTimer.remove();
            }
            this.bgMusic.stop();
            this.gameOverSfx.play();
            this.gameOver = true;
        });

        this.w = this.add.image(0, 0, "w");
        this.w.setScale(0.5);
        this.a = this.add.image(0, 0, "a");
        this.a.setScale(0.5);
        this.s = this.add.image(0, 0, "s");
        this.s.setScale(0.5);
        this.d = this.add.image(0, 0, "d");
        this.d.setScale(0.5);
    }

    startGame() {
        let startGameEvent = new Event("startGame");
        document.dispatchEvent(startGameEvent);
        this.time.delayedCall(
            WAVE_TRANSITION_TIME,
            (self) => {
                self.waveController.startNextWave();
            },
            [this]
        );
    }

    update(time, delta) {
        this.waveController.update(delta);

        this.player.update(delta);

        this.updateBubbles(delta);

        this.playerBulletCollisionResolution();

        this.flushRemoveQueues();

        if(this.keys.enter.isDown && this.gameOver) {
            this.scene.stop("ui");
            this.scene.start("title");
        }
        if(!this.finishedTutorial) {
            this.updateTutorial(delta);
        } 
    }

    updateTutorial(delta) {
        const bulletVelocity = {
            x: 0, y: 400
        };
        //Hit enter to skip the tutorial
        if(this.keys.enter.isDown) {
            //sets to final stage, which just starts the game and sets finishedTutorial to true
            this.tutorialStage = 5;
            this.registry.set("tutorialStage", this.tutorialStage);
            //Destroy any lingering duck bullets
            if(this.tutorialDucks && this.tutorialDucks.length > 0) {
                for(let bullet of this.tutorialDucks) {
                    bullet.destroyChildren();
                    bullet.destroy();
                }
                this.tutorialDucks = [];
            }
            //Destroy input prompts
            this.w.destroy();
            this.a.destroy();
            this.s.destroy();
            this.d.destroy();

        }
        switch(this.tutorialStage) {
            //Movement tutorial
            case 0: {
                if(this.tutorialTime >= TUTORIAL_INTRO_PHASE_TIME) {
                    this.tutorialStage++;
                    this.registry.set("tutorialStage", this.tutorialStage);
                    this.w.destroy();
                    this.a.destroy();
                    this.s.destroy();
                    this.d.destroy();
                    break;
                }
                const OFFSET = 30;
                this.w.setPosition(this.player.x, this.player.y - OFFSET);
                this.a.setPosition(this.player.x - OFFSET, this.player.y);
                this.s.setPosition(this.player.x, this.player.y + OFFSET);
                this.d.setPosition(this.player.x + OFFSET, this.player.y);

                this.tutorialTime += delta;
                break;
            }
            //Color change 1: green
            case 1: {
                if(this.keys.space.isDown) {
                    this.tutorialStage++;
                    this.registry.set("tutorialStage", this.tutorialStage);
                    this.tutorialDucks = [];
                    for(let i = 0; i < CANVAS_WIDTH; i += CANVAS_WIDTH / 32) {
                        this.tutorialDucks.push(new DuckBullet(this, i, -25, Colors.GREEN));
                    }
                }
                break;
            }
            //Update duck wall
            case 2: {
                if(this.tutorialDucks.length == 0) {
                    this.tutorialStage++;
                    this.registry.set("tutorialStage", this.tutorialStage);
                    break;
                }
                let destroyQueue = [];
                for(let bullet of this.tutorialDucks) {
                    bullet.modifyPos(vecScale(bulletVelocity, delta / 1000));
                    bullet.doCollisionCheck();
                    if(bullet.y - bullet.displayHeight >= CANVAS_HEIGHT) {
                        destroyQueue.push(bullet);
                    }
                }
                for(let bullet of destroyQueue) {
                    this.tutorialDucks = this.tutorialDucks.filter((bullet) => {
                        if(!destroyQueue.includes(bullet)) return bullet;
                    });
                    bullet.destroyChildren();
                    bullet.destroy();
                }
                break;
            }
            //Color change 2: yellow
            case 3: {
                if(this.keys.space.isDown) {
                    this.tutorialStage++;
                    this.registry.set("tutorialStage", this.tutorialStage);
                    this.tutorialDucks = [];
                    for(let i = 0; i < CANVAS_WIDTH; i += CANVAS_WIDTH / 32) {
                        this.tutorialDucks.push(new DuckBullet(this, i, -25, Colors.YELLOW));
                    }
                }
                break;
            }
            //Update duck wall
            case 4: {
                if(this.tutorialDucks.length == 0) {
                    this.tutorialStage++;
                    this.registry.set("tutorialStage", this.tutorialStage);
                    break;
                }
                let destroyQueue = [];
                for(let bullet of this.tutorialDucks) {
                    bullet.modifyPos(vecScale(bulletVelocity, delta / 1000));
                    bullet.doCollisionCheck();
                    if(bullet.y - bullet.displayHeight >= CANVAS_HEIGHT) {
                        destroyQueue.push(bullet);
                    }
                }
                for(let bullet of destroyQueue) {
                    this.tutorialDucks = this.tutorialDucks.filter((bullet) => {
                        if(!destroyQueue.includes(bullet)) return bullet;
                    });
                    bullet.destroyChildren();
                    bullet.destroy();
                }
                break;
            }
            //Start game
            case 5: {
                this.startGame();
                this.finishedTutorial = true;
            }
        }
    }

    playerBulletCollisionResolution() {
        for(let duck of this.waveController.ducks) {
            if(!duck.active) continue;
            for(let bullet of this.player.bullets) {
                if (duck.hitbox == null) break;
                if (!duck.hittable) break;
                if(Phaser.Geom.Intersects.CircleToRectangle(duck.hitbox, bullet.hitbox)) {
                    bullet.killed = true;
                    duck.onHit();
                }
            }
        }
    }

    addScore(amount) {
        this.score += amount;
        this.registry.set('score', this.score);

        if(this.score - this.lastHpMilestone >= HEALTH_UP_INTERVAL) {
            this.lastHpMilestone = this.lastHpMilestone + HEALTH_UP_INTERVAL;
            this.player.addHP(1);
            this.healthUpSfx.play();
            let healthUpEvent = new Event("healthUp");
            document.dispatchEvent(healthUpEvent);
        }
    }

    flushRemoveQueues() {
        if(this.bubbleRemoveQueue.length > 0) {
            this.flushBubbleRemoveQueue();
        }
    }

    flushBubbleRemoveQueue() {
        for(let bubble of this.bubbleRemoveQueue) {
            bubble.destroy();
        }
        this.bubbles = this.bubbles.filter((bubble) => {
            if(!this.bubbleRemoveQueue.includes(bubble)) return bubble;
        });
        this.bubbleRemoveQueue = [];
    }

    updateBubbles(delta) {
        for(let bubble of this.bubbles) {
            bubble.y += BUBBLE_SCROLL_SPEED * delta / 1000;
            if(bubble.y - bubble.height * bubble.scaleY / 2 >= CANVAS_HEIGHT) {
                this.bubbleRemoveQueue.push(bubble);
            }
        }
    }

    makeBackgroundBubble(x, y) {
        let bubble = this.add.image(x, y, "bubble");
        bubble.setScale(Math.random() * (BUBBLE_SIZE_RANGE.MAX - BUBBLE_SIZE_RANGE.MIN) + BUBBLE_SIZE_RANGE.MIN);
        bubble.alpha = 0.25;
        this.children.sendToBack(bubble);
        this.bubbles.push(bubble);
    }
}