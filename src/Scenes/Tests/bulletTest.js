class BulletTest extends Phaser.Scene {
    constructor() {
        super("bulletTest")
    }

    preload() {
        this.colors = {YELLOW: 0, GREEN: 1, GRAY: 2};
        //Load sprites
        this.load.setPath("./assets/spritesheets/");
        //Load in player sprite
        this.load.atlasXML("player", "enemies.png", "enemies.xml");
        //Load in duck sprites
        this.load.atlasXML("ducks", "spritesheet_objects.png", "spritesheet_objects.xml");
    }

    create() {
        this.testBullet = new DuckBullet(this, 100, 50, this.colors.YELLOW, () => {});
        this.testBullet2 = new DuckBullet(this, 300, 50, this.colors.YELLOW, () => {});
        this.bulletY = 50;
    }

    update(time, delta) {
        this.bulletY += delta * 0.2;
        if (this.testBullet) this.testBullet.moveTo({x: this.testBullet.x, y: this.bulletY});
        if (this.testBullet && this.bulletY > 700) {
            this.testBullet.kill();
            this.testBullet = null;
        }

        if (this.testBullet2) this.testBullet2.modifyPosition({x: 0, y: delta * 0.2});
        if (this.testBullet2 && this.testBullet2.y > 700) {
            this.testBullet2.kill();
            this.testBullet2 = null;
        }
    }
}