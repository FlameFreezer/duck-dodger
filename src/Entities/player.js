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
        this.activeColor = Colors.YELLOW;
        this.displayColor = GetRGBFromColor(Colors.YELLOW);
        this.hp = PLAYER_STARTING_HEALTH;
        scene.registry.set('health', this.hp);
        this.isInvulnerable = false;
        this.colorChangeTime = 0;
        this.didChangeColor = false;
        this.canShoot = true;
        this.bullets = [];
        this.bulletKillList = [];
        this.velocity = {
            x: 0, y: 0
        };

        this.upgrades = {
            homing: 0,
            projectiles: 0,
            fireRate: 0
        };

        this.hitbox = new Phaser.Geom.Circle(this.x, this.y, this.displayWidth / 2 - 2);
        if(DEBUG) {
            this.debugGraphics = scene.add.graphics();
        }

        this.update = this.updateAlive;

        document.addEventListener("duckBulletHit", 
            () => {
                this.onHit()
            }
        );

        let player = this;
        this.swimVfx = scene.add.particles(0, 0, "bubble", {
            lifespan: 500,
            frequency: 100,
            alpha: {start: 0.75, end: 0.0},
            emitCallback: (particle) => {
                let angle = -90;
                if(player.velocity.x != 0 || player.velocity.y != 0) {
                    angle = vecAngle(player.velocity) * RAD_TO_DEG;
                }
                let randomOffset = Math.random() * PLAYER_SWIM_VFX_BUBBLE_ANGLE_RANGE - PLAYER_SWIM_VFX_BUBBLE_ANGLE_RANGE / 2;
                particle.angle = angle + 180 + randomOffset;

                randomOffset = Math.random() * PLAYER_SWIM_VFX_BUBBLE_SPEED_RANGE - PLAYER_SWIM_VFX_BUBBLE_SPEED_RANGE / 2;
                let speed = PLAYER_SWIM_VFX_BUBBLE_BASE_SPEED + randomOffset + vecLength(player.velocity) / 4;
                particle.velocityX = Math.cos(particle.angle * DEG_TO_RAD) * speed;
                particle.velocityY = Math.sin(particle.angle * DEG_TO_RAD) * speed;

                let scale = Math.random() * (0.35 - 0.15) + 0.05;
                particle.scaleX = scale;
                particle.scaleY = scale;

                particle.accelerationX = -Math.cos(particle.angle * DEG_TO_RAD) * PLAYER_SWIM_VFX_BUBBLE_DECELERATION;
                particle.accelerationY = -Math.sin(particle.angle * DEG_TO_RAD) * PLAYER_SWIM_VFX_BUBBLE_DECELERATION;
            }
        });

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
    updateAlive(delta) {
        let scene = this.scene;

        this.updateBullets(delta);

        //Move, shoot, change color
        this.handleInputs(delta);

        //Do the color transition
        this.updateColorTransition(delta);

        //Keep fish within bounds
        if(this.x + this.displayWidth / 2 > CANVAS_WIDTH) {
            this.x = CANVAS_WIDTH - this.displayWidth / 2;
        }
        if(this.x - this.displayWidth / 2 < 0) {
            this.x = this.displayWidth / 2;
        }
        if(this.y + this.displayHeight / 2 > CANVAS_HEIGHT) {
            this.y = CANVAS_HEIGHT - this.displayHeight / 2;
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

        this.swimVfx.x = this.x;
        this.swimVfx.y = this.y + PLAYER_SWIM_VFX_OFFSET;
    }
    updateDead(delta) {
        this.updateBullets(delta);

        this.updateColorTransition(delta);

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
        this.addHP(-1);
        this.isInvulnerable = true;
        if(this.hp <= 0) {
            return this.onDeath();
        }
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
        this.swimVfx.stop();

        this.update = this.updateDead;
    }
    addHP(amount) {
        this.hp += amount;
        this.scene.registry.set('health', this.hp);
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
            if(this.activeColor == Colors.GREEN) {
                this.colorChangeTime += delta;
                if(this.colorChangeTime > COLOR_CHANGE_TIME) {
                    this.colorChangeTime = COLOR_CHANGE_TIME;
                    this.didChangeColor = false;
                }
            }
            else if(this.activeColor == Colors.YELLOW) {
                this.colorChangeTime -= delta;
                if(this.colorChangeTime < 0) {
                    this.colorChangeTime = 0;
                    this.didChangeColor = false;
                }
            }
            this.displayColor = vecLerp(GetRGBFromColor(Colors.YELLOW), GetRGBFromColor(Colors.GREEN), this.colorChangeTime / COLOR_CHANGE_TIME);
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
        //Friction
        if(inputVector.x == 0 && inputVector.y == 0) {
            let friction = Math.min(PLAYER_ACCELERATION * (delta / 1000), vecLength(this.velocity));
            this.velocity = vecSubtract(this.velocity, vecScale(vecNormalize(this.velocity), friction));
        }
        //Acceleration
        else {
            this.velocity = vecAdd(this.velocity, vecScale(inputVector, PLAYER_ACCELERATION * (delta / 1000)));
        }
        //Keep speed below max
        if(vecLength(this.velocity) > this.speed) {
            this.velocity = vecScale(vecNormalize(this.velocity), this.speed);
        }
        //Set very small speeds to 0
        if(vecLength(this.velocity) <= 0.1) {
            this.velocity = vecScale(this.velocity, 0);
        }
        //this.velocity.x = inputVector.x * this.speed;
        //this.velocity.y = inputVector.y * this.speed;
        this.x += this.velocity.x * (delta / 1000);
        this.y += this.velocity.y * (delta / 1000);

        //Change color
        if(Phaser.Input.Keyboard.JustDown(scene.keys.space)) {
            if(this.activeColor === Colors.YELLOW) {
                this.activeColor = Colors.GREEN;
            }
            else this.activeColor = Colors.YELLOW;
            this.didChangeColor = true;
        }

        //Shoot
        if(this.canShoot) {
            this.shootBullet();
        }
    }
}