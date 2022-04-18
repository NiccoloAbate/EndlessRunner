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

        this.add.text(width / 2, height / 2 - borderUISize - borderPadding,
        'Press Enter to Begin', this.menuConfig).setOrigin(0.5);

        this.defineKeys();
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(keyENTER)) {
            this.sound.play('menu_select');
            Game.scene.start('play');
            Game.scene.remove('menu');
        }
    }

    defineKeys() {
        keyENTER = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    }
}
