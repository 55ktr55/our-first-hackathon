'use strict';

(function () {
  // constructor
  var Popup = function() {
    // fields
    this.seeking = false;
    this.currentTime = 0;
    this.duration = 1;
    this.loop = false;
    this.loopStart = 0;
    this.loopEnd = 1;
    this.isPaused = true;
    this.volume = 50;
    this.speed = 100;
    this.pitch = 0;
    this.chorus = 0;
    this.robot = 0;
    this.delay = 0;
    this.sound3D = 0;
    this.slider = document.getElementById('slider');
    noUiSlider.create(this.slider, {
      start: [this.loopStart, this.loopEnd],
      connect: true,
      behaviour: 'none',
      range: {
        'min': this.loopStart,
        'max': this.loopEnd
      }
    });
  };

  // create instance
  var popup = new Popup();

  // send initialization message to content script
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {type: 'init', tabId: tabs[0].id}, function(response) {
      if (response !== undefined) {
        initPrams(popup, response);
      }
    });
  });

  // Event Listeners
  $('#loop-slider').on('click', function() {
    if(popup.loop) {
      popup.loop  = false;
      $('#loop-switch').attr('checked', false);
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type: 'enableLoop', isEnabled: false});
      });
    } else {
      popup.loop  = true;
      $('#loop-switch').attr('checked', true);
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type: 'enableLoop', isEnabled: true});
      });
    }
  });
  $('#seek-bar-range').on('input', function() {
    var val = Number($(this).val());
    popup.seeking = true;
    $('#current-time').text(convertSeconds(val));
  });
  $('#seek-bar-range').on('change', function() {
    var val = Number($(this).val());
    popup.seeking = false;
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: 'changeTime', seconds: val});
    });
  });
  $('#play-btn').on('click', function () {
    if (popup.isPaused) {
      $('#play-btn-svg').css('display', 'none');
      $('#pause-btn-svg').css('display', 'inline');
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type: 'play'});
      });
    } else {
      $('#play-btn-svg').css('display', 'inline');
      $('#pause-btn-svg').css('display', 'none');
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type: 'pause'});
      });
    }
    popup.isPaused = !popup.isPaused;
  });
  $('#voice-range').on('input', function () {
    var val = Number($(this).val());
    var text;
    if (val === -1){
      text = '低音';
    } else if (val === 1){
      text = '高音';
    } else {
      text = 'なし';
    }
    $("#voice-num").text(text);
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: 'changeVoice', pitch: val});
    });
  });
  $('#chorus-range').on('input', function () {
    var val = Number($(this).val());
    var text;
    if (val === -1){
      text = '下コーラス';
    } else if (val === 0){
      text = 'なし';
    } else if (val === 1){
      text = '上コーラス';
    }
    $("#chorus-num").text(text);
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: 'makeChorus', chorus: val});
    });
  });
  $('#robot-range').on('input', function () {
    var val = Number($(this).val());
    var text;
    if (val === -1){
      text = 'ロボット低音';
    } else if (val === 0){
      text = 'なし';
    } else if (val === 1){
      text = 'ロボット高音';
    }
    $("#robot-num").text(text);
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: 'makeRobot', robot: val});
    });
  });
  $('#delay-range').on('input', function () {
    var val = Number($(this).val());
    var text;
    if (val === -1){
      text = '弱';
    } else if (val === 0){
      text = 'なし';
    } else if (val === 1){
      text = '強';
    }
    $("#delay-num").text(text);
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: 'makeDelay', delay: val});
    });
  });
  $('#3DSound-range').on('input', function () {
    var val = Number($(this).val());
    val /= 100;
    var text;
    if (val === 0){
      text = 'なし';
    } else if (val < 0){
      text = '左 '+Math.abs(val);
    } else if (val > 0){
      text = '右 '+val;
    }
    $("#3DSound-num").text(text);
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: 'make3DSound', sound3D: val});
    });
  });
  $('#voice-reset-btn').on('click', function () {
    $("#voice-num").text('なし');
    $('#voice-range').val(0);
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: 'changeVoice', pitch: 0});
    });
  });
  $('#chorus-reset-btn').on('click', function () {
    $("#chorus-num").text('なし');
    $('#chorus-range').val(0);
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: 'makeChorus', chorus: 0});
    });
  });
  $('#robot-reset-btn').on('click', function () {
    $("#robot-num").text('なし');
    $('#robot-range').val(0);
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: 'makeRobot', robot: 0});
    });
  });
  $('#delay-reset-btn').on('click', function () {
    $("#delay-num").text('なし');
    $('#delay-range').val(0);
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: 'makeDelay', delay: 0});
    });
  });
  $('#3DSound-reset-btn').on('click', function () {
    $("#3DSound-num").text('なし');
    $('#3DSound-range').val(0);
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: 'make3DSound', sound3D: 0});
    });
  });
  popup.slider.noUiSlider.on('update', function(values, handle) {
    if (handle === 0) {
      $("#loop-start-num").text(convertSeconds(values[0]));
    } else if (handle === 1) {
      $("#loop-end-num").text(convertSeconds(values[1]));
    }
  });
  popup.slider.noUiSlider.on('end', function(values, handle){
    if (handle === 0) {
      popup.loopStart = Number(values[0]);
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type: 'setLoopStart', seconds: Number(values[0])});
      });
    } else if (handle === 1) {
      popup.loopEnd = Number(values[1]);
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type: 'setLoopEnd', seconds: Number(values[1])});
      });
    }
  });

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if(tabs[0].id === request.tabId) {
        if (request.type === 'timeupdate') {
          if (!popup.seeking) {
            $('#seek-bar-range').val(request.currentTime);
            $('#current-time').text(convertSeconds(request.currentTime));
          }
          if (request.duration !== popup.duration) {
            popup.duration = request.duration;
            $('#seek-bar-range').attr('max', request.duration);
            $('#duration').text(convertSeconds(request.duration));
            popup.slider.noUiSlider.updateOptions({
              range: {
                'min': 0,
                'max': request.duration
              }
            });
            popup.slider.noUiSlider.set([0, request.duration]);
            popup.loopStart = 0;
            popup.loopStart = request.duration;
            $('#loop-start-num').text(convertSeconds(0));
            $('#loop-end-num').text(convertSeconds(request.duration));
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
              chrome.tabs.sendMessage(tabs[0].id, {type: 'setLoopStart', seconds: popup.loopStart});
            });
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
              chrome.tabs.sendMessage(tabs[0].id, {type: 'setLoopEnd', seconds: popup.loopEnd});
            });
          }
        }
      }
    });
  });

})();

