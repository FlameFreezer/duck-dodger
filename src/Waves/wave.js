class Wave {
    constructor(scene, json) {
        this.scene = scene;
        this.spawns = [];
        this.duckData = json.duckData;
        this.isOver = false;
        for(let i = 0; i < json.rubberDuckyPositions.length / 2; i++) {
            this.spawns.push(new Spawn("RubberDucky", json.rubberDuckyPositions[i * 2], json.rubberDuckyPositions[i * 2 + 1]));
        }
        for(let i = 0; i < json.mallardPositions.length / 2; i++) {
            this.spawns.push(new Spawn("Mallard", json.mallardPositions[i * 2], json.mallardPositions[i * 2 + 1]));
        }
        this.activeDucks = scene.add.group({
            classType: Phaser.GameObjects.Sprite,
            active: true,
            maxSize: -1        
        });
    }
    start() {
        for(let spawn of this.spawns) {
            let duck = new Duck(this.scene, this.duckData[spawn.duckType], spawn.x, spawn.y);
            this.activeDucks.add(duck);
        }
    }
    update(delta) {
        for(let duck of this.activeDucks.getChildren()) {
            duck.update(delta);
        }
        if(this.activeDucks.getLength() == 0) {
            this.isOver = true;
        }
    }
};