function getDuckSpriteFromType(type) {
    switch(type) {
        case DuckTypes.RUBBER_DUCKY:
            return {base: "duck_yellow.png", onHit: "duck_outline_yellow.png"};
        case DuckTypes.MALLARD:
            return {base: "duck_brown.png", onHit: "duck_outline_brown.png"};
        case DuckTypes.GOOSE:
            throw "Goose hasn't been defined yet!";
        default: // this should never happen
            throw "Duck.getDuckSpriteFromType: Bad duck type " + type + " requested!"
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
        this.scene = scene;

        const NULL_COMPONENT = {active: false};

        this.setScale(DUCK_SCALE);
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

        this.spriteOnHit = scene.add.sprite(this.x, this.y, "ducks", config.spriteOnHit);
        this.spriteOnHit.visible = false;
        this.spriteOnHit.setScale(DUCK_SCALE);
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
        if (this.components.deathAnim.complete) {
            for (let component in this.components) {
                if (this.components[component].active) this.components[component].deactivate();
            }
            this.destroy();
        }

        this.spriteOnHit.setPosition(this.x, this.y);
        this.spriteOnHit.angle = this.angle;
        this.spriteOnHit.flipX = this.flipX;
    }

    canBeDeleted() {
        return (this.components.deathAnim.complete && this.components.attacker.canBeDeleted());
    }

    onHit() {
        this.hp--;
        //Begin kill
        if (this.hp <= 0 && this.active) {
            if(this.onHitTimer) {
                this.onHitTimer.remove();
                this.spriteOnHit.visible = false;
                this.visible = true;
            }
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
        let currentScore = this.scene.registry.get('score');
        this.scene.registry.set('score', currentScore + this.points);
    }
}