class AttackTest extends Phaser.Scene {
    constructor() {
        super("attackTest")
    }

    preload() {
        this.colors = {YELLOW: 0, GREEN: 1, GRAY: 2};
        //Load sprites
        this.load.setPath("./assets/spritesheets/");
        //Load in player sprite
        this.load.atlasXML("player", "enemies.png", "enemies.xml");
        //Load in duck sprites
        this.load.atlasXML("ducks", "spritesheet_objects.png", "spritesheet_objects.xml");
    }

    create() {
        this.playerPos = {x: 300, y: 700};
        this.atkOwnerPos = {x: 100, y: 200};
        this.player = {x: this.playerPos.x, y: this.playerPos.y, activeColor: this.colors.GREEN, onHit: () => {console.log("player was hit!");}, hitbox: new Phaser.Geom.Circle(this.playerPos.x, this.playerPos.y, 10)};
        this.atkOwner = {x: this.atkOwnerPos.x, y: this.atkOwnerPos.y, hitbox: new Phaser.Geom.Circle(this.atkOwnerPos.x, this.atkOwnerPos.y, 10)};
        this.hitboxGraphics = this.add.graphics();
        this.hitboxGraphics.lineStyle(1, 0xffffff, 1);
        this.hitboxGraphics.strokeCircleShape(this.atkOwner.hitbox);
        this.hitboxGraphics.strokeCircleShape(this.player.hitbox);
        this.atk = new Attack(this, this.atkOwner, this.player, "t-pattern");
    }

    update(time, delta) {
        if (time > 1000) {
            this.atk.update(delta);
        }
    }
}