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
        this.testBullet = new duckBullet(this, 100, 50, this.colors.YELLOW, () => {}, true);
        this.bulletY = 50;
    }

    update(time, delta) {
        this.bulletY += delta * 0.2;
        if (this.testBullet) this.testBullet.moveTo(this.testBullet.x, this.bulletY);
        if (this.bulletY > 700) this.testBullet.kill();
    }
}