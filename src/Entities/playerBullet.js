class PlayerBullet extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "player", "worm.png");
        scene.add.existing(this);

        this.speed = PLAYER_BULLET_SPEED;
        this.velocity = {x: 0, y: -this.speed};
        this.setScale(0.25);
        this.angle = 90;
        this.killed = false;

        this.hitbox = new Phaser.Geom.Rectangle(this.x - this.displayHeight / 2, this.y - this.displayWidth / 2, this.displayHeight, this.displayWidth);
        if(DEBUG) {
            this.debugGraphics = scene.add.graphics();
        }
    }
    update(delta) {
        this.x += this.velocity.x * delta / 1000;
        this.y += this.velocity.y * delta / 1000;
        if(this.y + this.displayHeight / 2 <= 0) {
            this.killed = true;
        }

        this.hitbox.setPosition(this.x - this.displayHeight / 2, this.y - this.displayWidth / 2);
        //Draw hitbox
        if(DEBUG) {
            this.debugGraphics.clear();
            this.debugGraphics.lineStyle(1, 0xffffff, 1);
            this.debugGraphics.strokeRectShape(this.hitbox);
        }

    }
    kill() {
        if(DEBUG) {
            this.debugGraphics.destroy();
        }
        this.destroy();
    }
    //Deprecated
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