class FleeTween {
    constructor(endX = null, endY = null, duration, rotateToPath = false) {
        this.endX = endX;
        this.endY = endY;
        this.startX = null;
        this.startY = null;
        this.duration = duration;
        this.controlsRotation = rotateToPath;
        this.animClock = 0;
        this.active = false;
        this.complete = false;
        return this;
    }

    registerTo(owner) {
        this.owner = owner;
        return this;
    }

    update(delta) {
        if (this.active) {
            this.animClock += delta;
            if (this.animClock >= this.duration && !this.complete) {
                this.owner.setPosition(this.endX, this.endY);
                if (DEBUG) console.log("FleeTween: completed");
                this.complete = true;
                this.deactivate();
            }
            else {
                let t = this.animClock / this.duration;
                let toX = Math.floor(this.startX * (1 - t) + this.endX * t);
                let toY = Math.floor(this.startY * (1 - t) + this.endY * t);
                if (this.controlsRotation && (this.owner.x != toX || this.owner.y != toY)) {
                    let vec = vecSubtract({x: toX, y: toY}, {x: this.owner.x, y: this.owner.y});
                    this.owner.rotation = vecAngle(vec);
                }
                this.owner.setAlpha(0.75);
                this.owner.setPosition(toX, toY);
            }
        }
    }

    activate() {
        if (!this.active) {
            if (this.animClock == 0) {
                this.startX = this.owner.x;
                this.startY = this.owner.y;
            }
            if (this.endX == null) this.endX = this.owner.x;
            if (this.endY == null) this.endY = this.owner.y;
            this.active = true;
        }
    }

    deactivate() {
        if (this.active) {
            this.active = false;
        }
    }
}