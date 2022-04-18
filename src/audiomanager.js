function applyConfigToSound(sound, config) {
    if (config.loop != undefined) {
        sound.setLoop(config.loop);
    }
    if (config.mute != undefined) {
        sound.setMute(config.mute);
    }
    if (config.volume != undefined) {
        sound.setVolume(config.volume);
    }
    if (config.detune != undefined) {
        sound.setDetune(config.detune);
    }
}

class AudioMultiTrack {
    constructor(stems, stemNames, configs = undefined) {
        this.stems = stems;
        this.stemNames = stemNames;
        this.configs = configs;
    }

    setGlobalConfig(config) {
        this.stems.forEach(s => applyConfigToSound(s, config));
    }

    setConfig(stemName, config) {
        let ind = this.stemNames.findIndex(x => x == stemName);
        applyConfigToSound(this.stems[ind], config);
    }

    play() {
        for (let i = 0; i < this.stems.length; ++i) {
            if (this.configs != undefined && this.configs[i] != undefined) {
                this.stems[i].play(config=this.configs[i]);
            }
            else {
                this.stems[i].play();
            }
        }
    }

    destroy() {
        this.stems.forEach(s => s.destroy());
    }
}

class AudioManager {
    preload(scene) {
        this.testaudio = new Array(1);
        //scene.load.audio('test music', 'assets/abateniccolo.steppingstones.wav')
    }

    testPlay() {
        //Game.sound.play('test music');
    }

    testRemove() {
        //Game.sound.remove('test music');
    }

    testGet() {

    }

    preloadMulti(scene, trackName, stemFileNames, stemNames) {
        this[trackName] = {};
        this[trackName].stemNames = stemNames;
        for (let i = 0; i < stemFileNames.length; ++i) {
            scene.load.audio(stemNames[i], stemFileNames[i]);
        }
    }

    addMulti(scene, trackName, configs = undefined) {
        let stems = new Array(this[trackName].stemNames.length);
        for (let i = 0; i < stems.length; ++i) {
            stems[i] = scene.sound.add(this[trackName].stemNames[i]);
        }

        let track = new AudioMultiTrack(stems, this[trackName].stemNames, configs);
        return track;
    }
}
