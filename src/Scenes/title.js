class Title extends Phaser.Scene {
    constructor() {
        super("title");
        this.keys = {
            enter: null
        };
    }
    preload() {
    }
    create() {
        this.keys.enter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.text = this.add.bitmapText(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, "04b_30", "Press enter to play", 24)
            .setOrigin(0.5)
            .setBlendMode(Phaser.BlendModes.ADD);

        this.creditTxt = this.add.bitmapText(CANVAS_WIDTH / 2, CANVAS_HEIGHT - CANVAS_HEIGHT / 32, "04b_30", "By Quincy Hurst and Iain Rogers", 14)
            .setOrigin(0.5)
            .setBlendMode(Phaser.BlendModes.ADD);

        this.titleTxt = this.add.bitmapText(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 8, "04b_30", "Duck Dodger", 64)
            .setOrigin(0.5)
            .setBlendMode(Phaser.BlendModes.ADD);

        this.subtitleTxt = this.add.bitmapText(this.titleTxt.x, this.titleTxt.y + 45, "04b_30", "Reducks", 32)
            .setOrigin(0.5)
            .setBlendMode(Phaser.BlendModes.ADD);

        //Text flashing: outer event shows text, inner event hides text
        this.textFlashTimer = this.time.addEvent({
            delay: 1500,
            loop: true,
            callback: (self, txt) => {
                txt.visible = false;
                self.time.addEvent({
                    delay: 500,
                    callback: (txt) => {
                        txt.visible = true;
                    } ,
                    args: [txt]
                });
            },
            args: [this, this.text]
        });
        this.keys.enter.on("down", (event) => {

            this.scene.launch("ui");
            this.scene.start("gallery");
        });
    }
    update(time, delta) {
    }
}