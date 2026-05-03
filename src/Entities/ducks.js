const onHitFlashTime = 100;
const entranceSpeed = 350;
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
            }
        };
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
        this.spriteOnHit = scene.add.sprite(0, 0, "ducks", json.spriteOnHit);
        this.spriteOnHit.visible = false;
        this.onHitFlashTimer = 0;
        this.innerDestroy = this.destroy;
        this.destroy = this.outerDestroy;
        this.alpha = 0.55;
        this.active = false;
        scene.add.existing(this);
    }
    outerDestroy(destroyedByScene = false) {
        this.spriteOnHit.destroy(destroyedByScene);
        this.bulletPattern.shootTimer.remove(destroyedByScene);
        this.bulletPattern.patternTimer.remove(destroyedByScene);
        this.innerDestroy(destroyedByScene);
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
    }
    loop(delta) {
        if(this.bulletPattern.recharged) {
            this.bulletPattern.do(this);
        }
        if(this.x >= canvasW / 2) {
            if(this.scaleX > 0) this.scaleX *= -1;
        }
        else if(this.x < canvasW / 2) {
            if(this.scaleX < 0) this.scaleX *= -1;
        }
        if(this.onHitFlashTimer != 0) {
            this.onHitFlashTimer += delta;
            this.spriteOnHit.visible = true;
            this.visible = true;
        }
        if(this.onHitFlashTimer >= onHitFlashTime) {
            this.onHitFlashTimer = 0;
            this.spriteOnHit.visible = false;
            this.visible = true;
        }
        this.spriteOnHit.x = this.x;
        this.spriteOnHit.y = this.y;
        this.spriteOnHit.scaleX = this.scaleX;
        this.spriteOnHit.scaleY = this.scaleY;
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
            rotateToPath: false
        });
    }
}