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
        this.heart = this.add.sprite(HEALTH_SCORE_UI_X + 15, HEALTH_SCORE_UI_Y, "hearts", "hud_heart");
        this.heart.setScale(0.85);
        this.healthTxt = this.add.bitmapText(this.heart.x + 40, this.heart.y + 10, "04b_30", `x${PLAYER_STARTING_HEALTH}`, 18)
            .setOrigin(0.5)
            .setBlendMode(Phaser.BlendModes.ADD);

        this.waveCompleteText = this.add.bitmapText(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, "04b_30", "Wave Complete!", 32)
            .setOrigin(0.5)
            .setBlendMode(Phaser.BlendModes.ADD);
        this.waveCompleteText.visible = false;

        this.nextWaveText = this.add.bitmapText(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, "04b_30", "Wave 0", 32)
            .setOrigin(0.5)
            .setBlendMode(Phaser.BlendModes.ADD);
        this.nextWaveText.visible = false;

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
            }
        }, this);

        this.startGameTimeline = this.add.timeline([
            {
                at: 0,
                run() {
                    this.nextWaveText.visible = true;
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

        this.waveTransitionTimeline = this.add.timeline([
            {
                at: 0,
                run() {
                    this.waveCompleteText.visible = true;
                },
                target: this
            },
            {
                at: WAVE_TRANSITION_TIME / 2,
                run() {
                    this.waveCompleteText.visible = false;
                    this.nextWaveText.visible = true;
                },
                target: this
            },
            {
                at: WAVE_TRANSITION_TIME,
                run() {
                    this.nextWaveText.visible = false;
                },
                target: this
            }
        ])

        document.addEventListener("waveComplete", () => {
            this.waveTransitionTimeline.play();
        });
        document.addEventListener("startGame", () => {
            this.startGameTimeline.play();
        });
    }
    update(time, delta) {
    }
}