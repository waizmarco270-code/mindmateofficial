
// Scripts for firebase and firebase-messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyATUcEV5XGgj5oMkAv1a5Xh-6jZApOXVBw",
  authDomain: "mindmate-80e5c.firebaseapp.com",
  projectId: "mindmate-80e5c",
  storageBucket: "mindmate-80e5c.appspot.com",
  messagingSenderId: "1040365164281",
  appId: "1:1040365164281:web:3cf995fb97fe775c33b428"
});

const messaging = firebase.messaging();

// Background notification handler
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || payload.data?.title || 'MindMate Alert';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'Check your dashboard for updates.',
    icon: '/logo.jpg',
    badge: '/logo.jpg',
    data: {
        url: payload.data?.link || '/dashboard'
    }
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window open
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
