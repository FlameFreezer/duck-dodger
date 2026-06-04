class Gallery extends Phaser.Scene {
    constructor() {
        super("gallery");
        this.keys = {};
    }
    create() {
        let json = this.cache.json;

        //Launch UI scene
        this.ui = this.scene.launch("ui");
        this.scene.bringToTop("ui");

        initBackgroundShader(this);

        //Init inputs
        this.keys.a = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keys.d = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keys.w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keys.s = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keys.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.keys.shift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.keys.enter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        //Init player
        this.player = new Player(this, json.get("playerData"));
        for(let i = 0; i < 10; i++) {
            this.player.upgradeHoming();
        }
        for(let i = 0; i < 0; i++) {
            this.player.upgradeProjectiles();
        }
        for(let i = 0; i < 7; i++) {
            this.player.upgradeFireRate();
        }
        
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

        this.waveController = new WaveController(this, json.get("rounds"), json.get("enemies"));
        this.startGame();

        document.addEventListener("waveComplete", () => {
            let currentScore = this.registry.get('score');
            this.registry.set('score', currentScore + 100);
            this.time.delayedCall(
                WAVE_TRANSITION_TIME, 
                (self) => {
                    self.waveController.startNextWave();
                }, 
                [this]
            );
        });

        this.registry.set('score', 0);
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
    }

    playerBulletCollisionResolution() {
        for(let duck of this.waveController.ducks) {
            if(!duck.active) continue;
            for(let bullet of this.player.bullets) {
                if (duck.hitbox == null) break;
                if(Phaser.Geom.Intersects.CircleToRectangle(duck.hitbox, bullet.hitbox)) {
                    bullet.killed = true;
                    duck.hp--;
                }
            }
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