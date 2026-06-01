function getDuckSpriteFromType(type) {
    switch(type) {
        case DuckTypes.RUBBER_DUCKY:
            return "duck_yellow.png";
        case DuckTypes.MALLARD:
            return "duck_brown.png";
        case DuckTypes.GOOSE:
            throw "Goose hasn't been defined yet!";
    }
}
class Duck extends Phaser.GameObjects.Sprite {
    // scene: Phaser.Scene  The scene where this duck will live.
    // config: Object with all of the following fields:
    //    sprite: string            The spritesheet frame the duck should use for display. 
    //    pathFollower: Path        An unregistered Path component.
    //    spawnTween: SpawnTween    An unregistered SpawnTween component.
    //    attacker:   Attacker      An unregistered Attacker component.
    //    deathAnim: DeathAnimator  An unregistered DeathAnimator component.
    //    hp: int                   The amount of HP the duck will have.
    //    points: int               The amount of points the duck will reward on death.
    constructor(scene, config) {
        super(scene, 0, 0, "ducks", config.sprite);
        scene.add.existing(this);

        const NULL_COMPONENT = {active: false};

        this.setScale(0.45);
        this.pathFollower = NULL_COMPONENT;
        this.attacker = NULL_COMPONENT;
        this.spawnTween = NULL_COMPONENT;
        this.components = {};

        //Initialize components
        if(config.pathFollower) {
            this.components.pathFollower = (config.pathFollower.registerTo(this));
        }
        if(config.attacker) {
            this.components.attacker = (config.attacker.registerTo(this));
        }
        if(config.spawnTween) {
            this.components.spawnTween = (config.spawnTween.registerTo(this));
            if(this.components.pathFollower) {
                this.components.spawnTween.completeCallback = () => {
                    if (Object.hasOwn(this.components, "pathFollower")) {
                        if (DEBUG) console.log("Duck: activating pathFollower");
                        this.components.pathFollower.activate(this.x, this.y);
                    }
                    if (Object.hasOwn(this.components, "attacker")) {
                        if (DEBUG) console.log("Duck: activating attacker");
                        this.components.attacker.activate();
                    }
                }
            }
        }
        if (config.deathAnim) {
            this.components.deathAnim = config.deathAnim.registerTo(this);
        }

        this.hp = config.hp;
        this.points = config.points;

        this.hitbox = new Phaser.Geom.Circle(this.x, this.y, this.displayWidth / 2);
        if(DEBUG) {
            this.debugGraphics = scene.add.graphics();
        }

    }
    // ------ INTERFACE METHODS ------

    // delta: float. The amount of time, in miliseconds, since the last frame.
    update(delta) {
        this.updateComponents(delta);

        //Move hitbox
        this.hitbox.setPosition(this.x, this.y);
        //Draw hitbox
        if(DEBUG) {
            this.debugGraphics.clear();
            this.debugGraphics.lineStyle(1, 0xffffff, 1);
            this.debugGraphics.strokeCircleShape(this.hitbox);
        }

        // handle death
        if (this.hp <= 0) this.kill();
        if (Object.hasOwn(this.components, "deathAnim") && this.components.deathAnim.complete) {
            for (let component in this.components) {
                this.components[component].deactivate();
            }
            this.destroy();
        }
    }

    // ------ INTERNAL METHODS -----

    kill() {
        if(DEBUG) {
            this.debugGraphics.destroy();
        }

        if (Object.hasOwn(this.components, "deathAnim") && !this.components.deathAnim.active) {
            for (let component in this.components) {
                this.components[component].deactivate();
            }
            this.components.deathAnim.activate();
        }
        else if (!Object.hasOwn(this.components, "deathAnim")) {
            for (let component in this.components) {
                this.components[component].deactivate();
            }
            this.destroy();
        }
    }

    updateComponents(delta) {
        for (let component in this.components) {
            if (this.components[component].active) this.components[component].update(delta);
        }
    }
}