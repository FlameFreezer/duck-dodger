class PlayerBullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "player", "worm.png");
        this.speed = 700;
        this.setScale(0.25);
        this.angle = 90;
        this.queueDestroy = false;
        scene.add.existing(this);
    }
    update(delta) {
        this.y -= this.speed * delta / 1000;
        if(this.y + this.width * this.scaleX / 2 <= 0) {
            return false;
        }
        return true;
    }
    collisionCheck(duck) {
        let scaleX = abs(this.scaleX);
        let scaleY = abs(this.scaleY);
        let duckScaleX = abs(duck.scaleX);
        let duckScaleY = abs(duck.scaleY);
        let xWithin = this.x + scaleY * this.height / 2 > duck.x - duckScaleX * duck.width / 2
            && this.x - scaleY * this.height / 2 < duck.x + duckScaleX * duck.width / 2;
        let yWithin = this.y + scaleX * this.width / 2 > duck.y - duckScaleY * duck.height / 2
            && this.y - scaleX * this.width / 2 < duck.y + duckScaleY * duck.height / 2
        return xWithin && yWithin;
    }
}

function abs(x) {
    if(x < 0) return x * -1;
    else return x;
}