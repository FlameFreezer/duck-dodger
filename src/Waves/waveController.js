class WaveController {
    constructor(scene, waveData, duckData, challengeData) {
        this.scene = scene;
        this.duckData = duckData;

        this.waves = [];
        this.challengeWaves = [];

        //Regular waves
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
        //Challenge waves
        for (let wave of challengeData) {
            this.challengeWaves.push([]);
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
                this.challengeWaves[this.challengeWaves.length - 1].push(to_add);
            }
        }


        this.active = false;
        this.waveSpawned = false;
        this.spawnBread = false;
        this.breadSpawned = false;
        this.waveOver = false;
        this.currentWaveIndex = 0;
        this.scene.registry.set('waveNumber', this.currentWaveIndex);
        this.spawnTimer = 0;
        this.fleeTimer = -1;
        this.ducks = [];
        this.duckDeleteList = [];
        this.currentWave = null;

        return this;
    }

    update(delta) {
        if (this.active) {
            this.spawnTimer += delta;
            if(this.currentWaveIndex >= this.waves.length) {
                if(!this.currentWave) {
                    this.currentWave = this.challengeWaves[Math.floor(Math.random() * this.challengeWaves.length)];
                }
            }
            else {
                this.currentWave = this.waves[this.currentWaveIndex];
            }
            for (let spawn of this.currentWave) {
                if (!spawn.spawned && this.spawnTimer > spawn.time) {
                    for (let i = 0; i < spawn.spawnStarts.length; i++) {
                        let startVec = spawn.spawnStarts[i];
                        let endVec = spawn.spawnEnds[i];
                        this.ducks.push(this.buildDuck(spawn.duckType, startVec.x, startVec.y, endVec.x, endVec.y, spawn.spawnDur));
                    }
                    spawn.spawned = true;
                    if (this.currentWave.indexOf(spawn) == this.currentWave.length - 1) {
                        this.spawnBread = true;
                        this.spawnTimer = 0;
                    }
                }
            }
            if (this.spawnBread && this.spawnTimer > 1500) {
                let data = this.duckData["BREAD"];
                let breadConfig = {
                    pathFollower: new Path(data.path.type, data.path.width, data.path.height, data.path.start, data.path.loopTime, true),
                    spawnTween: new SpawnTween(this.scene.sys.scale.width / 2, -50, this.scene.sys.scale.width / 2, 150, 1000),
                    hp: data.hp + Math.floor(this.currentWaveIndex / WAVES_PER_ENEMY_HEALTH),
                    points: data.points
                };
                this.ducks.push(new Bread(this.scene, breadConfig));
                this.waveSpawned = true;
                this.resetSpawns();
                this.deactivate();
                this.currentWave = null;
            }
        }

        if (this.waveSpawned && this.ducks.length == 0 && !this.waveOver) {
            this.waveOver = true;

            this.currentWaveIndex++;
            this.scene.registry.set('waveNumber', this.currentWaveIndex);

            //Delay wave end slightly cause of the bread's sound effect
            this.scene.time.delayedCall(WAVE_END_DELAY, () => {
                let waveCompleteEvent = new Event("waveComplete");
                document.dispatchEvent(waveCompleteEvent);
            });
        }
        
        for (let duck of this.ducks) {
            duck.update(delta);
            if (duck.canBeDeleted()) {
                this.duckDeleteList.push(duck);
            }
        }

        if (this.waveSpawned && this.ducks.length == 1) {
            if (this.fleeTimer < 0) {
                this.fleeTimer = delta;
            }
            else if (this.fleeTimer < BREAD_FLEE_TIMER) {
                this.fleeTimer += delta;
            }
            else {
                for (let duck of this.ducks) {
                    if (Object.hasOwn(duck.components, "fleeTween") && !duck.components.deathAnim.active) {
                        duck.flee();
                    }
                }
            }
        }

        this.flushDeleteList();
    }

    resetSpawns() {
        for(let spawn of this.currentWave) {
            spawn.spawned = false;
        }
    }

    startNextWave() {
        this.spawnTimer = 0;
        this.waveSpawned = false;
        this.spawnBread = false;
        this.fleeTimer = -1;
        this.waveOver = false;
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
        let sprites = getDuckSpriteFromType(DuckTypes[type]);
        let config = {
            sprite: sprites.base,
            spriteOnHit: sprites.onHit,
            pathFollower: new Path(currPath.type, currPath.width, currPath.height, currPath.start, currPath.loopTime, false),
            spawnTween: new SpawnTween(spawnX, spawnY, toX, toY, spawnDur),
            attacker: new Attacker(this.scene, data.attack, data.attackGap),
            hp: data.hp + Math.floor(this.currentWaveIndex / WAVES_PER_ENEMY_HEALTH),
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