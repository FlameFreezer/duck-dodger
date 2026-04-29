class Duck extends Sprite {
    constructor(scene, json, x, y) {
        super(scene, x, y, "ducks", json.sprite);
        this.hp = json.hp;
        this.points = json.points;
        this.setScale(json.scale);
        //Flip ducks around if on the right side of the screen
        if(x > canvasW / 2) this.scaleX *= -1;
        scene.add.existing(this);
    }
}