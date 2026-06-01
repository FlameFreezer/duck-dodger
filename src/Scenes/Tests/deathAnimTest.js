class DeathAnimTest extends Phaser.Scene {
    constructor() {
        super("deathAnimTest")
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
        this.ducks = [];
        this.ducks.push(new Duck(this, {
            sprite: "duck_yellow.png",
            pathFollower: new Path("arc", 150, 50, 0.25, 4000),
            spawnTween: new SpawnTween(300, 0, 300, 250, 1000),
            deathAnim: new DeathAnimator(),
            hp: 5,
            points: 15
        }));

    }

    update(time, delta) {
        this.ducks[0].update(delta);
        if (time > 3000) this.ducks[0].kill();
    }
}