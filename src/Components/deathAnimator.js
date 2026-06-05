class DeathAnimator {
    constructor() {
        this.active = false;
        this.complete = false;
        this.animClock = 0;
    }

    registerTo(owner) {
        this.owner = owner;
        return this;
    }

    update(delta) {
        if (this.animClock >= DEATH_ANIM_TIME) {
            this.owner.setScale(0);
            this.complete = true;
            this.deactivate();
        }
        else if (this.active) {
            let xFactor = this.animClock / DEATH_ANIM_TIME * (Math.sqrt(0.75) + 0.5)
            let toScale = (-2 * Math.pow(xFactor - 0.5, 2) + 1.5) * this.baseScale;
            this.owner.setScale(toScale);
            this.animClock += delta;
        }
    }

    activate() {
        this.active = true;
        this.baseScale = this.owner.scale;
        this.animClock = 0;
    }

    deactivate() {
        this.active = false;
    }
}