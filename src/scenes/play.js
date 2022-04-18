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

        // define key variables
        this.defineKeys();

        // init background
        this.backgrounds = new Array(2);
        this.backgrounds[0] = this.add.tileSprite(0, 0, width, height, 'background0').setOrigin(0, 0);
        this.backgrounds[1] = this.add.tileSprite(0, 0, width, height, 'background1').setOrigin(0, 0);
        this.backgroundScrollSpeeds = new Array(2);
        this.backgroundScrollSpeeds[0] = 4;
        this.backgroundScrollSpeeds[1] = 1;

        // init player settings
        Game.player = {
            score : 0
        };

        // init player entity
        this.player = new Player(this, width/2, height - borderUISize - borderPadding, 'player');
        this.player.setOrigin(0.5, 0);
        this.player.setControls(keyLEFT, keyRIGHT);

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
        // display beat counter
        this.beatCounterText = this.add.text(width - borderUISize - borderPadding - this.scoreConfig.fixedWidth,
            borderUISize + borderPadding*2, 1, this.scoreConfig);

        // init health and health counter
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

        // add tracks
        this.testTrack0 = Audio.addMulti(this, 'testTrack0');
        this.testTrack0.setGlobalConfig({loop: true});
        this.testTrack0Info = testTrack0Info;

        // current track
        this.currentTrack = this.testTrack0;
        this.currentTrack.play();
        this.currentTrackInfo = this.testTrack0Info;

        // running info (could be merged with track info as necessary)
        this.beatPos = 1;
        this.measurePos = 1;
        this.beatReset = this.currentTrackInfo.measureSig;
        this.measureReset = 4;
        this.lastBeatDiff = 1;
        this.lastMeasureDiff = 1;

        // init notes array
        this.notes = new Array(0);
    }

    update(time, delta) {
        // check key input for restart
        if (this.gameOver) {
            //this.sound.play('sfx_select');
            //this.music.destroy();
            if (Phaser.Input.Keyboard.JustDown(keyENTER)) {
                this.currentTrack.destroy();
                this.scene.restart();
            }
        }

        // scroll paralax backgrounds along given scroll axis
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

            // compute beat and measure time
            let beatDelta = (delta / UpdateTime.mRatio) * this.currentTrackInfo.BPM;
            this.beatPos += beatDelta;
            this.measurePos += beatDelta / this.currentTrackInfo.measureSig;

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

            // check notes collision with player
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

            // check notes off screen
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

        // the amount of error from beat
        let beatDiff = Math.min(this.beatPos - Math.floor(this.beatPos),
            Math.ceil(this.beatPos) - this.beatPos);
        

        // health gained if perfectly on beat
        const maxHealthGain = 10;
        // ratio of how much error affects health gain
        const diffMult = 2;
        // health multiplier, min 0
        let healthMult = Math.max(1 - (beatDiff * diffMult), 0);

        // increment health
        this.health += maxHealthGain * healthMult;
    }

    createNote() {
        let width = Game.config.width;
        let height = Game.config.height;
        let newNote = new Note(this, width / 2, 0, 'note');
        newNote.setOrigin(0.5, 1);
        // move speed of note based on BPM - note will cross screen in one measures time
        newNote.speed = (1 / UpdateTime.mRatio) * (1 / this.currentTrackInfo.measureSig)
            * this.currentTrackInfo.BPM * (height - borderUISize);

        // add note to current notes
        this.notes.push(newNote);
    }

    outOfHealth() {
        let width = Game.config.width;
        let height = Game.config.height;
        this.add.text(width/2, height/2, 'GAME OVER', this.scoreConfig).setOrigin(0.5);
        //this.add.text(width/2, height/2 + 64, 'Press (R) to Restart or <- for Menu',
        //    this.scoreConfig).setOrigin(0.5);
        this.gameOver = true;
        this.currentTrack.setConfig('Synth 1', {mute : true});
        this.currentTrack.setConfig('Drums', {mute : true});
    }
}