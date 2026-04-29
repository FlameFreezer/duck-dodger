class Player extends Sprite {
    constructor(scene, json) {
        super(scene, json.spawnPoint.x, json.spawnPoint.y, "player", json.sprite);
        this.fastSpeed = json.fastSpeed;
        this.slowSpeed = json.slowSpeed;
        this.speed = this.fastSpeed;
        this.setScale(json.scale);
        this.angle = json.angle;
        this.shootDelay = json.shootDelay;
        this.timeSinceShoot = this.shootDelay;
        this.shootOffset = json.shootOffset;
        //Offsets are optional
        if(this.shootOffset.x === undefined) this.shootOffset.x = 0;
        if(this.shootOffset.y === undefined) this.shootOffset.y = 0;
        scene.add.existing(this);
    }
    shootBullet(scene) {
        scene.bullets.push(new PlayerBullet(scene, this.x + this.shootOffset.x, this.y + this.shootOffset.y));
        this.timeSinceShoot = 0;
    }
}