const onHitFlashTime = 100;
const entranceSpeed = 350;
const deathAnimationShrinkTime = 550;
const deathAnimationGrowTime = 250;
const maxExpansion = 1.45;
const breadExitTime = 500;
const minBreadExitSpeed = 100;
function getRandomDuckSprite() {
    let x = Math.floor(Math.random() * 100);
    if(x > 75) return "duck_back.png";
    if(x > 38) return "duck_brown.png";
    return "duck_yellow.png";
}
class Duck extends Phaser.GameObjects.PathFollower {
    constructor(scene, json, x, y) {
        //May specify no path
        if(json.path === undefined || json.path.length < 2) {
            json.path = [0, 0];
        }
        let path = new Phaser.Curves.Spline(json.path);
        super(scene, path, x, 0, "ducks", json.sprite);
        this.hp = json.hp;
        this.points = json.points;
        this.setScale(json.scale);
        this.type = json.type;
        if(json.rotateToPath !== undefined) {
            this.rotateToPath = json.rotateToPath;
        }
        else this.rotateToPath = false;
        //Init as bread
        if(json.type == "bread") {
            this.breadSprite = scene.add.image(x, 0, json.sprite);
            this.visible = false;
            this.breadSprite.setScale(json.scale);
            this.width = this.breadSprite.width;
            this.height = this.breadSprite.height;
        }
        this.deathShrinkAmountX = this.scaleX * maxExpansion;
        this.deathShrinkAmountY = this.scaleY * maxExpansion;
        if(json.bulletPattern.type == 1) {
            this.bulletPattern = {
                shootDelay: json.bulletPattern.shootDelay,
                patternDelay: json.bulletPattern.patternDelay,
                spawnNumber: 0,
                recharged: true,
                shootTimer: undefined,
                patternTimer: undefined,
                angularVelocities: json.bulletPattern.angularVelocities,
                do: (self) => {
                    self.bulletPattern.recharged = false;
                    //Spawn bullet rings in sequence
                    self.bulletPattern.shootTimer = self.scene.time.addEvent({
                        delay: self.bulletPattern.shootDelay,
                        repeat: self.bulletPattern.angularVelocities.length - 1,
                        callback: (self) => {
                            let angularVelocity = self.bulletPattern.angularVelocities[self.bulletPattern.spawnNumber];
                            let bulletRing = new BulletRing(self.scene, self.x, self.y, angularVelocity);
                            self.scene.duckBulletRings.push(bulletRing);
                            self.bulletPattern.spawnNumber = (self.bulletPattern.spawnNumber + 1) % self.bulletPattern.angularVelocities.length;
                            //Destroy bullet ring after some time
                            self.scene.time.addEvent({
                                delay: 5000,
                                callback: (bulletRing) => {
                                    bulletRing.destroy();
                                },
                                args: [bulletRing]
                            });
                        },
                        args: [self]
                    });
                    //Repeat sequence
                    self.bulletPattern.patternTimer = self.scene.time.delayedCall(
                        self.bulletPattern.shootDelay * self.bulletPattern.angularVelocities.length + self.bulletPattern.patternDelay, 
                        (self) => {
                            //Do pattern again
                            self.bulletPattern.recharged = true;
                        },
                        [self]
                    );
                }
            }
        }
        else if(json.bulletPattern.type == 0) {
            this.bulletPattern = {
                shootDelay: json.bulletPattern.shootDelay,
                patternDelay: json.bulletPattern.patternDelay,
                recharged: true,
                shootTimer: undefined,
                patternTimer: undefined,
                shotCount: 0,
                do: (self) => {
                    self.bulletPattern.recharged = false;
                    //Shoot at player
                    self.bulletPattern.shootTimer = self.scene.time.addEvent({
                        delay: self.bulletPattern.shootDelay,
                        repeat: 2,
                        callback: (self) => {
                            //Get direction vector to player
                            let dir = {
                                x: self.scene.player.x - self.x,
                                y: self.scene.player.y - self.y
                            };
                            if(self.scene.currentState != states.GAME_OVER) {
                                self.scene.sound.add("duckBullet", {volume: 0.15}).play();
                            }
                            dir = vecNormalize(dir);
                            let bullet = new EnemyBullet(self.scene, self.x, self.y, getRandomDuckSprite(), dir);
                            self.scene.duckBullets.add(bullet);
                            self.bulletPattern.shotCount += 1;
                            //On the third shot, fire two extra shots
                            if(self.bulletPattern.shotCount == 3) {
                                let angleDelta = Math.PI / 6;
                                let b2 = new EnemyBullet(self.scene, self.x, self.y, getRandomDuckSprite(), vecRotate(dir, -angleDelta));
                                let b3 = new EnemyBullet(self.scene, self.x, self.y, getRandomDuckSprite(), vecRotate(dir, angleDelta));
                                self.scene.duckBullets.add(b2);
                                self.scene.duckBullets.add(b3);
                                self.bulletPattern.shotCount = 0;
                            }
                        },
                        args: [self]
                    });
                    //Restart pattern after some time
                    self.bulletPattern.patternTimer = self.scene.time.delayedCall(
                        self.bulletPattern.shootDelay * 3 + self.bulletPattern.patternDelay,
                        (self) => {
                            self.bulletPattern.recharged = true;
                        },
                        [self]
                    );
                }
            };
        }
        this.targetY = y;
        this.update = this.enter;
        if(json.yoyo === undefined) {
            this.yoyo = true;
        }
        else this.yoyo = json.yoyo;
        if(json.duration === undefined) {
            this.duration = 2000;
        }
        else this.duration = json.duration;
        //Flip ducks around if on the right side of the screen
        if(x >= canvasW / 2) this.scaleX *= -1;
        if(this.type == "bread") {
            this.spriteOnHit = scene.add.image(this.x, this.y, json.spriteOnHit);
        }
        else {
            this.spriteOnHit = scene.add.sprite(this.x, this.y, "ducks", json.spriteOnHit);
        }
        this.spriteOnHit.visible = false;
        this.spriteOnHit.scaleX = this.scaleX;
        this.spriteOnHit.scaleY = this.scaleY;
        this.innerDestroy = this.destroy;
        this.destroy = this.outerDestroy;
        this.alpha = 0.55;
        this.active = false;
        scene.add.existing(this);
    }
    breadExit(delta) {
        this.y -= Math.max(this.startY, minBreadExitSpeed) / breadExitTime * delta;
        this.updateBread();
    }
    deathAnimationGrow(delta) {
        this.scaleX += Math.sign(this.scaleX) * (this.deathShrinkAmountX - this.startScaleX) / deathAnimationGrowTime * delta;
        this.scaleY += Math.sign(this.scaleY) * (this.deathShrinkAmountY - this.startScaleY) / deathAnimationGrowTime * delta;
        if(this.breadSprite) {
            this.updateBread();
        }
    }
    deathAnimationShrink(delta) {
        this.scaleX -= Math.sign(this.scaleX) * this.deathShrinkAmountX / (deathAnimationShrinkTime) * delta;
        this.scaleY -= Math.sign(this.scaleY) * this.deathShrinkAmountY / (deathAnimationShrinkTime) * delta;
        if(this.breadSprite) {
            this.updateBread();
        }
    }
    outerDestroy(destroyedByScene = false) {
        this.spriteOnHit.destroy(destroyedByScene);
        if(this.bulletPattern) {
            this.bulletPattern.shootTimer.remove(destroyedByScene);
            this.bulletPattern.patternTimer.remove(destroyedByScene);
        }
        if(this.waveEndTimer) {
            this.waveEndTimer.remove();
        }
        if(this.hp == 0) {
            this.active = false;
            if(this.breadSprite) {
                //Since updateBread adds 90 to angle, this will keep it at 0
                this.angle = -90;
            }
            this.update = this.deathAnimationGrow;
            this.stopFollow();
            this.startScaleX = Math.abs(this.scaleX);
            this.startScaleY = Math.abs(this.scaleY);
            this.scene.time.delayedCall(
                deathAnimationGrowTime,
                (self, destroyedByScene) => {
                    self.update = self.deathAnimationShrink;
                    self.scene.time.delayedCall(
                        deathAnimationShrinkTime,
                        (self, destroyedByScene) => {
                            self.wave.activeDucks.remove(self);
                            if(self.breadSprite) {
                                self.breadSprite.destroy(destroyedByScene);
                            }
                            self.innerDestroy(destroyedByScene);
                        },
                        [self, destroyedByScene]
                    );
                },
                [this, destroyedByScene]
            );
        }
        //Wave ended and we are bread
        else if(!this.active) {
            this.startY = this.y;
            this.alpha = 0.55;
            this.update = this.breadExit;
            this.stopFollow();
            this.angle = -90;
            this.scene.time.delayedCall(
                breadExitTime,
                (self, destroyedByScene) => {
                    self.wave.activeDucks.remove(self);
                    self.breadSprite.destroy(destroyedByScene);
                    self.innerDestroy(destroyedByScene);
                },
                [this, destroyedByScene]
            );
        }
        else {
            if(this.breadSprite) {
                this.breadSprite.destroy(destroyedByScene);
            }
            this.innerDestroy(destroyedByScene);
        }

    }
    updateBread() {
        this.breadSprite.x = this.x;
        this.breadSprite.y = this.y;
        this.breadSprite.angle = this.angle + 90;
        this.breadSprite.alpha = this.alpha;
        this.breadSprite.scaleX = this.scaleX;
        this.breadSprite.scaleY = this.scaleY;
    }
    enter(delta) {
        this.y += entranceSpeed * delta / 1000;
        if(this.y >= this.targetY) {
            this.y = this.targetY;
            this.update = this.loop;
            this.alpha = 1.0;
            this.active = true;
            this.startLoop();
        }
        if(this.breadSprite) {
            this.updateBread();
        }
    }
    loop(delta) {
        if(this.bulletPattern && this.bulletPattern.recharged) {
            this.bulletPattern.do(this);
        }
        if(this.x >= canvasW / 2) {
            if(this.scaleX > 0) this.scaleX *= -1;
        }
        else if(this.x < canvasW / 2) {
            if(this.scaleX < 0) this.scaleX *= -1;
        }
        this.spriteOnHit.x = this.x;
        this.spriteOnHit.y = this.y;
        this.spriteOnHit.scaleX = this.scaleX;
        this.spriteOnHit.scaleY = this.scaleY;
        this.spriteOnHit.angle = this.angle;
        if(this.breadSprite) {
            this.updateBread();
            this.spriteOnHit.angle += 90;
        }
    }
    startLoop() {
        this.startFollow({
            from: 0,
            to: 1,
            delay: 0,
            duration: this.duration,
            ease: 'Sine.easeInOut',
            repeat: -1,
            yoyo: this.yoyo,
            rotateToPath: this.rotateToPath
        });
    }
}