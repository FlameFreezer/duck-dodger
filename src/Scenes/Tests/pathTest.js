class PathTest extends Phaser.Scene {
    constructor() {
        super("pathTest")
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
        this.testDuck = this.add.sprite(300, 500, "ducks", 0);
        this.testDuck.pathFollower = new Path(this.testDuck, "figure_infinite", 400, -300, 0, 4000);
        this.testDuck.pathFollower.activate(this.testDuck.x, this.testDuck.y, 0.25);
    }

    update(time, delta) {
        this.testDuck.pathFollower.update(delta);
    }
}