class Wave {
    constructor(scene, json) {
        this.scene = scene;
        this.spawns = [];
        this.activeDucks = {
            RubberDucky: [],
            Mallard: []
        };
        this.activeRubberDuckies = [];
        this.activeMallards = [];
        this.duckData = json.duckData;
        for(let i = 0; i < json.rubberDuckyPositions.length / 2; i++) {
            this.spawns.push(new Spawn("RubberDucky", json.rubberDuckyPositions[i * 2], json.rubberDuckyPositions[i * 2 + 1]));
        }
        for(let i = 0; i < json.mallardPositions.length / 2; i++) {
            this.spawns.push(new Spawn("Mallard", json.mallardPositions[i * 2], json.mallardPositions[i * 2 + 1]));
        }
    }
    start() {
        for(let spawn of this.spawns) {
            let duck = new Duck(this.scene, this.duckData[spawn.duckType], spawn.x, spawn.y);
            this.activeDucks[spawn.duckType].push(duck);
        }
    }
    update(delta) {
        for(let rubberDucky of this.activeDucks.RubberDucky) {
            rubberDucky.update(delta);
        }
        for(let mallard of this.activeDucks.Mallard) {
            mallard.update(delta);
        }
    }
};