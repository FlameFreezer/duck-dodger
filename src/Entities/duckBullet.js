class DuckBullet extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, color, hurtPlayerCallback = null) {
        switch(color) {
            case Colors.YELLOW:
                super(scene, x, y, "ducks", "duck_yellow.png");
                break;
            case Colors.GREEN:
                super(scene, x, y, "ducks", "duck_brown.png");
                break;
            default:
                super(scene, x, y, "ducks", "duck_back.png");
                break;
        }
        this.color = color;
        this.setScale(0.25);

        this.hitbox = new Phaser.Geom.Circle(this.x, this.y, this.displayHeight / 2);
        
        if (DEBUG) this.debugGraphics = scene.add.graphics();

        if (scene.player) this.player = scene.player;
        if (hurtPlayerCallback) this.hurtPlayerCallback = hurtPlayerCallback;

        scene.add.existing(this);
        return this;
    }

    setPos(vec) {
        this.x = vec.x;
        this.y = vec.y;
        this.hitbox.setPosition(this.x, this.y);
        if (DEBUG) {
            this.debugGraphics.clear();
            this.debugGraphics.lineStyle(1, 0xffffff, 1);
            this.debugGraphics.strokeCircleShape(this.hitbox);
        }
    }

    modifyPos(vec) {
        this.x += vec.x;
        this.y += vec.y;
        this.hitbox.setPosition(this.x, this.y);
        if (DEBUG) {
            this.debugGraphics.clear();
            this.debugGraphics.lineStyle(1, 0xffffff, 1);
            this.debugGraphics.strokeCircleShape(this.hitbox);
        }
    }
    
    doCollisionCheck() {
        if (this.color != this.player.activeColor && Phaser.Geom.Intersects.CircleToCircle(this.hitbox, this.player.hitbox)) {
            this.hurtPlayerCallback();
            return true;
        }
        return false;
    }

    destroyChildren() {
        if (DEBUG) {
            this.debugGraphics.clear();
            this.debugGraphics.destroy();
        }
        this.hitbox = null;
    }
}