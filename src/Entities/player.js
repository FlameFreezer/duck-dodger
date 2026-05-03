class Player extends Phaser.GameObjects.Sprite {
    constructor(scene, json) {
        super(scene, json.spawnPoint.x, json.spawnPoint.y, "player");
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
        this.hp = 5;
        this.wasHitThisFrame = false;
        this.deadSprite = this.scene.add.sprite(0, 0, "player", "fishPink_dead.png");
        this.deadSprite.visible = false;
        this.deadSprite.setScale(json.scale);
        this.deadSprite.angle = this.angle;
        //Offsets are optional
        if(this.shootOffset.x === undefined) this.shootOffset.x = 0;
        if(this.shootOffset.y === undefined) this.shootOffset.y = 0;
        let config = {
            key: "swim",
            frameRate: 4,
            repeat: -1,
            showOnStart: true,
            frames: []
        };
        for(let frame of json.frames) {
            config.frames.push({key: "player", frame: frame});
        } 
        this.anims.create(config);        
        scene.add.existing(this);
        this.play("swim");
    }
    shootBullet() {
        this.scene.bullets.add(new PlayerBullet(this.scene, this.x + this.shootOffset.x, this.y + this.shootOffset.y));
        this.timeSinceShoot = 0;
    }
    update(delta) {
        if(this.hp <= 0) return;
        this.wasHitThisFrame = false;
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