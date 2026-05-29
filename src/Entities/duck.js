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
class Duck2 extends Phaser.GameObjects.Sprite {
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

        this.setScale(0.25);

        //Initialize components
        this.pathFollower = config.pathFollower.registerTo(this);
        this.spawnTween = config.spawnTween.registerTo(this);
        this.attacker = config.attacker.registerTo(this);

        this.hp = config.hp;
        this.points = config.points;

        this.spawnTween.completeCallback = () => {
            this.pathFollower.activate(this.x, this.y);
        }
    }
    // ------ INTERFACE METHODS ------

    // delta: float     The amount of time, in miliseconds, since the last frame.
    update(delta) {
        this.updateComponents(delta);
    }
    kill() {
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