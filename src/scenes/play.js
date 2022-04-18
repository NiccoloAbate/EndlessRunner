class Play extends Phaser.Scene {
    constructor() {
        super("play");
    }

    preload() {
        // load images/tile sprites
        this.load.image('player', './assets/sprites/rocket.png');
        this.load.image('note', './assets/sprites/spaceship.png');
        this.load.image('background0', './assets/sprites/starfield.png');
        this.load.image('background1', './assets/sprites/asteroids_big.png');
    }

    create() {
        let width = config.width;
        let height = config.height;

        this.defineKeys();

        this.backgrounds = new Array(2);
        this.backgrounds[0] = this.add.tileSprite(0, 0, width, height, 'background0').setOrigin(0, 0);
        this.backgrounds[1] = this.add.tileSprite(0, 0, width, height, 'background1').setOrigin(0, 0);
        this.backgroundScrollSpeeds = new Array(2);
        this.backgroundScrollSpeeds[0] = 4;
        this.backgroundScrollSpeeds[1] = 1;

        Game.player = {
            score : 0
        };

        this.player = new Player(this, width/2, height - borderUISize - borderPadding, 'player');
        this.player.setOrigin(0.5, 0);
        this.player.setControls(keyLEFT, keyRIGHT);

        //this.rockets = new Array(Game.settings.numPlayers);
        // add rocket (p1) - neutral texture
        //this.rockets[0] = new Rocket(this, width/2, height - borderUISize - borderPadding, 'rocket');
        //this.rockets[0].setOrigin(0.5, 0);
        //this.rockets[0].playerID = 0;
        //this.rockets[0].setControls(keyLEFT, keyRIGHT, keyUP);

        let rectColor = 0x00FF00;
        let borderColor = 0xFFFFFF;
        // green UI background
        this.add.rectangle(0, borderUISize + borderPadding, width, borderUISize * 2, rectColor).setOrigin(0, 0);
        // white borders
        this.add.rectangle(0, 0, width, borderUISize, borderColor).setOrigin(0, 0);
        this.add.rectangle(0, height - borderUISize, width, borderUISize, borderColor).setOrigin(0, 0);
        this.add.rectangle(0, 0, borderUISize, height, borderColor).setOrigin(0, 0);
        this.add.rectangle(width - borderUISize, 0, borderUISize, height, borderColor).setOrigin(0, 0);
        
        // display score
        this.scoreConfig = {
            fontFamily: 'Courier',
            fontSize: '28px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'right',
            padding: {
            top: 5,
            bottom: 5,
            },
            fixedWidth: 100
        }
        this.scoreLeft = this.add.text(borderUISize + borderPadding, borderUISize + borderPadding*2,
            Game.player.score, this.scoreConfig);
        this.beatCounterText = this.add.text(width - borderUISize - borderPadding - this.scoreConfig.fixedWidth,
            borderUISize + borderPadding*2, 0, this.scoreConfig);

        this.health = 100;
        this.healthTextConfig = {
            fontFamily: 'Courier',
            fontSize: '28px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'center',
            padding: {
            top: 5,
            bottom: 5,
            },
            fixedWidth: 100
        }
        this.formatHealthText = h => Math.max(Math.floor(h), 0); 
        this.healthText = this.add.text((width / 2) - (this.healthTextConfig.fixedWidth / 2),
            borderUISize + borderPadding*2, this.formatHealthText(this.timeLeft), this.healthTextConfig);
        
        // GAME OVER flag
        this.gameOver = false;

        // audio manager
        this.testTrack = Audio.addMulti(this, 'testTrack');
        this.testTrack.setGlobalConfig({loop: true});
        this.testTrack.play();
        this.testBPM = 135;
        this.measureSig = 4;
        this.beatPos = 0;
        this.measurePos = 0;
        this.beatReset = this.measureSig;
        this.measureReset = 4;
        this.lastBeatDiff = 1;
        this.lastMeasureDiff = 1;

        this.notes = new Array(0);
    }

    update(time, delta) {
        // check key input for restart
        if (this.gameOver) {
            //this.sound.play('sfx_select');
            //this.music.destroy();
            if (Phaser.Input.Keyboard.JustDown(keyENTER)) {
                this.testTrack.destroy();
                this.scene.restart();
            }
        }

        const scrollAxis = 'tilePositionY';
        for (let i = 0; i < this.backgrounds.length; ++i) {
            this.backgrounds[i][scrollAxis] -= this.backgroundScrollSpeeds[i];
        }

        if (!this.gameOver) {
            // update health
            const healthSpeed = 5 / UpdateTime.sRatio; // 5 per second
            this.health -= delta * healthSpeed;
            this.healthText.text = this.formatHealthText(this.health);

            //const pitchDriftTime = 5000;
            //let det = clamp(((pitchDriftTime - this.timeLeft) / pitchDriftTime), 0, 1) * (-1 * 1200);
            //this.music.setGlobalConfig({detune: det});
            

            if (this.health <= 0) {
                //this.music.setGlobalConfig({detune: 0});
                this.outOfHealth();
            }

            let beatDelta = (delta / UpdateTime.mRatio) * this.testBPM;
            this.beatPos += beatDelta;
            this.measurePos += beatDelta / this.measureSig;

            let beatDiff = this.beatPos - Math.floor(this.beatPos);
            if (beatDiff < this.lastBeatDiff) {
                // beat just completed

                // do stuff
                this.beatCounterText.text = Math.floor(this.beatPos);
            }
            this.lastBeatDiff = beatDiff;
            let measureDiff = this.measurePos - Math.floor(this.measurePos);
            if (measureDiff < this.lastMeasureDiff) {
                // measure just completed

                // do stuff
                this.createNote();
            }
            this.lastMeasureDiff = measureDiff;

            if (this.beatPos >= this.beatReset) this.beatPos -= this.beatReset;
            if (this.measurePos >= this.measureReset) this.measurePos -= this.measureReset;

            // update player
            this.player.update(time, delta);

            // update notes
            this.notes.forEach(n => n.update(time, delta));

            for (let i = 0; i < this.notes.length; ) {
                if (this.notes[i].checkCollision(this.player)) {
                    this.noteHit(this.notes[i]);
                    this.notes[i].destroy();
                    this.notes.splice(i, 1); // remove the note
                }
                else {
                    ++i;
                }
            }

            for (let i = 0; i < this.notes.length; ) {
                if (this.notes[i].offScreen()) {
                    this.notes[i].destroy();
                    this.notes.splice(i, 1); // remove the note
                }
                else {
                    ++i;
                }
            }
        }
    }

    defineKeys() {
        keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        keyUP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        keyDOWN = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        keyENTER = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    }

    checkCollision(sprite1, sprite2) {
        let bounds1 = sprite1.getBounds();
        let bounds2 = sprite2.getBounds();
        return Phaser.Geom.Intersects.RectangleToRectangle(bounds1, bounds2);
    }

    noteHit(note) {
        this.sound.play('menu_select');
        this.health += 5;
    }

    createNote() {
        let width = Game.config.width;
        let height = Game.config.height;
        let newNote = new Note(this, width / 2, 0, 'note');
        newNote.setOrigin(0.5, 1);
        newNote.speed = (1 / UpdateTime.mRatio) * (1 / this.measureSig)
            * this.testBPM * (height - borderUISize);

        this.notes.push(newNote);
    }

    outOfHealth() {
        let width = Game.config.width;
        let height = Game.config.height;
        this.add.text(width/2, height/2, 'GAME OVER', this.scoreConfig).setOrigin(0.5);
        //this.add.text(width/2, height/2 + 64, 'Press (R) to Restart or <- for Menu',
        //    this.scoreConfig).setOrigin(0.5);
        this.gameOver = true;
        this.testTrack.setConfig('Synth 1', {mute : true});
        this.testTrack.setConfig('Drums', {mute : true});
    }
}