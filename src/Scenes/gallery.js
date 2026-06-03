class Gallery extends Phaser.Scene {
    constructor() {
        super("gallery");
        this.keys = {};
    }
    create() {
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
        this.player = new Player(this, this.cache.json.get("playerData"));
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
        const bubbleSizes = [0.35, 0.45, 0.75];
        this.bubbleTimer = this.time.addEvent({
            delay: BUBBLE_RATE,
            loop: true,
            callback: (self) => {
                self.makeBackgroundBubble(Math.random() * canvasW, -50);
            },
            args: [this]
        });
        for(let i = 0; i < canvasH / 200; i++) {
            this.makeBackgroundBubble(Math.random() * canvasW, i * 200);
        }

    }
    update(time, delta) {
        this.player.update(delta);

        for(let bubble of this.bubbles) {
            bubble.y += 100 * delta / 1000;
            if(bubble.y - bubble.height * bubble.scaleY / 2 >= canvasH) {
                this.bubbleRemoveQueue.push(bubble);
            }
        }
        this.flushRemoveQueues();
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
    makeBackgroundBubble(x, y) {
        let bubble = this.add.image(x, y, "bubble");
        bubble.setScale(Math.random() * (BUBBLE_SIZE_RANGE.MAX - BUBBLE_SIZE_RANGE.MIN) + BUBBLE_SIZE_RANGE.MIN);
        bubble.alpha = 0.55;
        this.children.sendToBack(bubble);
        this.bubbles.push(bubble);
    }
}