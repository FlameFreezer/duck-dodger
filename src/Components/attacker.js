class Attacker {
    constructor(scene, config) {
        this.scene = scene;

        this.patternDelay = config.patternDelay;
        this.patternTimer = 0;

        this.shotIndex = 0;

        this.active = false;

        this.pattern = config.pattern;
        this.attacks = [];
    }

    // owner: Object. The owner of this component.
    // return: This component.
    registerTo(owner) {
        this.owner = owner;
        return this;
    }
    update(delta) {
        for(let attack of this.attacks) {
            attack.update(delta);
        }
        if(this.patternTimer >= this.patternDelay) {
            this.attacks.push(new Attack(this.scene, this, null, this.pattern));
            this.patternTimer = 0;
        }
        else {
            this.patternTimer += delta;
        }
    }

    activate() {
        this.active = true;
        this.shoot();
    }

    deactivate() {
        this.active = false;
        this.timer.remove();
        this.timer = null;
    }
}