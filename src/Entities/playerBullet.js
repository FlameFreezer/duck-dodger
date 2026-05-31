class PlayerBullet extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "player", "worm.png");
        scene.add.existing(this);

        this.speed = PLAYER_BULLET_SPEED;
        this.setScale(0.25);
        this.angle = 90;
        this.killed = false;
    }
    update(delta) {
        this.y -= this.speed * delta / 1000;
        if(this.y + this.displayHeight / 2 <= 0) {
            this.killed = true;
        }
        console.log("update!");
    }
    kill() {
        this.destroy();
    }
    collisionCheck(other) {
        if(!other.active) return false;
        let scaleX = Math.abs(this.scaleX);
        let scaleY = Math.abs(this.scaleY);
        let otherScaleX = Math.abs(other.scaleX);
        let otherScaleY = Math.abs(other.scaleY);
        let xWithin = this.x + scaleY * this.height / 2 > other.x - otherScaleX * other.width / 2
            && this.x - scaleY * this.height / 2 < other.x + otherScaleX * other.width / 2;
        let yWithin = this.y + scaleX * this.width / 2 > other.y - otherScaleY * other.height / 2
            && this.y - scaleX * this.width / 2 < other.y + otherScaleY * other.height / 2
        return xWithin && yWithin;
    }
}