
let config = {
    type: Phaser.CANVAS,
    width: 640,
    height: 480,
    scene: [Menu, Play]
}

let borderUISize = config.height / 15;
let borderPadding = borderUISize / 3;

let Game = new Phaser.Game(config);

let Audio = new AudioManager;
let testTrackStemNames = ['Drums', 'Rhythm', 'Synth 1', 'Synth 2'];
let testTrackStemFileNames = ['assets/music/Play Music - Drums.wav', 'assets/music/Play Music - Rhythm.wav',
    'assets/music/Play Music - Synth 1.wav', 'assets/music/Play Music - Synth 2.wav'];

// reserve keyboard vars
let keyLEFT, keyRIGHT, keyUP, keyDOWN;
let keyW, keyA, keyS, keyD;
let keyENTER;
