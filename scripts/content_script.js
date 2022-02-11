'use strict';

(function() {
  window.AudioContext = window.AudioContext || window.webkitAudioContext;

  // constructor
  var Content = function() {
    // Fields
    // Audio
    this.audioCtx = new AudioContext();
    this.source = null;
    this.videoEl = null;
    this.input = this.audioCtx.createGain();
    this.peakings = new Array(10);
    this.nonPitchChangeMode = this.audioCtx.createGain();
    this.pitchChangeMode = this.audioCtx.createGain();
    this.chorusNode = this.audioCtx.createGain();
    this.robotNode1 = this.audioCtx.createGain();
    this.robotNode2 = this.audioCtx.createGain();
    this.jungle = new Jungle(this.audioCtx);
    this.jungle_chorus = new Jungle(this.audioCtx);
    this.jungle_robot1 = new Jungle(this.audioCtx);
    this.jungle_robot2 = new Jungle(this.audioCtx);
    this.panner = this.audioCtx.createStereoPanner();
    this.output = this.audioCtx.createGain();
    this.output2 = this.audioCtx.createGain();
    // delay
    this.delayNode = this.audioCtx.createDelay(5.0);
    this.wetlevel = this.audioCtx.createGain();
    this.drylevel = this.audioCtx.createGain();
    this.feedback = this.audioCtx.createGain();
    this.buffer = this.audioCtx.createBuffer(2, 88200, 44100);
    this.synthSource = this.audioCtx.createBufferSource();
    this.synthSource.buffer = this.buffer;
    this.synthSource.loop = true;
    this.synthSource.start()
    this.nonDelayMode = this.audioCtx.createGain();
    this.delayMode = this.audioCtx.createGain();
    // parameter
    this.loop = false;
    this.loopStart = 0;
    this.loopEnd = 1;
    this.pitch = 0;
    this.chorus = 0;
    this.robot1 = 0;
    this.robot2 = 0;
    this.reverb = 0;
    // other
    this.alreadyLoaded = false;
    this.hasVideo = false;

    connectNode(this);

    // default settings
    this.input.gain.value = 1;
    this.output.gain.value = 1;
    this.output2.gain.value = 1;
    this.jungle.setPitchOffset(0, false);
    this.jungle_chorus.setPitchOffset(0, false);
    this.jungle_robot1.setPitchOffset(0, false);
    this.jungle_robot2.setPitchOffset(0, false);
    this.nonPitchChangeMode.gain.value = 1;
    this.pitchChangeMode.gain.value = 0;
    this.chorusNode.gain.value = 0;
    this.robotNode1.gain.value = 0;
    this.robotNode2.gain.value = 0;
    this.panner.coneOuterGain = 1;
    // delay
    this.feedback.gain.value = 0;
    this.wetlevel.gain.value = 0;
    this.drylevel.gain.value = 0;
    this.nonDelayMode.gain.value = 1;
    this.delayMode.gain.value = 0;

    assignEvent(this);

    loadVideo(this);
  };

  // methods
  Content.prototype = {
    play: function() {
      this.videoEl.play();
    },
    pause: function() {
      this.videoEl.pause();
    },
    back: function(seconds) {
      this.videoEl.currentTime = this.videoEl.currentTime - seconds;
    },
    changeTime: function(seconds) {
      this.videoEl.currentTime = seconds;
    },
    changeVoice: function(value) {
      if (value <= -1){
        this.pitch = -20
      } else if (value >= 1){
        this.pitch = 20
      } else {
        this.pitch = 0
      }
      if (value === 0){
        this.nonPitchChangeMode.gain.value = 1;
        this.pitchChangeMode.gain.value = 0;
      } else {
        this.nonPitchChangeMode.gain.value = 0;
        this.pitchChangeMode.gain.value = 1;
      }
      this.jungle.setPitchOffset(pitchConvert(this.pitch), false);
    },
    makeChorus: function(value) {
      if (value === -1){
        this.chorus = -3;
      } else if (value === 0){
        this.chorus = 0;
      } else if (value === 1){
        this.chorus = 3;
      }
      if (value === -1){
        this.chorusNode.gain.value = 0.5;
      } else if (value === 0){
        this.chorusNode.gain.value = 0;
      } else if (value === 1){
        this.chorusNode.gain.value = 0.5;
      }
      this.jungle_chorus.setPitchOffset(pitchConvert(this.chorus), false);
    },
    makeRobot: function(value) {
      if (value === -1){
        this.robot1 = -3
        this.robot2 = -6
      } else if (value === 0){
        this.robot1 = 0
        this.robot2 = 0
      } else if (value === 1){
        this.robot1 = 3
        this.robot2 = 6
      }
      if (value === -1){
        this.robotNode1.gain.value = 1;
        this.robotNode2.gain.value = 1;
      } else if (value === 0){
        this.robotNode1.gain.value = 0;
        this.robotNode2.gain.value = 0;
      } else if (value === 1){
        this.robotNode1.gain.value = 1;
        this.robotNode2.gain.value = 1;
      }
      this.jungle_robot1.setPitchOffset(pitchConvert(this.robot1), false);
      this.jungle_robot2.setPitchOffset(pitchConvert(this.robot2), false);
    },
    makeDelay: function(value) {
      if (value === -1){
        this.feedback.gain.value = 0.85;
        this.wetlevel.gain.value = 0.4;
        this.drylevel.gain.value = 0.6;
        this.nonDelayMode.gain.value = 0;
        this.delayMode.gain.value = 1;
      } else if (value === 0){
        this.feedback.gain.value = 0;
        this.wetlevel.gain.value = 0;
        this.drylevel.gain.value = 0;
        this.nonDelayMode.gain.value = 1;
        this.delayMode.gain.value = 0;
      } else if (value === 1){
        this.feedback.gain.value = 0.95;
        this.wetlevel.gain.value = 0.4;
        this.drylevel.gain.value = 0.6;
        this.nonDelayMode.gain.value = 0;
        this.delayMode.gain.value = 1;
      }
    },
    make3DSound: function(value) {
      this.panner.pan.value = value;
    },
    enableLoop: function(isEnabled) {
      this.loop = isEnabled;
    },
    setLoopStart: function(seconds) {
      this.loopStart = seconds;
    },
    setLoopEnd: function(seconds) {
      this.loopEnd = seconds;
    }
  };

  // create instance
  new Content();
})();


