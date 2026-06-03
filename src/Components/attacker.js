class Attacker {
    // config fields:
    //     patternDelay: int. delay between the end of an attack spawn cycle
    //                   and the start of the next attack spawn cycle, in ms.
    // 
    //     pattern: string. name of the attack pattern to use.
    constructor(scene, pattern, patternDelay) {
        this.scene = scene;

        this.patternDelay = patternDelay;
        this.patternTimer = 0;

        this.shotIndex = 0;

        this.active = false;

        this.pattern = pattern;
        this.attacks = [];
        this.deleteList = [];
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
            if(attack.killed) {
                this.deleteList.push(attack);
            }
        }
        if (this.active) {
            if(this.patternTimer >= this.patternDelay) {
                this.shoot();
            }
            else if (this.attacks.length == 0 || this.attacks[this.attacks.length - 1].spawned){
                this.patternTimer += delta;
            }
        }
        this.flushDeleteList();
    }

    activate() {
        this.active = true;
        if (this.patternTimer == 0) this.shoot();
    }

    deactivate() {
        this.active = false;
    }

    canBeDeleted() {
        return (!this.active && this.attacks.length == 0);
    }

    // ------ INTERNAL FUNCTIONS ------
    shoot() {
        this.attacks.push(new Attack(this.scene, this.owner, this.pattern));
        this.patternTimer = this.patternTimer % this.patternDelay;
    }

    flushDeleteList() {
        this.attacks = this.attacks.filter((attack) => {
            if(!this.deleteList.includes(attack)) {
                return attack;
            }
        });
        this.deleteList = [];
    }
}