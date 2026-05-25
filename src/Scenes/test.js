class TestScene extends Phaser.Scene {
    constructor() {
        super("test")
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
        this.testDuck.pathFollower = new Path("figure_infinite", 400, 300, 0, 4000);
    }

    update(time, delta) {
        if (time > 3000 && time < 6000 && !this.testDuck.pathFollower.active) {
            this.testDuck.pathFollower.activate(this.testDuck.x, this.testDuck.y);
        }
        if (this.testDuck.pathFollower.active) {
            let pos = this.testDuck.pathFollower.getCoords(delta);
            this.testDuck.setPosition(pos.x, pos.y);
        }

        if (time > 9000 && time < 11000 &&  this.testDuck.pathFollower.active) {
            this.testDuck.pathFollower.deactivate();
        }

        if (time > 12000 && !this.testDuck.pathFollower.active) {
            this.testDuck.pathFollower.activate(this.testDuck.x, this.testDuck.y);
        }
    }
}