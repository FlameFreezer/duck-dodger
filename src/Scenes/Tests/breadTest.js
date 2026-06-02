class BreadTest extends Phaser.Scene {
    constructor() {
        super("breadTest");
    }
    preload() {
        //Load sprites
        this.load.setPath("./assets/Images/");
        //Load in player sprite
        this.load.image("bread", "bread.png");
    }
    create() {
        const breadConfig = {
            pathFollower: new Path("figure_infinite", 500, 200, 0.25, 3000, true),
            spawnTween: new SpawnTween(300, 0, 300, 150, 1000, 0.5),
            hp: 10,
            points: 10
        }
        this.bread = new Bread(this, breadConfig);
    }
    update(time, delta) {
        this.bread.update(delta);
        if (time > 6000) this.bread.flee();
    }
}