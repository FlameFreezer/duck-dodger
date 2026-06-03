class Load extends Phaser.Scene {
    constructor() {
        super("load");
    }
    preload() {
        //Load sprites
        this.load.setPath("./assets/spritesheets/");
        //Load in player sprite
        this.load.atlasXML("player", "enemies.png", "enemies.xml");
        //Load in duck sprites
        this.load.atlasXML("ducks", "spritesheet_objects.png", "spritesheet_objects.xml");
        //Load heart
        this.load.atlasXML("hearts", "spritesheet-tiles-default.png", "spritesheet-tiles-default.xml");
        //Load player data
        this.load.setPath("./config");
        this.load.json("playerData", "player.json");
        this.load.json("duckData", "ducks.json");
        this.load.json("waveData", "waves.json");
        this.load.json("challengeWaveData", "challengeWaves.json");
        //Load shader
        this.load.setPath("./src/Shaders/");
        this.load.glsl("background", "backgroundEffect.frag");
        //Load font
        this.load.setPath("./assets/daydream_3");
        this.load.bitmapFont("daydream_3", "daydream_3_0.png", "daydream_3.fnt");
        //Load sounds
        this.load.setPath("./assets/Audio");
        this.load.audio("duckHit", "footstep_wood_001.ogg");
        this.load.audio("bulletRing", "phaserUp6.ogg");
        this.load.audio("duckBullet", "tone1.ogg");
        this.load.audio("duckDeath", "highUp.ogg");
        this.load.audio("healthUp", "jingles_HIT03.ogg");
        this.load.audio("nextWave", "jingles_HIT04.ogg");
        this.load.audio("gameOver", "jingles_HIT11.ogg");
        this.load.audio("breadGot", "jingles_HIT15.ogg");
        this.load.audio("playerHit", "footstep_snow_000.ogg");
        this.load.audio("bgMusic", "Dagored - Lifestyle Groove (freetouse.com).mp3");
        //Load images
        this.load.setPath("./assets/Images");
        this.load.image("bread", "bread.png");
        this.load.image("breadHit", "breadHit.png");
        this.load.image("a", "keyboard_a.png");
        this.load.image("d", "keyboard_d.png");
        this.load.image("w", "keyboard_w.png");
        this.load.image("space", "keyboard_space.png");
        this.load.image("bubble", "bubble.png");
    }
    create() {
        this.scene.start("playerTest");
    }
    update(time, delta) {

    }
}