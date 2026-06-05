class Bread extends Phaser.GameObjects.Image {
    // scene: Phaser.Scene  The scene where this bread will live.
    // config: Object with all of the following fields:
    //    pathFollower: Path        An unregistered Path component.
    //    spawnTween: SpawnTween    An unregistered SpawnTween component.
    //    hp: int                   The amount of HP the bread will have.
    //    points: int               The amount of points the bread will reward on death.
    constructor(scene, config) {
        super(scene, 0, 0, "bread");
        scene.add.existing(this);
        this.scene = scene;

        this.setScale(BREAD_SCALE);
        this.components = {};

        // initialize components
        if (config.pathFollower) {
            this.components.pathFollower = config.pathFollower.registerTo(this);
        }
        if (config.spawnTween) {
            this.components.spawnTween = config.spawnTween.registerTo(this);
            this.components.spawnTween.completeCallback = () => {
                if (Object.hasOwn(this.components, "pathFollower")) {
                    if (DEBUG) console.log("Bread: activating pathFollower");
                    this.components.pathFollower.activate(this.x, this.y);
                }
            }
        }
        this.components.deathAnim = new DeathAnimator().registerTo(this);
        this.components.fleeTween = new FleeTween(null, this.displayHeight * -2, 1000, true).registerTo(this);

        this.hitbox = new Phaser.Geom.Circle(this.x, this.y, this.displayWidth / 2 * 0.9);
        if (DEBUG) {
            this.debugGraphics = scene.add.graphics();
            this.debugGraphics.lineStyle(1, 0xffffff, 1);
            this.debugGraphics.strokeCircleShape(this.hitbox);
        }

        this.hp = config.hp;
        this.points = config.points;
        this.active = true;

        this.spriteOnHit = scene.add.image(this.x, this.y, "breadHit");
        this.spriteOnHit.visible = false;
        this.spriteOnHit.setScale(BREAD_SCALE);

        this.hittable = true;

        return this;
    }

    update(delta) {
        for (let component in this.components) {
            this.components[component].update(delta);
        }

        this.hitbox.setPosition(this.x, this.y);
        if (DEBUG) {
            this.debugGraphics.clear();
            this.debugGraphics.lineStyle(1, 0xffffff, 1);
            this.debugGraphics.strokeCircleShape(this.hitbox);
        }

        // handle death
        if (this.components.deathAnim.complete) {
            for (let component in this.components) {
                this.components[component].deactivate();
            }
            this.destroy();
        }

        this.spriteOnHit.setPosition(this.x, this.y);
        this.spriteOnHit.angle = this.angle;
        this.spriteOnHit.flipX = this.flipX;
    }

    onHit() {
        this.hp--;
        if (this.hp <= 0 || this.components.fleeTween.complete) {
            if(this.onHitTimer) this.onHitTimer.remove();
            this.kill();
            return;
        }
        this.spriteOnHit.visible = true;
        this.visible = false;
        this.onHitTimer = this.scene.time.delayedCall(
            ENEMY_HIT_SPRITE_TIME,
            (self) => {
                self.spriteOnHit.visible = false;
                self.visible = true;
            },
            [this]
        );
        this.scene.duckHitSfx.play();
    }

    flee() {
        for (let component in this.components) {
            this.components[component].deactivate();
        }
        this.components.fleeTween.activate();
        this.spriteOnHit.visible = false;
        this.visible = true;
        this.hittable = false;
    }

    kill() {
        if (!this.active) return;
        this.active = false;
        if (DEBUG) {
            this.debugGraphics.clear();
            this.debugGraphics.destroy();
        }

        if (!this.components.fleeTween.complete && !this.components.deathAnim.active) {
            this.spriteOnHit.visible = false;
            this.visible = true;
            for (let component in this.components) {
                this.components[component].deactivate();
            }
            this.components.deathAnim.activate();
            this.scene.addScore(this.points);
            if(!this.scene.healthUpSfx.isPlaying) {
                this.scene.breadSfx.play();
            }
        }
        else if (this.components.fleeTween.complete) {
            for (let component in this.components) {
                this.components[component].deactivate();
            }
            this.spriteOnHit.destroy();
            this.destroy();
            return;
        }
    }

    canBeDeleted() {
        return (this.components.fleeTween.complete || this.components.deathAnim.complete);
    }
}