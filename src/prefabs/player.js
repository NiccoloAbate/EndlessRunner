// Player prefab
class Player extends Phaser.GameObjects.Sprite {

    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);

        this.snapToLanes = false;
        this.lanes = [];
        this.laneIndex = 0;

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
}
