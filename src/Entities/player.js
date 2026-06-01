const PLAYER_HIT_FRAME_TIME = 400;
const COLOR_CHANGE_TIME = 100;
class Player extends Phaser.GameObjects.Sprite {
    constructor(scene, json) {
        super(scene, json.spawnPoint.x, json.spawnPoint.y, "player");
        scene.add.existing(this);

        this.scene = scene;
        this.speed = PLAYER_BASE_SPEED;
        this.setScale(json.scale);
        this.angle = json.angle;
        this.shootDelay = PLAYER_FIRE_RATE;
        this.baseShootDelay = PLAYER_FIRE_RATE;
        this.shootOffset = json.shootOffset;
        this.activeColor = yellow;
        this.displayColor = yellow;
        this.hp = json.hp;
        this.isInvulnerable = false;
        this.colorChangeTime = 0;
        this.didChangeColor = false;
        this.canShoot = true;
        this.bullets = [];
        this.bulletKillList = [];

        this.upgrades = {
            homing: 0,
            projectiles: 0,
            fireRate: 0
        };

        for(let i = 0; i < 10; i++) {
            this.upgradeHoming();
        }
        for(let i = 0; i < 7; i++) {
            this.upgradeProjectiles();
        }
        for(let i = 0; i < 4; i++) {
            this.upgradeFireRate();
        }

        this.hitbox = new Phaser.Geom.Circle(this.x, this.y, this.displayWidth / 2 - 2);
        if(DEBUG) {
            this.debugGraphics = scene.add.graphics();
        }

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
            frameRate: 1 * 1000 / PLAYER_HIT_FRAME_TIME,
            repeat: 0,
            showOnStart: true,
            hideOnComplete: true,
            frames: [{key: "player", frame: "fishPink_hit.png"}]
        });
        this.play("playerSwim");
    }
    update(delta) {
        let scene = this.scene;

        this.updateBullets(delta);

        //Move, shoot, change color
        this.handleInputs(delta);

        //Do the color transition
        this.updateColorTransition(delta);

        //Keep fish within bounds
        if(this.x + this.displayWidth / 2 > canvasW) {
            this.x = canvasW - this.displayWidth / 2;
        }
        if(this.x - this.displayWidth / 2 < 0) {
            this.x = this.displayWidth / 2;
        }
        if(this.y + this.displayHeight / 2 > canvasH) {
            this.y = canvasH - this.displayHeight / 2;
        }
        if(this.y - this.displayHeight / 2 < 0) {
            this.y = this.displayHeight / 2;
        }

        //Move hitbox
        this.hitbox.setPosition(this.x, this.y);
        //Draw hitbox
        if(DEBUG) {
            this.debugGraphics.clear();
            this.debugGraphics.lineStyle(1, 0xffffff, 1);
            this.debugGraphics.strokeCircleShape(this.hitbox);
        }
        if(this.bulletKillList.length > 0) {
            this.destroyBullets();
        }
    }
    updateBullets(delta) {
        for(let bullet of this.bullets) {
            bullet.update(delta, this.upgrades.homing);
            if(bullet.killed) {
                this.bulletKillList.push(bullet);
            }
        }
    }
    destroyBullets() {
        for(let bullet of this.bulletKillList) {
            bullet.kill();
        }
        this.bullets = this.bullets.filter((bullet) => {
            if(!this.bulletKillList.includes(bullet)) return bullet;
        });
        this.bulletKillList = [];
    }
    shootBullet() {
        //Define a width which we will iterate through to shoot the bullets in a row
        let shootRegionWidth = this.upgrades.projectiles * PLAYER_BULLET_SPACING;
        //Repeat for each projectile we want to make (+1 so we can shoot at level 0)
        for(let i = 0; i < this.upgrades.projectiles + 1; i++) {
            //Get an offset within the region. Start negative so we begin at the left side
            let regionOffset = -shootRegionWidth / 2 + i * PLAYER_BULLET_SPACING;
            //Shoot a bullet
            this.bullets.push(new PlayerBullet(this.scene, this.x + this.shootOffset.x + regionOffset, this.y + this.shootOffset.y));
        }
        this.canShoot = false;
        this.scene.time.delayedCall(
            this.shootDelay,
            (self) => {
                self.canShoot = true;
            },
            [this]
        );
    }
    onHit() {
        this.hp -= 1;
        this.isInvulnerable = true;
        this.stop("playerSwim");
        this.play("playerHit");
        this.hitTimer = this.scene.time.delayedCall(
            PLAYER_HIT_FRAME_TIME,
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
    upgradeFireRate() {
        this.upgrades.fireRate++;
        this.shootDelay = this.baseShootDelay - PLAYER_FIRE_RATE_PER_LEVEL * this.upgrades.fireRate;
        //Cap fire rate
        this.shootDelay = Math.max(this.shootDelay, PLAYER_MAX_FIRE_RATE);
    }
    upgradeProjectiles() {
        this.upgrades.projectiles++;
    }
    upgradeHoming() {
        this.upgrades.homing++;
    }
    updateColorTransition(delta) {
        if(this.didChangeColor) {
            if(this.activeColor == green) {
                this.colorChangeTime += delta;
                if(this.colorChangeTime > COLOR_CHANGE_TIME) {
                    this.colorChangeTime = COLOR_CHANGE_TIME;
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
            this.displayColor = vecLerp(yellow, green, this.colorChangeTime / COLOR_CHANGE_TIME);
        }
        this.scene.bgShader.setUniform("baseColor.value", colorToVector(this.displayColor));
    }
    handleInputs(delta) {
        let scene = this.scene;

        //Slow down if holding shift
        if(scene.keys.shift.isDown) {
            this.speed = PLAYER_SLOW_SPEED;
        }
        else {
            this.speed = PLAYER_BASE_SPEED;
        }

        //Move player based on inputs
        let inputVector = {};
        inputVector.x = scene.keys.d.isDown - scene.keys.a.isDown;
        inputVector.y = scene.keys.s.isDown - scene.keys.w.isDown;
        inputVector = vecNormalize(inputVector);
        this.x += inputVector.x * this.speed * (delta / 1000);
        this.y += inputVector.y * this.speed * (delta / 1000);

        //Change color
        if(Phaser.Input.Keyboard.JustDown(scene.keys.space)) {
            if(this.activeColor === yellow) {
                this.activeColor = green;
            }
            else this.activeColor = yellow;
            this.didChangeColor = true;
        }

        //Shoot
        if(this.canShoot) {
            this.shootBullet();
        }
    }
}