class Duck extends Phaser.GameObjects.PathFollower {
    constructor(scene, json, x, y) {
        //May specify no path
        if(json.path === undefined || json.path.length < 2) {
            json.path = [0, 0];
        }
        let path = new Phaser.Curves.Spline(json.path);
        super(scene, path, x, y, "ducks", json.sprite);
        this.hp = json.hp;
        this.points = json.points;
        this.setScale(json.scale);
        //Flip ducks around if on the right side of the screen
        if(x > canvasW / 2) this.scaleX *= -1;
        this.startFollow({
            from: 0,
            to: 1,
            delay: 0,
            duration: 2000,
            ease: 'Sine.easeInOut',
            repeat: -1,
            yoyo: true,
            rotateToPath: false
        });
        scene.add.existing(this);
    }
}