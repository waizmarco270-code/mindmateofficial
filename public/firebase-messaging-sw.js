
importScripts("https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyATUcEV5XGgj5oMkAv1a5Xh-6jZApOXVBw",
  authDomain: "mindmate-80e5c.firebaseapp.com",
  projectId: "mindmate-80e5c",
  storageBucket: "mindmate-80e5c.appspot.com",
  messagingSenderId: "1040365164281",
  appId: "1:1040365164281:web:3cf995fb97fe775c33b428"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// This is the handler for background notifications
messaging.onBackgroundMessage(function(payload) {
    console.log('Received background message ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo.jpg',
        badge: '/badge.png', // Your new notification badge
        image: payload.data.imageUrl,
        data: {
            url: payload.data.linkUrl
        }
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// This is the click handler for the notification
self.addEventListener('notificationclick', function(event) {
    const urlToOpen = event.notification.data.url;
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
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
