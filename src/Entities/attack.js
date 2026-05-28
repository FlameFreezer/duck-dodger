class Attack {
    constructor(scene, owner, player, pattern) { // TODO: update constructor parameters and add registerTo function
        this.scene = scene;
        this.owner = owner;

        this.damagePlayer = player.onHit;

        this.x = owner.x;
        this.y = owner.y;

        this.targetX = player.x;
        this.targetY = player.y;

        this.color = Number(player.activeColor != scene.colors.GREEN); // opposite color of player

        this.spawned = false;
        this.delay = 0;
        this.spawnClock = 0;

        this.bullets = [];

        this.spawnPattern = 0;
        this.updatePattern = 0;
        this.dir = 0;

        this.setPatternFromString(pattern);

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
                this.doKill = () => {};
                break;
            case "ring":
                this.spawnPattern = this.spawnRingPattern;
                this.updatePattern = this.updateRingPattern;
                this.dir = {x: 0, y: 1};
                this.doKill = () => {};
                break;
            case "wall":
                this.spawnPattern = this.spawnWallPattern;
                this.updatePattern = this.updateWallPattern;
                this.dir = {x: this.targetX - this.x, y: this.targetY - this.y};
                this.dir = vecNormalize(this.dir);
                this.doKill = () => {};
                break;
            default: // this should never happen
                return;
        }
    }

    update(delta) {
        if (!this.spawned) {
            this.spawnPattern(this.dir, delta);
        }

        this.updatePattern(delta);

        if (this.doKill()) {
            this.kill();
        }
    }

    spawnTPattern(dir, delta) {
        if (this.bullets.length == 0) {
            this.bullets.push(new DuckBullet(this.scene, this.x, this.y, this.scene.colors.GRAY, this.damagePlayer));
            this.delay = this.bullets[0].hitbox.radius * 4 / T_PATTERN_MOVE_SPEED * 1000;
            this.spawnClock = 0;
        }
        else if (this.spawnClock >= this.delay) {
            this.bullets.push(new DuckBullet(this.scene, this.x, this.y, this.scene.colors.GRAY, this.damagePlayer, true));
            if (this.bullets.length > 2) {
                let leftTOffset = vecRotate(vecScale(this.dir, this.bullets[0].hitbox.radius * 4), Math.PI / 2);
                let rightTOffset = vecRotate(vecScale(this.dir, this.bullets[0].hitbox.radius * 4), Math.PI / -2);
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
            bullet.modifyPosition(vec);
            bullet.doCollisionCheck();
        }
    }

    spawnRingPattern(dir, delta) {

    }

    updateRingPattern(delta) {

    }

    spawnWallPattern(dir, delta) {

    }

    updateWallPattern(delta) {

    }



    kill() {
        for (let bullet of this.bullets) {
            bullet.kill();
        }
        this.spawnPattern = null;
        this.updatePattern = null;
    }
}