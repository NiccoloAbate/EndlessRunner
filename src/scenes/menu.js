class Menu extends Phaser.Scene {
    constructor() {
        super("menu");
    }

    preload() {
        let width = config.width;
        let height = config.height;

        // load audio
        this.load.audio('menu_select', 'assets/sfx/blip_select12.wav');
        Audio.preloadMulti(this, 'testTrack0', testTrack0StemFileNames, testTrack0StemNames);
        Audio.preloadMulti(this, 'testTrack1', testTrack1StemFileNames, testTrack1StemNames);

        // load images/tile sprites
        this.load.image('player', './assets/sprites/PlayerBlock.png');
        this.load.image('note', './assets/sprites/CircleToHit.png');
        this.load.image('obstacle', "./assets/sprites/ObsticleX.png");
        this.load.image('power', "./assets/sprites/TriangleCoin.png");
        this.load.image('arrow', "./assets/sprites/hitToGoToNextLane.png");
        this.load.image('background0', './assets/sprites/Endless_Runner_Background-1.png');

        // menu text config
        this.menuConfig = {
            fontFamily: 'Courier',
            fontSize: '28px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'right',
            padding: {
            top: 5,
            bottom: 5,
            },
            fixedWidth: 0
        }

        // show loading text
        this.loadingText = this.add.text(width / 2, height / 2 - borderUISize - borderPadding,
        'LOADING', this.menuConfig).setOrigin(0.5);
    }

    create() {
        let width = config.width;
        let height = config.height;

        this.loadingText.destroy();

        this.defineKeys();

        this.add.text(width / 2, height / 2 - borderUISize - borderPadding,
        'Press Enter to Begin', this.menuConfig).setOrigin(0.5);

        // init player entity
        this.player = new Player(this, width/2, height - borderUISize - borderPadding, 'player');
        this.player.setOrigin(0.5, 0);
        this.player.setScale(width/150, height/500);
        this.player.setControls(keyLEFT, keyRIGHT);

        this.initLanes(3);

        this.player.keyRight.on("down", () => {
            // will be moving into left
            if (this.player.laneIndex == 1) {
                // something happens on the left
                // credits or optoins or something
            }
        });
        this.player.keyRight.on("down", () => {
            // will be moving into right
            if (this.player.laneIndex == this.player.lanes.length - 2) {
                // something happens on the right
                this.sound.play('menu_select');
                this.time.delayedCall(500, () => this.startGame());
            }
        });
    }

    update(time, delta) {
        this.player.update(time, delta);

        if (Phaser.Input.Keyboard.JustDown(keyENTER)) {
            this.sound.play('menu_select');
            this.startGame();
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
