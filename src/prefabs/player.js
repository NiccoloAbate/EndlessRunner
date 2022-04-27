// Player prefab
class Player extends Phaser.GameObjects.Sprite {

    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);

        this.scene = scene;
        this.texture = texture;

        this.snapToLanes = false;
        this.lanes = [];
        this.laneIndex = 0;

        this.timeSinceLastShadow = 0;
        this.lastShadowPositions = [];
        this.maxNumShadows = 8;
        this.timeBetweenShadows = 50;

        this.reset();

        // add object to existing scene
        scene.add.existing(this);
    }

    reset() {}

    update(time, delta) {
        if (this.snapToLanes) {
            this.updateMoveSnap();
        }
        else {
            this.updateMoveSmooth(delta);    
        }

        this.timeSinceLastShadow += delta;
        if (this.timeSinceLastShadow >= this.timeBetweenShadows) {
            this.timeSinceLastShadow -= this.timeBetweenShadows;

            this.lastShadowPositions.push(this.x);
            if (this.lastShadowPositions.length > this.maxNumShadows) {
                this.lastShadowPositions.splice(0, 1);
            }

            this.spawnShadow();
        }

    }

    updateMoveSmooth(delta) {
        const moveSpeed = 1.5 / UpdateTime.msRatio; // 5 per ms
        if (this.keyLeft.isDown) {
            this.x -= moveSpeed * delta;
            this.x = clamp(this.x, borderUISize, Game.config.width - borderUISize);
        }
        if (this.keyRight.isDown) {
            this.x += moveSpeed * delta;
            this.x = clamp(this.x, borderUISize, Game.config.width - borderUISize);
        }
    }
    updateMoveSnap() {
        if (Phaser.Input.Keyboard.JustDown(this.keyLeft)) {
            this.laneIndex = Math.max(0, this.laneIndex - 1);
        }
        if (Phaser.Input.Keyboard.JustDown(this.keyRight)) {
            this.laneIndex = Math.min(this.lanes.length - 1, this.laneIndex + 1);
        }

        this.x = this.lanes[this.laneIndex].x;
    }
    snapToClosestLane() {
        let laneDists = new Array(this.lanes.length);
        // compute distances
        for (let i = 0; i < laneDists.length; ++i) {
            laneDists[i] = Math.abs(this.lanes[i].x - this.x);
        }

        // find min distance
        let minIndex = laneDists.indexOf(Math.min(...laneDists));
        this.laneIndex = minIndex;
        // snap x value
        this.x = this.lanes[minIndex].x;
    }

    setControls(left, right) {
        this.keyLeft = left;
        this.keyRight = right;
    }

    // adapted from paddle parkour
    spawnShadow() {
        let shadow = this.scene.add.image(average(this.lastShadowPositions), this.y, this.texture).setOrigin(0.5, 0);
        shadow.scaleY = this.scaleY;            // scale to parent paddle
        shadow.scaleX = this.scaleX;
        shadow.tint = Math.random() * 0xFFFFFF;   // tint w/ rainbow colors
        shadow.alpha = 0.5;                       // make semi-transparent
        shadow.setDepth(-1);
        let shadowDuration = 500;
        // tween shadow paddle alpha to 0
        this.scene.tweens.add({ 
            targets: shadow, 
            alpha: { from: 0.5, to: 0 },
            scaleY: { from: this.scaleY, to: 0},
            duration: shadowDuration,
            ease: 'Linear',
            repeat: 0 
        });
        // set a kill timer for trail effect
        this.scene.time.delayedCall(shadowDuration, () => { shadow.destroy(); } );
    }
}
