class PlayerTest extends Phaser.Scene {
    constructor() {
        super("playerTest");
        this.keys = {
            a: null,
            d: null,
            space: null,
            shift: null,
            w: null
        };
    }

    preload() {
        //Load sprites
        this.load.setPath("./assets/spritesheets/");
        //Load in player sprite
        this.load.atlasXML("player", "enemies.png", "enemies.xml");
        //Load in duck sprites
        this.load.atlasXML("ducks", "spritesheet_objects.png", "spritesheet_objects.xml");

        //Load in player JSON
        this.load.setPath("./config/");
        this.load.json("playerData", "player.json");

        //Load shader
        this.load.setPath("./src/Shaders/");
        this.load.glsl("background", "backgroundEffect.frag");
    }

    create() {
        //Shader wants to be half-size for some reason. Hope that isn't platform specific
        this.bgShader = this.add.shader("background", 0, 0, canvasW * 2, canvasH * 2);
        this.bgShader.uniforms.baseColor = {
            type: '3f',
            value: colorToVector(yellow)
        };
        this.bgShader.uniforms.canvasDim = {
            type: '2f',
            value: {
                x: canvasW,
                y: canvasH
            }
        };
        this.bgShader.initUniforms();

        this.player = new Player(this, this.cache.json.get("playerData"));
        for(let i = 0; i < 10; i++) {
            this.player.upgradeHoming();
        }
        for(let i = 0; i < 1; i++) {
            this.player.upgradeProjectiles();
        }
        for(let i = 0; i < 10; i++) {
            this.player.upgradeFireRate();
        }

        this.ducks = [];
        this.ducks.push(new Duck(this, {
            sprite: "duck_yellow.png",
            pathFollower: new Path("arc", 150, 50, 0.25, 4000),
            spawnTween: new SpawnTween(300, 0, 300, 250, 1000),
            attacker: new Attacker(this, "ring", 3000),
            deathAnim: new DeathAnimator(),
            hp: 300,
            points: 15
        }));

        this.keys.a = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keys.d = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keys.w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keys.s = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keys.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.keys.shift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.keys.enter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    }

    update(time, delta) {
        this.player.update(delta);
        for(let duck of this.ducks) {
            duck.update(delta);
            if(duck.active) {
                for(let bullet of this.player.bullets) {
                    if(Phaser.Geom.Intersects.CircleToRectangle(duck.hitbox, bullet.hitbox)) {
                        bullet.killed = true;
                        duck.hp--;
                    }
                }
            }
        }
        this.ducks = this.ducks.filter((duck) => {
            if(!duck.components.deathAnim.complete || duck.components.attacker.attacks.length > 0) return duck;
        });
    }
}