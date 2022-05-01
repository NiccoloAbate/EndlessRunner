# Team:
Niccolo Abate
Johnny Wong
Michael Jasper

# Game: Rhythm Runner
An endless runner rhythm game!

# Date Completed: 05/01/2022

# Created Tilt:
The center of our creative tilt comes from having high level audio effects and having most aspects of the game synced up with the beat of the music.

A small library for handling audio (and specifically multitrack audio) is in src/audiomanager.js.

Code for beat tracking is initialized in the create() method of Play (134-148) and updated in the update() method of Play (253-260, with on-8th, on-beat, and on-measure callbacks handled in the following blocks of code). The beat position stored in these variables is used throughout the rest of the Play scene.

Programmable note sequences (used for tutorial for example) or random note generation best of difficulty patterns. Tutorial sequence creation (src/scenes/play.js 181-188). Programmed sequence playback (src/scenes/play.js 269-285). Random note difficulty patterns creation (src/scenes/play.js 163-173). Random note generation based on difficulty patterns (src/scenes/play.js 288-305)

Audio effects include:

A slowdown effect which lerps the BPM / detune on the music track over time (src/scenes/play.js 644-686). All BPM dependent logic such as health drain and note speed as also updated accordingly to stay in sync, via the this.currentTrackInfo.BPM variable.

A track splitting effect in which certain parts of the track are muted when you lose the game. (src/scenes/play.js 605-606).

Other interesting creative tilts:

A player trail effect that using the average n positions of the player in order to smooth the trail while the player jumps over gaps immediately. (src/prefabs/player.js 138-157)

A gameover scene that is hosted on top of the play scene so that music continues and the game is still in the background. This required some clever scene handling code.

# Other Notes and Attributions
Some js utility functions were copied or adapted into src/utils.js (see comments in the file).

Track 1 was originally made for Niccolo's Rocket Patrol Mod, but edited and ported for this project, originally as a test track, but now included for some extra diversity of tracks. (https://github.com/NiccoloAbate/RocketPatrolMod)

After added several more tracks the load time increased a lot. 1 Track is too long and could be reduced, plus we would want background loading, but no time for that.

Lots of other fun improvements and inclusion we all wish we could have made! :)

