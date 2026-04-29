class Duck extends Sprite {
    constructor(scene, x, y, sprite, hp, points) {
        super(scene, x, y, "ducks", sprite);
        this.hp = hp;
        this.points = points;
        this.setScale(0.65);
        scene.add.existing(this);
    }
}

class RubberDucky extends Duck {
    constructor(scene, x, y) {
        super(scene, x, y, "duck_yellow.png", 5, 10);
    }
}

class Mallard extends Duck {
    constructor(scene, x, y) {
        super(scene, x, y, "duck_brown.png", 10, 15);
    }
}