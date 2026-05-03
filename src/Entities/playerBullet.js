class PlayerBullet extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "player", "worm.png");
        this.speed = 900;
        this.setScale(0.25);
        this.angle = 90;
        scene.add.existing(this);
    }
    update(delta) {
        this.y -= this.speed * delta / 1000;
        if(this.y + this.width * this.scaleX / 2 <= 0) {
            return false;
        }
        return true;
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