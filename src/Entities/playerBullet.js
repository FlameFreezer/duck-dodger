class PlayerBullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "player", "worm.png");
        this.speed = 700;
        this.setScale(0.25);
        this.angle = 90;
        this.queueDestroy = false;
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setSize(this.width * this.scaleX / 2, this.height * this.scaleY / 2);
    }
    update(delta) {
        this.y -= this.speed * delta / 1000;
        if(this.y + this.height * this.scaleY / 2 <= 0) {
            return false;
        }
        return true;
    }
}