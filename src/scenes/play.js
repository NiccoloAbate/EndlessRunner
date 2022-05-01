class Play extends Phaser.Scene {
    constructor() {
        super("play");
    }

    preload() {
        
    }

    create() {
        let width = config.width;
        let height = config.height;

        // define key variables
        this.defineKeys();

        // init background
        this.backgrounds = new Array(1);
        this.backgrounds[0] = this.add.tileSprite(0, 0, width, height, 'background0').setOrigin(0, 0);
        // manually adjust background size
        this.backgrounds[0].displayWidth = Game.config.width;
        this.backgrounds[0].displayHeight = Game.config.height;
        //this.backgrounds[1] = this.add.tileSprite(0, 0, width, height, 'background1').setOrigin(0, 0);
        this.backgrounds.forEach(b => b.setDepth(-2));
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
        this.player.setScale(width/150, height/500);
        this.player.setControls(keyLEFT, keyRIGHT);
        
        let rectColor = 0x00FF00;
        let borderColor = 0xFFFFFF;

        // display score
        this.scoreConfig = {
            fontFamily: 'Courier',
            fontSize: '28px',
            backgroundColor: '#FFFFFF',
            color: '#000000',
            align: 'right',
            padding: {
            top: 5,
            bottom: 5,
            },
            fixedWidth: 100
        }
        this.scoreLeft = this.add.text(borderUISize + borderPadding, borderUISize,
            Game.player.score, this.scoreConfig);
        this.scoreLeft.setDepth(2);
        this.scoreLeft.setOrigin(0.5, 0.5);
        // display beat counter
        this.beatCounterText = this.add.text(width - borderUISize - borderUISize,
            borderUISize, 1, this.scoreConfig);
        this.beatCounterText.setDepth(2);
        this.beatCounterText.setOrigin(0.5, 0.5);

        // init health and health counter
        this.maxHealth = 150;
        this.health = this.maxHealth;
        this.healthTextConfig = {
            fontFamily: 'Courier',
            fontSize: '28px',
            backgroundColor: '#FFFFFF',
            color: '#000000',
            align: 'center',
            padding: {
            top: 5,
            bottom: 5,
            },
            fixedWidth: 100
        }
        this.formatHealthText = h => Math.max(Math.floor(h), 0); 
        //this.healthText = this.add.text((width / 2) - (this.healthTextConfig.fixedWidth / 2),
        //    borderUISize, this.formatHealthText(this.timeLeft), this.healthTextConfig);
        //this.healthText.setOrigin(0.5, 0.5);
        //this.healthText.setDepth(2);

        const healthBarInteriorX = 228;
        this.healthBarInterior = this.add.rectangle(healthBarInteriorX, borderUISize, 200, 18, '0xFF0000').setOrigin(0, 0.5);
        const healthBarXOffset = 20;
        this.healthBar = this.add.image(width / 2 + healthBarXOffset, borderUISize, 'healthBar').setOrigin(0.5, 0.5);
        this.healthBar.scaleX = 0.5;
        this.healthBar.scaleY = 1.0;

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

        // GAME OVER flag
        this.gameOver = false;

        // add tracks
        this.Track0 = Audio.addMulti(this, 'Track0');
        this.Track0.setGlobalConfig({loop: true});
        this.Track0Info = Track0Info;

        this.Track1 = Audio.addMulti(this, 'Track1');
        this.Track1.setGlobalConfig({loop: true});
        this.Track1Info = Track1Info;

        this.Track2 = Audio.addMulti(this, 'Track2');
        this.Track2.setGlobalConfig({loop: true});
        this.Track2Info = Track2Info;

        this.Track3 = Audio.addMulti(this, 'Track3');
        this.Track3.setGlobalConfig({loop: true});
        this.Track3Info = Track3Info;

        this.trackVarNames = ['Track0', 'Track1', 'Track2', 'Track3'];

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
        // 8th diff from last loop (used to track when beats hit)
        this.lastEigthDiff = 1;

        // init notes array
        this.notes = new Array(0);

        // init lanes
        this.initLanes(3);
        this.maxNumLanes = 4;

        // sets the metronome on/off
        this.metronome = false;

        // init effects
        this.effects = new Array(0);

        this.difficultyPatterns = [
            [0, 0, 0, 0],
            [1, 0, 0, 0],
            [1, 0, 1, 0],
            [1, 0, 1, 1],
            [1, 0.25, 1, 0, 1, 0.25, 0, 0],
            [1, 0.25, 1, 0.25, 1, 0, 1, 0.25]
        ];
        // no 8th note difficulty -- could be [1, 0.5, 1, 0.5, 1, 0.5, 1, 0.5] if implemented
        this.difficultyTimeThresholds = [1.5, 7.5, 30, 60, 90, 120];
        this.difficultyLevel = 0;

        this.playTime = 0;

        this.trackSwitchTime = 120;
        this.readyToSwitchTracks = false;
        this.tracksCompleted = 0;

        this.tutorialSequence = [
            { beat: 4, chance: 1, type: 'note' },
            { beat: 8, chance: 1, type: 'obstacle' },
            { beat: 12, chance: 1, type: 'slowPower' },
            { beat: 14, chance: 1, type: 'END'}
        ]
        this.currentSequence = this.tutorialSequence;
        this.currentSequenceIndex = 0;

        this.createDebugKeybinds();

        this.flashArrows();
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

    update(time, delta) {
        // check key input for restart
        if (this.gameOver) {
            if (Phaser.Input.Keyboard.JustDown(keyENTER)) {
                //this.restart();
            }
        }

        // scroll paralax backgrounds along given scroll axis
        const scrollAxis = 'tilePositionY';
        for (let i = 0; i < this.backgrounds.length; ++i) {
            this.backgrounds[i][scrollAxis] -= this.backgroundScrollSpeeds[i];
        }

        if (!this.gameOver) {
            // update health
            // slowdown ratio
            const healthSpeed = 5 / UpdateTime.sRatio; // 5 per second
            let BPMRatio = this.currentTrackInfo.BPM / this.currentTrackDefaultInfo.BPM;
            this.health -= delta * healthSpeed * BPMRatio;
            this.updateHealthBar(this.formatHealthText(this.health));

            this.playTime += delta;

            // difficulty level
            if (this.difficultyLevel < this.difficultyPatterns.length - 1) {
                let nextTreshold = this.difficultyTimeThresholds[this.difficultyLevel];
                if ((this.playTime / UpdateTime.sRatio) > nextTreshold) {
                    this.difficultyLevel++;
                }
            }            

            if ((this.playTime / UpdateTime.sRatio) > this.trackSwitchTime) {
                // time to initiate switch track
                this.readyToSwitchTracks = true;
            }

            if (this.health <= 0) {
                //this.music.setGlobalConfig({detune: 0});
                this.outOfHealth();
                return;
            }

            // compute beat and measure time using actual track time
            // BPM remains default even when shifted because of some Phaser audio oddity
            let useBPM = this.currentTrackDefaultInfo.BPM;
            this.totalBeatPos = this.currentTrack.stems[0].seek * (1 / 60) * useBPM;
            this.totalMeasurePos = this.beatPos / this.currentTrackInfo.measureSig;
            this.beatPos = this.totalBeatPos % this.beatReset;
            this.eigthPos = this.beatPos * 2.0;
            this.measurePos = this.totalMeasurePos % this.measureReset;


            let eigthDiff = this.eigthPos - Math.floor(this.eigthPos);
            if (eigthDiff < this.lastEigthDiff) {
                // 8th noted just completed

                // do stuff
                if (this.currentSequence != undefined) {
                    // read notes from sequence
                    let currentSequenceNode = this.currentSequence[this.currentSequenceIndex];
                    if (this.totalBeatPos >= currentSequenceNode.beat) {
                        if (currentSequenceNode.type == 'END') {
                            // end sequence
                            this.currentSequence = undefined;
                            this.currentSequenceIndex = 0;
                        }
                        else {
                            // note in sequence
                            if (Math.random() < currentSequenceNode.chance) {
                                this.createNote(currentSequenceNode.type);
                            }

                            ++this.currentSequenceIndex;
                        }
                    }
                }
                else {
                    // random notes from difficulty pattern
                    let difficultyPattern = this.difficultyPatterns[this.difficultyLevel];
                    if (difficultyPattern.length == 4) {
                        // four note beat pattern
                        if (isEven(Math.floor(this.eigthPos))) {
                            // must be even note, i.e. a beat
                            let notePercent = difficultyPattern[Math.floor(this.beatPos)];
                            if (Math.random() < notePercent) {
                                this.createNote();
                            }
                        } 
                    }
                    else {
                        let notePercent = difficultyPattern[Math.floor(this.eigthPos)];
                        if (Math.random() < notePercent) {
                            this.createNote();
                        }
                    }
                }
            }
            this.lastEigthDiff = eigthDiff;
            
            let beatDiff = this.beatPos - Math.floor(this.beatPos);
            if (beatDiff < this.lastBeatDiff) {
                // beat just completed

                // do stuff
                this.beatCounterText.text = Math.floor(this.beatPos + 1);

                if (this.metronome)
                    this.sound.play('menu_select', {detune : 1200});
            }
            this.lastBeatDiff = beatDiff;

            let measureDiff = this.measurePos - Math.floor(this.measurePos);
            if (measureDiff < this.lastMeasureDiff) {
                // measure just completed

                // do stuff
                if (this.readyToSwitchTracks) {
                    this.readyToSwitchTracks = false;
                    // for now just do this to switch, should do some sort of fade out/in...
                    // reset old track
                    this.currentTrack.pause();
                    this.currentTrack.setGlobalConfig({seek : 0});
                    // get random new track
                    this.chooseRandomDifferentTrack();
                    // play random new track
                    this.currentTrack.play();
                    // reset playtime and difficulty -- something better should be here
                    this.playTime = 0;
                    this.difficultyLevel = 0;
                    ++this.tracksCompleted;
                    // increase lanes every 2 tracks, might get out of hand but would take a while
                    if (this.tracksCompleted % 2 == 0) {
                        this.initLanes(Math.min(this.lanes.length + 1, this.maxNumLanes));
                    }
                    
                    this.destroyAllNotes();
                }
            }
            this.lastMeasureDiff = measureDiff;

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
                    this.noteMissed(this.notes[i]);
                    this.notes[i].destroy();
                    this.notes.splice(i, 1); // remove the note
                }
                else {
                    ++i;
                }
            }
        }

        this.updateEffects(delta);
    }

    updateHealthBar(newHealth) {
        //this.healthText.text = newHealth;
        this.healthBarInterior.scaleX = newHealth / this.maxHealth;
    }

    healthBarShake() {
        const tweenDuration = 250;
        this.tweens.add({ 
            targets: [this.healthBar, this.healthBarInterior], 
            alpha: { from: 0, to: 1.0 },
            scaleY: { from: 0, to: 1.0},
            duration: tweenDuration,
            ease: 'Linear',
            repeat: 4
        });
    }

    flashArrows() {
        let leftArrow = this.add.image(this.lanes[0].x, Game.config.height / 2, 'leftArrow');
        leftArrow.setOrigin(0.5, 0.5);
        let rightArrow = this.add.image(this.lanes[this.lanes.length - 1].x, Game.config.height / 2, 'rightArrow');
        rightArrow.setOrigin(0.5, 0.5);

        const flashDuration = 2 * UpdateTime.sRatio;
        this.tweens.add({ 
            targets: leftArrow, 
            scaleX: { from: 5, to: 0 },
            scaleY: { from: 5, to: 0},
            duration: flashDuration,
            ease: 'Linear',
            repeat: 0
        });
        this.time.delayedCall(flashDuration, () => leftArrow.destroy());
        this.tweens.add({ 
            targets: rightArrow, 
            scaleX: { from: 5, to: 0 },
            scaleY: { from: 5, to: 0},
            duration: flashDuration,
            ease: 'Linear',
            repeat: 0
        });
        this.time.delayedCall(flashDuration, () => rightArrow.destroy());
    }

    restart() {
        this.currentTrack.destroy();
        this.scene.restart();
    }

    stop() {
        this.currentTrack.pause();
        this.currentTrack.setGlobalConfig({seek : 0});
        this.scene.stop();
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

    noteMissed(note) {
        if (note.type == 'note') {
            this.normalNoteMissed(note);
        }
        else if (note.type == 'slowPower') {
            this.normalNoteMissed(note);
        }
        else if (note.type == 'obstacle') {
            // nothing happens
        }
    }
    normalNoteMissed(note) {
        const healthLoss = 20;
        this.health -= healthLoss;

        this.healthBarShake();
    }

    noteHit(note) {
        if (note.type == 'note') {
            this.normalNoteHit(note);
        }
        else if (note.type == 'slowPower') {
            this.slowPowerHit(note);
        }
        else if (note.type == 'obstacle') {
            this.obstacleHit(note);
        }
    }
    normalNoteHit(note) {
        // the amount of error from target beat
        let beatDiff = Math.min(Math.abs(this.beatPos - note.targetBeat),
        Math.abs(this.beatPos - (note.targetBeat + this.currentTrackInfo.measureSig)));
        console.log('beat ' + this.beatPos);
        console.log('target ' + note.targetBeat);
        
        //console.log(beatDiff);

        // health gained if perfectly on beat
        const maxHealthGain = 10;
        // ratio of how much error affects health gain
        const diffMult = 2;
        // health multiplier, min 0
        let healthMult = Math.max(1 - (beatDiff * diffMult), 0);

        
        // increment health
        this.health += maxHealthGain * healthMult / this.difficultyLevel * 1.5;
        console.log('diff ' + maxHealthGain * healthMult / this.difficultyLevel * 1.5);

        console.log("");
        // snap health to valid range
        this.health = Math.min(this.health, this.maxHealth);

        // increment score
        Game.player.score += maxHealthGain * healthMult;
        this.scoreLeft.text = Math.floor(Game.player.score);

        let det = (((-1 * beatDiff) + 0.5) * 2) * 1200;
        let sConfig = { detune: det };
        this.sound.play('menu_select', sConfig);
    }
    slowPowerHit(note) {
        this.normalNoteHit(note);

        this.startSlowDownEffect();
    }
    obstacleHit(note) {
        const healthLoss = 20;
        this.health -= healthLoss;

        let sConfig = { detune: -1200, volume: 0.75 };
        this.sound.play('menu_select', sConfig);

        this.healthBarShake();
    }

    createNote(type) {
        let spriteName;
        
        if (type == undefined) {
            // could add more note types
            let noteTypes = ['note', 'slowPower', 'obstacle'];
            let typeWeights = [0.9, 0.02, 0.08];
            type = randomChoiceWeighted(noteTypes, typeWeights);
        }

        if (type == 'note') {
            spriteName = 'note';
        }
        else if (type == 'slowPower') {
            spriteName = 'power';
        }
        else if (type == 'obstacle') {
            spriteName = 'obstacle';
        }

        let laneInd = getRandomInt(0, this.lanes.length);
        let x = this.lanes[laneInd].x;
        let newNote = new Note(this, x, 0, spriteName);
        newNote.setOrigin(0.5, 0.5);
        newNote.setScale(3.0, 3.0);
        newNote.type = type;

        newNote.speed = this.computeNoteSpeed();
        newNote.targetBeat = this.computeNoteTargetBeat();
        newNote.laneInd = laneInd;

        //console.log(newNote.targetBeat);

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
    computeNoteTargetBeat() {
        return (Math.floor(this.eigthPos) / 2);
    }

    outOfHealth() {
        this.gameOverMenu();
        this.gameOver = true;
        this.currentTrack.setConfig('Synth 1', {mute : true});
        this.currentTrack.setConfig('Drums', {mute : true});
    }
    gameOverMenu() {
        this.player.destroy();
        Game.scene.start('gameover');
    }

    chooseRandomTrack() {
        let ind = getRandomInt(0, this.trackVarNames.length);
        let trackVarName = this.trackVarNames[ind];

        this.currentTrackVarName = trackVarName;
        this.currentTrack = this[trackVarName];
        this.currentTrackDefaultInfo = this[trackVarName + 'Info'];
        // deep clone of object
        this.currentTrackInfo = JSON.parse(JSON.stringify(this.currentTrackDefaultInfo));
    }

    chooseRandomDifferentTrack() {
        let clippedTracks = [...this.trackVarNames];
        clippedTracks.splice(clippedTracks.indexOf(this.currentTrackVarName), 1);
        let ind = getRandomInt(0, clippedTracks.length);
        let trackVarName = clippedTracks[ind];

        this.currentTrackVarName = trackVarName;
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
        if (this.slow) {
            this.slowEffectTime += delta;
            if (this.slowEffectTime / UpdateTime.sRatio >= this.slowEffectLength) {
                this.endSlowDownEffect();
            }
        }

        if (!this.speedTransition) return;

        const effectRampTime = 0.5; // second
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
        }

        // −12log2(t1/t2) where t1 = tempo before change and t2 = tempo after change
        let speedRatio = this.currentTrackDefaultInfo.BPM / this.currentTrackInfo.BPM;
        let det = -12 * Math.log2(speedRatio) * 100;
        this.currentTrack.setGlobalConfig( {detune : det} );
        this.notes.forEach(n => n.speed = this.computeNoteSpeed());
    }
    startSlowDownEffect() {
        this.slow = !this.slow;
        this.speedTransition = true;
        this.speedTransitionTime = 0;
        this.slowEffectLength = 5; // s
        this.slowEffectTime = 0;
    }
    endSlowDownEffect() {
        this.slow = !this.slow;
        this.speedTransition = true;
        this.speedTransitionTime = 0;
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

        this.input.keyboard.on('keydown-L', (event) => {
            this.player.snapToLanes = !this.player.snapToLanes;
            this.player.snapToClosestLane();
        });
        

        //difficulty level shortcuts
        //  this.difficultyTimeThresholds = [1.5, 7.5, 30, 60, 90, 150];
        this.input.keyboard.on('keydown-ONE', (event) => {
            this.playTime = 7500;
            this.difficultyLevel = 1;
            console.log(this.difficultyLevel);
        });

        this.input.keyboard.on('keydown-TWO', (event) => {
            this.playTime = 30000;
            this.difficultyLevel = 2;
            console.log(this.difficultyLevel);
        });
        this.input.keyboard.on('keydown-THREE', (event) => {
            this.playTime = 60000;
            this.difficultyLevel = 3;
            console.log(this.difficultyLevel);
        });
        this.input.keyboard.on('keydown-FOUR', (event) => {
            this.playTime = 90000;
            this.difficultyLevel = 4;
            console.log(this.difficultyLevel);
        });
        this.input.keyboard.on('keydown-FIVE', (event) => {
            this.playTime = 150000;
            this.difficultyLevel = 5;
            console.log(this.difficultyLevel);
        });
        this.input.keyboard.on('keydown-ZERO', (event) => {
            this.playTime = 0;
            this.difficultyLevel = 0;
            console.log(this.difficultyLevel);
        });
    }
}