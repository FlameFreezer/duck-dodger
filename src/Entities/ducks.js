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
        if(json.bulletPattern == 1) {
            this.bulletPattern = {
                ringDelay: 500,
                patternDelay: 2000,
                spawnNumber: 0,
                do: (self) => {
                    const angularVelocities = [0, -1, -1, 1];
                    //Spawn bullet rings in sequence
                    self.scene.time.addEvent({
                        delay: self.bulletPattern.ringDelay,
                        repeat: angularVelocities.length - 1,
                        callback: (self) => {
                            if(!self.scene) return;
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
                        delay: self.bulletPattern.ringDelay * angularVelocities.length,
                        callback: (self) => {
                            if(!self.scene) return;
                            //Set new timer to restart ring pattern
                            self.scene.time.addEvent({
                                delay: self.bulletPattern.patternDelay,
                                callback: (self) => {
                                    if(!self.scene) return;
                                    //Do pattern again
                                    self.bulletPattern.do(self);
                                },
                                args: [self]
                            })
                        },
                        args: [self]
                    });
                }
            }
        }
        else if(json.bulletPattern == 0) {
            this.bulletPattern = {
                do: (self) => {}
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
            this.bulletPattern.do(this);
        }
    }
    loop(delta) {
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