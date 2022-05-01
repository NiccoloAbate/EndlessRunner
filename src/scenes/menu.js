class Menu extends Phaser.Scene {
    constructor() {
        super("menu");
    }

    preload() {
        let width = config.width;
        let height = config.height;

        // load audio
        this.load.audio('menu_select', 'assets/sfx/blip_select12.wav');
        Audio.preloadMulti(this, 'Track0', Track0StemFileNames, Track0StemNames);
        Audio.preloadMulti(this, 'Track1', Track1StemFileNames, Track1StemNames);
        Audio.preloadMulti(this, 'Track2', Track2StemFileNames, Track2StemNames);
        Audio.preloadMulti(this, 'Track3', Track3StemFileNames, Track3StemNames);

        // load images/tile sprites
        this.load.image('player', './assets/sprites/PlayerBlock.png');
        this.load.image('note', './assets/sprites/CircleToHit.png');
        this.load.image('obstacle', "./assets/sprites/ObsticleX.png");
        this.load.image('power', "./assets/sprites/TriangleCoin.png");
        this.load.image('leftArrowNote', "./assets/sprites/hitToGoToNextLane.png");
        this.load.image('background0', './assets/sprites/Endless_Runner_Background-1.png');
        this.load.image('leftArrow', './assets/sprites/LeftArrow.png');
        this.load.image('rightArrow', './assets/sprites/RightArrow.png');
        this.load.image('healthBar', './assets/sprites/HealthBar.png');

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
        this.loadingText = this.add.text(width / 2, height / 2 - borderUISize - borderPadding,
        ' LOADING ', this.menuConfig).setOrigin(0.5);
        this.left = this.add.text(width / 4, height + borderUISize/100 - borderPadding,
        ' Credits ', this.menuConfig).setOrigin(0.5);
        this.middle = this.add.text(width / 2, height + borderUISize/100 - borderPadding,
        ' Play ', this.menuConfig).setOrigin(0.5);
        this.right = this.add.text(3* width / 4, height + borderUISize/100 - borderPadding,
        ' Tutorial ', this.menuConfig).setOrigin(0.5);
    }

    create() {
        let width = config.width;
        let height = config.height;

        this.loadingText.destroy();

        this.defineKeys();

        this.startText = this.add.text(width / 2, height / 2 - borderUISize - borderPadding,
        ' Press Enter to Begin ', this.menuConfig).setOrigin(0.5);

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
                this.startText.destroy();
                this.creditText = this.add.text(width / 2, height / 2 - borderUISize - borderPadding,
                ' Credits ', this.menuConfig).setOrigin(0.5);
                this.creditText2 = this.add.text(width / 2, height / 2 - borderUISize+ borderPadding,
                ' Game coding and Music: Niccolo Abate ', this.menuConfig).setOrigin(0.5);
                this.creditText3 = this.add.text(width / 2, height / 2 - borderUISize + borderPadding * 3,
                ' Asset creation: Michael Jasper ', this.menuConfig).setOrigin(0.5);
                this.creditText4 = this.add.text(width / 2, height / 2 - borderUISize + borderPadding * 5,
                ' Game coding: Johnny Wong ', this.menuConfig).setOrigin(0.5);
                
            }
        });
        this.player.keyRight.on("down", () => {
            // will be moving into center
            if (this.player.laneIndex == 0) {
                // normal start Text
                this.creditText.destroy();
                this.creditText2.destroy();
                this.creditText3.destroy();
                this.creditText4.destroy();
                

                this.startText = this.add.text(width / 2, height / 2 - borderUISize - borderPadding,
                ' Press Enter to Begin ', this.menuConfig).setOrigin(0.5);
            }
        });
        this.player.keyRight.on("down", () => {
            // will be moving into right
            if (this.player.laneIndex == this.player.lanes.length - 2) {
                // tutorial text
                this.startText.destroy();
                this.tutorialText = this.add.text(width / 2, height / 2 - borderUISize- borderPadding,
                ' Press Enter to Interact with the menu ', this.menuConfig).setOrigin(0.5);
                this.tutorialText2 = this.add.text(width / 2, height / 2 - borderUISize+ borderPadding,
                ' press the LEFT and RIGHT arrow keys to move the paddle ', this.menuConfig).setOrigin(0.5);
                this.tutorialText3 = this.add.text(width / 2, height / 2 - borderUISize + borderPadding * 3,
                ' Collect the green orbs to increase score ', this.menuConfig).setOrigin(0.5);
                this.tutorialText4 = this.add.text(width / 2, height / 2 - borderUISize + borderPadding * 5,
                ' Dodge the red crosses ', this.menuConfig).setOrigin(0.5);
                this.tutorialText5 = this.add.text(width / 2, height / 2 - borderUISize + borderPadding * 7,
                ' Collect the yellow triangles for power ups ', this.menuConfig).setOrigin(0.5);
            }
        });
        this.player.keyLeft.on("down", () => {
            // will be moving into center
            if (this.player.laneIndex == 2) {
                // normal start Text
                this.tutorialText.destroy();
                this.tutorialText2.destroy();
                this.tutorialText3.destroy();
                this.tutorialText4.destroy();
                this.tutorialText5.destroy();

                this.startText = this.add.text(width / 2, height / 2 - borderUISize - borderPadding,
                ' Press Enter to Begin , arrows to navigate', this.menuConfig).setOrigin(0.5);
            }
        });
        
        
    }

    update(time, delta) {
        this.player.update(time, delta);

        if (Phaser.Input.Keyboard.JustDown(keyENTER)) {
            if (this.player.laneIndex == 1) {
                this.sound.play('menu_select');
                this.startGame();
            }
        }
    }

    startGame() {
        this.scene.start('play');
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
