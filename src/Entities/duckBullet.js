class duckBullet extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, color, hurtPlayerCallback = null, debug = false) {
        switch(color) {
            case scene.colors.YELLOW:
                super(scene, x, y, "ducks", "duck_yellow.png");
                break;
            case scene.colors.GREEN:
                super(scene, x, y, "ducks", "duck_brown.png");
                break;
            default:
                super(scene, x, y, "ducks", "duck_back.png")
        }
        this.color = color;
        this.setScale(0.25);

        this.hitbox = new Phaser.Geom.Circle(this.x, this.y, this.displayHeight / 2);
        
        this.debug = debug;
        if (debug) this.debugGraphics = scene.add.graphics();

        if (scene.player) this.player = scene.player;
        if (hurtPlayerCallback) this.hurtPlayerCallback = hurtPlayerCallback;

        scene.add.existing(this);
        return this;
    }

    moveTo(x, y) {
        this.x = x;
        this.y = y;
        this.hitbox.setPosition(this.x, this.y);
        if (this.debug) {
            this.debugGraphics.clear();
            this.debugGraphics.lineStyle(1, 0xffffff, 1);
            this.debugGraphics.strokeCircleShape(this.hitbox);
        }
    }
    
    doCollisionCheck() { // needs to be tested with the refactored Player object
        if (this.color == this.player.activeColor && Phaser.Geom.Intersects.CircleToCircle(this.hitbox, player.hitbox)) {
            this.hurtPlayerCallback();
            this.kill();
            return true;
        }
        return false;
    }

    kill() {
        if (this.debug) {
            this.debugGraphics.clear();
            this.debugGraphics.destroy();
        }
        this.destroy();
    }
}