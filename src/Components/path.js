class Path {
    // usage: 

    // construct this at any time. it will do nothing until you activate it.

    // include this code:
    //
    // path.update(delta)
    //
    // in the owner's update().
    //
    // call activate(owner.x, owner.y) to start/resume path following.
    // call activate(owner.x, owner.y, T ∈ [0, 1)) to start path following from a certain point in the path cycle.
    // call deactivate() to stop path following.



    // owner: parent object.
    // path: string. which path function to use.
    // width: int. width of the path in pixels.
    // height: int. height of the path in pixels.
    // startT: float. where in the path to start. ranges from 0 (start) to 1 (end).
    // T = 0 always represents the leftmost point of a path.
    // loopTime: float. how long it takes to complete a path cycle in milliseconds.
    constructor(owner, path, width, height, startT, loopTime) {
        this.owner = owner;
        this.width = width;
        this.height = height;
        this.loopTime = loopTime;
        this.active = false;
        this.pathName = path;
        this.path = this.pathFromString(path);
        this.getCoords = (delta) => {
            this.currTime = (this.currTime + delta) % this.loopTime;
            return this.path();
        };
        this.currTime = loopTime * startT;
    }



    // ----------INTERFACE FUNCTIONS----------

    // inX: int. current X position of owner.
    // inY: int. current Y position of owner.
    // inT: float. optional starting T value for path following. ranges from 0 (start)
    //         to 1 (end). defaults to the constructed starting T, or wherever it left
    //         off when it was last deactivated.
    activate(inX, inY, inT = -1) {
        let localT = inT;
        if (localT < 0) {
            localT = this.currTime;
        }
        else {
            localT *= this.loopTime;
        }
        this.currTime = localT;
        this.handlePathOffset();
        this.x += inX;
        this.y += inY;
        this.active = true;
    }

    deactivate() {
        this.active = false;
    }

    // delta: int. time since last update() call in milliseconds.
    update(delta) {
        if (this.active) {
            let toPos = this.getCoords(delta);
            this.owner.setPosition(toPos.x, toPos.y);
        }
    }



    // ----------INTERNAL FUNCTIONS----------
    
    pathFromString(inPath) {
        switch(inPath) {
            case "arc":
                return this.arcPath;
            case "circle":
                return this.circlePath;
            case "figure_infinite":
                return this.figureInfinitePath;
            default: // this should never happen
                return;
        }
    }

    handlePathOffset() {
        this.x = 0;
        this.y = 0;
        let currCoords = this.path();
        this.x = currCoords.x * -1;
        this.y = currCoords.y * -1;
    }
    


    // ----------PATH FUNCTIONS----------
    // all path functions must take no arguments.
    // all path functions must return an {x: , y: } object.
    // T = 0 must always represent the leftmost point of a path.
    arcPath() {
        let outX = this.x;
        let outY = this.y;
        let T = this.currTime / this.loopTime * Math.PI * 2;
        outX += Math.cos(T) * this.width * -1;
        outY -= Math.abs(Math.sin(T)) * this.height;
        return {x: outX, y: outY};
    }

    circlePath() {
        let outX = this.x;
        let outY = this.y;
        let T = this.currTime / this.loopTime * Math.PI * 2;
        outX -= Math.cos(T) * this.width;
        outY -= Math.sin(T) * this.height;
        return {x: outX, y: outY};
    }

    figureInfinitePath() {
        let outX = this.x;
        let outY = this.y;
        let T = this.currTime / this.loopTime * Math.PI * 2;
        let offsetT = Math.PI * 1.5;
        outX += Math.sin(T + offsetT) * this.width / 2;
        outY += Math.sin(T + offsetT) * Math.cos(T + offsetT) * this.height;
        return {x: outX, y: outY};
    }
}