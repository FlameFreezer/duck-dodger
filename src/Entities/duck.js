function getDuckSpriteFromType(type) {
    switch(type) {
        case DuckTypes.RUBBER_DUCKY:
            return {base: "duck_yellow.png", onHit: "duck_outline_yellow.png"};
        case DuckTypes.MALLARD:
            return {base: "duck_brown.png", onHit: "duck_outline_brown.png"};
        case DuckTypes.GOOSE:
            throw "Goose hasn't been defined yet!";
        default: // this should never happen
            throw "Duck.getDuckSpriteFromType: Bad duck type requested!"
    }
}
class Duck extends Phaser.GameObjects.Sprite {
    // scene: Phaser.Scene  The scene where this duck will live.
    // config: Object with all of the following fields:
    //    sprite: string            The spritesheet frame the duck should use for display. 
    //    pathFollower: Path        An unregistered Path component.
    //    spawnTween: SpawnTween    An unregistered SpawnTween component.
    //    attacker:   Attacker      An unregistered Attacker component.
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
        this.components.deathAnim = new DeathAnimator().registerTo(this);

        this.hp = config.hp;
        this.points = config.points;
        this.active = true;

        this.hitbox = new Phaser.Geom.Circle(this.x, this.y, this.displayWidth / 2);
        if(DEBUG) {
            this.debugGraphics = scene.add.graphics();
        }

    }
    // ------ INTERFACE METHODS ------

    // delta: float. The amount of time, in miliseconds, since the last frame.
    update(delta) {
        for (let component in this.components) {
            this.components[component].update(delta);
        }

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
        if (this.components.deathAnim.complete) {
            for (let component in this.components) {
                this.components[component].deactivate();
            }
            this.destroy();
        }
    }

    canBeDeleted() {
        return (!this.active && this.components.attacker.canBeDeleted());
    }

    // ------ INTERNAL METHODS -----

    kill() {
        if(DEBUG) {
            this.debugGraphics.destroy();
        }

        this.active = false;

        if (!this.components.deathAnim.active) {
            for (let component in this.components) {
                this.components[component].deactivate();
            }
            this.components.deathAnim.activate();
        }
    }
}