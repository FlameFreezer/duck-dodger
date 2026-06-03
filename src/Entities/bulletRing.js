const maxRingSize = 10;
const duckSprites = [
    "duck_yellow.png", "duck_brown.png", "duck_back.png"
];
class BulletRing {
    constructor(scene, x, y, angularSpeed) {
        this.x = x;
        this.y = y;
        this.scene = scene;
        this.bullets = scene.add.group({
            classType: Phaser.GameObjects.Sprite,
            active: true,
            maxSize: maxRingSize
        });
        this.angularSpeed = angularSpeed;
        let initialDir = {
            x: 0,
            y: 1
        };
        for(let i = 0; i < maxRingSize; i++) {
            let angle = 2 * Math.PI * i / maxRingSize;
            let dir = vecRotate(initialDir, angle);
            let bullet = new EnemyBullet(scene, this.x, this.y, getRandomDuckSprite(), dir);
            this.bullets.add(bullet);
        }
        if(this.scene.currentState != states.GAME_OVER) {
            this.scene.sound.add("bulletRing", {volume: 0.25}).play();
        }
    }
    update(delta) {
        let bullets = this.bullets.getChildren();
        for(let bullet of bullets) {
            bullet.update(delta);
            //Get vector from ring center to bullet
            let posFromRing = {
                x: bullet.x - this.x,
                y: bullet.y - this.y
            };
            //Rotate bullet around ring center
            let newPos = vecRotate(posFromRing, this.angularSpeed * delta / 1000);
            //Get vector from origin to bullet's new position
            bullet.x = this.x + newPos.x;
            bullet.y = this.y + newPos.y;
            //Use radial vector for bullet's velocity
            bullet.velocity = vecScale(vecNormalize(newPos), bullet.speed);
        }
    }
    destroy() {
        let removeQueue = [];
        for(let bullet of this.bullets.getChildren()) {
            removeQueue.push(bullet);
        }
        for(let bullet of removeQueue) {
            this.bullets.remove(bullet);
            bullet.destroy();
        }
        this.scene.duckBulletRings.filter((ring) => {
            if(ring != this) return ring;
        });
    }
}