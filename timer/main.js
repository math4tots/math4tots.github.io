var timer, firebase;

function reset() {
  timer.stop();
  timer.setTime(90);
  timer.start();
}

function toggle_pause() {
  if (timer.running)
    timer.stop();
  else
    timer.start();
}

$(document).ready(function() {

  // TODO: add synchronization using Firebase.
  // firebase = new Firebase("https://****.firebaseio.com/timer");

  timer = $('#timer').FlipClock(90, {
    clockFace: 'MinuteCounter',
    autoStart: false,
    countdown: true,
    callbacks: {
      interval: function() {
        if (timer.getTime().getTimeSeconds() === 0) {
          document.getElementById("beep").play();
        }
      }
    }
  });

  $(document).keypress(function(event) {
    if (event.which === 'r'.charCodeAt(0)) {
      reset();
    } else if (event.which === 'p'.charCodeAt(0)) {
      toggle_pause();
    }
  });

  // TODO: add synchronization using Firebase.
  // firebase.on('value', function(dataSnapshot) {
  //   var value = dataSnapshot.val();
  //   var now = new Date().getTime();

  //   if (value === null) {
  //     value = serializeTimer()
  //   }
  // });

  reset();
});
