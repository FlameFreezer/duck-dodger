class Attack {
    constructor(scene, owner, player, pattern, patternGap) {
        this.scene = scene;

        this.player = player;

        this.spawnPattern = patternFromString(pattern).spawn;
        this.updatePattern = patternFromString(pattern).update;

        this.dir = {x: player.x - owner.x, y: player.y - owner.y};
        this.dir = vecNormalize(this.dir);

        this.x = owner.x;
        this.y = owner.y;

        this.spawned = false;
        this.delay = patternGap;
        this.currTime = patternGap;

        this.bullets = [];
        this.spawnPattern();
    }

    patternFromString(pattern) {
        let to_ret = {spawn: 0, update: 0};
        switch(pattern) {
            case "t-pattern":
                to_ret.spawn = this.spawnTPattern;
                to_ret.update = this.updateTPattern;
                return to_ret;
            case "ring":
                to_ret.spawn = this.spawnRingPattern;
                to_ret.update = this.updateRingPattern;
                return to_ret;
            case "wall":
                to_ret.spawn = this.spawnWallPattern;
                to_ret.update = this.updateWallPattern;
                return to_ret;
            default: // this should never happen
                return;
        }
    }

    update(delta) {
        if (!this.spawned) {
            this.spawnPattern(this.dir, delta);
        }
        this.updatePattern(delta);
    }

    spawnTPattern(dir, delta) {
        if (this.currTime >= this.delay) {
            this.bullets.push(new DuckBullet(this.scene, this.x, this.y, this.scene.colors.GRAY, this.player.onHit, true));
            if (this.bullets.length > 2) {
                this.bullets.push(new DuckBullet(this.scene, this.x, this.y, this.player.activeColor != this.scene.colors.GREEN, this.player.onHit, true));
                this.spawned = true;
            }
        }

    }

    updateTPattern(delta) {
        let vec = vecScale(this.dir, 400 * (delta / 1000));
        for (let bullet of this.bullets) {
            bullet.modifyPosition(vec);
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

    }
}