class UI extends Phaser.Scene {
    constructor() {
        super("ui");
    }
    preload() {

    }
    create() {
        //Heart display
        this.heart = this.add.sprite(CANVAS_WIDTH - CANVAS_WIDTH / 8 - 32, CANVAS_HEIGHT / 16 + 70, "hearts", "hud_heart");
        this.heart.setScale(0.85);
    }
    update(time, delta) {
    }
}