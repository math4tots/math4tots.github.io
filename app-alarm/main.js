// main.js

// Registering Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/app-alarm/service-worker.js');

  Notification.requestPermission().then(res => {
    if (Notification.permission == 'granted') {
      console.log("Granted permission");
      return;
    }
    console.log(`Notification.requestPermission() res = ${res}`);
  });

  let queuedMessages = [];
  var activeWorker = null;

  navigator.serviceWorker.ready.then(registration => {
    activeWorker = registration.active;
    for (const message of queuedMessages) {
      activeWorker.postMessage(message);
    }
    queuedMessages = null;
  });

  function postMessage(message) {
    if (activeWorker) {
      activeWorker.postMessage(message);
    } else {
      queuedMessages.push(message);
    }
  }
} else {
  function postMessage(message) {
    // TODO: warn about not working
    alert("Service Workers are not supported on this browser");
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const setAlarmButton = document.getElementById('setAlarm');
  setAlarmButton.addEventListener('click', () => {
    const alarmTime = document.getElementById('alarmTime').value;
    setAlarm(alarmTime);
  });
});

function setAlarm(alarmTime) {
  const now = new Date();
  const alarmDateTime = new Date(now.toDateString() + ' ' + alarmTime);

  if (alarmDateTime <= now) {
    // The alarm time is in the past, set it for tomorrow
    alarmDateTime.setDate(alarmDateTime.getDate() + 1);
  }

  const timeUntilAlarm = alarmDateTime - now;

  // Schedule a notification with the service worker
  const notificationOptions = {
    tag: 'alarmNotification',
    data: 'Your alarm is ringing!',
    timeUntilAlarm: timeUntilAlarm,
  };

  navigator.serviceWorker.ready.then(registration => {
    console.log(`timeUntilAlarm = ${timeUntilAlarm}`);
    // console.log(`registration.sync = ${registration.sync}`);
    // console.log(`registration.sync.register = ${registration.sync.register}`);
    const ret = registration.sync.register('notification-sync', {
      minDelay: timeUntilAlarm,
    });
    // console.log(`ret = ${ret}`);
    ret.then(r => {
      console.log(`registration.sync.register() OK`);
    }).catch(e => {
      console.log(`registration.sync.register() ERR ${e}`);
    });
  });

  // postMessage({ type: "SetAlarm", data: notificationOptions });
  // self.registration.showNotification('Alarm Clock', notificationOptions);
}
