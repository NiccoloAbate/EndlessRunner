// Note prefab
class Note extends Phaser.GameObjects.Sprite {

    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);

        this.reset();

        // add object to existing scene
        scene.add.existing(this);
    }

    reset() {
        this.speed = 0;
    }

    update(time, delta) {

        this.y += this.speed * delta;

        /*
        if (Phaser.Input.Keyboard.JustDown(this.keyFire) && !this.firing) {
            this.firing = true;
            const minDetune = -1000;
            const maxDetune = 1000;
            let detune = getRandomInclusive(minDetune, maxDetune);
            let pan = (((this.x / Game.config.width) * 2.0) - 1.0);
            this.sfxRocket.setDetune(detune);
            this.sfxRocket.setPan(pan)
            this.sfxRocket.play();  // play sfx
        }
        */
    }

    checkCollision(other) {
        let bounds1 = this.getBounds();
        let bounds2 = other.getBounds();
        return Phaser.Geom.Intersects.RectangleToRectangle(bounds1, bounds2);
    }

    offScreen() {
        let bounds1 = this.getBounds();
        let bounds2 = new Phaser.Geom.Rectangle(0, 0, Game.config.width, Game.config.height);
        return !(Phaser.Geom.Intersects.RectangleToRectangle(bounds1, bounds2));
    }
}
