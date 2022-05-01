// See README for team, game name, breakdown, notes, etc.

let config = {
    type: Phaser.CANVAS,

    //Game Canvas scales with width and height of window
    width: window.innerWidth * window.devicePixelRatio * 0.75,
    height: window.innerHeight * window.devicePixelRatio,
    scene: [Menu, Play, GameOver]
}

let borderUISize = config.height / 15;
let borderPadding = borderUISize / 3;

let Game = new Phaser.Game(config);

let Audio = new AudioManager;
let Track0StemNames = ['Drums', 'Rhythm', 'Synth 1', 'Bass'];
let Track0StemFileNames = ['assets/music/Track 1 - Drums.wav', 'assets/music/Track 1 - Rhythm.wav',
    'assets/music/Track 1 - Synth 1.wav', 'assets/music/Track 1 - Bass.wav'];
let Track0Info = {
    BPM : 135,
    measureSig : 4,
}
let Track1StemNames = ['Drums', 'Synth 1', 'Bass'];
let Track1StemFileNames = ['assets/music/Track 2 - Drums.wav',
    'assets/music/Track 2 - Synth 1.wav', 'assets/music/Track 2 - Bass.wav'];
let Track1Info = {
    BPM : 140,
    measureSig : 4,
}
let Track2StemNames = ['Drums', 'Rhythm', 'Bass'];
let Track2StemFileNames = ['assets/music/Track 3 - Drums.wav',
    'assets/music/Track 3 - Rhythm.wav', 'assets/music/Track 3 - Bass.wav'];
let Track2Info = {
    BPM : 130,
    measureSig : 4,
}
let Track3StemNames = ['Drums', 'Synth 1', 'Bass'];
let Track3StemFileNames = ['assets/music/Track 4 - Drums.wav',
    'assets/music/Track 4 - Synth 1.wav', 'assets/music/Track 4 - Bass.wav'];
let Track3Info = {
    BPM : 135,
    measureSig : 4,
}


// reserve keyboard vars
let keyLEFT, keyRIGHT, keyUP, keyDOWN;
let keyW, keyA, keyS, keyD;
let keyENTER;
