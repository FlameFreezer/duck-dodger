class PlayerBullet extends Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "player", "worm.png");
        this.speed = 700;
        this.setScale(0.25);
        this.angle = 90;
        scene.add.existing(this);
    }
}