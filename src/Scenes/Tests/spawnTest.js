class SpawnTest extends Phaser.Scene {
    constructor() {
        super("spawnTest")
    }

    preload() {
        //Load sprites
        this.load.setPath("./assets/spritesheets/");
        //Load in player sprite
        this.load.atlasXML("player", "enemies.png", "enemies.xml");
        //Load in duck sprites
        this.load.atlasXML("ducks", "spritesheet_objects.png", "spritesheet_objects.xml");
    }

    create() {
        this.testDuck = this.add.sprite(200, 500, "ducks", 0);
        this.testDuck.spawnTween = new SpawnTween(this.testDuck, 450, 100, 150, 600, 1500, 0.6, () => {this.testDuck.pathFollower.activate(this.testDuck.x, this.testDuck.y);});
    }

    update(time, delta) {
        this.testDuck.spawnTween.update(delta);
    }
}