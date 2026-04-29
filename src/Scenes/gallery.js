const canvasW = 600;
const canvasH = 800;
class Gallery extends Phaser.Scene {
    constructor() {
        super("gallery");
        this.my = {sprite: {}};
        this.keys = {
            a: null,
            d: null,
            space: null,
            shift: null
        };
        this.bullets = [];
    }
    preload() {
        this.load.setPath("./assets/spritesheets/");
        //Load in player sprite
        this.load.atlasXML("player", "enemies.png", "enemies.xml");
        //Load in duck sprites
        this.load.atlasXML("ducks", "spritesheet_objects.png", "spritesheet_objects.xml");
    }
    create() {
        let my = this.my;
        my.player = new Player(this, 300, 750);
        this.keys.a = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keys.d = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keys.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.keys.shift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    }
    update(time, delta) {
        let my = this.my;
        //Update bullets
        for(let bullet of this.bullets) {
            bullet.y -= bullet.speed * delta / 1000;
            if(bullet.y + bullet.height * bullet.scaleY / 2 <= 0) bullet.destroy();
        }
        //Use slow speed if holding shift
        if(this.keys.shift.isDown) {
            my.player.speed = my.player.slowSpeed; 
        }
        else {
            my.player.speed = my.player.fastSpeed;
        }

        //Move left
        if(this.keys.a.isDown) {
            my.player.x -= my.player.speed * (delta / 1000);
        }
        //Move right
        if(this.keys.d.isDown) {
            my.player.x += my.player.speed * (delta / 1000)
        }
        //Accumulate shoot delay
        my.player.timeSinceShoot += delta;
        //Shoot
        if(this.keys.space.isDown) {
            if(my.player.timeSinceShoot >= my.player.shootDelay) {
                my.player.shootBullet(this);
            }
        }
        //Keep fish within bounds plus a little wiggle room
        if(my.player.x + my.player.width * my.player.scaleX / 2 > canvasW) {
            my.player.x = canvasW - my.player.width * my.player.scaleX / 2;
        }
        if(my.player.x - my.player.width * my.player.scaleX / 2 < 0) {
            my.player.x = my.player.width * my.player.scaleX / 2;
        }
    }
}