/**
 * functions
 */

function connectNode(that) {
  eqSet(that);
  that.synthSource.connect(that.input);
  that.input.connect(that.peakings[0]);
  that.peakings[9].connect(that.pitchChangeMode);
  that.peakings[9].connect(that.nonPitchChangeMode);
  that.peakings[9].connect(that.chorusNode);
  that.peakings[9].connect(that.robotNode1);
  that.peakings[9].connect(that.robotNode2);
  that.pitchChangeMode.connect(that.jungle.input);
  that.nonPitchChangeMode.connect(that.output);
  that.chorusNode.connect(that.jungle_chorus.input);
  that.robotNode1.connect(that.jungle_robot1.input);
  that.robotNode2.connect(that.jungle_robot2.input);
  that.jungle.output.connect(that.output);
  that.jungle_chorus.output.connect(that.output);
  that.jungle_robot1.output.connect(that.output);
  that.jungle_robot2.output.connect(that.output);
  that.output.connect(that.nonDelayMode);
  that.output.connect(that.delayMode);
  // delay
  that.delayMode.connect(that.delayNode).connect(that.wetlevel).connect(that.output2);
  that.delayNode.connect(that.feedback).connect(that.delayNode);
  that.delayMode.connect(that.drylevel).connect(that.output2);
  that.nonDelayMode.connect(that.output2);
  // panner
  that.output2.connect(that.panner);
  that.panner.connect(that.audioCtx.destination);
}
function eqSet(that) {
  var frequency = 31.25;
  for (var i = 0; i < 10; i++) {
    var peaking = that.audioCtx.createBiquadFilter();
    if (i !== 0) {
      frequency *= 2;
    }
    peaking.type = (typeof peaking.type === 'string') ? 'peaking' : 5;
    peaking.frequency.value = frequency;
    peaking.Q.value = 2;
    peaking.gain.value = 0;
    that.peakings[i] = peaking;
  }
  that.peakings.forEach(function(peaking, index, ps) {
    if (index < 9) {
      peaking.connect(ps[index + 1]);
    }
  });
}

