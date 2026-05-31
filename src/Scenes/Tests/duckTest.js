class DuckTest extends Phaser.Scene {
    constructor() {
        super("duckTest");
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
        let scene = this;
        const rubberDuckConfig = {
            sprite: "duck_yellow.png",
            pathFollower: new Path("arc", 100, 100, 0.25, 3000),
            spawnTween: new SpawnTween(0, 0, 300, 300, 700),
            attacker: new Attacker(scene, {
                shootDelay: 250,
                patternDelay: 2000,
                type: "t-pattern"
            }),
            hp: 5,
            points: 15
        };
        this.duck = new Duck(this, rubberDuckConfig);
    }
    update(time, delta) {
        this.duck.update(delta);
    }
}