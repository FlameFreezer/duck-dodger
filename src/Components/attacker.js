class Attacker {
    constructor(scene, config) {
        this.scene = scene;
        this.shootDelay = config.shootDelay;
        this.patternDelay = config.patternDelay;
        this.timer = null;
        this.shotIndex = 0;
        this.initPattern(config);
    }

    shoot() {
        //Make the bullets as part of the pattern
        this.makeBullets();

        this.shotIndex++;

        //Assume we just have to wait for the next shot in the pattern
        let timeToShoot = this.shootDelay;
        //If we've reached the end of the pattern, we actually wait until the next pattern
        if(this.shotIndex >= this.shotsPerPattern) {
            this.shotIndex = 0;
            this.timeToShoot = this.patternDelay;
        }

        //Time the next shot
        this.timer = this.scene.time.delayedCall(
            timeToShoot,
            (self) => {
                self.shoot();
            },
            [this]
        );
    }

    activate() {
        this.shoot();
    }

    deactivate() {
        this.timer.remove();
        this.timer = null;
    }

    initPattern(config) {
        switch(config.type) {
            case "ring" : this.ringPattern(config); break;
            case "t-pattern" : this.tPattern(config); break;
        }
    }

    ringPattern(config) {
        this.bulletsPerRing = config.bulletsPerRing;
        this.rotationDirections = config.rotationDirections;
        this.shotsPerPattern = this.rotationDirections.length;
    
        this.makeBullets = () => {
            //TODO: make bullet ring, have it be owned by the scene
        }
    }

    tPattern(config) {
        this.makeBullets = () => {
            //TODO: shoot the number of bullets for this step of the pattern, have them be owned by the scene
        }
    }
}