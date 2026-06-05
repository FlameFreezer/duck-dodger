class DuckBullet extends Phaser.GameObjects.Image {
    constructor(scene, x, y, color) {
        switch(color) {
            case Colors.YELLOW:
                super(scene, x, y, "duck_yellow");
                break;
            case Colors.GREEN:
                super(scene, x, y, "duck_green");
                break;
            default:
                super(scene, x, y, "duck_back");
                break;
        }
        this.color = color;
        this.setScale(0.25);

        this.hitbox = new Phaser.Geom.Circle(this.x, this.y, this.displayHeight / 2);
        this.player = scene.player;
        
        if (DEBUG) this.debugGraphics = scene.add.graphics();

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
            //Only dispatch the hit event if the player isn't invulnerable
            if(!this.player.isInvulnerable) {
                let hitEvent = new Event("duckBulletHit");
                document.dispatchEvent(hitEvent);
            }
            return true;
        }
        return false;
    }

    destroyChildren() {
        if (DEBUG) {
            this.debugGraphics.destroy();
        }
        this.hitbox = null;
    }
}