class PlayerBullet extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "player", "worm.png");
        scene.add.existing(this);

        this.scene = scene;

        this.speed = PLAYER_BULLET_SPEED;
        this.velocity = {x: 0, y: -this.speed};
        this.setScale(0.25);
        this.angle = 90;
        this.killed = false;

        this.hitbox = new Phaser.Geom.Rectangle(this.x - this.displayHeight / 2, this.y - this.displayWidth / 2, this.displayHeight, this.displayWidth);
        if(DEBUG) {
            this.debugGraphics = scene.add.graphics();
        }
    }
    update(delta, homingLevel) {
        //Don't do homing checks if at level 0
        if(homingLevel > 0) {
            this.doHoming(delta, homingLevel);
        }

        //Rotate bullet sprite towards direction of motion
        let axis = vecCross({x: this.velocity.x, y: this.velocity.y, z: 0}, {x: 0, y: -1, z: 0});
        let direction = Math.sign(vecDot(axis, {x: 0, y: 0, z: -1}));
        let radToDeg = (radians) => 180 * radians / Math.PI;
        this.angle = 90 + direction * radToDeg(Math.acos(vecDot(vecNormalize(this.velocity), {x: 0, y: -1})));

        //Update position
        this.x += this.velocity.x * delta / 1000;
        this.y += this.velocity.y * delta / 1000;
        //Kill bullet if it goes beyond top bound
        if(this.y + this.displayHeight / 2 <= 0) {
            this.killed = true;
        }

        //Move hitbox
        this.hitbox.setPosition(this.x - this.displayHeight / 2, this.y - this.displayWidth / 2);
        //Draw hitbox
        if(DEBUG) {
            this.debugGraphics.clear();
            this.debugGraphics.lineStyle(1, 0xffffff, 1);
            this.debugGraphics.strokeRectShape(this.hitbox);
            if(this.homingRegion) {
                this.debugGraphics.strokeRectShape(this.homingRegion);
            }
        }
    }
    doHoming(delta, homingLevel) {
        //Define shape of the region to check for ducks to home onto
        let homingRegionHeight = PLAYER_BULLET_BASE_HOMING_REGION_HEIGHT + PLAYER_BULLET_HOMING_REGION_SIZE_PER_LEVEL * homingLevel;
        let homingRegionWidth = PLAYER_BULLET_BASE_HOMING_REGION_WIDTH + PLAYER_BULLET_HOMING_REGION_SIZE_PER_LEVEL * homingLevel;
        let rotationRate = PLAYER_BULLET_ROTATION_RATE + PLAYER_BULLET_HOMING_ANGLE_PER_LEVEL * homingLevel;
        this.homingRegion = new Phaser.Geom.Rectangle(this.x - this.displayHeight / 2 - homingRegionWidth / 2, this.y - this.displayWidth / 2 - homingRegionHeight, homingRegionWidth, homingRegionHeight);
        //"Best-so-far" target
        let target = {
            duck: null,
            vecBulletToDuck: null,
            distance: null
        };
        //Try to find a duck to home onto
        if(!Object.hasOwn(this.scene, "ducks")) return;
        for(let duck of this.scene.ducks) {
            if(duck.active && Phaser.Geom.Intersects.CircleToRectangle(duck.hitbox, this.homingRegion)) {
                let duckPos = {x: duck.x, y: duck.y};
                let bulletPos = {x: this.x, y: this.y};
                let bulletToDuck = vecSubtract(duckPos, bulletPos);
                let currentDistance = vecLength(bulletToDuck);
                //Pick the closest duck to the bullet
                if(target.duck === null || target.distance > currentDistance) {
                    target.duck = duck;
                    target.vecBulletToDuck = bulletToDuck;
                    target.distance = currentDistance;
                }
            }
        }
        //did we find a duck to home onto?
        if(target.duck !== null) {
            //Rotate the bullet towards the duck
            let angleBetween = Math.acos(vecDot(vecNormalize(target.vecBulletToDuck), vecNormalize(this.velocity)));
            let axis = vecCross({x: target.vecBulletToDuck.x, y: target.vecBulletToDuck.y, z: 0}, {x: this.velocity.x, y: this.velocity.y, z: 0});
            let direction = Math.sign(vecDot(axis, {x: 0, y: 0, z: -1}));
            let rotationRate = PLAYER_BULLET_ROTATION_RATE + 5 * angleBetween;
            this.velocity = vecRotate(this.velocity, direction * rotationRate * delta / 1000);
        }

    }
    kill() {
        if(DEBUG) {
            this.debugGraphics.destroy();
        }
        this.destroy();
    }
}