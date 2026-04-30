class PlayerBullet extends Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "player", "worm.png");
        this.speed = 700;
        this.setScale(0.25);
        this.angle = 90;
        scene.add.existing(this);
    }
    update(delta) {
        this.y -= this.speed * delta / 1000;
        if(this.y + this.height * this.scaleY / 2 <= 0) this.destroy();
    }
}