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

        this.setScale(0.15);
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

        this.hp = config.hp;
        this.points = config.points;
        this.active = true;

        return this;
    }

    update(delta) {
        for (let component in this.components) {
            this.components[component].update(delta);
        }

        // handle death
        if (this.hp <= 0 || this.components.fleeTween.complete) this.kill();
        if (this.components.deathAnim.complete) {
            for (let component in this.components) {
                this.components[component].deactivate();
            }
            this.destroy();
        }
    }

    flee() {
        for (let component in this.components) {
            this.components[component].deactivate();
        }
        this.components.fleeTween.activate();
    }

    kill() {
        if (!this.active) return;
        this.active = false;

        if (!this.components.fleeTween.complete && !this.components.deathAnim.active) {
            for (let component in this.components) {
                this.components[component].deactivate();
            }
            this.components.deathAnim.activate();
        }
        else if (this.components.fleeTween.complete) {
            for (let component in this.components) {
                this.components[component].deactivate();
            }
            this.destroy();
        }
    }
}