
// This service worker file is intentionally left almost empty.
// It's required for Firebase Cloud Messaging to work.

// When you deploy, Firebase automatically adds the necessary
// configuration to this file.

// For local development, you might need to add the initialization script
// if you are testing push notifications locally, but for production builds
// managed by Firebase Hosting, this is sufficient.

// The `onBackgroundMessage` handler needs to be set up here if you
// want to handle background notifications.

// For now, we will let Firebase handle showing the notification automatically.
// The default behavior is to show the notification payload as it's sent.
self.addEventListener('push', (event) => {
    console.log('[Service Worker] Push Received.');
    console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

    const notificationData = event.data.json().notification;
    const title = notificationData.title;
    const options = {
        body: notificationData.body,
        icon: notificationData.icon || '/logo.jpg',
    };

    event.waitUntil(self.registration.showNotification(title, options));
});
