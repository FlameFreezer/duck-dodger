class WaveSpawnTest extends Phaser.Scene {
    constructor() {
        super("waveSpawnTest");
        this.keys = {
            a: null,
            d: null,
            space: null,
            shift: null,
            w: null
        };
    }
    preload() {

    }


    create() {
        initBackgroundShader(this);
        
        this.player = new Player(this, this.cache.json.get("playerData"));

        this.keys.a = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keys.d = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keys.w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keys.s = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keys.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.keys.shift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.keys.enter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        let json = this.cache.json;

        this.waveController = new WaveController(this, json.get("rounds"), json.get("enemies"));
        this.waveController.startNextWave();

        document.addEventListener("waveComplete", () => {this.waveController.startNextWave();});
    }
    update(time, delta) {
        this.waveController.update(delta);
        this.player.update(delta);

        // bullet hit detection
        for(let duck of this.waveController.ducks) {
            //duck.update(delta);
            if(duck.active) {
                for(let bullet of this.player.bullets) {
                    if (duck.hitbox == null) break;
                    if(Phaser.Geom.Intersects.CircleToRectangle(duck.hitbox, bullet.hitbox)) {
                        bullet.killed = true;
                        duck.hp--;
                    }
                }
            }
        }
    }
}