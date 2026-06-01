class Attack {
    constructor(scene, parentDuck, pattern) {
        this.scene = scene;
        this.parentDuck = parentDuck;

        this.x = parentDuck.x;
        this.y = parentDuck.y;

        this.targetX = scene.player.x;
        this.targetY = scene.player.y;

        // TODO: replace this with a different way of defining attack color, pending a design decision.
        this.color = Number(scene.player.activeColor != Colors.GREEN); // opposite color of player

        this.spawned = false;
        this.killed = false;

        this.spawnPattern = 0;
        this.updatePattern = 0;
        this.dir = 0;

        this.setPatternFromString(pattern);
        if (DEBUG) this.patternName = pattern;
    }



    // this should be called by the parent Attacker object every frame.
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



    // ------ INTERNAL FUNCTIONS ------
    setPatternFromString(pattern) {
        switch(pattern) {
            case "t-pattern":
                this.spawnPattern = this.spawnTPattern;
                this.updatePattern = this.updateTPattern;

                this.dir = {x: this.targetX - this.x, y: this.targetY - this.y};
                this.dir = vecNormalize(this.dir);

                let spawnOffset = vecScale(this.dir, this.parentDuck.hitbox.radius);
                this.x += spawnOffset.x;
                this.y += spawnOffset.y;

                this.doKill = () => {return this.spawned && this.bullets.length == 0;};

                this.bullets = [];
                this.dirs = [];

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
                this.spawnIndex = 0;

                this.dir = {x: this.targetX - this.x, y: this.targetY - this.y};
                this.dir = vecNormalize(this.dir);

                this.lifeClock = 0;
                this.doKill = () => {return this.lifeClock >= WALL_PATTERN_LIFETIME || (this.spawned && this.walls.length == 0)};

                this.walls = [];
                this.wallGeoms = [];
                this.wallDirs = [];

                break;
            default: // this should never happen
                return;
        }
    }

    kill() {
        if (DEBUG) console.log("killing " + this.patternName + " attack");
        this.spawnPattern = null;
        this.updatePattern = null;
        this.killed = true;
    }



    // ------ T PATTERN INTERNALS ------
    spawnTPattern(delta) {
        if (this.bullets.length == 0) {
            this.bullets.push(new DuckBullet(this.scene, this.x, this.y, Colors.GRAY));
            this.dirs.push(this.dir);
            this.delay = (this.bullets[0].hitbox.radius * T_PATTERN_BULLET_GAP / T_PATTERN_MOVE_SPEED) * 1000;
            this.spawnClock = 0;
        }
        else if (this.spawnClock >= this.delay) {
            this.targetX = this.scene.player.x;
            this.targetY = this.scene.player.y;

            this.dir = {x: this.targetX - this.x, y: this.targetY - this.y};
            this.dir = vecNormalize(this.dir);

            let spawnOffset = vecScale(this.dir, this.parentDuck.hitbox.radius);
            this.x = this.parentDuck.x;
            this.y = this.parentDuck.y;
            this.x += spawnOffset.x;
            this.y += spawnOffset.y;

            this.bullets.push(new DuckBullet(this.scene, this.x, this.y, Colors.GRAY));
            this.dirs.push(this.dir);
            if (this.bullets.length > 2) {
                let leftTOffset = vecRotate(vecScale(this.dir, this.bullets[0].hitbox.radius * T_PATTERN_BULLET_GAP), Math.PI / -2);
                let rightTOffset = vecRotate(vecScale(this.dir, this.bullets[0].hitbox.radius * T_PATTERN_BULLET_GAP), Math.PI / 2);
                this.bullets.push(new DuckBullet(this.scene, this.x + leftTOffset.x, this.y + leftTOffset.y, this.color));
                this.dirs.push(vecRotate(this.dir, Math.PI / -36));
                this.bullets.push(new DuckBullet(this.scene, this.x + rightTOffset.x, this.y + rightTOffset.y, this.color));
                this.dirs.push(vecRotate(this.dir, Math.PI / 36));
                this.spawned = true;
            }
            this.spawnClock = this.spawnClock % this.delay;
        }
        this.spawnClock += delta;
    }

    updateTPattern(delta) {
        for (let bullet of this.bullets) {
            let vec = vecScale(this.dirs[this.bullets.indexOf(bullet)], T_PATTERN_MOVE_SPEED * (delta / 1000));
            bullet.modifyPos(vec);
            if (bullet.doCollisionCheck()) {
                this.dirs.splice(this.bullets.indexOf(bullet), 1);
                this.bullets.splice(this.bullets.indexOf(bullet), 1);
                bullet.destroyChildren();
                bullet.destroy();
            }

            // destroy bullet if it's off screen
            else if (bullet.x < bullet.radius * -1 
                || bullet.x > this.scene.sys.scale.width + bullet.hitbox.radius
                || bullet.y < bullet.radius * -1
                || bullet.y > this.scene.sys.scale.height + bullet.hitbox.radius) {
                    this.dirs.splice(this.bullets.indexOf(bullet), 1);
                    this.bullets.splice(this.bullets.indexOf(bullet), 1);
                    bullet.destroyChildren();
                    bullet.destroy();
            }
        }
    }



    // ------ BULLET RING INTERNALS ------
    createBulletRing() {
        let ring = {};
        ring.x = this.x;
        ring.y = this.y;
        ring.radius = this.parentDuck.hitbox.radius / 2;
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
            ring.bullets.push(new DuckBullet(this.scene, vec.x, vec.y, currColor));
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



    // ------ WALL PATTERN INTERNALS ------


    getWallDirs() {
        let dirs = [];
        for (let i = 0; i < WALL_PATTERN_WALLS; i++) {
            let wallDir = vecRotate(this.dir, i / WALL_PATTERN_WALLS * Math.PI * 2);
            wallDir = vecScale(wallDir, 100);
            let wallVec = {x: this.x, y: this.y};
            while (vecInCameraBounds(this.scene, wallVec)) {
                wallVec = vecAdd(wallVec, wallDir);
            }
            dirs.push(wallVec);
        }
        return dirs;
    }

    spawnWallPattern(delta) {
        // runs on the first frame. initializes warning graphics and geoms.
        if (this.walls.length == 0 && this.wallGeoms.length == 0) {
            this.wallWarningGraphics = this.scene.add.graphics();
            this.spawnClock = 0;
            this.delay = WALL_PATTERN_WARNING_TIME;
            this.wallDirs = this.getWallDirs();
            for (let dir of this.wallDirs) {
                this.wallGeoms.push(new Phaser.Geom.Line(this.x, this.y, dir.x, dir.y));
            }
        }
        // runs for the rest of the warning cycle. controls warning graphics, then preps to spawn walls.
        else if (this.walls.length == 0) {
            this.wallWarningGraphics.clear();
            this.wallWarningGraphics.lineStyle(Math.cos(this.spawnClock / (this.delay / 3) * Math.PI * 2) * -1 + 1, Phaser.Display.Color.HSVToRGB(0, 0.75 * (this.spawnClock >= (this.delay * 2 / 3)), 1).color, 1);

            this.x = this.parentDuck.x;
            this.y = this.parentDuck.y;
            if (this.spawnClock < this.delay * 2 / 3) {
                this.targetX = this.scene.player.x;
                this.targetY = this.scene.player.y;
                this.dir = {x: this.targetX - this.x, y: this.targetY - this.y};
                this.dir = vecNormalize(this.dir);
            }
            this.wallDirs = this.getWallDirs();
            this.wallGeoms = [];
            for (let dir of this.wallDirs) {
                this.wallGeoms.push(new Phaser.Geom.Line(this.x, this.y, dir.x, dir.y));
                dir = vecNormalize(dir);
            }
            for (let line of this.wallGeoms) {
                this.wallWarningGraphics.strokeLineShape(line);
            }
            if (this.spawnClock > this.delay) {
                this.wallWarningGraphics.clear();
                this.wallWarningGraphics.destroy();
                for (let i = 0; i < WALL_PATTERN_WALLS; i++) {
                    this.walls.push([]);
                }
            }
        }
        // runs for the wall spawning cycle.
        else if (!this.spawned) {
            // the bullet in the very center of the pattern is owned by walls[0], and is used as a reference for bullet spacing.
            if (this.walls[0].length == 0) {
                this.walls[0].push(new DuckBullet(this.scene, this.x, this.y, Colors.GRAY));

                this.spawnClock = 0;
                this.spawnIndex++;

                let length = Phaser.Geom.Line.Length(this.wallGeoms[0]);
                for (let geom of this.wallGeoms) {
                    if (Phaser.Geom.Line.Length(geom) > length) length = Phaser.Geom.Line.Length(geom);
                }
                this.delay = WALL_PATTERN_EXTEND_TIME / (length / (this.walls[0][0].hitbox.radius * WALL_PATTERN_BULLET_GAP));
            }
            else if (this.spawnClock > this.delay) {
                for (let wall of this.walls) {
                    if (this.wallGeoms[this.walls.indexOf(wall)] != null) {
                        let radius = this.walls[0][0].hitbox.radius;

                        let currGeom = this.wallGeoms[this.walls.indexOf(wall)];
                        let vec = {x: currGeom.x2 - currGeom.x1, y: currGeom.y2 - currGeom.y1};

                        vec = vecNormalize(vec);
                        vec = vecScale(vec, radius);

                        let scalar = this.spawnIndex * WALL_PATTERN_BULLET_GAP;
                        vec = vecScale(vec, scalar);

                        vec = vecAdd(vec, {x: this.x, y: this.y});

                        let currColor = Colors.GRAY;
                        if ((scalar / WALL_PATTERN_BULLET_GAP) % (WALL_PATTERN_HOLE_WIDTH + WALL_PATTERN_HOLE_SPACING) >= WALL_PATTERN_HOLE_SPACING) currColor = this.color;
                        
                        if (vecInCameraBounds(this.scene, vec, this.walls[0][0].hitbox.radius * -1)) {
                                wall.push(new DuckBullet(this.scene, vec.x, vec.y, currColor));
                        }
                        else if (Object.hasOwn(this.wallGeoms[this.walls.indexOf(wall)], "x1")){ // mark wall as completed
                            let currGeom = this.wallGeoms[this.walls.indexOf(wall)];
                            let vec = {x: currGeom.x2 - currGeom.x1, y: currGeom.y2 - currGeom.y1};
                            vec = vecNormalize(vec);
                            vec = vecRotate(vec, Math.PI / 2);
                            console.log("vec: " + vec.x + " " + vec.y);
                            this.wallGeoms[this.walls.indexOf(wall)] = vec;
                        }
                    }
                }
                this.spawnIndex++;

                let doneFlag = true;
                for(let geom of this.wallGeoms) {
                    if (Object.hasOwn(geom, "x1")) {
                        doneFlag = false;
                        break;
                    }
                }

                if (doneFlag) {
                    this.spawned = true;
                    if (DEBUG) console.log("wall pattern done spawning");
                }

                this.spawnClock = this.spawnClock % this.delay;
            }
        }
        this.spawnClock += delta;
    }

    updateWallPattern(delta) {
        // TODO: maybe add a little idle animation to the wall bullets so they're not totally static
        this.lifeClock += delta;
        for (let wall of this.walls) {
            for (let bullet of wall) {
                bullet.setPos({x: bullet.x, y: bullet.y});
                if (bullet.doCollisionCheck()) {
                    bullet.destroyChildren();
                    bullet.destroy();
                    wall.splice(wall.indexOf(bullet), 1);
                }
            }
            if (this.spawned && wall.length == 0) {
                this.walls.splice(this.walls.indexOf(wall), 1);
            }
        }
        if (this.doKill()) {
            for (let wall of this.walls) {
                for (let bullet of wall) {
                    bullet.destroyChildren();
                    bullet.destroy();
                }
                wall.bullets = [];
            }
            this.walls = [];
        }
    }
}