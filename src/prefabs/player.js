// Player prefab
class Player extends Phaser.GameObjects.Sprite {

    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);

        this.reset();

        // add object to existing scene
        scene.add.existing(this);
    }

    reset() {}

    update(time, delta) {

        const msRatio = 1;
        const sRatio = 1000;
        const moveSpeed = 1.5 / msRatio; // 5 per ms
        if (this.keyLeft.isDown) {
            this.x -= moveSpeed * delta;
            this.x = clamp(this.x, borderUISize, Game.config.width - borderUISize);
        }
        if (this.keyRight.isDown) {
            this.x += moveSpeed * delta;
            this.x = clamp(this.x, borderUISize, Game.config.width - borderUISize);
        }
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

    setControls(left, right) {
        this.keyLeft = left;
        this.keyRight = right;
    }
}
