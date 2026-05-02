const onHitFlashTime = 100;
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
                do: (self) => {
                    self.bulletPattern.recharged = false;
                    const angularVelocities = [0, -1, -1, 1];
                    //Spawn bullet rings in sequence
                    self.scene.time.addEvent({
                        delay: self.bulletPattern.shootDelay,
                        repeat: angularVelocities.length - 1,
                        callback: (self) => {
                            let bulletRing = new BulletRing(self.scene, self.x, self.y, angularVelocities[self.bulletPattern.spawnNumber]);
                            self.scene.duckBulletRings.push(bulletRing);
                            self.bulletPattern.spawnNumber = (self.bulletPattern.spawnNumber + 1) % angularVelocities.length;
                            self.scene.time.addEvent({
                                delay: 2000,
                                callback: (bulletRing) => {
                                    bulletRing.destroy();
                                },
                                args: [bulletRing]
                            });
                        },
                        args: [self]
                    });
                    //Cleanup bullet rings and repeat sequence
                    self.scene.time.addEvent({
                        delay: self.bulletPattern.shootDelay * angularVelocities.length,
                        callback: (self) => {
                            //Set new timer to restart ring pattern
                            self.scene.time.addEvent({
                                delay: self.bulletPattern.patternDelay,
                                callback: (self) => {
                                    //Do pattern again
                                    self.bulletPattern.recharged = true;
                                },
                                args: [self]
                            })
                        },
                        args: [self]
                    });
                }
            }
        }
        else if(json.bulletPattern.type == 0) {
            this.bulletPattern = {
                shootDelay: json.bulletPattern.shootDelay,
                patternDelay: json.bulletPattern.patternDelay,
                recharged: true,
                do: (self) => {
                    self.bulletPattern.recharged = false;
                    self.scene.time.addEvent({
                        delay: self.bulletPattern.shootDelay,
                        repeat: 1,
                        callback: (self) => {
                            let dir = {
                                x: self.scene.player.x - self.x,
                                y: self.scene.player.y - self.y
                            };
                            dir = vecNormalize(dir);
                            let bullet = new EnemyBullet(self.scene, self.x, self.y, duckSprites[Math.floor(Math.random() * duckSprites.length)], dir);
                            self.scene.duckBullets.push(bullet);
                        },
                        args: [self]
                    });
                    self.scene.time.addEvent({
                        delay: self.bulletPattern.shootDelay * 3,
                        callback: (self) => {
                            let dir = {
                                x: self.scene.player.x - self.x,
                                y: self.scene.player.y - self.y
                            };
                            dir = vecNormalize(dir);
                            let b1 = new EnemyBullet(self.scene, self.x, self.y, duckSprites[Math.floor(Math.random() * duckSprites.length)], dir);
                            let b2 = new EnemyBullet(self.scene, self.x, self.y, duckSprites[Math.floor(Math.random() * duckSprites.length)], vecRotate(dir, -Math.PI / 6));
                            let b3 = new EnemyBullet(self.scene, self.x, self.y, duckSprites[Math.floor(Math.random() * duckSprites.length)], vecRotate(dir, Math.PI / 6));
                            self.scene.duckBullets.push(b1);
                            self.scene.duckBullets.push(b2);
                            self.scene.duckBullets.push(b3);
                        },
                        args: [self]
                    });
                    self.scene.time.addEvent({
                        delay: self.bulletPattern.shootDelay * 3 + self.bulletPattern.patternDelay,
                        callback: (self) => {
                            self.bulletPattern.recharged = true;
                        },
                        args: [self]
                    });
                }
            }
        };
        this.targetY = y;
        this.entranceSpeed = this.targetY;
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
        scene.add.existing(this);
    }
    outerDestroy() {
        this.spriteOnHit.destroy(true);
        this.innerDestroy(true);
    }
    enter(delta) {
        this.y += this.entranceSpeed * delta / 1000;
        if(this.y >= this.targetY) {
            this.y = this.targetY;
            this.update = this.loop;
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