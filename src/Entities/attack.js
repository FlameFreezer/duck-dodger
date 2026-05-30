class Attack {
    constructor(scene, owner, player, pattern) { // TODO: update constructor parameters and add registerTo function
        this.scene = scene;
        this.owner = owner;

        this.damagePlayer = player.onHit;

        this.x = owner.x;
        this.y = owner.y;

        this.targetX = player.x;
        this.targetY = player.y;

        // TODO: replace this with a different way of defining attack color.
        this.color = Number(player.activeColor != Colors.GREEN); // opposite color of player

        this.spawned = false;
        this.killed = false;

        this.spawnPattern = 0;
        this.updatePattern = 0;
        this.dir = 0;

        this.setPatternFromString(pattern);
        if (DEBUG) this.patternName = pattern;

        let spawnOffset = vecScale(this.dir, this.owner.hitbox.radius);
        this.x += spawnOffset.x;
        this.y += spawnOffset.y;
    }

    setPatternFromString(pattern) {
        switch(pattern) {
            case "t-pattern":
                this.spawnPattern = this.spawnTPattern;
                this.updatePattern = this.updateTPattern;
                this.dir = {x: this.targetX - this.x, y: this.targetY - this.y};
                this.dir = vecNormalize(this.dir);
                this.doKill = () => {return this.spawned && this.bullets.length == 0;};
                this.bullets = [];
                break;
            case "ring":
                this.spawnPattern = this.spawnRingPattern;
                this.updatePattern = this.updateRingPattern;
                this.dir = {x: 0, y: 1};
                this.doKill = () => {return this.spawned && this.rings.length == 0;};
                this.rings = [];
                break;
            case "wall":
                this.spawnPattern = this.spawnWallPattern;
                this.updatePattern = this.updateWallPattern;
                this.dir = {x: this.targetX - this.x, y: this.targetY - this.y};
                this.dir = vecNormalize(this.dir);
                this.doKill = () => {};
                this.walls = [];
                break;
            default: // this should never happen
                return;
        }
    }

    update(delta) {
        if (!this.spawned) {
            this.spawnPattern(delta);
        }
        if (!this.killed) {
            this.updatePattern(delta);
            if (this.doKill()) {
                this.kill();
            }
        }

    }

    spawnTPattern(delta) {
        if (this.bullets.length == 0) {
            this.bullets.push(new DuckBullet(this.scene, this.x, this.y, Colors.GRAY, this.damagePlayer));
            this.delay = (this.bullets[0].hitbox.radius * T_PATTERN_BULLET_GAP / T_PATTERN_MOVE_SPEED) * 1000;
            this.spawnClock = 0;
        }
        else if (this.spawnClock >= this.delay) {
            this.bullets.push(new DuckBullet(this.scene, this.x, this.y, Colors.GRAY, this.damagePlayer, true));
            if (this.bullets.length > 2) {
                let leftTOffset = vecRotate(vecScale(this.dir, this.bullets[0].hitbox.radius * T_PATTERN_BULLET_GAP), Math.PI / 2);
                let rightTOffset = vecRotate(vecScale(this.dir, this.bullets[0].hitbox.radius * T_PATTERN_BULLET_GAP), Math.PI / -2);
                this.bullets.push(new DuckBullet(this.scene, this.x + leftTOffset.x, this.y + leftTOffset.y, this.color, this.damagePlayer));
                this.bullets.push(new DuckBullet(this.scene, this.x + rightTOffset.x, this.y + rightTOffset.y, this.color, this.damagePlayer));
                this.spawned = true;
            }
            this.spawnClock = this.spawnClock % this.delay;
        }
        this.spawnClock += delta;
    }

    updateTPattern(delta) {
        let vec = vecScale(this.dir, T_PATTERN_MOVE_SPEED * (delta / 1000));
        for (let bullet of this.bullets) {
            bullet.modifyPos(vec);
            if (bullet.doCollisionCheck()) {
                this.bullets.splice(this.bullets.indexOf(bullet), 1);
                bullet.destroyChildren();
                bullet.destroy();
            }

            // destroy bullet if it's off screen
            else if (bullet.x < bullet.radius * -1 
                || bullet.x > this.scene.sys.scale.width + bullet.hitbox.radius
                || bullet.y < bullet.radius * -1
                || bullet.y > this.scene.sys.scale.height + bullet.hitbox.radius) {
                    this.bullets.splice(this.bullets.indexOf(bullet), 1);
                    bullet.destroyChildren();
                    bullet.destroy();
            }
        }
    }

    createBulletRing() {
        let ring = {};
        ring.x = this.x;
        ring.y = this.y;
        ring.radius = this.owner.hitbox.radius / 2;
        ring.rotDir = Math.sign((this.rings.length + 1) % 2 - 0.5)
        ring.bullets = [];
        let currColor = this.color;
        let rotOffset = Math.random() * Math.PI * 2;
        for (let i = 0; i < RING_PATTERN_BULLETS; i++) {
            if (i % (RING_PATTERN_COLOR_SEGMENT_LENGTH * (RING_PATTERN_COLOR_SEGMENT_GAP + 1)) == 0) {
                currColor = this.color;
            }
            else if (i % RING_PATTERN_COLOR_SEGMENT_LENGTH == 0) {
                currColor = Colors.GRAY;
            }
            let vec = {x: 0, y: ring.radius};
            vec = vecRotate(vec, ((i / RING_PATTERN_BULLETS) * Math.PI * 2) + rotOffset);
            vec = vecAdd(vec, {x: ring.x, y: ring.y});
            ring.bullets.push(new DuckBullet(this.scene, vec.x, vec.y, currColor, this.damagePlayer));
        }
        return ring;
    }

    spawnRingPattern(delta) {
        if (this.rings.length == 0) {
            this.rings.push(this.createBulletRing());
            this.delay = this.rings[0].bullets[0].hitbox.radius * RING_PATTERN_RING_GAP / (RING_PATTERN_MOVE_SPEED + RING_PATTERN_GROWTH_RATE) * 1000;
            this.spawnClock = 0;
        }
        else if (this.spawnClock >= this.delay) {
            this.rings.push(this.createBulletRing());
            if (this.rings.length == RING_PATTERN_RINGS) this.spawned = true;
            this.spawnClock = this.spawnClock % this.delay;
        }
        this.spawnClock += delta;
    }

    updateRingPattern(delta) {
        for (let ring of this.rings) {
            let xMovement = this.dir.x * RING_PATTERN_MOVE_SPEED * (delta / 1000);
            let yMovement = this.dir.y * RING_PATTERN_MOVE_SPEED * (delta / 1000);
            ring.x += xMovement;
            ring.y += yMovement;
            ring.radius += RING_PATTERN_GROWTH_RATE * (delta / 1000);
            for (let bullet of ring.bullets) {
                // find angle between ring center and bullet
                bullet.modifyPos({x: xMovement , y: yMovement});
                let vec = {x: bullet.x - ring.x, y: bullet.y - ring.y};
                vec = vecNormalize(vec);
                vec = vecScale(vec, ring.radius);
                let rotAngle = Math.min(RING_PATTERN_MAX_ANGULAR_SPEED * (delta / 1000), (RING_PATTERN_ROTATION_SPEED * (delta / 1000)) / ring.radius);
                rotAngle *= ring.rotDir;
                vec = vecRotate(vec, rotAngle);
                vec = vecAdd(vec, {x: ring.x, y: ring.y});

                bullet.setPos(vec);

                if (bullet.doCollisionCheck()) {
                    ring.bullets.splice(ring.bullets.indexOf(bullet), 1);
                    bullet.destroyChildren();
                    bullet.destroy();
                }
            }

            // destroy ring if it's off screen
            let cornerCheckVecs = [];
            cornerCheckVecs.push({x: ring.x, y: ring.y});
            cornerCheckVecs.push({x: ring.x - this.scene.sys.scale.width, y: ring.y});
            cornerCheckVecs.push({x: ring.x, y: ring.y - this.scene.sys.scale.height});
            cornerCheckVecs.push({x: ring.x - this.scene.sys.scale.width, y: ring.y - this.scene.sys.scale.height});
            
            let cornerCheckFlag = true;
            for (let vec of cornerCheckVecs) {
                vec = vecNormalize(vec);
                vec = vecScale(vec, ring.radius * -1);
                vec = vecAdd(vec, {x: ring.x, y: ring.y});
                if ((0 < vec.x && this.scene.sys.scale.width > vec.x) && (0 < vec.y && this.scene.sys.scale.height > vec.y)) {
                    cornerCheckFlag = false;
                }
            }

            if (ring.bullets.length == 0 
                || cornerCheckFlag
                || ring.y > this.scene.sys.scale.height + ring.radius + ring.bullets[0].hitbox.radius) {
                    if (DEBUG) console.log("killing ring");
                    for (let bullet of ring.bullets) {
                        bullet.destroyChildren();
                        bullet.destroy();
                    }
                    ring.bullets = [];
                    this.rings.splice(this.rings.indexOf(ring), 1);
            }
        }
    }

    spawnWallPattern(delta) {

    }

    updateWallPattern(delta) {

    }



    kill() {
        if (DEBUG) console.log("killing " + this.patternName + " attack");
        this.spawnPattern = null;
        this.updatePattern = null;
        this.killed = true;
    }
}