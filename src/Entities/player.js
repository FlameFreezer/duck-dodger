class Player extends Sprite {
    constructor(scene, json) {
        super(scene, json.spawnPoint.x, json.spawnPoint.y, "player", json.sprite);
        this.scene = scene;
        this.fastSpeed = json.fastSpeed;
        this.slowSpeed = json.slowSpeed;
        this.speed = this.fastSpeed;
        this.setScale(json.scale);
        this.angle = json.angle;
        this.shootDelay = json.shootDelay;
        this.timeSinceShoot = this.shootDelay;
        this.shootOffset = json.shootOffset;
        this.activeColor = yellow;
        //Offsets are optional
        if(this.shootOffset.x === undefined) this.shootOffset.x = 0;
        if(this.shootOffset.y === undefined) this.shootOffset.y = 0;
        scene.add.existing(this);
    }
    shootBullet() {
        this.scene.bullets.add(new PlayerBullet(this.scene, this.x + this.shootOffset.x, this.y + this.shootOffset.y));
        this.timeSinceShoot = 0;
    }
    update(delta) {
        let scene = this.scene;
        //Use slow speed if holding shift
        if(scene.keys.shift.isDown) {
            this.speed = this.slowSpeed; 
        }
        else {
            this.speed = this.fastSpeed;
        }

        //Move left
        if(scene.keys.a.isDown) {
            this.x -= this.speed * (delta / 1000);
        }
        //Move right
        if(scene.keys.d.isDown) {
            this.x += this.speed * (delta / 1000)
        }
        //Change color
        if(Phaser.Input.Keyboard.JustDown(scene.keys.w)) {
            if(this.activeColor === yellow) {
                this.activeColor = green;
            }
            else this.activeColor = yellow;
        }
        scene.bgShader.setUniform("baseColor.value", colorToVector(this.activeColor));
        //Accumulate shoot delay
        this.timeSinceShoot += delta;
        //Shoot
        if(scene.keys.space.isDown) {
            if(this.timeSinceShoot >= this.shootDelay) {
                this.shootBullet();
            }
        }
        //Keep fish within bounds
        if(this.x + this.width * this.scaleX / 2 > canvasW) {
            this.x = canvasW - this.width * this.scaleX / 2;
        }
        if(this.x - this.width * this.scaleX / 2 < 0) {
            this.x = this.width * this.scaleX / 2;
        }

    }
}