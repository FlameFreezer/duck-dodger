class WaveSpawner {
    constructor(scene, waveData, duckData) {
        this.scene = scene;
        this.duckData = duckData;

        this.waves = [];

        for (let wave of waveData) {
            this.waves.push([]);
            for (let spawn of wave) {
                let to_add = {};
                if (spawn.time != null) {
                    to_add.time = spawn.time;
                }
                else {
                    to_add.time = spawnDataDefaults.TIME;
                }
                to_add.duckType = spawn.duckType;
                to_add.spawnStarts = [];
                for (let coords of spawn.spawnStarts) {
                    let vec = coords;
                    if (vec.y == null) vec.y = spawnDataDefaults.SPAWN_STARTS.y;
                    to_add.spawnStarts.push(vec);
                }
                if (spawn.spawnDur != null) {
                    to_add.spawnDur = spawn.spawnDur;
                }
                else {
                    to_add.spawnDur = spawnDataDefaults.SPAWN_DUR;
                }

                to_add.spawnEnds = [];
                for (let coords of spawn.spawnEnds) {
                    to_add.spawnEnds.push(coords);
                }
                to_add.spawned = false;
                this.waves[this.waves.length - 1].push(to_add);
            }
        }

        this.active = false;
        this.allDucksSpawned = false;
        this.spawnBread = false;
        this.breadSpawned = false;
        this.currWave = -1;
        this.spawnTimer = 0;
        this.ducks = [];
        this.duckDeleteList = [];

        return this;
    }

    update(delta) {
        if (this.active) {
            this.spawnTimer += delta;
            for (let spawn of this.waves[this.currWave]) {
                if (!spawn.spawned && this.spawnTimer > spawn.time) {
                    for (let i = 0; i < spawn.spawnStarts.length; i++) {
                        let startVec = spawn.spawnStarts[i];
                        let endVec = spawn.spawnEnds[i];
                        this.ducks.push(this.buildDuck(spawn.duckType, startVec.x, startVec.y, endVec.x, endVec.y, spawn.spawnDur));
                    }
                    spawn.spawned = true;
                    if (this.waves[currWave].indexOf(spawn) == this.waves[currWave].length - 1) {
                        this.spawnBread = true;
                        this.spawnTimer = 0;
                    }
                }
            }
            if (this.allDucksSpawned && this.spawnTimer > 1500) {
                let data = this.duckData["BREAD"];
                let breadConfig = {
                    pathFollower: new Path(data.path.type, data.path.width, data.path.height, data.path.start, data.path.loopTime, true),
                    spawnTween: new SpawnTween(this.scene.sys.display.width / 2, -50, this.scene.sys.display.width / 2, 150, 1000),
                    hp: data.hp,
                    points: data.points
                };
                this.ducks.push(new Bread(this.scene, breadConfig));
                this.allDucksSpawned = true;
            }
        }
        
        for (let duck of this.ducks) {
            duck.update(delta);
            if (duck.canBeDeleted()) {
                this.duckDeleteList.push(duck);
            }
        }

        this.flushDeleteList();
    }

    startNextWave() {
        this.currWave++;
        this.spawnTimer = 0;
        this.allDucksSpawned = false;
        this.spawnBread = false;
        this.activate();
    }

    activate() {
        this.active = true;
    }

    deactivate() {
        this.active = false;
    }

    // ------ INTERNAL FUNCTIONS ------

    buildDuck(type, spawnX, spawnY, toX, toY, spawnDur) {
        let data = this.duckData[type];
        let currPath = data.path;
        let config = {
            sprite: Duck.getDuckSpriteFromType(type).base,
            pathFollower: new Path(currPath.type, currPath.width, currPath.height, currPath.start, currPath.loopTime, false),
            spawnTween: new SpawnTween(spawnX, spawnY, toX, toY, spawnDur),
            attacker: new Attacker(this.scene, data.attack, data.attackGap),
            hp: data.hp,
            points: data.points
        };
        return new Duck(this.scene, config);
    }

    flushDeleteList() {
        this.ducks = this.ducks.filter((duck) => {
            if(!this.duckDeleteList.includes(duck)) {
                return duck;
            }
        });
        this.duckDeleteList = [];
    }
}