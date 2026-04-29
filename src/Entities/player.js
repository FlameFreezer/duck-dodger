class Player extends Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "player", "fishPink.png");
        this.fastSpeed = 200;
        this.slowSpeed = 100;
        this.speed = this.fastSpeed;
        this.setScale(0.5);
        this.angle = 90;
        this.shootDelay = 100;
        this.timeSinceShoot = this.shootDelay;
        scene.add.existing(this);
    }
    shootBullet(scene) {
        scene.bullets.push(new PlayerBullet(scene, this.x, this.y - 25));
        this.timeSinceShoot = 0;
    }
}