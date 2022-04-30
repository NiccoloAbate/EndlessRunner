class GameOver extends Phaser.Scene {
    constructor() {
        super("gameover");
    }

    preload() {
        let width = config.width;
        let height = config.height;

        // menu text config
        this.menuConfig = {
            fontFamily: 'Courier',
            fontSize: '28px',
            backgroundColor: '#FFFFFF',
            color: '#000000',
            align: 'right',
            padding: {
            top: 5,
            bottom: 5,
            },
            fixedWidth: 0
        }

        // show loading text
        this.left = this.add.text(width / 4, height + borderUISize/100 - borderPadding,
        ' Menu ', this.menuConfig).setOrigin(0.5);
        this.right = this.add.text(3* width / 4, height + borderUISize/100 - borderPadding,
        ' Restart ', this.menuConfig).setOrigin(0.5);
    }

    create() {
        let width = config.width;
        let height = config.height;

        this.defineKeys();

        this.gameOverText = this.add.text(width/2, height/4, 'GAME OVER', this.menuConfig).setOrigin(0.5);
        this.startText = this.add.text(width / 2, height / 2 - borderUISize - borderPadding,
        ' <- Menu | Play -> ', this.menuConfig).setOrigin(0.5);

        // init player entity
        this.player = new Player(this, width/2, height - borderUISize - borderPadding, 'player');
        this.player.setOrigin(0.5, 0);
        this.player.setScale(width/150, height/500);
        this.player.setControls(keyLEFT, keyRIGHT);

        this.initLanes(3);

        this.player.keyLeft.on("down", () => {
            // will be moving into left
            if (this.player.laneIndex == 1) {
                // credit text
                this.startText.text = 'Press ENTER for Menu';
            }
        });
        this.player.keyRight.on("down", () => {
            // will be moving into center
            if (this.player.laneIndex == 0) {
                this.startText.text = ' <- Menu | Play -> ';
            }
        });
        this.player.keyRight.on("down", () => {
            // will be moving into right
            if (this.player.laneIndex == this.player.lanes.length - 2) {
                this.startText.text = 'Press ENTER to Play';
            }
        });
        this.player.keyLeft.on("down", () => {
            // will be moving into center
            if (this.player.laneIndex == 2) {
                this.startText.text = ' <- Menu | Play -> ';
            }
        });
    }

    update(time, delta) {
        this.player.update(time, delta);

        if (Phaser.Input.Keyboard.JustDown(keyENTER)) {
            if (this.player.laneIndex == 0) {
                this.sound.play('menu_select');
                // menu
                Game.scene.getScene('play').stop();
                this.scene.start('menu');
            }
            if (this.player.laneIndex == 2) {
                this.sound.play('menu_select');
                // restart
                Game.scene.getScene('play').restart();
                this.scene.stop();
            }
        }
    }

    startGame() {
        Game.scene.start('play');
        Game.scene.remove('menu');
    }

    defineKeys() {
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        keyUP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        keyDOWN = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        keyENTER = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    }

    initLanes(nLanes) {
        // init lanes
        this.lanes = new Array(3);
        for (let i = 0; i < nLanes; ++i) {
            this.lanes[i] = {};
            // spread the lanes evenly across the width
            this.lanes[i].x = (Game.config.width / (nLanes + 1)) * (i + 1);
        }
        this.player.lanes = this.lanes;
        this.player.snapToLanes = true;
        if (this.player.snapToLanes) {
            this.player.snapToClosestLane();
        }
    }
}
