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
        this.waveController = new WaveController(this, json.get("rounds"), json.get("enemies"));

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

        document.addEventListener("waveComplete", () => {
            this.onUpgradeScreen = true;
            //Add score
            this.addScore(POINTS_PER_WAVE);

            //Pick two random upgrades
            this.upgrade1.value = Math.floor(Math.random() * Upgrades.NUM_UPGRADES);
            this.upgrade1.level = this.player.getUpgradeLevel(this.upgrade1.value) + 1;
            this.upgrade2.value = Math.floor(Math.random() * Upgrades.NUM_UPGRADES);
            while(this.upgrade2.value == this.upgrade1.value) {  
                this.upgrade2.value = Math.floor(Math.random() * Upgrades.NUM_UPGRADES);
            }
            this.upgrade2.level = this.player.getUpgradeLevel(this.upgrade2.value) + 1;
            this.registry.set("upgrade1", `${upgradeToString(this.upgrade1.value)} ${this.upgrade1.level}`);
            this.registry.set("upgrade2", `${upgradeToString(this.upgrade2.value)} ${this.upgrade2.level}`);
        });

        this.gameOver = false;

        this.startGame();

        document.addEventListener("gameOver", () => {
            if(this.nextWaveTimer) {
                this.nextWaveTimer.remove();
            }
            this.bgMusic.stop();
            this.gameOverSfx.play();
            this.gameOver = true;
        });
    }

    startGame() {
        let startGameEvent = new Event("startGame");
        document.dispatchEvent(startGameEvent);
        this.time.delayedCall(
            WAVE_TRANSITION_TIME / 2,
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
    }

    playerBulletCollisionResolution() {
        for(let duck of this.waveController.ducks) {
            if(!duck.active) continue;
            for(let bullet of this.player.bullets) {
                if (duck.hitbox == null) break;
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