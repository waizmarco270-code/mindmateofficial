// MindMate Ghost Pulse - Background Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyATUcEV5XGgj5oMkAv1a5Xh-6jZApOXVBw",
  authDomain: "mindmate-80e5c.firebaseapp.com",
  projectId: "mindmate-80e5c",
  storageBucket: "mindmate-80e5c.appspot.com",
  messagingSenderId: "1040365164281",
  appId: "1:1040365164281:web:3cf995fb97fe775c33b428"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.data.title || payload.notification.title || 'MindMate Alert';
  const notificationOptions = {
    body: payload.data.body || payload.notification.body || 'New update from the academy.',
    icon: '/logo.jpg',
    badge: '/logo.jpg',
    image: payload.data.image || undefined,
    data: {
        url: payload.data.link || '/dashboard'
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click to redirect
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
