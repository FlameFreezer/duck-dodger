class EnemyBullet extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, sprite, dir) {
        super(scene, x, y, "ducks", sprite);
        this.speed = 400;
        this.dir = dir;
        if(sprite == "duck_yellow.png") {
            this.color = yellow;
        }
        else if(sprite == "duck_brown.png") {
            this.color = green;
        }
        this.velocity = vecScale(dir, this.speed);
        this.setScale(0.25);
        scene.add.existing(this);
    }
    update(delta) {
        this.x += this.velocity.x * delta / 1000;
        this.y += this.velocity.y * delta / 1000;
    }
    collisionCheck(other) {
        if(other.activeColor && this.color === other.activeColor) return false;
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