/* functions */

function initPrams(popup, response) {
  popup.currentTime = response.currentTime;
  $('#seek-bar-range').val(response.currentTime);
  $('#current-time').text(convertSeconds(response.currentTime));
  popup.duration = response.duration;
  $('#seek-bar-range').attr('max', response.duration);
  $('#duration').text(convertSeconds(response.duration));
  popup.slider.noUiSlider.updateOptions({
    range: {
      'min': 0,
      'max': response.duration
    }
  });
  popup.loop = response.loop;
  $('#loop-switch').attr('checked', response.loop);
  popup.loopStart = response.loopStart;
  $("#loop-start-num").text(convertSeconds(response.loopStart));
  popup.loopEnd = response.loopEnd;
  $("#loop-end-num").text(convertSeconds(response.loopEnd));
  popup.slider.noUiSlider.set([response.loopStart, response.loopEnd]);
  popup.isPaused = response.isPaused;
  if (response.isPaused) {
    $('#play-btn-svg').css('display', 'inline');
    $('#pause-btn-svg').css('display', 'none');
  } else {
    $('#play-btn-svg').css('display', 'none');
    $('#pause-btn-svg').css('display', 'inline');
  }
  popup.pitch = response.pitch;
  $('#pitch-range').val(response.pitch);
  $("#pitch-num").text(response.pitch);
  popup.chorus = response.chorus;
  $('#chorus-range').val(response.chorus);
  $("#chorus-num").text(response.chorus);
  popup.robot = response.robot;
  $('#robot-range').val(response.robot);
  $("#robot-num").text(response.robot);
  popup.delay = response.delay;
  $('#delay-range').val(response.delay);
  $("#delay-num").text(response.delay);
  popup.sound3D = response.sound3D;
  $('#3DSound-range').val(response.sound3D);
  $("#3DSound-num").text(response.sound3D);
}

function convertSeconds(rawSeconds) {
  var minutes = Math.floor(rawSeconds / 60);
  var seconds = Math.floor(rawSeconds % 60);
  seconds = seconds < 10 ? '0' + seconds : seconds;
  return minutes + ':' + seconds;
}
