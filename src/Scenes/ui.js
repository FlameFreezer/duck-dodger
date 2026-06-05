class Heart extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, key, frame) {
        super(scene, x, y, key, frame);
        scene.add.existing(this);
        this.animTimer = 0;
        this.update = this.updateBase;
    }
    updateBase(delta) {

    }
    doGrowAndShrink() {
        this.baseScale = this.scale;
        this.update = this.updateGrowAndShrink;
    }
    updateGrowAndShrink(delta) {
        if(this.animTimer >= HEART_ANIMATION_TIME) {
            this.setScale(this.baseScale);
            this.animTimer = 0;
            this.update = this.updateBase;
        }
        else {
            let t = this.animTimer / HEART_ANIMATION_TIME;
            let toScale = (-2 * Math.pow(t - 0.5, 2) + 1.5) * this.baseScale;
            this.setScale(toScale);
            this.animTimer += delta;
        }
    }
}
class UI extends Phaser.Scene {
    constructor() {
        super("ui");
    }
    preload() {

    }
    create() {
        const HEALTH_SCORE_UI_X = 430;
        const HEALTH_SCORE_UI_Y = 100;

        //Score
        this.scoreTxt = this.add.bitmapText(HEALTH_SCORE_UI_X, HEALTH_SCORE_UI_Y + 30, "04b_30", `Score: 0`, 18)
            .setOrigin(0)
            .setBlendMode(Phaser.BlendModes.ADD);

        //Heart display
        this.heart = new Heart(this,HEALTH_SCORE_UI_X + 15, HEALTH_SCORE_UI_Y, "hearts", "hud_heart");
        this.heart.setScale(0.85);
        this.healthTxt = this.add.bitmapText(this.heart.x + 40, this.heart.y + 10, "04b_30", `x${PLAYER_STARTING_HEALTH}`, 18)
            .setOrigin(0.5)
            .setBlendMode(Phaser.BlendModes.ADD);

        this.nextWaveText = this.add.bitmapText(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, "04b_30", "Wave 1", 32)
            .setOrigin(0.5)
            .setBlendMode(Phaser.BlendModes.ADD);
        this.nextWaveText.visible = false;

        this.gameOverText = this.add.bitmapText(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, "04b_30", "Game Over!", 32)
            .setOrigin(0.5)
            .setBlendMode(Phaser.BlendModes.ADD);
        this.gameOverText.visible = false;

        this.restartText = this.add.bitmapText(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 32, "04b_30", "Press enter to restart", 18)
            .setOrigin(0.5)
            .setBlendMode(Phaser.BlendModes.ADD);
        this.restartText.visible = false;


        //Upgrades
        this.upgradesTxt = this.add.bitmapText(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, "04b_30", "Upgrades", 32)
            .setOrigin(0.5)
            .setBlendMode(Phaser.BlendModes.ADD);
        this.upgradesTxt.visible = false;

        this.upgrade1Pos = {
            x: this.upgradesTxt.x - 128,
            y: this.upgradesTxt.y + 32
        };
        this.upgrade2Pos = {
            x: this.upgradesTxt.x + 128,
            y: this.upgradesTxt.y + 32
        };

        this.upgrade1Txt = this.add.bitmapText(this.upgrade1Pos.x, this.upgrade1Pos.y, "04b_30", "1", 16)
            .setOrigin(0.5)
            .setBlendMode(Phaser.BlendModes.ADD);
        this.upgrade1Txt.visible = false;
        this.upgrade2Txt = this.add.bitmapText(this.upgrade2Pos.x, this.upgrade2Pos.y, "04b_30", "2", 16)
            .setOrigin(0.5)
            .setBlendMode(Phaser.BlendModes.ADD);
        this.upgrade2Txt.visible = false;

        //Input prompts
        this.zKey = this.add.image(this.upgrade1Pos.x, this.upgrade1Pos.y + 32, "z");
        this.zKey.visible = false;
        this.zKey.setScale(0.5);
        this.xKey = this.add.image(this.upgrade2Pos.x, this.upgrade2Pos.y + 32, "x");
        this.xKey.visible = false;
        this.xKey.setScale(0.5);

        //Next wave sound effect
        this.nextWaveSfx = this.sound.add("nextWave", {
            volume: 0.5
        });

        this.registry.events.on('changedata', (parent, key, data) => {
            switch(key) {
                case 'health':
                    this.healthTxt.setText(`x${data}`);
                    break;
                case 'score':
                    this.scoreTxt.setText(`Score: ${data}`);
                    break;
                case 'waveNumber':
                    this.nextWaveText.setText(`Wave ${data + 1}`);
                    break;
                case 'upgrade1':
                    this.upgrade1Txt.setText(data);
                    break;
                case 'upgrade2':
                    this.upgrade2Txt.setText(data);
                    break;
            }
        }, this);

        this.startGameTimeline = this.add.timeline([
            {
                at: 0,
                run() {
                    this.nextWaveText.visible = true;
                    this.nextWaveSfx.play();
                },
                target: this
            },
            {
                at: WAVE_TRANSITION_TIME / 2,
                run() {
                    this.nextWaveText.visible = false;
                },
                target: this
            }
        ]);

        document.addEventListener("waveComplete", () => {
            this.upgradesTxt.visible = true;
            this.upgrade1Txt.visible = true;
            this.upgrade2Txt.visible = true;
            this.zKey.visible = true;
            this.xKey.visible = true;
        });
        document.addEventListener("waveStart", () => {
            this.upgradesTxt.visible = false;
            this.upgrade1Txt.visible = false;
            this.upgrade2Txt.visible = false;
            this.zKey.visible = false;
            this.xKey.visible = false;

            this.nextWaveText.visible = true;

            this.time.delayedCall(WAVE_TRANSITION_TIME, (self) => {
                this.nextWaveText.visible = false;
            }, [this]);

            this.nextWaveSfx.play();
        });
        document.addEventListener("startGame", () => {
            this.startGameTimeline.play();
        });
        document.addEventListener("healthUp", () => {
            this.heart.doGrowAndShrink();
        });
        document.addEventListener("gameOver", () => {
            this.gameOverText.visible = true;
            this.waveCompleteText.visible = false;
            this.nextWaveText.visible = false;
            this.restartText.visible = true;
        });
    }
    update(time, delta) {
        this.heart.update(delta);
    }
}