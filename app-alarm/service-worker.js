// service-worker.js

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        'index.html',
        'style.css',
        'main.js',
        'favicon.png',
      ]);
    })
  );
});

self.addEventListener("fetch", event => {
  // "Network first" strategy as described in
  // https://web.dev/learn/pwa/serving
  event.respondWith(fetch(event.request).catch(error =>
    caches.match(event.request)));
});

// Notification handling
self.addEventListener('message', (event) => {
  console.log(`FFFF event = ${JSON.stringify(event)}`);
  console.log(`FFFF event.data = ${JSON.stringify(event.data)}`);
  const options = {
    body: event.data.text(),
    icon: 'favicon.png',
  };
  event.waitUntil(
    self.registration.showNotification('Alarm Clock', options)
  );
});


self.addEventListener('sync', event => {
  console.log(`FFFFF sync tag = ${event.tag}`);
  if (event.tag === 'notification-sync') {
    event.waitUntil(showNotification());
  }
});

function showNotification() {
  console.log(`FFFFF showNotification`);
  if ('Notification' in self && Notification.permission === 'granted') {
    console.log(`FFFFF PERMISSION GRANTED`);
    const options = {
      body: 'It\'s 7 o\'clock!',
      icon: 'path/to/icon.png',
    };

    console.log(`FFFFF SENDING NOTIF XXX`);
    const notif = self.registration.showNotification('Morning Notification', options);
    console.log(`notif = ${notif}`);
    notif.then(x => {
      console.log(`FFFF notif OK ${x}`);
    }).catch(err => {
      console.log(`FFFF notif ERR ${err}`);
    });
  } else {
    console.log(`FFFFF PERMISSION NOT GRANTED`);
  }
}
