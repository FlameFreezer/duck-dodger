const playerHitFameTime = 400;
const colorChangeTime = 100;
class Player extends Phaser.GameObjects.Sprite {
    constructor(scene, json) {
        super(scene, json.spawnPoint.x, json.spawnPoint.y, "player");
        this.scene = scene;
        this.speed = json.speed;
        this.setScale(json.scale);
        this.angle = json.angle;
        this.shootDelay = json.shootDelay;
        this.timeSinceShoot = this.shootDelay;
        this.shootOffset = json.shootOffset;
        this.activeColor = yellow;
        this.displayColor = yellow;
        this.hp = json.hp;
        this.isInvulnerable = false;
        this.colorChangeTime = 0;
        this.didChangeColor = false;

        //Offsets are optional
        if(this.shootOffset.x === undefined) this.shootOffset.x = 0;
        if(this.shootOffset.y === undefined) this.shootOffset.y = 0;
        let swimAnimationConfig = {
            key: "playerSwim",
            frameRate: 4,
            repeat: -1,
            showOnStart: true,
            hideOnComplete: true,
            frames: []
        };
        for(let frame of json.frames) {
            swimAnimationConfig.frames.push({key: "player", frame: frame});
        } 
        this.anims.create(swimAnimationConfig);        
        this.anims.create({
            key: "playerDead",
            frameRate: 1,
            repeat: -1,
            showOnStart: true,
            frames: [{key: "player", frame: "fishPink_dead.png"}]
        });
        this.anims.create({
            key: "playerHit",
            frameRate: 1 * 1000 / playerHitFameTime,
            repeat: 0,
            showOnStart: true,
            hideOnComplete: true,
            frames: [{key: "player", frame: "fishPink_hit.png"}]
        });
        scene.add.existing(this);
        this.play("playerSwim");
    }
    shootBullet() {
        this.scene.bullets.add(new PlayerBullet(this.scene, this.x + this.shootOffset.x, this.y + this.shootOffset.y));
        this.timeSinceShoot = 0;
    }
    onHit() {
        this.hp -= 1;
        this.isInvulnerable = true;
        this.stop("playerSwim");
        this.play("playerHit");
        this.hitTimer = this.scene.time.delayedCall(
            playerHitFameTime,
            (self) => {
                self.isInvulnerable = false;
                self.play("playerSwim");
            },
            [this]
        );
    }
    onDeath() {
        this.hitTimer.remove();
        this.stop("playerSwim");
        this.play("playerDead");

        this.update = (delta) => {
            this.updateColorTransition(delta);
        };
    }
    addHP(amount) {
        this.hp += amount;
    }
    updateColorTransition(delta) {
        if(this.didChangeColor) {
            if(this.activeColor == green) {
                this.colorChangeTime += delta;
                if(this.colorChangeTime > colorChangeTime) {
                    this.colorChangeTime = colorChangeTime;
                    this.didChangeColor = false;
                }
            }
            else if(this.activeColor == yellow) {
                this.colorChangeTime -= delta;
                if(this.colorChangeTime < 0) {
                    this.colorChangeTime = 0;
                    this.didChangeColor = false;
                }
            }
            this.displayColor = vecLerp(yellow, green, this.colorChangeTime / colorChangeTime);
        }
        this.scene.bgShader.setUniform("baseColor.value", colorToVector(this.displayColor));
    }
    update(delta) {
        let scene = this.scene;

        this.updateColorTransition(delta);

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
            this.didChangeColor = true;
        }

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