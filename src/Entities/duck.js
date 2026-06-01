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
    //      sprite: string          The spritesheet frame the duck should use for display. 
    //      pathFollower: Path      An unregistered Path component.
    //      spawnTween: SpawnTween  An unregistered SpawnTween component.
    //      attacker:   Attacker    An unregistered Attacker component.
    //      hp: int                 The amount of HP the duck will have.
    //      points: int             The amount of points the duck will reward on death.
    constructor(scene, config) {
        super(scene, 0, 0, "ducks", config.sprite);
        scene.add.existing(this);

        const NULL_COMPONENT = {active: false};

        this.setScale(0.45);
        this.pathFollower = NULL_COMPONENT;
        this.attacker = NULL_COMPONENT;
        this.spawnTween = NULL_COMPONENT;

        //Initialize components
        if(config.pathFollower) {
            this.pathFollower = config.pathFollower.registerTo(this);
        }
        if(config.attacker) {
            this.attacker = config.attacker.registerTo(this);
        }
        if(config.spawnTween) {
            this.spawnTween = config.spawnTween.registerTo(this);
            if(this.pathFollower) {
                this.spawnTween.completeCallback = () => {
                    if (Object.hasOwn(this, "pathFollower")) {
                        if (DEBUG) console.log("Duck: activating pathFollower");
                        this.pathFollower.activate(this.x, this.y);
                    }
                    if (Object.hasOwn(this, "attacker")) {
                        if (DEBUG) console.log("Duck: activating attacker");
                        this.attacker.activate();
                    }
                }
            }
        }

        this.hp = config.hp;
        this.points = config.points;

        this.hitbox = new Phaser.Geom.Circle(this.x, this.y, this.displayWidth / 2);
        if(DEBUG) {
            this.debugGraphics = scene.add.graphics();
        }

    }
    // ------ INTERFACE METHODS ------

    // delta: float     The amount of time, in miliseconds, since the last frame.
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

    }
    kill() {
        if(DEBUG) {
            this.debugGraphics.destroy();
        }
        this.spawnTween.active = false;
        this.pathFollower.deactivate();
        this.attacker.deactivate();
        this.destroy();
    }

    // ------ INTERNAL METHODS -----

    updateComponents(delta) {
        if(this.spawnTween.active) {
            this.spawnTween.update(delta);
        }
        if(this.pathFollower.active) {
            this.pathFollower.update(delta);
        }
        if(this.attacker.active) {
            this.attacker.update(delta);
        }
    }
}