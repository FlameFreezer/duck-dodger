class SpawnTween {
    // usage:
    // construct on object creation. it will immediately take control of the
    // owner's position and execute the spawn animation with the desired parameters.
    // check SpawnTween.active (boolean) to see if the spawn tween is running.
    
    // include this code:
    //
    // SpawnTween.update(delta)
    //
    // in the owner's update().



    // owner: parent object.
    // startX: int. X-coordinate of tween start location in pixels.
    // startY: int. Y-coordinate of tween start location in pixels.
    // endX: int. X-coordinate of tween end location in pixels.
    // endY: int. Y-coordinate of tween end location in pixels.
    // duration: int. How long the tween should last in milliseconds.
    // easeStart: float. How far into the tween the easing should kick in.
    //               Ranges from 0 (start immediately) to 1 (don't ease).
    // completeCallback: Function to fire on tween completion.
    constructor(owner, startX, startY, endX, endY, duration, easeStart = 1, completeCallback) {
        this.owner = owner;
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
        this.duration = duration;
        this.easeStart = easeStart;
        this.distance = Math.sqrt(Math.pow(startX - endX, 2) + Math.pow(startY - endY, 2));
        this.currTime = 0;
        this.completeCallback = completeCallback;
        owner.setPosition(startX, startY);
        this.active = true;
    }



    // ----------INTERFACE FUNCTIONS----------

    // delta: int. time since last update() call in milliseconds.
    update(delta) {
        if (this.active) {
            this.currTime += delta;
            if (this.currTime >= this.duration) {
                this.owner.setPosition(this.endX, this.endY);
                this.completeCallback();
                this.active = false;
            }
            else {
                let t = this.getT();
                let toX = Math.floor(this.startX * (1 - t) + this.endX * t);
                let toY = Math.floor(this.startY * (1 - t) + this.endY * t);
                this.owner.setPosition(toX, toY);
                console.log(t, toX, toY);
            }
        }
    }



    // ----------INTERNAL FUNCTIONS----------

    getT() {
        let constPortion = this.duration * this.easeStart;
        let easePortion = this.duration - constPortion;
        if (this.currTime < constPortion) {
            return 2 / ((2 * constPortion) + easePortion) * this.currTime;
        }
        else {
            return 1 - Math.pow(this.duration - this.currTime, 2) / (2 * easePortion * constPortion + Math.pow(easePortion, 2));
        }
    }



    
}