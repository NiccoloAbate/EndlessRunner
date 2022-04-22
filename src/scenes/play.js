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

        this.testTrack1 = Audio.addMulti(this, 'testTrack1');
        this.testTrack1.setGlobalConfig({loop: true});
        this.testTrack1Info = testTrack1Info;

        this.trackVarNames = ['testTrack0', 'testTrack1'];

        // current track
        this.chooseRandomTrack();
        this.currentTrack.play();

        // beat/measure info (could be merged with track info as necessary)
        // current beat position (can be non-integer value)
        this.beatPos = 0;
        // current measure position (can be non-integer)
        this.measurePos = 0;
        // how many beats before the counter resets
        this.beatReset = this.currentTrackInfo.measureSig;
        // how many measures before the counter resets
        this.measureReset = 4;
        // beat diff from last loop (used to track when beats hit)
        this.lastBeatDiff = 1;
        // measure diff from last loop (used to track when beats hit)
        this.lastMeasureDiff = 1;

        // init notes array
        this.notes = new Array(0);

        // init lanes
        const nLanes = 3;
        this.lanes = new Array(3);
        for (let i = 0; i < nLanes; ++i) {
            this.lanes[i] = {};
            // spread the lanes evenly across the width
            this.lanes[i].x = (Game.config.width / (nLanes + 1)) * (i + 1);
        }

        // sets the metronome on/off
        this.metronome = false;

        // init effects
        this.inEffect = false;

        this.createDebugKeybinds();
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

            // compute beat and measure time using actual track time
            // BPM remains default even when shifted because of some Phaser audio oddity
            let useBPM = this.currentTrackDefaultInfo.BPM;
            this.beatPos = this.currentTrack.stems[0].seek * (1 / 60) * useBPM;
            this.measurePos = this.beatPos / this.currentTrackInfo.measureSig;
            this.beatPos %= this.beatReset;
            this.measurePos %= this.measureReset;


            let beatDiff = this.beatPos - Math.floor(this.beatPos);
            if (beatDiff < this.lastBeatDiff) {
                // beat just completed

                // do stuff
                this.beatCounterText.text = Math.floor(this.beatPos + 1);

                if (Math.floor(this.beatPos) % 2 == 0) {
                    this.createNote();
                }

                if (this.metronome)
                    this.sound.play('menu_select', {detune : 1200});
            }
            this.lastBeatDiff = beatDiff;
            let measureDiff = this.measurePos - Math.floor(this.measurePos);
            if (measureDiff < this.lastMeasureDiff) {
                // measure just completed

                // do stuff
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

                    const healthLoss = 5;
                    this.health -= healthLoss;
                }
                else {
                    ++i;
                }
            }
        }

        this.updateEffects(delta);
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
        // the amount of error from beat
        let beatDiff = Math.min(this.beatPos - Math.floor(this.beatPos),
            Math.ceil(this.beatPos) - this.beatPos);
        
        console.log(beatDiff);

        // health gained if perfectly on beat
        const maxHealthGain = 15;
        // ratio of how much error affects health gain
        const diffMult = 2;
        // health multiplier, min 0
        let healthMult = Math.max(1 - (beatDiff * diffMult), 0);

        // increment health
        this.health += maxHealthGain * healthMult;

        let det = (((-1 * beatDiff) + 0.5) * 2) * 1200;
        let sConfig = { detune: det };
        this.sound.play('menu_select', sConfig);
    }

    createNote() {
        let x = this.lanes[getRandomInt(0, this.lanes.length)].x;
        let newNote = new Note(this, x, 0, 'note');
        newNote.setOrigin(0.5, 0.5);
        newNote.setScale(1, 1.5);

        newNote.speed = this.computeNoteSpeed();

        // add note to current notes
        this.notes.push(newNote);
    }

    computeNoteSpeed() {
        let width = Game.config.width;
        let height = Game.config.height;
        // extra margin to give player a little time, if == 0 then note arrives exactly on beat
        const slideMargin = borderUISize * 0.75;
        // move speed of note based on BPM - note will cross screen in one measures time
        return (1 / UpdateTime.mRatio) * (1 / this.currentTrackInfo.measureSig)
        * this.currentTrackInfo.BPM * (height - borderUISize - slideMargin);
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

    chooseRandomTrack() {
        let nTracks = this.trackVarNames.length;
        let ind = getRandomInt(0, this.trackVarNames.length);
        let trackVarName = this.trackVarNames[ind];

        this.currentTrack = this[trackVarName];
        this.currentTrackDefaultInfo = this[trackVarName + 'Info'];
        // deep clone of object
        this.currentTrackInfo = JSON.parse(JSON.stringify(this.currentTrackDefaultInfo));
    }

    // playing with affects -- some spaghet code

    updateEffects(delta) {
        this.updateSlowEffect(delta);
    }

    updateSlowEffect(delta) {
        if (!this.speedTransition) return;

        const effectRampTime = 0.35; // second
        this.speedTransitionTime += delta;

        let effectPos = Math.min(1, (this.speedTransitionTime / UpdateTime.sRatio) / effectRampTime);
        if (this.slow) {
            this.currentTrackInfo.BPM = lerp(this.currentTrackDefaultInfo.BPM,
                this.currentTrackDefaultInfo.BPM / 2, effectPos);
        }
        else {
            this.currentTrackInfo.BPM = lerp(this.currentTrackDefaultInfo.BPM / 2,
                this.currentTrackDefaultInfo.BPM, effectPos);
        }
        
        if (effectPos == 1) {
            this.speedTransition = false;
            this.inEffect = false; // this is the only effect right now...
        }

        // −12log2(t1/t2) where t1 = tempo before change and t2 = tempo after change
        let speedRatio = this.currentTrackDefaultInfo.BPM / this.currentTrackInfo.BPM;
        let det = -12 * Math.log2(speedRatio) * 100;
        this.currentTrack.setGlobalConfig( {detune : det} );
        this.notes.forEach(n => n.speed = this.computeNoteSpeed());
    }
    startSlowDownEffect() {
        //this.currentTrackInfo.BPM = this.currentTrackDefaultInfo.BPM / 2;
        //this.currentTrack.setGlobalConfig( {detune : -1200} );

        this.slow = !this.slow;
        this.speedTransition = true;
        this.inEffect = true;
        this.speedTransitionTime = 0;

        //this.notes.forEach(n => n.speed = this.computeNoteSpeed());
        this.destroyAllNotes();
    }
    endSlowDownEffect() {
        //this.currentTrackInfo.BPM = this.currentTrackDefaultInfo.BPM;
        //this.currentTrack.setGlobalConfig( {detune : 0} );

        this.slow = !this.slow;
        this.speedTransition = true;
        this.inEffect = true;
        this.speedTransitionTime = 0;

        //this.notes.forEach(n => n.speed = this.computeNoteSpeed());
        this.destroyAllNotes();
    }

    destroyAllNotes() {
        this.notes.forEach(n => n.destroy());
        this.notes = new Array(0);
    }

    createDebugKeybinds() {
        this.input.keyboard.on('keydown-R', (event) => {
            this.currentTrack.destroy();
            this.scene.restart(); 
        });

        this.slow = false;
        this.speedTransition = false;
        this.speedTransitionTime = 0;
        this.input.keyboard.on('keydown-S', (event) => {
            if (this.speedTransition) return;

            if (this.slow)
                this.endSlowDownEffect();
            else
                this.startSlowDownEffect();
        });
    }
}