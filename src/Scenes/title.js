class Title extends Phaser.Scene {
    constructor() {
        super("title");
        this.keys = {
            enter: null
        };
    }
    preload() {
        this.load.setPath("assets/daydream_3");
        this.load.bitmapFont("daydream_3", "daydream_3_0.png", "daydream_3.fnt");
    }
    create() {
        this.keys.enter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.text = this.add.bitmapText(canvasW / 2, canvasH / 2, "daydream_3", "press enter to play", 24)
            .setOrigin(0.5)
            .setBlendMode(Phaser.BlendModes.ADD);

        this.creditTxt = this.add.bitmapText(canvasW - canvasW / 7, canvasH - canvasH / 32, "daydream_3", "By Quincy Hurst", 14)
            .setOrigin(0.5)
            .setBlendMode(Phaser.BlendModes.ADD);

        this.titleTxt = this.add.bitmapText(canvasW / 2, canvasH / 8, "daydream_3", "DUCK DODGER", 64)
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
            this.scene.start("gallery");
        });
    }
    update(time, delta) {
    }
}