function loadVideo(that) {
  var video = document.getElementsByTagName('video')[0];
  if (video !== undefined && video.src !== '') {
    that.alreadyLoaded = true;
    that.hasVideo = true;
    that.source = that.audioCtx.createMediaElementSource(video);
    that.videoEl = that.source.mediaElement;
    that.source.connect(that.input);
    video.addEventListener('loadeddata', function() {
      that.loopEnd = video.duration;
    });
    return true;
  } else {
    return false;
  }
}

function assignEvent(that) {
  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    switch (message.type) {
      case 'init': {
        if (!that.alreadyLoaded) {
          if (!loadVideo(that)) {
            return true;
          }
        }
        if (that.videoEl.src === '') {
          that.hasVideo = false;
          return true;
        } else {
          that.hasVideo = true;
        }
        sendResponse({
          currentTime: that.videoEl.currentTime,
          duration: that.videoEl.duration,
          loop: that.loop,
          loopStart: that.loopStart,
          loopEnd: that.loopEnd,
          isPaused: that.videoEl.paused,
          volume: that.videoEl.volume,
          speed: that.videoEl.playbackRate,
          pitch: that.pitch,
          chorus: that.chorus,
          robot1: that.robot1,
          robot2: that.robot2,
          delay: that.delay,
          sound3D: that.sound3D,
        });
        that.videoEl.addEventListener('timeupdate', function() {
          // update current time
          chrome.runtime.sendMessage({
            type: 'timeupdate',
            tabId: message.tabId,
            currentTime: that.videoEl.currentTime,
            duration: that.videoEl.duration},
            function(response) {
          });
          // Loop setting
          if (that.loop && that.loopEnd <= that.videoEl.currentTime) {
            that.videoEl.currentTime = that.loopStart;
            if (that.videoEl.paused) {
              that.videoEl.play();
            }
          }
        });
        return true;
      }
      case 'reloadVideo': {
        if (!that.alreadyLoaded) {
          setTimeout(function () {
            loadVideo(that);
          }, 500);
        }
        break;
      }
      case 'play': {
        if (!that.hasVideo) {break;}
        that.play();
        break;
      }
      case 'pause': {
        if (!that.hasVideo) {break;}
        that.pause();
        break;
      }
      case 'back': {
        if (!that.hasVideo) {break;}
        that.back(message.seconds);
        break;
      }
      case 'changeTime': {
        if (!that.hasVideo) {break;}
        that.changeTime(message.seconds);
        break;
      }
      case 'changeVoice': {
        if (!that.hasVideo) {break;}
        that.changeVoice(message.pitch);
        break;
      }
      case 'makeChorus': {
        if (!that.hasVideo) {break;}
        that.makeChorus(message.chorus);
        break;
      }
      case 'makeRobot': {
        if (!that.hasVideo) {break;}
        that.makeRobot(message.robot);
        break;
      }
      case 'makeDelay': {
        if (!that.hasVideo) {break;}
        that.makeDelay(message.delay);
        break;
      }
      case 'make3DSound': {
        if (!that.hasVideo) {break;}
        that.make3DSound(message.sound3D);
        break;
      }
      case 'enableLoop': {
        if (!that.hasVideo) {break;}
        that.enableLoop(message.isEnabled);
        break;
      }
      case 'setLoopStart': {
        if (!that.hasVideo) {break;}
        that.setLoopStart(message.seconds);
        break;
      }
      case 'setLoopEnd': {
        if (!that.hasVideo) {break;}
        that.setLoopEnd(message.seconds);
        break;
      }
    }
  });
}

function pitchConvert(originPitchNum) {
  if (originPitchNum > 0) {
    return (Math.pow(Math.pow(2, 1/ 12), originPitchNum) - 1) * 2;
  } else if (originPitchNum < 0) {
    return -1 + (Math.pow(Math.pow(2, 1/ 12), (12 + originPitchNum)) - 1);
  } else {
    return 0;
  }
}
